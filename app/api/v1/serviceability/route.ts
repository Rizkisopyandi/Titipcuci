import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireCustomerApi } from "@/features/orders/api";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCorrelationId } from "@/lib/observability/correlation-id";

const querySchema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export async function GET(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const auth = await requireCustomerApi(requestId);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const query = querySchema.safeParse({
    lat: url.searchParams.get("lat"),
    lng: url.searchParams.get("lng"),
  });
  if (!query.success)
    return apiError(
      "VAL_001",
      "Periksa kembali data yang diisi.",
      requestId,
      400,
      query.error.flatten().fieldErrors,
    );

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.rpc("check_serviceability", {
    p_latitude: query.data.lat,
    p_longitude: query.data.lng,
  });
  if (error)
    return apiError(
      "SYS_001",
      "Terjadi kendala. Gunakan ID permintaan saat menghubungi bantuan.",
      requestId,
      500,
    );
  const area = data?.[0];
  return NextResponse.json({
    data: area
      ? { serviceable: true, areaId: area.area_id, areaName: area.area_name }
      : { serviceable: false, areaId: null, areaName: null },
    meta: { requestId },
  });
}
