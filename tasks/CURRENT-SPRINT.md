# Current Sprint

Status: `M4 — Actual Weight + Final Invoice` **LOCAL VERIFIED / READY FOR OWNER
CODE ACCEPTANCE**. M3 telah diterima dan terverifikasi live; M1 caveat tetap tercatat di
`BLOCKED.md`.

## Active: M4 Actual Weight + Final Invoice

- [x] `M4-01` Admin-only actual quantity entry pada `RECEIVED`, correction pada
  `WEIGHED` dengan reason, server validation, CAS, dan idempotency; `REQ-WGT-001`.
- [x] `M4-02` Server pricing dari actual quantity dan locked service/price
  snapshot dengan minimum charge; `REQ-INV-001`.
- [x] `M4-03` Transactional invoice + item breakdown dan immutable financial
  snapshot; `API-INV-001`.
- [x] `M4-04` Guarded `RECEIVED → WEIGHED → WAITING_PAYMENT`, history,
  timestamps, audit, outbox, dan notification.
- [x] `M4-05` Customer/Admin canonical weight and invoice detail with strict
  ownership/RBAC RLS.
- [x] `M4-06` Focused validation, pricing, immutability, idempotency, transition,
  and security tests.
- [x] `M4-07` Final quality gates and Owner code-acceptance handoff.

## Acceptance criteria

- Client hanya mengirim order item ID, actual quantity, expected version,
  idempotency key, dan optional correction reason; total/price/snapshot ditolak.
- Active Admin saja yang dapat mencatat berat atau menerbitkan invoice; Customer
  tidak memiliki RPC maupun direct table mutation.
- Semua order item wajib memiliki actual quantity positif dengan presisi dua
  desimal sebelum invoice dapat dibuat.
- Server memakai `priceVersionId`, unit price, dan minimum charge yang terkunci
  pada service snapshot order; subtotal memakai `max(minimum, unitPrice × qty)`.
- Karena belum ada aturan diskon/surcharge/tax terukur, ketiganya disnapshot nol;
  formula dan setiap item tetap direkam agar total dapat direproduksi.
- Satu order hanya memiliki satu invoice; financial snapshot dan invoice items
  immutable, retry key mengembalikan hasil awal, duplicate/skipped state ditolak.
- M4 berhenti di `WAITING_PAYMENT`; tidak membuat payment attempt dan tidak
  pernah menandai invoice/order `PAID`.

## Delivery record

- Owner: Codex (implementation); Owner/Product code acceptance setelah handoff.
- Branch/PR: tidak tersedia; direktori bukan Git worktree.
- Started: 2026-10-06.
- Migrations: `20261006000100_m4_order_states.sql` dan
  `20261006000200_m4_weight_invoice.sql`; M0–M3 tidak diubah.
- Automated evidence: format dan lint lulus; strict typecheck lulus setelah satu
  local typing correction; focused M4 tests 17/17; full suite 85/85; production
  build lulus.
- Deployment: belum dijalankan; M4 migration dan live verification berada di
  luar code-implementation request ini.

Setiap item yang selesai wajib mencatat evidence aktual. Blocker eksternal dicatat
di `BLOCKED.md`; safe local implementation dan static verification tetap berjalan.
