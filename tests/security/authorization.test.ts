import { describe, expect, it } from "vitest";

import {
  canAccessArea,
  destinationForRole,
  type ProtectedArea,
  type UserRole,
} from "@/lib/auth/roles";
import {
  isProtectedPath,
  protectedLoginDestination,
} from "@/lib/auth/route-policy";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";

const matrix: Array<[UserRole, ProtectedArea, boolean]> = [
  ["CUSTOMER", "customer", true],
  ["CUSTOMER", "admin", false],
  ["CUSTOMER", "owner", false],
  ["ADMIN", "customer", false],
  ["ADMIN", "admin", true],
  ["ADMIN", "owner", false],
  ["OWNER", "customer", false],
  ["OWNER", "admin", false],
  ["OWNER", "owner", true],
];

describe("RBAC authorization", () => {
  it.each(matrix)("allows %s access to %s: %s", (role, area, expected) => {
    expect(canAccessArea(role, area)).toBe(expected);
  });

  it("routes each role only to its own protected shell", () => {
    expect(destinationForRole("CUSTOMER", "/admin")).toBe("/app");
    expect(destinationForRole("ADMIN", "/owner/settings")).toBe("/admin");
    expect(destinationForRole("OWNER", "/app/orders")).toBe("/owner");
    expect(destinationForRole("CUSTOMER", "/app/profile?tab=security")).toBe(
      "/app/profile?tab=security",
    );
  });

  it.each(["/app", "/app/profile", "/admin", "/owner/settings"])(
    "marks %s as protected",
    (path) => expect(isProtectedPath(path)).toBe(true),
  );

  it("does not confuse similarly-prefixed public paths with protected areas", () => {
    expect(isProtectedPath("/application")).toBe(false);
    expect(isProtectedPath("/administrator")).toBe(false);
  });

  it("preserves the original protected path and query for login", () => {
    expect(protectedLoginDestination("/app/profile", "?tab=security")).toBe(
      "/app/profile?tab=security",
    );
  });

  it.each([
    "https://attacker.example/path",
    "//attacker.example/path",
    "/\\attacker.example/path",
    "/app\r\nLocation:https://attacker.example",
  ])("blocks unsafe redirect %s", (value) => {
    expect(sanitizeRedirectPath(value, "/login")).toBe("/login");
  });
});
