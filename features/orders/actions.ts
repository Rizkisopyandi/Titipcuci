"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

import type { Json } from "@/lib/adapters/supabase/database.types";
import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import { logger } from "@/lib/observability/logger";
import {
  createCustomerOrder,
  OrderCreationError,
  orderErrorMessage,
} from "@/features/orders/service";

export type CreateOrderActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
}>;

function rpcErrorCode(error: { message: string } | null) {
  const code = error?.message.trim();
  return code && /^(AUTH|VAL|SVC|SLOT|SYS)_\d{3}$/.test(code)
    ? code
    : "SYS_001";
}

export async function createOrderAction(
  _previousState: CreateOrderActionState,
  formData: FormData,
): Promise<CreateOrderActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/login?next=%2Fapp%2Forders%2Fnew");
  if (principal.role !== "CUSTOMER") redirect("/unauthorized");

  const rawPayload = formData.get("payload");
  const idempotencyKey = formData.get("idempotencyKey");
  if (typeof rawPayload !== "string" || typeof idempotencyKey !== "string") {
    return { status: "error", message: orderErrorMessage("VAL_001") };
  }

  let input: unknown;
  try {
    input = JSON.parse(rawPayload);
  } catch {
    return { status: "error", message: orderErrorMessage("VAL_001") };
  }

  const correlationId = getCorrelationId(await headers());
  const supabase = await createServerSupabaseClient();
  let destination: string;

  try {
    const order = await createCustomerOrder(
      {
        create: async (command) => {
          const { data, error } = await supabase.rpc("create_customer_order", {
            p_idempotency_key: command.idempotencyKey,
            p_address: command.address,
            p_slot_id: command.slotId,
            p_items: command.items,
            p_preferences: command.preferences,
            p_notes: command.notes,
            p_correlation_id: command.correlationId,
          });
          const row = data?.[0];
          return {
            data: row
              ? {
                  id: row.id,
                  orderNo: row.order_no,
                  status: row.status,
                  estimateAmount: row.estimate_amount,
                  currency: row.currency,
                  createdAt: row.created_at,
                }
              : null,
            errorCode: rpcErrorCode(error),
          };
        },
      },
      input,
      { idempotencyKey, correlationId },
    );

    logger.info("customer_order_created", {
      requestId: correlationId,
      userId: principal.id,
      orderId: order.id,
    });
    revalidatePath("/app");
    revalidatePath("/app/orders");
    destination = `/app/orders/${order.id}?created=1`;
  } catch (error) {
    if (error instanceof OrderCreationError) {
      logger.warn("customer_order_rejected", {
        requestId: correlationId,
        userId: principal.id,
        errorCode: error.code,
      });
      return { status: "error", message: orderErrorMessage(error.code) };
    }

    logger.error("customer_order_failed", {
      requestId: correlationId,
      userId: principal.id,
    });
    return {
      status: "error",
      message: `${orderErrorMessage("SYS_001")} ID permintaan: ${correlationId}`,
    };
  }

  redirect(destination);
}

export async function createOrderFromApi(input: {
  payload: unknown;
  idempotencyKey: string;
  correlationId: string;
}) {
  const principal = await getCurrentPrincipal();
  if (!principal) throw new OrderCreationError("AUTH_001");
  if (principal.role !== "CUSTOMER") throw new OrderCreationError("AUTH_002");

  const supabase = await createServerSupabaseClient();
  return createCustomerOrder(
    {
      create: async (command) => {
        const { data, error } = await supabase.rpc("create_customer_order", {
          p_idempotency_key: command.idempotencyKey,
          p_address: command.address as Json,
          p_slot_id: command.slotId,
          p_items: command.items as Json,
          p_preferences: command.preferences as Json,
          p_notes: command.notes,
          p_correlation_id: command.correlationId,
        });
        const row = data?.[0];
        return {
          data: row
            ? {
                id: row.id,
                orderNo: row.order_no,
                status: row.status,
                estimateAmount: row.estimate_amount,
                currency: row.currency,
                createdAt: row.created_at,
              }
            : null,
          errorCode: rpcErrorCode(error),
        };
      },
    },
    input.payload,
    input,
  );
}
