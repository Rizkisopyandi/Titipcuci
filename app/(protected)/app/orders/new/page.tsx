import type { Metadata } from "next";

import { OrderWizard } from "@/features/orders/components/order-wizard";
import { getOrderFormData } from "@/features/orders/repository";
import { getPublicEnvironment } from "@/lib/config/public-env";

export const metadata: Metadata = { title: "Buat Pesanan" };

export default async function NewOrderPage() {
  const data = await getOrderFormData();
  const mapboxToken = getPublicEnvironment().NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  return (
    <OrderWizard
      {...data}
      mapboxToken={mapboxToken}
      idempotencyKey={randomUUID()}
    />
  );
}
import { randomUUID } from "node:crypto";
