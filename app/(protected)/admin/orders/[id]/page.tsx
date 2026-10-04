import { randomUUID } from "node:crypto";

import { ArrowLeft, CheckCircle2, Lock, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { OperationPanel } from "@/features/admin-orders/components/operation-panel";
import { getAdminOrder } from "@/features/admin-orders/repository";
import type { AdminOrderCommand } from "@/features/admin-orders/schemas";
import { PricingBreakdown } from "@/features/billing/components/pricing-breakdown";
import { asRecord, textValue } from "@/features/orders/presentation";
import {
  formatIdr,
  formatJakartaDate,
  ORDER_STATUS_LABEL,
} from "@/lib/domain/orders";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Detail Operasional Pesanan" };

const M3_FLOW = [
  "PENDING_CONFIRMATION",
  "CONFIRMED",
  "PICKUP_SCHEDULED",
  "PICKUP_ON_THE_WAY",
  "PICKED_UP",
  "RECEIVED",
  "WEIGHED",
  "WAITING_PAYMENT",
] as const;

function commandKeys(): Record<AdminOrderCommand, string> {
  return {
    CONFIRM: randomUUID(),
    REJECT: randomUUID(),
    SCHEDULE_PICKUP: randomUUID(),
    START_PICKUP: randomUUID(),
    ARRIVE_PICKUP: randomUUID(),
    COMPLETE_PICKUP: randomUUID(),
    RECEIVE: randomUUID(),
    CANCEL: randomUUID(),
  };
}

function billingKeys() {
  return { weight: randomUUID(), invoice: randomUUID() };
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const order = await getAdminOrder(id);
  if (!order) notFound();
  const updated = (await searchParams).updated;
  const address = asRecord(order.addressSnapshot);
  const currentIndex = M3_FLOW.indexOf(
    order.status as (typeof M3_FLOW)[number],
  );

  return (
    <div>
      <Link
        href="/admin/orders"
        className="text-muted-foreground inline-flex min-h-11 items-center gap-2 text-sm font-bold"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Queue pesanan
      </Link>
      {updated && (
        <div className="bg-primary/25 mt-4 flex gap-3 rounded-2xl p-4 text-sm font-bold">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />{" "}
          Tindakan tersimpan. Customer akan membaca status dan timeline terbaru
          dari source of truth yang sama.
        </div>
      )}
      <header className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
            SCR-ADM-003 · v{order.version}
          </p>
          <h1 className="font-display mt-3 text-6xl sm:text-7xl">
            {order.orderNo}
          </h1>
        </div>
        <span className="bg-primary self-start rounded-full px-4 py-2 text-sm font-extrabold">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </header>
      <div className="mt-8 flex gap-1" aria-label="Progres operasional M4">
        {M3_FLOW.map((status, index) => (
          <span
            key={status}
            title={ORDER_STATUS_LABEL[status]}
            className={cn(
              "h-1.5 flex-1 rounded-full",
              index < currentIndex
                ? "bg-ink"
                : index === currentIndex
                  ? "bg-primary"
                  : "bg-border",
            )}
          />
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_22rem]">
        <div className="order-2 space-y-6 lg:order-1">
          <div className="grid gap-6 sm:grid-cols-2">
            <section className="bg-card rounded-3xl border p-6">
              <p className="text-muted-foreground text-xs font-extrabold uppercase">
                Customer
              </p>
              <h2 className="font-display mt-3 text-3xl">
                {order.customerName}
              </h2>
              {order.customerPhone && (
                <a
                  href={`tel:${order.customerPhone}`}
                  className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-bold"
                >
                  <Phone className="size-4" aria-hidden="true" />
                  {order.customerPhone}
                </a>
              )}
            </section>
            <section className="bg-card rounded-3xl border p-6">
              <p className="text-muted-foreground text-xs font-extrabold uppercase">
                Alamat pickup
              </p>
              <p className="mt-3 flex gap-2 text-sm leading-relaxed">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                {textValue(address, "addressText")}
              </p>
              <p className="text-muted-foreground mt-2 text-xs">
                Pin {String(address.latitude ?? "—")},{" "}
                {String(address.longitude ?? "—")}
              </p>
            </section>
          </div>

          <section className="bg-card rounded-3xl border p-6">
            <h2 className="font-display text-3xl">Pesanan dan jadwal</h2>
            <div className="mt-5 divide-y">
              {order.items.map((item) => {
                const service = asRecord(item.serviceSnapshot);
                const finalItem = order.invoice?.items.find(
                  (invoiceItem) => invoiceItem.sourceRef === item.id,
                );
                return (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4 py-4"
                  >
                    <div>
                      <p className="font-bold">{textValue(service, "name")}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {item.actualQty === null
                          ? `Estimasi ${item.estimatedQty}`
                          : `Aktual ${item.actualQty}`}{" "}
                        {textValue(service, "unit").toLowerCase()}
                      </p>
                    </div>
                    <p className="text-sm font-bold">
                      {finalItem
                        ? formatIdr(finalItem.amount)
                        : "Harga final belum tersedia"}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid gap-4 border-t pt-5 sm:grid-cols-2">
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  Slot pickup
                </p>
                <p className="mt-1 font-bold">
                  {order.slot
                    ? `${formatJakartaDate(order.slot.startsAt)} – ${formatJakartaDate(order.slot.endsAt)} WIB`
                    : "Tidak tersedia"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  Estimasi awal
                </p>
                <p className="font-display mt-1 text-3xl">
                  {formatIdr(order.estimateAmount)}
                </p>
              </div>
            </div>
            {order.notes && (
              <div className="bg-secondary mt-5 rounded-2xl p-4 text-sm">
                <p className="text-muted-foreground text-xs font-bold uppercase">
                  Catatan Customer
                </p>
                <p className="mt-2">{order.notes}</p>
              </div>
            )}
          </section>

          {order.invoice && <PricingBreakdown invoice={order.invoice} />}

          <section className="bg-card rounded-3xl border p-6">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl">Verifikasi pickup</h2>
              <Lock
                className="text-muted-foreground size-4"
                aria-hidden="true"
              />
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <Metric
                label="Task"
                value={
                  order.task
                    ? `Ditugaskan · ${ORDER_STATUS_LABEL[order.task.status]}`
                    : "Belum dibuat"
                }
              />
              <Metric
                label="Bag ID"
                value={
                  order.bags.length
                    ? order.bags.map((bag) => bag.bagCode).join(", ")
                    : "Belum dicatat"
                }
              />
              <Metric
                label="Proof"
                value={
                  order.evidence
                    ? `${order.evidence.mimeType} · ${Math.ceil(order.evidence.sizeBytes / 1024)} KB`
                    : "Belum diunggah"
                }
              />
            </div>
            {order.condition && (
              <div className="bg-secondary mt-5 rounded-2xl p-4">
                <p className="text-sm font-bold">
                  Kondisi: {order.condition.code}
                </p>
                {order.condition.description && (
                  <p className="text-muted-foreground mt-1 text-sm">
                    {order.condition.description}
                  </p>
                )}
              </div>
            )}
          </section>

          <section className="bg-card rounded-3xl border p-6">
            <h2 className="font-display text-3xl">Timeline immutable</h2>
            <ol className="mt-6 space-y-5 border-l pl-5">
              {[...order.history].reverse().map((entry, index) => (
                <li key={entry.id} className="relative">
                  <span
                    className={cn(
                      "absolute top-1 -left-[1.55rem] size-2.5 rounded-full",
                      index === 0
                        ? "bg-primary ring-primary/20 ring-4"
                        : "bg-ink",
                    )}
                  />
                  <p className="text-sm font-bold">
                    {ORDER_STATUS_LABEL[entry.toStatus]}
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {formatJakartaDate(entry.occurredAt)} WIB ·{" "}
                    {entry.actorRole}
                  </p>
                  {entry.note && <p className="mt-2 text-sm">{entry.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <aside className="order-1 lg:order-2">
          <div className="lg:sticky lg:top-28">
            <OperationPanel
              order={order}
              idempotencyKeys={commandKeys()}
              billingKeys={billingKeys()}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-secondary rounded-2xl p-4">
      <p className="text-muted-foreground text-xs font-bold uppercase">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold break-words">{value}</p>
    </div>
  );
}
