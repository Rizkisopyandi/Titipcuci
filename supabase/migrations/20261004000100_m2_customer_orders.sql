begin;

create extension if not exists postgis with schema extensions;

create type public.service_unit as enum ('KG', 'ITEM');
create type public.order_status as enum ('PENDING_CONFIRMATION');

create table public.services (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code ~ '^[A-Z0-9_]{2,40}$'),
  name text not null check (char_length(trim(name)) between 2 and 100),
  unit public.service_unit not null,
  duration_hours integer not null check (duration_hours > 0),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.service_price_versions (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services (id) on delete restrict,
  unit_price numeric(14, 2) not null check (unit_price >= 0),
  minimum_charge numeric(14, 2) not null check (minimum_charge >= 0),
  effective_from timestamptz not null,
  effective_to timestamptz,
  created_by uuid references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now()),
  check (effective_to is null or effective_to > effective_from),
  unique (service_id, effective_from)
);

create function public.prevent_service_price_overlap()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.service_price_versions pv
    where pv.service_id = new.service_id and pv.id <> new.id
      and tstzrange(pv.effective_from, coalesce(pv.effective_to, 'infinity'::timestamptz), '[)')
        && tstzrange(new.effective_from, coalesce(new.effective_to, 'infinity'::timestamptz), '[)')
  ) then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_service_price_overlap() from public, anon, authenticated;

create trigger service_price_versions_prevent_overlap
before insert or update on public.service_price_versions
for each row execute function public.prevent_service_price_overlap();

create table public.service_areas (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 2 and 100),
  geojson jsonb not null,
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (geojson ->> 'type' in ('Polygon', 'MultiPolygon'))
);

create table public.pickup_slots (
  id uuid primary key default gen_random_uuid(),
  service_area_id uuid not null references public.service_areas (id) on delete restrict,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  capacity integer not null check (capacity > 0),
  reserved_count integer not null default 0 check (reserved_count >= 0 and reserved_count <= capacity),
  active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  check (ends_at > starts_at),
  unique (service_area_id, starts_at, ends_at)
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete restrict,
  label text not null check (char_length(trim(label)) between 2 and 50),
  address_text text not null check (char_length(trim(address_text)) between 8 and 500),
  latitude numeric(9, 6) not null check (latitude between -90 and 90),
  longitude numeric(9, 6) not null check (longitude between -180 and 180),
  service_area_id uuid not null references public.service_areas (id) on delete restrict,
  notes text check (notes is null or char_length(trim(notes)) <= 500),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index customer_addresses_one_default
on public.customer_addresses (customer_id)
where is_default;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no text not null unique,
  customer_id uuid not null references public.profiles (id) on delete restrict,
  address_snapshot jsonb not null,
  pickup_slot_id uuid not null references public.pickup_slots (id) on delete restrict,
  status public.order_status not null default 'PENDING_CONFIRMATION',
  version integer not null default 1 check (version > 0),
  estimate_amount numeric(14, 2) not null check (estimate_amount >= 0),
  currency text not null default 'IDR' check (currency = 'IDR'),
  notes text check (notes is null or char_length(trim(notes)) <= 1000),
  idempotency_key text not null check (char_length(idempotency_key) between 16 and 128),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (customer_id, idempotency_key)
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  service_id uuid not null references public.services (id) on delete restrict,
  service_snapshot jsonb not null,
  estimated_qty numeric(10, 2) not null check (estimated_qty > 0),
  preference_snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_id, service_id)
);

