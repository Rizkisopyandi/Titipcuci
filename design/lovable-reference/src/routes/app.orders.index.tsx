import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useAdmin } from "@/lib/admin/store";
import { customerHead } from "@/lib/customer-meta";
import { serviceOf } from "@/lib/admin/data";
import { ME, CUSTOMER_LABEL, Progress } from "@/components/customer/Shell";
import { Eyebrow } from "@/components/admin/kit";

export const Route = createFileRoute("/app/orders/")({
  head: customerHead("Pesanan", "Semua pesanan laundry aktif kamu di TitipCuci."),
  component: Orders,
});

function Orders() {
  const { orders } = useAdmin();
  const list = orders.filter((o) => o.customerId === ME && o.status !== "COMPLETED");
  return (
    <>
      <div className="mb-10"><Eyebrow>Pesanan aktif</Eyebrow><h1 className="mt-4 font-display text-5xl md:text-7xl">Lagi <em>dalam proses.</em></h1></div>
      <div className="grid gap-4 md:grid-cols-2">
        {list.map((o) => (
          <Link key={o.id} to="/app/orders/$id" params={{ id: o.id }} className="group rounded-3xl bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-float">
            <p className="text-xs font-semibold text-muted-foreground">#{o.id} · {serviceOf(o.serviceId).name}</p>
            <p className="mt-3 font-display text-3xl leading-tight">{CUSTOMER_LABEL[o.status]}</p>
            <div className="mt-6"><Progress status={o.status} /></div>
            <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold">Lihat detail <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
          </Link>
        ))}
      </div>
      {!list.length && <p className="text-muted-foreground">Belum ada pesanan aktif. <Link to="/app/new" className="font-semibold underline">Buat pesanan</Link></p>}
    </>
  );
}
