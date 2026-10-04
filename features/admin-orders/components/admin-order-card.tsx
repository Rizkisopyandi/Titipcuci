import { ArrowUpRight, MapPin } from "lucide-react";
import Link from "next/link";

import type { AdminOrderSummary } from "@/features/admin-orders/types";
import { asRecord, textValue } from "@/features/orders/presentation";
import {
  formatIdr,
  formatJakartaDate,
  ORDER_STATUS_LABEL,
} from "@/lib/domain/orders";

export function AdminOrderCard({ order }: { order: AdminOrderSummary }) {
  const address = asRecord(order.addressSnapshot);
  return (
    <Link
      href={`/admin/orders/${order.id}`}
      className="bg-card group hover:shadow-float grid gap-5 rounded-3xl border p-5 transition-[transform,box-shadow] hover:-translate-y-1 sm:grid-cols-[1fr_auto] sm:p-6"
    >
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-primary rounded-full px-3 py-1 text-xs font-extrabold">
            {ORDER_STATUS_LABEL[order.status]}
          </span>
          <span className="text-muted-foreground text-xs font-bold">
            v{order.version}
          </span>
        </div>
        <h2 className="font-display mt-4 text-3xl">{order.orderNo}</h2>
        <p className="mt-2 font-bold">{order.customerName}</p>
        <p className="text-muted-foreground mt-3 flex gap-2 text-sm">
          <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {textValue(address, "addressText")}
        </p>
      </div>
      <div className="flex items-end justify-between gap-5 sm:flex-col sm:items-end">
        <span className="bg-ink text-bone grid size-10 place-items-center rounded-full transition-transform group-hover:rotate-12">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
        <div className="text-right">
          <p className="text-muted-foreground text-xs">
            {formatJakartaDate(order.createdAt)} WIB
          </p>
          <p className="font-display mt-1 text-2xl">
            {formatIdr(order.estimateAmount)}
          </p>
          <p className="text-muted-foreground text-[11px]">
            estimasi sementara
          </p>
        </div>
      </div>
    </Link>
  );
}