create table public.order_status_history (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  from_status public.order_status,
  to_status public.order_status not null,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  reason_code text,
  note text,
  occurred_at timestamptz not null default timezone('utc', now()),
  correlation_id uuid not null,
  metadata jsonb not null default '{}'::jsonb
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete restrict,
  type text not null,
  title text not null,
  body text not null,
  entity_type text not null,
  entity_id uuid not null,
  dedupe_key text not null unique,
  read_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.domain_outbox (
  id uuid primary key default gen_random_uuid(),
  event_type text not null,
  aggregate_type text not null,
  aggregate_id uuid not null,
  payload jsonb not null,
  dedupe_key text not null unique,
  occurred_at timestamptz not null default timezone('utc', now()),
  published_at timestamptz
);

create index orders_customer_created_idx on public.orders (customer_id, created_at desc);
create index orders_customer_status_idx on public.orders (customer_id, status);
create index order_items_order_idx on public.order_items (order_id);
create index order_status_history_order_idx on public.order_status_history (order_id, occurred_at);
create index pickup_slots_area_start_idx on public.pickup_slots (service_area_id, starts_at);
create index notifications_user_read_created_idx on public.notifications (user_id, read_at, created_at desc);

alter table public.services enable row level security;
alter table public.service_price_versions enable row level security;
alter table public.service_areas enable row level security;
alter table public.pickup_slots enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.notifications enable row level security;
alter table public.domain_outbox enable row level security;

revoke all on table public.services, public.service_price_versions, public.service_areas,
  public.pickup_slots, public.customer_addresses, public.orders, public.order_items,
  public.order_status_history, public.notifications, public.domain_outbox from anon, authenticated;

grant select on table public.services, public.service_price_versions, public.service_areas,
  public.pickup_slots, public.customer_addresses, public.orders, public.order_items,
  public.order_status_history, public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;

create function public.is_active_profile()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'ACTIVE'::public.profile_status
  );
$$;

create function public.is_active_customer()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'ACTIVE'::public.profile_status
      and p.role = 'CUSTOMER'::public.user_role
  );
$$;

revoke all on function public.is_active_profile(), public.is_active_customer() from public, anon;
grant execute on function public.is_active_profile(), public.is_active_customer() to authenticated;

create policy services_read_active on public.services for select to authenticated
using (active and public.is_active_profile());
create policy service_prices_read_current on public.service_price_versions for select to authenticated
using (
  public.is_active_profile() and
  effective_from <= timezone('utc', now()) and
  (effective_to is null or effective_to > timezone('utc', now())) and
  exists (select 1 from public.services s where s.id = service_id and s.active)
);
create policy service_areas_read_active on public.service_areas for select to authenticated
using (active and public.is_active_profile());
create policy pickup_slots_read_available on public.pickup_slots for select to authenticated
using (active and starts_at > timezone('utc', now()) and public.is_active_profile());

create policy customer_addresses_select_own on public.customer_addresses for select to authenticated
using ((select auth.uid()) = customer_id and public.is_active_customer());

create policy orders_select_own on public.orders for select to authenticated
using ((select auth.uid()) = customer_id and public.is_active_customer());
create policy order_items_select_own on public.order_items for select to authenticated
using (public.is_active_customer() and exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())));
create policy order_history_select_own on public.order_status_history for select to authenticated
using (public.is_active_customer() and exists (select 1 from public.orders o where o.id = order_id and o.customer_id = (select auth.uid())));
create policy notifications_select_own on public.notifications for select to authenticated
using ((select auth.uid()) = user_id and public.is_active_profile());
create policy notifications_update_own on public.notifications for update to authenticated
using ((select auth.uid()) = user_id and public.is_active_profile())
with check ((select auth.uid()) = user_id and public.is_active_profile());

create function public.check_serviceability(p_latitude numeric, p_longitude numeric)
returns table (area_id uuid, area_name text)
language sql
stable
security invoker
set search_path = ''
as $$
  select a.id, a.name
  from public.service_areas a
  where a.active
    and p_latitude between -90 and 90
    and p_longitude between -180 and 180
    and extensions.st_covers(
      extensions.st_setsrid(extensions.st_geomfromgeojson(a.geojson::text), 4326),
      extensions.st_setsrid(extensions.st_makepoint(p_longitude, p_latitude), 4326)
    )
  order by a.created_at
  limit 1;
$$;

revoke all on function public.check_serviceability(numeric, numeric) from public, anon;
grant execute on function public.check_serviceability(numeric, numeric) to authenticated;

