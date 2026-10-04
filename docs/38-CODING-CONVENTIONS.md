# 38 — Coding Conventions

## TypeScript/Next.js

Strict mode; prefer narrow domain types, discriminated unions, `unknown` + parsing. `any` hanya dengan komentar/issue. Server Component default; Client Component hanya untuk interaksi/browser API. Route/server action tipis, memanggil domain service. Gunakan `server-only` pada secret adapters.

## Structure

Rekomendasi: `app/` routes; `features/{domain}/` UI/actions/schemas; `lib/domain/` rules; `lib/adapters/` Supabase/Mapbox/Midtrans; `lib/auth/`; `lib/observability/`; `supabase/migrations`; `tests/`. Hindari mega `utils` dan cross-feature import melingkar.

## Naming dan errors

Components PascalCase, functions/variables camelCase, DB snake_case, constants/event/status UPPER_SNAKE. Uang tidak memakai float. Tanggal ISO/Temporal-friendly. Expected failure memakai typed error catalog; unexpected error dibungkus dengan correlation ID.

## Data/mutation

Zod schema shared pada boundary, tetapi server revalidates. Tidak ada arbitrary client DB mutation untuk domain sensitif. Repository query memilih kolom minimum. Pricing/permission/state transition satu implementation. Side effect melalui outbox/adapter dan idempotency.

## Tests/docs

Test behavior, negative path, concurrency, role isolation. Nama test menyertakan REQ/TST bila kritis. Public contract dan surprising invariant didokumentasi; komentar menjelaskan alasan, bukan mengulang kode.
