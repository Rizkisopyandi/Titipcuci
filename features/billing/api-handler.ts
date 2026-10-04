import { NextResponse } from "next/server";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import {
  billingOrderIdSchema,
  invoiceCommandRequestSchema,
  weightCommandRequestSchema,
} from "@/features/billing/schemas";
import {
  billingErrorMessage,
  BillingCommandError,
  issueFinalInvoice,
  recordActualWeight,
  type BillingGateway,
} from "@/features/billing/service";

type BillingOperation = "WEIGHT" | "INVOICE";

function statusFor(code: string) {
  if (code === "AUTH_001") return 401;
  if (code === "AUTH_002") return 403;
  if (code === "RES_001") return 404;
  if (code === "ORD_001" || code === "ORD_003") return 409;
  if (code === "INV_001") return 422;
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
      error: { code, message: billingErrorMessage(code), fieldErrors },
      meta: { requestId },
    },
    { status: statusFor(code) },
  );
}

function rpcErrorCode(error: { message: string } | null) {
  const code = error?.message.trim();
  return code && /^(AUTH|VAL|RES|ORD|INV|SYS)_\d{3}$/.test(code)
    ? code
    : "SYS_001";
}

export async function handleBillingCommand(
  request: Request,
  context: { params: Promise<{ id: string }> },
  operation: BillingOperation,
) {
  const requestId = getCorrelationId(request.headers);
  const principal = await getCurrentPrincipal();
  if (!principal) return errorResponse("AUTH_001", requestId);
  if (principal.role !== "ADMIN") return errorResponse("AUTH_002", requestId);

  const parsedId = billingOrderIdSchema.safeParse((await context.params).id);
  if (!parsedId.success) return errorResponse("RES_001", requestId);

  try {
    const rawBody: unknown = await request.json();
    const idempotencyKey = request.headers.get("idempotency-key") ?? "";
    const supabase = await createServerSupabaseClient();
    const gateway: BillingGateway = {
      recordWeight: async (input) => {
        const { data, error } = await supabase.rpc("record_actual_weight", {
          p_order_id: input.orderId,
          p_expected_version: input.expectedVersion,
          p_idempotency_key: input.idempotencyKey,
          p_actual_items: input.actualItems,
          p_reason: input.reason,
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
      issueInvoice: async (input) => {
        const { data, error } = await supabase.rpc("issue_final_invoice", {
          p_order_id: input.orderId,
          p_expected_version: input.expectedVersion,
          p_idempotency_key: input.idempotencyKey,
          p_correlation_id: input.correlationId,
        });
        const row = data?.[0];
        return {
          data: row
            ? {
                id: row.id,
                invoiceNo: row.invoice_no,
                orderId: row.order_id,
                orderStatus: row.order_status,
                orderVersion: row.order_version,
                subtotal: row.subtotal,
                discount: row.discount,
                surcharge: row.surcharge,
                tax: row.tax,
                total: row.total,
                currency: row.currency,
                pricingSnapshot: row.pricing_snapshot,
                issuedAt: row.issued_at,
              }
            : null,
          errorCode: rpcErrorCode(error),
        };
      },
    };

    if (operation === "WEIGHT") {
      const body = weightCommandRequestSchema.parse(rawBody);
      const data = await recordActualWeight(gateway, {
        orderId: parsedId.data,
        expectedVersion: body.expectedVersion,
        idempotencyKey,
        actualItems: body.actualItems,
        reason: body.reason,
        correlationId: requestId,
      });
      return NextResponse.json({ data, meta: { requestId } });
    }

    const body = invoiceCommandRequestSchema.parse(rawBody);
    const data = await issueFinalInvoice(gateway, {
      orderId: parsedId.data,
      expectedVersion: body.expectedVersion,
      idempotencyKey,
      correlationId: requestId,
    });
    return NextResponse.json({ data, meta: { requestId } });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse("VAL_001", requestId, error.flatten().fieldErrors);
    }
    if (error instanceof BillingCommandError) {
      return errorResponse(error.code, requestId);
    }
    return errorResponse("SYS_001", requestId);
  }
}
