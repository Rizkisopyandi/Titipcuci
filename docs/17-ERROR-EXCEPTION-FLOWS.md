# 17 — Error & Exception Flows

| Kasus                | Trigger                    | Sistem                                   | Actor/action              | Next state                      |
| -------------------- | -------------------------- | ---------------------------------------- | ------------------------- | ------------------------------- |
| Di luar area         | server geofence false      | tolak sebelum reservasi                  | Customer ubah pin         | tetap draft                     |
| Slot penuh/race      | capacity conflict          | rollback order/reservation               | pilih slot lain           | draft                           |
| Reschedule           | within policy              | reserve baru, release lama, notify/audit | Customer/Admin            | PICKUP_SCHEDULED                |
| Cancel               | allowed guard              | release slot, stop task/tracking         | Customer/Admin            | CANCELLED                       |
| Admin terlambat      | ETA breach/manual          | reason + revised ETA                     | Admin                     | DELAYED→resume                  |
| Customer unavailable | failed pickup/delivery     | evidence + new schedule/hold             | Admin                     | ON_HOLD                         |
| Bag mismatch         | count/code mismatch        | block completion, evidence               | Admin/customer resolution | ISSUE_REPORTED                  |
| Kondisi khusus       | damage/treatment           | proposal + evidence                      | Customer approve/reject   | NEEDS_CUSTOMER_APPROVAL         |
| Berat/price berubah  | threshold exceeded         | hold invoice/process                     | Customer response         | NEEDS_CUSTOMER_APPROVAL         |
| Payment expired      | expiry/webhook             | close attempt, notify                    | Customer retry            | PAYMENT_EXPIRED→WAITING_PAYMENT |
| Payment failed       | deny/cancel                | safe reason, allow retry                 | Customer                  | WAITING_PAYMENT                 |
| Duplicate webhook    | known digest/state         | 200 no-op + event record                 | System                    | unchanged                       |
| QC fail              | checklist fail             | reprocess plan                           | Admin                     | REPROCESSING                    |
| Delivery gagal       | unavailable/address issue  | proof + hold/reschedule                  | Admin/Customer            | ON_HOLD                         |
| Complaint            | eligible report            | ticket/SLA/evidence                      | Customer/Admin            | complaint state independent     |
| Refund               | approved claim/cancel paid | simulation ledger                        | Owner                     | payment REFUNDED simulation     |

## Generic failure contract

Validation error mempertahankan input aman. Authorization tidak mengungkap keberadaan resource. Vendor/network failure tidak mengubah state seolah berhasil. Retry memakai key yang sama. Unexpected failure memberi correlation ID dan recovery action, bukan stack trace.

## Resume rule

Saat masuk exception, server menyimpan `resume_state` dari daftar yang diizinkan dan reason. Resume hanya jika blocker resolved dan invariant target terpenuhi. Exception history tetap ada.

Error code UI/API mengikuti [Error Code Catalog](29-ERROR-CODE-CATALOG.md).
