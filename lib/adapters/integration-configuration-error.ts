export class IntegrationConfigurationError extends Error {
  constructor(integration: "Supabase" | "Mapbox" | "Midtrans") {
    super(`${integration} belum dikonfigurasi untuk environment ini.`);
    this.name = "IntegrationConfigurationError";
  }
}
