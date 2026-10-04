# 02 — User Roles & Permissions

Authorization adalah kombinasi Supabase Auth, `profiles.role`, assignment, ownership, server guard, dan RLS. Role dari request body/cookie non-terverifikasi tidak dipercaya.

## Customer

Dapat mengelola profil/alamat/preferensi sendiri; membuat order; melihat order, invoice, payment, bukti, dan timeline miliknya; approve/reject permintaan; reschedule/cancel sesuai policy; membayar; melihat live location task miliknya yang aktif; review/complaint.

Tidak dapat melihat data customer lain, mengubah berat/harga/status, mem-publish lokasi Admin, menandai paid, membaca catatan internal/audit global, atau mengakses bukti privat tanpa scoped signed URL.

## Admin

Dapat melihat dan mengoperasikan order; confirm/reject; assignment pickup/delivery; publish lokasinya pada task aktif; verifikasi tas/kondisi; input berat; membuat invoice via server; memproses dan QC; mengunggah bukti; menangani complaint; melihat payment status.

Tidak dapat membuat/menonaktifkan Admin, mengubah role, menghapus audit, menetapkan paid manual, melihat secret vendor, atau menjalankan refund tanpa policy/approval yang ditetapkan.

## Owner

Dapat mengelola Admin, service, price version, area/slot capacity, feature flag, laporan/KPI, audit, payment/complaint oversight, serta approve refund simulation. Owner read-only terhadap langkah operasional order kecuali tindakan tata kelola yang eksplisit. Gunakan break-glass terpisah bila di masa depan dibutuhkan; bukan v1.

## Contextual permissions

- `own`: resource memiliki `customer_id = auth.uid()`.
- `assigned`: task memiliki `assigned_admin_id = auth.uid()`.
- `active_tracking`: task type sesuai, state `ON_THE_WAY`, dan order belum picked-up/delivered.
- `mutable_order`: versi row cocok dan state mengizinkan command.
- `within_window`: waktu server masih dalam cancel/reschedule/review/complaint policy.

## Lifecycle akun

Registrasi publik hanya membuat Customer. Owner awal dibuat lewat seed aman; Owner membuat/menonaktifkan Admin. Disable mencabut akses baru tetapi tidak menghapus history actor. Profile deletion adalah proses terkontrol; transaksi/audit diretain sesuai kebijakan dan PII diminimalkan/anonymized bila diizinkan.

Matriks per-resource ada di [Access Control Matrix](32-ACCESS-CONTROL-MATRIX.md); kebijakan teknis di [Security & Privacy](15-SECURITY-PRIVACY.md).
