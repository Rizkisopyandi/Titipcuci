import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261004000100_m2_customer_orders.sql",
  ),
  "utf8",
).toLowerCase();

describe("M2 order migration and TST-SEC-RLS-001", () => {
  it("uses the documented initial state and server-owned preliminary price", () => {
    expect(migration).toContain(
      "create type public.order_status as enum ('pending_confirmation')",
    );
    expect(migration).toContain("'pending_confirmation'::public.order_status");
    expect(migration).toContain(
      "greatest(v_price.minimum_charge, v_price.unit_price * v_estimated_qty)",
    );
    expect(migration).not.toMatch(
      /p_(actual_qty|final_price|status|customer_id)/,
    );
  });

  it("validates serviceability then reserves matching future capacity atomically", () => {
    expect(migration).toContain("extensions.st_covers");
    expect(migration).toContain("message = 'svc_001'");
    expect(migration).toContain("set reserved_count = ps.reserved_count + 1");
    expect(migration).toContain("ps.reserved_count < ps.capacity");
    expect(migration).toContain("message = 'slot_001'");
  });

  it("allows Customer reads only through auth.uid ownership policies", () => {
    expect(migration).toContain("create policy orders_select_own");
    expect(migration).toContain("(select auth.uid()) = customer_id");
    expect(migration).toContain("create policy order_items_select_own");
    expect(migration).toContain("o.customer_id = (select auth.uid())");
    expect(migration).not.toMatch(
      /grant\s+insert[^;]*public\.orders[^;]*authenticated/,
    );
    expect(migration).not.toMatch(
      /create policy orders_(insert|update|delete)/,
    );
  });

  it("derives the actor from auth and rejects non-Customer callers", () => {
    expect(migration).toContain("v_customer_id uuid := auth.uid()");
    expect(migration).toContain("p.role = 'customer'::public.user_role");
    expect(migration).toContain("p.status = 'active'::public.profile_status");
  });

  it("writes history, ORDER_CREATED outbox, and deduplicated notifications", () => {
    expect(migration).toContain("insert into public.order_status_history");
    expect(migration).toContain("'order_created'");
    expect(migration).toContain("insert into public.domain_outbox");
    expect(migration).toContain("insert into public.notifications");
    expect(migration).toContain("unique (customer_id, idempotency_key)");
  });
});
