import type { Metadata } from "next";

import { Plus } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { OrderCard } from "@/features/orders/components/order-card";
import { listOwnOrders } from "@/features/orders/repository";
import { requireArea } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Area Customer" };

export default async function CustomerHomePage() {
  const principal = await requireArea("customer");
  const orders = await listOwnOrders(principal);
  return (
    <div>
      <section className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-muted-foreground text-sm font-bold">
            Halo, {principal.fullName ?? "pelanggan TitipCuci"}
          </p>
          <h1 className="font-display mt-4 max-w-3xl text-6xl leading-[0.92] sm:text-8xl">
            Laundry rapi, tanpa menebak-nebak.
          </h1>
          <p className="text-muted-foreground mt-6 max-w-2xl leading-relaxed">
            Pilih layanan, tentukan titik pickup, lalu pantau pesanan milikmu
            dari sini.
          </p>
        </div>
        <Button asChild size="lg" className="shadow-float">
          <Link href="/app/orders/new">
            <Plus className="size-4" aria-hidden="true" /> Pesanan baru
          </Link>
        </Button>
      </section>

      <section className="mt-16">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
              Pesananmu
            </p>
            <h2 className="font-display mt-2 text-4xl">Aktivitas terbaru</h2>
          </div>
          {orders.length > 0 && (
            <Link
              href="/app/orders"
              className="text-sm font-bold underline underline-offset-4"
            >
              Lihat semua
            </Link>
          )}
        </div>
        {orders.length === 0 ? (
          <div className="bg-card rounded-3xl border border-dashed p-10 text-center">
            <p className="font-display text-3xl">Belum ada pesanan.</p>
            <p className="text-muted-foreground mt-2 text-sm">
              Pesanan baru akan muncul di sini setelah berhasil dibuat.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {orders.slice(0, 4).map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
