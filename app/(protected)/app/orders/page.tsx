import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OrderCard } from "@/features/orders/components/order-card";
import { listOwnOrders } from "@/features/orders/repository";
import { requireArea } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Pesanan Saya" };

export default async function OrdersPage() {
  const principal = await requireArea("customer");
  const orders = await listOwnOrders(principal);
  return (
    <div>
      <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
            Riwayat Customer
          </p>
          <h1 className="font-display mt-3 text-6xl">Pesanan saya</h1>
        </div>
        <Button asChild>
          <Link href="/app/orders/new">
            <Plus className="size-4" aria-hidden="true" /> Pesanan baru
          </Link>
        </Button>
      </div>
      {orders.length === 0 ? (
        <div className="bg-card text-muted-foreground mt-10 rounded-3xl border border-dashed p-10 text-center">
          Belum ada pesanan milik akun ini.
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
