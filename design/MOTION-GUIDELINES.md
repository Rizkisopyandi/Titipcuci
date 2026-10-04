# Motion Guidelines

Motion menjelaskan hierarchy, progress, state change, dan continuity; tidak bergerak terus-menerus untuk dekorasi.

- Micro feedback 120–180 ms; page/panel 180–280 ms; easing natural. Jangan menunda action kritis.
- Landing boleh cinematic melalui reveal terukur; dashboard memakai fade/slide halus. Map marker bergerak interpolated tanpa menyembunyikan stale state.
- Status transition menyorot perubahan sekali; payment/loading tidak menjanjikan sukses sebelum server event.
- Skeleton/shimmer dibatasi dan berhenti saat hidden/error.
- `prefers-reduced-motion` menghapus parallax, autoplay expressive motion, dan transform besar; tetap tampilkan state secara instan.
- Tidak ada flashing, scroll hijacking, atau motion yang menghalangi keyboard/screen reader.

Uji pada perangkat mobile menengah dan tab background. Motion gagal tidak boleh menghalangi operasi.
