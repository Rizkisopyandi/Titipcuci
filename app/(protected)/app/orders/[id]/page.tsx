import { ArrowLeft, CheckCircle2, Info, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PricingBreakdown } from "@/features/billing/components/pricing-breakdown";
import { getOwnOrder } from "@/features/orders/repository";
import {
  asRecord,
  numberValue,
  textValue,
} from "@/features/orders/presentation";
import { requireArea } from "@/lib/auth/session";
import {
  formatIdr,
  formatJakartaDate,
  ORDER_STATUS_LABEL,
} from "@/lib/domain/orders";

export const metadata: Metadata = { title: "Detail Pesanan" };

export default async function OrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const principal = await requireArea("customer");
  const { id } = await params;
  const order = await getOwnOrder(principal, id);
  if (!order) notFound();
  const created = (await searchParams).created === "1";
  const address = asRecord(order.addressSnapshot);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/app/orders"
        className="text-muted-foreground inline-flex min-h-11 items-center gap-2 text-sm font-bold"
      >
        <ArrowLeft className="size-4" aria-hidden="true" /> Semua pesanan
      </Link>
      {created && (
        <div className="bg-primary/25 mt-5 flex gap-3 rounded-2xl p-4 text-sm font-bold">
          <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />{" "}
          Pesanan berhasil dibuat dan menunggu konfirmasi Admin.
        </div>
      )}
      <header className="mt-8 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
            {order.orderNo}
          </p>
          <h1 className="font-display mt-3 text-6xl">
            {ORDER_STATUS_LABEL[order.status]}
          </h1>
        </div>
        <span className="bg-primary self-start rounded-full px-4 py-2 text-sm font-extrabold">
          {ORDER_STATUS_LABEL[order.status]}
        </span>
      </header>

      <div className="mt-10 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="bg-card rounded-3xl p-6 sm:p-8">
          <h2 className="font-display text-3xl">Ringkasan laundry</h2>
          <div className="mt-6 divide-y">
            {order.items.map((item) => {
              const service = asRecord(item.serviceSnapshot);
              const finalItem = order.invoice?.items.find(
                (invoiceItem) => invoiceItem.sourceRef === item.id,
              );
              return (
                <div key={item.id} className="flex justify-between gap-5 py-4">
                  <div>
                    <p className="font-bold">{textValue(service, "name")}</p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {item.actualQty === null ? "Perkiraan" : "Aktual"}{" "}
                      {item.actualQty ?? item.estimatedQty}{" "}
                      {textValue(service, "unit").toLowerCase()}
                      {item.actualQty === null && " · bukan berat aktual"}
                    </p>
                  </div>
                  <p className="font-bold">
                    {formatIdr(
                      finalItem?.amount ??
                        Math.max(
                          numberValue(service, "minimumCharge") ?? 0,
                          (numberValue(service, "unitPrice") ?? 0) *
                            item.estimatedQty,
                        ),
                    )}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-6 flex items-end justify-between border-t pt-6">
            <div>
              <p className="text-muted-foreground text-xs font-bold uppercase">
                {order.invoice ? "Total final" : "Estimasi sementara"}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {order.invoice
                  ? "Snapshot harga terkunci"
                  : "Harga final belum tersedia"}
              </p>
            </div>
            <p className="font-display text-4xl">
              {formatIdr(order.invoice?.total ?? order.estimateAmount)}
            </p>
          </div>
        </section>

        <div className="space-y-5">
          <section className="bg-ink text-bone rounded-3xl p-6">
            <h2 className="font-display text-3xl">Pickup</h2>
            <p className="text-bone/60 mt-5 flex gap-2 text-sm">
              <MapPin
                className="text-primary mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />{" "}
              {textValue(address, "addressText")}
            </p>
            <p className="text-bone/60 mt-3 text-sm">
              Pin: {numberValue(address, "latitude") ?? "—"},{" "}
              {numberValue(address, "longitude") ?? "—"}
            </p>
            <p className="mt-5 font-bold">
              {order.slot
                ? `${formatJakartaDate(order.slot.startsAt)} – ${formatJakartaDate(order.slot.endsAt)} WIB`
                : "Jadwal tidak tersedia"}
            </p>
          </section>
          <section className="bg-card rounded-3xl p-6">
            <h2 className="font-display text-3xl">Timeline</h2>
            <ol className="mt-5 space-y-4">
              {order.history.map((event) => (
                <li key={event.id} className="flex gap-3">
                  <span className="bg-primary mt-1 size-3 shrink-0 rounded-full" />
                  <div>
                    <p className="text-sm font-bold">
                      {ORDER_STATUS_LABEL[event.toStatus]}
                    </p>
                    <p className="text-muted-foreground mt-1 text-xs">
                      {formatJakartaDate(event.occurredAt)} WIB
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
          {order.pickupVerification && (
            <section className="bg-card rounded-3xl p-6">
              <h2 className="font-display text-3xl">Verifikasi pickup</h2>
              <dl className="mt-5 space-y-3 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Bag ID</dt>
                  <dd className="text-right font-bold">
                    {order.pickupVerification.bagCodes.join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Kondisi</dt>
                  <dd className="text-right font-bold">
                    {order.pickupVerification.conditionCode ?? "—"}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-muted-foreground">Bukti</dt>
                  <dd className="text-right font-bold">
                    {order.pickupVerification.proofMimeType
                      ? "Tersimpan privat"
                      : "—"}
                  </dd>
                </div>
              </dl>
              {order.pickupVerification.conditionDescription && (
                <p className="bg-secondary mt-4 rounded-2xl p-4 text-sm">
                  {order.pickupVerification.conditionDescription}
                </p>
              )}
            </section>
          )}
        </div>
      </div>

      {order.invoice && (
        <div className="mt-5">
          <PricingBreakdown invoice={order.invoice} />
        </div>
      )}

      <div className="bg-secondary mt-5 flex gap-3 rounded-2xl p-5 text-sm">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
        <p>
          {order.invoice
            ? "Invoice sudah final dan menunggu pembayaran. Metode pembayaran tersedia mulai M5."
            : order.items.some((item) => item.actualQty !== null)
              ? "Berat aktual sudah tercatat. Invoice final sedang menunggu penerbitan oleh Admin."
              : "Admin akan menimbang laundry setelah diterima. Detail ini hanya menampilkan estimasi awal, bukan invoice atau harga final."}
        </p>
      </div>
    </div>
  );
}
