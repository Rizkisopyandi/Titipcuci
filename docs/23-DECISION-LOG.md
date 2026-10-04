# 23 — Decision Log

Format keputusan baru: `ADR-NNN | tanggal | status | konteks | keputusan | konsekuensi | docs/requirements terdampak | approver`. Jangan mengedit alasan historis; supersede dengan ADR baru.

## Baseline decisions

- **ADR-001 Accepted** — Next.js + TypeScript + Tailwind + shadcn/ui; satu web responsive mengurangi duplikasi v1.
- **ADR-002 Accepted** — Supabase menyediakan PostgreSQL/Auth/Realtime/Storage; RLS default deny.
- **ADR-003 Accepted** — Role hanya Owner, Admin, Customer; Admin merangkap pickup/delivery.
- **ADR-004 Accepted** — Order state dan payment state terpisah; sinkron melalui verified command/event.
- **ADR-005 Accepted** — Actual weight Admin-only dan pricing snapshot server-side.
- **ADR-006 Accepted** — Midtrans Sandbox QRIS/VA; payment success webhook-only.
- **ADR-007 Accepted** — Mapbox; live location ephemeral hanya pada active task.
- **ADR-008 Accepted** — Refund v1 adalah simulation ledger, bukan transfer nyata.
- **ADR-009 Accepted** — In-app notification wajib; kanal eksternal backlog.
- **ADR-010 Accepted** — Vercel hosting; environment terpisah dan migration-first deploy.
- **ADR-011 Accepted** — v1 single business/outlet context; multi-tenant/outlet backlog.
- **ADR-012 Accepted** — Bahasa UI Indonesia, IDR, display timezone Asia/Jakarta; database UTC.
