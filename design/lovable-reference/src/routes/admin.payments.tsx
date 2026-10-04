import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { customerOf, rp, clock } from "@/lib/admin/data";
import { PageHead, PayPill } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/payments")({
  head: adminHead("Payments", "Pantau status pembayaran invoice TitipCuci yang terverifikasi gateway."),
  component: Payments,
});

function Payments() {
  const { orders } = useAdmin();
  const list = orders.filter((o) => o.invoice?.issued);
  const paid = list.filter((o) => o.payment.status === "PAID").reduce((s, o) => s + o.invoice!.total, 0);
  const pending = list.filter((o) => o.payment.status === "PENDING").reduce((s, o) => s + o.invoice!.total, 0);
  return (
    <>
      <PageHead eyebrow="Monitoring" title={<>Pem<em>bayaran.</em></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl bg-ink p-6 text-bone"><p className="text-xs text-bone/60">Terverifikasi hari ini</p><p className="mt-2 font-display text-5xl text-primary">{rp(paid)}</p></div>
        <div className="rounded-3xl border border-border bg-card p-6"><p className="text-xs text-muted-foreground">Menunggu pembayaran</p><p className="mt-2 font-display text-5xl">{rp(pending)}</p></div>
      </div>
      <p className="mb-4 flex items-center gap-2 text-xs text-muted-foreground"><Lock className="h-3.5 w-3.5" /> Status diperbarui otomatis oleh webhook payment gateway. Tidak bisa diubah manual.</p>
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        {list.map((o) => (
          <Link key={o.id} to="/admin/orders/$id" params={{ id: o.id }} className="grid grid-cols-2 items-center gap-2 border-b border-border px-5 py-4 last:border-0 hover:bg-secondary md:grid-cols-[110px_1fr_1fr_1fr_90px_110px] md:px-6">
            <span className="text-sm font-bold">{o.id}</span>
            <span className="justify-self-end md:hidden"><PayPill s={o.payment.status} /></span>
            <span className="text-sm">{customerOf(o.customerId).name}</span>
            <span className="text-sm text-muted-foreground">{o.payment.method ?? "—"} · {o.payment.ref ?? "—"}</span>
            <span className="text-sm font-semibold">{rp(o.invoice!.total)}</span>
            <span className="text-xs text-muted-foreground">{clock(o.payment.at)}</span>
            <span className="hidden justify-self-end md:block"><PayPill s={o.payment.status} /></span>
          </Link>
        ))}
      </div>
    </>
  );
}
