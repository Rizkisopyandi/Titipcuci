-- NON-PRODUCTION ONLY: deterministic minimum master data for M2 live verification.
-- Run only after scripts/check-seed-target.ts approves the linked project ref.
-- Re-running is idempotent. All records use a LIVE_M2 marker and stable UUIDs.

begin;

insert into public.services (id, code, name, unit, duration_hours, active)
values
  ('00000000-0000-4000-8000-000000002101', 'LIVE_M2_REGULAR_KG', '[LIVE M2] Regular', 'KG', 48, true),
  ('00000000-0000-4000-8000-000000002102', 'LIVE_M2_EXPRESS_KG', '[LIVE M2] Express', 'KG', 24, true),
  ('00000000-0000-4000-8000-000000002103', 'LIVE_M2_BEDCOVER_ITEM', '[LIVE M2] Bedcover', 'ITEM', 72, true)
on conflict (id) do update set
  code = excluded.code,
  name = excluded.name,
  unit = excluded.unit,
  duration_hours = excluded.duration_hours,
  active = excluded.active,
  updated_at = timezone('utc', now());

insert into public.service_price_versions (
  id, service_id, unit_price, minimum_charge, effective_from, effective_to
)
values
  ('00000000-0000-4000-8000-000000002201', '00000000-0000-4000-8000-000000002101', 8000, 24000, '2026-01-01T00:00:00Z', null),
  ('00000000-0000-4000-8000-000000002202', '00000000-0000-4000-8000-000000002102', 14000, 42000, '2026-01-01T00:00:00Z', null),
  ('00000000-0000-4000-8000-000000002203', '00000000-0000-4000-8000-000000002103', 25000, 25000, '2026-01-01T00:00:00Z', null)
on conflict (id) do update set
  unit_price = excluded.unit_price,
  minimum_charge = excluded.minimum_charge,
  effective_from = excluded.effective_from,
  effective_to = excluded.effective_to;

insert into public.service_areas (id, name, geojson, active)
values (
  '00000000-0000-4000-8000-000000002301',
  '[LIVE M2] Jakarta Selatan Test Area',
  '{"type":"Polygon","coordinates":[[[106.70,-6.35],[106.95,-6.35],[106.95,-6.10],[106.70,-6.10],[106.70,-6.35]]]}'::jsonb,
  true
)
on conflict (id) do update set
  name = excluded.name,
  geojson = excluded.geojson,
  active = excluded.active,
  updated_at = timezone('utc', now());

insert into public.pickup_slots (
  id, service_area_id, starts_at, ends_at, capacity, reserved_count, active
)
values
  ('00000000-0000-4000-8000-000000002401', '00000000-0000-4000-8000-000000002301', '2026-10-06T02:00:00Z', '2026-10-06T04:00:00Z', 3, 0, true),
  ('00000000-0000-4000-8000-000000002402', '00000000-0000-4000-8000-000000002301', '2026-10-06T06:00:00Z', '2026-10-06T08:00:00Z', 3, 0, true),
  ('00000000-0000-4000-8000-000000002403', '00000000-0000-4000-8000-000000002301', '2026-10-07T02:00:00Z', '2026-10-07T04:00:00Z', 3, 0, true)
on conflict (id) do update set
  service_area_id = excluded.service_area_id,
  starts_at = excluded.starts_at,
  ends_at = excluded.ends_at,
  capacity = excluded.capacity,
  active = excluded.active,
  updated_at = timezone('utc', now());

commit;
