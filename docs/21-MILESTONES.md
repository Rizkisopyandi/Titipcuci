# 21 — Milestones M0–M12

Setiap milestone adalah vertical slice dan harus lolos [Definition of Done](22-DEFINITION-OF-DONE.md). Tidak mulai milestone bergantung sebelum exit criteria terpenuhi.

| ID  | Hasil                                                                                          | Exit criteria utama                                           |
| --- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| M0  | Foundation: Next.js strict, Tailwind/shadcn, Supabase clients, env validation, CI, base layout | build/lint/typecheck/test; no secret client; health page      |
| M1  | Auth + profile + RBAC/RLS                                                                      | register/login/reset, role routes, default-deny RLS suite     |
| M2  | Service, address, Mapbox pin, serviceability, slot, create order                               | concurrency-safe reservation; Customer sees own order only    |
| M3  | Admin confirm, assignment, pickup, bag/condition/proof, receive                                | full pickup slice + audit/notification; exceptions tested     |
| M4  | Actual weight, pricing snapshot, approval, invoice                                             | reproducible total; Admin-only weight; immutable paid invoice |
| M5  | Midtrans Sandbox QRIS/VA, expiry, webhook, reconciliation, refund simulation                   | forged/duplicate/out-of-order tests; paid only by webhook     |
| M6  | Processing stages, delay/hold, QC/reprocess                                                    | ordered stages; QC checklist and repeat loop                  |
| M7  | Realtime status + live pickup/delivery map                                                     | scoped private channels, reconnect, auto-stop/retention       |
| M8  | Ready, delivery, failed attempt, proof, completed, review                                      | delivery proof required; notification/history complete        |
| M9  | Complaint/evidence/SLA/resolution/re-clean/refund link                                         | end-to-end complaint with privacy/access tests                |
| M10 | Owner KPI/report/admin/master/flags/audit                                                      | formulas tested; least privilege; drill-down traceable        |
| M11 | UX polish, responsive, accessibility, motion, all empty/error/loading states                   | mobile/browser/reduced-motion/AA audit                        |
| M12 | Full test/security/performance, seed, demo rehearsal, deploy/rollback                          | release checklist green and presentation reproducible         |

## Status implementasi

- `M0` — **APPROVED / COMPLETE** oleh Owner (2026-10-03).
  Bukti otomatis: format, lint, strict typecheck, 7 unit/security tests, dan
  production build hijau. QA render lokal dilakukan pada Edge headless untuk
  desktop, mobile 390 px, dan halaman health. Kredensial vendor sengaja belum
  dikonfigurasi; health hanya melaporkan status konfigurasi tanpa nilai secret.
- `M1` — **ACCEPTED WITH DOCUMENTED CAVEATS** oleh Owner (2026-10-04): migration remote,
  profile trigger, role enforcement, Supabase login/session, own/cross-user
  RLS, denial role update, anonymous route protection, dan fixture cleanup
  terverifikasi live. Verifikasi email public signup terhalang provider rate
  limit; verifikasi authenticated Customer `/app` terhalang custom cookie test
  harness, bukan kegagalan authorization yang teramati.
- `M2` — **ACCEPTED / LIVE VERIFIED**: Customer Order untuk
  layanan, alamat/pin, serviceability, slot, preferensi, estimasi sementara,
  serta daftar/detail milik Customer. Migration M2, guarded non-production
  master data, live RPC/status/estimate, own/cross-customer RLS, direct-write
  denial, idempotency, capacity conflict, dan fixture cleanup lulus pada project
  tertaut. Owner menerima M2 sebelum M3 dimulai.
- `M3` — **ACCEPTED / LIVE VERIFIED**: Admin dashboard, queue,
  detail dan guarded command dari confirm sampai outlet receive; assigned-Admin
  pickup start/arrive/complete; bag, kondisi, private proof metadata; immutable
  history, timestamps, outbox, notification, audit, dan scoped RLS. Kedua
  migration M3 diterapkan ke project tertaut; rollback-only live verification
  untuk RBAC, full pickup/receive flow, records, Customer safe read, dan cleanup
  lulus. Focused M3 tests 15/15, full suite 68/68, lint, strict typecheck, format,
  dan production build lulus. Owner menerima M3 sebelum M4 dimulai.
- `M4` — **LOCAL VERIFIED / READY FOR OWNER CODE ACCEPTANCE**: Admin-only actual
  quantity, audited pre-invoice correction, locked pricing/minimum calculation,
  immutable itemized invoice snapshot, dan Customer/Admin canonical read hingga
  `WAITING_PAYMENT`. Focused M4 tests 17/17, full suite 85/85, format, lint,
  strict typecheck, dan production build lulus. Kedua migration M4 belum
  dideploy. Tidak mencakup payment attempt, Midtrans, `PAID`, atau scope M5.
- `M5`–`M12` — belum dimulai.

## Planning rule

Setiap milestone dimulai dengan requirement IDs, migration/API/UI/test plan dan diakhiri dengan traceability evidence. Feature flag boleh menyembunyikan incomplete feature, tetapi incomplete code tidak dianggap selesai.
