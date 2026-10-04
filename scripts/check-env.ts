import { getEnvironmentReadiness } from "@/lib/config/environment";

const readiness = getEnvironmentReadiness(process.env);
const summary = readiness.integrations.map((integration) => ({
  integration: integration.name,
  configured: integration.configured,
}));

console.log(JSON.stringify({ ok: true, integrations: summary }, null, 2));
