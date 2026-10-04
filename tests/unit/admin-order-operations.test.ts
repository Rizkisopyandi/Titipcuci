import { describe, expect, it, vi } from "vitest";

import {
  parseAdminCommandPayload,
  type AdminOrderCommand,
} from "@/features/admin-orders/schemas";
import {
  AdminTransitionError,
  transitionAdminOrder,
} from "@/features/admin-orders/service";
import { isAdminCommandAllowed } from "@/features/admin-orders/transitions";

const orderId = "00000000-0000-4000-8000-000000000101";
const correlationId = "00000000-0000-4000-8000-000000000102";
const idempotencyKey = "00000000-0000-4000-8000-000000000103";

describe("M3 Admin order command validation", () => {
  it("allows only the documented M3 command sequence", () => {
    expect(isAdminCommandAllowed("PENDING_CONFIRMATION", "CONFIRM")).toBe(true);
    expect(isAdminCommandAllowed("CONFIRMED", "SCHEDULE_PICKUP")).toBe(true);
    expect(isAdminCommandAllowed("PICKUP_SCHEDULED", "START_PICKUP")).toBe(
      true,
    );
    expect(isAdminCommandAllowed("PICKUP_ON_THE_WAY", "COMPLETE_PICKUP")).toBe(
      true,
    );
    expect(isAdminCommandAllowed("PICKUP_ON_THE_WAY", "ARRIVE_PICKUP")).toBe(
      true,
    );
    expect(isAdminCommandAllowed("PICKED_UP", "RECEIVE")).toBe(true);
    expect(isAdminCommandAllowed("PENDING_CONFIRMATION", "RECEIVE")).toBe(
      false,
    );
    expect(isAdminCommandAllowed("RECEIVED", "START_PICKUP")).toBe(false);
  });

  it("requires a reason for rejection and cancellation", () => {
    expect(() => parseAdminCommandPayload("REJECT", { reason: "" })).toThrow();
    expect(() => parseAdminCommandPayload("CANCEL", {})).toThrow();
    expect(
      parseAdminCommandPayload("REJECT", { reason: "Di luar area" }),
    ).toEqual({ reason: "Di luar area" });
  });

  it("validates bag IDs, condition, and private proof metadata", () => {
    const proof = {
      storagePath: `pickup/${orderId}/00000000-0000-4000-8000-000000000104.jpg`,
      mimeType: "image/jpeg" as const,
      sizeBytes: 2048,
      sha256: "a".repeat(64),
    };
    expect(
      parseAdminCommandPayload("COMPLETE_PICKUP", {
        bagCodes: ["tc-101-a", "tc-101-b"],
        conditionCode: "normal",
        proof,
      }),
    ).toMatchObject({
      bagCodes: ["TC-101-A", "TC-101-B"],
      conditionCode: "NORMAL",
      proof,
    });
    expect(() =>
      parseAdminCommandPayload("COMPLETE_PICKUP", {
        bagCodes: ["TC-101-A", "tc-101-a"],
        conditionCode: "NORMAL",
        proof,
      }),
    ).toThrow();
    expect(() =>
      parseAdminCommandPayload("COMPLETE_PICKUP", {
        bagCodes: ["TC-101-A"],
        conditionCode: "NORMAL",
      }),
    ).toThrow();
  });

  it("forwards only validated operational fields to the gateway", async () => {
    const transition = vi.fn().mockResolvedValue({
      data: {
        id: orderId,
        orderNo: "TC-20261005-M3",
        status: "CONFIRMED",
        version: 2,
        updatedAt: "2026-10-05T01:00:00Z",
      },
    });

    await transitionAdminOrder(
      { transition },
      {
        orderId,
        command: "CONFIRM",
        expectedVersion: 1,
        idempotencyKey,
        payload: {},
        correlationId,
      },
    );

    expect(transition).toHaveBeenCalledWith({
      orderId,
      command: "CONFIRM",
      expectedVersion: 1,
      idempotencyKey,
      payload: {},
      correlationId,
    });
    const serialized = JSON.stringify(transition.mock.calls);
    expect(serialized).not.toMatch(/actorId|customerId|status/);
  });

  it.each<AdminOrderCommand>([
    "CONFIRM",
    "SCHEDULE_PICKUP",
    "START_PICKUP",
    "ARRIVE_PICKUP",
  ])(
    "rejects provider failures for %s without creating fake success",
    async (command) => {
      await expect(
        transitionAdminOrder(
          {
            transition: vi
              .fn()
              .mockResolvedValue({ data: null, errorCode: "ORD_001" }),
          },
          {
            orderId,
            command,
            expectedVersion: 1,
            idempotencyKey,
            payload: {},
            correlationId,
          },
        ),
      ).rejects.toEqual(new AdminTransitionError("ORD_001"));
    },
  );
});
