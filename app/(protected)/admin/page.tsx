import { ArrowRight, ClipboardList, Scale, Truck } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AdminOrderCard } from "@/features/admin-orders/components/admin-order-card";
import { listAdminOrders } from "@/features/admin-orders/repository";
import { requireArea } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Area Admin" };

export default async function AdminHomePage() {
  const principal = await requireArea("admin");
  const orders = await listAdminOrders();
  const counters = [
    {
      label: "Pesanan baru",
      value: orders.filter((order) => order.status === "PENDING_CONFIRMATION")
        .length,
      icon: ClipboardList,
    },
    {
      label: "Pickup terjadwal",
      value: orders.filter((order) => order.status === "PICKUP_SCHEDULED")
        .length,
      icon: Truck,
    },
    {
      label: "Timbang / invoice",
      value: orders.filter((order) =>
        ["RECEIVED", "WEIGHED"].includes(order.status),
      ).length,
      icon: Scale,
    },
  ];
  return (
    <div>
      <header className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">
        <div>
          <p className="text-muted-foreground text-sm font-bold">
            Halo, {principal.fullName ?? "Admin TitipCuci"}
          </p>
          <h1 className="font-display mt-3 text-6xl leading-[0.92] sm:text-8xl">
            Operasional hari ini.
          </h1>
        </div>
        <Link
          href="/admin/orders"
          className="bg-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-sm font-extrabold"
        >
          Lihat semua pesanan{" "}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </header>
      <section className="bg-border mt-12 grid gap-px overflow-hidden rounded-3xl border sm:grid-cols-3">
        {counters.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-card p-6">
            <Icon className="text-muted-foreground size-5" aria-hidden="true" />
            <p className="font-display mt-6 text-5xl tabular-nums">{value}</p>
            <p className="text-muted-foreground mt-2 text-sm font-bold">
              {label}
            </p>
          </div>
        ))}
      </section>
      <section className="mt-12">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
              Queue masuk
            </p>
            <h2 className="font-display mt-2 text-4xl">Perlu tindakan</h2>
          </div>
          <Link
            href="/admin/orders"
            className="text-sm font-bold underline underline-offset-4"
          >
            Semua
          </Link>
        </div>
        {orders.filter(
          (order) =>
            !["WAITING_PAYMENT", "REJECTED", "CANCELLED"].includes(
              order.status,
            ),
        ).length === 0 ? (
          <div className="bg-card text-muted-foreground rounded-3xl border border-dashed p-10 text-center">
            Tidak ada pesanan aktif.
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {orders
              .filter(
                (order) =>
                  !["WAITING_PAYMENT", "REJECTED", "CANCELLED"].includes(
                    order.status,
                  ),
              )
              .slice(0, 6)
              .map((order) => (
                <AdminOrderCard key={order.id} order={order} />
              ))}
          </div>
        )}
      </section>
    </div>
  );
}
