import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Phone, Package, Scale, MapPin, ShieldCheck } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { serviceOf, rp, clock, type Order } from "@/lib/admin/data";
import { CUSTOMER_LABEL, Progress, ME } from "@/components/customer/Shell";
import { Eyebrow, Panel, Row, MapView, Pill, Btn, PayPill } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Pesanan #${params.id} — TitipCuci` },
      { name: "description", content: "Status laundry kamu secara real-time: jemput, timbang, bayar, cuci, antar." },
      { property: "og:title", content: `Pesanan #${params.id} — TitipCuci` },
      { property: "og:description", content: "Status laundry kamu secara real-time." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: OrderPage,
});

const WEIGH = ["PICKED_UP", "RECEIVED", "WEIGHING", "INVOICE_DRAFT", "NEEDS_CUSTOMER_APPROVAL"];

function OrderPage() {
  const { id } = Route.useParams();
  const { get } = useAdmin();
  const o = get(id);
  if (!o || o.customerId !== ME) return <p className="py-20 text-center text-muted-foreground">Pesanan tidak ditemukan.</p>;
  const live = o.status === "PICKUP_ON_THE_WAY" || o.status === "DELIVERY_ON_THE_WAY";

  return (
    <div className="mx-auto max-w-3xl">
      <Link to="/app/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Pesanan</Link>
      {live ? <LiveTrack o={o} /> : (
        <>
          <div className="mb-8 animate-slidein">
            <Eyebrow>#{o.id} · {serviceOf(o.serviceId).name}</Eyebrow>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">{WEIGH.includes(o.status) && o.status !== "NEEDS_CUSTOMER_APPROVAL" ? <>Laundry kamu sudah <em>kami terima.</em></> : CUSTOMER_LABEL[o.status]}</h1>
          </div>
          <div className="mb-8"><Progress status={o.status} /></div>
          <div key={o.status} className="animate-slidein"><Main o={o} /></div>
        </>
      )}
      <Details o={o} />
    </div>
  );
}

function Main({ o }: { o: Order }) {
  const { update } = useAdmin();
  if (o.status === "NEW" || o.status === "PICKUP_SCHEDULED")
    return (
      <div className="rounded-3xl bg-ink p-6 text-bone md:p-8">
        <Pill tone={o.status === "NEW" ? "warn" : "lime"}>{o.status === "NEW" ? "Menunggu konfirmasi" : "Terkonfirmasi"}</Pill>
        <p className="mt-6 text-sm text-bone/60">Jadwal jemput</p>
        <p className="font-display text-5xl text-primary">{o.slot}</p>
        <p className="mt-1 text-sm">{o.pickupDate}</p>
        <p className="mt-6 text-sm text-bone/70">{o.status === "NEW" ? "TitipCuci sedang meninjau pesananmu. Kamu akan dapat notifikasi saat pickup dijadwalkan." : "Siapkan laundry dalam tas. Kamu bisa pantau petugas secara live saat ia berangkat."}</p>
      </div>
    );
  if (o.status === "NEEDS_CUSTOMER_APPROVAL")
    return (
      <Panel>
        <p className="font-semibold">Petugas menemukan kondisi yang butuh penanganan khusus: {o.condition?.tags.join(", ")}.</p>
        <p className="mt-1 text-sm text-muted-foreground">Treatment tambahan dapat memengaruhi harga. Setujui agar laundry bisa lanjut ditimbang.</p>
        <Btn className="mt-5" onClick={() => update(o.id, {}, "WEIGHING", "Customer menyetujui treatment")}>Setujui Penanganan</Btn>
      </Panel>
    );
  if (WEIGH.includes(o.status))
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <p className="flex items-center gap-2 text-sm font-semibold"><ShieldCheck className="h-4 w-4" /> Pickup terkonfirmasi</p>
          <div className="mt-3 divide-y divide-border">
            <Row k="Dijemput" v={clock(o.pickupProof?.at)} />
            <Row k="Jumlah tas" v={o.bags.length} />
            {o.bags.map((b) => <Row key={b.id} k={<span className="flex items-center gap-2"><Package className="h-4 w-4" />Tas</span>} v={b.id} />)}
          </div>
        </Panel>
        <div className="flex flex-col justify-between rounded-3xl bg-ink p-6 text-bone">
          <p className="flex items-center gap-2 text-sm text-bone/60"><Scale className="h-4 w-4" /> Berat aktual</p>
          <p className="my-6 flex items-center gap-3 font-display text-5xl text-primary"><span className="h-3 w-3 animate-pulse rounded-full bg-primary" />Sedang ditimbang</p>
          <p className="text-xs text-bone/60">Petugas menimbang di outlet. Harga final dan tagihan muncul setelahnya.</p>
        </div>
      </div>
    );
  if (o.status === "WAITING_PAYMENT" && o.invoice) return <InvoiceCard o={o} />;
  if (["PROCESSING", "REPROCESSING", "QUALITY_CHECK", "READY"].includes(o.status)) {
    const done = o.stages.filter((s) => s.end).length;
    return (
      <Panel>
        <div className="flex items-center justify-between"><p className="text-sm font-semibold">Tahap pencucian</p><span className="font-display text-3xl">{o.status === "READY" ? 100 : Math.round((done / o.stages.length) * 100)}%</span></div>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {o.stages.map((s) => <div key={s.name} className={cn("rounded-2xl p-3 text-center text-xs font-semibold transition-colors duration-500", s.end || o.status === "READY" ? "bg-ok-soft" : s.start ? "bg-primary" : "bg-secondary text-muted-foreground")}>{s.name}</div>)}
        </div>
        {o.status === "READY" && <p className="mt-4 text-sm">Laundry kamu lolos quality check dan siap diantar {o.deliverySlot ?? "segera"}.</p>}
      </Panel>
    );
  }
  return (
    <Panel>
      <p className="text-sm font-semibold">Bukti pengantaran</p>
      <div className="mt-3 divide-y divide-border"><Row k="Metode" v={o.delivery?.method ?? "—"} /><Row k="Waktu" v={clock(o.delivery?.at)} /><Row k="Foto" v={o.delivery?.photo ? "Tersedia" : "—"} /></div>
    </Panel>
  );
}

