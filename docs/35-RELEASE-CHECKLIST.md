# 35 — Release Checklist

## Governance

- [ ] Scope/version/changelog/ADR/traceability disetujui
- [ ] Semua milestone target memenuhi DoD; known risk memiliki owner

## Security/data

- [ ] Env terpisah, secret rotated/restricted, tidak ada secret dalam bundle/log/git
- [ ] Migration staging + backup/restore + RLS/storage tests hijau
- [ ] Data retention/privacy/location behavior diverifikasi
- [ ] Dependency/security/upload/webhook/rate-limit review selesai

## Functional/integration

- [ ] Golden path dan exception suite hijau
- [ ] Midtrans Sandbox QRIS/VA webhook/reconciliation
- [ ] Mapbox pin + live tracking scope/stop/reconnect
- [ ] Audit/event/notification/KPI konsisten

## Quality/operations

- [ ] lint/typecheck/build/full tests; a11y/performance/mobile/Chrome/Edge/Safari target
- [ ] Logs, metrics, alerts, health, cron, correlation ID
- [ ] Seed/demo account dan presentasi direhearsal
- [ ] Vercel domain/HTTPS/CSP/callback/webhook URL benar
- [ ] Rollback owner, trigger, command/runbook, dan verification siap

Sign-off: Engineering, Product/Owner, QA/Security reviewer; catat environment, commit, migration version, waktu, dan evidence links.
