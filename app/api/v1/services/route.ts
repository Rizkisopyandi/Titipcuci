import { NextResponse } from "next/server";

import { apiError, requireCustomerApi } from "@/features/orders/api";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCorrelationId } from "@/lib/observability/correlation-id";

export async function GET(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const auth = await requireCustomerApi(requestId);
  if (!auth.ok) return auth.response;

  const supabase = await createServerSupabaseClient();
  const [services, prices] = await Promise.all([
    supabase
      .from("services")
      .select("id, code, name, unit, duration_hours")
      .eq("active", true)
      .order("name"),
    supabase
      .from("service_price_versions")
      .select("id, service_id, unit_price, minimum_charge, effective_from"),
  ]);
  if (services.error || prices.error) {
    return apiError(
      "SYS_001",
      "Terjadi kendala. Gunakan ID permintaan saat menghubungi bantuan.",
      requestId,
      500,
    );
  }
  const priceByService = new Map(
    (prices.data ?? []).map((price) => [price.service_id, price]),
  );
  const data = (services.data ?? []).flatMap((service) => {
    const price = priceByService.get(service.id);
    return price
      ? [
          {
            id: service.id,
            code: service.code,
            name: service.name,
            unit: service.unit,
            durationHours: service.duration_hours,
            unitPrice: price.unit_price,
            minimumCharge: price.minimum_charge,
          },
        ]
      : [];
  });
  return NextResponse.json({ data, meta: { requestId } });
}
