import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";
import { destinationForRole, isUserRole } from "@/lib/auth/roles";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";

export async function GET(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  if (!isSupabaseAuthConfigured()) {
    loginUrl.searchParams.set("error", "auth_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  const code = request.nextUrl.searchParams.get("code");
  if (!code) {
    loginUrl.searchParams.set("error", "invalid_callback");
    return NextResponse.redirect(loginUrl);
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    loginUrl.searchParams.set("error", "invalid_callback");
    return NextResponse.redirect(loginUrl);
  }

  const requestedPath = sanitizeRedirectPath(
    request.nextUrl.searchParams.get("next"),
    "",
  );
  if (requestedPath === "/reset-password") {
    return NextResponse.redirect(new URL(requestedPath, request.url));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(loginUrl);

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .single();

  if (!profile || profile.status !== "ACTIVE" || !isUserRole(profile.role)) {
    await supabase.auth.signOut({ scope: "local" });
    loginUrl.searchParams.set("error", "profile_unavailable");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.redirect(
    new URL(
      destinationForRole(profile.role, requestedPath || undefined),
      request.url,
    ),
  );
}
