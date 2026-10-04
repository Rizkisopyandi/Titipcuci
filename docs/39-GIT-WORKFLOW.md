# 39 — Git Workflow

Branch utama `main` selalu deployable; gunakan short-lived `feat/REQ-ORD-001-create-order`, `fix/PAY-003-webhook-amount`, `docs/ADR-013-*`. Jika tim memilih `develop`, keputusan harus konsisten; baseline merekomendasikan trunk-based dengan Preview deploy.

Commit Conventional Commits: `feat(order): reserve pickup slot atomically`, `fix(payment): ignore duplicate webhook`, `test(rls): deny cross-customer evidence`, `docs(flow): record approval timeout`.

## PR minimum

Tujuan + requirement IDs; perubahan UI/API/DB/RLS; migration impact; tests/evidence; screenshots untuk UI; security/privacy/payment/location impact; rollout/flag/rollback; docs/task/traceability updates.

Satu PR fokus, reviewable, tanpa generated secret/binary besar. Merge setelah required checks/review; squash bila history lokal tidak bernilai. Hotfix tetap PR dan dilanjutkan regression test/postmortem.
