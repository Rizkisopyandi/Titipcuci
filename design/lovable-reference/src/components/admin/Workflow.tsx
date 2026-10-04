import { useState } from "react";
import { useNavigate, Link } from "@tanstack/react-router";
import { Lock, Navigation, Scale, ShieldAlert, Webhook, RotateCcw } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { DELIVERY_FEE, customerOf, serviceOf, rp, clock, freshStages, type Order } from "@/lib/admin/data";
import { Btn, Chip, CheckRow, Row, PhotoSlot, PayPill, Pill, Eyebrow, Success } from "./kit";
import { cn } from "@/lib/utils";

const Title = ({ children }: { children: React.ReactNode }) => <p className="font-display text-3xl leading-tight">{children}</p>;

export function Workflow({ o }: { o: Order }) {
  switch (o.status) {
    case "NEW": return <Confirm o={o} />;
    case "PICKUP_SCHEDULED": return <StartTrip o={o} kind="pickup" />;
    case "PICKUP_ON_THE_WAY":
    case "DELIVERY_ON_THE_WAY": return <GoLive o={o} />;
    case "PICKED_UP": return <Receive o={o} />;
    case "RECEIVED": return <Condition o={o} />;
    case "NEEDS_CUSTOMER_APPROVAL": return <Approval o={o} />;
    case "WEIGHING": return <Weigh o={o} />;
    case "INVOICE_DRAFT": return <Invoice o={o} />;
    case "WAITING_PAYMENT": return <Payment o={o} />;
    case "PROCESSING":
    case "REPROCESSING": return <Stages o={o} />;
    case "QUALITY_CHECK": return <QC o={o} />;
    case "READY": return <StartTrip o={o} kind="delivery" />;
    case "DELIVERED": return <Delivered o={o} />;
    case "COMPLETED": return <Success title="Pesanan selesai">Semua bukti tersimpan. Terima kasih, Rudi.</Success>;
  }
}

function Confirm({ o }: { o: Order }) {
  const { update } = useAdmin();
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const items: [string, string][] = [
    ["Customer & kontak valid", customerOf(o.customerId).phone],
    ["Lokasi pickup jelas", o.address],
    ["Layanan sesuai", serviceOf(o.serviceId).name],
    ["Slot pickup tersedia", `${o.pickupDate} · ${o.slot}`],
    ["Area terlayani", `${o.area} · ${o.distanceKm} km dari outlet`],
    ["Catatan sudah dibaca", o.customerNote ?? "Tidak ada catatan"],
  ];
  const all = items.every(([k]) => checks[k]);
  return (
    <div className="space-y-3">
      <Title>Tinjau & konfirmasi</Title>
      {items.map(([k, sub]) => <CheckRow key={k} label={k} sub={sub} on={!!checks[k]} onClick={() => setChecks((c) => ({ ...c, [k]: !c[k] }))} />)}
      <Btn size="lg" className="w-full" disabled={!all} onClick={() => update(o.id, {}, "PICKUP_SCHEDULED", "Pesanan dikonfirmasi, pickup dijadwalkan")}>Konfirmasi & Jadwalkan Pickup</Btn>
    </div>
  );
}

function StartTrip({ o, kind }: { o: Order; kind: "pickup" | "delivery" }) {
  const { update } = useAdmin();
  const nav = useNavigate();
  return (
    <div className="space-y-4">
      <Title>{kind === "pickup" ? "Siap berangkat jemput?" : "Siap diantar."}</Title>
      <p className="text-sm text-muted-foreground">Lokasi live kamu hanya dibagikan ke customer selama perjalanan berlangsung, dan berhenti otomatis setelah {kind === "pickup" ? "pickup" : "pengantaran"} selesai.</p>
      <Row k="Jendela" v={kind === "pickup" ? o.slot : (o.deliverySlot ?? "Hari ini")} />
      <Row k="Jarak" v={`${o.distanceKm} km`} />
      {kind === "delivery" && <Row k="Tas" v={o.bags.map((b) => b.id).join(", ") || "—"} />}
      <Btn size="lg" className="w-full" onClick={() => {
        update(o.id, { arrived: false }, kind === "pickup" ? "PICKUP_ON_THE_WAY" : "DELIVERY_ON_THE_WAY", kind === "pickup" ? "Admin berangkat menuju pickup" : "Pengantaran dimulai");
        nav({ to: "/admin/live/$id", params: { id: o.id } });
      }}>
        <Navigation className="h-4 w-4" /> {kind === "pickup" ? "Mulai Pickup" : "Mulai Pengantaran"}
      </Btn>
    </div>
  );
}

