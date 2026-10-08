# TITIPCUCI — CATATAN INDUK DISKUSI, KEPUTUSAN & BUKTI PROYEK

**Jenis dokumen:** Catatan hidup (*living project record*) untuk kesinambungan diskusi akademik dan dokumentasi WBS TitipCuci / Laundry Online Antar-Jemput.  
**Penyusunan pertama:** 8 Oktober 2026 (WIB).  
**Lingkup:** Keputusan dan hasil kerja yang dapat dipulihkan dari diskusi bersama, catatan proyek terdahulu, WBS asli, audit GitHub, Supabase, Vercel, dan hasil artefak dokumentasi.  
**Sifat:** Bukan rekaman verbatim seluruh pesan; tidak menyimpan kredensial, kata sandi, token, ataupun informasi pribadi pelanggan. Riwayat chat asli tetap sumber primer untuk ucapan kata demi kata.  
**Penyimpanan:** GitHub branch dokumentasi `docs/drawio-wbs-titipcuci-20261008`; seluruh revisi berikutnya dicatat dalam riwayat commit.

> **Aturan utama:** Jangan mengubah WBS asli, database, aplikasi, atau branch `main` tanpa izin eksplisit. Pada tahap ini, yang dikerjakan adalah **observasi sistem, pembuktian status, diagram, dan laporan akademik**, bukan pemrograman ulang aplikasi.

## A. Tujuan & Posisi Pengguna

1. Proyek: **TitipCuci — sistem web laundry online dengan layanan antar-jemput**.
2. Tujuan utama percakapan: menyiapkan **laporan akademik manajemen proyek** yang kuat, sesuai dengan WBS asli, berisi diagram Draw.io, rancangan, data dictionary, hasil observasi aplikasi, penjelasan proses pengembangan, dan evaluasi berdasarkan bukti nyata.
3. **Perencanaan WBS** (tanggal, durasi, resource/PIC, risiko) boleh berupa **baseline simulasi studi kasus**, dengan penanda yang jelas. **Detail teknis** (skema, source code, fitur yang berjalan, deployment, hasil tes) harus berdasarkan bukti aktual; tidak direkayasa.
4. Pengguna menghendaki **diskusi/penyepakatan sebelum pengeditan WBS asli atau penyusunan laporan final**. Membuat berkas dokumentasi terpisah di branch khusus sudah dijalankan.
5. Kebutuhan eksplisit terbaru: **seluruh hasil diskusi tidak tercecer**; gunakan dokumen ini sebagai *single handoff record*, namun bukan pengganti chat historis verbatim.
6. Gunakan komunikasi dan laporan dalam **Bahasa Indonesia**, dengan istilah teknis Inggris sebagaimana nama WBS/source bila perlu.

## B. Koreksi Penting Tentang Sumber Pengembangan (8 Oktober 2026)

**Pernyataan terbaru dari pengguna:**
- GitHub pribadi `Rizkisopyandi/Titipcuci` **belum menjadi versi final** dan tidak harus memuat kode implementasi terbaru.
- **Teman satu tim** memiliki pengembangan aplikasi yang **lebih matang**.
- Kedua pihak menggunakan **Supabase yang sama**.
- Pengguna menyatakan bahwa **di sisi pengembangannya hanya payment yang belum finalisasi**. Detail tahap payment yang belum final (UI QRIS/VA, integrasi Midtrans, webhook/callback, atau hal lain) **belum dikonfirmasi**.
- URL publish sisi Customer diberikan: **https://titipcuci.vercel.app/login**. URL disimpan untuk rujukan dokumentasi saja; tidak ada bukti login/inspeksi penuh karena browser interaktif belum tersedia dalam sesi terkait.

