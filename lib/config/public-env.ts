import { parsePublicEnvironment } from "@/lib/config/environment";

let cachedEnvironment: ReturnType<typeof parsePublicEnvironment> | undefined;

export function getPublicEnvironment() {
  if (!cachedEnvironment) {
    cachedEnvironment = parsePublicEnvironment({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN:
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN,
      NEXT_PUBLIC_FEATURE_LIVE_TRACKING:
        process.env.NEXT_PUBLIC_FEATURE_LIVE_TRACKING,
      NEXT_PUBLIC_FEATURE_REFUND_SIMULATION:
        process.env.NEXT_PUBLIC_FEATURE_REFUND_SIMULATION,
      NEXT_PUBLIC_FEATURE_COMPLAINT_CENTER:
        process.env.NEXT_PUBLIC_FEATURE_COMPLAINT_CENTER,
    });
  }

  return cachedEnvironment;
}
