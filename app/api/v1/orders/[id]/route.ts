import { NextResponse } from "next/server";

import { getOwnOrder } from "@/features/orders/repository";
import { orderIdSchema } from "@/features/orders/schemas";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";

function errorResponse(
  code: "AUTH_001" | "AUTH_002" | "RES_001",
  requestId: string,
) {
  const status = code === "AUTH_001" ? 401 : code === "AUTH_002" ? 403 : 404;
  const message =
    code === "AUTH_001"
      ? "Silakan masuk kembali."
      : code === "AUTH_002"
        ? "Anda tidak memiliki akses untuk tindakan ini."
        : "Data tidak ditemukan.";
  return NextResponse.json(
    { error: { code, message, fieldErrors: {} }, meta: { requestId } },
    { status },
  );
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = getCorrelationId(request.headers);
  const principal = await getCurrentPrincipal();
  if (!principal) return errorResponse("AUTH_001", requestId);
  if (principal.role !== "CUSTOMER")
    return errorResponse("AUTH_002", requestId);

  const parsedId = orderIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return errorResponse("RES_001", requestId);
  const order = await getOwnOrder(principal, parsedId.data);
  if (!order) return errorResponse("RES_001", requestId);
  return NextResponse.json({ data: order, meta: { requestId } });
}
