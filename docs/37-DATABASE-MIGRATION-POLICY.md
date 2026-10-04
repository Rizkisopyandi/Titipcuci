# 37 — Database Migration Policy

Semua perubahan schema melalui file migration versioned dan review; tidak mengedit production dashboard manual.

## Workflow

1. Tulis migration kecil, deterministic, transactional bila memungkinkan.
2. Update Database Design, RLS, types, seed, traceability dan tests.
3. Uji fresh database dan upgrade snapshot staging.
4. Review lock duration, index strategy, data backfill, compatibility/rollback.
5. Apply staging, verify counts/constraints/RLS/performance.
6. Backup production, deploy expand migration sebelum consuming code.
7. Contract/delete hanya setelah semua code lama tidak memakai field.

## Rules

Migration yang sudah dibagikan tidak diedit; buat migration baru. Nama `YYYYMMDDHHMM_description.sql`. Data backfill besar dibuat resumable/batched. `NOT NULL` baru melalui backfill + validate. Index besar gunakan teknik aman sesuai platform. Enum removal/rename memakai staged migration. Destructive change butuh ADR dan explicit approval.

Service-role policy tidak menggantikan RLS test. Migration wajib menyertakan grants/policies dan negative test.
