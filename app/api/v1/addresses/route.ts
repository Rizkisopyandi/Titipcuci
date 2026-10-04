import { NextResponse } from "next/server";

import { apiError, requireCustomerApi } from "@/features/orders/api";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCorrelationId } from "@/lib/observability/correlation-id";

export async function GET(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const auth = await requireCustomerApi(requestId);
  if (!auth.ok) return auth.response;
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("customer_addresses")
    .select("id, label, address_text, latitude, longitude, notes, is_default")
    .eq("customer_id", auth.principal.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });
  if (error)
    return apiError(
      "SYS_001",
      "Terjadi kendala. Gunakan ID permintaan saat menghubungi bantuan.",
      requestId,
      500,
    );
  return NextResponse.json({ data: data ?? [], meta: { requestId } });
}
