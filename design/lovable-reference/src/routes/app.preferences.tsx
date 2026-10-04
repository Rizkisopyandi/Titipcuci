import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { customerHead } from "@/lib/customer-meta";
import { Eyebrow, Chip, Btn } from "@/components/admin/kit";

export const Route = createFileRoute("/app/preferences")({
  head: customerHead("Preferensi", "Atur preferensi deterjen, pewangi, dan penanganan khusus default kamu."),
  component: Prefs,
});

const GROUPS: [string, string[], boolean][] = [
  ["Deterjen", ["Standar", "Hypoallergenic", "Ramah lingkungan"], false],
  ["Pelembut", ["Pakai pelembut", "Tanpa pelembut"], false],
  ["Wangi", ["Tanpa wangi", "Lembut", "Segar", "Floral"], false],
  ["Penanganan khusus", ["Pisahkan warna putih", "Bahan halus", "Setrika uap", "Gantung, jangan dilipat"], true],
];

function Prefs() {
  const [sel, setSel] = useState<Record<string, string[]>>({ Deterjen: ["Standar"], Pelembut: ["Pakai pelembut"], Wangi: ["Lembut"], "Penanganan khusus": [] });
  const [saved, setSaved] = useState(false);
  return (
    <>
      <div className="mb-10"><Eyebrow>Preferensi default</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-7xl">Cara kamu <em>suka.</em></h1></div>
      <div className="max-w-2xl space-y-8 rounded-3xl bg-card p-6 md:p-8">
        {GROUPS.map(([g, opts, multi]) => (
          <div key={g}><p className="mb-3 text-sm font-semibold">{g}</p><div className="flex flex-wrap gap-2">{opts.map((x) => <Chip key={x} on={sel[g]!.includes(x)} onClick={() => { setSaved(false); setSel((s) => ({ ...s, [g]: multi ? (s[g]!.includes(x) ? s[g]!.filter((y) => y !== x) : [...s[g]!, x]) : [x] })); }}>{x}</Chip>)}</div></div>
        ))}
        <Btn onClick={() => setSaved(true)}>{saved ? "Tersimpan ✓" : "Simpan Preferensi"}</Btn>
      </div>
    </>
  );
}