**Implikasi yang mengikat:**
1. Kesenjangan GitHub pribadi vs Supabase **tidak boleh langsung disimpulkan sebagai kegagalan/bug sistem**; sumber kode implementasi terbaru mungkin ada pada repo/branch milik teman.
2. Database Supabase adalah bukti skema aktual bersama, **bukan bukti seluruh UI/API berada di GitHub pribadi**.
3. Keterangan "payment belum final" adalah **laporan progres tim dari pengguna**, bukan hasil tes otomatis. Harus dibedakan dari temuan teknis langsung.
4. Untuk laporan final, gunakan versi aplikasi yang dipakai tim sebagai sumber observasi pengalaman pengguna dan alur transaksi. Perlu bukti visual/tour aplikasi atau akses repositori pengembangan yang lebih matang.
5. Vercel yang tersedia lewat konektor milik pengguna **berbeda konteks** dengan website Customer `titipcuci.vercel.app`; pemanggilan konektor pada alamat Customer memberi 404 di scope akun yang terhubung, yang **tidak membuktikan URL Customer mati**.
6. Jangan memasukkan alamat email login uji, password, token, data pelanggan, atau screenshot yang memperlihatkan data pribadi ke repo publik. Kredensial yang pernah dikirim di chat **sengaja tidak disalin** di dokumen ini. Disarankan rotasi password yang telah terpapar di percakapan.

## C. Dokumen Dasar & Hierarki WBS

Dokumen yang pernah dibahas dan relevan:
- `wbs_Laundry_Online_2026-10-08.json` — **WBS asli terbaru**, diperlakukan sebagai baseline untuk nomor, struktur, dan status pada saat snapshot. Jangan ditimpa tanpa persetujuan.
- `wbs_Laundry_Online_FULL_2026-10-03.json` — snapshot lebih lama, berguna untuk riwayat perubahan.
- `Laporan_Full_Project_Web_Laundry_Online_Antar_Jemput.docx` — bahan laporan akademik.
- `Lampiran_Kerja_BA_Laundry_Online.pdf` — bahan BA, menyisakan beberapa keputusan bisnis seperti pembayaran, ongkir, berat, radius, dan tracking.
- `docs/00-PROJECT-SOURCE-OF-TRUTH.md`, `docs/01-PRODUCT-REQUIREMENTS.md`, `docs/02-USER-ROLES-PERMISSIONS.md`, `docs/03-MASTER-BUSINESS-FLOW.md`, `docs/04-ORDER-STATE-MACHINE.md`, `docs/05-PAYMENT-STATE-MACHINE.md`, `docs/08-DATABASE-DESIGN.md`, `docs/09-API-CONTRACT.md`, `docs/10-REALTIME-ARCHITECTURE.md`, `docs/11-LIVE-MAP-SPEC.md`, `docs/12-PAYMENT-SPEC.md`, `docs/25-REQUIREMENT-TRACEABILITY.md`, `docs/32-ACCESS-CONTROL-MATRIX.md`.

**Kelompok WBS 1–10 yang dipertahankan:**
| WBS | Kelompok | Fungsi dalam laporan |
|---|---|---|
| 1 | Business Analysis | kebutuhan stakeholder, batas scope, business rules, data requirements, RTM |
| 2 | System Analysis & Design | arsitektur, system flow, ERD, schema, auth, transaksi, ongkir, payment, tracking, review |
| 3 | UI/UX Design | design system, user flow, public, customer, admin, owner pages |
| 4 | Backend Development | logika server, API, auth, transaksi, payment, monitoring, dll. |
| 5 | Frontend Development | implementasi antarmuka sesuai role |
| 6 | System Integration | integrasi antarmuka, backend, database, vendor dan tracking |
| 7 | Quality Assurance | review requirement, test plan/case, acceptance criteria, defect classification |
| 8 | Testing | fungsi login, transaksi, ongkir, payment/callback, tracking, admin, owner, keamanan, responsif |
| 9 | UAT & Revision | uji penerimaan customer/admin/owner, revisi, final UAT, sign-off |
| 10 | Deployment & Project Closing | production setup, database/website deployment, smoke/verification, handover, dokumentasi final |

**Snapshot WBS asli (8 Okt):** Business Analysis umumnya berstatus completed; WBS 2 sebagai induk in-progress dengan tanggal endDate baseline 1 Okt 2026; WBS 2.6 sudah berstatus completed di file asli; WBS 3 berstatus in-progress. **Tanggal baseline bukan bukti tanggal penyelesaian aktual.**

