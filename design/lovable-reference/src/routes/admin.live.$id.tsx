import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Phone, MapPin, Plus, Minus, FileText } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { customerOf, serviceOf, clock, type Order } from "@/lib/admin/data";
import { MapView, Btn, Row, PhotoSlot, CheckRow, Chip, Success, Pill, Eyebrow } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/live/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Live ${params.id} — TitipCuci Admin` },
      { name: "description", content: "Navigasi live pickup dan pengantaran TitipCuci." },
      { property: "og:title", content: `Live ${params.id} — TitipCuci Admin` },
      { property: "og:description", content: "Navigasi live pickup dan pengantaran TitipCuci." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Live,
});

function Live() {
  const { id } = Route.useParams();
  const { get } = useAdmin();
  const o = get(id);
  const [done, setDone] = useState<Order | null>(null);
  if (done) return <Proof o={done} />;
  if (!o) return <p className="py-20 text-center">Pesanan tidak ditemukan.</p>;
  const pickup = o.status === "PICKUP_ON_THE_WAY";
  const delivery = o.status === "DELIVERY_ON_THE_WAY";
  if (!pickup && !delivery)
    return (
      <div className="py-20 text-center">
        <p className="font-display text-4xl">Tracking tidak aktif.</p>
        <p className="mt-2 text-sm text-muted-foreground">Lokasi live hanya ada selama pickup atau pengantaran berlangsung.</p>
        <Link to="/admin/orders/$id" params={{ id }} className="mt-6 inline-block rounded-full bg-primary px-5 py-2.5 text-sm font-semibold">Lihat Detail</Link>
      </div>
    );
  return o.arrived ? (pickup ? <Bags o={o} onDone={setDone} /> : <DeliverConfirm o={o} onDone={setDone} />) : <Navigate o={o} />;
}

function Navigate({ o }: { o: Order }) {
  const { update } = useAdmin();
  const c = customerOf(o.customerId);
  const [p, setP] = useState(0.15);
  const [arrivedPrompt, setArrivedPrompt] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setP((x) => Math.min(0.95, x + 0.05)), 1500);
    return () => clearInterval(t);
  }, []);
  const eta = Math.max(1, Math.round((1 - p) * 14));
  const pickup = o.status === "PICKUP_ON_THE_WAY";

  return (
    <div className="-mx-5 -mt-6 md:mx-0 md:mt-0">
      <div className="relative">
        <MapView live progress={p} className="h-[58vh] min-h-[380px] rounded-none md:rounded-3xl" />
        <Link to="/admin/orders/$id" params={{ id: o.id }} className="absolute left-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-card shadow-float" aria-label="Kembali"><ArrowLeft className="h-5 w-5" /></Link>
        <div className="absolute right-4 top-4"><Pill tone="ink" live>{pickup ? "Menuju pickup" : "Dalam pengantaran"}</Pill></div>
      </div>
      <div className="relative z-10 -mt-8 rounded-t-3xl bg-card p-5 shadow-float md:mx-auto md:max-w-xl md:rounded-3xl md:p-6">
        {!arrivedPrompt ? (
          <>
            <div className="flex items-end justify-between">
              <div><p className="text-xs text-muted-foreground">Estimasi tiba</p><p className="font-display text-6xl leading-none tabular-nums">{eta}<span className="text-2xl"> mnt</span></p></div>
              <div className="text-right text-xs text-muted-foreground"><p>{o.id}</p><p className="font-semibold text-foreground">{serviceOf(o.serviceId).name}</p></div>
            </div>
            <div className="mt-4 flex items-start gap-3 border-t border-border pt-4">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="text-sm"><p className="font-semibold">{c.name}</p><p className="text-muted-foreground">{o.address}</p>{o.customerNote && <p className="mt-1 text-xs">“{o.customerNote}”</p>}</div>
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_auto] gap-2">
              <Btn size="lg" onClick={() => setArrivedPrompt(true)}>Saya Tiba</Btn>
              <a href={`tel:${c.phone}`} className="grid h-14 w-14 place-items-center rounded-full bg-ink text-bone" aria-label="Hubungi Customer"><Phone className="h-5 w-5" /></a>
              <Link to="/admin/orders/$id" params={{ id: o.id }} className="grid h-14 w-14 place-items-center rounded-full border border-border" aria-label="Lihat Detail"><FileText className="h-5 w-5" /></Link>
            </div>
          </>
        ) : (
          <div className="animate-slidein text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-primary animate-pop"><MapPin className="h-6 w-6" /></span>
            <p className="mt-4 font-display text-3xl">Anda sudah tiba di lokasi customer</p>
            <p className="mt-1 text-sm text-muted-foreground">{o.address}</p>
            <div className="mt-5 grid gap-2">
              <Btn size="lg" onClick={() => update(o.id, { arrived: true }, undefined, pickup ? "Admin tiba di lokasi pickup" : "Admin tiba di lokasi antar")}>{pickup ? "Konfirmasi tiba & mulai verifikasi tas" : "Konfirmasi tiba"}</Btn>
              <Btn variant="ghost" onClick={() => setArrivedPrompt(false)}>Belum, lanjut navigasi</Btn>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Bags({ o, onDone }: { o: Order; onDone: (o: Order) => void }) {
  const { update } = useAdmin();
  const [n, setN] = useState(1);
  const [photos, setPhotos] = useState<Record<number, boolean>>({});
  const [handover, setHandover] = useState(false);
  const ids = Array.from({ length: n }, (_, i) => `${o.id}-${String.fromCharCode(65 + i)}`);
  const confirm = () => {
    const at = new Date().toISOString();
    const patch = { bags: ids.map((id, i) => ({ id, photo: !!photos[i] })), pickupProof: { at, photo: Object.values(photos).some(Boolean) }, arrived: false };
    update(o.id, patch, "PICKED_UP", `Pickup selesai · ${n} tas · tracking dihentikan`);
    onDone({ ...o, ...patch, status: "PICKED_UP" });
  };
  return (
    <div className="mx-auto max-w-xl space-y-5 animate-slidein">
      <div><Eyebrow>{o.id} · Verifikasi</Eyebrow><h1 className="mt-3 font-display text-5xl leading-none">Verifikasi tas.</h1></div>
      <div className="flex items-center justify-between rounded-3xl bg-ink p-5 text-bone">
        <span className="text-sm text-bone/70">Jumlah tas</span>
        <div className="flex items-center gap-4">
          <button className="grid h-11 w-11 place-items-center rounded-full border border-bone/30" onClick={() => setN(Math.max(1, n - 1))} aria-label="Kurangi"><Minus className="h-4 w-4" /></button>
          <span className="w-10 text-center font-display text-6xl leading-none tabular-nums text-primary">{n}</span>
          <button className="grid h-11 w-11 place-items-center rounded-full bg-primary text-primary-foreground" onClick={() => setN(Math.min(9, n + 1))} aria-label="Tambah"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div className="space-y-3">
        {ids.map((id, i) => (
          <div key={id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 animate-slidein">
            <PhotoSlot taken={!!photos[i]} onClick={() => setPhotos((p) => ({ ...p, [i]: true }))} label="Foto tas" />
            <div><p className="text-xs text-muted-foreground">Tas {i + 1}</p><p className="text-lg font-bold tracking-tight">{id}</p><p className="text-xs text-muted-foreground">Tempel label & scan</p></div>
          </div>
        ))}
      </div>
      <CheckRow on={handover} onClick={() => setHandover(!handover)} label="Customer sudah menyerahkan semua tas" sub={customerOf(o.customerId).name} />
      <Btn size="lg" className="w-full" disabled={!handover} onClick={confirm}>Konfirmasi Pengambilan</Btn>
    </div>
  );
}

const METHODS = ["Diserahkan ke customer", "Ditinggal di depan pintu", "Resepsionis / Lobby", "Lokasi lain yang diizinkan"];
function DeliverConfirm({ o, onDone }: { o: Order; onDone: (o: Order) => void }) {
  const { update } = useAdmin();
  const [m, setM] = useState("");
  const [photo, setPhoto] = useState(false);
  const [note, setNote] = useState("");
  const confirm = () => {
    const delivery = { method: m, note, at: new Date().toISOString(), photo };
    update(o.id, { delivery, arrived: false }, "DELIVERED", `Terkirim · ${m} · tracking dihentikan`);
    onDone({ ...o, delivery, status: "DELIVERED" });
  };
  return (
    <div className="mx-auto max-w-xl space-y-5 animate-slidein">
      <div><Eyebrow>{o.id} · Pengantaran</Eyebrow><h1 className="mt-3 font-display text-5xl leading-none">Serahkan laundry.</h1></div>
      <div className="flex flex-wrap gap-2">{METHODS.map((x) => <Chip key={x} on={m === x} onClick={() => setM(x)}>{x}</Chip>)}</div>
      <div className="flex items-center gap-4"><PhotoSlot taken={photo} onClick={() => setPhoto(true)} label="Foto bukti" /><p className="text-sm text-muted-foreground">{m && m !== METHODS[0] ? "Foto wajib untuk pengantaran tanpa tatap muka." : "Foto opsional."}</p></div>
      <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Catatan pengantaran (terlihat customer)" className="w-full rounded-2xl border border-input bg-background p-3 text-sm outline-none focus:border-ink" />
      <Row k="Waktu" v={clock(new Date().toISOString())} />
      <Btn size="lg" className="w-full" disabled={!m || (m !== METHODS[0] && !photo)} onClick={confirm}>Konfirmasi Pengantaran</Btn>
    </div>
  );
}

function Proof({ o }: { o: Order }) {
  const c = customerOf(o.customerId);
  const isPickup = o.status === "PICKED_UP";
  return (
    <div className="mx-auto max-w-xl">
      <Success title={isPickup ? "Pickup tercatat." : "Pengantaran tercatat."}>Live tracking dihentikan.</Success>
      <div className="mt-4 rounded-3xl border border-border bg-card p-6">
        <Eyebrow className="mb-3">{isPickup ? "Bukti pickup" : "Bukti pengantaran"}</Eyebrow>
        <div className="divide-y divide-border">
          <Row k="Order" v={o.id} />
          <Row k="Customer" v={c.name} />
          <Row k="Lokasi" v={o.address} />
          {isPickup ? <><Row k="Jumlah tas" v={o.bags.length} /><Row k="Bag ID" v={o.bags.map((b) => b.id).join(", ")} /><Row k="Waktu" v={clock(o.pickupProof?.at)} /><Row k="Foto" v={o.pickupProof?.photo ? "Tersimpan" : "—"} /></>
            : <><Row k="Metode" v={o.delivery?.method} /><Row k="Waktu" v={clock(o.delivery?.at)} /><Row k="Foto" v={o.delivery?.photo ? "Tersimpan" : "—"} /></>}
        </div>
      </div>
      <Link to="/admin/orders/$id" params={{ id: o.id }} className="mt-5 block rounded-full bg-primary px-7 py-4 text-center font-semibold">{isPickup ? "Lanjut: terima di laundry" : "Lihat pesanan"}</Link>
    </div>
  );
}
