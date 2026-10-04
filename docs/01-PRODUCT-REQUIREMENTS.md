# 01 — Product Requirements

Requirement ID di dokumen ini stabil. Detail mapping terdapat di [Traceability](25-REQUIREMENT-TRACEABILITY.md).

## Customer dan order

- **REQ-ORD-001** Customer dapat membuat order dengan satu/lebih item layanan, alamat valid, slot, preferensi, catatan, dan persetujuan estimasi.
- **REQ-ORD-002** Sistem menolak pin di luar area layanan dan slot yang penuh/berlalu secara atomik.
- **REQ-ORD-003** Customer dapat reschedule atau cancel hanya dalam state/window yang diizinkan, dengan reason dan kapasitas slot dikembalikan.
- **REQ-ORD-004** Customer/Admin melihat timeline status realtime dan estimasi yang dapat dijelaskan.
- **REQ-ORD-005** Admin dapat menandai delayed, on-hold, atau needs-customer-approval dengan reason, SLA, dan tindakan berikutnya.

## Pickup, penerimaan, dan harga

- **REQ-PUP-001** Admin mengonfirmasi order, menerima assignment, serta memulai/menyelesaikan pickup dengan transition guard.
- **REQ-PUP-002** Customer melihat lokasi Admin hanya selama pickup aktif.
- **REQ-PUP-003** Admin memverifikasi bag ID/count, kondisi, dan proof of pickup; mismatch/issue wajib memiliki bukti/reason.
- **REQ-WGT-001** Hanya Admin dapat memasukkan berat aktual positif; perubahan sebelum payment diaudit.
- **REQ-INV-001** Server menghitung invoice final dari actual weight dan pricing snapshot; total dapat direproduksi.
- **REQ-APR-001** Perubahan/treatment yang membutuhkan persetujuan menghentikan flow sampai Customer approve/reject/timeout.

## Payment

- **REQ-PAY-001** Customer dapat membuat transaksi Midtrans Sandbox QRIS atau VA untuk invoice aktif.
- **REQ-PAY-002** Status paid hanya berasal dari webhook terverifikasi dengan order/amount match.
- **REQ-PAY-003** Duplicate/out-of-order webhook tidak menggandakan efek.
- **REQ-PAY-004** Expired/failed transaction dapat dicoba ulang tanpa mengubah invoice; hanya satu attempt aktif per method/order.
- **REQ-PAY-005** Owner/Admin dapat menjalankan refund simulation dengan alasan, approval, dan audit.

## Processing, delivery, dan aftercare

- **REQ-PRC-001** Admin mengelola tahapan proses berurutan dan timestamps.
- **REQ-QC-001** QC memakai checklist; fail wajib reason dan menuju reprocess sebelum QC ulang.
- **REQ-DLV-001** Admin memulai delivery, Customer melihat live location, dan completion memerlukan proof of delivery.
- **REQ-DLV-002** Delivery gagal dijadwalkan ulang/on-hold tanpa menghilangkan history.
- **REQ-REV-001** Customer hanya dapat satu review per completed order dan dapat memperbarui dalam window kebijakan.
- **REQ-CMP-001** Customer membuat complaint dalam window dengan kategori, uraian, dan evidence opsional.
- **REQ-CMP-002** Admin menangani complaint lewat event history; Owner dapat mengawasi dan resolusi memiliki outcome beralasan.

## Platform

- **REQ-NOT-001** Event penting membuat notifikasi in-app idempotent untuk penerima yang relevan.
- **REQ-AUD-001** Aksi sensitif menghasilkan audit append-only yang dapat difilter Owner.
- **REQ-SEC-001** Auth, RBAC, RLS, storage policy, validation, rate limit, dan secret handling mengikuti least privilege.
- **REQ-RT-001** Status/order/notification realtime dapat reconnect dan reconcile dari source of truth.
- **REQ-OWN-001** Owner melihat KPI berformula konsisten, filter periode, dan data drill-down tanpa PII berlebihan.
- **REQ-OPS-001** Sistem deployable di Vercel, memiliki migration/seed terpisah, health check, logging terstruktur, dan rollback plan.

## Non-functional requirements

- NFR-001: mobile-first 360 px ke desktop; tidak ada horizontal scroll pada journey inti.
- NFR-002: WCAG 2.1 AA untuk kontras, keyboard, label, focus, dan reduced motion.
- NFR-003: p95 route read utama < 1.5 s dan mutation < 2.5 s di luar latensi vendor pada data demo.
- NFR-004: error aman, correlation ID, tanpa secret/PII/location mentah dalam log.
- NFR-005: operasi kritis tahan retry dan concurrent update.
- NFR-006: browser target Chrome/Edge dua versi terbaru dan Safari mobile modern.

Out of scope mengikuti [Source of Truth](00-PROJECT-SOURCE-OF-TRUTH.md). Acceptance detail berada pada [Testing Strategy](18-TESTING-STRATEGY.md).
