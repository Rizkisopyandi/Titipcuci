import { NextResponse } from "next/server";
import { z } from "zod";

import type { AdminOrderCommand } from "@/features/admin-orders/schemas";
import {
  adminCommandRequestSchema,
  orderIdSchema,
} from "@/features/admin-orders/schemas";
import {
  adminTransitionErrorMessage,
  AdminTransitionError,
  transitionAdminOrder,
} from "@/features/admin-orders/service";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";

function statusFor(code: string) {
  if (code === "AUTH_001") return 401;
  if (code === "AUTH_002") return 403;
  if (code === "RES_001") return 404;
  if (code === "ORD_001" || code === "ORD_003") return 409;
  if (code === "BAG_001" || code === "FILE_001") return 422;
  if (code === "VAL_001") return 400;
  return 500;
}

function errorResponse(
  code: string,
  requestId: string,
  fieldErrors: unknown = {},
) {
  return NextResponse.json(
    {
      error: { code, message: adminTransitionErrorMessage(code), fieldErrors },
      meta: { requestId },
    },
    { status: statusFor(code) },
  );
}

function rpcErrorCode(error: { message: string } | null) {
  const code = error?.message.trim();
  return code && /^(AUTH|VAL|RES|ORD|BAG|FILE|SYS)_\d{3}$/.test(code)
    ? code
    : "SYS_001";
}

export async function handleAdminOrderCommand(
  request: Request,
  context: { params: Promise<{ id: string }> },
  command: AdminOrderCommand,
) {
  const requestId = getCorrelationId(request.headers);
  const principal = await getCurrentPrincipal();
  if (!principal) return errorResponse("AUTH_001", requestId);
  if (principal.role !== "ADMIN") return errorResponse("AUTH_002", requestId);

  const parsedId = orderIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return errorResponse("RES_001", requestId);

  try {
    const body = adminCommandRequestSchema.parse(await request.json());
    const idempotencyKey = request.headers.get("idempotency-key") ?? "";
    const supabase = await createServerSupabaseClient();
    const result = await transitionAdminOrder(
      {
        transition: async (input) => {
          const { data, error } = await supabase.rpc("admin_transition_order", {
            p_order_id: input.orderId,
            p_command: input.command,
            p_expected_version: input.expectedVersion,
            p_idempotency_key: input.idempotencyKey,
            p_payload: input.payload,
            p_correlation_id: input.correlationId,
          });
          const row = data?.[0];
          return {
            data: row
              ? {
                  id: row.id,
                  orderNo: row.order_no,
                  status: row.status,
                  version: row.version,
                  updatedAt: row.updated_at,
                }
              : null,
            errorCode: rpcErrorCode(error),
          };
        },
      },
      {
        orderId: parsedId.data,
        command,
        expectedVersion: body.expectedVersion,
        idempotencyKey,
        payload: body.payload,
        correlationId: requestId,
      },
    );
    return NextResponse.json({ data: result, meta: { requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VAL_001", requestId, error.flatten().fieldErrors);
    }
    if (error instanceof AdminTransitionError) {
      return errorResponse(error.code, requestId);
    }
    return errorResponse("SYS_001", requestId);
  }
}
