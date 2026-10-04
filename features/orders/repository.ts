import "server-only";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getInvoiceForOrder } from "@/features/billing/repository";
import type { AuthPrincipal } from "@/lib/auth/session";
import type {
  AddressChoice,
  OrderDetail,
  OrderSummary,
  ServiceChoice,
  SlotChoice,
} from "@/features/orders/types";

export async function getOrderFormData(): Promise<{
  services: ServiceChoice[];
  addresses: AddressChoice[];
  slots: SlotChoice[];
}> {
  const supabase = await createServerSupabaseClient();
  const [servicesResult, pricesResult, addressesResult, slotsResult] =
    await Promise.all([
      supabase
        .from("services")
        .select("id, code, name, unit, duration_hours")
        .eq("active", true)
        .order("name"),
      supabase
        .from("service_price_versions")
        .select("id, service_id, unit_price, minimum_charge, effective_from"),
      supabase
        .from("customer_addresses")
        .select(
          "id, label, address_text, latitude, longitude, notes, is_default",
        )
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false }),
      supabase
        .from("pickup_slots")
        .select(
          "id, service_area_id, starts_at, ends_at, capacity, reserved_count",
        )
        .gt("starts_at", new Date().toISOString())
        .eq("active", true)
        .order("starts_at")
        .limit(60),
    ]);

  const error =
    servicesResult.error ??
    pricesResult.error ??
    addressesResult.error ??
    slotsResult.error;
  if (error) throw error;

  const priceByService = new Map(
    (pricesResult.data ?? []).map((price) => [price.service_id, price]),
  );

  return {
    services: (servicesResult.data ?? []).flatMap((service) => {
      const price = priceByService.get(service.id);
      return price
        ? [
            {
              id: service.id,
              code: service.code,
              name: service.name,
              unit: service.unit,
              durationHours: service.duration_hours,
              unitPrice: price.unit_price,
              minimumCharge: price.minimum_charge,
            },
          ]
        : [];
    }),
    addresses: (addressesResult.data ?? []).map((address) => ({
      id: address.id,
      label: address.label,
      addressText: address.address_text,
      latitude: address.latitude,
      longitude: address.longitude,
      notes: address.notes,
      isDefault: address.is_default,
    })),
    slots: (slotsResult.data ?? [])
      .filter((slot) => slot.reserved_count < slot.capacity)
      .map((slot) => ({
        id: slot.id,
        serviceAreaId: slot.service_area_id,
        startsAt: slot.starts_at,
        endsAt: slot.ends_at,
        remaining: slot.capacity - slot.reserved_count,
      })),
  };
}

export async function listOwnOrders(
  principal: AuthPrincipal,
): Promise<OrderSummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, estimate_amount, currency, pickup_slot_id, address_snapshot, notes, created_at",
    )
    .eq("customer_id", principal.id)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((order) => ({
    id: order.id,
    orderNo: order.order_no,
    status: order.status,
    estimateAmount: order.estimate_amount,
    currency: order.currency,
    pickupSlotId: order.pickup_slot_id,
    addressSnapshot: order.address_snapshot,
    notes: order.notes,
    createdAt: order.created_at,
  }));
}

export async function getOwnOrder(
  principal: AuthPrincipal,
  orderId: string,
): Promise<OrderDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, status, estimate_amount, currency, pickup_slot_id, address_snapshot, notes, created_at",
    )
    .eq("id", orderId)
    .eq("customer_id", principal.id)
    .maybeSingle();

  if (error) throw error;
  if (!order) return null;

  const [
    itemsResult,
    historyResult,
    slotResult,
    bagsResult,
    conditionResult,
    evidenceResult,
    invoice,
  ] = await Promise.all([
    supabase
      .from("order_items")
      .select(
        "id, service_id, service_snapshot, estimated_qty, preference_snapshot, actual_qty",
      )
      .eq("order_id", order.id)
      .order("created_at"),
    supabase
      .from("order_status_history")
      .select("id, from_status, to_status, occurred_at")
      .eq("order_id", order.id)
      .order("occurred_at"),
    supabase
      .from("pickup_slots")
      .select(
        "id, service_area_id, starts_at, ends_at, capacity, reserved_count",
      )
      .eq("id", order.pickup_slot_id)
      .maybeSingle(),
    supabase
      .from("bag_records")
      .select("bag_code")
      .eq("order_id", order.id)
      .order("bag_code"),
    supabase
      .from("condition_records")
      .select("condition_code, description")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("order_evidence")
      .select("mime_type, size_bytes")
      .eq("order_id", order.id)
      .eq("kind", "PICKUP_PROOF")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getInvoiceForOrder(order.id),
  ]);

  const relatedError =
    itemsResult.error ??
    historyResult.error ??
    slotResult.error ??
    bagsResult.error ??
    conditionResult.error ??
    evidenceResult.error;
  if (relatedError) throw relatedError;

  const slot = slotResult.data;
  return {
    id: order.id,
    orderNo: order.order_no,
    status: order.status,
    estimateAmount: order.estimate_amount,
    currency: order.currency,
    pickupSlotId: order.pickup_slot_id,
    addressSnapshot: order.address_snapshot,
    notes: order.notes,
    createdAt: order.created_at,
    items: (itemsResult.data ?? []).map((item) => ({
      id: item.id,
      serviceId: item.service_id,
      serviceSnapshot: item.service_snapshot,
      estimatedQty: item.estimated_qty,
      preferenceSnapshot: item.preference_snapshot,
      actualQty: item.actual_qty,
    })),
    history: (historyResult.data ?? []).map((event) => ({
      id: event.id,
      fromStatus: event.from_status,
      toStatus: event.to_status,
      occurredAt: event.occurred_at,
    })),
    slot: slot
      ? {
          id: slot.id,
          serviceAreaId: slot.service_area_id,
          startsAt: slot.starts_at,
          endsAt: slot.ends_at,
          remaining: slot.capacity - slot.reserved_count,
        }
      : null,
    pickupVerification:
      bagsResult.data?.length || conditionResult.data || evidenceResult.data
        ? {
            bagCodes: (bagsResult.data ?? []).map((bag) => bag.bag_code),
            conditionCode: conditionResult.data?.condition_code ?? null,
            conditionDescription: conditionResult.data?.description ?? null,
            proofMimeType: evidenceResult.data?.mime_type ?? null,
            proofSizeBytes: evidenceResult.data?.size_bytes ?? null,
          }
        : null,
    invoice,
  };
}
