# 12 — Payment Specification

Provider v1: Midtrans Sandbox. Method: QRIS dan Virtual Account yang didukung sandbox.

## Create attempt

Server memuat invoice sendiri, memastikan customer/role, unpaid, total/currency, dan tidak ada attempt aktif. `provider_order_id` unik per attempt (`invoiceNo-attemptNo`). Response ke client hanya data presentasi aman: token/QR/VA, expiry, method, status.

## Webhook verification

Hitung signature sesuai dokumentasi Midtrans menggunakan server key; lakukan constant-time compare bila memungkinkan. Cocokkan provider order ID, gross amount presisi, currency/environment, transaction status, fraud status relevan. Jangan menerima status dari return URL/client. Raw payload disanitasi; signature/server key tidak dilog.

## Idempotency dan ordering

Simpan digest/provider event; lock payment row; terapkan transition monotonic. Duplicate mengembalikan 200 dengan `duplicate=true`. Event invalid tetap direkam aman dan menjawab status yang mencegah retry storm sesuai kategori. Side effect paid memiliki dedupe key.

## Reconciliation

Job berkala memeriksa attempt pending melewati threshold dengan status API provider, lalu memproses melalui handler normal. Dashboard menampilkan mismatch; tidak ada tombol “mark paid”.

## QRIS/VA UX

Tampilkan amount, invoice, expiry server time, instruksi, tombol cek status, dan state pending/expired/failed/paid. Return URL hanya navigasi. VA number/QR dianggap data transaksi dan tidak dipaparkan lintas user.

## Refund simulation

Request/approval dicatat; status `REFUNDED` domain berarti simulasi berhasil, tidak menjanjikan settlement nyata. Partial total refund tidak melebihi paid amount. Flow production refund wajib keputusan baru.

Status detail: [Payment State Machine](05-PAYMENT-STATE-MACHINE.md); error: [Error Catalog](29-ERROR-CODE-CATALOG.md).
