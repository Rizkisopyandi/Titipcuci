begin;

alter table public.orders
  add column confirmed_at timestamptz,
  add column pickup_scheduled_at timestamptz,
  add column pickup_started_at timestamptz,
  add column picked_up_at timestamptz,
  add column received_at timestamptz,
  add column rejected_at timestamptz,
  add column cancelled_at timestamptz,
  add column rejection_reason text,
  add column cancellation_reason text;

alter table public.order_status_history add column actor_role public.user_role;

update public.order_status_history h
set actor_role = p.role
from public.profiles p
where p.id = h.actor_id;

alter table public.order_status_history alter column actor_role set not null;

create function public.set_order_history_actor_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.actor_role is null then
    select p.role into new.actor_role
    from public.profiles p
    where p.id = new.actor_id;
  end if;

  if new.actor_role is null then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
  end if;

  return new;
end;
$$;

revoke all on function public.set_order_history_actor_role() from public, anon, authenticated;

create trigger order_status_history_actor_role
before insert on public.order_status_history
for each row execute function public.set_order_history_actor_role();

create function public.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'ACTIVE'::public.profile_status
      and p.role = 'ADMIN'::public.user_role
  );
$$;

create function public.is_active_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.status = 'ACTIVE'::public.profile_status
      and p.role = 'OWNER'::public.user_role
  );
$$;

revoke all on function public.is_active_admin(), public.is_active_owner() from public, anon;
grant execute on function public.is_active_admin(), public.is_active_owner() to authenticated;

create table public.pickup_delivery_tasks (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  type text not null default 'PICKUP' check (type = 'PICKUP'),
  status public.order_status not null,
  assigned_admin_id uuid not null references public.profiles (id) on delete restrict,
  scheduled_at timestamptz,
  started_at timestamptz,
  arrived_at timestamptz,
  completed_at timestamptz,
  location_session_id uuid,
  attempt_no integer not null default 1 check (attempt_no > 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (order_id, type, attempt_no)
);

create table public.bag_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  bag_code text not null unique check (bag_code ~ '^[A-Z0-9-]{4,50}$'),
  expected_count integer not null check (expected_count between 1 and 20),
  received_count integer check (received_count is null or received_count between 1 and 20),
  verified_by uuid references public.profiles (id) on delete restrict,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  unique (order_id, bag_code)
);

create table public.condition_records (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  condition_code text not null check (char_length(trim(condition_code)) between 2 and 50),
  description text check (description is null or char_length(trim(description)) <= 1000),
  needs_approval boolean not null default false check (not needs_approval),
  created_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.order_evidence (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  task_id uuid not null references public.pickup_delivery_tasks (id) on delete restrict,
  kind text not null check (kind = 'PICKUP_PROOF'),
  storage_path text not null unique,
  mime_type text not null check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  size_bytes bigint not null check (size_bytes between 1 and 10485760),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  uploaded_by uuid not null references public.profiles (id) on delete restrict,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete restrict,
  actor_role public.user_role not null,
  event_type text not null,
  entity_type text not null,
  entity_id uuid not null,
  old_value jsonb,
  new_value jsonb,
  reason text,
  ip_hash text,
  correlation_id uuid not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.order_command_receipts (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles (id) on delete restrict,
  order_id uuid not null references public.orders (id) on delete restrict,
  command text not null,
  idempotency_key text not null check (char_length(idempotency_key) between 16 and 128),
  result_status public.order_status not null,
  result_version integer not null,
  result_updated_at timestamptz not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (actor_id, idempotency_key)
);

create index pickup_tasks_admin_status_idx
on public.pickup_delivery_tasks (assigned_admin_id, status, scheduled_at);
create index pickup_tasks_order_idx on public.pickup_delivery_tasks (order_id);
create index bag_records_order_idx on public.bag_records (order_id);
create index condition_records_order_idx on public.condition_records (order_id, created_at);
create index order_evidence_order_idx on public.order_evidence (order_id, created_at);
create index audit_logs_entity_created_idx on public.audit_logs (entity_type, entity_id, created_at);

alter table public.pickup_delivery_tasks enable row level security;
alter table public.bag_records enable row level security;
alter table public.condition_records enable row level security;
alter table public.order_evidence enable row level security;
alter table public.audit_logs enable row level security;
alter table public.order_command_receipts enable row level security;

revoke all on table public.pickup_delivery_tasks, public.bag_records,
  public.condition_records, public.order_evidence, public.audit_logs,
  public.order_command_receipts from anon, authenticated;

grant select on table public.pickup_delivery_tasks, public.bag_records,
  public.condition_records to authenticated;
grant select on table public.audit_logs to authenticated;
grant select (id, order_id, task_id, kind, mime_type, size_bytes, sha256, uploaded_by, created_at)
  on public.order_evidence to authenticated;

create policy profiles_admin_read_operational_customer
on public.profiles for select to authenticated
using (
  public.is_active_admin() and role = 'CUSTOMER'::public.user_role
  and exists (select 1 from public.orders o where o.customer_id = profiles.id)
);

create policy profiles_owner_read
on public.profiles for select to authenticated
using (public.is_active_owner());

create policy pickup_slots_admin_owner_read
on public.pickup_slots for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy pickup_slots_customer_order_read
on public.pickup_slots for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.pickup_slot_id = pickup_slots.id and o.customer_id = auth.uid()
  )
);

