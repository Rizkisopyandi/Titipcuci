# 14 — Complaint & Claim Specification

## Eligibility

Customer pemilik order dapat membuat complaint sejak pickup untuk issue bag/condition dan dalam window kebijakan setelah delivered/completed untuk hasil/kehilangan/kerusakan/delivery/payment. Window default demo 2×24 jam dan harus configurable.

## Data

Kategori: `MISSING_ITEM`, `DAMAGED_ITEM`, `QUALITY`, `DELAY`, `DELIVERY`, `PAYMENT`, `OTHER`. Required: order, category, description; evidence opsional kecuali policy kategori. Evidence private, tipe/ukuran dibatasi, malware/content checks sesuai kemampuan.

## State

`OPEN → ACKNOWLEDGED → INVESTIGATING → WAITING_CUSTOMER|WAITING_INTERNAL → RESOLVED|REJECTED → CLOSED`. Reopen hanya dalam window dengan reason. SLA menyimpan due time dan pause reason.

## Resolution

Outcome: explanation/apology, re-clean, redelivery, service credit demo, refund simulation, rejected-with-reason. Resolusi mencatat summary, evidence considered, amount bila ada, approver, dan linked operational/refund task. Admin tidak menghapus pesan/evidence; correction adalah event baru.

## Fairness/privacy

Gunakan bahasa netral, bedakan dugaan dan bukti, jangan tampilkan internal notes ke Customer, dan minimalkan akses evidence. Owner mengawasi tren dan override sesuai audit, bukan mengedit history.

## Acceptance

Unauthorized order ditolak; evidence signed URL scoped; concurrent updates aman; SLA/notifications bekerja; resolved complaint memiliki outcome; complaint tidak otomatis memalsukan state order.