create function public.create_customer_order(
  p_idempotency_key text,
  p_address jsonb,
  p_slot_id uuid,
  p_items jsonb,
  p_preferences jsonb,
  p_notes text,
  p_correlation_id uuid
)
returns table (
  id uuid,
  order_no text,
  status public.order_status,
  estimate_amount numeric,
  currency text,
  created_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_customer_id uuid := auth.uid();
  v_order_id uuid := gen_random_uuid();
  v_order_no text;
  v_area_id uuid;
  v_address_id uuid;
  v_address_text text;
  v_address_label text;
  v_address_notes text;
  v_latitude numeric;
  v_longitude numeric;
  v_save_address boolean := false;
  v_item jsonb;
  v_service record;
  v_price record;
  v_estimated_qty numeric;
  v_estimate numeric(14, 2) := 0;
  v_seen_services uuid[] := array[]::uuid[];
  v_event_id uuid := gen_random_uuid();
begin
  if v_customer_id is null or not exists (
    select 1 from public.profiles p
    where p.id = v_customer_id and p.role = 'CUSTOMER'::public.user_role and p.status = 'ACTIVE'::public.profile_status
  ) then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
  end if;

  if p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 128 then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_customer_id::text || ':' || p_idempotency_key, 0));

  return query
    select o.id, o.order_no, o.status, o.estimate_amount, o.currency, o.created_at
    from public.orders o
    where o.customer_id = v_customer_id and o.idempotency_key = p_idempotency_key;
  if found then return; end if;

  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) < 1 or jsonb_array_length(p_items) > 10 then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  if jsonb_typeof(p_preferences) <> 'object'
    or char_length(p_preferences::text) > 3000
    or char_length(coalesce(p_notes, '')) > 1000 then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  begin
    if nullif(p_address ->> 'addressId', '') is not null then
      v_address_id := (p_address ->> 'addressId')::uuid;
      select a.label, a.address_text, a.latitude, a.longitude, a.notes
        into strict v_address_label, v_address_text, v_latitude, v_longitude, v_address_notes
      from public.customer_addresses a
      where a.id = v_address_id and a.customer_id = v_customer_id;
    else
      v_address_label := trim(p_address ->> 'label');
      v_address_text := trim(p_address ->> 'addressText');
      v_address_notes := nullif(trim(p_address ->> 'notes'), '');
      v_latitude := (p_address ->> 'latitude')::numeric;
      v_longitude := (p_address ->> 'longitude')::numeric;
      v_save_address := coalesce((p_address ->> 'saveAddress')::boolean, false);
    end if;
  exception
    when no_data_found or invalid_text_representation then
      raise exception using errcode = 'P0001', message = 'VAL_001';
  end;

  if char_length(v_address_label) not between 2 and 50
    or char_length(v_address_text) not between 8 and 500
    or v_latitude not between -90 and 90
    or v_longitude not between -180 and 180
    or char_length(coalesce(v_address_notes, '')) > 500 then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  select a.id into v_area_id
  from public.service_areas a
  where a.active
    and extensions.st_covers(
      extensions.st_setsrid(extensions.st_geomfromgeojson(a.geojson::text), 4326),
      extensions.st_setsrid(extensions.st_makepoint(v_longitude, v_latitude), 4326)
    )
  order by a.created_at
  limit 1;

  if v_area_id is null then
    raise exception using errcode = 'P0001', message = 'SVC_001';
  end if;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    begin
      v_estimated_qty := (v_item ->> 'estimatedQty')::numeric;
      select s.id, s.code, s.name, s.unit, s.duration_hours
        into strict v_service
      from public.services s
      where s.id = (v_item ->> 'serviceId')::uuid and s.active;
    exception
      when no_data_found or invalid_text_representation then
        raise exception using errcode = 'P0001', message = 'VAL_001';
    end;

    if v_estimated_qty <= 0 or v_service.id = any(v_seen_services) then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    v_seen_services := array_append(v_seen_services, v_service.id);

    select pv.id, pv.unit_price, pv.minimum_charge
      into v_price
    from public.service_price_versions pv
    where pv.service_id = v_service.id
      and pv.effective_from <= timezone('utc', now())
      and (pv.effective_to is null or pv.effective_to > timezone('utc', now()))
    order by pv.effective_from desc
    limit 1;

    if v_price.id is null then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    v_estimate := v_estimate + greatest(v_price.minimum_charge, v_price.unit_price * v_estimated_qty);
  end loop;

  update public.pickup_slots ps
  set reserved_count = ps.reserved_count + 1, updated_at = timezone('utc', now())
  where ps.id = p_slot_id and ps.service_area_id = v_area_id and ps.active
    and ps.starts_at > timezone('utc', now()) and ps.reserved_count < ps.capacity;
  if not found then
    raise exception using errcode = 'P0001', message = 'SLOT_001';
  end if;

  if v_save_address then
    insert into public.customer_addresses (
      customer_id, label, address_text, latitude, longitude, service_area_id, notes
    ) values (
      v_customer_id, v_address_label, v_address_text, v_latitude, v_longitude, v_area_id, v_address_notes
    ) returning customer_addresses.id into v_address_id;
  end if;

  v_order_no := 'TC-' || to_char(timezone('utc', now()), 'YYYYMMDD') || '-' || upper(substr(replace(v_order_id::text, '-', ''), 1, 8));

  insert into public.orders (
    id, order_no, customer_id, address_snapshot, pickup_slot_id, status,
    estimate_amount, notes, idempotency_key
  ) values (
    v_order_id, v_order_no, v_customer_id,
    jsonb_build_object(
      'addressId', v_address_id, 'label', v_address_label, 'addressText', v_address_text,
      'latitude', v_latitude, 'longitude', v_longitude, 'serviceAreaId', v_area_id, 'notes', v_address_notes
    ),
    p_slot_id, 'PENDING_CONFIRMATION'::public.order_status, v_estimate,
    nullif(trim(p_notes), ''), p_idempotency_key
  );

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_estimated_qty := (v_item ->> 'estimatedQty')::numeric;
    select s.id, s.code, s.name, s.unit, s.duration_hours into strict v_service
    from public.services s where s.id = (v_item ->> 'serviceId')::uuid;
    select pv.id, pv.unit_price, pv.minimum_charge into strict v_price
    from public.service_price_versions pv
    where pv.service_id = v_service.id
      and pv.effective_from <= timezone('utc', now())
      and (pv.effective_to is null or pv.effective_to > timezone('utc', now()))
    order by pv.effective_from desc limit 1;

    insert into public.order_items (
      order_id, service_id, service_snapshot, estimated_qty, preference_snapshot
    ) values (
      v_order_id, v_service.id,
      jsonb_build_object(
        'code', v_service.code, 'name', v_service.name, 'unit', v_service.unit,
        'durationHours', v_service.duration_hours, 'priceVersionId', v_price.id,
        'unitPrice', v_price.unit_price, 'minimumCharge', v_price.minimum_charge
      ),
      v_estimated_qty, coalesce(p_preferences, '{}'::jsonb)
    );
  end loop;

  insert into public.order_status_history (
    order_id, from_status, to_status, actor_id, correlation_id, metadata
  ) values (
    v_order_id, null, 'PENDING_CONFIRMATION'::public.order_status, v_customer_id, p_correlation_id,
    jsonb_build_object('source', 'CUSTOMER_ORDER')
  );

  insert into public.domain_outbox (
    id, event_type, aggregate_type, aggregate_id, payload, dedupe_key
  ) values (
    v_event_id, 'ORDER_CREATED', 'ORDER', v_order_id,
    jsonb_build_object(
      'eventId', v_event_id, 'eventType', 'ORDER_CREATED', 'aggregateType', 'ORDER',
      'aggregateId', v_order_id, 'aggregateVersion', 1, 'actorId', v_customer_id,
      'actorRole', 'CUSTOMER', 'occurredAt', timezone('utc', now()),
      'correlationId', p_correlation_id, 'payloadVersion', 1,
      'data', jsonb_build_object('orderNo', v_order_no, 'status', 'PENDING_CONFIRMATION')
    ),
    v_event_id::text
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, dedupe_key)
  values (
    v_customer_id, 'ORDER_CREATED', 'Pesanan berhasil dibuat',
    'Pesanan ' || v_order_no || ' menunggu konfirmasi.', 'ORDER', v_order_id,
    v_event_id::text || ':' || v_customer_id::text || ':ORDER_CREATED_CUSTOMER'
  );

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, dedupe_key)
  select p.id, 'ORDER_CREATED', 'Pesanan baru', 'Pesanan ' || v_order_no || ' perlu ditinjau.',
    'ORDER', v_order_id, v_event_id::text || ':' || p.id::text || ':ORDER_CREATED_ADMIN'
  from public.profiles p
  where p.role = 'ADMIN'::public.user_role and p.status = 'ACTIVE'::public.profile_status;

  return query
    select o.id, o.order_no, o.status, o.estimate_amount, o.currency, o.created_at
    from public.orders o where o.id = v_order_id;
end;
$$;

revoke all on function public.create_customer_order(text, jsonb, uuid, jsonb, jsonb, text, uuid) from public, anon;
grant execute on function public.create_customer_order(text, jsonb, uuid, jsonb, jsonb, text, uuid) to authenticated;

commit;
