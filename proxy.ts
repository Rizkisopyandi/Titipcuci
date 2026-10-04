import { NextResponse, type NextRequest } from "next/server";

import {
  copyResponseCookies,
  refreshSupabaseSession,
} from "@/lib/adapters/supabase/proxy";
import {
  isProtectedPath,
  protectedLoginDestination,
} from "@/lib/auth/route-policy";

export async function proxy(request: NextRequest) {
  const session = await refreshSupabaseSession(request);
  if (isProtectedPath(request.nextUrl.pathname) && !session.user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set(
      "next",
      protectedLoginDestination(
        request.nextUrl.pathname,
        request.nextUrl.search,
      ),
    );
    if (!session.configured)
      loginUrl.searchParams.set("error", "auth_unavailable");

    return copyResponseCookies(
      session.response,
      NextResponse.redirect(loginUrl),
    );
  }

  return session.response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
