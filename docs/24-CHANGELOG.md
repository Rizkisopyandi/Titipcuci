# 24 — Changelog

Mengikuti Keep a Changelog dan semantic version untuk blueprint. Catat perubahan kontrak, bukan progres task harian.

## [Unreleased]

### Added

- M0 Foundation: Next.js App Router, TypeScript strict, Tailwind/shadcn-ready
  design tokens, Supabase clients, Mapbox/Midtrans adapter boundaries,
  environment validation, CI, health endpoint/page, structured logging,
  migration chain, RLS harness, dan seed target guard.
- Landing foundation TitipCuci berdasarkan arah visual Lovable dengan asset
  WebP lokal dan reduced-motion baseline.
- M1 Authentication + RBAC: Supabase SSR session flow, Customer registration,
  shared role login, logout, forgot/reset password, callback, protected
  Customer/Admin/Owner shells, dan safe redirect handling.
- Migration profil M1 dengan role `OWNER`/`ADMIN`/`CUSTOMER`, default Customer
  yang ditegakkan trigger database, column-level grants, dan own-profile RLS.
- Unit/security coverage untuk schema auth, gateway auth, role matrix, protected
  path, open-redirect prevention, serta static migration/RLS assertions.
- M2 Customer Order: wizard layanan–lokasi/pin–jadwal–preferensi–review,
  dashboard/list/detail pesanan Customer, API v1 terkait, preliminary estimate,
  dan migration transactional untuk serviceability, slot reservation, history,
  outbox, notification, idempotency, serta own-order RLS.
- M3 Admin Order Operation: mobile-ready operations dashboard, order queue/detail,
  confirm/reject/schedule/cancel, assigned pickup start/arrive/complete, outlet
  receive, bag/condition verification, dan private pickup-proof boundary.
- Append-only M3 migrations untuk documented states, lifecycle timestamps,
  pickup task, bag/condition/evidence, immutable history, command receipts,
  domain outbox, Customer notification, audit, strict RLS, dan guarded RPC.
- M4 Actual Weight + Final Invoice: mobile Admin weight/correction workflow,
  server-authoritative locked pricing, minimum charge, itemized final invoice,
  Customer/Admin canonical breakdown, idempotent command RPC, dan strict RLS.
- Append-only M4 migrations untuk `WEIGHED`/`WAITING_PAYMENT`, `actual_qty`,
  invoice/invoice items, immutable financial snapshot, lifecycle timestamps,
  history, audit, outbox, dan notifications.

### Changed

- M0 ditutup sebagai `APPROVED / COMPLETE`; M1 menjadi implementasi aktif dan
  berhenti sebelum scope M2.
- Nama environment publishable Supabase dikonsolidasikan ke
  `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Migration M0 dan M1 diterapkan ke project Supabase tertaut. M1 dinyatakan
  diterima Owner dengan caveat provider email rate limit dan keterbatasan
  custom cookie test harness yang tetap terdokumentasi.
- Migration M2 diterapkan ke project Supabase tertaut. Guarded `LIVE_M2` master
  fixture serta live serviceability/order/RLS/idempotency/capacity verification
  lulus; temporary Customer dan order fixtures dibersihkan melalui rollback.
- M2 diterima Owner setelah live verification. Kedua migration M3 diterapkan ke
  project tertaut; rollback-only live RBAC, transition, pickup/receive, record,
  safe Customer read, dan fixture-cleanup verification lulus.
- M3 diterima Owner setelah live verification. M4 menjadi milestone aktif;
  migration M4 belum diterapkan dan tidak ada payment execution atau scope M5.

### Security

- Authorization route dilaksanakan server-side dan profil privileged tidak
  dapat dibuat atau dipromosikan dari registrasi/browser flow.
- Dependency produksi lolos `npm audit --omit=dev` tanpa vulnerability.

## [1.0.0] — 2026-10-03

### Added

- Baseline lengkap 41 dokumen spesifikasi, design pack, task controls, agent rules, dan environment template.
- Alur order/pickup/receive/weight/invoice/payment/process/QC/delivery/review/complaint.
- Exception flow, RLS/RBAC, audit, event, notification, privacy live location, idempotency, pricing snapshot.
- Traceability requirement→screen→API→DB→permission→test, milestones M0–M12, DoD, release/rollback/demo controls.

### Locked

- Stack, tiga role, Midtrans Sandbox, Mapbox, Supabase, Vercel, dan batas v1 sesuai Source of Truth.

Unreleased changes harus memakai Added/Changed/Deprecated/Removed/Fixed/Security dan mereferensikan ADR/REQ.
