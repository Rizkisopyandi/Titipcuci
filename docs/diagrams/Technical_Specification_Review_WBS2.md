# TitipCuci — Technical Specification Review (WBS 2.1–2.11)

**Tanggal review:** 8 Oktober 2026 (WIB)  
**Dokumen:** draft review teknis untuk persetujuan penanggung jawab; tidak mengubah baseline SimpleWBS.  
**Sumber aktual:** GitHub `main` commit `a64c9af8dc00d88a7a1b54d3f92749c6fc2652e3`, Supabase `titipcuci-dev` (`uydhmkhgpeynswxkaxod`), metadata Vercel `titipcuci` (deployment `dpl_BwKYzLNssy3MyiyQiRddjaDYamjA`).  
**Sumber desain/target:** `docs/00` sampai `docs/40` di GitHub; WBS original `wbs_Laundry_Online_2026-10-08.json`.

> **Ruang lingkup:** audit desain/struktur dan pembuatan diagram. Review tidak mengeksekusi test suite repo, tidak menguji akses pengguna live, tidak memverifikasi webhook provider, dan tidak menyatakan integrasi yang baru didukung database sebagai implementasi frontend selesai.

## Executive Technical Summary

- **Arsitektur dikonfirmasi di source `main`:** Next.js 16, React 19, TypeScript 6, Supabase SSR/Auth, server API routes, Zod, Vitest, Tailwind; adaptor konfigurasi Mapbox/Midtrans; deploy Vercel CLI.
- **Database Supabase aktual:** 28 tabel `public`, 323 kolom, 47 FK termasuk referensi `profiles.id` ke `auth.users.id`; 199 constraint terdaftar, 13 tipe enum; 28/28 tabel mengaktifkan RLS, 47 policy pada 24 tabel; 49 fungsi `public`.
- **Ketidakselarasan utama:** GitHub `main` memiliki 7 migration M0–M4, sedangkan database Supabase mencatat 22 migration termasuk M5–M10 dan perubahan selanjutnya; nama migration mencantumkan versi tanggal lebih maju dari tanggal review, sehingga **versi tidak disamakan dengan tanggal pengerjaan**.
- **Vercel:** deployment `titipcuci` berstatus `READY` pada alias `titipcuci-beryl.vercel.app`, `source=cli`, metadata commit `a64c9af...` (baseline `main`). Ini bukti infrastruktur deployment, bukan smoke test lulus atau bukti fungsi M5–M10 sudah hadir pada web production.
- **Blueprint tidak sepenuhnya sama dengan DB:** `customer_preferences`, `approval_requests`, `refund_requests`, `feature_flags` disebut dalam `docs/08-DATABASE-DESIGN.md` namun tidak ditemukan pada 28 tabel `public`. Enum `order_status` aktual tidak memuat `NEEDS_CUSTOMER_APPROVAL` atau `ISSUE_REPORTED` sebagaimana tertera pada `docs/04-ORDER-STATE-MACHINE.md`.
- **Serviceability vs shipping cost:** fungsi `check_serviceability` dengan `ST_Covers` tersedia di migration M2, dipanggil melalui `GET /api/v1/serviceability`. Tidak ditemukan bukti perhitungan **biaya ongkir berbasis km** pada API `main` atau nama/fungsi SQL terpasang; perancang harus memutuskan apakah ongkir terpisah diperlukan.

## Artefak WBS 2 yang Dibuat

1. [Paket Draw.io editable (17 halaman)](TitipCuci_WBS_Diagrams.drawio)
2. [Data Dictionary lengkap 28 tabel / 323 kolom](Data_Dictionary_TitipCuci_Actual.md)
3. [Data Dictionary CSV untuk Excel/Sheets](Data_Dictionary_TitipCuci_323_Columns.csv)
4. Dokumen ini: audit traceability, selisih implementasi, dan keputusan desain yang belum tertutup.

## Matriks Review WBS 2

Status di bawah adalah status **bukti/deliverable review**, bukan pembaruan langsung kolom status SimpleWBS.

