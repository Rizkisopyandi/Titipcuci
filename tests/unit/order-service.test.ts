import { describe, expect, it, vi } from "vitest";

import {
  createCustomerOrder,
  OrderCreationError,
  orderErrorMessage,
} from "@/features/orders/service";

const payload = {
  address: { addressId: "00000000-0000-4000-8000-000000000003" },
  slotId: "00000000-0000-4000-8000-000000000001",
  items: [
    {
      serviceId: "00000000-0000-4000-8000-000000000002",
      estimatedQty: 3,
    },
  ],
  preferences: { handlingNotes: [] },
};

describe("API-ORD-001 order service", () => {
  it("forwards only validated customer-safe command fields", async () => {
    const create = vi.fn().mockResolvedValue({
      data: {
        id: "order-1",
        orderNo: "TC-20261004-ABC",
        status: "PENDING_CONFIRMATION",
        estimateAmount: 24000,
        currency: "IDR",
        createdAt: "2026-10-04T00:00:00Z",
      },
    });

    const result = await createCustomerOrder({ create }, payload, {
      idempotencyKey: "12345678-1234-4234-8234-123456789012",
      correlationId: "12345678-1234-4234-8234-123456789013",
    });

    expect(result.status).toBe("PENDING_CONFIRMATION");
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        slotId: payload.slotId,
        notes: null,
        items: payload.items,
      }),
    );
    expect(JSON.stringify(create.mock.calls)).not.toContain("actualQty");
  });

  it("surfaces catalogued rule failures without provider detail", async () => {
    await expect(
      createCustomerOrder(
        {
          create: vi
            .fn()
            .mockResolvedValue({ data: null, errorCode: "SLOT_001" }),
        },
        payload,
        {
          idempotencyKey: "12345678-1234-4234-8234-123456789012",
          correlationId: "12345678-1234-4234-8234-123456789013",
        },
      ),
    ).rejects.toEqual(new OrderCreationError("SLOT_001"));
    expect(orderErrorMessage("SLOT_001")).toContain("Slot tidak lagi tersedia");
    expect(orderErrorMessage("provider-secret-detail")).toBe(
      "Pesanan belum dapat dibuat. Coba kembali.",
    );
  });
});
