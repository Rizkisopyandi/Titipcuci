# 40 — Feature Flag Policy

Flag bukan pengganti authorization, test, atau DoD. Server menentukan fitur sensitif; public env flag hanya presentasi.

## Baseline flags

- `live_tracking`: gate publisher/subscriber + UI; off tetap memungkinkan manual status.
- `refund_simulation`: off menyembunyikan request baru, record lama tetap terbaca Owner.
- `complaint_center`: off menghentikan create baru dengan pesan/support fallback, tidak menghapus ticket.
- `owner_analytics`: gate dashboard expensive queries.

## Metadata

Key, description, owner, default per environment, created/expires date, linked requirement/milestone, rollout %, dependencies, kill-switch behavior. Perubahan Owner-only dan audited.

## Lifecycle

Default off untuk fitur incomplete di production, on pada test target. Test both off/on dan dependency combination. Remove flag maksimal dua release setelah rollout stabil melalui PR/migration bila perlu. Emergency off harus tidak merusak data/transaksi in-flight; payment webhook/auth/RLS tidak boleh dinonaktifkan lewat flag biasa.