create policy orders_admin_read
on public.orders for select to authenticated
using (public.is_active_admin());

create policy orders_owner_read
on public.orders for select to authenticated
using (public.is_active_owner());

create policy order_items_admin_owner_read
on public.order_items for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy order_history_admin_owner_read
on public.order_status_history for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy pickup_tasks_admin_owner_read
on public.pickup_delivery_tasks for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy pickup_tasks_customer_read_own
on public.pickup_delivery_tasks for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.id = pickup_delivery_tasks.order_id and o.customer_id = auth.uid()
  )
);

create policy bag_records_admin_owner_read
on public.bag_records for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy bag_records_customer_read_own
on public.bag_records for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.id = bag_records.order_id and o.customer_id = auth.uid()
  )
);

create policy condition_records_admin_owner_read
on public.condition_records for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy condition_records_customer_read_own
on public.condition_records for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.id = condition_records.order_id and o.customer_id = auth.uid()
  )
);

create policy order_evidence_admin_owner_read
on public.order_evidence for select to authenticated
using (public.is_active_admin() or public.is_active_owner());

create policy order_evidence_customer_read_own
on public.order_evidence for select to authenticated
using (
  public.is_active_customer() and exists (
    select 1 from public.orders o
    where o.id = order_evidence.order_id and o.customer_id = auth.uid()
  )
);

create policy audit_logs_owner_read
on public.audit_logs for select to authenticated
using (public.is_active_owner());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'order-evidence',
  'order-evidence',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy m3_pickup_evidence_admin_insert
on storage.objects for insert to authenticated
with check (
  bucket_id = 'order-evidence'
  and public.is_active_admin()
  and name ~ '^pickup/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$'
  and exists (
    select 1 from public.pickup_delivery_tasks t
    join public.orders o on o.id = t.order_id
    where t.order_id::text = (storage.foldername(name))[2]
      and t.assigned_admin_id = auth.uid()
      and o.status = 'PICKUP_ON_THE_WAY'::public.order_status
  )
);

create policy m3_pickup_evidence_admin_read
on storage.objects for select to authenticated
using (
  bucket_id = 'order-evidence'
  and public.is_active_admin()
  and name ~ '^pickup/[0-9a-f-]{36}/'
  and exists (
    select 1 from public.pickup_delivery_tasks t
    where t.order_id::text = (storage.foldername(name))[2]
      and t.assigned_admin_id = auth.uid()
  )
);

create policy m3_pickup_evidence_admin_delete
on storage.objects for delete to authenticated
using (
  bucket_id = 'order-evidence'
  and public.is_active_admin()
  and name ~ '^pickup/[0-9a-f-]{36}/'
  and exists (
    select 1 from public.pickup_delivery_tasks t
    where t.order_id::text = (storage.foldername(name))[2]
      and t.assigned_admin_id = auth.uid()
  )
);

create function public.prevent_append_only_change()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  raise exception using errcode = '42501', message = 'Append-only record cannot be changed.';
end;
$$;

revoke all on function public.prevent_append_only_change() from public, anon, authenticated;

create trigger order_status_history_append_only
before update or delete on public.order_status_history
for each row execute function public.prevent_append_only_change();

create trigger audit_logs_append_only
before update or delete on public.audit_logs
for each row execute function public.prevent_append_only_change();

