import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { ORDER_GROUPS, STATUS_META, customerOf, serviceOf, clock } from "@/lib/admin/data";
import { PageHead, StatusPill } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders/")({
  validateSearch: z.object({ f: z.enum(ORDER_GROUPS).optional() }),
  head: adminHead("Pesanan", "Daftar pesanan masuk TitipCuci dengan filter status operasional."),
  component: Orders,
});

function Orders() {
  const { orders } = useAdmin();
  const { f = "Semua" } = Route.useSearch();
  const list = orders.filter((o) => f === "Semua" || STATUS_META[o.status].group === f || (f === "Issues" && o.delayed));

  return (
    <>
      <PageHead eyebrow="Pesanan masuk" title={<>Semua <em>pesanan.</em></>} />
      <div className="-mx-5 mb-6 flex gap-2 overflow-x-auto px-5 pb-1 md:mx-0 md:px-0">
        {ORDER_GROUPS.map((g) => {
          const n = orders.filter((o) => g === "Semua" || STATUS_META[o.status].group === g).length;
          return (
            <Link key={g} to="/admin/orders" search={{ f: g }} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-all", f === g ? "border-ink bg-ink text-bone" : "border-border bg-card hover:border-foreground/40")}>
              {g} <span className="ml-1 opacity-60">{n}</span>
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="hidden grid-cols-[110px_1.2fr_1fr_1.6fr_1fr_150px_70px_auto] gap-4 border-b border-border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground lg:grid">
          <span>Order</span><span>Customer</span><span>Layanan</span><span>Alamat pickup</span><span>Jadwal</span><span>Status</span><span>Dibuat</span><span />
        </div>
        {list.map((o, i) => {
          const c = customerOf(o.customerId);
          return (
            <div key={o.id} className="grid animate-slidein grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-b border-border px-5 py-4 last:border-0 lg:grid-cols-[110px_1.2fr_1fr_1.6fr_1fr_150px_70px_auto] lg:px-6" style={{ animationDelay: `${i * 30}ms` }}>
              <span className="text-sm font-bold">{o.id}</span>
              <span className="justify-self-end lg:order-none lg:hidden"><StatusPill status={o.status} /></span>
              <span className="col-span-2 text-sm font-semibold lg:col-span-1">{c.name}</span>
              <span className="col-span-2 text-sm text-muted-foreground lg:col-span-1">{serviceOf(o.serviceId).name}</span>
              <span className="col-span-2 truncate text-sm text-muted-foreground lg:col-span-1">{o.address}</span>
              <span className="text-sm">{o.pickupDate} · {o.slot.split(" ")[0]}</span>
              <span className="hidden lg:block"><StatusPill status={o.status} /></span>
              <span className="text-xs text-muted-foreground">{clock(o.createdAt)}</span>
              <Link to="/admin/orders/$id" params={{ id: o.id }} className="col-span-2 rounded-full bg-primary px-4 py-2 text-center text-sm font-semibold lg:col-span-1">Lihat Pesanan</Link>
            </div>
          );
        })}
        {!list.length && <p className="p-10 text-center text-sm text-muted-foreground">Tidak ada pesanan di kategori ini.</p>}
      </div>
    </>
  );
}
