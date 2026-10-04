import "server-only";

import { redirect } from "next/navigation";

import type {
  ProfileStatus,
  UserRole,
} from "@/lib/adapters/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";
import { canAccessArea, ROLE_HOME, type ProtectedArea } from "@/lib/auth/roles";

export type AuthPrincipal = Readonly<{
  id: string;
  email: string | null;
  role: UserRole;
  status: ProfileStatus;
  fullName: string | null;
}>;

export async function getCurrentPrincipal(): Promise<AuthPrincipal | null> {
  if (!isSupabaseAuthConfigured()) return null;

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role, full_name, status")
    .eq("id", user.id)
    .single();

  if (profileError || !profile || profile.status !== "ACTIVE") return null;

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile.role,
    status: profile.status,
    fullName: profile.full_name,
  };
}

export async function requireArea(area: ProtectedArea) {
  const principal = await getCurrentPrincipal();
  const requestedPath = area === "customer" ? "/app" : `/${area}`;

  if (!principal) {
    redirect(`/login?next=${encodeURIComponent(requestedPath)}`);
  }

  if (!canAccessArea(principal.role, area)) {
    redirect("/unauthorized");
  }

  return principal;
}

export async function redirectAuthenticatedPrincipal() {
  const principal = await getCurrentPrincipal();
  if (principal) redirect(ROLE_HOME[principal.role]);
}
