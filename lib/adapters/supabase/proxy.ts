import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/lib/adapters/supabase/database.types";
import { getPublicEnvironment } from "@/lib/config/public-env";

type CookieToSet = {
  name: string;
  value: string;
  options: CookieOptions;
};

export async function refreshSupabaseSession(request: NextRequest) {
  const environment = getPublicEnvironment();
  let response = NextResponse.next({ request });

  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return { configured: false as const, response, user: null };
  }

  const supabase = createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet: CookieToSet[]) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { configured: true as const, response, user };
}

export function copyResponseCookies(
  source: NextResponse,
  target: NextResponse,
) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });
  return target;
}
