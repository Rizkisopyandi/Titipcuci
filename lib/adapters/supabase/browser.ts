import { createBrowserClient } from "@supabase/ssr";

import { IntegrationConfigurationError } from "@/lib/adapters/integration-configuration-error";
import type { Database } from "@/lib/adapters/supabase/database.types";
import { getPublicEnvironment } from "@/lib/config/public-env";

export function createBrowserSupabaseClient() {
  const environment = getPublicEnvironment();

  if (
    !environment.NEXT_PUBLIC_SUPABASE_URL ||
    !environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    throw new IntegrationConfigurationError("Supabase");
  }

  return createBrowserClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
