import type { Json } from "@/lib/adapters/supabase/database.types";
import {
  billingIdempotencyKeySchema,
  billingOrderIdSchema,
  recordWeightPayloadSchema,
} from "@/features/billing/schemas";
import type {
  InvoiceIssueResult,
  WeightTransitionResult,
} from "@/features/billing/types";

export type BillingGateway = {
  recordWeight(input: {
    orderId: string;
    expectedVersion: number;
    idempotencyKey: string;
    actualItems: Json;
    reason: string | null;
    correlationId: string;
  }): Promise<{ data: WeightTransitionResult | null; errorCode?: string }>;
  issueInvoice(input: {
    orderId: string;
    expectedVersion: number;
    idempotencyKey: string;
    correlationId: string;
  }): Promise<{ data: InvoiceIssueResult | null; errorCode?: string }>;
};

export class BillingCommandError extends Error {
  constructor(public readonly code: string) {
    super(code);
  }
}

function parseBase(input: {
  orderId: string;
  expectedVersion: number;
  idempotencyKey: string;
}) {
  const orderId = billingOrderIdSchema.parse(input.orderId);
  const idempotencyKey = billingIdempotencyKeySchema.parse(
    input.idempotencyKey,
  );
  if (!Number.isInteger(input.expectedVersion) || input.expectedVersion < 1) {
    throw new BillingCommandError("VAL_001");
  }
  return { orderId, idempotencyKey };
}

export async function recordActualWeight(
  gateway: BillingGateway,
  input: {
    orderId: string;
    expectedVersion: number;
    idempotencyKey: string;
    actualItems: unknown;
    reason?: string;
    correlationId: string;
  },
) {
  const base = parseBase(input);
  const payload = recordWeightPayloadSchema.parse({
    actualItems: input.actualItems,
    reason: input.reason,
  });
  const result = await gateway.recordWeight({
    ...base,
    expectedVersion: input.expectedVersion,
    idempotencyKey: base.idempotencyKey,
    actualItems: payload.actualItems as Json,
    reason: payload.reason ?? null,
    correlationId: input.correlationId,
  });
  if (!result.data)
    throw new BillingCommandError(result.errorCode ?? "SYS_001");
  return result.data;
}

export async function issueFinalInvoice(
  gateway: BillingGateway,
  input: {
    orderId: string;
    expectedVersion: number;
    idempotencyKey: string;
    correlationId: string;
  },
) {
  const base = parseBase(input);
  const result = await gateway.issueInvoice({
    ...base,
    expectedVersion: input.expectedVersion,
    correlationId: input.correlationId,
  });
  if (!result.data)
    throw new BillingCommandError(result.errorCode ?? "SYS_001");
  return result.data;
}

export function billingErrorMessage(code: string) {
  if (code === "AUTH_001") return "Silakan masuk kembali.";
  if (code === "AUTH_002")
    return "Anda tidak memiliki akses untuk tindakan ini.";
  if (code === "RES_001") return "Data tidak ditemukan.";
  if (code === "ORD_001")
    return "Pesanan belum berada pada tahap yang diizinkan.";
  if (code === "ORD_003")
    return "Pesanan telah diperbarui. Muat ulang halaman.";
  if (code === "INV_001")
    return "Berat atau data pricing belum valid untuk invoice.";
  if (code === "VAL_001") return "Periksa kembali berat aktual yang diisi.";
  return "Operasi invoice belum dapat diproses.";
}