| WBS | Nama persis pada WBS asli | Artefak / evidensi | Kondisi review | Closure |
|---|---|---|---|---|
| 2.1 | Analisis Requirement BA | `docs/01-PRODUCT-REQUIREMENTS.md`, `docs/25-REQUIREMENT-TRACEABILITY.md` | Kebutuhan tertulis tersedia; mismatch blueprint-vs-DB dicatat | **Ready with findings**, perlu keputusan target scope |
| 2.2 | Perancangan System Architecture | Draw.io halaman 01, 10; `package.json`, adaptor Supabase, status Vercel | Stack aktual tergambar; koneksi vendor & CI perlu verifikasi | **Ready for design review**, jangan klaim full production |
| 2.3 | Pembuatan System Flow | Draw.io 07, 11, 17; `docs/03-MASTER-BUSINESS-FLOW.md` | Golden path dan exception ditampilkan sebagai blueprint | **Ready for design review** |
| 2.4 | Perancangan ERD | Draw.io 02–06; 47 FK PostgreSQL aktual | ERD induk & 4 ERD modul tersedia | **Ready for design review** |
| 2.5 | Perancangan Database Schema | Data Dictionary 323 kolom; enum, key, constraint, RLS | Dokumentasi implementasi database aktual tersedia | **Ready for design review** |
| 2.6 | Authentication & Role Design | Draw.io 08, 16; `docs/02`, `docs/32`; enum roles `CUSTOMER/ADMIN/OWNER`, server role mapping dan RLS | Sudah ditandai **completed** di WBS asli; audit desain mendukung, pengujian hak akses belum dilakukan pada sesi ini | **Maintain as design completed**, test di WBS 8.9 |
| 2.7 | Transaction Flow Design | Draw.io 07, 11, 13, 17; API order/pickup/weight/invoice `main` | Diagram selesai untuk target; M5–M8 perlu sinkronisasi source | **Ready with findings** |
| 2.8 | Shipping & Distance Logic Design | Draw.io 12; `GET /api/v1/serviceability`, PostGIS `ST_Covers` | Validasi area ada, definisi ongkir berbasis jarak belum disepakati/dibuktikan | **Decision required** |
| 2.9 | Payment & QRIS Flow Design | Draw.io 14; `docs/05`, `docs/12`; DB functions `prepare_payment_attempt`, `apply_midtrans_webhook` | Arsitektur target dan RPC terbaca; belum ada route payment/webhook pada GitHub `main` saat review | **Design ready / implementation gap** |
| 2.10 | Order Status & Tracking Design | Draw.io 09, 15, 17; docs `04`, `10`, `11`, enum `order_status`, `location_sessions` & RPC M7 | Desain terbaca; enum vs blueprint berbeda; reconnect/live tracking belum diuji saat review | **Ready with findings** |
| 2.11 | Technical Specification Review | Dokumen ini beserta laporan mismatch | Review dan bukti terdokumentasi; sign-off belum diberikan | **Review documented; approval pending** |

## Review Domain & Alur

### 2.1 Requirement & Scope

1. Role resmi v1 adalah **CUSTOMER, ADMIN, OWNER**. Admin sekaligus petugas pickup/delivery; tidak ada `COURIER` khusus (lihat `docs/00`, `docs/02`).
2. Target memuat auth, services/price, order, pickup/bag/condition proof, weight/invoice, QRIS/VA Midtrans Sandbox, laundry/QC, delivery proof, review/complaint, analytics, tracking, dan audit.
3. Target mencakup aktivitas yang belum hadir dalam source `main`. Pada dokumentasi tidak boleh dinyatakan selesai hanya karena schema atau RPC telah dibuat.

### 2.2 Architecture

```text
Customer / Admin / Owner Browser
       │ HTTPS
       ▼
Next.js 16 + React 19 (Vercel)
       ├─ Supabase Auth (session)
       ├─ API/Server (validation, RBAC)
       │       └─ PostgreSQL / RPC / RLS
       └─ Storage / Realtime (scope perlu verification)
Target Vendor Integrations: Midtrans Sandbox / Mapbox
```

**Batas temuan:** `lib/adapters/maps/mapbox.ts` dan `lib/adapters/payment/midtrans.ts` hanya membuktikan **konfigurasi adapter** pada `main`, bukan penyelesaian alur pembayaran atau peta end-to-end.

### 2.4–2.5 ERD & Data Dictionary

ERD harus menggunakan 28 tabel dari `public` dan relasi `profiles.id -> auth.users.id`. Relasi antar-tabel digambar hanya bila FK fisik terpasang, sedangkan `domain_outbox.aggregate_id` bukan FK eksplisit. `invoices.order_id`, `location_sessions.task_id`, dan `reviews.order_id` adalah FK yang memiliki constraint unik sehingga cardinality tidak seluruhnya 1:N. Notasi opsi / nullable dan constraint lainnya berada dalam Data Dictionary.

### 2.6 Authentication & Role Design

- Publik register sebagai CUSTOMER; role bukan berasal dari body publik.
- CUSTOMER hanya akses data sendiri, ADMIN operasi dengan penugasan, OWNER pengelolaan/oversight.
- Validasi berlapis: session Supabase Auth, `profiles.role`, ownership/assignment server guard, RLS DB.
- Aktual `public`: 28 tabel RLS enabled, tetapi hanya 24 memiliki policy terdaftar; tabel tanpa policy perlu diperiksa dalam konteks hak akses (deny by default vs service-only), **tidak otomatis dinilai cacat keamanan**.
- Test lintas peran belum dieksekusi pada sesi review; dijadwalkan di **WBS 8.9**.

