# 11 — Live Map Specification

## Static pin dan serviceability

Customer memilih alamat dan menempatkan pin Mapbox. UI menampilkan formatted address dan meminta konfirmasi manual. Server memvalidasi lat/lng range dan service area; geocoding client bukan keputusan final.

## Live session

Tracking mulai hanya ketika assigned Admin menekan Start Pickup/Delivery dan izin browser tersedia. Update memuat taskId, lat, lng, accuracy, heading opsional, capturedAt, sequence. Target interval 5–10 detik saat bergerak, 15–30 detik saat diam; abaikan accuracy buruk yang dikonfigurasi dan event lebih lama.

Customer pemilik order melihat marker, waktu update terakhir, status “lokasi tidak tersedia/terputus”, serta ETA sebagai estimasi—bukan janji. Admin tetap dapat menjalankan flow dengan fallback status/manual call bila geolocation ditolak.

## Privacy dan retensi

- Channel hanya untuk task aktif dan peserta berizin.
- Tracking berhenti otomatis pada `PICKED_UP`, `DELIVERED`, cancel, unassign, logout/timeout.
- Tidak menyimpan route history permanen. Last position ephemeral dihapus maksimal `LOCATION_RETENTION_MINUTES` setelah session selesai.
- Koordinat tidak masuk analytics/log biasa. Proof delivery dapat menyimpan coordinate coarse bila dibutuhkan dan disetujui kebijakan.
- UI Admin menunjukkan indikator sharing yang jelas dan tombol stop yang menghasilkan exception bila task belum selesai.

## Security/abuse

Server memverifikasi assigned Admin, active task, monotonic sequence, plausible timestamp/rate, dan payload size. Customer hanya subscribe; tidak publish. Token Mapbox public dibatasi domain; secret API tidak di browser.

## Test minimum

Permission denied, inaccurate GPS, background tab, reconnect, duplicate/out-of-order updates, unauthorized subscribe, tracking auto-stop, stale marker, pickup dan delivery simultan yang tidak sah.
