import { z } from "zod";

const optionalString = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.string().trim().min(1).optional(),
);

const optionalUrl = z.preprocess(
  (value) =>
    typeof value === "string" && value.trim() === "" ? undefined : value,
  z.url().optional(),
);

const booleanString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

export const publicEnvironmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: optionalString,
  NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: optionalString,
  NEXT_PUBLIC_FEATURE_LIVE_TRACKING: booleanString,
  NEXT_PUBLIC_FEATURE_REFUND_SIMULATION: booleanString,
  NEXT_PUBLIC_FEATURE_COMPLAINT_CENTER: booleanString,
});

export const serverEnvironmentSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  SUPABASE_SERVICE_ROLE_KEY: optionalString,
  MIDTRANS_SERVER_KEY: optionalString,
  MIDTRANS_CLIENT_KEY: optionalString,
  MIDTRANS_IS_PRODUCTION: booleanString,
  MIDTRANS_WEBHOOK_ALLOWLIST: optionalString,
  APP_TIMEZONE: z.string().trim().min(1).default("Asia/Jakarta"),
  LOCATION_RETENTION_MINUTES: z.coerce.number().int().positive().default(30),
  SIGNED_URL_TTL_SECONDS: z.coerce.number().int().positive().default(300),
  CRON_SECRET: optionalString,
  SEED_DEMO_DATA: booleanString,
  SEED_ALLOWED_PROJECT_REFS: optionalString,
  PRODUCTION_SUPABASE_PROJECT_REF: optionalString,
});

export type PublicEnvironment = z.infer<typeof publicEnvironmentSchema>;
export type ServerEnvironment = z.infer<typeof serverEnvironmentSchema>;
type EnvironmentSource = Readonly<Record<string, string | undefined>>;

export function parsePublicEnvironment(
  source: EnvironmentSource,
): PublicEnvironment {
  return publicEnvironmentSchema.parse(source);
}

export function parseServerEnvironment(
  source: EnvironmentSource,
): ServerEnvironment {
  return serverEnvironmentSchema.parse(source);
}

export function getEnvironmentReadiness(source: EnvironmentSource) {
  const publicEnvironment = parsePublicEnvironment(source);
  const serverEnvironment = parseServerEnvironment(source);

  return {
    integrations: [
      {
        key: "supabase",
        name: "Supabase",
        configured: Boolean(
          publicEnvironment.NEXT_PUBLIC_SUPABASE_URL &&
          publicEnvironment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
          serverEnvironment.SUPABASE_SERVICE_ROLE_KEY,
        ),
      },
      {
        key: "mapbox",
        name: "Mapbox",
        configured: Boolean(publicEnvironment.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN),
      },
      {
        key: "midtrans",
        name: "Midtrans Sandbox",
        configured: Boolean(
          serverEnvironment.MIDTRANS_SERVER_KEY &&
          serverEnvironment.MIDTRANS_CLIENT_KEY,
        ),
      },
    ] as const,
  };
}
