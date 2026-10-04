import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy, Check, QrCode, Landmark } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { rp, freshStages } from "@/lib/admin/data";
import { ME } from "@/components/customer/Shell";
import { Btn, Eyebrow, Row, Success } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/pay/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Bayar #${params.id} — TitipCuci` },
      { name: "description", content: "Bayar invoice final laundry dengan QRIS atau Virtual Account." },
      { property: "og:title", content: `Bayar #${params.id} — TitipCuci` },
      { property: "og:description", content: "Bayar invoice final laundry dengan QRIS atau Virtual Account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Pay,
});

const METHODS = [
  { id: "QRIS", label: "QRIS", sub: "Semua e-wallet & m-banking", icon: QrCode },
  { id: "BCA", label: "BCA Virtual Account", sub: "Kode bank 014", icon: Landmark },
  { id: "BNI", label: "BNI Virtual Account", sub: "Kode bank 009", icon: Landmark },
  { id: "BRI", label: "BRI Virtual Account", sub: "Kode bank 002", icon: Landmark },
];

function Pay() {
  const { id } = Route.useParams();
  const { get, update } = useAdmin();
  const o = get(id);
  const [m, setM] = useState("QRIS");
  const [copied, setCopied] = useState(false);
  const [left, setLeft] = useState(23 * 3600 + 59 * 60);
  const [paid, setPaid] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  useEffect(() => { const t = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000); return () => clearInterval(t); }, []);
  if (!o || o.customerId !== ME) return <p className="py-20 text-center">Pesanan tidak ditemukan.</p>;
  if (!o.invoice?.issued) return <p className="py-20 text-center text-muted-foreground">Invoice final belum terbit. Pembayaran tersedia setelah laundry ditimbang.</p>;

  if (paid || o.payment.status === "PAID")
    return (
      <div className="mx-auto max-w-md">
        <Success title="Pembayaran berhasil">Laundry kamu akan segera diproses.</Success>
        <div className="mt-4 rounded-3xl bg-card p-6">
          <div className="divide-y divide-border"><Row k="Jumlah" v={<span className="font-display text-3xl">{rp(o.invoice.total)}</span>} /><Row k="Pesanan" v={`#${o.id}`} /><Row k="Metode" v={paid ?? o.payment.method} /></div>
        </div>
        <Link to="/app/orders/$id" params={{ id: o.id }} className="mt-5 block rounded-full bg-primary px-7 py-4 text-center font-semibold">Lihat Status Laundry</Link>
      </div>
    );

  const va = { BCA: "014", BNI: "009", BRI: "002" }[m as "BCA"] + " 8821 " + o.id.replace(/\D/g, "").padStart(6, "0");
  const hh = String(Math.floor(left / 3600)).padStart(2, "0"), mm = String(Math.floor((left % 3600) / 60)).padStart(2, "0"), ss = String(left % 60).padStart(2, "0");
  const method = METHODS.find((x) => x.id === m)!;

  const confirm = () => {
    setChecking(true);
    // Prototype: stands in for the payment gateway confirming payment via webhook.
    setTimeout(() => {
      update(o.id, { payment: { status: "PAID", method: method.label, ref: (m === "QRIS" ? "QR-" : "VA-") + Date.now().toString().slice(-8), at: new Date().toISOString() }, stages: freshStages() }, "PROCESSING", "Pembayaran terverifikasi (webhook)");
      setPaid(method.label);
    }, 1400);
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link to="/app/orders/$id" params={{ id: o.id }} className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground"><ArrowLeft className="h-4 w-4" /> Pesanan #{o.id}</Link>
      <div className="mb-8"><Eyebrow>Pembayaran · #{o.id}</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-6xl">{rp(o.invoice.total)}</h1><p className="mt-2 text-sm text-muted-foreground">Bayar sebelum <span className="font-semibold tabular-nums text-foreground">{hh}:{mm}:{ss}</span></p></div>
      <div className="grid gap-6 md:grid-cols-[1fr_1.1fr]">
        <div className="space-y-2">
          {METHODS.map((x) => (
            <button key={x.id} onClick={() => setM(x.id)} className={cn("flex w-full items-center gap-4 rounded-2xl border-2 bg-card p-4 text-left transition-all", m === x.id ? "border-ink" : "border-transparent hover:bg-secondary")}>
              <span className={cn("grid h-10 w-10 place-items-center rounded-full", m === x.id ? "bg-primary" : "bg-secondary")}><x.icon className="h-5 w-5" /></span>
              <span className="flex-1"><span className="block text-sm font-semibold">{x.label}</span><span className="text-xs text-muted-foreground">{x.sub}</span></span>
              {m === x.id && <Check className="h-5 w-5 animate-pop" />}
            </button>
          ))}
        </div>
        <div key={m} className="animate-slidein rounded-3xl bg-ink p-6 text-bone md:p-8">
          {m === "QRIS" ? (
            <>
              <p className="text-sm text-bone/60">Scan dengan aplikasi e-wallet atau m-banking</p>
              <div className="mx-auto mt-6 grid aspect-square w-full max-w-[240px] grid-cols-[repeat(21,1fr)] gap-px rounded-2xl bg-bone p-4" aria-label="Kode QR pembayaran">
                {Array.from({ length: 441 }, (_, i) => { const r = Math.floor(i / 21), c = i % 21; const finder = (r < 7 && (c < 7 || c > 13)) || (r > 13 && c < 7); const on = finder ? (r % 6 === 0 || c % 6 === 0 || (r % 7 > 1 && r % 7 < 5 && c % 7 > 1 && c % 7 < 5) || c === 20 || r === 20) : ((r * 7 + c * 13 + r * c) % 3 === 0); return <span key={i} className={on ? "bg-ink" : ""} />; })}
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-bone/60">Nomor {method.label}</p>
              <p className="mt-3 font-display text-4xl tabular-nums text-primary">{va}</p>
              <button onClick={() => { navigator.clipboard?.writeText(va.replace(/\s/g, "")); setCopied(true); setTimeout(() => setCopied(false), 1500); }} className="mt-4 inline-flex items-center gap-2 rounded-full border border-bone/30 px-4 py-2 text-sm font-semibold">{copied ? <><Check className="h-4 w-4" />Tersalin</> : <><Copy className="h-4 w-4" />Salin nomor</>}</button>
              <ol className="mt-6 list-decimal space-y-1 pl-5 text-sm text-bone/70"><li>Buka m-banking / ATM {m}</li><li>Pilih Transfer → Virtual Account</li><li>Masukkan nomor di atas, cek nominal {rp(o.invoice.total)}</li></ol>
            </>
          )}
          <div className="mt-6 border-t border-bone/15 pt-4 text-sm"><div className="flex justify-between"><span className="text-bone/60">Total</span><span className="font-semibold">{rp(o.invoice.total)}</span></div></div>
          <Btn size="lg" className="mt-6 w-full" disabled={checking} onClick={confirm}>{checking ? "Memverifikasi pembayaran…" : "Saya sudah bayar"}</Btn>
          <p className="mt-3 text-center text-[11px] text-bone/50">Status otomatis diperbarui setelah pembayaran terverifikasi.</p>
        </div>
      </div>
    </div>
  );
}
