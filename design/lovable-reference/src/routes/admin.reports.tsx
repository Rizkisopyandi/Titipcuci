import { createFileRoute } from "@tanstack/react-router";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { rp } from "@/lib/admin/data";
import { PageHead, Panel } from "@/components/admin/kit";

export const Route = createFileRoute("/admin/reports")({
  head: adminHead("Reports", "Laporan ringkas operasional TitipCuci hari ini."),
  component: Reports,
});

const week = [18, 24, 21, 30, 27, 34, 12];
const days = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

function Reports() {
  const { orders } = useAdmin();
  const kg = orders.reduce((s, o) => s + (o.actualWeight ?? 0), 0);
  const revenue = orders.filter((o) => o.payment.status === "PAID").reduce((s, o) => s + (o.invoice?.total ?? 0), 0);
  const max = Math.max(...week);
  return (
    <>
      <PageHead eyebrow="Minggu ini" title={<>Lapo<em>ran.</em></>} />
      <div className="grid gap-4 sm:grid-cols-3">
        {[["Pesanan aktif", orders.filter((o) => o.status !== "COMPLETED").length], ["Kg ditimbang", `${kg.toFixed(1)} kg`], ["Pendapatan terverifikasi", rp(revenue)]].map(([k, v]) => (
          <Panel key={k as string}><p className="text-xs text-muted-foreground">{k}</p><p className="mt-2 font-display text-4xl">{v}</p></Panel>
        ))}
      </div>
      <Panel title="Pesanan per hari" className="mt-6">
        <div className="flex h-48 items-end gap-3">
          {week.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full origin-bottom rounded-t-xl bg-ink transition-all duration-700 last:bg-primary" style={{ height: `${(n / max) * 100}%` }} />
              <span className="text-xs text-muted-foreground">{days[i]}</span>
            </div>
          ))}
        </div>
      </Panel>
    </>
  );
}
