# 27 — Event Catalog

Event adalah past-tense domain fact, bukan command. Envelope: `eventId`, `eventType`, `aggregateType`, `aggregateId`, `aggregateVersion`, `actorId/role`, `occurredAt`, `correlationId`, `payloadVersion`, payload minimum. Dedupe berdasarkan eventId.

## Events resmi

- Order: `ORDER_CREATED`, `ORDER_CONFIRMED`, `ORDER_REJECTED`, `ORDER_RESCHEDULED`, `ORDER_CANCELLED`, `ORDER_DELAYED`, `ORDER_HELD`, `ORDER_RESUMED`, `ORDER_STATUS_CHANGED`.
- Approval: `CUSTOMER_APPROVAL_REQUESTED`, `CUSTOMER_APPROVAL_ACCEPTED`, `CUSTOMER_APPROVAL_REJECTED`, `CUSTOMER_APPROVAL_EXPIRED`.
- Pickup/receive: `PICKUP_ASSIGNED`, `PICKUP_STARTED`, `PICKUP_ARRIVED`, `BAG_VERIFIED`, `CONDITION_RECORDED`, `PICKUP_COMPLETED`, `LAUNDRY_RECEIVED`, `WEIGHT_RECORDED`.
- Billing: `INVOICE_ISSUED`, `PAYMENT_ATTEMPT_CREATED`, `PAYMENT_PAID`, `PAYMENT_FAILED`, `PAYMENT_EXPIRED`, `REFUND_REQUESTED`, `REFUND_SIMULATED`.
- Process: `PROCESS_STAGE_STARTED`, `PROCESS_STAGE_COMPLETED`, `QC_STARTED`, `QC_PASSED`, `QC_FAILED`, `REPROCESS_STARTED`, `ORDER_READY`.
- Delivery: `DELIVERY_ASSIGNED`, `DELIVERY_STARTED`, `DELIVERY_ARRIVED`, `DELIVERY_FAILED`, `DELIVERY_COMPLETED`, `ORDER_COMPLETED`.
- Support: `REVIEW_SUBMITTED`, `COMPLAINT_CREATED`, `COMPLAINT_UPDATED`, `COMPLAINT_RESOLVED`.
- Realtime location broadcasts memakai `LOCATION_UPDATED` ephemeral dan tidak masuk durable outbox/audit setiap titik.

Payload dilarang memuat raw evidence URL, full address/location, secret/payment credential. Event schema version berubah hanya dengan backward compatibility atau consumer migration.
