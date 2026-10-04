import { getPublicEnvironment } from "@/lib/config/public-env";

export function isSupabaseAuthConfigured() {
  const environment = getPublicEnvironment();
  return Boolean(
    environment.NEXT_PUBLIC_SUPABASE_URL &&
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
