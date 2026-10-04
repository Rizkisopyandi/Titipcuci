import type { Json, OrderStatus } from "@/lib/adapters/supabase/database.types";
import {
  createOrderSchema,
  idempotencyKeySchema,
  type CreateOrderInput,
} from "@/features/orders/schemas";

export type CreatedOrder = Readonly<{
  id: string;
  orderNo: string;
  status: OrderStatus;
  estimateAmount: number;
  currency: string;
  createdAt: string;
}>;

export type OrderCreationGateway = {
  create(input: {
    idempotencyKey: string;
    address: Json;
    slotId: string;
    items: Json;
    preferences: Json;
    notes: string | null;
    correlationId: string;
  }): Promise<{ data: CreatedOrder | null; errorCode?: string }>;
};

export class OrderCreationError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

export async function createCustomerOrder(
  gateway: OrderCreationGateway,
  rawInput: unknown,
  context: { idempotencyKey: string; correlationId: string },
) {
  const input: CreateOrderInput = createOrderSchema.parse(rawInput);
  const idempotencyKey = idempotencyKeySchema.parse(context.idempotencyKey);
  const result = await gateway.create({
    idempotencyKey,
    address: input.address,
    slotId: input.slotId,
    items: input.items,
    preferences: input.preferences,
    notes: input.notes ?? null,
    correlationId: context.correlationId,
  });

  if (!result.data) throw new OrderCreationError(result.errorCode ?? "SYS_001");
  return result.data;
}

export function orderErrorMessage(code: string) {
  if (code === "SVC_001") return "Lokasi belum masuk area layanan.";
  if (code === "SLOT_001") return "Slot tidak lagi tersedia. Pilih waktu lain.";
  if (code === "AUTH_001") return "Silakan masuk kembali.";
  if (code === "AUTH_002")
    return "Anda tidak memiliki akses untuk tindakan ini.";
  if (code === "VAL_001") return "Periksa kembali data yang diisi.";
  return "Pesanan belum dapat dibuat. Coba kembali.";
}
