import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Crosshair, MapPin, Search, Info } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { customerHead } from "@/lib/customer-meta";
import { SERVICES, rp, customerOf, freshStages, type Order } from "@/lib/admin/data";
import { ME } from "@/components/customer/Shell";
import { Btn, Chip, Eyebrow, Row } from "@/components/admin/kit";
import { cn } from "@/lib/utils";
import washing from "@/assets/washing.jpg";
import folding from "@/assets/folding.jpg";
import dryclean from "@/assets/dryclean.jpg";
import bedding from "@/assets/bedding.jpg";

export const Route = createFileRoute("/app/new")({
  head: customerHead("Buat Pesanan", "Pilih layanan, lokasi jemput, jadwal, dan preferensi laundry kamu."),
  component: NewOrder,
});

const CHOICES = [
  { id: "ck", img: washing, desc: "Dicuci bersih, dikeringkan, dan dilipat rapi. Cocok untuk pakaian harian." },
  { id: "cks", img: folding, desc: "Paket lengkap: cuci, kering, setrika uap, lalu dilipat siap pakai." },
  { id: "dry", img: dryclean, desc: "Untuk jas, gaun, dan bahan halus yang tidak boleh dicuci air." },
  { id: "bed", img: bedding, desc: "Bed cover, sprei, selimut, dan gorden — dicuci dengan mesin besar." },
];
const STEPS = ["Layanan", "Lokasi", "Jadwal", "Preferensi", "Review"];
const PLACES = ["Jl. Kemang Raya No. 18, Kemang", "Jl. Bangka XI No. 3, Mampang", "Jl. Kemang Timur No. 41, Bangka", "Jl. Benda Raya No. 9, Cilandak Timur"];
const SLOTS = [["08.00 – 10.00", true], ["10.00 – 12.00", true], ["12.00 – 14.00", false], ["14.00 – 16.00", true], ["16.00 – 18.00", false], ["18.00 – 20.00", true]] as const;

function days() {
  return Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i);
    return { key: i, label: i === 0 ? "Hari ini" : i === 1 ? "Besok" : d.toLocaleDateString("id-ID", { weekday: "short" }), num: d.getDate(), full: i === 0 ? "Hari ini" : d.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short" }), closed: i === 4 };
  });
}

