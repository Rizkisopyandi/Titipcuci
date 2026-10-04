# 05 — Payment State Machine

Payment attempt terpisah dari invoice dan order.

## States

`CREATED → PENDING → SETTLEMENT|CAPTURE` dipetakan ke domain `PAID`. Cabang: `DENY|CANCEL → FAILED`, `EXPIRE → EXPIRED`. Refund simulation: `PAID → REFUND_REQUESTED → REFUNDED` atau `REFUND_REJECTED`.

QRIS dan VA dapat mengirim status berbeda dari Midtrans; adapter menormalisasi ke `PENDING`, `PAID`, `FAILED`, `EXPIRED`. Status `PAID` terminal untuk attempt dan tidak boleh turun karena event lama.

## Guards

- Invoice `ISSUED`, unpaid, amount > 0, order `WAITING_PAYMENT` atau `PAYMENT_EXPIRED`.
- Satu attempt aktif per invoice; retry baru hanya setelah prior terminal/expired.
- `gross_amount`, merchant/order identifier, signature, dan environment harus cocok.
- Event dibandingkan dengan transition precedence dan transaction time; duplicate menghasilkan 200 tanpa side effect kedua.

## Atomic paid handling

Dalam satu transaksi: lock payment/invoice/order; simpan raw event yang disanitasi; update payment; tandai invoice paid; transisi order; append history/audit/outbox. Bila langkah gagal, seluruh perubahan retryable dan tidak setengah jadi.

## Expiry dan retry

Scheduler menandai attempt expired setelah vendor/local expiry. Order menjadi `PAYMENT_EXPIRED` dengan `resume_state=WAITING_PAYMENT`; Customer dapat membuat attempt baru untuk invoice sama. Invoice baru hanya dibuat bila komponen tagihan berubah secara sah.

## Refund simulation

Tidak memanggil transfer uang. Request menyimpan amount ≤ paid amount, reason, requester, evidence, approval Owner, status, dan link complaint/order. UI harus jelas berlabel “simulasi”.

Detail endpoint dan keamanan berada pada [Payment Spec](12-PAYMENT-SPEC.md).
