import { createFileRoute } from "@tanstack/react-router";
import { adminHead } from "@/lib/admin/meta";
import { SERVICES, rp, DELIVERY_FEE } from "@/lib/admin/data";
import { PageHead, Pill } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/services")({
  head: adminHead("Services & Pricing", "Daftar layanan dan harga operasional TitipCuci."),
  component: Services,
});

function Services() {
  return (
    <>
      <PageHead eyebrow={`Ongkir pickup & delivery ${rp(DELIVERY_FEE)}`} title={<>Layanan & <em>harga.</em></>} />
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {SERVICES.map((s) => (
          <div key={s.id} className="grid grid-cols-2 items-center gap-2 border-b border-border px-5 py-5 last:border-0 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto] md:px-6">
            <span className="font-semibold">{s.name}</span>
            <span className="justify-self-end md:justify-self-start text-sm text-muted-foreground">{s.pricing}</span>
            <span className="font-display text-2xl">{rp(s.price)}</span>
            <span className="text-sm text-muted-foreground">{s.duration}</span>
            <span className="col-span-2 md:col-span-1">{s.active ? <Pill tone="lime">Aktif</Pill> : <Pill>Nonaktif</Pill>}</span>
          </div>
        ))}
      </div>
    </>
  );
}
