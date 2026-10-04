import "server-only";

import { IntegrationConfigurationError } from "@/lib/adapters/integration-configuration-error";
import { getServerEnvironment } from "@/lib/config/server-env";

export type MidtransConfiguration = Readonly<{
  environment: "sandbox" | "production";
  serverKey: string;
  clientKey: string;
  apiBaseUrl: string;
}>;

export function getMidtransConfiguration(): MidtransConfiguration {
  const environment = getServerEnvironment();

  if (!environment.MIDTRANS_SERVER_KEY || !environment.MIDTRANS_CLIENT_KEY) {
    throw new IntegrationConfigurationError("Midtrans");
  }

  const isProduction = environment.MIDTRANS_IS_PRODUCTION;

  return {
    environment: isProduction ? "production" : "sandbox",
    serverKey: environment.MIDTRANS_SERVER_KEY,
    clientKey: environment.MIDTRANS_CLIENT_KEY,
    apiBaseUrl: isProduction
      ? "https://api.midtrans.com"
      : "https://api.sandbox.midtrans.com",
  };
}
