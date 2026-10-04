# 30 — Analytics & KPI Specification

Semua KPI memakai waktu event UTC yang difilter dalam timezone Asia/Jakarta, order demo/test dikecualikan dari produksi, dan drill-down harus menjelaskan numerator/denominator.

| KPI                       | Formula                                                                                 |
| ------------------------- | --------------------------------------------------------------------------------------- |
| Gross paid revenue        | sum invoice total dengan payment PAID, dikurangi simulated refund hanya pada metric net |
| Net simulated revenue     | gross paid − approved refunded amount                                                   |
| Average order value       | gross paid / distinct paid orders                                                       |
| Completion rate           | completed / confirmed cohort                                                            |
| Cancellation rate         | cancelled / created orders                                                              |
| On-time pickup rate       | pickup started/arrived sesuai threshold / completed pickups                             |
| Avg processing time       | READY_FOR_DELIVERY time − PAID/processing start, exclude documented hold duration       |
| Reprocess rate            | orders with QC fail / orders entering QC                                                |
| Late order rate           | completed orders ever delayed / completed orders                                        |
| Repeat customer rate      | customers with >1 completed order / customers with ≥1 completed order                   |
| Complaint rate            | orders with eligible complaint / delivered orders                                       |
| Complaint resolution time | resolved_at − created_at minus paused SLA time                                          |
| Payment conversion        | paid invoices / invoices with payment attempt                                           |

## Filters dan freshness

Periode, service, area, status; Admin filter opsional. Dashboard menunjukkan last updated dan empty data. Tidak menampilkan ranking sensitif/PII tanpa kebutuhan. Query/view KPI memiliki fixture expected results dan `TST-INT-KPI-001`.
