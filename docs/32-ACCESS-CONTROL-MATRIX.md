# 32 — Access Control Matrix

`Own` berarti row terhubung ke `auth.uid()`; `Assigned` berarti active task ditugaskan ke Admin tersebut. Owner read operasional kecuali master/admin action.

| Resource/action             | Customer                                           | Admin                              | Owner                   |
| --------------------------- | -------------------------------------------------- | ---------------------------------- | ----------------------- |
| Profile/address/preferences | CRUD own                                           | read minimum for active order      | read masked             |
| Service/price active        | read                                               | read                               | CRUD/version            |
| Area/slot                   | read availability                                  | read                               | CRUD/capacity           |
| Order                       | create/read own; limited cancel/reschedule/respond | read/update operations             | read/report             |
| Other customer order        | no                                                 | read for operations                | read oversight          |
| Assignment/task             | read own safe                                      | Assigned update; team read queue   | read                    |
| Live Admin location         | own active task subscribe                          | own active task publish            | no by default           |
| Bag/condition               | read customer-safe own                             | write operational                  | read                    |
| Actual weight               | read own                                           | create/correct pre-paid with audit | read                    |
| Invoice                     | read own                                           | trigger server/read                | read                    |
| Payment status              | read own/create attempt                            | read                               | read/refund approve     |
| Set payment paid            | no                                                 | no                                 | no; system webhook only |
| Process/QC                  | read own status                                    | write                              | read                    |
| Delivery/proof              | read own                                           | Assigned write                     | read                    |
| Review                      | CRUD own within window                             | read                               | read analytics          |
| Complaint                   | create/read/respond own                            | handle assigned/queue              | oversee/approve outcome |
| Evidence                    | scoped signed read own                             | scoped operational                 | scoped oversight        |
| Notification                | read own                                           | read own                           | read own                |
| Audit                       | no                                                 | limited entity history             | read/export             |
| Admin accounts/flags        | no                                                 | no                                 | CRUD/enable             |

Setiap allow memiliki deny test: cross-customer, unassigned Admin mutation, disabled user, inactive task, expired window, stale version, dan direct table access. RLS policy tidak menggunakan client-supplied role.
