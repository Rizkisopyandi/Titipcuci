import { z } from "zod";

export const actualItemSchema = z
  .object({
    orderItemId: z.uuid(),
    actualQty: z.number().positive().max(99_999_999.99).multipleOf(0.01),
  })
  .strict();

export const recordWeightPayloadSchema = z
  .object({
    actualItems: z
      .array(actualItemSchema)
      .min(1)
      .refine(
        (items) =>
          new Set(items.map((item) => item.orderItemId)).size === items.length,
        "Item pesanan harus unik.",
      ),
    reason: z.string().trim().min(5).max(500).optional(),
  })
  .strict();

export const weightCommandRequestSchema = z
  .object({
    expectedVersion: z.number().int().positive(),
    actualItems: z.array(actualItemSchema).min(1),
    reason: z.string().trim().min(5).max(500).optional(),
  })
  .strict();

export const invoiceCommandRequestSchema = z
  .object({ expectedVersion: z.number().int().positive() })
  .strict();

export const billingOrderIdSchema = z.uuid();
export const billingIdempotencyKeySchema = z.string().trim().min(16).max(128);
