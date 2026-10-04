# 00 — Project Source of Truth

Status: **authoritative / locked for v1**. Setiap perubahan wajib dicatat di [Decision Log](23-DECISION-LOG.md), [Changelog](24-CHANGELOG.md), dan traceability bila memengaruhi requirement.

## Tujuan dan masalah

Laundry Online memberi kenyamanan, transparansi, dan akuntabilitas pada pickup–delivery laundry. Produk mengatasi ketidakjelasan waktu jemput, status cucian, identitas tas, kondisi awal, berat/harga final, pembayaran, keterlambatan, kualitas hasil, serah terima, dan penanganan komplain.

## Aktor dan batas

- Owner: tata kelola dan observasi bisnis.
- Admin: operator penuh sekaligus petugas pickup/delivery; v1 tidak memiliki role courier terpisah.
- Customer: pemilik order dan data pribadi terkait.

V1 adalah single business/tenant, web responsive, Bahasa Indonesia, mata uang IDR, zona tampilan Asia/Jakarta, pembayaran Midtrans Sandbox, dan satu Admin dapat menangani task pickup/delivery yang di-assign kepadanya.

## Alur bisnis kanonik

1. Customer memilih layanan, alamat/pin, slot yang masih tersedia, preferensi, dan catatan.
2. Sistem memvalidasi serviceability, kapasitas slot, harga estimasi, dan idempotency lalu membuat `PENDING_CONFIRMATION`.
3. Admin mengonfirmasi/menolak; konfirmasi menghasilkan task pickup.
4. Admin memulai pickup. Hanya selama perjalanan lokasi live dibagikan. Saat tiba, Admin mencatat proof of pickup, jumlah/ID tas, kondisi, dan bukti bila ada isu.
5. Laundry diterima di outlet, Admin memasukkan berat aktual. Server mengambil pricing snapshot dan membuat invoice final.
6. Bila perubahan harga/treatment melampaui ambang atau ada kondisi khusus, order masuk `NEEDS_CUSTOMER_APPROVAL` sebelum invoice/pay processing dilanjutkan.
7. Customer memilih QRIS/VA. Hanya webhook valid, amount/order match, dan idempotent yang mengubah payment ke `PAID` serta order ke `PAID`.
8. Admin menjalankan sorting, washing, drying, ironing, folding lalu QC. QC gagal masuk `REPROCESSING`; QC lolos masuk `READY_FOR_DELIVERY`.
9. Admin memulai delivery dengan lokasi live, mencatat proof of delivery, lalu order `DELIVERED` dan `COMPLETED` sesuai aturan konfirmasi/auto-complete.
10. Customer dapat memberi review atau membuat complaint dengan bukti; resolusi dapat berupa explanation, re-clean, service credit, reject beralasan, atau refund simulation.

## Prinsip domain

- Order state dan payment state terpisah namun disinkronkan lewat command/event yang eksplisit.
- Exception seperti delay/on-hold adalah state beralasan, bukan teks bebas yang menimpa state tanpa history.
- Berat dan harga final immutable setelah invoice dibayar; koreksi memakai adjustment/refund flow dan audit.
- Snapshot mencakup service, unit, unit price, minimum charge, discount, surcharge, tax, dan formula yang digunakan.
- Semua operasi sensitif merekam actor, before/after, timestamp, reason, request/correlation ID.
- Live location bersifat ephemeral dan least-privilege; riwayat rute lengkap bukan fitur v1.

## Scope v1

Termasuk: auth/RBAC, service/pricing, order, alamat/map pin, serviceability, slots, pickup/delivery, bag/condition evidence, weight/invoice, Midtrans sandbox QRIS/VA, processing/QC, realtime status/location, notifications in-app, review, complaint, audit, Owner analytics, seed/demo, deployment.

Tidak termasuk: multi-outlet/tenant, dedicated courier role/app, route optimization, subscription, loyalty, POS/offline mode, WhatsApp gateway berbayar, production settlement/refund uang nyata, IoT scale, AI image inspection, dynamic surge pricing.

## Keputusan terkunci

Stack, role, status, alur, dan vendor mengikuti dokumen ini. Email/SMS/WhatsApp boleh menjadi backlog; in-app notification wajib. `COMPLETED` bukan syarat membuka complaint: complaint mengikuti window dari `DELIVERED/COMPLETED`. Refund v1 adalah simulasi tercatat, bukan transfer uang nyata.

## Acceptance tingkat produk

Demo harus dapat menjalankan satu golden path dan minimal empat exception tanpa manipulasi database: slot penuh, reschedule/cancel, payment expired + retry, QC fail + reprocess, serta complaint resolution. Semua perubahan terlihat pada role yang tepat, terlindungi RLS, dan memiliki bukti audit/test.

Lanjutkan ke [Product Requirements](01-PRODUCT-REQUIREMENTS.md), [Master Flow](03-MASTER-BUSINESS-FLOW.md), dan [Traceability](25-REQUIREMENT-TRACEABILITY.md).
