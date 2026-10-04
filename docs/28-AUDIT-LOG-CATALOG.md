# 28 — Audit Log Catalog

Audit wajib untuk: auth/admin lifecycle; role/status change; service/price/area/slot/flag change; order confirm/reject/cancel/reschedule/delay/hold/resume; assignment; bag/condition/weight correction; invoice issue/adjustment; payment/refund state; QC result; proof completion; complaint assignment/resolution; signed evidence access oleh privileged role; export/report sensitif.

Event types memakai pola `ENTITY_ACTION`, antara lain `ADMIN_CREATED`, `ADMIN_DISABLED`, `PRICE_VERSION_CREATED`, `ORDER_STATUS_CHANGED`, `WEIGHT_CHANGED`, `INVOICE_ISSUED`, `PAYMENT_STATUS_CHANGED`, `REFUND_APPROVED`, `QC_RECORDED`, `COMPLAINT_RESOLVED`, `FEATURE_FLAG_CHANGED`, `AUDIT_EXPORTED`.

## Fields

`actor_id`, `actor_role`, `event_type`, `entity_type/id`, `old_value`, `new_value`, `reason`, `correlation_id`, `ip_hash`, `created_at`. Nilai before/after hanya field relevan dan sudah redacted. System actor eksplisit.

## Integrity/access

Append-only: aplikasi tidak punya update/delete. Owner read/filter/export; Admin hanya melihat history operasional aman, bukan audit global. Customer tidak membaca audit internal, tetapi timeline customer-safe berasal dari status history. Retention dan tamper-evidence perlu review produksi; v1 minimal DB permission ketat, backup, dan monitoring perubahan.
