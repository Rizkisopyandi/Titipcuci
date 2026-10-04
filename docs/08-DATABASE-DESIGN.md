# 08 — Database Design

PostgreSQL/Supabase adalah source of truth. UUID, `timestamptz` UTC, `created_at`, `updated_at`, dan constraint eksplisit digunakan konsisten. Soft delete hanya untuk master/user yang perlu history.

## Identity/master

- `profiles(id PK→auth.users, role enum, full_name, phone, status, created_at)`; role `OWNER|ADMIN|CUSTOMER`.
- `customer_addresses(id, customer_id, label, address_text, latitude, longitude, service_area_id, notes, is_default)`.
- `customer_preferences(customer_id, detergent_note, fragrance_note, allergy_note, delivery_method)`.
- `services(id, code unique, name, unit KG|ITEM, duration_hours, active)`.
- `service_price_versions(id, service_id, unit_price, minimum_charge, effective_from, effective_to, created_by)`; interval tidak overlap.
- `service_areas(id, name, geojson, active)`; `pickup_slots(id, service_area_id, starts_at, ends_at, capacity, reserved_count, active)`.

## Order/operations

- `orders(id, order_no unique, customer_id, address_snapshot jsonb, pickup_slot_id, status, version, estimate_amount, currency, notes, idempotency_key)` pada M2; field exception/lifecycle ditambahkan oleh migration milestone terkait.
- `order_items(id, order_id, service_id, service_snapshot jsonb, estimated_qty, preference_snapshot jsonb)` pada M2; `actual_qty` hanya ditambahkan pada milestone penimbangan Admin.
- `order_status_history(id, order_id, from_status, to_status, actor_id, reason_code, note, occurred_at, correlation_id, metadata)` append-only.
- `pickup_delivery_tasks(id, order_id, type PICKUP|DELIVERY, status, assigned_admin_id, scheduled_at, started_at, arrived_at, completed_at, location_session_id, attempt_no)`.
- `bag_records(id, order_id, bag_code unique, expected_count, received_count, verified_by, verified_at)`.
- `condition_records(id, order_id, condition_code, description, needs_approval, created_by, created_at)`.
- `order_evidence(id, order_id, complaint_id nullable, task_id nullable, kind, storage_path, mime_type, size_bytes, sha256, uploaded_by, created_at)`.
- `approval_requests(id, order_id, type, proposal jsonb, status, expires_at, responded_by, responded_at)`.
- `laundry_processes(id, order_id, stage, status, started_at, completed_at, operator_id, note)`.
- `quality_checks(id, order_id, attempt_no, checklist jsonb, result PASS|FAIL, reason, inspector_id, created_at)`.

## Billing/support/system

- `invoices(id, order_id unique, invoice_no unique, status, subtotal, discount, surcharge, tax, total, currency, pricing_snapshot jsonb, issued_at, paid_at)`.
- `invoice_items(id, invoice_id, type, description, qty, unit_price, amount, source_ref)`.
- `payments(id, invoice_id, attempt_no, provider, method, provider_order_id unique, status, amount, expires_at, paid_at, idempotency_key unique)`.
- `payment_events(id, payment_id nullable, provider_event_id, signature_hash, normalized_status, payload_redacted jsonb, received_at, processed_at, result)`; unique provider event/digest.
- `refund_requests(id, payment_id, complaint_id nullable, amount, reason, status, requested_by, approved_by, resolved_at)`.
- `complaints(id, order_id, customer_id, category, description, status, priority, sla_due_at, assigned_admin_id, resolution_code, resolved_at)`.
- `complaint_events(id, complaint_id, type, actor_id, message, metadata, created_at)` append-only.
- `reviews(id, order_id unique, customer_id, rating check 1..5, comment, updated_at)`.
- `notifications(id, user_id, type, title, body, entity_type, entity_id, dedupe_key unique, read_at, created_at)`.
- `audit_logs(id, actor_id, actor_role, event_type, entity_type, entity_id, old_value, new_value, reason, ip_hash, correlation_id, created_at)` append-only.
- `feature_flags(key PK, enabled, description, updated_by, updated_at)`.
- `domain_outbox(id, event_type, aggregate_type, aggregate_id, payload, dedupe_key unique, occurred_at, published_at)`.

## Index/constraint minimum

Index order by customer/status/created; task by admin/status/schedule; notifications by user/read/created; audit by entity/date; complaint by status/SLA. Money `numeric(14,2)` nonnegative; coordinate range; actual qty > 0; status enum/check; FK behavior explicit. Slot reservation, state transition, invoice issue, dan webhook paid memakai transaction/RPC.

## RLS/retention

Semua tabel exposed memiliki RLS. Customer hanya own rows melalui order ownership; Admin sesuai tugas/operasi; Owner oversight. Service role hanya di server. Evidence bucket privat. Live coordinate tidak disimpan di tabel history permanen; ephemeral channel/session mengikuti [Live Map Spec](11-LIVE-MAP-SPEC.md).

Migration rules: [Database Migration Policy](37-DATABASE-MIGRATION-POLICY.md); field validations: [Data Validation Rules](31-DATA-VALIDATION-RULES.md).