function GoLive({ o }: { o: Order }) {
  return (
    <div className="space-y-4">
      <Title>Perjalanan sedang berlangsung</Title>
      <Pill tone="ink" live>Live location aktif</Pill>
      <Link to="/admin/live/$id" params={{ id: o.id }} className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-7 py-4 font-semibold"><Navigation className="h-4 w-4" /> Buka layar navigasi</Link>
    </div>
  );
}

function Receive({ o }: { o: Order }) {
  const { update } = useAdmin();
  const [received, setReceived] = useState(false);
  return (
    <div className="space-y-3">
      <Title>{received ? "Laundry diterima." : "Terima di laundry"}</Title>
      <Row k="Tas" v={o.bags.map((b) => b.id).join(", ")} />
      <Row k="Bukti pickup" v={o.pickupProof ? `${clock(o.pickupProof.at)}${o.pickupProof.photo ? " · foto" : ""}` : "—"} />
      {!received ? (
        <Btn size="lg" variant="ink" className="w-full" onClick={() => setReceived(true)}>Laundry Diterima</Btn>
      ) : (
        <Btn size="lg" className="w-full animate-slidein" onClick={() => update(o.id, {}, "RECEIVED", "Laundry diterima di outlet")}>Mulai Pemeriksaan</Btn>
      )}
    </div>
  );
}

const CONDITIONS = ["Normal", "Existing stain", "Torn / damaged", "Color-sensitive", "Special handling", "Other"];
function Condition({ o }: { o: Order }) {
  const { update } = useAdmin();
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [photos, setPhotos] = useState(0);
  const [affects, setAffects] = useState(false);
  const toggle = (t: string) => setTags((s) => (t === "Normal" ? ["Normal"] : s.includes(t) ? s.filter((x) => x !== t) : [...s.filter((x) => x !== "Normal"), t]));
  return (
    <div className="space-y-4">
      <Title>Cek kondisi</Title>
      <div className="flex flex-wrap gap-2">{CONDITIONS.map((c) => <Chip key={c} on={tags.includes(c)} onClick={() => toggle(c)}>{c}</Chip>)}</div>
      <div><Eyebrow className="mb-2">Bukti foto</Eyebrow><div className="flex gap-2">{[0, 1, 2].map((i) => <PhotoSlot key={i} taken={photos > i} onClick={() => setPhotos(Math.max(photos, i + 1))} />)}</div></div>
      <div>
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold"><Lock className="h-3.5 w-3.5" /> Catatan internal — tidak terlihat customer</p>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:border-ink" placeholder="Mis. noda tinta di kerah kemeja biru" />
      </div>
      {!tags.includes("Normal") && tags.length > 0 && (
        <CheckRow on={affects} onClick={() => setAffects(!affects)} label="Treatment memengaruhi harga / layanan" sub="Pesanan akan menunggu persetujuan customer" />
      )}
      <Btn size="lg" className="w-full" disabled={!tags.length} onClick={() =>
        update(o.id, { condition: { tags, internalNote: note, photos, at: new Date().toISOString() }, internalNotes: note ? [...o.internalNotes, note] : o.internalNotes },
          affects ? "NEEDS_CUSTOMER_APPROVAL" : "WEIGHING", affects ? "Butuh persetujuan customer" : "Pemeriksaan kondisi selesai")}>
        Simpan Pemeriksaan
      </Btn>
    </div>
  );
}

function Approval({ o }: { o: Order }) {
  const { update } = useAdmin();
  return (
    <div className="space-y-4">
      <Title>Menunggu persetujuan customer</Title>
      <div className="rounded-2xl bg-warn-soft p-4 text-sm text-warn"><ShieldAlert className="mb-2 h-5 w-5" />Customer sudah diberi tahu tentang treatment tambahan: {o.condition?.tags.join(", ")}.</div>
      <DemoBox>
        <Btn variant="ghost" className="w-full" onClick={() => update(o.id, { delayed: false }, "WEIGHING", "Customer menyetujui treatment")}>Customer menyetujui</Btn>
      </DemoBox>
    </div>
  );
}

