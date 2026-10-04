# 07 — Screen Inventory

Setiap screen memiliki loading, empty, error, forbidden, dan success state yang relevan.

## Public/Auth

- `SCR-PUB-001` Landing; `SCR-AUTH-001` Login; `SCR-AUTH-002` Register; `SCR-AUTH-003` Forgot/reset password.

## Customer

- `SCR-CUS-001` Dashboard dan active-order summary.
- `SCR-CUS-002` New Order wizard: service → address/map → slot → preferences → review.
- `SCR-CUS-003` Order Detail/timeline dan action reschedule/cancel/approval.
- `SCR-CUS-004` Live Pickup; `SCR-CUS-005` Weight & Final Invoice; `SCR-CUS-006` Payment QRIS/VA/result.
- `SCR-CUS-007` Laundry Progress; `SCR-CUS-008` Live Delivery/proof.
- `SCR-CUS-009` History; `SCR-CUS-010` Review; `SCR-CUS-011` Complaint detail/create.
- `SCR-CUS-012` Addresses/map pin; `SCR-CUS-013` Preferences; `SCR-CUS-014` Profile/notifications.

## Admin

- `SCR-ADM-001` Operations Dashboard/queues; `SCR-ADM-002` Orders list/filter; `SCR-ADM-003` Order Detail/actions.
- `SCR-ADM-004` Pickup Task/map; `SCR-ADM-005` Bag & Condition Verification; `SCR-ADM-006` Receive & Weight.
- `SCR-ADM-007` Invoice preview; `SCR-ADM-008` Processing board; `SCR-ADM-009` QC checklist/reprocess.
- `SCR-ADM-010` Delivery Task/map/proof; `SCR-ADM-011` Complaints; `SCR-ADM-012` Customer read view; `SCR-ADM-013` Payment status.

## Owner

- `SCR-OWN-001` KPI Dashboard; `SCR-OWN-002` Revenue/Orders report; `SCR-OWN-003` Service & Pricing.
- `SCR-OWN-004` Service Area & Slot Capacity; `SCR-OWN-005` Admin Management; `SCR-OWN-006` Payment/Refund Oversight.
- `SCR-OWN-007` Complaint Oversight; `SCR-OWN-008` Audit Explorer; `SCR-OWN-009` Feature Flags.

## Navigation rules

Role layout berbeda, tetapi komponen domain direuse. Deep link memeriksa role dan ownership server-side. Mobile Customer memakai bottom navigation maksimum lima item; Admin/Owner memakai responsive sidebar. Status tidak hanya dibedakan dengan warna.

Rute URL boleh disesuaikan tanpa mengubah ID screen; perubahan mapping dicatat di [Changelog](24-CHANGELOG.md). Detail urutan ada di [`design/SCREEN-FLOWS.md`](../design/SCREEN-FLOWS.md).
