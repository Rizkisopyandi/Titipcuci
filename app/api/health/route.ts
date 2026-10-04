import { NextResponse, type NextRequest } from "next/server";

import { getEnvironmentReadiness } from "@/lib/config/environment";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import { logger } from "@/lib/observability/logger";

export const dynamic = "force-dynamic";

export function GET(request: NextRequest) {
  const requestId = getCorrelationId(request.headers);
  const readiness = getEnvironmentReadiness(process.env);

  logger.info("health_check_completed", {
    requestId,
    configuredIntegrations: readiness.integrations
      .filter((item) => item.configured)
      .map((item) => item.key),
  });

  return NextResponse.json(
    {
      data: {
        status: "ok",
        service: "titipcuci-web",
        milestone: "M0",
        timestamp: new Date().toISOString(),
        integrations: Object.fromEntries(
          readiness.integrations.map((item) => [
            item.key,
            item.configured ? "configured" : "not_configured",
          ]),
        ),
      },
      meta: { requestId },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
        "X-Request-Id": requestId,
      },
    },
  );
}
