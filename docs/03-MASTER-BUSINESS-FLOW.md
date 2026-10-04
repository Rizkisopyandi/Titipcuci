# 03 — Master Business Flow

## Golden path

```text
Customer draft
  → validate address/service area
  → reserve available slot
  → create order (PENDING_CONFIRMATION)
Admin review → CONFIRMED → PICKUP_SCHEDULED
Admin start pickup → PICKUP_ON_THE_WAY + live location
Arrive → bag ID/count + condition + proof → PICKED_UP
Outlet receive → RECEIVED
Admin actual weight → WEIGHED → server pricing snapshot → WAITING_PAYMENT
Customer QRIS/VA → verified webhook → PAID
SORTING → WASHING → DRYING → IRONING → FOLDING → QUALITY_CHECK
QC pass → READY_FOR_DELIVERY
Admin start delivery → DELIVERY_ON_THE_WAY + live location
Proof of delivery → DELIVERED → COMPLETED
Customer → REVIEW and/or COMPLAINT within policy window
```

## Sebelum order

Serviceability memakai point-in-polygon/geofence server-side terhadap area aktif. Slot availability dihitung dari kapasitas dikurangi reservasi order non-cancelled; create/reschedule memakai transaksi untuk mencegah oversubscription. Estimasi sebelum pickup bukan invoice final.

## Persetujuan Customer

Jika kondisi memerlukan treatment khusus atau invoice final melewati threshold perubahan yang dikonfigurasi, Admin mengirim proposal berisi reason, evidence, dampak harga/waktu, dan deadline. `NEEDS_CUSTOMER_APPROVAL` membekukan langkah terkait. Approve melanjutkan; reject menuju resolusi Admin (ubah treatment/cancel/return); timeout menuju `ON_HOLD`, bukan auto-charge.

## Reschedule/cancel

Customer dapat reschedule sebelum Admin memulai pickup dan cancel sebelum pickup sesuai policy; setelah itu Admin/Owner menyelesaikan exception secara manual beralasan. Reschedule memesan slot baru dahulu lalu melepaskan slot lama secara atomik. Cancel menutup task aktif, menghentikan tracking, dan membuat refund simulation bila pembayaran sudah terjadi.

## Delay dan on-hold

`DELAYED` menyimpan previous state, reason code, revised ETA, responsible role, dan notification. `ON_HOLD` menyimpan blocker dan action owner. Resume harus kembali ke state legal yang tercatat, tidak bebas memilih state.

## Processing dan QC

Tahap proses berurutan dengan started/completed timestamp. QC checklist minimal: cleanliness, stain/treatment note, dryness, ironing/folding, bag/item count, packaging. Fail membuat record QC dan `REPROCESSING`; setelah langkah perbaikan selesai kembali ke `QUALITY_CHECK`.

## Delivery dan completion

Proof dapat berupa foto privat, recipient name, method (`HANDOVER`/`CONTACTLESS`), timestamp dan coordinate coarse. Customer confirmation dapat menyelesaikan segera; auto-complete terjadwal setelah delivery jika tidak ada issue. Failed attempt masuk on-hold/reschedule dan tidak dianggap delivered.

## Complaint

Complaint tidak mengubah history order; status complaint berjalan sendiri. Outcome dapat memicu linked re-clean task atau refund simulation. Satu complaint dapat memiliki banyak event/evidence namun seluruh perubahan append-only.

State legal: [Order State Machine](04-ORDER-STATE-MACHINE.md), error branch: [Error & Exception Flows](17-ERROR-EXCEPTION-FLOWS.md).
