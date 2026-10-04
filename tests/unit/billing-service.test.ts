import { describe, expect, it, vi } from "vitest";

import {
  invoiceCommandRequestSchema,
  recordWeightPayloadSchema,
  weightCommandRequestSchema,
} from "@/features/billing/schemas";
import {
  BillingCommandError,
  issueFinalInvoice,
  recordActualWeight,
} from "@/features/billing/service";

const orderId = "00000000-0000-4000-8000-000000004001";
const orderItemId = "00000000-0000-4000-8000-000000004002";
const idempotencyKey = "00000000-0000-4000-8000-000000004003";
const correlationId = "00000000-0000-4000-8000-000000004004";

function gateway() {
  return {
    recordWeight: vi.fn().mockResolvedValue({
      data: {
        id: orderId,
        orderNo: "TC-20261006-M4",
        status: "WEIGHED",
        version: 8,
        updatedAt: "2026-10-06T01:00:00Z",
      },
    }),
    issueInvoice: vi.fn().mockResolvedValue({
      data: {
        id: "00000000-0000-4000-8000-000000004005",
        invoiceNo: "INV-TC-20261006-M4",
        orderId,
        orderStatus: "WAITING_PAYMENT",
        orderVersion: 9,
        subtotal: 36000,
        discount: 0,
        surcharge: 0,
        tax: 0,
        total: 36000,
        currency: "IDR",
        pricingSnapshot: { formulaVersion: "M4_V1" },
        issuedAt: "2026-10-06T01:01:00Z",
      },
    }),
  };
}

describe("M4 actual weight and invoice commands", () => {
  it("accepts positive two-decimal actual quantities", () => {
    expect(
      recordWeightPayloadSchema.parse({
        actualItems: [{ orderItemId, actualQty: 4.25 }],
      }),
    ).toEqual({ actualItems: [{ orderItemId, actualQty: 4.25 }] });
  });

  it.each([0, -1, 1.234])("rejects invalid actual quantity %s", (actualQty) => {
    expect(() =>
      recordWeightPayloadSchema.parse({
        actualItems: [{ orderItemId, actualQty }],
      }),
    ).toThrow();
  });

  it("rejects duplicate item IDs and client pricing fields", () => {
    expect(() =>
      recordWeightPayloadSchema.parse({
        actualItems: [
          { orderItemId, actualQty: 2 },
          { orderItemId, actualQty: 3 },
        ],
      }),
    ).toThrow();
    expect(() =>
      weightCommandRequestSchema.parse({
        expectedVersion: 7,
        actualItems: [{ orderItemId, actualQty: 2 }],
        finalTotal: 1,
      }),
    ).toThrow();
    expect(() =>
      invoiceCommandRequestSchema.parse({
        expectedVersion: 8,
        pricingSnapshot: { total: 1 },
      }),
    ).toThrow();
  });

  it("forwards only validated weight fields", async () => {
    const target = gateway();
    const result = await recordActualWeight(target, {
      orderId,
      expectedVersion: 7,
      idempotencyKey,
      actualItems: [{ orderItemId, actualQty: 4.25 }],
      correlationId,
    });

    expect(result.status).toBe("WEIGHED");
    expect(target.recordWeight).toHaveBeenCalledWith({
      orderId,
      expectedVersion: 7,
      idempotencyKey,
      actualItems: [{ orderItemId, actualQty: 4.25 }],
      reason: null,
      correlationId,
    });
    expect(JSON.stringify(target.recordWeight.mock.calls)).not.toMatch(
      /total|unitPrice|pricingSnapshot|customerId|status/,
    );
  });

  it("issues an invoice without accepting totals or pricing input", async () => {
    const target = gateway();
    const result = await issueFinalInvoice(target, {
      orderId,
      expectedVersion: 8,
      idempotencyKey,
      correlationId,
    });

    expect(result.orderStatus).toBe("WAITING_PAYMENT");
    expect(result.total).toBe(36000);
    expect(target.issueInvoice).toHaveBeenCalledWith({
      orderId,
      expectedVersion: 8,
      idempotencyKey,
      correlationId,
    });
  });

  it("surfaces database rule failures without fake success", async () => {
    const target = gateway();
    target.recordWeight.mockResolvedValue({ data: null, errorCode: "ORD_001" });
    await expect(
      recordActualWeight(target, {
        orderId,
        expectedVersion: 7,
        idempotencyKey,
        actualItems: [{ orderItemId, actualQty: 4.25 }],
        correlationId,
      }),
    ).rejects.toEqual(new BillingCommandError("ORD_001"));
  });
});
