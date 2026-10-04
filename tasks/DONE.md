# Done

## 2026-10-03 — Blueprint v1.0.0

- Struktur repository dokumentasi lengkap dibuat.
- Source of Truth, requirement, state, API, DB, security, design, exception, test, deploy, governance, traceability M0–M12, dan strict DoD diselaraskan.
- Stack/role/core flow dan seluruh cabang yang diminta tercakup.
- Status: documentation baseline only; tidak menyatakan aplikasi telah diimplementasikan atau integrasi vendor telah diuji live.

## 2026-10-03 — M0 Foundation — APPROVED

- Task/REQ: `M0-01`–`M0-06`, `REQ-OPS-001`.
- Ringkasan: Next.js App Router, strict TypeScript, Tailwind/shadcn-ready,
  adapter Supabase/Mapbox/Midtrans, env validation, CI, health, logging,
  migration chain, RLS harness, dan seed target guard.
- PR/commit: tidak tersedia; direktori awal bukan Git worktree.
- Migration: `20261003000000_m0_foundation.sql`.
- Evidence: format, lint, typecheck, 7 tests, build, HTTP 200, serta Edge
  headless QA desktop/mobile/health.
- Reviewer: Project Owner — approved pada 2026-10-03.
- Residual risk: live vendor integration belum diuji karena kredensial/URL
  target belum lengkap; dev-only advisory `braces` melalui ESLint tooling.

## 2026-10-04 — M1 Authentication + RBAC — ACCEPTED WITH CAVEATS

- Task/REQ: `M1-01`–`M1-05`, `REQ-SEC-001`.
- Reviewer: Project Owner — accepted pada 2026-10-04.
- Evidence: remote migration, Auth profile trigger/default Customer, metadata
  tamper denial, login/session, own/cross-user RLS, role-update denial,
  anonymous route protection, fixture cleanup, 42 local tests, dan build lulus.
- Residual risk: public signup email verification terhalang provider rate limit;
  authenticated Customer route proof terhalang custom cookie harness.

## 2026-10-05 — M2 Customer Order — ACCEPTED / LIVE VERIFIED

- Task/REQ: `M2-01`–`M2-08`, `REQ-ORD-001`, `REQ-ORD-002`.
- Reviewer: Project Owner — accepted sebelum M3 dimulai.
- Evidence: migration remote, non-production master data, serviceability, slots,
  create `PENDING_CONFIRMATION`, server estimate, ownership/cross-user RLS,
  direct-write denial, idempotency, capacity conflict, cleanup, 53 local tests,
  dan production build lulus.
- Residual risk: tidak ada blocker M2 terbuka; operasi Admin dimulai terpisah di M3.

## 2026-10-05 — M3 Admin Order Operation — ACCEPTED / LIVE VERIFIED

- Task/REQ: `M3-01`–`M3-07`, M3 subset `REQ-ORD-003/004`, `REQ-PUP-001/003`,
  dan `REQ-AUD-001`.
- Ringkasan: Admin queue/detail, guarded confirm sampai receive, assigned pickup
  task, bag/condition/private proof, immutable history, timestamp, event,
  notification, audit, Customer synchronization, dan strict RLS.
- Migrations: `20261005000100_m3_order_states.sql` dan
  `20261005000200_m3_admin_order_operations.sql` diterapkan ke linked project
  `uydhmkhgpeynswxkaxod`; M0–M2 tidak diubah.
- Evidence: format, lint, strict typecheck, focused M3 15/15, full suite 68/68,
  dan production build lulus.
- Live evidence: Admin read, Customer mutation denial, valid/invalid transitions,
  assigned-Admin enforcement, pickup/receive, immutable history,
  audit/outbox/notification, Customer safe read, dan cleanup lulus.
- Reviewer: Project Owner — fully accepted after live verification.
- Residual risk: proof object diverifikasi pada boundary metadata database dalam
  transaksi rollback; upload binary via browser sengaja tidak diuji. Scope M4
  dilacak terpisah setelah acceptance M3.

## 2026-10-06 — M4 Actual Weight + Final Invoice — READY FOR OWNER CODE ACCEPTANCE

- Task/REQ: `M4-01`–`M4-07`, `REQ-WGT-001`, `REQ-INV-001`.
- Ringkasan: Admin-only actual quantity/correction, locked pricing with minimum,
  immutable itemized invoice snapshot, guarded states through `WAITING_PAYMENT`,
  Customer/Admin canonical detail, history, audit, outbox, notification, RLS,
  CAS, dan idempotency.
- Migrations: `20261006000100_m4_order_states.sql` dan
  `20261006000200_m4_weight_invoice.sql`; belum dideploy; M0–M3 tidak diubah.
- Evidence: format, lint, strict typecheck, focused M4 17/17, full suite 85/85,
  dan production build lulus.
- Reviewer: Project Owner — pending code acceptance.
- Residual risk: SQL migration belum diterapkan/diuji live. Diskon, surcharge,
  dan tax disnapshot nol karena belum ada aturan terukur; payment/Midtrans dan
  seluruh scope M5 tidak dimulai.

## Entry template implementasi

`tanggal | task/REQ | ringkasan | PR/commit | migration | tests/evidence | reviewer | residual risk`. Item hanya masuk setelah semua DoD relevan hijau.
