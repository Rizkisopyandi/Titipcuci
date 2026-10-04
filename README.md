# Laundry Online — Project Blueprint

Paket ini adalah kontrak implementasi untuk aplikasi laundry pickup–delivery berbasis web. Tujuannya memberi AI coding agent dan tim manusia satu bahasa yang sama, mencegah scope drift, serta memastikan alur utama dan kegagalan diuji end-to-end.

## Quick start untuk implementor

1. Baca [`AGENTS.md`](AGENTS.md).
2. Kunci pemahaman di [`docs/00-PROJECT-SOURCE-OF-TRUTH.md`](docs/00-PROJECT-SOURCE-OF-TRUTH.md).
3. Pilih milestone dari [`docs/21-MILESTONES.md`](docs/21-MILESTONES.md).
4. Ambil item siap kerja dari [`tasks/CURRENT-SPRINT.md`](tasks/CURRENT-SPRINT.md).
5. Ikuti mapping di [`docs/25-REQUIREMENT-TRACEABILITY.md`](docs/25-REQUIREMENT-TRACEABILITY.md).
6. Terapkan gate [`docs/22-DEFINITION-OF-DONE.md`](docs/22-DEFINITION-OF-DONE.md).

## Menjalankan aplikasi

```sh
npm install
npm run dev
```

Quality gate lokal:

```sh
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run build
```

Halaman utama tersedia di `/`, status fondasi di `/health`, dan health JSON di
`/api/health`. M1 menambahkan `/login`, `/register`, `/forgot-password`,
`/reset-password`, serta shell terlindungi `/app`, `/admin`, dan `/owner`.
Salin nama variable dari `.env.example`; auth live memerlukan
`NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Produk dalam satu kalimat

Customer memesan laundry, Admin menjemput dan memprosesnya secara transparan, pembayaran dikonfirmasi aman melalui webhook, lalu order diantar kembali dengan pelacakan aktif dan bukti serah terima; Owner mengawasi bisnis tanpa mengambil alih operasi rutin.

## Alur inti terkunci

`ORDER → CONFIRM → PICKUP → VERIFY BAG/CONDITION → RECEIVE → ACTUAL WEIGHT → FINAL INVOICE → VERIFIED PAYMENT → PROCESSING → QC/REPROCESS → READY → DELIVERY → PROOF → COMPLETED → REVIEW/COMPLAINT`

Cabang resmi: serviceability/slot rejection, reschedule/cancel, delayed/on-hold, needs-customer-approval, expired/failed payment, refund simulation, QC reprocess, failed delivery, dan complaint resolution.

## Peta dokumen

- `docs/00–07`: scope, role, flow, state, fitur, layar.
- `docs/08–15`: data, API, realtime, map, payment, notification, complaint, security.
- `docs/16–24`: desain, exception, test, seed, deploy, milestone, DoD, keputusan, perubahan.
- `docs/25–40`: traceability dan kontrol implementasi/release.
- `design/`: arahan visual, screen flow, asset, motion, komponen.
- `tasks/`: papan kerja yang boleh diperbarui selama delivery.
- `scripts/README.md`: kontrak script automation yang harus dibuat bersama kode.

## Konvensi identitas

- Requirement: `REQ-{DOMAIN}-{NNN}`.
- Screen: `SCR-{ROLE}-{NNN}`.
- API: `API-{DOMAIN}-{NNN}`.
- Test: `TST-{LEVEL}-{DOMAIN}-{NNN}`.
- Event: uppercase snake case, sesuai event catalog.
- Semua waktu UTC di database dan Asia/Jakarta di UI.

## Status implementasi

Versi blueprint: `1.0.0`. Fondasi M0 telah disetujui. M1 Authentication + RBAC
telah diverifikasi live dan siap untuk Owner Acceptance dengan caveat provider
email rate limit serta authenticated-route test harness. Order, pembayaran,
map tracking, dan business logic M2+ belum
diimplementasikan. Semua kredensial, tarif, area layanan, kapasitas slot, dan
kebijakan refund yang ada adalah sandbox/demo dan harus ditinjau sebelum
produksi.
