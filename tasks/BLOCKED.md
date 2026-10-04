# Blocked

## M1-PROVIDER-RATE-001 — BLOCKED BY PROVIDER RATE LIMIT

- Related: public Customer signup email verification; 2026-10-04.
- Fakta: Supabase hosted email mengembalikan
  `over_email_send_rate_limit`. Tidak ada indikasi kegagalan trigger atau RLS.
- Dampak: satu public signup + email confirmation end-to-end perlu diulang
  setelah quota pulih atau custom SMTP sandbox tersedia.
- Safe evidence: controlled Customer fixtures membuktikan Auth user, automatic
  profile, forced `CUSTOMER`, metadata tampering denial, login/session, dan RLS.

## M1-ROUTE-HARNESS-001 — BLOCKED BY TEST HARNESS

- Related: authenticated Customer access ke `/app`; 2026-10-04.
- Fakta: Supabase session dan SSR cookie dapat dipulihkan oleh client SSR baru,
  tetapi custom HTTP cookie harness tidak mereproduksi cookie request aplikasi.
- Dampak: bukti live Customer `/app` belum diklaim. Anonymous redirect untuk
  `/app`, `/admin`, `/owner` lulus; role matrix dan server guard tests hijau.
- Safe work: tidak ada perubahan authorization M1; ulangi dengan browser E2E
  resmi pada milestone QA berikutnya atau setelah harness resmi tersedia.

## Blocker template

- ID dan related task/REQ
- Tanggal/owner
- Fakta dan bukti error
- Dampak/scope yang berhenti
- Checks/alternatif yang sudah dicoba
- Keputusan/akses yang dibutuhkan dan dari siapa
- Safe work yang masih dapat dilanjutkan
- Next review date

Jangan menyebut pekerjaan “blocked” hanya karena sulit; harus ada dependency/decision eksternal nyata.
