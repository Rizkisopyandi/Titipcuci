import { z } from "zod";

const seedTargetSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SEED_DEMO_DATA: z.literal("true"),
  NEXT_PUBLIC_SUPABASE_URL: z.url(),
  SEED_ALLOWED_PROJECT_REFS: z.string().min(1),
  PRODUCTION_SUPABASE_PROJECT_REF: z.string().min(1).optional(),
});

export function getSupabaseProjectRef(url: string) {
  return new URL(url).hostname.split(".")[0] ?? "";
}

export function assertSafeSeedTarget(
  source: Readonly<Record<string, string | undefined>>,
) {
  const environment = seedTargetSchema.parse(source);
  const projectRef = getSupabaseProjectRef(
    environment.NEXT_PUBLIC_SUPABASE_URL,
  );
  const allowlist = environment.SEED_ALLOWED_PROJECT_REFS.split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (environment.NODE_ENV === "production") {
    throw new Error("Seed demo ditolak pada NODE_ENV=production.");
  }

  if (environment.PRODUCTION_SUPABASE_PROJECT_REF === projectRef) {
    throw new Error("Seed demo ditolak untuk project ref produksi.");
  }

  if (!allowlist.includes(projectRef)) {
    throw new Error(
      "Project ref target tidak ada di SEED_ALLOWED_PROJECT_REFS.",
    );
  }

  return { projectRef, safe: true as const };
}