**Rincian WBS 2 yang harus persis dipertahankan:**
- 2.1 Analisis Requirement BA
- 2.2 Perancangan System Architecture
- 2.3 Pembuatan System Flow
- 2.4 Perancangan ERD
- 2.5 Perancangan Database Schema
- 2.6 Authentication & Role Design
- 2.7 Transaction Flow Design
- 2.8 Shipping & Distance Logic Design
- 2.9 Payment & QRIS Flow Design
- 2.10 Order Status & Tracking Design
- 2.11 Technical Specification Review

## D. Fakta Teknis Yang Sudah Diperiksa Langsung

### D.1 Supabase bersama

- Project identifier: `titipcuci-dev`, ID `uydhmkhgpeynswxkaxod`; region `ap-southeast-1`, PostgreSQL 17.
- **28 tabel `public`, 323 kolom, 47 foreign key** (46 antartabel `public` + 1 `profiles.id → auth.users.id`).
- **28/28 tabel RLS enabled**, **47 policies pada 24 tabel**, **49 fungsi schema public**, **199 constraints**, **13 jenis enum** saat audit.
- **22 migration terdaftar** dalam snapshot audit detail. Ada nama versi bertanggal lebih maju dari 8 Oktober 2026; jangan memperlakukan angka versi sebagai bukti tanggal pengerjaan.
- `user_role` = **OWNER, ADMIN, CUSTOMER**; tidak ada peran COURIER tersendiri di blueprint v1 (Admin juga melakukan pickup/delivery).
- Area layanan: `service_areas.geojson`, `check_serviceability` memakai PostGIS `ST_Covers`. **Pengecekan layanan berdasarkan area ≠ menghitung biaya ongkir berbasis kilometer**.
- Tabel mencakup customer/profile, services/pricing, area/slot, orders/items, history, invoices/payments/events, pickup/delivery, bag/condition evidence, laundry processing/QC, location sessions, review/complaint, logs/outbox.
- Beberapa tabel yang disebut blueprint tetapi tidak ditemukan pada skema `public` yang diaudit: `customer_preferences`, `approval_requests`, `refund_requests`, `feature_flags`.
- Enum `order_status` aktual tidak memuat `NEEDS_CUSTOMER_APPROVAL` dan `ISSUE_REPORTED` meskipun tertulis pada blueprint `docs/04`. Ini adalah **perbedaan rancangan vs implementasi saat snapshot**, bukan otomatis cacat aplikasi.

### D.2 GitHub pribadi (BUKAN representasi lengkap pekerjaan teman)

