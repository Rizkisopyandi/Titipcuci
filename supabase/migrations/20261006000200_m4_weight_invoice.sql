begin;

alter table public.order_items
  add column actual_qty numeric(10, 2) check (actual_qty is null or actual_qty > 0);

alter table public.orders
  add column weighed_at timestamptz,
  add column invoice_issued_at timestamptz;

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders (id) on delete restrict,
  invoice_no text not null unique,
  status text not null default 'ISSUED' check (status = 'ISSUED'),
  subtotal numeric(14, 2) not null check (subtotal >= 0),
  discount numeric(14, 2) not null default 0 check (discount >= 0),
  surcharge numeric(14, 2) not null default 0 check (surcharge >= 0),
  tax numeric(14, 2) not null default 0 check (tax >= 0),
  total numeric(14, 2) not null check (total >= 0),
  currency text not null default 'IDR' check (currency = 'IDR'),
  pricing_snapshot jsonb not null,
  issued_at timestamptz not null,
  paid_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  check (total = subtotal - discount + surcharge + tax)
);

create table public.invoice_items (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.invoices (id) on delete restrict,
  type text not null check (type = 'SERVICE'),
  description text not null,
  qty numeric(10, 2) not null check (qty > 0),
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  amount numeric(14, 2) not null check (amount >= 0),
  source_ref uuid not null references public.order_items (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  unique (invoice_id, source_ref)
);

create index invoices_status_issued_idx on public.invoices (status, issued_at desc);
create index invoice_items_invoice_idx on public.invoice_items (invoice_id);

alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

revoke all on table public.invoices, public.invoice_items from anon, authenticated;
grant select on table public.invoices, public.invoice_items to authenticated;

create policy invoices_customer_read_own
on public.invoices for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.id = invoices.order_id and o.customer_id = auth.uid()
  )
);

create policy invoices_admin_owner_read
on public.invoices for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy invoice_items_customer_read_own
on public.invoice_items for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.invoices i
    join public.orders o on o.id = i.order_id
    where i.id = invoice_items.invoice_id and o.customer_id = auth.uid()
  )
);

create policy invoice_items_admin_owner_read
on public.invoice_items for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create function public.prevent_invoice_financial_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    raise exception using errcode = '42501', message = 'Invoice cannot be deleted.';
  end if;

  if new.order_id is distinct from old.order_id
    or new.invoice_no is distinct from old.invoice_no
    or new.subtotal is distinct from old.subtotal
    or new.discount is distinct from old.discount
    or new.surcharge is distinct from old.surcharge
    or new.tax is distinct from old.tax
    or new.total is distinct from old.total
    or new.currency is distinct from old.currency
    or new.pricing_snapshot is distinct from old.pricing_snapshot
    or new.issued_at is distinct from old.issued_at
    or new.created_at is distinct from old.created_at then
    raise exception using errcode = '42501', message = 'Invoice financial snapshot is immutable.';
  end if;

  return new;
end;
$$;

revoke all on function public.prevent_invoice_financial_change() from public, anon, authenticated;

create trigger invoices_financial_immutable
before update or delete on public.invoices
for each row execute function public.prevent_invoice_financial_change();

create trigger invoice_items_append_only
before update or delete on public.invoice_items
for each row execute function public.prevent_append_only_change();

