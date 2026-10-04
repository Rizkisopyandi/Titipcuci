# 29 — Error Code Catalog

| Code     | Meaning / HTTP                            | Pesan aman                                                       |
| -------- | ----------------------------------------- | ---------------------------------------------------------------- |
| AUTH_001 | unauthenticated / 401                     | Silakan masuk kembali.                                           |
| AUTH_002 | forbidden / 403                           | Anda tidak memiliki akses untuk tindakan ini.                    |
| VAL_001  | invalid input / 400                       | Periksa kembali data yang diisi.                                 |
| RES_001  | not found/inaccessible / 404              | Data tidak ditemukan.                                            |
| ORD_001  | invalid transition / 409                  | Status pesanan sudah berubah; muat ulang.                        |
| ORD_002  | cancel/reschedule not allowed / 422       | Pesanan tidak dapat diubah pada tahap ini.                       |
| ORD_003  | stale version / 409                       | Data telah diperbarui oleh proses lain.                          |
| SVC_001  | outside service area / 422                | Lokasi belum masuk area layanan.                                 |
| SLOT_001 | full/past / 409                           | Slot tidak lagi tersedia. Pilih waktu lain.                      |
| MAP_001  | geolocation denied                        | Izin lokasi tidak tersedia; gunakan pembaruan manual.            |
| MAP_002  | live session inactive / 409               | Pelacakan belum atau tidak lagi aktif.                           |
| BAG_001  | bag mismatch / 422                        | Verifikasi tas belum sesuai.                                     |
| INV_001  | invalid weight/pricing / 422              | Invoice belum dapat dibuat.                                      |
| APR_001  | approval expired/resolved / 409           | Permintaan persetujuan sudah tidak aktif.                        |
| PAY_001  | payment expired / 422                     | Pembayaran kedaluwarsa; buat pembayaran baru.                    |
| PAY_002  | invalid webhook / 401                     | Webhook tidak valid.                                             |
| PAY_003  | amount/order mismatch / 422               | Data pembayaran tidak sesuai.                                    |
| PAY_004  | attempt active/idempotency conflict / 409 | Pembayaran sedang diproses.                                      |
| QC_001   | checklist incomplete / 422                | Checklist kualitas belum lengkap.                                |
| DLV_001  | proof required / 422                      | Bukti penyerahan wajib dilengkapi.                               |
| CMP_001  | complaint window closed / 422             | Batas waktu pengajuan telah berakhir.                            |
| FILE_001 | type/size invalid / 422                   | File tidak didukung atau terlalu besar.                          |
| RATE_001 | too many requests / 429                   | Terlalu banyak permintaan; coba lagi nanti.                      |
| SYS_001  | unexpected / 500                          | Terjadi kendala. Gunakan ID permintaan saat menghubungi bantuan. |
| VND_001  | vendor unavailable / 502                  | Layanan mitra sementara tidak tersedia.                          |

Pesan internal/log terpisah dari pesan user. Jangan masukkan secret/PII/stack trace ke response.
