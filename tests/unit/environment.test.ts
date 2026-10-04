import { describe, expect, it } from "vitest";

import {
  getEnvironmentReadiness,
  parsePublicEnvironment,
  parseServerEnvironment,
} from "@/lib/config/environment";

describe("environment configuration", () => {
  it("uses safe local defaults without inventing integration credentials", () => {
    const publicEnvironment = parsePublicEnvironment({});
    const serverEnvironment = parseServerEnvironment({});

    expect(publicEnvironment.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(publicEnvironment.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(serverEnvironment.MIDTRANS_IS_PRODUCTION).toBe(false);
    expect(serverEnvironment.APP_TIMEZONE).toBe("Asia/Jakarta");
  });

  it("reports readiness without returning secret values", () => {
    const readiness = getEnvironmentReadiness({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-role-secret",
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: "pk.mapbox-token",
      MIDTRANS_SERVER_KEY: "midtrans-secret",
      MIDTRANS_CLIENT_KEY: "midtrans-client",
    });

    expect(readiness.integrations.every((item) => item.configured)).toBe(true);
    expect(JSON.stringify(readiness)).not.toContain("service-role-secret");
    expect(JSON.stringify(readiness)).not.toContain("midtrans-secret");
  });
});
