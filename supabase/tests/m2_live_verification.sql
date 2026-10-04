-- Remote M2 verification. Test users and orders exist only inside this transaction.
-- The persistent LIVE_M2 master rows come from seeds/m2_live_verification.sql.

begin;

insert into auth.users (id, aud, role, email, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  (
    '00000000-0000-4000-8000-000000002901',
    'authenticated',
    'authenticated',
    'live-m2-customer-a@test.local',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"LIVE M2 Customer A"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  ),
  (
    '00000000-0000-4000-8000-000000002902',
    'authenticated',
    'authenticated',
    'live-m2-customer-b@test.local',
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"LIVE M2 Customer B"}'::jsonb,
    timezone('utc', now()),
    timezone('utc', now())
  );

do $$
begin
  if (
    select count(*) from public.profiles
    where id in (
      '00000000-0000-4000-8000-000000002901',
      '00000000-0000-4000-8000-000000002902'
    ) and role = 'CUSTOMER'::public.user_role and status = 'ACTIVE'::public.profile_status
  ) <> 2 then
    raise exception 'LIVE_M2_FAIL: Auth trigger did not create two active Customer profiles';
  end if;
end;
$$;

-- Make one fixture slot a capacity-one race target inside this rollback-only test.
update public.pickup_slots
set capacity = 1, reserved_count = 0
where id = '00000000-0000-4000-8000-000000002401';

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000002901","role":"authenticated"}',
  true
);

do $$
begin
  if (
    select count(*) from public.services
    where code like 'LIVE_M2_%' and active
  ) <> 3 then
    raise exception 'LIVE_M2_FAIL: service list';
  end if;

  if not exists (
    select 1 from public.check_serviceability(-6.200000, 106.816666)
    where area_id = '00000000-0000-4000-8000-000000002301'
  ) then
    raise exception 'LIVE_M2_FAIL: serviceability';
  end if;

  if exists (
    select 1 from public.check_serviceability(0, 0)
  ) then
    raise exception 'LIVE_M2_FAIL: outside-area serviceability';
  end if;

  if (
    select count(*) from public.pickup_slots
    where service_area_id = '00000000-0000-4000-8000-000000002301'
      and active and starts_at > timezone('utc', now())
  ) <> 3 then
    raise exception 'LIVE_M2_FAIL: pickup slots';
  end if;
end;
$$;

select * from public.create_customer_order(
  'live-m2-idempotency-order-0001',
  '{
    "label":"LIVE M2 Address",
    "addressText":"Jl. Pengujian M2 No. 1, Jakarta Selatan",
    "latitude":-6.200000,
    "longitude":106.816666,
    "notes":"Transaction-scoped fixture",
    "saveAddress":true
  }'::jsonb,
  '00000000-0000-4000-8000-000000002401',
  '[
    {"serviceId":"00000000-0000-4000-8000-000000002101","estimatedQty":3},
    {"serviceId":"00000000-0000-4000-8000-000000002103","estimatedQty":2}
  ]'::jsonb,
  '{"detergentNote":"Hypoallergenic","handlingNotes":["Pisahkan warna putih"]}'::jsonb,
  'LIVE M2 order verification',
  '00000000-0000-4000-8000-000000002991'
);

-- Same command/key must return the existing order without a second reservation.
select * from public.create_customer_order(
  'live-m2-idempotency-order-0001',
  '{"addressId":"00000000-0000-4000-8000-000000000001"}'::jsonb,
  '00000000-0000-4000-8000-000000002401',
  '[{"serviceId":"00000000-0000-4000-8000-000000002102","estimatedQty":99}]'::jsonb,
  '{}'::jsonb,
  'This changed payload must not create a duplicate',
  '00000000-0000-4000-8000-000000002992'
);

