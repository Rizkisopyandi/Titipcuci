"use server";

import { createHash, randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getCurrentPrincipal } from "@/lib/auth/session";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import { logger } from "@/lib/observability/logger";
import {
  ADMIN_ORDER_COMMANDS,
  type AdminOrderCommand,
} from "@/features/admin-orders/schemas";
import {
  adminTransitionErrorMessage,
  AdminTransitionError,
  transitionAdminOrder,
} from "@/features/admin-orders/service";

export type AdminOrderActionState = Readonly<{
  status: "idle" | "error";
  message?: string;
}>;

const commandSchema = z.enum(ADMIN_ORDER_COMMANDS);

function textField(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function rpcErrorCode(error: { message: string } | null) {
  const code = error?.message.trim();
  return code && /^(AUTH|VAL|RES|ORD|BAG|FILE|SYS)_\d{3}$/.test(code)
    ? code
    : "SYS_001";
}

function payloadFromForm(command: AdminOrderCommand, formData: FormData) {
  if (command === "REJECT" || command === "CANCEL") {
    return { reason: textField(formData, "reason") };
  }
  if (command === "RECEIVE") {
    return {
      receivedBagCount: Number(textField(formData, "receivedBagCount")),
    };
  }
  if (command === "COMPLETE_PICKUP") {
    return {
      bagCodes: textField(formData, "bagCodes")
        .split(/[\n,]/)
        .map((value) => value.trim())
        .filter(Boolean),
      conditionCode: textField(formData, "conditionCode"),
      conditionDescription:
        textField(formData, "conditionDescription") || undefined,
    };
  }
  return {};
}

export async function adminOrderAction(
  _previousState: AdminOrderActionState,
  formData: FormData,
): Promise<AdminOrderActionState> {
  const principal = await getCurrentPrincipal();
  if (!principal) redirect("/login?next=%2Fadmin%2Forders");
  if (principal.role !== "ADMIN") redirect("/unauthorized");

  const parsedCommand = commandSchema.safeParse(textField(formData, "command"));
  if (!parsedCommand.success) {
    return { status: "error", message: adminTransitionErrorMessage("VAL_001") };
  }

  const command = parsedCommand.data;
  const orderId = textField(formData, "orderId");
  const expectedVersion = Number(textField(formData, "expectedVersion"));
  const idempotencyKey = textField(formData, "idempotencyKey");
  const correlationId = getCorrelationId(await headers());
  const supabase = await createServerSupabaseClient();
  let uploadedPath: string | null = null;
  let payload: Record<string, unknown> = payloadFromForm(command, formData);

  try {
    if (command === "COMPLETE_PICKUP") {
      const proof = formData.get("proof");
      if (
        !(proof instanceof File) ||
        proof.size < 1 ||
        proof.size > 10 * 1024 * 1024
      ) {
        throw new AdminTransitionError("FILE_001");
      }
      const extensionByMime: Readonly<Record<string, string>> = {
        "image/jpeg": "jpg",
        "image/png": "png",
        "image/webp": "webp",
      };
      const extension = extensionByMime[proof.type];
      if (!extension) throw new AdminTransitionError("FILE_001");

      const bytes = Buffer.from(await proof.arrayBuffer());
      const sha256 = createHash("sha256").update(bytes).digest("hex");
      uploadedPath = `pickup/${orderId}/${randomUUID()}.${extension}`;
      const { error: uploadError } = await supabase.storage
        .from("order-evidence")
        .upload(uploadedPath, bytes, {
          contentType: proof.type,
          cacheControl: "3600",
          upsert: false,
        });
      if (uploadError) throw new AdminTransitionError("FILE_001");
      payload = {
        ...payload,
        proof: {
          storagePath: uploadedPath,
          mimeType: proof.type,
          sizeBytes: proof.size,
          sha256,
        },
      };
    }

    const result = await transitionAdminOrder(
      {
        transition: async (commandInput) => {
          const { data, error } = await supabase.rpc("admin_transition_order", {
            p_order_id: commandInput.orderId,
            p_command: commandInput.command,
            p_expected_version: commandInput.expectedVersion,
            p_idempotency_key: commandInput.idempotencyKey,
            p_payload: commandInput.payload,
            p_correlation_id: commandInput.correlationId,
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
        orderId,
        command,
        expectedVersion,
        idempotencyKey,
        payload,
        correlationId,
      },
    );

    logger.info("admin_order_transitioned", {
      requestId: correlationId,
      userId: principal.id,
      orderId: result.id,
      command,
      version: result.version,
    });
    revalidatePath("/admin");
    revalidatePath("/admin/orders");
    revalidatePath(`/admin/orders/${orderId}`);
    revalidatePath(`/app/orders/${orderId}`);
  } catch (error) {
    if (uploadedPath) {
      await supabase.storage.from("order-evidence").remove([uploadedPath]);
    }
    const code =
      error instanceof AdminTransitionError
        ? error.code
        : error instanceof z.ZodError
          ? "VAL_001"
          : "SYS_001";
    logger.warn("admin_order_transition_rejected", {
      requestId: correlationId,
      userId: principal.id,
      orderId,
      command,
      errorCode: code,
    });
    return { status: "error", message: adminTransitionErrorMessage(code) };
  }

  redirect(`/admin/orders/${orderId}?updated=${command.toLowerCase()}`);
}
