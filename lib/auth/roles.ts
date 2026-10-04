import type { UserRole } from "@/lib/adapters/supabase/database.types";

export type { UserRole } from "@/lib/adapters/supabase/database.types";

export const USER_ROLES = [
  "OWNER",
  "ADMIN",
  "CUSTOMER",
] as const satisfies readonly UserRole[];

export const ROLE_HOME: Readonly<Record<UserRole, string>> = {
  OWNER: "/owner",
  ADMIN: "/admin",
  CUSTOMER: "/app",
};

export type ProtectedArea = "owner" | "admin" | "customer";

const AREA_ROLE: Readonly<Record<ProtectedArea, UserRole>> = {
  owner: "OWNER",
  admin: "ADMIN",
  customer: "CUSTOMER",
};

export function isUserRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export function canAccessArea(role: UserRole, area: ProtectedArea) {
  return AREA_ROLE[area] === role;
}

export function areaForPath(path: string): ProtectedArea | null {
  if (path === "/owner" || path.startsWith("/owner/")) return "owner";
  if (path === "/admin" || path.startsWith("/admin/")) return "admin";
  if (path === "/app" || path.startsWith("/app/")) return "customer";
  return null;
}

export function destinationForRole(role: UserRole, requestedPath?: string) {
  const area = requestedPath ? areaForPath(requestedPath) : null;
  return area && canAccessArea(role, area) ? requestedPath! : ROLE_HOME[role];
}
