import { z } from "zod";

const optionalNote = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

const savedAddressSchema = z.object({ addressId: z.uuid() }).strict();

const newAddressSchema = z
  .object({
    label: z.string().trim().min(2).max(50),
    addressText: z.string().trim().min(8).max(500),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    notes: optionalNote(500),
    saveAddress: z.boolean().default(false),
  })
  .strict();

export const createOrderSchema = z
  .object({
    address: z.union([savedAddressSchema, newAddressSchema]),
    slotId: z.uuid(),
    items: z
      .array(
        z
          .object({
            serviceId: z.uuid(),
            estimatedQty: z.number().positive().max(9999),
          })
          .strict(),
      )
      .min(1)
      .max(10)
      .refine(
        (items) =>
          new Set(items.map((item) => item.serviceId)).size === items.length,
        "Layanan tidak boleh dipilih dua kali.",
      ),
    preferences: z
      .object({
        detergentNote: optionalNote(100),
        fragranceNote: optionalNote(100),
        allergyNote: optionalNote(250),
        handlingNotes: z
          .array(z.string().trim().min(2).max(100))
          .max(10)
          .default([]),
      })
      .strict(),
    notes: optionalNote(1000),
  })
  .strict();

export const idempotencyKeySchema = z.string().trim().min(16).max(128);
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const orderIdSchema = z.uuid();