### 2.7 Transaction Flow

**Terlihat di GitHub `main`:** API pemesanan Customer, konfirmasi/penolakan Admin, pickup, receiving, berat aktual, invoice. **Terpasang di database:** RPC milestone pemrosesan, pembayaran, realtime, delivery, komplain, analitik. Penyatuan keduanya ke satu aplikasi operasional tetap harus dibuktikan dari source/deploy terbaru.

### 2.8 Shipping & Distance Logic

- **Ada:** validasi koordinat, geofence polygon `service_areas.geojson` dengan PostgreSQL PostGIS `ST_Covers`, slot dan kapasitas pickup.
- **Belum terverifikasi:** jarak perjalanan jalan, waktu tempuh, formula biaya antar-jemput, biaya per-km, minimum ongkir, provider routing; adaptor Mapbox di `main` hanya membaca token.
- **Keputusan bisnis yang diperlukan:** Apakah v1 memang menetapkan ongkir (a) gratis/termasuk tarif laundry, (b) tetap per zona, atau (c) dihitung per km? Jangan menerapkan formula tanpa persetujuan.
- **Rekomendasi spesifikasi:** jika v1 hanya melayani area polygon, tetap beri nama tepat “Serviceability & Pickup Slot Validation”, jangan mengklaim “Shipping Distance Fee Calculation”.

### 2.9 Payment & QRIS Flow

**Target diagram:** Invoice ISSUED → create payment attempt server → Midtrans Sandbox QRIS/VA → notifikasi webhook → verifikasi signature/amount/order ID → transaksi atomik update payment/invoice/order/history → idempotent response. Hanya webhook tervalidasi yang berhak mengubah `PAID`.

- Supabase terpasang: `payments`, `payment_events`, `payment_status`, `prepare_payment_attempt`, `activate_midtrans_payment`, `apply_midtrans_webhook`.
- Source `main` ditemukan: adapter `getMidtransConfiguration()`, invoice endpoint, **tidak ditemukan `/api/v1/webhooks/midtrans` maupun route `payment-attempts`** pada tree saat review.
- Status: desain terdokumentasi, belum membuktikan e2e provider payment; lanjutkan audit implementasi terbaru pada WBS 4/6/8.

### 2.10 Order Status & Tracking

- Enum `order_status` database aktual memuat 21 state termasuk `DELIVERY_ON_THE_WAY`, `DELIVERED`, `COMPLETED`, `PAYMENT_EXPIRED`, `ON_HOLD`, `DELAYED`, `REPROCESSING`.
- Blueprint `docs/04` memuat `NEEDS_CUSTOMER_APPROVAL` dan `ISSUE_REPORTED`; dua state tersebut tidak ditemukan pada enum aktif.
- DB mempunyai `location_sessions` dan fungsi `admin_start_task_location_session`, `admin_accept_task_location`, `admin_stop_task_location_session`. Source `main` tidak memuat API `/track`, `/location`, atau delivery endpoint.
- Rancangan realtime mensyaratkan scoped private channel, stop-on-complete, no permanent route history, reconnect snapshot, unauthorized subscribe denial. Testing aktif dipetakan ke WBS 8.6/8.9.

## Daftar Findings dan Tindakan

| ID | Severity | Temuan | Tindakan perlu disetujui / diverifikasi | PIC peran | Status |
|---|---|---|---|---|---|
| TS-01 | HIGH | GitHub `main` M0–M4; Supabase memiliki migration M5–M10+ | Identifikasi branch/commit source terbaru, cocokkan deployment dan migration history | Programmer | OPEN |
| TS-02 | HIGH | Vercel READY deployment CLI dari commit baseline; feature verification production belum ada | Periksa production env names, health, auth, release smoke (tanpa ekspor secrets) | DevOps/QA | OPEN |
| TS-03 | HIGH | Blueprint DB memasukkan 4 tabel yang tidak terpasang | Tentukan *deferred scope* vs migration kebutuhan; perbarui blueprint/RTM | BA / System Analyst | OPEN |
| TS-04 | HIGH | Blueprint memiliki 2 state yang tidak tersedia di enum DB | Koreksi blueprint/state machine atau rencanakan change/migration | BA / Programmer | OPEN |
| TS-05 | MEDIUM | Kontrak ongkir / distance belum terbukti | Putuskan aturan ongkir versi pertama dan metode kalkulasi bila memang dibutuhkan | PM / Client | DECISION |
| TS-06 | HIGH | Fungsi Midtrans tersedia di database tetapi route API belum terlihat di `main` | Temukan code branch yang implement M5, audit webhook, test signature, idempotency | Programmer / QA | OPEN |
| TS-07 | MEDIUM | Realtime M7 ada DB namun source route UI terbaru belum diverifikasi | Audit subscription auth, reconnect, stale GPS, stop sharing | Programmer / QA | OPEN |
| TS-08 | MEDIUM | Database M8–M10 ada, sumber aplikasi `main` belum menampilkan modulnya | Lakukan code-reality check untuk delivery, complaint, owner analytics | Programmer | OPEN |
| TS-09 | MEDIUM | RLS aktif pada 28 tabel, policy hanya pada 24 | Review 4 tabel lain sebagai service-only / deny-by-default, jalankan cross-role tests | QA / Programmer | OPEN |
| TS-10 | MEDIUM | Dokumentasi diagram perlu sign-off | Penanggung jawab menyetujui/menolak review ini sebelum status final | PM / Client | PENDING APPROVAL |

