import type { InvoiceDetail } from "@/features/billing/types";
import { formatIdr } from "@/lib/domain/orders";

export function PricingBreakdown({
  invoice,
  compact = false,
}: {
  invoice: InvoiceDetail;
  compact?: boolean;
}) {
  return (
    <section className={compact ? "" : "bg-card rounded-3xl border p-6"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-muted-foreground text-xs font-extrabold tracking-[0.16em] uppercase">
            Invoice final · {invoice.invoiceNo}
          </p>
          {!compact && (
            <h2 className="font-display mt-2 text-3xl">Rincian harga</h2>
          )}
        </div>
        <span className="bg-primary rounded-full px-3 py-1.5 text-xs font-extrabold">
          Menunggu pembayaran
        </span>
      </div>

      <div className="mt-5 divide-y">
        {invoice.items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between gap-5 py-4 text-sm"
          >
            <div>
              <p className="font-bold">{item.description}</p>
              <p className="text-muted-foreground mt-1 text-xs">
                {item.qty} × {formatIdr(item.unitPrice)} · minimum layanan sudah
                diterapkan server
              </p>
            </div>
            <p className="shrink-0 font-bold">{formatIdr(item.amount)}</p>
          </div>
        ))}
      </div>

      <dl className="mt-5 space-y-2 border-t pt-5 text-sm">
        <PriceRow label="Subtotal" value={invoice.subtotal} />
        <PriceRow label="Diskon" value={-invoice.discount} />
        <PriceRow label="Tambahan" value={invoice.surcharge} />
        <PriceRow label="Pajak" value={invoice.tax} />
        <div className="flex items-end justify-between gap-4 border-t pt-4">
          <dt className="font-bold">Total final</dt>
          <dd className="font-display text-4xl">{formatIdr(invoice.total)}</dd>
        </div>
      </dl>
      <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
        Harga berasal dari berat aktual dan versi harga yang terkunci pada saat
        order dibuat. Pembayaran tersedia mulai M5.
      </p>
    </section>
  );
}

function PriceRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-bold">{formatIdr(value)}</dd>
    </div>
  );
}
