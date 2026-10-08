# TitipCuci — Paket Dokumentasi WBS 2

**Tanggal penyusunan:** 8 Oktober 2026.

> **Catatan utama diskusi & handoff:** [PROJECT_DISCUSSION_MASTER_LOG.md](PROJECT_DISCUSSION_MASTER_LOG.md) — mencatat keputusan proyek, hasil teknis, koreksi konteks kerja tim, status WBS, riwayat, dan langkah lanjut tanpa menyimpan kredensial.

Dokumen ini adalah hasil audit read-only Supabase, inspeksi source code GitHub `main`, dan metadata Vercel. Tidak ada perubahan pada database, source branch `main`, atau SimpleWBS.

| File | Penggunaan |
|---|---|
| [PROJECT_DISCUSSION_MASTER_LOG.md](PROJECT_DISCUSSION_MASTER_LOG.md) | Induk keputusan, konteks tim, bukti audit, status pekerjaan, dan handoff percakapan |
| [TitipCuci_WBS_Diagrams.drawio](TitipCuci_WBS_Diagrams.drawio) | 17 diagram editable: architecture, 5 ERD, flow, use case, state, deployment, activity, sequence, RBAC |
| [Data_Dictionary_TitipCuci_Actual.md](Data_Dictionary_TitipCuci_Actual.md) | 28 tabel / 323 kolom, 47 foreign keys, 199 constraint, RLS, enums |
| [Data_Dictionary_TitipCuci_323_Columns.csv](Data_Dictionary_TitipCuci_323_Columns.csv) | Lampiran Data Dictionary yang bisa dibuka di Excel/Sheets |
| [Technical_Specification_Review_WBS2.md](Technical_Specification_Review_WBS2.md) | Audit keselarasan requirement / blueprint / schema / source / deployment, findings & signoff |
| [WBS2_Review_Status_Proposal.csv](WBS2_Review_Status_Proposal.csv) | Usulan status/note per nomor WBS untuk ditinjau sebelum pembaruan SimpleWBS |

**Status:** review artifacts ready; beberapa keputusan teknis dan persetujuan masih terbuka. Jangan samakan artifact created dengan fitur runtime completed.

**Cara buka diagram:** unduh file `.drawio`, buka Draw.io Desktop → File → Open From → Device. Semua node/edge dapat diedit.
