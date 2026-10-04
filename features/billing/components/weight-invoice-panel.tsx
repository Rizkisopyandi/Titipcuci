"use client";

import { Calculator, Scale } from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AdminOrderDetail } from "@/features/admin-orders/types";
import {
  billingAction,
  type BillingActionState,
} from "@/features/billing/actions";
import { asRecord, textValue } from "@/features/orders/presentation";

const INITIAL_STATE: BillingActionState = { status: "idle" };

export function WeightInvoicePanel({
  order,
  weightKey,
  invoiceKey,
}: {
  order: AdminOrderDetail;
  weightKey: string;
  invoiceKey: string;
}) {
  if (order.status === "RECEIVED") {
    return (
      <Panel title="Catat berat aktual">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Isi hasil timbangan untuk setiap layanan. Harga final tetap dihitung
          server dari price-version yang terkunci.
        </p>
        <WeightForm order={order} idempotencyKey={weightKey} />
      </Panel>
    );
  }

  if (order.status === "WEIGHED") {
    return (
      <Panel title="Terbitkan invoice final">
        <ActualSummary order={order} />
        <InvoiceForm order={order} idempotencyKey={invoiceKey} />
        <div className="border-t pt-4">
          <p className="text-muted-foreground mb-3 text-xs font-bold uppercase">
            Koreksi sebelum invoice
          </p>
          <WeightForm order={order} idempotencyKey={weightKey} correction />
        </div>
      </Panel>
    );
  }

  return (
    <Panel title="Invoice telah diterbitkan">
      <div className="bg-primary/20 rounded-2xl p-4 text-sm leading-relaxed">
        Harga final tersimpan sebagai snapshot immutable. Pembayaran Midtrans
        belum tersedia sampai M5.
      </div>
    </Panel>
  );
}

function WeightForm({
  order,
  idempotencyKey,
  correction = false,
}: {
  order: AdminOrderDetail;
  idempotencyKey: string;
  correction?: boolean;
}) {
  const [state, action, pending] = useActionState(billingAction, INITIAL_STATE);
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="command" value="RECORD_WEIGHT" />
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="expectedVersion" value={order.version} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <div className="space-y-3">
        {order.items.map((item) => {
          const service = asRecord(item.serviceSnapshot);
          const unit = textValue(service, "unit");
          return (
            <label key={item.id} className="block text-sm font-bold">
              {textValue(service, "name")} · {unit}
              <input type="hidden" name="orderItemId" value={item.id} />
              <Input
                name="actualQty"
                type="number"
                inputMode="decimal"
                min="0.01"
                step="0.01"
                required
                defaultValue={item.actualQty ?? undefined}
                className="mt-2"
                aria-label={`Berat atau jumlah aktual ${textValue(service, "name")} dalam ${unit}`}
              />
            </label>
          );
        })}
      </div>
      {correction && (
        <label className="block text-sm font-bold">
          Alasan koreksi
          <textarea
            name="reason"
            required
            minLength={5}
            maxLength={500}
            rows={3}
            className="border-input bg-background focus:border-ring focus:ring-ring/25 mt-2 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-4"
          />
        </label>
      )}
      {state.status === "error" && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm font-bold"
        >
          {state.message}
        </p>
      )}
      <Button
        type="submit"
        variant={correction ? "outline" : "default"}
        className="w-full"
        disabled={pending}
      >
        <Scale className="size-4" aria-hidden="true" />
        {pending
          ? "Menyimpan…"
          : correction
            ? "Simpan koreksi berat"
            : "Simpan berat aktual"}
      </Button>
    </form>
  );
}

function InvoiceForm({
  order,
  idempotencyKey,
}: {
  order: AdminOrderDetail;
  idempotencyKey: string;
}) {
  const [state, action, pending] = useActionState(billingAction, INITIAL_STATE);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="command" value="ISSUE_INVOICE" />
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="expectedVersion" value={order.version} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      {state.status === "error" && (
        <p
          role="alert"
          className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm font-bold"
        >
          {state.message}
        </p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        <Calculator className="size-4" aria-hidden="true" />
        {pending ? "Menghitung…" : "Hitung dan terbitkan invoice"}
      </Button>
    </form>
  );
}

function ActualSummary({ order }: { order: AdminOrderDetail }) {
  return (
    <div className="bg-secondary rounded-2xl p-4 text-sm">
      {order.items.map((item) => {
        const service = asRecord(item.serviceSnapshot);
        return (
          <div key={item.id} className="flex justify-between gap-4 py-1">
            <span>{textValue(service, "name")}</span>
            <strong>
              {item.actualQty} {textValue(service, "unit").toLowerCase()}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-card shadow-float rounded-3xl border p-6">
      <p className="text-muted-foreground text-xs font-extrabold tracking-[0.18em] uppercase">
        Langkah M4
      </p>
      <h2 className="font-display mt-2 text-3xl">{title}</h2>
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}