function Weigh({ o }: { o: Order }) {
  const { update } = useAdmin();
  const s = serviceOf(o.serviceId);
  const [kg, setKg] = useState("");
  const w = Math.round(parseFloat(kg.replace(",", ".")) * 10) / 10;
  const valid = w > 0 && w < 100;
  const sub = valid ? Math.round(w * s.price) : 0;
  return (
    <div className="space-y-4">
      <Title>Timbang berat aktual</Title>
      <Row k="Estimasi customer" v={<span className="text-muted-foreground">{o.estWeight ? `~${o.estWeight} kg · tidak mengikat` : "—"}</span>} />
      <label className="block rounded-3xl bg-ink p-6 text-bone">
        <span className="flex items-center gap-2 text-xs text-bone/60"><Scale className="h-4 w-4" /> Berat aktual</span>
        <span className="mt-2 flex items-baseline gap-2">
          <input inputMode="decimal" autoFocus value={kg} onChange={(e) => setKg(e.target.value.replace(/[^0-9.,]/g, ""))} placeholder="0.0" className="w-full bg-transparent font-display text-7xl leading-none tabular-nums text-primary outline-none placeholder:text-bone/20" />
          <span className="font-display text-3xl">kg</span>
        </span>
      </label>
      <div className="divide-y divide-border">
        <Row k={`${s.name} · ${rp(s.price)} / kg`} v={valid ? rp(sub) : "—"} />
        <Row k="Pickup & Delivery" v={rp(DELIVERY_FEE)} />
        <Row k="Total final" v={<span className="font-display text-3xl">{valid ? rp(sub + DELIVERY_FEE) : "—"}</span>} strong />
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Hanya Admin yang bisa mengisi berat. Customer tidak dapat mengubah nilai ini.</p>
      <Btn size="lg" className="w-full" disabled={!valid} onClick={() => update(o.id, { actualWeight: w, invoice: { subtotal: sub, fee: DELIVERY_FEE, discount: 0, total: sub + DELIVERY_FEE, issued: false } }, "INVOICE_DRAFT", `Berat aktual ${w} kg dicatat`)}>
        Konfirmasi Berat & Buat Invoice
      </Btn>
    </div>
  );
}

export function InvoiceTable({ o }: { o: Order }) {
  const s = serviceOf(o.serviceId);
  const inv = o.invoice!;
  return (
    <div className="divide-y divide-border">
      <Row k="Layanan" v={s.name} />
      <Row k="Berat aktual" v={`${o.actualWeight} kg`} />
      <Row k="Harga satuan" v={`${rp(s.price)} / kg`} />
      <Row k="Subtotal" v={rp(inv.subtotal)} />
      <Row k="Pickup & Delivery" v={rp(inv.fee)} />
      {inv.discount > 0 && <Row k="Diskon" v={`−${rp(inv.discount)}`} />}
      <Row k="Total" v={<span className="font-display text-3xl">{rp(inv.total)}</span>} strong />
    </div>
  );
}

function Invoice({ o }: { o: Order }) {
  const { update } = useAdmin();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><Title>Invoice final</Title><Pill tone="warn">Draft</Pill></div>
      <InvoiceTable o={o} />
      <Btn size="lg" className="w-full" onClick={() => update(o.id, { invoice: { ...o.invoice!, issued: true, issuedAt: new Date().toISOString() }, payment: { status: "PENDING", method: "QRIS", ref: "QR-" + Math.floor(Math.random() * 9e7 + 1e7) } }, "WAITING_PAYMENT", `Invoice diterbitkan ${rp(o.invoice!.total)}`)}>
        Terbitkan Invoice
      </Btn>
    </div>
  );
}

export function PaymentRows({ o }: { o: Order }) {
  return (
    <div className="divide-y divide-border">
      <Row k="Status" v={<PayPill s={o.payment.status} />} />
      <Row k="Jumlah" v={o.invoice ? rp(o.invoice.total) : "—"} />
      <Row k="Metode" v={o.payment.method ?? "—"} />
      <Row k="Referensi" v={o.payment.ref ?? "—"} />
      <Row k="Waktu bayar" v={clock(o.payment.at)} />
    </div>
  );
}

function Payment({ o }: { o: Order }) {
  const { update } = useAdmin();
  const expired = o.payment.status === "EXPIRED" || o.payment.status === "FAILED";
  return (
    <div className="space-y-4">
      <Title>{expired ? "Payment Expired" : "Menunggu pembayaran"}</Title>
      <PaymentRows o={o} />
      <p className="flex items-start gap-2 rounded-2xl bg-secondary p-3 text-xs text-muted-foreground"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" /> Status lunas hanya berasal dari verifikasi payment gateway. Admin tidak bisa menandai lunas secara manual.</p>
      {expired && <Btn variant="ink" className="w-full" onClick={() => update(o.id, { payment: { ...o.payment, status: "PENDING", ref: "QR-" + Math.floor(Math.random() * 9e7 + 1e7) } }, undefined, "Tagihan baru dikirim ke customer")}><RotateCcw className="h-4 w-4" /> Kirim ulang tagihan</Btn>}
      {!expired && (
        <DemoBox>
          <div className="grid grid-cols-2 gap-2">
            <Btn variant="ghost" onClick={() => update(o.id, { payment: { ...o.payment, status: "PAID", at: new Date().toISOString() }, stages: freshStages() }, "PROCESSING", "Pembayaran terverifikasi (webhook)")}><Webhook className="h-4 w-4" /> Webhook: PAID</Btn>
            <Btn variant="ghost" onClick={() => update(o.id, { payment: { ...o.payment, status: "EXPIRED" } }, undefined, "Pembayaran kedaluwarsa")}>Webhook: EXPIRED</Btn>
          </div>
        </DemoBox>
      )}
    </div>
  );
}

