# Scripts Contract

Folder ini berisi automation kecil, aman, dan idempotent. M0 menyediakan
validasi environment dan target seed; script domain berikutnya ditambahkan pada
milestone pemiliknya.

## Tersedia pada M0

- `npm run check:env`: memvalidasi struktur environment dan hanya mencetak
  status konfigurasi, tanpa value.
- `npm run check:seed-target`: menolak production dan project ref di luar
  allowlist sebelum seeder masa depan dijalankan.

## Script yang diwajibkan saat milestone terkait

- `check-env`: validasi required/public/server-only vars tanpa mencetak value.
- `db-migrate` dan `db-verify`: apply/verify migration + RLS.
- `seed-demo` dan `reset-demo`: guard project ref/environment; hanya data marker demo.
- `test-webhook-fixtures`: signature valid/invalid/duplicate/out-of-order.
- `smoke`: auth, service, scoped order, storage, realtime, webhook health.
- `reconcile-payments`: idempotent pending payment check.
- `expire-payments`, `auto-complete-orders`, `sla-check`: cron-safe dengan lock/dedupe.
- `release-check` dan `demo-check`: menggabungkan gate tanpa menyembunyikan failure.

## Safety rules

Default dry-run untuk destructive/backfill, target explicit, fail closed jika environment ambigu, structured summary, nonzero exit on failure, no secret/PII output. Script production wajib terdokumentasi dengan contoh aman, permissions minimum, rollback/recovery, dan test.
