import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const states = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261006000100_m4_order_states.sql",
  ),
  "utf8",
).toLowerCase();

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261006000200_m4_weight_invoice.sql",
  ),
  "utf8",
).toLowerCase();

describe("M4 weight/invoice migration and TST-INT-INV-001", () => {
  it("adds only the documented M4 order states", () => {
    expect(states).toContain("add value if not exists 'weighed'");
    expect(states).toContain("add value if not exists 'waiting_payment'");
    expect(states).not.toMatch(/paid|processing|quality|delivery/);
  });

  it("allows only active Admin to record weight in RECEIVED or correct WEIGHED", () => {
    expect(migration).toContain("create function public.record_actual_weight");
    expect(migration).toContain("not public.is_active_admin()");
    expect(migration).toContain(
      "v_order.status not in ('received'::public.order_status, 'weighed'::public.order_status)",
    );
    expect(migration).toContain("v_is_correction and (v_reason is null");
    expect(migration).toContain("message = 'ord_001'");
    expect(migration).not.toMatch(
      /p_(customer|actor|status|total|price|snapshot)/,
    );
  });

  it("requires every order item exactly once with positive two-decimal actual quantity", () => {
    expect(migration).toContain(
      "jsonb_array_length(p_actual_items) <> v_item_count",
    );
    expect(migration).toContain("count(distinct value ->> 'orderitemid')");
    expect(migration).toContain("v_actual_qty <= 0");
    expect(migration).toContain("round(v_actual_qty, 2) <> v_actual_qty");
    expect(migration).toContain("v_actual_qty >= 100000000");
    expect(migration).toContain("set actual_qty = v_actual_qty");
  });

  it("calculates final pricing from locked order snapshots and documented minimums", () => {
    expect(migration).toContain("v_item.service_snapshot ->> 'priceversionid'");
    expect(migration).toContain("v_item.service_snapshot ->> 'unitprice'");
    expect(migration).toContain("v_item.service_snapshot ->> 'minimumcharge'");
    expect(migration).toContain(
      "greatest(v_minimum_charge, v_unit_price * v_item.actual_qty)",
    );
    expect(migration).toContain("'formulaversion', 'm4_v1'");
    expect(migration).toContain("'discount', v_discount");
    expect(migration).toContain("'surcharge', v_surcharge");
    expect(migration).toContain("'tax', v_tax");
  });

  it("creates one transactional invoice and immutable itemized snapshot", () => {
    expect(migration).toContain("order_id uuid not null unique");
    expect(migration).toContain("unique (invoice_id, source_ref)");
    expect(migration).toContain("create trigger invoices_financial_immutable");
    expect(migration).toContain("create trigger invoice_items_append_only");
    expect(migration).toContain(
      "new.pricing_snapshot is distinct from old.pricing_snapshot",
    );
    expect(migration).toContain("insert into public.invoice_items");
  });

  it("is retry-safe and rejects duplicate or skipped invoice commands", () => {
    expect(migration).toContain(
      "pg_advisory_xact_lock(hashtextextended(v_actor_id::text || ':' || p_idempotency_key",
    );
    expect(migration).toContain("v_receipt.command <> 'record_weight'");
    expect(migration).toContain("v_receipt.command <> 'issue_invoice'");
    expect(migration).toContain(
      "v_order.status <> 'weighed'::public.order_status",
    );
    expect(migration).toContain("exists (select 1 from public.invoices i");
  });

  it("writes both state transitions, history, audit, outbox, and notifications", () => {
    expect(migration).toContain("'received'::public.order_status, 'weighed'");
    expect(migration).toContain(
      "'weighed'::public.order_status, 'waiting_payment'",
    );
    expect(migration).toContain("'weight_recorded'");
    expect(migration).toContain("'invoice_issued'");
    expect(migration).toContain("insert into public.order_status_history");
    expect(migration).toContain("insert into public.audit_logs");
    expect(migration).toContain("insert into public.domain_outbox");
    expect(migration).toContain("insert into public.notifications");
  });

  it("keeps direct writes closed and scopes invoice reads by ownership/role", () => {
    expect(migration).toContain(
      "revoke all on table public.invoices, public.invoice_items from anon, authenticated",
    );
    expect(migration).not.toMatch(
      /grant\s+(insert|update|delete)[^;]*to authenticated/,
    );
    expect(migration).toContain("create policy invoices_customer_read_own");
    expect(migration).toContain("o.customer_id = auth.uid()");
    expect(migration).toContain("create policy invoices_admin_owner_read");
    expect(migration).toContain(
      "using (public.is_active_admin() or public.is_active_owner())",
    );
  });

  it("does not implement payment execution or mark anything paid", () => {
    expect(migration).not.toContain("payment_attempt");
    expect(migration).not.toContain("midtrans");
    expect(migration).not.toContain("'payment_paid'");
    expect(migration).not.toMatch(/set\s+status\s*=\s*'paid'/);
  });
});
