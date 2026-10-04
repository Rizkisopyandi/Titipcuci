import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { IntegrationConfigurationError } from "@/lib/adapters/integration-configuration-error";
import type { Database } from "@/lib/adapters/supabase/database.types";
import { getPublicEnvironment } from "@/lib/config/public-env";

export async function createServerSupabaseClient() {
  const environment = getPublicEnvironment();

  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new IntegrationConfigurationError("Supabase");
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
