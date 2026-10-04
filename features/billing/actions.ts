"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import { logger } from "@/lib/observability/logger";
import {
  billingErrorMessage,
  BillingCommandError,
  issueFinalInvoice,
  recordActualWeight,
  type BillingGateway,
} from "@/features/billing/service";

export type BillingActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
}>;

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function rpcErrorCode(error: { message: string } | null) {
  const code = error?.message.trim();
  return code && /^(AUTH|VAL|RES|ORD|INV|SYS)_\d{3}$/.test(code)
    ? code
    : "SYS_001";
}

export async function billingAction(
  _previousState: BillingActionState,
  formData: FormData,
): Promise<BillingActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/login?next=%2Fadmin%2Forders");
  if (principal.role !== "ADMIN") redirect("/unauthorized");

  const command = textField(formData, "command");
  if (command !== "RECORD_WEIGHT" && command !== "ISSUE_INVOICE") {
    return { status: "error", message: billingErrorMessage("VAL_001") };
  }

  const orderId = textField(formData, "orderId");
  const expectedVersion = Number(textField(formData, "expectedVersion"));
  const idempotencyKey = textField(formData, "idempotencyKey");
  const correlationId = getCorrelationId(await headers());
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

  try {
    if (command === "RECORD_WEIGHT") {
      const itemIds = formData.getAll("orderItemId");
      const quantities = formData.getAll("actualQty");
      if (itemIds.length !== quantities.length) {
        throw new BillingCommandError("VAL_001");
      }
      await recordActualWeight(gateway, {
        orderId,
        expectedVersion,
        idempotencyKey,
        actualItems: itemIds.map((itemId, index) => ({
          orderItemId: typeof itemId === "string" ? itemId : "",
          actualQty: Number(quantities[index]),
        })),
        reason: textField(formData, "reason") || undefined,
        correlationId,
      });
    } else {
      await issueFinalInvoice(gateway, {
        orderId,
        expectedVersion,
        idempotencyKey,
        correlationId,
      });
    }

    logger.info("billing_command_completed", {
      requestId: correlationId,
      userId: principal.id,
      orderId,
      command,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/app/orders/${orderId}`);
  } catch (error) {
    const code =
      error instanceof BillingCommandError
        ? error.code
        : error instanceof z.ZodError
          ? "VAL_001"
          : "SYS_001";
    logger.warn("billing_command_rejected", {
      requestId: correlationId,
      userId: principal.id,
      orderId,
      command,
      errorCode: code,
    });
    return { status: "error", message: billingErrorMessage(code) };
  }

  redirect(`/admin/orders/${orderId}?updated=${command.toLowerCase()}`);
}