create function public.record_actual_weight(
  p_order_id uuid,
  p_expected_version integer,
  p_idempotency_key text,
  p_actual_items jsonb,
  p_reason text,
  p_correlation_id uuid
)
returns table (
  id uuid,
  order_no text,
  status public.order_status,
  version integer,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_order public.orders%rowtype;
  v_receipt public.order_command_receipts%rowtype;
  v_item jsonb;
  v_item_id uuid;
  v_actual_qty numeric;
  v_item_count integer;
  v_is_correction boolean;
  v_reason text := nullif(trim(p_reason), '');
  v_now timestamptz := timezone('utc', now());
  v_event_id uuid := gen_random_uuid();
  v_old_items jsonb;
  v_new_items jsonb;
begin
  if v_actor_id is null or not public.is_active_admin() then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
  end if;

  if p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 128
    or p_expected_version is null or p_expected_version < 1
    or jsonb_typeof(p_actual_items) <> 'array'
    or jsonb_array_length(p_actual_items) < 1
    or p_correlation_id is null then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_actor_id::text || ':' || p_idempotency_key, 0));

  select * into v_receipt
  from public.order_command_receipts r
  where r.actor_id = v_actor_id and r.idempotency_key = p_idempotency_key;

  if found then
    if v_receipt.command <> 'RECORD_WEIGHT' or v_receipt.order_id <> p_order_id then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    return query select o.id, o.order_no, v_receipt.result_status,
      v_receipt.result_version, v_receipt.result_updated_at
    from public.orders o where o.id = v_receipt.order_id;
    return;
  end if;

  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'RES_001';
  end if;
  if v_order.version <> p_expected_version then
    raise exception using errcode = 'P0001', message = 'ORD_003';
  end if;

  v_is_correction := v_order.status = 'WEIGHED'::public.order_status;
  if v_order.status not in ('RECEIVED'::public.order_status, 'WEIGHED'::public.order_status)
    or exists (select 1 from public.invoices i where i.order_id = v_order.id) then
    raise exception using errcode = 'P0001', message = 'ORD_001';
  end if;
  if v_is_correction and (v_reason is null or char_length(v_reason) < 5) then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  select count(*) into v_item_count from public.order_items oi where oi.order_id = v_order.id;
  if jsonb_array_length(p_actual_items) <> v_item_count
    or (select count(distinct value ->> 'orderItemId') from jsonb_array_elements(p_actual_items)) <> v_item_count then
    raise exception using errcode = 'P0001', message = 'INV_001';
  end if;

  select coalesce(
    jsonb_agg(jsonb_build_object('orderItemId', oi.id, 'actualQty', oi.actual_qty) order by oi.id),
    '[]'::jsonb
  ) into v_old_items
  from public.order_items oi where oi.order_id = v_order.id;

  for v_item in select value from jsonb_array_elements(p_actual_items)
  loop
    if jsonb_typeof(v_item) <> 'object' then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    if (select count(*) from jsonb_object_keys(v_item)) <> 2
      or not (v_item ? 'orderItemId')
      or not (v_item ? 'actualQty') then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    begin
      v_item_id := (v_item ->> 'orderItemId')::uuid;
      v_actual_qty := (v_item ->> 'actualQty')::numeric;
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end;
    if v_actual_qty <= 0 or v_actual_qty >= 100000000
      or round(v_actual_qty, 2) <> v_actual_qty
      or not exists (
        select 1 from public.order_items oi
        where oi.id = v_item_id and oi.order_id = v_order.id
      ) then
      raise exception using errcode = 'P0001', message = 'INV_001';
    end if;
    update public.order_items oi set actual_qty = v_actual_qty where oi.id = v_item_id;
  end loop;

  update public.orders o
  set status = 'WEIGHED'::public.order_status,
    version = o.version + 1,
    weighed_at = coalesce(o.weighed_at, v_now),
    updated_at = v_now
  where o.id = v_order.id
  returning * into v_order;

  select jsonb_agg(
    jsonb_build_object('orderItemId', oi.id, 'actualQty', oi.actual_qty) order by oi.id
  ) into v_new_items
  from public.order_items oi where oi.order_id = v_order.id;

  if not v_is_correction then
    insert into public.order_status_history (
      order_id, from_status, to_status, actor_id, actor_role,
      reason_code, note, occurred_at, correlation_id, metadata
    ) values (
      v_order.id, 'RECEIVED'::public.order_status, 'WEIGHED'::public.order_status,
      v_actor_id, 'ADMIN'::public.user_role, null, v_reason, v_now,
      p_correlation_id, jsonb_build_object('command', 'RECORD_WEIGHT', 'version', v_order.version)
    );
  end if;

  insert into public.domain_outbox (
    id, event_type, aggregate_type, aggregate_id, payload, dedupe_key, occurred_at
  ) values (
    v_event_id, 'WEIGHT_RECORDED', 'ORDER', v_order.id,
    jsonb_build_object(
      'eventId', v_event_id, 'eventType', 'WEIGHT_RECORDED', 'aggregateType', 'ORDER',
      'aggregateId', v_order.id, 'aggregateVersion', v_order.version,
      'actorId', v_actor_id, 'actorRole', 'ADMIN', 'occurredAt', v_now,
      'correlationId', p_correlation_id, 'payloadVersion', 1,
      'data', jsonb_build_object('orderNo', v_order.order_no, 'actualItems', v_new_items, 'correction', v_is_correction)
    ),
    v_event_id::text, v_now
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, dedupe_key)
  values (
    v_order.customer_id, 'WEIGHT_RECORDED', 'Berat aktual tercatat',
    'Laundry untuk pesanan ' || v_order.order_no || ' telah ditimbang.',
    'ORDER', v_order.id, v_event_id::text || ':' || v_order.customer_id::text || ':WEIGHT_RECORDED'
  );

  insert into public.audit_logs (
    actor_id, actor_role, event_type, entity_type, entity_id,
    old_value, new_value, reason, correlation_id
  ) values (
    v_actor_id, 'ADMIN'::public.user_role, 'WEIGHT_CHANGED', 'ORDER', v_order.id,
    jsonb_build_object('actualItems', v_old_items),
    jsonb_build_object('actualItems', v_new_items, 'version', v_order.version),
    v_reason, p_correlation_id
  );

  insert into public.order_command_receipts (
    actor_id, order_id, command, idempotency_key,
    result_status, result_version, result_updated_at
  ) values (
    v_actor_id, v_order.id, 'RECORD_WEIGHT', p_idempotency_key,
    v_order.status, v_order.version, v_order.updated_at
  );

  return query select v_order.id, v_order.order_no, v_order.status, v_order.version, v_order.updated_at;
