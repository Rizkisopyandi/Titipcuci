# Asset Guidelines

## Photography/video

Gunakan asset berlisensi/dimiliki: tekstur kain, proses laundry nyata, packaging bersih, petugas yang consent. Catat source, license, creator, expiry/territory. Hindari wajah/alamat/order label nyata tanpa consent. Bukti order user bukan aset pemasaran.

## Icons/illustration

Satu icon set konsisten (default lucide dari shadcn), stroke/size seragam, selalu label untuk action ambigu. Illustrations sederhana dan tidak menggantikan status/error copy.

## Technical

WebP/AVIF responsif, dimensions ditetapkan untuk mencegah CLS, lazy load di bawah fold, poster/fallback video, alt text fungsional. SVG disanitasi; jangan inline asset tidak tepercaya. Target awal hero image ≤300 KB dan thumbnail ≤100 KB setelah optimasi, disesuaikan quality review.

## Storage/naming

Repository asset UI: `public/assets/{category}/{semantic-name}`. Evidence user berada di Supabase private bucket, tidak di public. Nama lowercase-kebab, tanpa PII, version jika benar-benar diperlukan.
