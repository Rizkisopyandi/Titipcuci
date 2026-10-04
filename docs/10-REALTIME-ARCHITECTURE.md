# 10 — Realtime Architecture

Realtime mempercepat UI tetapi bukan source of truth. Setelah reconnect, client fetch snapshot lalu menerapkan event yang lebih baru berdasarkan version/timestamp.

## Channels

- `user:{userId}:notifications`: notifikasi sendiri.
- `order:{orderId}`: status/timeline ringkas; subscribe hanya owner/Admin berizin/Customer pemilik.
- `task:{taskId}:location`: broadcast ephemeral lokasi assigned Admin selama task aktif.
- `admin:operations`: perubahan queue yang telah disanitasi untuk Admin.

Jangan broadcast tabel audit, raw payment, profile penuh, atau signed URL.

## Delivery pattern

Business transaction menulis domain outbox. Worker/server publisher membuat notifikasi dan event dengan `dedupe_key`. Client menangani duplicate, out-of-order, reconnect/backoff, dan tab background. Event membawa `eventId`, `type`, `aggregateId`, `aggregateVersion`, `occurredAt`, dan payload minimum.

## Authorization

Private channel memvalidasi JWT dan ownership/assignment saat subscribe. Revocation terjadi saat task/order berubah; client juga berhenti secara lokal. RLS tetap melindungi fetch data.

## Failure mode

Jika realtime mati, polling adaptif pada screen aktif tetap menampilkan state benar. Kehilangan broadcast bukan kehilangan transaksi. Health metrics: publish failure, reconnect rate, event lag, duplicate handling.

Event resmi ada di [Event Catalog](27-EVENT-CATALOG.md), lokasi di [Live Map Spec](11-LIVE-MAP-SPEC.md).
