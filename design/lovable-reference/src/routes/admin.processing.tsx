import { createFileRoute, Link } from "@tanstack/react-router";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { customerOf, serviceOf } from "@/lib/admin/data";
import { PageHead, StatusPill } from "@/components/admin/kit";
import { Stages } from "@/components/admin/Workflow";

export const Route = createFileRoute("/admin/processing")({
  head: adminHead("Processing", "Papan kerja proses laundry: sorting, washing, drying, ironing, folding, packaging."),
  component: Processing,
});

function Processing() {
  const { orders } = useAdmin();
  const lanes = [
    { title: "Siap ditimbang & diperiksa", list: orders.filter((o) => ["PICKED_UP", "RECEIVED", "WEIGHING", "INVOICE_DRAFT"].includes(o.status)) },
    { title: "Sedang diproses", list: orders.filter((o) => ["PROCESSING", "REPROCESSING"].includes(o.status)), stages: true },
    { title: "Quality check", list: orders.filter((o) => o.status === "QUALITY_CHECK") },
  ];
  return (
    <>
      <PageHead eyebrow="Outlet Kemang" title={<>Di <em>laundry.</em></>} />
      <div className="space-y-10">
        {lanes.map((l) => (
          <section key={l.title}>
            <h2 className="mb-4 flex items-center gap-3 text-sm font-bold">{l.title}<span className="rounded-full bg-secondary px-2 py-0.5 text-xs">{l.list.length}</span></h2>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {l.list.map((o) => (
                <div key={o.id} className="rounded-3xl border border-border bg-card p-5">
                  <div className="mb-4 flex items-start justify-between gap-2">
                    <div><p className="text-xs font-semibold text-muted-foreground">{o.id} · {serviceOf(o.serviceId).name}</p><p className="font-bold">{customerOf(o.customerId).name}</p></div>
                    <StatusPill status={o.status} />
                  </div>
                  {l.stages && o.stages.some((s) => s.start) && <Stages o={o} compact />}
                  <Link to="/admin/orders/$id" params={{ id: o.id }} className="mt-4 block rounded-full border border-border py-2.5 text-center text-sm font-semibold hover:bg-secondary">Buka pesanan</Link>
                </div>
              ))}
              {!l.list.length && <p className="text-sm text-muted-foreground">Kosong.</p>}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
