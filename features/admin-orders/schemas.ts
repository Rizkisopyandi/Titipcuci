import { z } from "zod";

export const ADMIN_ORDER_COMMANDS = [
  "CONFIRM",
  "REJECT",
  "SCHEDULE_PICKUP",
  "START_PICKUP",
  "ARRIVE_PICKUP",
  "COMPLETE_PICKUP",
  "RECEIVE",
  "CANCEL",
] as const;

export type AdminOrderCommand = (typeof ADMIN_ORDER_COMMANDS)[number];

const reasonSchema = z
  .object({ reason: z.string().trim().min(5).max(500) })
  .strict();
const emptySchema = z.object({}).strict();
const proofSchema = z
  .object({
    storagePath: z
      .string()
      .regex(/^pickup\/[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|jpeg|png|webp)$/),
    mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]),
    sizeBytes: z
      .number()
      .int()
      .min(1)
      .max(10 * 1024 * 1024),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

export const adminCommandPayloadSchema = {
  CONFIRM: emptySchema,
  REJECT: reasonSchema,
  SCHEDULE_PICKUP: emptySchema,
  START_PICKUP: emptySchema,
  ARRIVE_PICKUP: emptySchema,
  COMPLETE_PICKUP: z
    .object({
      bagCodes: z
        .array(
          z
            .string()
            .trim()
            .toUpperCase()
            .regex(/^[A-Z0-9-]{4,50}$/),
        )
        .min(1)
        .max(20)
        .refine(
          (codes) => new Set(codes).size === codes.length,
          "Bag ID harus unik.",
        ),
      conditionCode: z.string().trim().toUpperCase().min(2).max(50),
      conditionDescription: z.string().trim().max(1000).optional(),
      proof: proofSchema,
    })
    .strict(),
  RECEIVE: z
    .object({ receivedBagCount: z.number().int().min(1).max(20) })
    .strict(),
  CANCEL: reasonSchema,
} as const satisfies Record<AdminOrderCommand, z.ZodType>;

export const adminCommandRequestSchema = z
  .object({
    expectedVersion: z.number().int().positive(),
    payload: z.unknown(),
  })
  .strict();

export const orderIdSchema = z.uuid();
export const commandIdempotencyKeySchema = z.string().trim().min(16).max(128);

export function parseAdminCommandPayload(
  command: AdminOrderCommand,
  input: unknown,
) {
  return adminCommandPayloadSchema[command].parse(input);
}
