# 34 — Demo Presentation Scenario

Target 12–15 menit, environment staging seeded, dua browser/profile (Customer dan Admin), Owner siap pada tab ketiga. Jangan mengandalkan edit database.

## Persiapan H−1

Reset seed, jalankan smoke, pastikan Mapbox/Midtrans Sandbox/webhook/realtime, izin lokasi, akun, slot, dan jaringan. Siapkan fallback video/screenshot hanya sebagai cadangan dan jelaskan bila live integration gagal.

## Script utama

1. **Masalah & solusi (1 mnt):** transparansi status, berat, harga, tracking, bukti, complaint.
2. **Customer (2 mnt):** login → pilih Regular → pin area valid → slot → preferensi → order; tunjukkan penolakan pin luar area secara singkat.
3. **Admin pickup (2 mnt):** confirm/assign → start pickup → marker live Customer → arrive → bag code/count, condition, proof → receive.
4. **Berat/invoice/approval (2 mnt):** input 5,7 kg → snapshot dan invoice terinci; bila fixture threshold, Customer approve.
5. **Payment (2 mnt):** Customer memilih QRIS Sandbox → webhook valid mengubah status otomatis; jelaskan client tidak bisa menandai paid dan duplicate aman.
6. **Process/QC (2 mnt):** stage board → QC fail reason → reprocess → QC pass → ready.
7. **Delivery (1,5 mnt):** start tracking → proof handover/contactless → completed.
8. **Aftercare/Owner (2 mnt):** review atau complaint + evidence/resolution; Owner KPI, audit trail, dan Admin management.

## Bukti teknis yang ditunjukkan

Timeline actor/timestamp, pricing snapshot, payment event result tanpa secret, tracking auto-stop, QC attempts, proof signed access, complaint history, audit filter, KPI formula tooltip.

## Jalur exception cadangan

Gunakan fixtures untuk slot full; payment expired→retry; approval reject/timeout; failed delivery; complaint→refund simulation. Jangan mencoba memicu semua exception dalam golden path.

## Penutup

Tegaskan scope v1 dan batas sandbox. Kriteria sukses: alur dapat direproduksi, tidak ada data lintas akun, tidak ada status manual palsu, dan pertanyaan dosen dapat dijawab dengan Source of Truth/traceability.
