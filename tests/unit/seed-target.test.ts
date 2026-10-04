import { describe, expect, it } from "vitest";

import { assertSafeSeedTarget } from "@/lib/safety/seed-target";

const safeEnvironment = {
  NODE_ENV: "development",
  SEED_DEMO_DATA: "true",
  NEXT_PUBLIC_SUPABASE_URL: "https://localdemo.supabase.co",
  SEED_ALLOWED_PROJECT_REFS: "localdemo,stagingdemo",
};

describe("seed target guard", () => {
  it("allows an explicitly enabled and allowlisted non-production target", () => {
    expect(assertSafeSeedTarget(safeEnvironment)).toEqual({
      projectRef: "localdemo",
      safe: true,
    });
  });

  it("rejects production and targets outside the allowlist", () => {
    expect(() =>
      assertSafeSeedTarget({ ...safeEnvironment, NODE_ENV: "production" }),
    ).toThrow("NODE_ENV=production");
    expect(() =>
      assertSafeSeedTarget({
        ...safeEnvironment,
        SEED_ALLOWED_PROJECT_REFS: "another",
      }),
    ).toThrow("tidak ada di SEED_ALLOWED_PROJECT_REFS");
  });
});