## Test Design untuk WBS 7–9 (BELUM DIEKSEKUSI)

| Skenario | Jenis | WBS tindak lanjut |
|---|---|---|
| Registrasi role CUSTOMER, ADMIN/OWNER ditolak dari registrasi publik | Security / Integration | 7.3, 8.1, 8.9 |
| Customer A tidak dapat membaca Order Customer B | Security RLS | 8.9 |
| Koordinat di luar polygon ditolak; titik batas polygon teruji | Functional / Geospatial | 8.2, 8.3 |
| Dua pelanggan memesan slot terakhir serentak tanpa oversubscription | Concurrency | 8.2, 8.11 |
| Retry create order dengan Idempotency-Key sama tidak membuat duplikat | Integration | 8.2, 8.11 |
| Input berat aktual dan invoice final dihitung server, versi order dijaga | Functional | 8.2, 8.7 |
| Webhook Midtrans invalid/duplikat/out-of-order tidak menandai PAID | Payment / Security | 8.4, 8.5 |
| Pelacakan hanya aktif untuk order/customer sesuai assignment | Realtime / Security | 8.6, 8.9 |
| Tracking reconnect, inaccurate/stale GPS, auto-stop saat selesai | Realtime | 8.6, 8.11 |
| QC gagal → reprocess → QC berhasil, histori tidak tertimpa | Functional | 8.7 |
| Delivery gagal tidak ditandai delivered; proof wajib | Functional / Edge | 8.7, 8.11 |
| Owner dashboard hanya menampilkan KPI berizin | Role & Functional | 8.8, 8.9 |

## Aturan Penutupan WBS 2

1. **Dokumentasi dapat dinyatakan “ready for review”** untuk WBS 2.1–2.7, 2.9–2.10 berdasarkan artefak yang telah disusun; beberapa memiliki temuan terbuka.
2. **WBS 2.8 tidak dapat ditutup final** tanpa konfirmasi apakah shipping distance fee diperlukan. Jika tidak, ubah deskripsi/acceptance menjadi geofence & kapasitas pickup.
3. **WBS 2.11 masih memerlukan approval.** Review boleh dicatat selesai dilaksanakan, tetapi persetujuan teknis belum diberikan.
4. WBS 2.6 yang sudah berstatus `completed` dalam file asli tidak diubah secara diam-diam.
5. **Jangan** menganggap WBS 4–10, M5–M12, production acceptance, atau hasil testing sebagai completed hanya berdasarkan tabel/RPC Supabase.
6. **Tanggal asli di SimpleWBS tidak direkayasa.** Baseline pekerjaan akademik dan waktu pembuatan artefak aktual harus dibedakan jelas.

## Bukti & Referensi

- [Source of Truth (blueprint)](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/00-PROJECT-SOURCE-OF-TRUTH.md)
- [Product Requirements](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/01-PRODUCT-REQUIREMENTS.md)
- [Business Flow](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/03-MASTER-BUSINESS-FLOW.md)
- [Order State Machine](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/04-ORDER-STATE-MACHINE.md)
- [Payment State Machine](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/05-PAYMENT-STATE-MACHINE.md)
- [Database Design Blueprint](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/08-DATABASE-DESIGN.md)
- [API Contract](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/09-API-CONTRACT.md)
- [Realtime Architecture](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/10-REALTIME-ARCHITECTURE.md)
- [Live Map Spec](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/11-LIVE-MAP-SPEC.md)
- [Payment Spec](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/12-PAYMENT-SPEC.md)
- [Access Control Matrix](https://github.com/Rizkisopyandi/Titipcuci/blob/main/docs/32-ACCESS-CONTROL-MATRIX.md)
- [Supabase project dashboard](https://supabase.com/dashboard/project/uydhmkhgpeynswxkaxod)
- [Vercel deployment alias](https://titipcuci-beryl.vercel.app/)

**Review conclusion:** **Dokumentasi WBS 2 sudah diperkaya secara substansial dan tersedia untuk review.** Closure `Completed` keseluruhan **ditahan**, terutama menunggu TS-01/03/04/05/10, tanpa menghalangi tim melanjutkan audit implementasi dan pengujian di WBS berikutnya.
