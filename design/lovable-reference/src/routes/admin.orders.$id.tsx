import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Phone, Lock, MessageSquare } from "lucide-react";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { FLOW, STATUS_META, customerOf, serviceOf, clock } from "@/lib/admin/data";
import { Panel, StatusPill, Row, MapView, Eyebrow, Pill, Btn } from "@/components/admin/kit";
import { Workflow, InvoiceTable, PaymentRows } from "@/components/admin/Workflow";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/orders/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} — TitipCuci Admin` },
      { name: "description", content: `Detail operasional pesanan ${params.id}.` },
      { property: "og:title", content: `${params.id} — TitipCuci Admin` },
      { property: "og:description", content: `Detail operasional pesanan ${params.id}.` },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: OrderDetail,
});

function OrderDetail() {
  const { id } = Route.useParams();
  const { get, update } = useAdmin();
  const o = get(id);
  const [note, setNote] = useState("");
  if (!o) return <p className="py-20 text-center text-muted-foreground">Pesanan {id} tidak ditemukan. <Link to="/admin/orders" className="underline">Kembali</Link></p>;
  const c = customerOf(o.customerId);
  const s = serviceOf(o.serviceId);
  const stepIdx = FLOW.indexOf(o.status);

  return (
    <>
      <Link to="/admin/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Pesanan</Link>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slidein">
        <div>
          <Eyebrow>{s.name}</Eyebrow>
          <h1 className="mt-3 font-display text-5xl leading-none md:text-7xl">{o.id}</h1>
        </div>
        <div className="flex items-center gap-2"><StatusPill status={o.status} />{o.urgent && <Pill tone="danger">Urgent</Pill>}</div>
      </div>

      {/* progress rail */}
      <div className="mb-8 flex gap-1">
        {FLOW.map((f, i) => (
          <div key={f} title={STATUS_META[f].label} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-700", i <= stepIdx ? "bg-ink" : "bg-border", i === stepIdx && "bg-primary")} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="grid gap-6 md:grid-cols-2">
            <Panel title="Customer">
              <p className="text-lg font-bold">{c.name}</p>
              <p className="text-sm text-muted-foreground">{c.phone} · sejak {c.since}</p>
              <div className="mt-4 flex gap-2">
                <a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold"><Phone className="h-4 w-4" />Telepon</a>
                <Link to="/admin/customers" search={{ id: c.id }} className="inline-flex items-center rounded-full border border-border px-4 py-2 text-sm font-semibold">Profil</Link>
              </div>
            </Panel>
            <Panel title="Alamat pickup">
              <div className="pb-4"><p className="text-sm">{o.address}</p><p className="text-xs text-muted-foreground">{o.area} · {o.distanceKm} km</p></div>
              <MapView className="aspect-[2/1]" />
            </Panel>
          </div>

          <Panel title="Pesanan">
            <div className="grid gap-x-8 md:grid-cols-2">
              <div className="divide-y divide-border">
                <Row k="Layanan" v={s.name} />
                <Row k="Jadwal pickup" v={`${o.pickupDate} · ${o.slot}`} />
                {o.deliverySlot && <Row k="Jadwal antar" v={o.deliverySlot} />}
                <Row k="Estimasi berat" v={o.estWeight ? `~${o.estWeight} kg` : "—"} />
                <Row k="Berat aktual" v={o.actualWeight ? `${o.actualWeight} kg` : "Belum ditimbang"} strong />
              </div>
              <div className="divide-y divide-border">
                <Row k="Tas" v={o.bags.length ? o.bags.map((b) => b.id).join(", ") : "Dicatat saat pickup"} />
                <Row k="Kondisi" v={o.condition?.tags.join(", ") ?? "Belum diperiksa"} />
                <Row k="Pembayaran" v={o.payment.status} />
                <Row k="Preferensi" v={o.preferences.join(", ") || "—"} />
              </div>
            </div>
            {o.customerNote && (
              <div className="mt-4 flex gap-3 rounded-2xl bg-secondary p-4 text-sm"><MessageSquare className="h-4 w-4 shrink-0" /><div><p className="text-xs font-semibold text-muted-foreground">Catatan customer</p>{o.customerNote}</div></div>
            )}
          </Panel>

          {o.invoice?.issued && (
            <div className="grid gap-6 md:grid-cols-2">
              <Panel title="Invoice"><InvoiceTable o={o} /></Panel>
              <Panel title="Pembayaran"><PaymentRows o={o} /></Panel>
            </div>
          )}

          <Panel title={<span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Catatan operasional internal</span>} action={<span className="text-xs text-muted-foreground">Tidak terlihat customer</span>}>
            <ul className="space-y-2">{o.internalNotes.map((n, i) => <li key={i} className="rounded-xl bg-secondary px-3 py-2 text-sm">{n}</li>)}</ul>
            <div className="mt-3 flex gap-2">
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambah catatan internal…" className="flex-1 rounded-full border border-input bg-background px-4 py-2.5 text-sm outline-none focus:border-ink" />
              <Btn variant="ink" disabled={!note} onClick={() => { update(o.id, { internalNotes: [...o.internalNotes, note] }); setNote(""); }}>Simpan</Btn>
            </div>
          </Panel>

          <Panel title="Timeline status">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {[...o.timeline].reverse().map((t, i) => (
                <li key={i} className="relative animate-slidein">
                  <span className={cn("absolute -left-[25px] top-1 h-2.5 w-2.5 rounded-full", i === 0 ? "bg-primary ring-4 ring-ok-soft" : "bg-ink")} />
                  <p className="text-sm font-semibold">{STATUS_META[t.status as keyof typeof STATUS_META]?.label ?? t.status}</p>
                  <p className="text-xs text-muted-foreground">{clock(t.at)}{t.note ? ` · ${t.note}` : ""}</p>
                </li>
              ))}
            </ol>
          </Panel>
        </div>

        <aside className="order-1 lg:order-2">
          <div className="rounded-3xl border border-border bg-card p-5 shadow-float md:p-6 lg:sticky lg:top-10">
            <Eyebrow className="mb-4">Langkah berikutnya</Eyebrow>
            <div key={o.status} className="animate-slidein"><Workflow o={o} /></div>
          </div>
        </aside>
      </div>
    </>
  );
}
