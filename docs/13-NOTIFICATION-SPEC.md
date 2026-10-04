# 13 — Notification Specification

Channel wajib v1: in-app realtime + inbox persisten. Email/WhatsApp/push adalah backlog dan tidak boleh memblokir transaksi.

## Trigger minimum

Customer: order created/confirmed/rejected, pickup started/delayed/arrived, issue/approval required, weight/invoice issued, payment paid/expired, stage milestone, QC reprocess (pesan netral), ready, delivery started/failed/delivered, auto-complete, complaint update/resolution.

Admin: new order, schedule change/cancel, approval response, payment paid, due processing/QC/delivery, complaint new/SLA warning. Owner: critical payment mismatch, overdue complaint, repeated operational failure, refund approval request.

## Model dan dedupe

Notification memakai template code, recipient, localized variables, entity link, severity, created/read time, dan `dedupe_key = eventId:userId:template`. Konten tidak memuat secret, detail lokasi live, atau informasi sensitif di preview.

## UX

Unread badge, inbox paginated, mark one/all read, deep link yang di-authorize ulang. Failure realtime tetap muncul setelah fetch. Status delivery channel bukan bukti business event.

## Template governance

Bahasa Indonesia formal-natural, action jelas, waktu absolut + zona, dan tidak menyalahkan pihak. Template perubahan kebijakan harus direview. Event catalog adalah sumber trigger; jangan mengirim dari komponen UI.
