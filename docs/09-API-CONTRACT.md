# 09 — API Contract

Semua endpoint berada di `/api/v1`, JSON UTF-8, auth cookie/JWT Supabase, Zod validation, correlation ID, rate limit, dan error envelope katalog. Mutation menerima `Idempotency-Key`; state mutation juga menerima `expectedVersion`.

## Envelope

Success: `{ "data": ..., "meta": { "requestId": "uuid" } }`. Error: `{ "error": { "code": "ORD_001", "message": "...", "fieldErrors": {} }, "meta": { "requestId": "uuid" } }`.

## Auth/profile/master

- `GET/PATCH /me`; `GET/POST/PATCH/DELETE /addresses`; `GET /services`; `GET /serviceability?lat=&lng=`; `GET /slots?date=&areaId=`.
- Owner: `POST/PATCH /admin-users`, `POST/PATCH /services`, `/price-versions`, `/service-areas`, `/slots`.

## Orders

- `API-ORD-001 POST /orders`: service items, addressId/pin, slotId, preferences, notes → order summary.
- `GET /orders`, `GET /orders/{id}` scoped by role.
- `API-ORD-002 POST /orders/{id}/confirm`; `/reject`; `/reschedule`; `/cancel`; `/delay`; `/hold`; `/resume`.
- `API-APR-001 POST /orders/{id}/approval-requests`; `POST /approval-requests/{id}/respond`.

## Pickup/receive/invoice

- `API-PUP-001 POST /orders/{id}/pickup/start|arrive|complete`; complete requires bag/condition/proof references.
- `POST /orders/{id}/receive`.
- `API-WGT-001 POST /orders/{id}/weight` body `{actualItems:[{orderItemId,actualQty}], reason?}`.
- `API-INV-001 POST /orders/{id}/invoice` returns immutable pricing breakdown.
- Upload flow: `POST /evidence/upload-intent`, client upload to private storage, `POST /evidence/confirm` validates metadata/hash.

## Payment/webhook

- `API-PAY-001 POST /invoices/{id}/payment-attempts` body `{method:"QRIS"|"VA", bank?}`.
- `GET /payments/{id}`; `API-PAY-002 POST /webhooks/midtrans` unauthenticated by user but signature-verified.
- `POST /payments/{id}/refund-requests`; Owner `POST /refund-requests/{id}/approve|reject`.

## Processing/delivery/support

- `POST /orders/{id}/process/{stage}/start|complete`.
- `API-QC-001 POST /orders/{id}/quality-checks` body checklist/result/reason.
- `API-DLV-001 POST /orders/{id}/delivery/start|arrive|complete|fail`; complete requires proof.
- `POST /orders/{id}/reviews`; `API-CMP-001 POST /orders/{id}/complaints`; `GET/PATCH /complaints/{id}`; `POST /complaints/{id}/events|resolve`.
- `GET /notifications`; `POST /notifications/{id}/read`; Owner `GET /analytics`, `/audit-logs`.

## Command response

Mutation mengembalikan aggregate terbaru, `version`, domain events queued, dan requestId. HTTP: 200/201 success, 400 validation, 401, 403, 404 (termasuk inaccessible resource), 409 state/version/idempotency conflict, 422 rule failure, 429, 500/502 vendor.

Endpoint ID digunakan oleh [Traceability](25-REQUIREMENT-TRACEABILITY.md). API tidak boleh membocorkan storage path internal, secret, raw vendor payload, atau data customer lain.
