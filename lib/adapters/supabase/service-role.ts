import "server-only";

import { createClient } from "@supabase/supabase-js";

import { IntegrationConfigurationError } from "@/lib/adapters/integration-configuration-error";
import type { Database } from "@/lib/adapters/supabase/database.types";
import { getPublicEnvironment } from "@/lib/config/public-env";
import { getServerEnvironment } from "@/lib/config/server-env";

export function createServiceRoleSupabaseClient() {
  const publicEnvironment = getPublicEnvironment();
  const serverEnvironment = getServerEnvironment();

  if (
    !publicEnvironment.NEXT_PUBLIC_SUPABASE_URL ||
    !serverEnvironment.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new IntegrationConfigurationError("Supabase");
  }

  return createClient<Database>(
    publicEnvironment.NEXT_PUBLIC_SUPABASE_URL,
    serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
