import type {
  OrderStatus,
  ServiceUnit,
} from "@/lib/adapters/supabase/database.types";
import type { InvoiceDetail } from "@/features/billing/types";

export type ServiceChoice = Readonly<{
  id: string;
  code: string;
  name: string;
  unit: ServiceUnit;
  durationHours: number;
  unitPrice: number;
  minimumCharge: number;
}>;

export type AddressChoice = Readonly<{
  id: string;
  label: string;
  addressText: string;
  latitude: number;
  longitude: number;
  notes: string | null;
  isDefault: boolean;
}>;

export type SlotChoice = Readonly<{
  id: string;
  serviceAreaId: string;
  startsAt: string;
  endsAt: string;
  remaining: number;
}>;

export type OrderSummary = Readonly<{
  id: string;
  orderNo: string;
  status: OrderStatus;
  estimateAmount: number;
  currency: string;
  pickupSlotId: string;
  addressSnapshot: unknown;
  notes: string | null;
  createdAt: string;
}>;

export type OrderItemSummary = Readonly<{
  id: string;
  serviceId: string;
  serviceSnapshot: unknown;
  estimatedQty: number;
  preferenceSnapshot: unknown;
  actualQty: number | null;
}>;

export type OrderDetail = OrderSummary &
  Readonly<{
    items: OrderItemSummary[];
    history: ReadonlyArray<{
      id: string;
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      occurredAt: string;
    }>;
    slot: SlotChoice | null;
    pickupVerification: null | {
      bagCodes: readonly string[];
      conditionCode: string | null;
      conditionDescription: string | null;
      proofMimeType: string | null;
      proofSizeBytes: number | null;
    };
    invoice: InvoiceDetail | null;
  }>;
