import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migration = readFileSync(
  join(
    process.cwd(),
    "supabase",
    "migrations",
    "20261003000100_m1_auth_profiles.sql",
  ),
  "utf8",
).toLowerCase();

describe("M1 profile migration security", () => {
  it("defines only the three approved roles", () => {
    expect(migration).toContain(
      "create type public.user_role as enum ('owner', 'admin', 'customer')",
    );
  });

  it("links profiles one-to-one to auth.users and enables RLS", () => {
    expect(migration).toContain(
      "id uuid primary key references auth.users (id) on delete restrict",
    );
    expect(migration).toContain(
      "alter table public.profiles enable row level security",
    );
  });

  it("limits authenticated users to reading and editing their own safe fields", () => {
    expect(migration).toContain(
      "grant select on table public.profiles to authenticated",
    );
    expect(migration).toContain(
      "grant update (full_name, phone) on table public.profiles to authenticated",
    );
    expect(migration).toContain("using ((select auth.uid()) = id)");
    expect(migration).toContain("with check ((select auth.uid()) = id)");
    expect(migration).not.toMatch(
      /grant\s+insert[^;]*profiles[^;]*authenticated/,
    );
  });

  it("hardcodes public registrations to Customer without trusting role metadata", () => {
    expect(migration).toContain("'customer'::public.user_role");
    expect(migration).not.toContain("raw_user_meta_data ->> 'role'");
  });

  it("does not expose role or status through the authenticated update grant", () => {
    const updateGrant = migration.match(
      /grant update \(([^)]+)\) on table public\.profiles to authenticated/,
    );

    expect(updateGrant?.[1]).toBe("full_name, phone");
  });
});
