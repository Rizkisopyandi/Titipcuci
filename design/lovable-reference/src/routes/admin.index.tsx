import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, ArrowRight } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { clock, type OrderStatus } from "@/lib/admin/data";
import { PageHead, Panel, Pill } from "@/components/admin/kit";
import { OrderLine } from "@/components/admin/OrderCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/")({
  head: adminHead("Dashboard", "Ringkasan operasional harian TitipCuci: pickup, proses, pengantaran, dan kendala."),
  component: Dashboard,
});

const COUNTERS: { label: string; match: OrderStatus[]; hot?: boolean }[] = [
  { label: "Pesanan Baru", match: ["NEW"], hot: true },
  { label: "Pickup Terjadwal", match: ["PICKUP_SCHEDULED"] },
  { label: "Menuju Pickup", match: ["PICKUP_ON_THE_WAY"] },
  { label: "Menunggu Timbang", match: ["RECEIVED", "WEIGHING", "INVOICE_DRAFT"] },
  { label: "Menunggu Bayar", match: ["WAITING_PAYMENT"] },
  { label: "Diproses", match: ["PROCESSING", "REPROCESSING"] },
  { label: "Quality Check", match: ["QUALITY_CHECK"] },
  { label: "Siap Diantar", match: ["READY"] },
  { label: "Dalam Pengantaran", match: ["DELIVERY_ON_THE_WAY"] },
  { label: "Selesai Hari Ini", match: ["DELIVERED", "COMPLETED"] },
];

function Dashboard() {
  const { orders, activity } = useAdmin();
  const issues = orders.filter((o) => o.delayed || o.status === "NEEDS_CUSTOMER_APPROVAL" || o.status === "REPROCESSING");
  const pickups = orders.filter((o) => ["NEW", "PICKUP_SCHEDULED", "PICKUP_ON_THE_WAY"].includes(o.status) && o.pickupDate === "Hari ini");
  const deliveries = orders.filter((o) => ["READY", "DELIVERY_ON_THE_WAY"].includes(o.status));
  const urgent = orders.filter((o) => o.urgent || o.delayed);
  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" });

  return (
    <>
      <PageHead eyebrow={today} title={<>Selamat sore, <em>Rudi.</em></>}>
        <Link to="/admin/orders" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold">Lihat Pesanan <ArrowRight className="h-4 w-4" /></Link>
      </PageHead>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
        {COUNTERS.map((c, i) => {
          const n = orders.filter((o) => c.match.includes(o.status)).length;
          return (
            <div key={c.label} className={cn("bg-card p-4 animate-slidein", c.hot && n > 0 && "bg-primary")} style={{ animationDelay: `${i * 40}ms` }}>
              <p className="font-display text-4xl leading-none tabular-nums">{n}</p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">{c.label}</p>
            </div>
          );
        })}
        <Link to="/admin/orders" search={{ f: "Issues" }} className={cn("bg-card p-4 lg:col-span-2", issues.length && "bg-danger-soft")}>
          <p className="flex items-center gap-2 font-display text-4xl leading-none text-destructive tabular-nums">{issues.length}<AlertTriangle className="h-5 w-5" /></p>
          <p className="mt-2 text-xs font-semibold text-destructive">Terlambat / Kendala</p>
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Jadwal pickup hari ini" action={<Link to="/admin/schedule" className="text-xs font-semibold underline-offset-4 hover:underline">Semua</Link>}>
          {pickups.length ? pickups.map((o) => <OrderLine key={o.id} o={o} />) : <p className="text-sm text-muted-foreground">Tidak ada pickup.</p>}
        </Panel>
        <Panel title="Jadwal pengantaran hari ini" action={<Link to="/admin/schedule" className="text-xs font-semibold underline-offset-4 hover:underline">Semua</Link>}>
          {deliveries.length ? deliveries.map((o) => <OrderLine key={o.id} o={o} time={o.deliverySlot?.split(" ")[0]} />) : <p className="text-sm text-muted-foreground">Tidak ada pengantaran.</p>}
        </Panel>
        <Panel title="Perlu perhatian">
          {urgent.map((o) => (
            <div key={o.id} className="flex items-center gap-3">
              <div className="flex-1"><OrderLine o={o} /></div>
              {o.urgent ? <Pill tone="danger">Urgent</Pill> : <Pill tone="warn">Terlambat</Pill>}
            </div>
          ))}
        </Panel>
        <Panel title="Aktivitas terbaru">
          <ol className="relative space-y-4 border-l border-border pl-5">
            {activity.slice(0, 7).map((a, i) => (
              <li key={a.at + i} className="relative animate-slidein">
                <span className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full", i === 0 ? "bg-primary ring-4 ring-ok-soft" : "bg-border")} />
                <p className="text-sm">{a.text}</p>
                <p className="text-xs text-muted-foreground">{clock(a.at)}</p>
              </li>
            ))}
          </ol>
        </Panel>
      </div>
    </>
  );
}
