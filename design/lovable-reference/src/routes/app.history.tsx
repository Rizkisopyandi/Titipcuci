import { createFileRoute } from "@tanstack/react-router";
import { customerHead } from "@/lib/customer-meta";
import { rp } from "@/lib/admin/data";
import { Eyebrow, Pill } from "@/components/admin/kit";

export const Route = createFileRoute("/app/history")({
  head: customerHead("Riwayat", "Riwayat pesanan laundry TitipCuci kamu, lengkap dengan berat dan total."),
  component: History,
});

const PAST = [
  { id: "TC-00098", date: "28 Sep", service: "Cuci + Setrika", kg: 5.2, total: 57000 },
  { id: "TC-00081", date: "21 Sep", service: "Cuci Kering", kg: 6.4, total: 56200 },
  { id: "TC-00066", date: "14 Sep", service: "Household & Bedding", kg: 0, total: 75000 },
  { id: "TC-00049", date: "7 Sep", service: "Cuci + Setrika", kg: 4.1, total: 46000 },
];

function History() {
  return (
    <>
      <div className="mb-10"><Eyebrow>Riwayat</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-7xl">Yang sudah <em>kembali.</em></h1></div>
      <div className="overflow-hidden rounded-3xl bg-card">
        {PAST.map((p) => (
          <div key={p.id} className="flex items-center gap-4 border-b border-border px-6 py-5 last:border-0">
            <span className="w-16 font-display text-2xl">{p.date}</span>
            <div className="flex-1"><p className="text-sm font-semibold">{p.service}</p><p className="text-xs text-muted-foreground">#{p.id}{p.kg ? ` · ${p.kg} kg` : " · 1 set"}</p></div>
            <span className="text-sm font-semibold">{rp(p.total)}</span>
            <Pill className="hidden sm:inline-flex">Selesai</Pill>
          </div>
        ))}
      </div>
    </>
  );
}