do $$
begin
  if (
    select count(*) from public.orders
    where idempotency_key = 'live-m2-idempotency-order-0001'
  ) <> 1 then
    raise exception 'LIVE_M2_FAIL: duplicate order created';
  end if;

  if not exists (
    select 1 from public.orders
    where idempotency_key = 'live-m2-idempotency-order-0001'
      and customer_id = auth.uid()
      and status = 'PENDING_CONFIRMATION'::public.order_status
      and estimate_amount = 74000
      and currency = 'IDR'
  ) then
    raise exception 'LIVE_M2_FAIL: order status, ownership, or estimate';
  end if;

  if (
    select reserved_count from public.pickup_slots
    where id = '00000000-0000-4000-8000-000000002401'
  ) <> 1 then
    raise exception 'LIVE_M2_FAIL: idempotent slot reservation';
  end if;

  if (
    select count(*) from public.customer_addresses
    where customer_id = auth.uid() and label = 'LIVE M2 Address'
  ) <> 1 then
    raise exception 'LIVE_M2_FAIL: owned address snapshot/save';
  end if;

  begin
    insert into public.orders (
      order_no, customer_id, address_snapshot, pickup_slot_id,
      estimate_amount, idempotency_key
    ) values (
      'LIVE-M2-DIRECT-WRITE', auth.uid(), '{}'::jsonb,
      '00000000-0000-4000-8000-000000002401', 0,
      'live-m2-direct-write-denial-0001'
    );
    raise exception 'LIVE_M2_FAIL: direct browser order insert was allowed';
  exception
    when insufficient_privilege then null;
  end;
end;
$$;

-- Customer B cannot see Customer A's order and loses the capacity-one race.
select set_config(
  'request.jwt.claims',
  '{"sub":"00000000-0000-4000-8000-000000002902","role":"authenticated"}',
  true
);

do $$
begin
  if exists (
    select 1 from public.orders
    where idempotency_key = 'live-m2-idempotency-order-0001'
  ) then
    raise exception 'LIVE_M2_FAIL: cross-customer order was visible';
  end if;

  begin
    perform * from public.create_customer_order(
      'live-m2-capacity-race-loser-0001',
      '{
        "label":"LIVE M2 Address B",
        "addressText":"Jl. Pengujian M2 No. 2, Jakarta Selatan",
        "latitude":-6.210000,
        "longitude":106.820000,
        "saveAddress":false
      }'::jsonb,
      '00000000-0000-4000-8000-000000002401',
      '[{"serviceId":"00000000-0000-4000-8000-000000002101","estimatedQty":3}]'::jsonb,
      '{"handlingNotes":[]}'::jsonb,
      null,
      '00000000-0000-4000-8000-000000002993'
    );
    raise exception 'LIVE_M2_FAIL: full slot accepted another reservation';
  exception
    when raise_exception then
      if sqlerrm <> 'SLOT_001' then
        raise;
      end if;
  end;
end;
$$;

reset role;

select jsonb_build_object(
  'service_list', 'PASS',
  'serviceability_inside_outside', 'PASS',
  'pickup_slots', 'PASS',
  'order_creation', 'PASS',
  'initial_status', 'PENDING_CONFIRMATION',
  'server_estimate', 74000,
  'own_order_rls', 'PASS',
  'cross_customer_rls', 'PASS',
  'direct_order_insert_denied', 'PASS',
  'idempotent_duplicate', 'PASS',
  'capacity_race_guard', 'SLOT_001',
  'temporary_fixture_cleanup', 'ROLLBACK'
) as live_m2_result;

rollback;

do $$
begin
  if exists (
    select 1 from auth.users
    where id in (
      '00000000-0000-4000-8000-000000002901',
      '00000000-0000-4000-8000-000000002902'
    )
  ) or exists (
    select 1 from public.orders
    where idempotency_key like 'live-m2-%'
  ) then
    raise exception 'LIVE_M2_FAIL: rollback cleanup';
  end if;
end;
$$;

select jsonb_build_object('temporary_fixture_cleanup', 'PASS') as cleanup_result;
