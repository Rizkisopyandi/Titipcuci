import { IntegrationConfigurationError } from "@/lib/adapters/integration-configuration-error";
import { getPublicEnvironment } from "@/lib/config/public-env";

export type MapboxBrowserConfiguration = Readonly<{
  provider: "mapbox";
  accessToken: string;
}>;

export function getMapboxBrowserConfiguration(): MapboxBrowserConfiguration {
  const accessToken = getPublicEnvironment().NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  if (!accessToken) {
    throw new IntegrationConfigurationError("Mapbox");
  }

  return { provider: "mapbox", accessToken };
}
