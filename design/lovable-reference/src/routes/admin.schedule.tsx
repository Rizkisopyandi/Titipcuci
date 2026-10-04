import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useAdmin } from "@/lib/admin/store";
import { adminHead } from "@/lib/admin/meta";
import { PageHead, MapView } from "@/components/admin/kit";
import { OrderTile } from "@/components/admin/OrderCard";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/schedule")({
  head: adminHead("Pickup & Delivery", "Jadwal pickup dan pengantaran admin TitipCuci hari ini."),
  component: Schedule,
});

function Schedule() {
  const { orders } = useAdmin();
  const [tab, setTab] = useState<"pickup" | "delivery">("pickup");
  const list = orders
    .filter((o) => (tab === "pickup" ? ["PICKUP_SCHEDULED", "PICKUP_ON_THE_WAY"] : ["READY", "DELIVERY_ON_THE_WAY"]).includes(o.status))
    .sort((a, b) => (tab === "pickup" ? a.slot : a.deliverySlot ?? "").localeCompare(tab === "pickup" ? b.slot : b.deliverySlot ?? ""));

  return (
    <>
      <PageHead eyebrow="Rute hari ini" title={<>Pickup & <em>delivery.</em></>}>
        <div className="flex rounded-full bg-secondary p-1">
          {(["pickup", "delivery"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn("rounded-full px-5 py-2 text-sm font-semibold transition-all", tab === t && "bg-ink text-bone")}>{t === "pickup" ? "Pickup" : "Delivery"}</button>
          ))}
        </div>
      </PageHead>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 md:grid-cols-2">
          {list.map((o) => {
            const live = o.status.endsWith("ON_THE_WAY");
            return (
              <OrderTile key={o.id} o={o} action={
                <div className="flex gap-2">
                  <Link to={live ? "/admin/live/$id" : "/admin/orders/$id"} params={{ id: o.id }} className={cn("flex-1 rounded-full px-4 py-2.5 text-center text-sm font-semibold", live ? "bg-ink text-bone" : "bg-primary")}>
                    {live ? "Buka navigasi" : tab === "pickup" ? "Mulai Pickup" : "Mulai Pengantaran"}
                  </Link>
                  <MapView className="h-10 w-16 rounded-full" />
                </div>
              } />
            );
          })}
          {!list.length && <p className="text-sm text-muted-foreground">Tidak ada jadwal.</p>}
        </div>
        <MapView className="hidden aspect-[3/4] lg:block" label={`${list.length} titik · Jakarta Selatan`} />
      </div>
    </>
  );
}
