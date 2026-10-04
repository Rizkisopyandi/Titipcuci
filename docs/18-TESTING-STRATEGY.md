# 18 — Testing Strategy

## Pyramid dan ownership

- Unit: pricing, state transition, permission predicates, status normalization, validation, KPI formulas.
- Integration: repository/RPC transaction, RLS, slot concurrency, invoice snapshot, webhook signature/idempotency/out-of-order, storage policy, outbox.
- Component: form/state/error/accessibility.
- E2E: role journey pada seeded environment dengan vendor sandbox/stub terkontrol.
- Manual: responsive, geolocation/device permission, Mapbox usability, Midtrans sandbox UI, reduced motion, browser matrix.

## Critical suites

- `TST-E2E-ORD-001` create→confirm with serviceability/capacity.
- `TST-E2E-PUP-001` pickup tracking→bag/condition→receive; unauthorized location rejected and auto-stop verified.
- `TST-INT-INV-001` weight→reproducible pricing snapshot→invoice.
- `TST-INT-PAY-001` valid webhook paid once; invalid signature/amount, duplicate, and out-of-order rejected/no-op.
- `TST-E2E-PRC-001` processing→QC fail→reprocess→pass.
- `TST-E2E-DLV-001` delivery tracking→proof→complete.
- `TST-E2E-CMP-001` complaint→evidence→resolution/refund simulation.
- `TST-SEC-RLS-001` role/resource matrix deny/allow.
- `TST-E2E-EXC-001` cancel/reschedule/delay/on-hold/approval/expiry recovery.

## Quality gates

PR: format, lint, strict typecheck, unit, affected integration, migration lint, build. Merge milestone: all relevant E2E, RLS suite, accessibility smoke. Release: full suite, seed reset, demo rehearsal, manual browser/mobile, security checklist, backup/rollback rehearsal.

## Test rules

Tidak memakai production data/key. Waktu, UUID, webhook, geolocation, dan vendor di-inject/mock pada unit; minimal satu sandbox path diuji. Test harus deterministic dan membersihkan data. Snapshot visual tidak menggantikan assertions perilaku. Flaky test diperbaiki atau dikarantina dengan owner/deadline, bukan diabaikan.

Coverage target: domain/security/payment ≥90% branch; keseluruhan critical modules ≥80%. Coverage bukan pengganti traceability.
