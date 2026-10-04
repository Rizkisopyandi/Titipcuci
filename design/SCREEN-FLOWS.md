# Screen Flows

## Customer

`Landing → Login/Register → Dashboard → New Order(Service → Address/Pin → Slot → Preferences → Review) → Order Detail → Live Pickup → Weight/Approval → Invoice/Payment → Progress → Live Delivery → Proof/Completed → Review or Complaint`.

Customer exception links: outside area returns Address; slot conflict returns Slot preserving input; reschedule/cancel modal returns Detail; approval panel approve/reject; payment expired offers new attempt; failed delivery offers coordination; complaint opens from eligible order.

## Admin

`Login → Operations Queue → Order Detail → Confirm/Assign → Pickup Task/Map → Bag & Condition → Receive & Weight → Invoice/Approval → Processing Board → QC → Reprocess loop or Ready → Delivery Task/Map → Proof → Complete`.

Delay/hold actions always require reason and revised next step. Admin sees payment read-only and never paid button.

## Owner

`Login → KPI Dashboard → drill-down Orders/Revenue/Complaints → Audit`; governance branches to Service/Pricing, Area/Slots, Admins, Refund approvals, Feature Flags.

## Navigation/state rules

Direct URL refresh resolves canonical state and redirects only to role home if inaccessible. Back navigation never resubmits mutation. Wizard draft is local until final submit; stateful operational steps derive from server snapshot. Cross-role preview is prohibited unless permission explicitly allows.