export function Stages({ o, compact }: { o: Order; compact?: boolean }) {
  const { update } = useAdmin();
  const now = () => new Date().toISOString();
  const re = o.status === "REPROCESSING";
  const started = o.stages.some((s) => s.start);
  const done = o.stages.filter((s) => s.end).length;
  const pct = Math.round((done / o.stages.length) * 100);
  const set = (i: number, patch: Partial<Order["stages"][number]>) => update(o.id, { stages: o.stages.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const current = o.stages.findIndex((s) => !s.end);

  if (re && !started && !compact)
    return (
      <div className="space-y-4">
        <Title>QC gagal — perlu reprocess</Title>
        <p className="text-sm text-muted-foreground">Gagal QC {o.qcFails}×. Proses diulang dari tahap yang dibutuhkan.</p>
        <Btn size="lg" className="w-full" onClick={() => update(o.id, { stages: o.stages.map((s, i) => (i === 0 ? { ...s, start: now() } : s)) }, undefined, "Reprocess dimulai")}>Mulai Reprocess</Btn>
      </div>
    );

  return (
    <div className="space-y-4">
      {!compact && <div className="flex items-center justify-between"><Title>{re ? "Reprocess" : "Proses laundry"}</Title><span className="font-display text-3xl tabular-nums">{pct}%</span></div>}
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} /></div>
      <ol className="space-y-2">
        {o.stages.map((s, i) => {
          const active = i === current;
          return (
            <li key={s.name} className={cn("flex items-center gap-3 rounded-2xl border p-3 transition-all duration-300", s.end ? "border-transparent bg-ok-soft" : active ? "border-ink" : "border-border opacity-60")}>
              <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold", s.end ? "bg-ink text-primary" : active ? "bg-primary" : "bg-secondary")}>{i + 1}</span>
              <div className="flex-1">
                <p className="text-sm font-semibold">{s.name}</p>
                <p className="text-xs text-muted-foreground">{s.start ? `Mulai ${clock(s.start)}` : "Belum mulai"}{s.end ? ` · Selesai ${clock(s.end)}` : ""}</p>
              </div>
              {active && !s.start && <Btn variant="ink" onClick={() => set(i, { start: now() })}>Mulai</Btn>}
              {active && s.start && <Btn onClick={() => set(i, { end: now() })}>Selesai</Btn>}
            </li>
          );
        })}
      </ol>
      {done === o.stages.length && !compact && (
        <Btn size="lg" className="w-full animate-slidein" onClick={() => update(o.id, {}, "QUALITY_CHECK", "Proses selesai, masuk QC")}>Lanjut ke Quality Check</Btn>
      )}
    </div>
  );
}

function QC({ o }: { o: Order }) {
  const { update } = useAdmin();
  const items = ["Order sesuai", "Jumlah tas sesuai", "Bersih, tanpa noda tersisa", "Kering sempurna", "Setrika & lipatan rapi", "Wangi sesuai preferensi", "Kemasan tersegel & berlabel"];
  const [c, setC] = useState<Record<string, boolean>>({});
  const [fail, setFail] = useState("");
  const all = items.every((i) => c[i]);
  return (
    <div className="space-y-3">
      <Title>Quality check</Title>
      {items.map((i) => <CheckRow key={i} label={i} on={!!c[i]} onClick={() => setC((s) => ({ ...s, [i]: !s[i] }))} />)}
      <Btn size="lg" className="w-full" disabled={!all} onClick={() => update(o.id, {}, "READY", "QC Passed — siap diantar")}>QC Passed</Btn>
      <div className="flex gap-2">
        <input value={fail} onChange={(e) => setFail(e.target.value)} placeholder="Alasan gagal (mis. noda masih ada)" className="flex-1 rounded-full border border-input bg-background px-4 text-sm outline-none focus:border-ink" />
        <Btn variant="danger" disabled={!fail} onClick={() => update(o.id, { qcFails: o.qcFails + 1, internalNotes: [...o.internalNotes, `QC gagal: ${fail}`], stages: freshStages().slice(1) }, "REPROCESSING", `QC Failed: ${fail}`)}>QC Failed</Btn>
      </div>
    </div>
  );
}

function Delivered({ o }: { o: Order }) {
  const { update } = useAdmin();
  return (
    <div className="space-y-4">
      <Success title="Terkirim.">{o.delivery?.method} · {clock(o.delivery?.at)}</Success>
      <Btn size="lg" className="w-full" onClick={() => update(o.id, {}, "COMPLETED", "Pesanan selesai")}>Selesaikan Pesanan</Btn>
    </div>
  );
}

export function DemoBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-3">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Simulasi sistem (prototype)</p>
      {children}
    </div>
  );
}
