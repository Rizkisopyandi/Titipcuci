import type { Json, OrderStatus } from "@/lib/adapters/supabase/database.types";
import {
  commandIdempotencyKeySchema,
  orderIdSchema,
  parseAdminCommandPayload,
  type AdminOrderCommand,
} from "@/features/admin-orders/schemas";

export type AdminTransitionResult = Readonly<{
  id: string;
  orderNo: string;
  status: OrderStatus;
  version: number;
  updatedAt: string;
}>;

export type AdminTransitionGateway = {
  transition(input: {
    orderId: string;
    command: AdminOrderCommand;
    expectedVersion: number;
    idempotencyKey: string;
    payload: Json;
    correlationId: string;
  }): Promise<{ data: AdminTransitionResult | null; errorCode?: string }>;
};

export class AdminTransitionError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export async function transitionAdminOrder(
  gateway: AdminTransitionGateway,
  input: {
    orderId: string;
    command: AdminOrderCommand;
    expectedVersion: number;
    idempotencyKey: string;
    payload: unknown;
    correlationId: string;
  },
) {
  const orderId = orderIdSchema.parse(input.orderId);
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    throw new AdminTransitionError("VAL_001");
  }
  const payload = parseAdminCommandPayload(input.command, input.payload);
  const idempotencyKey = commandIdempotencyKeySchema.parse(
    input.idempotencyKey,
  );
  const result = await gateway.transition({
    ...input,
    orderId,
    idempotencyKey,
    payload: payload as Json,
  });
  if (!result.data)
    throw new AdminTransitionError(result.errorCode ?? "SYS_001");
  return result.data;
}

export function adminTransitionErrorMessage(code: string) {
  if (code === "AUTH_001") return "Silakan masuk kembali.";
  if (code === "AUTH_002")
    return "Anda tidak memiliki akses untuk tindakan ini.";
  if (code === "RES_001") return "Data tidak ditemukan.";
  if (code === "ORD_001")
    return "Transisi tidak diizinkan dari status saat ini.";
  if (code === "ORD_003")
    return "Pesanan telah diperbarui. Muat ulang halaman.";
  if (code === "BAG_001") return "Jumlah tas yang diterima tidak sesuai.";
  if (code === "FILE_001")
    return "Bukti pickup tidak valid atau gagal diunggah.";
  if (code === "VAL_001") return "Periksa kembali data operasional yang diisi.";
  return "Operasi pesanan belum dapat diproses.";
}
