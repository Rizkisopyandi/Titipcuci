# 31 — Data Validation Rules

Validasi client untuk UX; server + DB adalah otoritas.

| Field/domain       | Rule                                                              |
| ------------------ | ----------------------------------------------------------------- |
| email              | format valid, normalized; uniqueness Auth                         |
| phone              | normalized Indonesia/international, panjang wajar                 |
| role               | enum, tidak diterima dari public registration                     |
| latitude/longitude | −90..90 / −180..180; server serviceability                        |
| slot               | future, active, capacity atomik                                   |
| item qty estimate  | >0; actual qty >0, Admin only                                     |
| bag count          | integer 1..configured max; received matches atau issue            |
| money              | numeric ≥0, IDR precision, server calculated                      |
| invoice total      | sum item ± adjustments/tax; snapshot required                     |
| payment amount     | exact invoice outstanding; server source                          |
| state/version      | enum dan expected version/transitions valid                       |
| reason             | required untuk reject/cancel/delay/hold/correction/QC fail/refund |
| notes              | trimmed, max length, sanitized on render                          |
| rating             | integer 1–5; one/order/customer                                   |
| complaint          | category enum, description 20–2000 chars, within window           |
| evidence           | allowlisted MIME, max 10 MB/file, max count, private path, hash   |
| idempotency key    | UUID/opaque 16–128 chars, scoped actor+endpoint, expiry policy    |
| webhook            | payload limit, signature, amount/order/environment/status         |
| timestamps         | server generated where authoritative; start≤end                   |

Cross-field rules: pickup proof requires active assigned task; invoice requires received + all actual qty; processing requires paid; delivery requires QC pass/ready; complete delivery requires proof; complaint/refund amount cannot exceed eligible paid amount.