- Repo: [Rizkisopyandi/Titipcuci](https://github.com/Rizkisopyandi/Titipcuci).
- GitHub `main` diperiksa pada commit `a64c9af8dc00d88a7a1b54d3f92749c6fc2652e3`.
- Stack `package.json`: Next.js 16, React 19, TypeScript 6, Supabase SSR/JS, Tailwind 4, Zod 4, Vitest.
- Tree `main` saat pemeriksaan memuat **7 file migrations M0–M4** dan **16 API routes v1**, terutama auth, services/addresses/slots/serviceability, create order, admin confirm/reject, pickup/receive, actual weight, dan invoice.
- Adapter `lib/adapters/maps/mapbox.ts` dan `lib/adapters/payment/midtrans.ts` pada `main` terutama konfigurasi vendor. Tidak ada bukti dari tree `main` terkait payment-attempt dan webhook routes.
- Fakta ini menjelaskan kondisi **repo pribadi**, bukan progres seluruh tim.
- Source of truth rancangan versi 1 berada pada `docs/00` dst.; blueprint tidak boleh disamakan dengan hasil tes produksi.

### D.3 Vercel & situs Customer

- Vercel yang bisa dibaca melalui konektor akun pengguna: project `titipcuci` (`prj_4TEcFWwEXsFez7RMK4I97rZMu2V0`), deployment `dpl_BwKYzLNssy3MyiyQiRddjaDYamjA` status READY, source CLI, menggunakan commit awal `a64c9af...`, alias `titipcuci-beryl.vercel.app`.
- Website yang disampaikan pengguna sebagai **publish customer**: [titipcuci.vercel.app/login](https://titipcuci.vercel.app/login).
- Kedua nama domain **jangan diasumsikan mengarah ke deployment sama**. Koneksi Vercel yang tersedia tidak berhasil mengambil informasi domain Customer dalam scope akun.
- Halaman Customer **belum diaudit dengan login browser secara langsung** di sesi ini. Jangan mengatakan dashboard, order, atau payment telah ditest berdasarkan alamat URL saja.
- Jangan login/merubah order/payment/data live tanpa otorisasi yang tepat, meskipun akun uji pernah disediakan.

## E. Hasil Pekerjaan Nyata — Artefak Dokumentasi yang Sudah Tercipta

Semuanya disimpan di branch **`docs/drawio-wbs-titipcuci-20261008`**, folder **`docs/diagrams/`**, terpisah dari `main`.

| No. | Artefak | Isi, manfaat, dan status |
|---|---|---|
| 1 | [TitipCuci_WBS_Diagrams.drawio](TitipCuci_WBS_Diagrams.drawio) | **17 halaman diagram editable**, berbasis skema aktual dan blueprint; masih perlu validasi visual/review terhadap aplikasi teman |
| 2 | [Data_Dictionary_TitipCuci_Actual.md](Data_Dictionary_TitipCuci_Actual.md) | 28 tabel, 323 kolom, jenis, nullability, default, PK/FK, constraints, enum, RLS |
| 3 | [Data_Dictionary_TitipCuci_323_Columns.csv](Data_Dictionary_TitipCuci_323_Columns.csv) | 323 baris atribut + header, cocok untuk Excel/Google Sheets |
| 4 | [Technical_Specification_Review_WBS2.md](Technical_Specification_Review_WBS2.md) | Hasil audit desain WBS 2, matriks status, 10 finding TS-01 sampai TS-10; **perlu dibaca dengan koreksi konteks tim pada bagian B dokumen ini** |
| 5 | [WBS2_Review_Status_Proposal.csv](WBS2_Review_Status_Proposal.csv) | Rancangan catatan/status WBS 2.1–2.11; **tidak diterapkan ke WBS asli** |
| 6 | [README_WBS2_Deliverables.md](README_WBS2_Deliverables.md) | Indeks berkas dokumentasi WBS 2 |
| 7 | **Dokumen ini** | Handoff induk seluruh keputusan, audit, koreksi, status, tautan, dan open items |

**Daftar ke-17 halaman diagram:**
1. System Architecture
2. ERD Full Database (28 Tables)
3. ERD Order & Master
4. ERD Invoice & Payment
5. ERD Pickup & Tracking
6. ERD Laundry & Complaint
7. Business Process Flow
8. Use Case Actors
9. Order State Model
10. Deployment Architecture
11. Activity Customer Order
12. Activity Shipping & Serviceability
13. Sequence Customer Order
14. Sequence QRIS Payment
15. Sequence Live Tracking
16. RBAC & Auth Diagram
17. Activity QC & Delivery

**Kualitas yang sudah diperiksa:** arsip XML Draw.io mengandung 17 halaman dan relasi ber-ID tanpa referensi konektor yang hilang; file dapat dibuka pengguna pada Draw.io Desktop. Tata letak, kardinalitas, dan kelayakan halaman cetak tetap perlu *visual acceptance*.

## F. Keputusan & Perubahan Konteks — Decision Register

| ID | Keputusan / penjelasan | Sumber / waktu | Konsekuensi |
|---|---|---|---|
| DEC-001 | Laporan proyek bersifat akademik; planning WBS simulasi, tetapi bukti teknologi aktual | Permintaan pengguna, 8 Okt | Pisahkan baseline dan hasil aktual |
| DEC-002 | Pertahankan struktur dan kode WBS asli; edit hanya sesudah diskusi/setuju | Permintaan pengguna, 8 Okt | Jangan overwrite JSON / SimpleWBS |
| DEC-003 | Gunakan Supabase sebagai dasar ERD dan Database Schema | Pengguna menyetujui audit, 8 Okt | 28 tabel / 323 kolom menjadi bukti |
| DEC-004 | Buat diagram editable dalam Draw.io, bukan sekadar screenshot | Pengguna, 8 Okt | Paket .drawio 17 halaman dibuat |
| DEC-005 | Fokus menyelesaikan dokumentasi WBS 2 sebelum mengerjakan WBS 3 | Pengguna, 8 Okt | Buka WBS 3 hanya setelah keputusan review |
| DEC-006 | Pembuatan artefak di branch dokumentasi terpisah di GitHub | Praktik yang dijalankan, 8 Okt | Source main dan DB tak disentuh |
| DEC-007 | GitHub pribadi belum final; implementasi lebih matang di teman; menggunakan Supabase bersama | Klarifikasi pengguna, 8 Okt | Audit GitHub pribadi tidak representasi progres tim |
| DEC-008 | Bagian di sisi pengguna yang masih belum finalisasi adalah payment | Klarifikasi pengguna, 8 Okt | Fokus payment detail, jangan reset status fitur lain tanpa bukti |
| DEC-009 | Website Customer yang dipublikasikan adalah titipcuci.vercel.app/login | Pengguna, 8 Okt | Jadikan calon sumber observasi aktual, status login belum diperiksa |
| DEC-010 | Seluruh diskusi dan hasil kerja harus tercatat & terjaga untuk lanjutan sesi | Permintaan pengguna, 8 Okt | Dokumen master log ini dibuat; perubahan berikutnya perlu masuk riwayat |
| DEC-011 | Ongkir berbasis km vs termasuk tarif vs per zona **belum diputuskan pengguna** | Pertanyaan diajukan, belum terjawab | Jangan menyimpulkan tarif atau menerapkan rumus |
| DEC-012 | Detail tahap payment belum final (UI, provider, webhook, dll.) **belum diketahui** | Pertanyaan diajukan, belum terjawab | Jangan mengklaim masalah pasti pada webhook |

## G. Snapshot Status Milestone M0–M12 (Dengan Provenance)

Riwayat progres **yang pernah disampaikan pengguna sebelum klarifikasi terbaru**:
- M0 Foundation, M1 Auth/RBAC, M2 Customer Order, M3 Admin Operations, M4 Weight/Invoice, M5 Payment, M6 Processing/QC dilaporkan selesai.
- M7 Realtime/GPS sebelumnya dilaporkan hampir selesai.
- M8 Delivery, M9 Review/Complaint, M10 Owner Analytics, M11 Polish, M12 QA/Deploy dulu dilaporkan belum dikerjakan.

**PENTING:** Snapshot ini **bukan** status final terbaru: setelah itu pengguna menjelaskan bahwa teman mempunyai versi lebih matang dan yang tersisa di sisi pengguna adalah finalisasi payment. Oleh sebab itu, **belum ada status M0–M12 yang boleh dipaksakan sebagai fakta akhir tim** tanpa konfirmasi progres teman / akses versi terkini.

Keberadaan tabel, fungsi, dan migrations M8–M10 di Supabase **bukan bukti selesai UI/end-to-end**, tetapi merupakan bukti skema/rancangan server sudah terpasang.

## H. Posisi WBS 2 Saat Catatan Dibuat

| WBS | Artefak yang tersedia | Status disiplin laporan |
|---|---|---|
| 2.1 | Requirements & traceability; catatan perbedaan blueprint-DB | Siap ditinjau |
| 2.2 | Draw.io System Architecture, deployment | Diagram tersedia; validasi implementasi tim masih diperlukan |
| 2.3 | Draw.io Business Process Flow, Activity | Diagram tersedia; cocokkan dengan UI/flow terkini |
| 2.4 | ERD induk + 4 modul | Diagram tersedia; review visual/kardinalitas |
| 2.5 | Data Dictionary MD+CSV | Audit struktur selesai; sign-off menunggu |
| 2.6 | Role & RBAC diagram, role server dan RLS | Sudah completed di WBS asli; testing akses berbeda pada WBS 8.9 |
| 2.7 | Order activity + sequence | Desain ada; verifikasi implementasi versi tim |
| 2.8 | Serviceability activity, geofence | Kontrak ongkir/jarak belum disetujui |
| 2.9 | QRIS Payment sequence & payment state | Diagram target ada; penjelasan detail payment belum final belum tersedia |
| 2.10 | State & Live Tracking sequence | Diagram ada; status aktual UI/realtime perlu verifikasi |
| 2.11 | Technical Specification Review + 10 temuan | Review disusun; belum *approval/sign-off* |

**Status induk WBS 2: masih in-progress pada SimpleWBS asli; jangan ditandai Completed otomatis.**

## I. Temuan Audit (Koreksi Klasifikasi)

Dokumen sebelumnya mencatat temuan TS-01..TS-10 dengan label high/medium, berdasarkan perbandingan repo GitHub pribadi dengan database. Setelah pengguna mengklarifikasi bahwa ada source lebih matang pada teman, klasifikasi bukti **harus diinterpretasikan ulang**:

- **TS-01 (Repo M0–M4 vs DB M5–M10):** **Source comparison scope mismatch / information gap**, bukan konfirmasi defect sistem.
- **TS-02 (Vercel baseline):** Bukti deployment milik akun pengguna, belum membuktikan deployment website Customer milik teman.
- **TS-03/04 (Blueprint tabel/state berbeda dengan DB):** Gap desain-vs-skema dalam snapshot; perlu verifikasi apakah memang ditunda/diubah oleh tim.
- **TS-05 (Ongkir):** Keputusan bisnis belum terselesaikan dalam diskusi.
- **TS-06 (Payment route tidak ada di main pribadi):** Repo pribadi saja yang belum menyertakan route; status source versi teman belum diaudit. Bagian payment menurut pengguna memang belum final, tetapi jenis blocker belum diketahui.
- **TS-07/08 (Tracking, delivery, analytics UI tidak tampak di main pribadi):** Jangan anggap fitur tim tidak ada; perlu lihat implementasi teman.
- **TS-09 (RLS enabled, 24 tabel memiliki policy):** Secara desain bisa deny-by-default/service-only; baru dinilai setelah tes authorization.
- **TS-10 (Sign-off):** Keputusan dan persetujuan akhir WBS 2 belum tercatat.

Tidak ada bug aplikasi yang telah **dibuktikan** dari gap repo-vs-db semata.

## J. Rencana Kerja Berikutnya (Tidak Dieksekusi Diam-diam)

**Urutan yang disepakati:** tuntaskan WBS 2 sebelum WBS 3 dan seterusnya; observasi -> klasifikasi bukti -> diagram -> review -> update WBS setelah persetujuan.

### J.1 Yang masih perlu diketahui dari tim

1. **Versi aktual aplikasi teman**: URL aplikasi Admin/Owner jika ada, atau repo/branch yang berisi kode lebih matang (hanya bila bersedia dibagikan), atau screenshot alur nyata.
2. **Payment**: bagian apa yang masih belum final — apakah UI QRIS/VA, sandbox Midtrans, callback/webhook, pembayaran berhasil, simulasi atau lainnya? Jangan mengisi sendiri.
3. **Ongkir**: apakah included dalam harga laundry, fixed per area, atau dihitung per km? Masih menunggu konfirmasi.
4. **Scope tracking/delivery/review/owner dashboard**: yang sudah berjalan/masih direncanakan menurut teman; bukti screenshot, source, atau test case bila ada.
5. **Review design**: validasi ERD/architecture/activity/sequence terhadap sistem yang dipakai tim.
6. **Keputusan WBS 2.11**: persetujuan dokumentasi & pengecualian; baru usulkan Completed per aktivitas yang terpenuhi.

### J.2 Langkah lanjut yang disarankan

1. Buka website Customer pada mode browser interaktif yang diizinkan; lakukan observasi menggunakan akun uji **tanpa mengarsipkan password**. Bila browser tidak tersedia, gunakan screenshot yang sudah disanitasi.
2. Ambil peran Customer: menu, pemesanan, pickup, invoice, payment, tracking, history, review; catat setiap temuan sebagai **observed**, **reported**, **documented in design**, atau **not yet verified**.
3. Pelajari implementasi tim yang lebih matang dari source/branch yang tepat agar diagram aktual bukan asumsi.
4. Revisi diagram Draw.io sesuai bukti, lalu perbarui review WBS 2.1–2.11.
5. Mintakan persetujuan sebelum memperbarui status, tanggal, PIC, dan catatan di file WBS asli.
6. Setelah WBS 2 diterima, lanjutkan WBS 3 (UI/UX), 4–5 (backend/frontend), 6 (integrasi), 7–9 (QA/testing/UAT), dan 10 (deployment/closing).

### J.3 Prinsip klaim laporan

| Label | Makna |
|---|---|
| **Observed / verified** | Terlihat langsung melalui artefak/hasil tes terkonfirmasi |
| **Reported by team** | Keterangan progres dari pengguna/teman, belum diverifikasi teknis |
| **Designed / target** | Digambarkan pada blueprint/WBS, belum tentu implemented |
| **Documented** | Artefak dokumen/diagram tersedia dan dapat ditinjau |
| **Open / unknown** | Belum memiliki bukti memadai |

## K. Tautan Cepat dan Cara Melanjutkan Sesi

- **Indeks dokumen:** [README_WBS2_Deliverables.md](README_WBS2_Deliverables.md).
- **Draw.io:** [TitipCuci_WBS_Diagrams.drawio](TitipCuci_WBS_Diagrams.drawio).
- **Data Dictionary:** [Data_Dictionary_TitipCuci_Actual.md](Data_Dictionary_TitipCuci_Actual.md).
- **Review:** [Technical_Specification_Review_WBS2.md](Technical_Specification_Review_WBS2.md).
- **Proposal WBS:** [WBS2_Review_Status_Proposal.csv](WBS2_Review_Status_Proposal.csv).
- **GitHub repo pribadi:** https://github.com/Rizkisopyandi/Titipcuci
- **Supabase database bersama:** https://supabase.com/dashboard/project/uydhmkhgpeynswxkaxod
- **Customer published login:** https://titipcuci.vercel.app/login
- **SimpleWBS referensi:** https://simplewbs.com/wbs/?s=EYHitcNH7GMK (hanya lihat; jangan ubah tanpa persetujuan).

**Instruksi siap pakai untuk melanjutkan pada percakapan baru:**

> Baca `docs/diagrams/PROJECT_DISCUSSION_MASTER_LOG.md` di branch `docs/drawio-wbs-titipcuci-20261008` repo `Rizkisopyandi/Titipcuci`. Lanjutkan dokumentasi akademik TitipCuci sesuai WBS asli. Ingat GitHub pribadi bukan implementasi paling matang; teman menggunakan Supabase yang sama; di sisi saya tinggal finalisasi payment. Jangan ubah WBS, DB, source main, atau menjalankan order/payment tanpa izin. Bedakan bukti langsung, laporan progres tim, dan desain target. Mulai dari open items WBS 2.

## L. Riwayat Perubahan Catatan Induk

| Tanggal | Versi | Perubahan |
|---|---|---|
| 2026-10-08 | 1.0 | Membuat catatan induk, merekam keputusan WBS/simulasi, audit GitHub/Supabase/Vercel, daftar 17 diagram & kamus data, koreksi mengenai source teman, keterbatasan payment, status review, dan tindak lanjut. |

**Protokol ke depan:** Jika pengguna meminta keputusan proyek dicatat, tambahkan **baris baru** pada bagian L dan perbarui bagian terkait secara terbuka. Jangan menimpa atau menghapus keputusan lama tanpa mencatat koreksi dan alasannya. Riwayat commit GitHub menyimpan perubahan versi file.
