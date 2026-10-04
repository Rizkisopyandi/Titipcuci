# 16 — UI/UX Design System

Arah visual: premium, modern, editorial, cinematic, minimal. Landing boleh ekspresif; dashboard tenang, padat informasi secukupnya, dan operasional.

## Tokens

Gunakan CSS variables/shadcn semantic tokens, bukan hex berulang. Base spacing 4 px; radius `sm/md/lg`; elevation hanya untuk hierarchy. Tipografi: display kuat pada landing, sans highly legible pada app, angka `tabular-nums` untuk uang/status.

Semantic color: neutral surface/text; primary action; success; warning; destructive; info. Setiap status memakai label/icon selain warna. Dark mode opsional backlog kecuali diputuskan lain.

## Patterns

Form memiliki label tetap, hint/error dekat field, input mobile-friendly, dan server error preservation. Destructive action memakai confirmation berisi dampak. Timeline menampilkan actor/waktu/reason aman. Uang `Intl.NumberFormat('id-ID',{currency:'IDR'})`; waktu Asia/Jakarta dengan label zona bila relevan.

Map selalu memiliki textual fallback. Upload menampilkan progress, limit, preview aman, dan retry. Table berubah menjadi cards pada mobile tanpa menghilangkan action. Skeleton hanya untuk known layout; jangan menyamarkan error sebagai loading.

## Accessibility

Keyboard penuh, focus visible, semantic landmarks/headings, form association, aria-live untuk status async, target sentuh ≥44 px, kontras AA, reduced motion, alt text berbasis fungsi. Peta bukan satu-satunya cara memahami status.

Komponen: [`design/COMPONENT-INVENTORY.md`](../design/COMPONENT-INVENTORY.md); motion: [`design/MOTION-GUIDELINES.md`](../design/MOTION-GUIDELINES.md).
