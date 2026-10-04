import { ArrowUpRight, Clock3 } from "lucide-react";
import Link from "next/link";

import type { OrderSummary } from "@/features/orders/types";
import {
  formatIdr,
  formatJakartaDate,
  ORDER_STATUS_LABEL,
} from "@/lib/domain/orders";

export function OrderCard({ order }: { order: OrderSummary }) {
  return (
    <Link
      href={`/app/orders/${order.id}`}
      className="bg-card group hover:border-border hover:shadow-float block rounded-3xl border border-transparent p-6 transition-[border-color,transform,box-shadow] hover:-translate-y-1"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-extrabold tracking-[0.16em] uppercase">
            {order.orderNo}
          </p>
          <h2 className="font-display mt-2 text-3xl">
            {ORDER_STATUS_LABEL[order.status]}
          </h2>
        </div>
        <span className="bg-primary grid size-10 place-items-center rounded-full transition-transform group-hover:rotate-12">
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </span>
      </div>
      <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t pt-5">
        <span className="text-muted-foreground flex items-center gap-2 text-sm">
          <Clock3 className="size-4" aria-hidden="true" />
          {formatJakartaDate(order.createdAt)} WIB
        </span>
        <span className="text-right">
          <span className="text-muted-foreground block text-xs font-bold">
            Estimasi sementara
          </span>
          <span className="font-display text-2xl">
            {formatIdr(order.estimateAmount)}
          </span>
        </span>
      </div>
    </Link>
  );
}
