# 19 — Seed & Demo Data

Seed hanya untuk local/staging demo, idempotent, deterministik, dan ditolak bila environment production. Password disuntikkan melalui secret setup, tidak ditulis di repository.

## Master

- Area `AREA-CAMPUS-01`, slot harian 09:00–11:00 dan 13:00–15:00 kapasitas 3.
- `REGULAR_KG` Rp8.000/kg min 3 kg; `EXPRESS_KG` Rp14.000/kg min 3 kg; `BEDCOVER_ITEM` Rp25.000/item. Nilai demo, bukan keputusan harga produksi.
- Feature flag utama aktif di staging.

## Accounts

Identitas ada di [Test Accounts](33-TEST-ACCOUNTS-FIXTURES.md): 1 Owner, 2 Admin, 2 Customer.

## Fixtures

`ORDER_PENDING`, `ORDER_PICKUP`, `ORDER_APPROVAL`, `ORDER_WAITING_PAYMENT`, `PAYMENT_EXPIRED`, `ORDER_PROCESSING`, `ORDER_QC_FAIL`, `ORDER_READY`, `ORDER_DELIVERY`, `ORDER_COMPLETED`, `ORDER_COMPLAINT`. Semua memiliki order_no prefiks `DEMO-`, timestamps relatif terhadap seed run, dan evidence placeholder lokal yang aman.

## Reset

Script reset hanya menghapus rows bertanda tenant/demo namespace dan memverifikasi target host non-production. Urutan delete menghormati FK atau memakai transaction. Setelah reset, health assertions memastikan count, role, RLS, price version, dan slot capacity.

## M2 live verification fixture

`supabase/seeds/m2_live_verification.sql` berisi minimum master data dengan
marker `LIVE_M2` dan UUID stabil: tiga layanan/harga aktif, satu area polygon,
dan tiga slot future. Seed bersifat idempotent dan hanya dijalankan setelah
`scripts/check-seed-target.ts` menyetujui project ref non-production.

Customer dan order untuk live test tidak dipersistenkan: seluruhnya dibuat di
dalam transaction `supabase/tests/m2_live_verification.sql` lalu di-rollback.
