import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { customerHead } from "@/lib/customer-meta";
import { customerOf } from "@/lib/admin/data";
import { ME } from "@/components/customer/Shell";
import { Eyebrow, Pill, MapView, Btn } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/app/addresses")({
  head: customerHead("Alamat", "Kelola alamat jemput dan antar TitipCuci kamu."),
  component: Addresses,
});

function Addresses() {
  const [list, setList] = useState(customerOf(ME).addresses);
  const [main, setMain] = useState(0);
  const [draft, setDraft] = useState("");
  return (
    <>
      <div className="mb-10"><Eyebrow>Alamat tersimpan</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-7xl">Tempat kami <em>jemput.</em></h1></div>
      <div className="grid gap-6 md:grid-cols-[1fr_1fr]">
        <div className="space-y-3">
          {list.map((a, i) => (
            <button key={a} onClick={() => setMain(i)} className={cn("flex w-full items-start gap-3 rounded-3xl border-2 bg-card p-5 text-left transition-all", main === i ? "border-ink" : "border-transparent")}>
              <MapPin className="mt-0.5 h-5 w-5 shrink-0" /><span className="flex-1 text-sm font-semibold">{a}</span>{main === i && <Pill tone="lime">Utama</Pill>}
            </button>
          ))}
          <div className="flex gap-2"><input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Tambah alamat baru" className="flex-1 rounded-full border border-input bg-card px-5 text-sm outline-none focus:border-ink" /><Btn variant="ink" disabled={!draft} onClick={() => { setList([...list, draft]); setDraft(""); }}><Plus className="h-4 w-4" />Tambah</Btn></div>
        </div>
        <MapView className="aspect-square" label={list[main] ?? ""} />
      </div>
    </>
  );
}
