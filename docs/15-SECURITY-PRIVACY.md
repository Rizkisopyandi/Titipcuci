# 15 — Security & Privacy

## Controls wajib

- Supabase Auth, secure HttpOnly/session handling yang direkomendasikan, email verification sesuai deployment.
- RLS default deny; policy diuji untuk setiap role/ownership/assignment.
- Server-side Zod validation, output minimization, CSRF protection sesuai mutation mechanism, safe redirects.
- Rate limit login, order creation, upload intent, payment create, webhook, complaint.
- Secret hanya server/Vercel encrypted env; rotasi dan domain restriction Mapbox.
- Private bucket, random path, allowed MIME/size, signed URL pendek; jangan percaya extension.
- Parameterized query/Supabase SDK; escape output; CSP/security headers; dependency scanning.

## Sensitive data

PII: nama, phone, address, coordinate, delivery proof. Financial operational: invoice/payment identifiers. Sensitive operational: allergy/treatment notes, complaint evidence. Terapkan purpose limitation, least access, masked display, retention, export/deletion workflow yang menghormati kewajiban transaksi.

## Live location

Consent/indicator Admin, limited purpose, active-task scope, ephemeral retention, no analytics replay. Lihat [Live Map](11-LIVE-MAP-SPEC.md).

## Audit vs log

Audit adalah record bisnis append-only terkontrol. Application log untuk diagnosis dan wajib meredaksi token, password, authorization header, server key, full address/coordinate, QR/VA payload, signed URL, dan evidence content. Gunakan user/order ID pseudonymous dan correlation ID.

## Threat scenarios

IDOR order/evidence; role tampering; forged/replayed webhook; duplicate mutation; slot race; price manipulation; malicious upload; location channel spying; leaked token; audit deletion; CSV injection pada export. Semuanya harus memiliki test/mitigasi sebelum release.

## Incident minimum

Contain: disable flag/key/user, preserve logs/audit, assess scope, rotate secret, patch, verify, communicate secara proporsional, postmortem. Jangan menghapus bukti. Production legal/privacy review tetap diperlukan sebelum live.
