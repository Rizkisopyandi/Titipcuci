# 22 — Definition of Done

Item/milestone hanya **DONE** bila semua yang relevan terpenuhi dan buktinya dicatat.

## Requirement dan desain

- Requirement ID, acceptance criteria, in/out-of-scope jelas; tidak ada konflik source of truth.
- Screen/API/DB/permission/test mapping terisi; UX mencakup loading, empty, success, validation, unauthorized, offline/vendor failure.
- Copy Bahasa Indonesia final dan accessible; mobile/responsive/reduced motion diverifikasi.

## Implementasi

- TypeScript strict, no undocumented `any`, no duplicated business rule/magic status.
- Server validation + authorization + RLS; transaction/idempotency/concurrency sesuai risiko.
- Migration, indexes, constraints, rollback/forward strategy dan docs diperbarui.
- Audit/event/notification/observability sesuai katalog; secret/PII tidak bocor.
- Tidak ada placeholder/fake success/TODO kritis/dead code.

## Verifikasi

- Format, lint, typecheck, build hijau.
- Unit/integration/E2E/security/RLS test relevan hijau; negative paths dan retry diuji.
- Manual visual QA mobile+desktop dan browser target; external sandbox/device check dicatat terpisah.
- Performance/accessibility target relevan lolos; regression suite tidak rusak.

## Handoff

- Traceability dan checklist integration diperbarui dengan commit/test evidence.
- Task berpindah ke DONE berisi tanggal, actor, scope, bukti, residual risk.
- Changelog/decision log/API/schema/demo/runbook diperbarui bila terdampak.
- Reviewer menyetujui; untuk milestone/release, Product/Owner acceptance dan release checklist juga wajib.

“Berfungsi di mesin saya”, build sukses, atau UI terlihat selesai tidak cukup.
