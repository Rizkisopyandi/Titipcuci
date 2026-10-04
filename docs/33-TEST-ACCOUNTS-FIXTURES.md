# 33 — Test Accounts & Fixtures

Hanya local/staging. Password disediakan melalui secret manager/test setup dan wajib berbeda dari production.

| Role       | Email                | Tujuan                               |
| ---------- | -------------------- | ------------------------------------ |
| Owner      | owner@test.local     | KPI, master, audit, refund approval  |
| Admin A    | admin1@test.local    | assigned pickup/delivery             |
| Admin B    | admin2@test.local    | unassigned access denial/concurrency |
| Customer A | customer1@test.local | golden path                          |
| Customer B | customer2@test.local | ownership isolation                  |

Fixture IDs stabil melalui code/key, bukan hard-coded production UUID. Dataset: `FX-ORDER-PENDING`, `-PICKUP`, `-APPROVAL`, `-WAITING-PAYMENT`, `-PAYMENT-EXPIRED`, `-PROCESSING`, `-QC-FAIL`, `-READY`, `-DELIVERY`, `-COMPLETED`, `-COMPLAINT`.

## Safety

Seeder memeriksa environment allowlist dan project ref; menolak production. Semua email/domain dan order memakai marker demo. Webhook fixture ditandatangani test server key, mencakup valid, invalid signature, amount mismatch, duplicate dan out-of-order.
