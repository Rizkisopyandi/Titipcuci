# AGENTS.md — Laundry Online

Instruksi ini berlaku untuk seluruh repository. Baca sebelum mengubah kode.

## Hierarki sumber kebenaran

1. `docs/00-PROJECT-SOURCE-OF-TRUTH.md` untuk scope, istilah, alur inti, dan keputusan terkunci.
2. Spesifikasi bernomor yang relevan untuk perilaku detail.
3. `docs/25-REQUIREMENT-TRACEABILITY.md` untuk bukti bahwa requirement terhubung ke UI, API, DB, izin, dan test.
4. `tasks/CURRENT-SPRINT.md` untuk pekerjaan aktif. Ide baru masuk `tasks/BACKLOG.md`, bukan langsung ke scope.

Jika dokumen bertentangan, jangan menebak. Catat di `tasks/BLOCKED.md` dan ajukan perubahan melalui `docs/23-DECISION-LOG.md`.

## Stack terkunci

- Next.js App Router + TypeScript strict
- Tailwind CSS + shadcn/ui
- Supabase PostgreSQL, Auth, Realtime, dan Storage
- Mapbox untuk peta dan marker
- Midtrans Sandbox untuk QRIS/VA
- Vercel untuk hosting aplikasi

Tidak boleh mengganti vendor atau menambah role tanpa persetujuan eksplisit.

## Peran

- `OWNER`: tata kelola, master data, admin, laporan, audit; bukan operator harian.
- `ADMIN`: operasi kantor sekaligus petugas pickup/delivery.
- `CUSTOMER`: membuat dan memantau order miliknya.

## Aturan non-negotiable

1. Jangan menciptakan flow, status, event, role, tabel, atau endpoint baru diam-diam.
2. Semua mutasi bisnis sensitif dilakukan server-side dan divalidasi dengan Zod.
3. Authorization wajib ditegakkan di server dan Supabase RLS; menyembunyikan tombol bukan authorization.
4. Customer tidak pernah dapat mengisi berat aktual, harga final, status operasional, atau status pembayaran.
5. Pembayaran hanya menjadi `PAID` melalui webhook Midtrans yang terverifikasi atau fixture test terisolasi.
6. Webhook dan mutasi retryable wajib idempotent.
7. Harga pada order/invoice memakai pricing snapshot; perubahan master harga tidak mengubah order lama.
8. Lokasi Admin dibagikan hanya pada tugas pickup/delivery aktif, kepada Customer pemilik order, lalu dihentikan dan dihapus sesuai retensi.
9. Bukti foto disimpan pada bucket privat dengan signed URL berumur pendek.
10. Setiap transisi status menghasilkan status history, domain event, notifikasi yang relevan, dan audit log bila diwajibkan katalog.
11. Migration database bersifat append-only setelah dibagikan; jangan edit schema produksi manual.
12. Jangan menyimpan service-role key atau secret Midtrans di client/log/repository.
13. Tidak boleh meninggalkan placeholder business logic, fake success, TODO kritis, atau `any` tanpa alasan terdokumentasi.

## Cara kerja agent

Sebelum coding: baca source of truth, spec terkait, traceability, lalu inspeksi implementasi saat ini. Nyatakan requirement ID yang dikerjakan dan acceptance criteria-nya. Implementasikan vertical slice terkecil yang lengkap dari UI ke DB/test; jangan membuat banyak lapisan kosong.

Sesudah coding: jalankan typecheck, lint, unit/integration test relevan, E2E untuk journey yang berubah, pemeriksaan RLS bila menyentuh data, lalu perbarui task dan traceability dengan bukti nyata. Jangan menandai selesai hanya karena build berhasil.

## Batas modul

- UI tidak menghitung harga final dan tidak memercayai role dari payload client.
- Route handler/server action memanggil service/domain layer; business rule tidak tersebar di komponen.
- Semua status, event, permission, error code, dan feature flag berasal dari konstanta terpusat.
- Integrasi vendor dibungkus adapter (`payment`, `maps`, `storage`, `notifications`) agar dapat ditest.
- Gunakan transaksi database/RPC untuk perubahan state yang harus atomik.

## Definition of Done

Sebuah item selesai hanya jika memenuhi `docs/22-DEFINITION-OF-DONE.md`, matriks traceability diperbarui, tidak merusak alur lain, dan bukti test dicatat di `tasks/DONE.md`.
