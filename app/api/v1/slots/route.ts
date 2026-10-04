import { NextResponse } from "next/server";
import { z } from "zod";

import { apiError, requireCustomerApi } from "@/features/orders/api";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCorrelationId } from "@/lib/observability/correlation-id";

const querySchema = z.object({ date: z.iso.date(), areaId: z.uuid() });

export async function GET(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const auth = await requireCustomerApi(requestId);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const query = querySchema.safeParse({
    date: url.searchParams.get("date"),
    areaId: url.searchParams.get("areaId"),
  });
  if (!query.success)
    return apiError(
      "VAL_001",
      "Periksa kembali data yang diisi.",
      requestId,
      400,
      query.error.flatten().fieldErrors,
    );

  const startsAt = new Date(`${query.data.date}T00:00:00+07:00`);
  const endsAt = new Date(startsAt);
  endsAt.setDate(endsAt.getDate() + 1);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("pickup_slots")
    .select("id, service_area_id, starts_at, ends_at, capacity, reserved_count")
    .eq("service_area_id", query.data.areaId)
    .gte("starts_at", startsAt.toISOString())
    .lt("starts_at", endsAt.toISOString())
    .order("starts_at");
  if (error)
    return apiError(
      "SYS_001",
      "Terjadi kendala. Gunakan ID permintaan saat menghubungi bantuan.",
      requestId,
      500,
    );
  return NextResponse.json({
    data: (data ?? [])
      .filter((slot) => slot.reserved_count < slot.capacity)
      .map((slot) => ({
        id: slot.id,
        serviceAreaId: slot.service_area_id,
        startsAt: slot.starts_at,
        endsAt: slot.ends_at,
        remaining: slot.capacity - slot.reserved_count,
      })),
    meta: { requestId },
  });
}
