# 20 — Deployment

## Environments

Local, Preview/CI, Staging, Production dengan proyek Supabase, key, Mapbox restriction, dan Midtrans environment terpisah. Blueprint memulai Sandbox; production payment memerlukan readiness review tersendiri.

## Vercel pipeline

Install locked dependencies → lint/typecheck/test → Next.js build → migration check → deploy Preview. Promotion production memerlukan approval, migration staging sukses, release checklist, dan backup. Environment secret dikelola Vercel/Supabase, bukan `.env` commit.

## Order deploy

1. Backup/restore point dan cek observability.
2. Terapkan backward-compatible migration.
3. Deploy code yang dapat membaca old/new schema.
4. Jalankan smoke/health/RLS checks.
5. Aktifkan flag bertahap.
6. Hapus compatibility hanya pada release berikutnya.

## Webhook dan cron

URL HTTPS stabil `/api/v1/webhooks/midtrans`; signature wajib. Cron expiry/reconciliation/auto-complete dilindungi `CRON_SECRET`, idempotent, timezone-aware, dan dapat diobservasi.

## Observability

Structured logs dengan request/correlation ID; metrics error rate, latency, webhook failures, payment mismatch, outbox lag, realtime reconnect, overdue task/complaint. Alert tidak memuat PII.

## Smoke tests

Auth per role, service read, create demo order, unauthorized denial, map token, private upload signed access, sandbox webhook, realtime subscription, health endpoint, no secret in bundle.

Rollback: [Rollback Plan](36-ROLLBACK-PLAN.md); full gate: [Release Checklist](35-RELEASE-CHECKLIST.md).
