# 04 — Order State Machine

## Primary states

`DRAFT` (client only) → `PENDING_CONFIRMATION` → `CONFIRMED` → `PICKUP_SCHEDULED` → `PICKUP_ON_THE_WAY` → `PICKED_UP` → `RECEIVED` → `WEIGHED` → `WAITING_PAYMENT` → `PAID` → `PROCESSING` → `QUALITY_CHECK` → `READY_FOR_DELIVERY` → `DELIVERY_ON_THE_WAY` → `DELIVERED` → `COMPLETED`.

Substage processing disimpan pada `laundry_processes.stage`, bukan menambah order state: `SORTING`, `WASHING`, `DRYING`, `IRONING`, `FOLDING`.

## Exception states

`CANCELLED` terminal; `REJECTED` terminal sebelum confirm; `DELAYED`, `ON_HOLD`, `NEEDS_CUSTOMER_APPROVAL`, `PAYMENT_EXPIRED`, `REPROCESSING`, `ISSUE_REPORTED` menyimpan `resume_state` yang legal. Exception bukan alasan menghapus prior history.

## Allowed transitions dan actor

| From                 | Command               | To                              | Actor           |
| -------------------- | --------------------- | ------------------------------- | --------------- |
| PENDING_CONFIRMATION | confirm/reject        | CONFIRMED/REJECTED              | Admin           |
| CONFIRMED            | schedule pickup       | PICKUP_SCHEDULED                | Admin           |
| PICKUP_SCHEDULED     | start pickup          | PICKUP_ON_THE_WAY               | Assigned Admin  |
| PICKUP_ON_THE_WAY    | complete pickup       | PICKED_UP                       | Assigned Admin  |
| PICKED_UP            | receive               | RECEIVED                        | Admin           |
| RECEIVED             | record weight         | WEIGHED                         | Admin           |
| WEIGHED              | issue invoice         | WAITING_PAYMENT                 | Server          |
| WAITING_PAYMENT      | verified paid webhook | PAID                            | System          |
| PAID                 | start processing      | PROCESSING                      | Admin           |
| PROCESSING           | request QC            | QUALITY_CHECK                   | Admin           |
| QUALITY_CHECK        | pass/fail             | READY_FOR_DELIVERY/REPROCESSING | Admin           |
| REPROCESSING         | recheck               | QUALITY_CHECK                   | Admin           |
| READY_FOR_DELIVERY   | start delivery        | DELIVERY_ON_THE_WAY             | Assigned Admin  |
| DELIVERY_ON_THE_WAY  | proof accepted        | DELIVERED                       | Assigned Admin  |
| DELIVERED            | confirm/auto-complete | COMPLETED                       | Customer/System |

Cancel/reschedule/delay/on-hold/approval hanya mengikuti guard di [Exception Flows](17-ERROR-EXCEPTION-FLOWS.md).

## Transition invariant

Command memerlukan current state dan `version`; server melakukan compare-and-swap/transaction. Satu transaksi menulis order, history, event outbox/audit dan side-effect intent. Retry dengan idempotency key mengembalikan result awal. Invalid transition menghasilkan `ORD_001`, bukan force update.

## History record

`order_id`, `from_status`, `to_status`, `actor_id`, `actor_role`, `reason_code`, `note`, `occurred_at`, `correlation_id`, `metadata`. History tidak di-update/delete oleh aplikasi.
