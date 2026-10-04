# 36 — Rollback Plan

## Trigger

Rollback/disable flag bila auth/RLS leak, payment salah, corrupt state/data, error kritis melonjak, migration gagal, atau golden path unavailable. Incident commander menghentikan deploy dan memilih feature disable, code rollback, atau forward fix.

## Urutan aman

1. Freeze mutation terdampak via feature flag/maintenance guard; jangan matikan evidence/log.
2. Catat waktu, commit, migration, scope, request IDs; lindungi data.
3. Untuk code-only, promote deployment Vercel sebelumnya yang kompatibel schema.
4. Untuk DB, utamakan forward corrective migration. Down migration hanya jika teruji, non-destructive, dan backup tersedia.
5. Payment webhook tetap menerima/queue aman agar event tidak hilang; jangan menandai paid manual.
6. Smoke auth/RLS/order/payment/map; reconcile pending events.
7. Komunikasi dan postmortem.

## Data rule

Jangan rollback dengan menghapus order/payment/audit. Additive migration dan expand-contract memungkinkan code rollback. Restore database penuh adalah opsi terakhir dengan analisis transaksi yang masuk setelah backup.

Setiap release mencatat known-good deployment, compatibility window, owner, dan perintah/runbook aktual setelah code tersedia.
