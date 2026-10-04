import type { Metadata } from "next";
import Link from "next/link";

import { AdminOrderCard } from "@/features/admin-orders/components/admin-order-card";
import { listAdminOrders } from "@/features/admin-orders/repository";
import type { OrderStatus } from "@/lib/adapters/supabase/database.types";
import { ORDER_STATUS_LABEL } from "@/lib/domain/orders";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Operasi Pesanan" };

const FILTERS: ReadonlyArray<{ value: "ALL" | OrderStatus; label: string }> = [
  { value: "ALL", label: "Semua" },
  { value: "PENDING_CONFIRMATION", label: "Baru" },
  { value: "CONFIRMED", label: "Dikonfirmasi" },
  { value: "PICKUP_SCHEDULED", label: "Terjadwal" },
  { value: "PICKUP_ON_THE_WAY", label: "Menuju pickup" },
  { value: "PICKED_UP", label: "Dijemput" },
  { value: "RECEIVED", label: "Diterima" },
  { value: "WEIGHED", label: "Ditimbang" },
  { value: "WAITING_PAYMENT", label: "Menunggu bayar" },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const orders = await listAdminOrders();
  const requested = (await searchParams).status;
  const selected = FILTERS.some((item) => item.value === requested)
    ? requested!
    : "ALL";
  const filtered =
    selected === "ALL"
      ? orders
      : orders.filter((order) => order.status === selected);
  return (
    <div>
      <header>
        <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
          SCR-ADM-002 · Queue operasional
        </p>
        <h1 className="font-display mt-3 text-6xl">Semua pesanan.</h1>
        <p className="text-muted-foreground mt-4 max-w-2xl">
          Status berasal dari database dan setiap tindakan diperiksa ulang oleh
          transition guard.
        </p>
      </header>
      <nav
        className="-mx-5 mt-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0"
        aria-label="Filter status"
      >
        {FILTERS.map((filter) => {
          const count =
            filter.value === "ALL"
              ? orders.length
              : orders.filter((order) => order.status === filter.value).length;
          return (
            <Link
              key={filter.value}
              href={
                filter.value === "ALL"
                  ? "/admin/orders"
                  : `/admin/orders?status=${filter.value}`
              }
              className={cn(
                "shrink-0 rounded-full border px-4 py-2 text-sm font-bold",
                selected === filter.value
                  ? "border-ink bg-ink text-bone"
                  : "bg-card",
              )}
            >
              {filter.label} <span className="ml-1 opacity-60">{count}</span>
            </Link>
          );
        })}
      </nav>
      {filtered.length === 0 ? (
        <div className="bg-card text-muted-foreground mt-8 rounded-3xl border border-dashed p-10 text-center">
          Tidak ada pesanan pada filter ini.
        </div>
      ) : (
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          {filtered.map((order) => (
            <AdminOrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
      <p className="sr-only">
        Label status tersedia: {Object.values(ORDER_STATUS_LABEL).join(", ")}
      </p>
    </div>
  );
}
