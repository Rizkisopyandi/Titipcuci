# 26 — Integration Checklist

Centang hanya setelah diverifikasi pada environment target dan catat evidence.

## Identity/data

- [ ] Register/login/reset/logout dan role redirect
- [ ] Default-deny RLS serta cross-customer denial
- [ ] Private storage/signed URL dan forbidden evidence access
- [ ] Service/price version/area/slot seed konsisten

## Journey

- [ ] Create order melakukan geofence + atomic slot reservation
- [ ] Admin confirm terlihat realtime; reschedule/cancel melepaskan kapasitas
- [ ] Start pickup membuka channel hanya pada pihak tepat; stop menutupnya
- [ ] Bag, condition, evidence, receive lengkap sebelum weight
- [ ] Actual weight Admin-only; snapshot mereproduksi invoice
- [ ] Approval branch approve/reject/timeout
- [ ] QRIS/VA sandbox; signature/amount check; duplicate safe; expiry/retry
- [ ] Processing stage, delay/hold, QC fail/reprocess/pass
- [ ] Delivery live tracking, failed attempt, proof, complete
- [ ] Review eligibility dan complaint evidence/resolution/refund simulation

## Cross-cutting/release

- [ ] Setiap critical command: history + audit + event + notification sesuai katalog
- [ ] Realtime reconnect fetches canonical snapshot
- [ ] Owner KPI cocok dengan query fixture
- [ ] Logs redacted, alert/health/cron terlihat
- [ ] Full test, mobile/browser/a11y, migration, deploy, rollback, demo rehearsal