function NewOrder() {
  const { orders, create } = useAdmin();
  const nav = useNavigate();
  const me = customerOf(ME);
  const [step, setStep] = useState(0);
  const [service, setService] = useState("");
  const [address, setAddress] = useState(me.addresses[0]!);
  const [addrNote, setAddrNote] = useState("");
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState("");
  const [det, setDet] = useState("Standar");
  const [soft, setSoft] = useState(true);
  const [frag, setFrag] = useState("Lembut");
  const [special, setSpecial] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const D = days();
  const s = SERVICES.find((x) => x.id === service);
  const canNext = [!!service, !!address, !!slot, true, true][step];

  const submit = () => {
    const id = "TC-00" + (132 + orders.filter((o) => o.id > "TC-00131").length);
    const at = new Date().toISOString();
    const prefs = [`Deterjen ${det}`, soft ? "Pelembut" : "Tanpa pelembut", `Wangi ${frag}`, ...special];
    const o: Order = {
      id, customerId: ME, serviceId: service, address, area: "Jakarta Selatan", distanceKm: 2.1, pickupDate: D[day]!.full, slot, createdAt: at, status: "NEW",
      preferences: prefs, bags: [], payment: { status: "UNPAID" }, stages: freshStages(), qcFails: 0, internalNotes: [], timeline: [{ status: "NEW", at }],
      ...(note || addrNote ? { customerNote: [addrNote, note].filter(Boolean).join(" · ") } : {}),
    };
    create(o);
    nav({ to: "/app/orders/$id", params: { id } });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 flex items-center justify-between">
        {step > 0 ? <button onClick={() => setStep(step - 1)} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Kembali</button> : <Link to="/app" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>}
        <span className="text-xs font-semibold text-muted-foreground">{step + 1} / {STEPS.length}</span>
      </div>
      <div className="mb-10 flex gap-1">{STEPS.map((x, i) => <div key={x} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-500", i < step ? "bg-ink" : i === step ? "bg-primary" : "bg-border")} />)}</div>

      <div key={step} className="animate-slidein">
        {step === 0 && (
          <>
            <Head e="Langkah 1 · Layanan" t={<>Mau dicuci <em>seperti apa?</em></>} />
            <div className="grid gap-4 sm:grid-cols-2">
              {CHOICES.map((c) => {
                const sv = SERVICES.find((x) => x.id === c.id)!;
                const on = service === c.id;
                return (
                  <button key={c.id} onClick={() => setService(c.id)} className={cn("group overflow-hidden rounded-3xl border-2 bg-card text-left transition-all duration-300", on ? "border-ink shadow-float" : "border-transparent hover:-translate-y-1")}>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <img src={c.img} alt={sv.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className={cn("absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full transition-all", on ? "bg-primary" : "bg-card/80")}>{on && <Check className="h-4 w-4 animate-pop" strokeWidth={3} />}</span>
                    </div>
                    <div className="p-5">
                      <p className="text-lg font-bold tracking-tight">{sv.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
                      <div className="mt-4 flex items-end justify-between"><span className="font-display text-3xl">{rp(sv.price)}<span className="text-base text-muted-foreground"> / {sv.pricing.replace("per ", "")}</span></span><span className="text-xs font-semibold text-muted-foreground">± {sv.duration}</span></div>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 1 && (
          <>
            <Head e="Langkah 2 · Lokasi jemput" t={<>Kami jemput <em>di mana?</em></>} />
            <PinMap onMove={(i) => setAddress(PLACES[i]!)} />
            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-full border border-input bg-card px-5 py-3"><Search className="h-4 w-4 text-muted-foreground" /><input list="places" value={address} onChange={(e) => setAddress(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" placeholder="Cari alamat" /><datalist id="places">{PLACES.map((p) => <option key={p} value={p} />)}</datalist></div>
              <button onClick={() => setAddress(me.addresses[0]!)} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold"><Crosshair className="h-4 w-4" /> Gunakan Lokasi Saya</button>
              <div className="rounded-2xl bg-card p-4"><p className="flex items-start gap-2 text-sm font-semibold"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{address}</p><p className="ml-6 text-xs text-muted-foreground">Jakarta Selatan, DKI Jakarta 12730</p></div>
              <input value={addrNote} onChange={(e) => setAddrNote(e.target.value)} placeholder="Catatan alamat (mis. pagar hitam, titip satpam)" className="w-full rounded-full border border-input bg-card px-5 py-3 text-sm outline-none focus:border-ink" />
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Head e="Langkah 3 · Jadwal" t={<>Kapan kami <em>datang?</em></>} />
            <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:px-0">
              {D.map((d) => (
                <button key={d.key} disabled={d.closed} onClick={() => { setDay(d.key); setSlot(""); }} className={cn("flex w-20 shrink-0 flex-col items-center rounded-2xl border py-3 transition-all", day === d.key ? "border-ink bg-ink text-bone" : "border-border bg-card", d.closed && "opacity-40")}>
                  <span className="text-xs">{d.label}</span><span className="font-display text-3xl">{d.num}</span>{d.closed && <span className="text-[10px]">Libur</span>}
                </button>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {SLOTS.map(([t, open], i) => {
                const avail = open && !(day === 0 && i === 0);
                return (
                  <button key={t} disabled={!avail} onClick={() => setSlot(t)} className={cn("rounded-2xl border p-4 text-left transition-all", slot === t ? "border-ink bg-primary" : "border-border bg-card hover:border-foreground/40", !avail && "cursor-not-allowed bg-secondary opacity-50")}>
                    <p className="font-display text-2xl">{t}</p><p className="text-xs font-semibold">{avail ? (slot === t ? "Dipilih" : "Tersedia") : "Penuh"}</p>
                  </button>
                );
              })}
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <Head e="Langkah 4 · Preferensi" t={<>Sesuai <em>selera kamu.</em></>} />
            <div className="space-y-6 rounded-3xl bg-card p-6">
              <Group label="Deterjen">{["Standar", "Hypoallergenic", "Ramah lingkungan"].map((x) => <Chip key={x} on={det === x} onClick={() => setDet(x)}>{x}</Chip>)}</Group>
              <div className="flex items-center justify-between"><div><p className="text-sm font-semibold">Pelembut pakaian</p><p className="text-xs text-muted-foreground">Bikin bahan lebih lembut</p></div>
                <button role="switch" aria-checked={soft} onClick={() => setSoft(!soft)} className={cn("relative h-8 w-14 rounded-full transition-colors", soft ? "bg-primary" : "bg-secondary")}><span className={cn("absolute top-1 h-6 w-6 rounded-full bg-ink transition-all duration-300", soft ? "left-7" : "left-1")} /></button>
              </div>
              <Group label="Wangi">{["Tanpa wangi", "Lembut", "Segar", "Floral"].map((x) => <Chip key={x} on={frag === x} onClick={() => setFrag(x)}>{x}</Chip>)}</Group>
              <Group label="Penanganan khusus">{["Pisahkan warna putih", "Bahan halus", "Jangan diperas", "Setrika uap", "Gantung, jangan dilipat"].map((x) => <Chip key={x} on={special.includes(x)} onClick={() => setSpecial((s) => (s.includes(x) ? s.filter((y) => y !== x) : [...s, x]))}>{x}</Chip>)}</Group>
              <div><p className="mb-2 text-sm font-semibold">Catatan khusus</p><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Mis. ada 1 kemeja putih, mohon dipisah." className="w-full rounded-2xl border border-input bg-background p-4 text-sm outline-none focus:border-ink" /></div>
            </div>
          </>
        )}

        {step === 4 && s && (
          <>
            <Head e="Langkah 5 · Review" t={<>Sudah <em>pas?</em></>} />
            <div className="rounded-3xl bg-card p-6">
              <div className="divide-y divide-border">
                <Row k="Layanan" v={`${s.name} · ${rp(s.price)} / ${s.pricing.replace("per ", "")}`} />
                <Row k="Alamat jemput" v={address} />
                {addrNote && <Row k="Catatan alamat" v={addrNote} />}
                <Row k="Jadwal" v={`${D[day]!.full} · ${slot}`} />
                <Row k="Preferensi" v={[`Deterjen ${det}`, soft ? "Pelembut" : "Tanpa pelembut", `Wangi ${frag}`, ...special].join(", ")} />
                <Row k="Catatan" v={note || "—"} />
                <Row k="Pickup & Delivery" v={rp(5000)} />
              </div>
            </div>
            <div className="mt-4 flex gap-3 rounded-3xl bg-ink p-5 text-bone">
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div><p className="font-semibold">Berat aktual akan dicatat oleh petugas setelah laundry diterima.</p><p className="mt-1 text-sm text-bone/60">Harga final muncul setelah ditimbang. Kamu baru bayar setelah invoice final terbit.</p></div>
            </div>
          </>
        )}
      </div>

      <div className="sticky bottom-24 mt-8 md:bottom-6">
        {step < 4 ? (
          <Btn size="lg" className="w-full shadow-float" disabled={!canNext} onClick={() => setStep(step + 1)}>{["Lanjut Pilih Lokasi", "Konfirmasi Lokasi", "Lanjut Preferensi", "Review Pesanan"][step]} <ArrowRight className="h-4 w-4" /></Btn>
        ) : (
          <Btn size="lg" className="w-full shadow-float" onClick={submit}>Konfirmasi Pesanan</Btn>
        )}
      </div>
    </div>
  );
}

const Head = ({ e, t }: { e: string; t: React.ReactNode }) => (
  <div className="mb-8"><Eyebrow>{e}</Eyebrow><h1 className="mt-4 font-display text-5xl leading-[0.95] md:text-6xl">{t}</h1></div>
);
const Group = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><p className="mb-3 text-sm font-semibold">{label}</p><div className="flex flex-wrap gap-2">{children}</div></div>
);

function PinMap({ onMove }: { onMove: (quadrant: number) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 55, y: 45 });
  const [drag, setDrag] = useState(false);
  const move = (e: React.PointerEvent) => {
    if (!drag || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    setPos({ x: Math.min(95, Math.max(5, ((e.clientX - r.left) / r.width) * 100)), y: Math.min(92, Math.max(12, ((e.clientY - r.top) / r.height) * 100)) });
  };
  const end = () => { if (!drag) return; setDrag(false); onMove((pos.x > 50 ? 1 : 0) + (pos.y > 50 ? 2 : 0)); };
  return (
    <div ref={ref} onPointerMove={move} onPointerUp={end} onPointerLeave={end} className="relative h-[52vh] min-h-[360px] touch-none overflow-hidden rounded-3xl bg-map shadow-float">
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g stroke="var(--map-road)" strokeWidth="14" fill="none" strokeLinecap="round"><path d="M-10 80 L520 120" /><path d="M-10 260 L520 230" /><path d="M120 -10 L160 420" /><path d="M360 -10 L330 420" /><path d="M-10 360 L240 300 L520 340" /></g>
        <g stroke="var(--map-road)" strokeWidth="5" fill="none" opacity=".8"><path d="M40 -10 L60 420" /><path d="M250 -10 L240 420" /><path d="M440 -10 L460 420" /><path d="M-10 180 L520 170" /></g>
        <rect x="180" y="130" width="40" height="30" rx="4" fill="var(--sage)" opacity=".18" /><rect x="390" y="270" width="60" height="40" rx="4" fill="var(--sage)" opacity=".18" />
      </svg>
      <button aria-label="Geser pin lokasi" onPointerDown={(e) => { e.preventDefault(); setDrag(true); }} className="absolute -translate-x-1/2 -translate-y-full cursor-grab touch-none active:cursor-grabbing" style={{ left: `${pos.x}%`, top: `${pos.y}%` }}>
        <span className={cn("block rounded-full bg-primary p-3 shadow-float transition-transform duration-200", drag && "-translate-y-2 scale-110")}><MapPin className="h-6 w-6" /></span>
        <span className="mx-auto mt-1 block h-1.5 w-4 rounded-full bg-ink/30" />
      </button>
      <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-card/90 px-4 py-1.5 text-xs font-semibold backdrop-blur">Geser pin ke titik jemput</span>
    </div>
  );
}
