import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MapPin, Clock, Wallet } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { customerHead } from "@/lib/customer-meta";
import { customerOf, serviceOf, rp } from "@/lib/admin/data";
import { ME, CUSTOMER_LABEL, Progress } from "@/components/customer/Shell";
import { Eyebrow, Panel, Pill, MapView } from "@/components/admin/kit";
import folding from "@/assets/folding.jpg";

export const Route = createFileRoute("/app/")({
  head: customerHead("Dashboard", "Pantau laundry aktif, jadwal jemput & antar, dan riwayat pesanan TitipCuci kamu."),
  component: Dashboard,
});

function Dashboard() {
  const { orders } = useAdmin();
  const me = customerOf(ME);
  const mine = orders.filter((o) => o.customerId === ME);
  const active = mine.filter((o) => o.status !== "COMPLETED");
  const primary = active.find((o) => o.status === "WAITING_PAYMENT") ?? active[0];
  const history = mine.filter((o) => o.status === "COMPLETED");

  return (
    <>
      <div className="mb-10 animate-slidein">
        <Eyebrow>Halo, {me.name.split(" ")[0]}</Eyebrow>
        <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-7xl">Laundry kamu,<br /><em>kami yang urus.</em></h1>
      </div>

      {primary ? (
        <Link to="/app/orders/$id" params={{ id: primary.id }} className="group grid overflow-hidden rounded-3xl bg-ink text-bone shadow-float transition-transform duration-500 hover:-translate-y-1 md:grid-cols-[1.3fr_1fr]">
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between"><span className="text-xs text-bone/60">#{primary.id} · {serviceOf(primary.serviceId).name}</span><Pill tone="lime" live={primary.status.endsWith("ON_THE_WAY")}>Aktif</Pill></div>
            <p className="mt-6 font-display text-4xl leading-tight md:text-5xl">{CUSTOMER_LABEL[primary.status]}</p>
            <div className="mt-8 [&_.bg-border]:bg-bone/15 [&_.bg-ink]:bg-bone [&_span]:text-bone/50"><Progress status={primary.status} /></div>
            <div className="mt-8 flex flex-wrap gap-6 text-sm">
              <span className="flex items-center gap-2"><Clock className="h-4 w-4 text-primary" />{primary.status.startsWith("DELIVERY") || primary.status === "READY" ? `Antar ${primary.deliverySlot ?? "segera"}` : `Jemput ${primary.pickupDate} · ${primary.slot}`}</span>
              {primary.status === "WAITING_PAYMENT" && primary.invoice && <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-primary" />Tagihan {rp(primary.invoice.total)}</span>}
            </div>
            <span className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">{primary.status === "WAITING_PAYMENT" ? "Bayar Sekarang" : "Lihat Status"} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </div>
          {primary.status.endsWith("ON_THE_WAY") ? <MapView live className="min-h-[260px] rounded-none" /> : <div className="relative min-h-[260px]"><img src={folding} alt="Pakaian dilipat rapi" className="absolute inset-0 h-full w-full object-cover" /></div>}
        </Link>
      ) : (
        <div className="rounded-3xl bg-ink p-8 text-bone">
          <p className="font-display text-4xl">Nggak sempat nyuci? <em className="text-primary">Titip aja.</em></p>
          <Link to="/app/new" className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground">Buat Pesanan <ArrowRight className="h-4 w-4" /></Link>
        </div>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <Panel title="Pesanan aktif" className="md:col-span-2" action={<Link to="/app/new" className="rounded-full bg-primary px-4 py-2 text-xs font-semibold">Buat Pesanan</Link>}>
          {active.map((o) => (
            <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }} className="flex items-center justify-between gap-3 rounded-2xl px-3 py-3 hover:bg-secondary">
              <div><p className="text-sm font-semibold">#{o.id} · {serviceOf(o.serviceId).name}</p><p className="text-xs text-muted-foreground">{CUSTOMER_LABEL[o.status]}</p></div>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ))}
          {!active.length && <p className="text-sm text-muted-foreground">Belum ada pesanan aktif.</p>}
        </Panel>
        <Panel title="Alamat tersimpan" action={<Link to="/app/addresses" className="text-xs font-semibold hover:underline">Kelola</Link>}>
          {me.addresses.map((a, i) => <p key={a} className="flex gap-2 py-1.5 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{a}{i === 0 && <Pill className="ml-auto">Utama</Pill>}</p>)}
        </Panel>
      </div>

      <Panel title="Riwayat terbaru" className="mt-6" action={<Link to="/app/history" className="text-xs font-semibold hover:underline">Semua</Link>}>
        {history.length ? history.map((o) => <div key={o.id} className="flex justify-between py-2 text-sm"><span>#{o.id} · {o.pickupDate}</span><span className="font-semibold">{o.invoice ? rp(o.invoice.total) : "—"}</span></div>) : <p className="text-sm text-muted-foreground">Pesanan selesai akan muncul di sini.</p>}
      </Panel>
    </>
  );
}
