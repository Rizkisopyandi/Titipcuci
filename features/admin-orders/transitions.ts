import type { OrderStatus } from "@/lib/adapters/supabase/database.types";
import type { AdminOrderCommand } from "@/features/admin-orders/schemas";

export const ADMIN_TRANSITION_TARGET: Readonly<
  Partial<Record<OrderStatus, readonly AdminOrderCommand[]>>
> = {
  PENDING_CONFIRMATION: ["CONFIRM", "REJECT"],
  CONFIRMED: ["SCHEDULE_PICKUP", "CANCEL"],
  PICKUP_SCHEDULED: ["START_PICKUP", "CANCEL"],
  PICKUP_ON_THE_WAY: ["ARRIVE_PICKUP", "COMPLETE_PICKUP"],
  PICKED_UP: ["RECEIVE"],
};

export function isAdminCommandAllowed(
  status: OrderStatus,
  command: AdminOrderCommand,
) {
  return ADMIN_TRANSITION_TARGET[status]?.includes(command) ?? false;
}