create function public.admin_transition_order(
  p_order_id uuid,
  p_command text,
  p_expected_version integer,
  p_idempotency_key text,
  p_payload jsonb,
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
  v_task public.pickup_delivery_tasks%rowtype;
  v_to_status public.order_status;
  v_event_type text;
  v_status_changed boolean := true;
  v_reason text := nullif(trim(p_payload ->> 'reason'), '');
  v_now timestamptz := timezone('utc', now());
  v_event_id uuid := gen_random_uuid();
  v_bag_codes jsonb;
  v_bag_code text;
  v_bag_count integer;
  v_received_count integer;
  v_condition_code text;
  v_condition_description text;
  v_storage_path text;
  v_mime_type text;
  v_size_bytes bigint;
  v_sha256 text;
begin
  if v_actor_id is null or not public.is_active_admin() then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
  end if;

  if p_idempotency_key is null or char_length(p_idempotency_key) not between 16 and 128
    or p_expected_version is null or p_expected_version < 1
    or jsonb_typeof(coalesce(p_payload, '{}'::jsonb)) <> 'object' then
    raise exception using errcode = 'P0001', message = 'VAL_001';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(v_actor_id::text || ':' || p_idempotency_key, 0));

  select * into v_receipt
  from public.order_command_receipts r
  where r.actor_id = v_actor_id and r.idempotency_key = p_idempotency_key;

  if found then
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

  if p_command = 'CONFIRM' and v_order.status = 'PENDING_CONFIRMATION'::public.order_status then
    v_to_status := 'CONFIRMED'::public.order_status;
    v_event_type := 'ORDER_CONFIRMED';
    insert into public.pickup_delivery_tasks (order_id, status, assigned_admin_id)
    values (v_order.id, v_to_status, v_actor_id)
    returning * into v_task;
  elsif p_command = 'REJECT' and v_order.status = 'PENDING_CONFIRMATION'::public.order_status then
    if v_reason is null then raise exception using errcode = 'P0001', message = 'VAL_001'; end if;
    v_to_status := 'REJECTED'::public.order_status;
    v_event_type := 'ORDER_REJECTED';
  elsif p_command = 'SCHEDULE_PICKUP' and v_order.status = 'CONFIRMED'::public.order_status then
    v_to_status := 'PICKUP_SCHEDULED'::public.order_status;
    v_event_type := 'ORDER_STATUS_CHANGED';
    select * into strict v_task from public.pickup_delivery_tasks t
    where t.order_id = v_order.id and t.type = 'PICKUP' and t.attempt_no = 1 for update;
    update public.pickup_delivery_tasks t
    set status = v_to_status,
      scheduled_at = (select ps.starts_at from public.pickup_slots ps where ps.id = v_order.pickup_slot_id),
      updated_at = v_now
    where t.id = v_task.id;
  elsif p_command = 'START_PICKUP' and v_order.status = 'PICKUP_SCHEDULED'::public.order_status then
    v_to_status := 'PICKUP_ON_THE_WAY'::public.order_status;
    v_event_type := 'PICKUP_STARTED';
    select * into strict v_task from public.pickup_delivery_tasks t
    where t.order_id = v_order.id and t.assigned_admin_id = v_actor_id for update;
    update public.pickup_delivery_tasks t
    set status = v_to_status, started_at = v_now, updated_at = v_now
    where t.id = v_task.id;
  elsif p_command = 'ARRIVE_PICKUP' and v_order.status = 'PICKUP_ON_THE_WAY'::public.order_status then
    v_to_status := v_order.status;
    v_event_type := 'PICKUP_ARRIVED';
    v_status_changed := false;
    select * into strict v_task from public.pickup_delivery_tasks t
    where t.order_id = v_order.id and t.assigned_admin_id = v_actor_id for update;
    if v_task.arrived_at is not null then
      raise exception using errcode = 'P0001', message = 'ORD_001';
    end if;
    update public.pickup_delivery_tasks t
    set arrived_at = v_now, updated_at = v_now
    where t.id = v_task.id;
  elsif p_command = 'COMPLETE_PICKUP' and v_order.status = 'PICKUP_ON_THE_WAY'::public.order_status then
    v_to_status := 'PICKED_UP'::public.order_status;
    v_event_type := 'PICKUP_COMPLETED';
    select * into strict v_task from public.pickup_delivery_tasks t
    where t.order_id = v_order.id and t.assigned_admin_id = v_actor_id for update;
    if v_task.arrived_at is null then
      raise exception using errcode = 'P0001', message = 'ORD_001';
    end if;

    v_bag_codes := p_payload -> 'bagCodes';
    v_condition_code := upper(nullif(trim(p_payload ->> 'conditionCode'), ''));
    v_condition_description := nullif(trim(p_payload ->> 'conditionDescription'), '');
    v_storage_path := nullif(trim(p_payload #>> '{proof,storagePath}'), '');
    v_mime_type := nullif(trim(p_payload #>> '{proof,mimeType}'), '');
    v_sha256 := lower(nullif(trim(p_payload #>> '{proof,sha256}'), ''));
    begin
      v_size_bytes := (p_payload #>> '{proof,sizeBytes}')::bigint;
    exception when invalid_text_representation then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end;

    if jsonb_typeof(v_bag_codes) <> 'array' then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;
    v_bag_count := jsonb_array_length(v_bag_codes);
    if v_bag_count not between 1 and 20
      or v_condition_code is null
      or char_length(coalesce(v_condition_description, '')) > 1000
      or v_storage_path !~ ('^pickup/' || v_order.id::text || '/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$')
      or v_mime_type not in ('image/jpeg', 'image/png', 'image/webp')
      or v_size_bytes not between 1 and 10485760
      or v_sha256 !~ '^[a-f0-9]{64}$'
      or not exists (
        select 1 from storage.objects so
        where so.bucket_id = 'order-evidence' and so.name = v_storage_path
      ) then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;

    if (
      select count(distinct upper(trim(value)))
      from jsonb_array_elements_text(v_bag_codes)
    ) <> v_bag_count then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end if;

    for v_bag_code in select upper(trim(value)) from jsonb_array_elements_text(v_bag_codes)
    loop
      if v_bag_code !~ '^[A-Z0-9-]{4,50}$' then
        raise exception using errcode = 'P0001', message = 'VAL_001';
      end if;
      insert into public.bag_records (order_id, bag_code, expected_count)
      values (v_order.id, v_bag_code, v_bag_count);
    end loop;

    insert into public.condition_records (
      order_id, condition_code, description, needs_approval, created_by
    ) values (
      v_order.id, v_condition_code, v_condition_description, false, v_actor_id
    );

    insert into public.order_evidence (
      order_id, task_id, kind, storage_path, mime_type, size_bytes, sha256, uploaded_by
    ) values (
      v_order.id, v_task.id, 'PICKUP_PROOF', v_storage_path,
      v_mime_type, v_size_bytes, v_sha256, v_actor_id
    );

    update public.pickup_delivery_tasks t
    set status = v_to_status, completed_at = v_now, updated_at = v_now
    where t.id = v_task.id;
  elsif p_command = 'RECEIVE' and v_order.status = 'PICKED_UP'::public.order_status then
    v_to_status := 'RECEIVED'::public.order_status;
    v_event_type := 'LAUNDRY_RECEIVED';
    begin
      v_received_count := (p_payload ->> 'receivedBagCount')::integer;
    exception when invalid_text_representation then
      raise exception using errcode = 'P0001', message = 'VAL_001';
    end;
    select count(*) into v_bag_count from public.bag_records b where b.order_id = v_order.id;
    if v_received_count is null or v_received_count <> v_bag_count then
      raise exception using errcode = 'P0001', message = 'BAG_001';
    end if;
    update public.bag_records b
    set received_count = v_received_count, verified_by = v_actor_id, verified_at = v_now
    where b.order_id = v_order.id;
    update public.pickup_delivery_tasks t set status = v_to_status, updated_at = v_now
    where t.order_id = v_order.id and t.type = 'PICKUP';
  elsif p_command = 'CANCEL' and v_order.status in (
    'CONFIRMED'::public.order_status, 'PICKUP_SCHEDULED'::public.order_status
  ) then
    if v_reason is null then raise exception using errcode = 'P0001', message = 'VAL_001'; end if;
    v_to_status := 'CANCELLED'::public.order_status;
    v_event_type := 'ORDER_CANCELLED';
    update public.pickup_delivery_tasks t
    set status = v_to_status, completed_at = v_now, updated_at = v_now
    where t.order_id = v_order.id and t.type = 'PICKUP';
  else
    raise exception using errcode = 'P0001', message = 'ORD_001';
  end if;

  if v_to_status in ('REJECTED'::public.order_status, 'CANCELLED'::public.order_status) then
    update public.pickup_slots ps
    set reserved_count = greatest(0, ps.reserved_count - 1), updated_at = v_now
    where ps.id = v_order.pickup_slot_id;
  end if;

  update public.orders o
  set status = v_to_status,
    version = o.version + 1,
    updated_at = v_now,
    confirmed_at = case when p_command = 'CONFIRM' then v_now else o.confirmed_at end,
    pickup_scheduled_at = case when p_command = 'SCHEDULE_PICKUP' then v_now else o.pickup_scheduled_at end,
    pickup_started_at = case when p_command = 'START_PICKUP' then v_now else o.pickup_started_at end,
    picked_up_at = case when p_command = 'COMPLETE_PICKUP' then v_now else o.picked_up_at end,
    received_at = case when p_command = 'RECEIVE' then v_now else o.received_at end,
    rejected_at = case when p_command = 'REJECT' then v_now else o.rejected_at end,
    cancelled_at = case when p_command = 'CANCEL' then v_now else o.cancelled_at end,
    rejection_reason = case when p_command = 'REJECT' then v_reason else o.rejection_reason end,
    cancellation_reason = case when p_command = 'CANCEL' then v_reason else o.cancellation_reason end
  where o.id = v_order.id
  returning * into v_order;

  if v_status_changed then
    insert into public.order_status_history (
      order_id, from_status, to_status, actor_id, actor_role,
      reason_code, note, occurred_at, correlation_id, metadata
    ) values (
      v_order.id, (select h.to_status from public.order_status_history h where h.order_id = v_order.id order by h.occurred_at desc, h.id desc limit 1),
      v_to_status, v_actor_id, 'ADMIN'::public.user_role,
      case when v_reason is not null then p_command else null end, v_reason,
      v_now, p_correlation_id, jsonb_build_object('command', p_command, 'version', v_order.version)
    );
  end if;

  insert into public.domain_outbox (
    id, event_type, aggregate_type, aggregate_id, payload, dedupe_key, occurred_at
  ) values (
    v_event_id, v_event_type, 'ORDER', v_order.id,
    jsonb_build_object(
      'eventId', v_event_id, 'eventType', v_event_type, 'aggregateType', 'ORDER',
      'aggregateId', v_order.id, 'aggregateVersion', v_order.version,
      'actorId', v_actor_id, 'actorRole', 'ADMIN', 'occurredAt', v_now,
      'correlationId', p_correlation_id, 'payloadVersion', 1,
      'data', jsonb_build_object('orderNo', v_order.order_no, 'status', v_to_status)
    ),
    v_event_id::text, v_now
  );

  if p_command = 'CONFIRM' then
    insert into public.domain_outbox (event_type, aggregate_type, aggregate_id, payload, dedupe_key, occurred_at)
    values (
      'PICKUP_ASSIGNED', 'ORDER', v_order.id,
      jsonb_build_object('orderId', v_order.id, 'assignedAdminId', v_actor_id, 'payloadVersion', 1),
      v_event_id::text || ':PICKUP_ASSIGNED', v_now
    );
  elsif p_command = 'COMPLETE_PICKUP' then
    insert into public.domain_outbox (event_type, aggregate_type, aggregate_id, payload, dedupe_key, occurred_at)
    values
      ('BAG_VERIFIED', 'ORDER', v_order.id, jsonb_build_object('orderId', v_order.id, 'bagCount', v_bag_count, 'payloadVersion', 1), v_event_id::text || ':BAG_VERIFIED', v_now),
      ('CONDITION_RECORDED', 'ORDER', v_order.id, jsonb_build_object('orderId', v_order.id, 'conditionCode', v_condition_code, 'payloadVersion', 1), v_event_id::text || ':CONDITION_RECORDED', v_now);
  end if;

  insert into public.notifications (user_id, type, title, body, entity_type, entity_id, dedupe_key)
  values (
    v_order.customer_id, v_event_type, 'Status pesanan diperbarui',
    'Pesanan ' || v_order.order_no || ' kini berstatus ' || replace(v_to_status::text, '_', ' ') || '.',
    'ORDER', v_order.id, v_event_id::text || ':' || v_order.customer_id::text || ':' || v_event_type
  );

  insert into public.audit_logs (
    actor_id, actor_role, event_type, entity_type, entity_id,
    old_value, new_value, reason, correlation_id
  ) values (
    v_actor_id, 'ADMIN'::public.user_role,
    case when v_status_changed then 'ORDER_STATUS_CHANGED' else v_event_type end,
    'ORDER', v_order.id,
    jsonb_build_object('status', (select h.from_status from public.order_status_history h where h.order_id = v_order.id order by h.occurred_at desc limit 1), 'version', p_expected_version),
    jsonb_build_object('status', v_to_status, 'version', v_order.version),
    v_reason, p_correlation_id
  );

  insert into public.order_command_receipts (
    actor_id, order_id, command, idempotency_key,
    result_status, result_version, result_updated_at
  ) values (
    v_actor_id, v_order.id, p_command, p_idempotency_key,
    v_order.status, v_order.version, v_order.updated_at
  );

  return query select v_order.id, v_order.order_no, v_order.status, v_order.version, v_order.updated_at;
exception
  when no_data_found then
    raise exception using errcode = 'P0001', message = 'AUTH_002';
end;
$$;

revoke all on function public.admin_transition_order(uuid, text, integer, text, jsonb, uuid) from public, anon;
grant execute on function public.admin_transition_order(uuid, text, integer, text, jsonb, uuid) to authenticated;

commit;
