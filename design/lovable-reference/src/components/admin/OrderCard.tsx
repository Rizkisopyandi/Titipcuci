import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MapPin } from "lucide-react";
import { customerOf, serviceOf, type Order } from "@/lib/admin/data";
import { StatusPill, Pill } from "./kit";

export function OrderLine({ o, time }: { o: Order; time?: string | undefined }) {
  const c = customerOf(o.customerId);
  return (
    <Link to="/admin/orders/$id" params={{ id: o.id }} className="group flex items-center gap-4 rounded-2xl px-3 py-3 transition-colors hover:bg-secondary">
      <span className="w-16 shrink-0 font-display text-2xl leading-none tabular-nums">{time ?? o.slot.split(" ")[0]}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{c.name} <span className="font-normal text-muted-foreground">· {o.id}</span></p>
        <p className="truncate text-xs text-muted-foreground">{o.address}</p>
      </div>
      <StatusPill status={o.status} />
      <ArrowUpRight className="hidden h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100 sm:block" />
    </Link>
  );
}

export function OrderTile({ o, action }: { o: Order; action?: React.ReactNode }) {
  const c = customerOf(o.customerId);
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 transition-all duration-300 hover:shadow-float">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground">{o.id}</p>
          <p className="mt-1 text-lg font-bold tracking-tight">{c.name}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <StatusPill status={o.status} />
          {o.urgent && <Pill tone="danger">Urgent</Pill>}
        </div>
      </div>
      <div className="space-y-1.5 text-sm text-muted-foreground">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{o.address}</span></p>
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 shrink-0" /> {o.pickupDate} · {o.slot} · {o.distanceKm} km</p>
      </div>
      <p className="text-xs font-semibold">{serviceOf(o.serviceId).name}</p>
      {action}
    </div>
  );
}
