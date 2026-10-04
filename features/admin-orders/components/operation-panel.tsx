"use client";

import {
  CheckCircle2,
  MapPinCheck,
  PackageCheck,
  Play,
  Truck,
  XCircle,
} from "lucide-react";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  adminOrderAction,
  type AdminOrderActionState,
} from "@/features/admin-orders/actions";
import type { AdminOrderCommand } from "@/features/admin-orders/schemas";
import type { AdminOrderDetail } from "@/features/admin-orders/types";
import { WeightInvoicePanel } from "@/features/billing/components/weight-invoice-panel";

const INITIAL_STATE: AdminOrderActionState = { status: "idle" };

export function OperationPanel({
  order,
  idempotencyKeys,
  billingKeys,
}: {
  order: AdminOrderDetail;
  idempotencyKeys: Readonly<Record<AdminOrderCommand, string>>;
  billingKeys: Readonly<{ weight: string; invoice: string }>;
}) {
  if (order.status === "PENDING_CONFIRMATION") {
    return (
      <Panel title="Tinjau pesanan baru">
        <p className="text-muted-foreground text-sm leading-relaxed">
          Konfirmasi akan membuat task pickup dan menetapkan Admin ini sebagai
          petugas.
        </p>
        <CommandForm
          order={order}
          command="CONFIRM"
          idempotencyKey={idempotencyKeys.CONFIRM}
          label="Konfirmasi pesanan"
          icon={<CheckCircle2 className="size-4" />}
        />
        <CommandForm
          order={order}
          command="REJECT"
          idempotencyKey={idempotencyKeys.REJECT}
          label="Tolak pesanan"
          variant="outline"
          reason
        />
      </Panel>
    );
  }

  if (order.status === "CONFIRMED") {
    return (
      <Panel title="Jadwalkan pickup">
        <p className="text-muted-foreground text-sm">
          Jadwal memakai slot yang sudah dicadangkan Customer.
        </p>
        <CommandForm
          order={order}
          command="SCHEDULE_PICKUP"
          idempotencyKey={idempotencyKeys.SCHEDULE_PICKUP}
          label="Konfirmasi jadwal pickup"
          icon={<Truck className="size-4" />}
        />
        <CommandForm
          order={order}
          command="CANCEL"
          idempotencyKey={idempotencyKeys.CANCEL}
          label="Batalkan pesanan"
          variant="outline"
          reason
        />
      </Panel>
    );
  }

  if (order.status === "PICKUP_SCHEDULED") {
    return (
      <Panel title="Mulai pickup">
        <p className="text-muted-foreground text-sm">
          Hanya Admin yang ditetapkan pada task ini yang dapat memulai
          perjalanan.
        </p>
        <CommandForm
          order={order}
          command="START_PICKUP"
          idempotencyKey={idempotencyKeys.START_PICKUP}
          label="Mulai perjalanan pickup"
          icon={<Play className="size-4" />}
        />
        <CommandForm
          order={order}
          command="CANCEL"
          idempotencyKey={idempotencyKeys.CANCEL}
          label="Batalkan pesanan"
          variant="outline"
          reason
        />
      </Panel>
    );
  }

  if (order.status === "PICKUP_ON_THE_WAY") {
    if (!order.task?.arrivedAt) {
      return (
        <Panel title="Konfirmasi tiba">
          <p className="text-muted-foreground text-sm">
            Catat waktu tiba sebelum memverifikasi tas, kondisi, dan bukti
            pickup.
          </p>
          <CommandForm
            order={order}
            command="ARRIVE_PICKUP"
            idempotencyKey={idempotencyKeys.ARRIVE_PICKUP}
            label="Saya sudah tiba"
            icon={<MapPinCheck className="size-4" />}
          />
        </Panel>
      );
    }
    return (
      <Panel title="Verifikasi pickup">
        <CommandForm
          order={order}
          command="COMPLETE_PICKUP"
          idempotencyKey={idempotencyKeys.COMPLETE_PICKUP}
          label="Selesaikan pickup"
          icon={<PackageCheck className="size-4" />}
          completePickup
        />
      </Panel>
    );
  }

  if (order.status === "PICKED_UP") {
    return (
      <Panel title="Terima di outlet">
        <p className="text-muted-foreground text-sm">
          Cocokkan jumlah tas fisik dengan {order.bags.length} bag ID dari
          pickup.
        </p>
        <CommandForm
          order={order}
          command="RECEIVE"
          idempotencyKey={idempotencyKeys.RECEIVE}
          label="Konfirmasi laundry diterima"
          receivedBagCount={order.bags.length}
        />
      </Panel>
    );
  }

  if (
    order.status === "RECEIVED" ||
    order.status === "WEIGHED" ||
    order.status === "WAITING_PAYMENT"
  ) {
    return (
      <WeightInvoicePanel
        order={order}
        weightKey={billingKeys.weight}
        invoiceKey={billingKeys.invoice}
      />
    );
  }

  return (
    <Panel title="Pesanan ditutup">
      <div className="bg-secondary flex gap-3 rounded-2xl p-4 text-sm">
        <XCircle className="size-5 shrink-0" />
        <p>Tidak ada tindakan operasional M4 berikutnya untuk pesanan ini.</p>
      </div>
    </Panel>
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
        Langkah berikutnya
      </p>
      <h2 className="font-display mt-2 text-3xl">{title}</h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function CommandForm({
  order,
  command,
  idempotencyKey,
  label,
  variant = "default",
  icon,
  reason = false,
  completePickup = false,
  receivedBagCount,
}: {
  order: AdminOrderDetail;
  command: AdminOrderCommand;
  idempotencyKey: string;
  label: string;
  variant?: "default" | "outline";
  icon?: React.ReactNode;
  reason?: boolean;
  completePickup?: boolean;
  receivedBagCount?: number;
}) {
  const [state, action, pending] = useActionState(
    adminOrderAction,
    INITIAL_STATE,
  );
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={order.id} />
      <input type="hidden" name="expectedVersion" value={order.version} />
      <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      <input type="hidden" name="command" value={command} />
      {reason && (
        <label className="block text-sm font-bold">
          Alasan wajib
          <textarea
            name="reason"
            required
            minLength={5}
            maxLength={500}
            rows={3}
            className="border-input bg-background focus:border-ring focus:ring-ring/25 mt-2 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-4"
            placeholder="Catat alasan operasional yang jelas."
          />
        </label>
      )}
      {completePickup && (
        <div className="space-y-4 rounded-2xl border p-4">
          <label className="block text-sm font-bold">
            Bag ID
            <textarea
              name="bagCodes"
              required
              rows={3}
              className="border-input bg-background focus:border-ring focus:ring-ring/25 mt-2 w-full rounded-2xl border p-3 font-mono text-sm outline-none focus:ring-4"
              placeholder="TC-001-A&#10;TC-001-B"
            />
            <span className="text-muted-foreground mt-1 block text-xs font-normal">
              Satu ID per baris, maksimum 20.
            </span>
          </label>
          <label className="block text-sm font-bold">
            Kondisi
            <Input
              name="conditionCode"
              required
              minLength={2}
              maxLength={50}
              className="mt-2"
              placeholder="NORMAL"
            />
          </label>
          <label className="block text-sm font-bold">
            Catatan kondisi
            <textarea
              name="conditionDescription"
              maxLength={1000}
              rows={3}
              className="border-input bg-background focus:border-ring focus:ring-ring/25 mt-2 w-full rounded-2xl border p-3 text-sm outline-none focus:ring-4"
              placeholder="Kondisi awal yang relevan."
            />
          </label>
          <label className="block text-sm font-bold">
            Foto proof of pickup
            <Input
              name="proof"
              type="file"
              required
              accept="image/jpeg,image/png,image/webp"
              className="file:bg-primary mt-2 file:mr-3 file:rounded-full file:border-0 file:px-3 file:py-2 file:font-bold"
            />
            <span className="text-muted-foreground mt-1 block text-xs font-normal">
              JPG, PNG, atau WebP; maksimum 10 MB. Disimpan privat.
            </span>
          </label>
        </div>
      )}
      {receivedBagCount !== undefined && (
        <label className="block text-sm font-bold">
          Jumlah tas diterima
          <Input
            name="receivedBagCount"
            type="number"
            min={1}
            max={20}
            required
            defaultValue={receivedBagCount}
            className="mt-2"
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
        variant={variant}
        className="w-full"
        disabled={pending}
      >
        {icon}
        {pending ? "Memproses…" : label}
      </Button>
    </form>
  );
}
