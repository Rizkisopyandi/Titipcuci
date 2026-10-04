import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const states = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261005000100_m3_order_states.sql",
  ),
  "utf8",
).toLowerCase();

const operations = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261005000200_m3_admin_order_operations.sql",
  ),
  "utf8",
).toLowerCase();

describe("M3 Admin operations migration and TST-SEC-RLS-001", () => {
  it("adds only documented M3 and terminal order states", () => {
    for (const status of [
      "confirmed",
      "pickup_scheduled",
      "pickup_on_the_way",
      "picked_up",
      "received",
      "rejected",
      "cancelled",
    ]) {
      expect(states).toContain(`add value if not exists '${status}'`);
    }
    expect(states).not.toMatch(/weigh|invoice|payment|washing|delivery/);
  });

  it("derives the active Admin actor and guards version plus every transition", () => {
    expect(operations).toContain("v_actor_id uuid := auth.uid()");
    expect(operations).toContain("not public.is_active_admin()");
    expect(operations).toContain("v_order.version <> p_expected_version");
    expect(operations).toContain("message = 'ord_003'");
    expect(operations).toContain(
      "p_command = 'confirm' and v_order.status = 'pending_confirmation'",
    );
    expect(operations).toContain(
      "p_command = 'schedule_pickup' and v_order.status = 'confirmed'",
    );
    expect(operations).toContain(
      "p_command = 'start_pickup' and v_order.status = 'pickup_scheduled'",
    );
    expect(operations).toContain(
      "p_command = 'complete_pickup' and v_order.status = 'pickup_on_the_way'",
    );
    expect(operations).toContain(
      "p_command = 'arrive_pickup' and v_order.status = 'pickup_on_the_way'",
    );
    expect(operations).toContain(
      "p_command = 'receive' and v_order.status = 'picked_up'",
    );
    expect(operations).toContain("message = 'ord_001'");
    expect(operations).not.toMatch(/p_(actor|customer|status)/);
  });

  it("restricts pickup execution to the assigned Admin", () => {
    const assignedGuard =
      "t.order_id = v_order.id and t.assigned_admin_id = v_actor_id";
    expect(
      operations.match(new RegExp(assignedGuard, "g"))?.length,
    ).toBeGreaterThanOrEqual(2);
    expect(operations).toContain(
      "create policy m3_pickup_evidence_admin_insert",
    );
    expect(operations).toContain("t.assigned_admin_id = auth.uid()");
  });

  it("keeps direct business writes closed and scopes reads by role/ownership", () => {
    expect(operations).toContain(
      "revoke all on table public.pickup_delivery_tasks",
    );
    expect(operations).not.toMatch(
      /grant\s+(insert|update|delete)[^;]*to authenticated/,
    );
    expect(operations).toContain("create policy orders_admin_read");
    expect(operations).toContain("using (public.is_active_admin())");
    expect(operations).toContain(
      "create policy pickup_tasks_customer_read_own",
    );
    expect(operations).toContain("o.customer_id = auth.uid()");
    expect(operations).toContain("create policy pickup_tasks_admin_owner_read");
    expect(operations).toContain("create policy bag_records_admin_owner_read");
    expect(operations).toContain(
      "create policy condition_records_admin_owner_read",
    );
    expect(operations).toContain(
      "create policy order_evidence_admin_owner_read",
    );
    expect(operations).toContain("create policy audit_logs_owner_read");
    expect(operations).toContain(
      "using (public.is_active_admin() or public.is_active_owner())",
    );
    expect(operations).toContain(
      "grant select (id, order_id, task_id, kind, mime_type, size_bytes, sha256, uploaded_by, created_at)",
    );
    expect(operations).not.toMatch(/grant select \([^)]*storage_path/);
  });

  it("records immutable history, audit, events, notifications, and idempotency", () => {
    expect(operations).toContain(
      "create trigger order_status_history_append_only",
    );
    expect(operations).toContain("create trigger audit_logs_append_only");
    expect(operations).toContain("insert into public.order_status_history");
    expect(operations).toContain("insert into public.audit_logs");
    expect(operations).toContain("insert into public.domain_outbox");
    expect(operations).toContain("insert into public.notifications");
    expect(operations).toContain("unique (actor_id, idempotency_key)");
    expect(operations).toContain("p_correlation_id");
  });

  it("preserves M2 order creation history after actor_role becomes mandatory", () => {
    expect(operations).toContain(
      "create function public.set_order_history_actor_role()",
    );
    expect(operations).toContain(
      "before insert on public.order_status_history",
    );
    expect(operations).toContain("select p.role into new.actor_role");
  });

  it("keeps proof private and validates bag/condition/proof before pickup completion", () => {
    expect(operations).toContain("'order-evidence',\n  false,");
    expect(operations).toContain("file_size_limit");
    expect(operations).toContain("allowed_mime_types");
    expect(operations).toContain("insert into public.bag_records");
    expect(operations).toContain("insert into public.condition_records");
    expect(operations).toContain("insert into public.order_evidence");
    expect(operations).toContain("message = 'bag_001'");
    expect(operations).toContain("v_event_type := 'pickup_arrived'");
  });
});