export function InvoiceCard({ o, hideCta }: { o: Order; hideCta?: boolean }) {
  const s = serviceOf(o.serviceId);
  const inv = o.invoice!;
  return (
    <div className="overflow-hidden rounded-3xl bg-card shadow-float">
      <div className="bg-ink p-6 text-bone md:p-8">
        <div className="flex items-center justify-between"><p className="text-sm text-bone/60">Berat aktual</p><PayPill s={o.payment.status} /></div>
        <p className="mt-2 font-display text-7xl leading-none text-primary">{o.actualWeight} <span className="text-3xl">kg</span></p>
        <p className="mt-2 text-xs text-bone/60">Ditimbang oleh petugas TitipCuci di outlet</p>
      </div>
      <div className="p-6 md:p-8">
        <div className="divide-y divide-border">
          <Row k="Layanan" v={s.name} />
          <Row k={`${o.actualWeight} × ${rp(s.price)}`} v={rp(inv.subtotal)} />
          <Row k="Pickup & Delivery" v={rp(inv.fee)} />
          {inv.discount > 0 && <Row k="Diskon" v={`−${rp(inv.discount)}`} />}
          <Row k="Total" v={<span className="font-display text-4xl">{rp(inv.total)}</span>} strong />
        </div>
        {!hideCta && (
          <>
            <p className="mt-4 text-sm font-semibold">{o.payment.status === "EXPIRED" ? "Tagihan kedaluwarsa — buat pembayaran baru" : "Menunggu pembayaran"}</p>
            <Link to="/app/pay/$id" params={{ id: o.id }} className="mt-4 flex items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold transition-transform hover:scale-[1.02]">Bayar Sekarang <ArrowRight className="h-4 w-4" /></Link>
          </>
        )}
      </div>
    </div>
  );
}

function LiveTrack({ o }: { o: Order }) {
  const [p, setP] = useState(0.2);
  useEffect(() => { const t = setInterval(() => setP((x) => Math.min(0.92, x + 0.04)), 1500); return () => clearInterval(t); }, []);
  const eta = Math.max(1, Math.round((1 - p) * 14));
  const pickup = o.status === "PICKUP_ON_THE_WAY";
  return (
    <div className="-mx-5 md:mx-0">
      <MapView live progress={p} className="h-[55vh] min-h-[360px] rounded-none md:rounded-3xl" />
      <div className="relative z-10 -mt-10 rounded-t-3xl bg-card p-6 shadow-float md:mx-6 md:rounded-3xl">
        <p className="flex items-center gap-2 text-sm font-semibold"><span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" /><span className="relative h-2.5 w-2.5 rounded-full bg-primary" /></span>{pickup ? "Petugas sedang menuju lokasi kamu" : "Laundry kamu sedang diantar"}</p>
        <div className="mt-4 flex items-end justify-between">
          <div><p className="text-xs text-muted-foreground">Estimasi tiba</p><p className="font-display text-6xl leading-none tabular-nums">{eta}<span className="text-2xl"> mnt</span></p></div>
          <div className="text-right text-xs text-muted-foreground"><p>{pickup ? "Jendela jemput" : "Jendela antar"}</p><p className="font-semibold text-foreground">{pickup ? o.slot : o.deliverySlot}</p></div>
        </div>
        <div className="mt-5 flex items-center gap-3 border-t border-border pt-5">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-xs font-bold text-primary">RH</span>
          <div className="flex-1"><p className="text-sm font-semibold">Rudi Hartono</p><p className="text-xs text-muted-foreground">Petugas TitipCuci · B 4821 TC</p></div>
          <a href="tel:+6281200000000" className="grid h-11 w-11 place-items-center rounded-full border border-border" aria-label="Telepon petugas"><Phone className="h-4 w-4" /></a>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">#{o.id} · {serviceOf(o.serviceId).name} · lokasi petugas hanya dibagikan selama perjalanan</p>
      </div>
    </div>
  );
}

function Details({ o }: { o: Order }) {
  return (
    <div className="mt-6 grid gap-6 md:grid-cols-2">
      <Panel title="Detail pesanan">
        <div className="divide-y divide-border">
          <Row k="Layanan" v={serviceOf(o.serviceId).name} />
          <Row k="Jadwal jemput" v={`${o.pickupDate} · ${o.slot}`} />
          <Row k={<span className="flex items-center gap-1"><MapPin className="h-4 w-4" />Alamat</span>} v={o.address} />
          <Row k="Preferensi" v={o.preferences.join(", ") || "—"} />
          {o.customerNote && <Row k="Catatan" v={o.customerNote} />}
        </div>
      </Panel>
      <Panel title="Riwayat status">
        <ol className="relative space-y-4 border-l border-border pl-5">
          {[...o.timeline].reverse().map((t, i) => (
            <li key={i} className="relative">
              <span className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full", i === 0 ? "bg-primary ring-4 ring-ok-soft" : "bg-ink")} />
              <p className="text-sm font-semibold">{CUSTOMER_LABEL[t.status] ?? t.status}</p>
              <p className="text-xs text-muted-foreground">{clock(t.at)}</p>
            </li>
          ))}
        </ol>
      </Panel>
    </div>
  );
}
