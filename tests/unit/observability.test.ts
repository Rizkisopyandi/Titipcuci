import { describe, expect, it } from "vitest";

import { getCorrelationId } from "@/lib/observability/correlation-id";
import { redactLogValue } from "@/lib/observability/logger";

describe("observability safeguards", () => {
  it("keeps safe request IDs and replaces unsafe input", () => {
    expect(
      getCorrelationId(new Headers({ "x-request-id": "request-1234" })),
    ).toBe("request-1234");
    expect(
      getCorrelationId(new Headers({ "x-request-id": "unsafe value" })),
    ).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("redacts nested credentials and sensitive location data", () => {
    expect(
      redactLogValue({
        token: "secret",
        payload: { latitude: -6.2, status: "ok" },
      }),
    ).toEqual({
      token: "[REDACTED]",
      payload: { latitude: "[REDACTED]", status: "ok" },
    });
  });
});