end;
$$;

create function public.issue_final_invoice(
  p_order_id uuid,
  p_expected_version integer,
  p_idempotency_key text,
  p_correlation_id uuid
)
returns table (
  id uuid,
  invoice_no text,
  order_id uuid,
  order_status public.order_status,
  order_version integer,
  subtotal numeric,
  discount numeric,
  surcharge numeric,
  tax numeric,
  total numeric,
  currency text,
  pricing_snapshot jsonb,
  issued_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_actor_id uuid := auth.uid();
  v_order public.orders%rowtype;
  v_receipt public.order_command_receipts%rowtype;
  v_invoice public.invoices%rowtype;
  v_item public.order_items%rowtype;
  v_price_version public.service_price_versions%rowtype;
  v_price_version_id uuid;
  v_service_code text;
  v_service_name text;
  v_unit text;
  v_unit_price numeric(14, 2);
  v_minimum_charge numeric(14, 2);
  v_amount numeric(14, 2);
  v_subtotal numeric(14, 2) := 0;
  v_discount numeric(14, 2) := 0;
  v_surcharge numeric(14, 2) := 0;
  v_tax numeric(14, 2) := 0;
  v_total numeric(14, 2);
  v_items_snapshot jsonb := '[]'::jsonb;
  v_pricing_snapshot jsonb;
  v_snapshot_item jsonb;
  v_now timestamptz := timezone('utc', now());
  v_event_id uuid := gen_random_uuid();
begin
  if v_actor_id is null or not public.is_active_admin() then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
  end if;
  if p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 128
    or p_expected_version is null or p_expected_version < 1
    or p_correlation_id is null then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_actor_id::text || ':' || p_idempotency_key, 0));

  select * into v_receipt
  from public.order_command_receipts r
  where r.actor_id = v_actor_id and r.idempotency_key = p_idempotency_key;

  if found then
    if v_receipt.command <> 'ISSUE_INVOICE' or v_receipt.order_id <> p_order_id then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    return query
    select i.id, i.invoice_no, i.order_id, v_receipt.result_status,
      v_receipt.result_version, i.subtotal, i.discount, i.surcharge, i.tax,
      i.total, i.currency, i.pricing_snapshot, i.issued_at
    from public.invoices i where i.order_id = v_receipt.order_id;
    return;
  end if;

  select * into v_order from public.orders o where o.id = p_order_id for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'RES_001';
  end if;
  if v_order.version <> p_expected_version then
    raise exception using errcode = 'P0001', message = 'ORD_003';
  end if;
  if v_order.status <> 'WEIGHED'::public.order_status
    or exists (select 1 from public.invoices i where i.order_id = v_order.id)
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = v_order.id and oi.actual_qty is null
    ) then
    raise exception using errcode = 'P0001', message = 'INV_001';
  end if;

  for v_item in
    select * from public.order_items oi where oi.order_id = v_order.id order by oi.created_at, oi.id
  loop
    begin
      v_price_version_id := (v_item.service_snapshot ->> 'priceVersionId')::uuid;
      v_unit_price := (v_item.service_snapshot ->> 'unitPrice')::numeric;
      v_minimum_charge := (v_item.service_snapshot ->> 'minimumCharge')::numeric;
    exception when invalid_text_representation or numeric_value_out_of_range then
      raise exception using errcode = 'P0001', message = 'INV_001';
    end;
    v_service_code := nullif(trim(v_item.service_snapshot ->> 'code'), '');
    v_service_name := nullif(trim(v_item.service_snapshot ->> 'name'), '');
    v_unit := v_item.service_snapshot ->> 'unit';

    select * into v_price_version from public.service_price_versions pv
    where pv.id = v_price_version_id and pv.service_id = v_item.service_id;
    if not found or v_service_code is null or v_service_name is null
      or v_unit not in ('KG', 'ITEM') or v_unit_price < 0 or v_minimum_charge < 0
      or v_price_version.unit_price <> v_unit_price
      or v_price_version.minimum_charge <> v_minimum_charge then
      raise exception using errcode = 'P0001', message = 'INV_001';
    end if;

    v_amount := round(greatest(v_minimum_charge, v_unit_price * v_item.actual_qty), 2);
    v_subtotal := v_subtotal + v_amount;
    v_items_snapshot := v_items_snapshot || jsonb_build_array(jsonb_build_object(
      'orderItemId', v_item.id,
      'serviceId', v_item.service_id,
      'serviceCode', v_service_code,
      'serviceName', v_service_name,
      'unit', v_unit,
      'actualQty', v_item.actual_qty,
      'priceVersionId', v_price_version_id,
      'unitPrice', v_unit_price,
      'minimumCharge', v_minimum_charge,
      'amount', v_amount
    ));
  end loop;

  if jsonb_array_length(v_items_snapshot) < 1 then
    raise exception using errcode = 'P0001', message = 'INV_001';
  end if;

  v_total := v_subtotal - v_discount + v_surcharge + v_tax;
  v_pricing_snapshot := jsonb_build_object(
    'formulaVersion', 'M4_V1',
    'formula', 'subtotal = sum(max(minimumCharge, unitPrice * actualQty)); total = subtotal - discount + surcharge + tax',
    'currency', 'IDR',
    'items', v_items_snapshot,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'surcharge', v_surcharge,
    'tax', v_tax,
    'total', v_total,
    'calculatedAt', v_now
  );

  insert into public.invoices (
    order_id, invoice_no, status, subtotal, discount, surcharge,
    tax, total, currency, pricing_snapshot, issued_at
  ) values (
    v_order.id, 'INV-' || v_order.order_no, 'ISSUED', v_subtotal,
    v_discount, v_surcharge, v_tax, v_total, 'IDR', v_pricing_snapshot, v_now
  ) returning * into v_invoice;

  for v_snapshot_item in select value from jsonb_array_elements(v_items_snapshot)
  loop
    insert into public.invoice_items (
      invoice_id, type, description, qty, unit_price, amount, source_ref
    ) values (
      v_invoice.id, 'SERVICE', v_snapshot_item ->> 'serviceName',
      (v_snapshot_item ->> 'actualQty')::numeric,
      (v_snapshot_item ->> 'unitPrice')::numeric,
      (v_snapshot_item ->> 'amount')::numeric,
      (v_snapshot_item ->> 'orderItemId')::uuid
    );
  end loop;

  update public.orders o
  set status = 'WAITING_PAYMENT'::public.order_status,
    version = o.version + 1,
    invoice_issued_at = v_now,
    updated_at = v_now
  where o.id = v_order.id
  returning * into v_order;

  insert into public.order_status_history (
    order_id, from_status, to_status, actor_id, actor_role,
    reason_code, note, occurred_at, correlation_id, metadata
  ) values (
    v_order.id, 'WEIGHED'::public.order_status, 'WAITING_PAYMENT'::public.order_status,
    v_actor_id, 'ADMIN'::public.user_role, null, null, v_now,
    p_correlation_id, jsonb_build_object('command', 'ISSUE_INVOICE', 'version', v_order.version, 'invoiceId', v_invoice.id)
  );

  insert into public.domain_outbox (
    id, event_type, aggregate_type, aggregate_id, payload, dedupe_key, occurred_at
  ) values (
    v_event_id, 'INVOICE_ISSUED', 'INVOICE', v_invoice.id,
    jsonb_build_object(
      'eventId', v_event_id, 'eventType', 'INVOICE_ISSUED', 'aggregateType', 'INVOICE',
      'aggregateId', v_invoice.id, 'aggregateVersion', 1,
      'actorId', v_actor_id, 'actorRole', 'ADMIN', 'occurredAt', v_now,
      'correlationId', p_correlation_id, 'payloadVersion', 1,
      'data', jsonb_build_object('orderId', v_order.id, 'orderNo', v_order.order_no, 'invoiceNo', v_invoice.invoice_no, 'total', v_total, 'currency', 'IDR')
    ),
    v_event_id::text, v_now
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, dedupe_key)
  values (
    v_order.customer_id, 'INVOICE_ISSUED', 'Invoice final tersedia',
    'Invoice final pesanan ' || v_order.order_no || ' telah diterbitkan dan menunggu pembayaran.',
    'INVOICE', v_invoice.id, v_event_id::text || ':' || v_order.customer_id::text || ':INVOICE_ISSUED'
  );

  insert into public.audit_logs (
    actor_id, actor_role, event_type, entity_type, entity_id,
    old_value, new_value, reason, correlation_id
  ) values (
    v_actor_id, 'ADMIN'::public.user_role, 'INVOICE_ISSUED', 'INVOICE', v_invoice.id,
    null, jsonb_build_object('orderId', v_order.id, 'invoiceNo', v_invoice.invoice_no, 'total', v_total, 'currency', 'IDR'),
    null, p_correlation_id
  );

  insert into public.order_command_receipts (
    actor_id, order_id, command, idempotency_key,
    result_status, result_version, result_updated_at
  ) values (
    v_actor_id, v_order.id, 'ISSUE_INVOICE', p_idempotency_key,
    v_order.status, v_order.version, v_order.updated_at
  );

  return query select v_invoice.id, v_invoice.invoice_no, v_invoice.order_id,
    v_order.status, v_order.version, v_invoice.subtotal, v_invoice.discount,
    v_invoice.surcharge, v_invoice.tax, v_invoice.total, v_invoice.currency,
    v_invoice.pricing_snapshot, v_invoice.issued_at;
end;
$$;

revoke all on function public.record_actual_weight(uuid, integer, text, jsonb, text, uuid) from public, anon;
grant execute on function public.record_actual_weight(uuid, integer, text, jsonb, text, uuid) to authenticated;

revoke all on function public.issue_final_invoice(uuid, integer, text, uuid) from public, anon;
grant execute on function public.issue_final_invoice(uuid, integer, text, uuid) to authenticated;

commit;
