import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { createOrderFromApi } from "@/features/orders/actions";
import { listOwnOrders } from "@/features/orders/repository";
import {
  OrderCreationError,
  orderErrorMessage,
} from "@/features/orders/service";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";

function errorStatus(code: string) {
  if (code === "AUTH_001") return 401;
  if (code === "AUTH_002") return 403;
  if (code === "SLOT_001") return 409;
  if (code === "SVC_001") return 422;
  if (code === "VAL_001") return 400;
  return 500;
}

function errorResponse(code: string, requestId: string, fieldErrors = {}) {
  return NextResponse.json(
    {
      error: { code, message: orderErrorMessage(code), fieldErrors },
      meta: { requestId },
    },
    { status: errorStatus(code) },
  );
}

export async function GET(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const principal = await getCurrentPrincipal();
  if (!principal) return errorResponse("AUTH_001", requestId);
  if (principal.role !== "CUSTOMER")
    return errorResponse("AUTH_002", requestId);

  const orders = await listOwnOrders(principal);
  return NextResponse.json({ data: orders, meta: { requestId } });
}

export async function POST(request: Request) {
  const requestId = getCorrelationId(request.headers);
  const idempotencyKey = request.headers.get("idempotency-key") ?? "";
  try {
    const order = await createOrderFromApi({
      payload: await request.json(),
      idempotencyKey,
      correlationId: requestId,
    });
    return NextResponse.json(
      { data: order, meta: { requestId } },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return errorResponse("VAL_001", requestId, error.flatten().fieldErrors);
    }
    if (error instanceof OrderCreationError) {
      return errorResponse(error.code, requestId);
    }
    return errorResponse("SYS_001", requestId);
  }
}
