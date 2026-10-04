import type { OrderStatus } from "@/lib/adapters/supabase/database.types";

export const INITIAL_ORDER_STATUS =
  "PENDING_CONFIRMATION" as const satisfies OrderStatus;

export const ORDER_STATUS_LABEL: Readonly<Record<OrderStatus, string>> = {
  PENDING_CONFIRMATION: "Menunggu konfirmasi",
  CONFIRMED: "Dikonfirmasi",
  PICKUP_SCHEDULED: "Pickup terjadwal",
  PICKUP_ON_THE_WAY: "Admin menuju pickup",
  PICKED_UP: "Laundry sudah dijemput",
  RECEIVED: "Diterima di outlet",
  WEIGHED: "Sudah ditimbang",
  WAITING_PAYMENT: "Menunggu pembayaran",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export const M3_ACTIVE_ORDER_STATUSES: readonly OrderStatus[] = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PICKUP_SCHEDULED",
  "PICKUP_ON_THE_WAY",
  "PICKED_UP",
  "RECEIVED",
];

export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatJakartaDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
