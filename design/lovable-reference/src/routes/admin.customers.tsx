import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { MapPin } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { CUSTOMERS } from "@/lib/admin/data";
import { PageHead, Panel, StatusPill, Pill } from "@/components/admin/kit";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/customers")({
  validateSearch: z.object({ id: z.string().optional() }),
  head: adminHead("Customers", "Profil customer TitipCuci: riwayat pesanan, alamat, preferensi, dan komplain."),
  component: Customers,
});

function Customers() {
  const { orders, complaints } = useAdmin();
  const { id = CUSTOMERS[0]!.id } = Route.useSearch();
  const c = CUSTOMERS.find((x) => x.id === id) ?? CUSTOMERS[0]!;
  const os = orders.filter((o) => o.customerId === c.id);
  const cs = complaints.filter((x) => x.customerId === c.id);
  return (
    <>
      <PageHead eyebrow="Pelanggan" title={<>Cus<em>tomer.</em></>} />
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div className="flex gap-2 overflow-x-auto lg:flex-col">
          {CUSTOMERS.map((x) => (
            <Link key={x.id} to="/admin/customers" search={{ id: x.id }} className={cn("shrink-0 rounded-2xl border px-4 py-3 text-sm transition-all", x.id === c.id ? "border-ink bg-ink text-bone" : "border-border bg-card hover:bg-secondary")}>
              <p className="font-semibold">{x.name}</p><p className="text-xs opacity-60">sejak {x.since}</p>
            </Link>
          ))}
        </div>
        <div key={c.id} className="space-y-6 animate-slidein">
          <Panel>
            <p className="font-display text-5xl">{c.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.phone} · pelanggan sejak {c.since}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div><p className="mb-2 text-xs font-semibold">Alamat</p>{c.addresses.map((a) => <p key={a} className="flex items-start gap-2 py-1 text-sm"><MapPin className="mt-0.5 h-4 w-4 shrink-0" />{a}</p>)}</div>
              <div><p className="mb-2 text-xs font-semibold">Preferensi</p><div className="flex flex-wrap gap-2">{c.preferences.length ? c.preferences.map((p) => <Pill key={p}>{p}</Pill>) : <span className="text-sm text-muted-foreground">—</span>}</div></div>
            </div>
          </Panel>
          <Panel title={`Riwayat pesanan (${os.length})`}>
            {os.map((o) => (
              <Link key={o.id} to="/admin/orders/$id" params={{ id: o.id }} className="flex items-center justify-between rounded-2xl px-3 py-3 hover:bg-secondary">
                <span className="text-sm font-semibold">{o.id} <span className="font-normal text-muted-foreground">· {o.pickupDate}</span></span><StatusPill status={o.status} />
              </Link>
            ))}
          </Panel>
          <Panel title={`Riwayat komplain (${cs.length})`}>
            {cs.length ? cs.map((x) => <div key={x.id} className="flex justify-between py-2 text-sm"><span>{x.id} · {x.type}</span><Pill>{x.status}</Pill></div>) : <p className="text-sm text-muted-foreground">Tidak ada komplain.</p>}
          </Panel>
        </div>
      </div>
    </>
  );
}
