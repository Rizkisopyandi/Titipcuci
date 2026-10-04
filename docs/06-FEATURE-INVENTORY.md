# 06 — Feature Inventory

Daftar ini membatasi v1; fitur yang tidak ada masuk backlog.

| Domain          | V1                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------- |
| Auth/Profile    | register Customer, login/logout, reset password, role routing, profile, disable account            |
| Service         | service catalog, active/versioned price, duration, minimum charge                                  |
| Location        | saved address, Mapbox pin, serviceability, delivery notes                                          |
| Slot            | pickup slot, capacity, atomic reservation, reschedule/release                                      |
| Order           | create, confirm/reject, status timeline, cancel/reschedule, delay/on-hold/approval                 |
| Pickup          | assignment, live map, ETA display, arrive, proof, bag ID/count, condition/evidence                 |
| Receive/Weight  | outlet receive, admin actual weight, correction audit, pricing snapshot                            |
| Invoice/Payment | itemized invoice, QRIS/VA sandbox, expiry, webhook, idempotency, reconciliation, refund simulation |
| Processing/QC   | stages, timestamp, checklist, pass, reprocess                                                      |
| Delivery        | assignment, live map, failed attempt, handover/contactless proof, completion                       |
| Engagement      | in-app notification, history, review                                                               |
| Support         | complaint, evidence, conversation events, SLA, resolution, re-clean/refund link                    |
| Governance      | Owner KPI, reports, Admin management, audit, feature flag                                          |
| Platform        | RLS, private storage, realtime reconnect, logs, migration, seed, test, deploy/rollback             |

## Explicit backlog

Dedicated courier role/app, multi-outlet, multi-tenant, promo/loyalty, subscription, route optimization, production refunds, WhatsApp/SMS, push notification, chat realtime, inventory/POS, IoT scale, dynamic pricing, multilingual UI.

Lihat [Screen Inventory](07-SCREEN-INVENTORY.md) untuk permukaan UI dan [Traceability](25-REQUIREMENT-TRACEABILITY.md) untuk ketercakupan.
