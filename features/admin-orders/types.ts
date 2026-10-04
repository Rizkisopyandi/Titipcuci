import type {
  OrderStatus,
  UserRole,
} from "@/lib/adapters/supabase/database.types";
import type { OrderItemSummary, SlotChoice } from "@/features/orders/types";
import type { InvoiceDetail } from "@/features/billing/types";

export type AdminOrderSummary = Readonly<{
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  status: OrderStatus;
  version: number;
  estimateAmount: number;
  addressSnapshot: unknown;
  pickupSlotId: string;
  createdAt: string;
  updatedAt: string;
}>;

export type AdminOrderDetail = AdminOrderSummary &
  Readonly<{
    customerPhone: string | null;
    notes: string | null;
    items: OrderItemSummary[];
    slot: SlotChoice | null;
    task: null | {
      id: string;
      assignedAdminId: string;
      status: OrderStatus;
      scheduledAt: string | null;
      startedAt: string | null;
      arrivedAt: string | null;
      completedAt: string | null;
    };
    bags: ReadonlyArray<{
      id: string;
      bagCode: string;
      expectedCount: number;
      receivedCount: number | null;
      verifiedAt: string | null;
    }>;
    condition: null | {
      code: string;
      description: string | null;
      createdAt: string;
    };
    evidence: null | {
      id: string;
      kind: "PICKUP_PROOF";
      mimeType: string;
      sizeBytes: number;
      sha256: string;
      createdAt: string;
    };
    history: ReadonlyArray<{
      id: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      actorId: string;
      actorRole: UserRole;
      note: string | null;
      occurredAt: string;
    }>;
    invoice: InvoiceDetail | null;
  }>;
