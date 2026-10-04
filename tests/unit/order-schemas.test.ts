import { describe, expect, it } from "vitest";

import { createOrderSchema } from "@/features/orders/schemas";

const validOrder = {
  address: {
    label: "Rumah",
    addressText: "Jalan Contoh Nomor 10",
    latitude: -6.2,
    longitude: 106.816666,
    saveAddress: true,
  },
  slotId: "00000000-0000-4000-8000-000000000001",
  items: [
    {
      serviceId: "00000000-0000-4000-8000-000000000002",
      estimatedQty: 3,
    },
  ],
  preferences: {
    detergentNote: "Hypoallergenic",
    fragranceNote: "Lembut",
    handlingNotes: ["Pisahkan warna putih"],
  },
  notes: "Hubungi saat tiba.",
};

describe("REQ-ORD-001 customer order schema", () => {
  it("accepts a safe preliminary order payload", () => {
    expect(createOrderSchema.parse(validOrder)).toMatchObject(validOrder);
  });

  it("accepts an owned saved-address reference", () => {
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        address: { addressId: "00000000-0000-4000-8000-000000000003" },
      }).success,
    ).toBe(true);
  });

  it("rejects actual weight, final price, status, and customer identity", () => {
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        actualWeight: 8,
        finalPrice: 1000,
        status: "PAID",
        customerId: "00000000-0000-4000-8000-000000000099",
      }).success,
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrder.items[0], actualQty: 8 }],
      }).success,
    ).toBe(false);
  });

  it("requires valid coordinates, a slot, and positive unique estimates", () => {
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        address: { ...validOrder.address, latitude: 91 },
      }).success,
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        items: [validOrder.items[0], validOrder.items[0]],
      }).success,
    ).toBe(false);
    expect(
      createOrderSchema.safeParse({
        ...validOrder,
        items: [{ ...validOrder.items[0], estimatedQty: 0 }],
      }).success,
    ).toBe(false);
  });
});
