import "server-only";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { getInvoiceForOrder } from "@/features/billing/repository";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
} from "@/features/admin-orders/types";

export async function listAdminOrders(): Promise<AdminOrderSummary[]> {
  const supabase = await createServerSupabaseClient();
  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, customer_id, status, version, estimate_amount, address_snapshot, pickup_slot_id, created_at, updated_at",
    )
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!orders?.length) return [];

  const customerIds = [...new Set(orders.map((order) => order.customer_id))];
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, full_name")
    .in("id", customerIds);
  if (profileError) throw profileError;
  const nameById = new Map(
    (profiles ?? []).map((profile) => [profile.id, profile.full_name]),
  );

  return orders.map((order) => ({
    id: order.id,
    orderNo: order.order_no,
    customerId: order.customer_id,
    customerName: nameById.get(order.customer_id) ?? "Customer",
    status: order.status,
    version: order.version,
    estimateAmount: order.estimate_amount,
    addressSnapshot: order.address_snapshot,
    pickupSlotId: order.pickup_slot_id,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
  }));
}

export async function getAdminOrder(
  orderId: string,
): Promise<AdminOrderDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data: order, error } = await supabase
    .from("orders")
    .select(
      "id, order_no, customer_id, status, version, estimate_amount, address_snapshot, pickup_slot_id, notes, created_at, updated_at",
    )
    .eq("id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!order) return null;

  const [
    profileResult,
    itemsResult,
    slotResult,
    taskResult,
    bagsResult,
    conditionResult,
    evidenceResult,
    historyResult,
    invoice,
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", order.customer_id)
      .maybeSingle(),
    supabase
      .from("order_items")
      .select(
        "id, service_id, service_snapshot, estimated_qty, preference_snapshot, actual_qty",
      )
      .eq("order_id", order.id)
      .order("created_at"),
    supabase
      .from("pickup_slots")
      .select(
        "id, service_area_id, starts_at, ends_at, capacity, reserved_count",
      )
      .eq("id", order.pickup_slot_id)
      .maybeSingle(),
    supabase
      .from("pickup_delivery_tasks")
      .select(
        "id, assigned_admin_id, status, scheduled_at, started_at, arrived_at, completed_at",
      )
      .eq("order_id", order.id)
      .eq("type", "PICKUP")
      .order("attempt_no", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("bag_records")
      .select("id, bag_code, expected_count, received_count, verified_at")
      .eq("order_id", order.id)
      .order("bag_code"),
    supabase
      .from("condition_records")
      .select("condition_code, description, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("order_evidence")
      .select("id, kind, mime_type, size_bytes, sha256, created_at")
      .eq("order_id", order.id)
      .eq("kind", "PICKUP_PROOF")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("order_status_history")
      .select(
        "id, from_status, to_status, actor_id, actor_role, note, occurred_at",
      )
      .eq("order_id", order.id)
      .order("occurred_at"),
    getInvoiceForOrder(order.id),
  ]);

  const relatedError =
    profileResult.error ??
    itemsResult.error ??
    slotResult.error ??
    taskResult.error ??
    bagsResult.error ??
    conditionResult.error ??
    evidenceResult.error ??
    historyResult.error;
  if (relatedError) throw relatedError;

  const slot = slotResult.data;
  const task = taskResult.data;
  const condition = conditionResult.data;
  const evidence = evidenceResult.data;
  return {
    id: order.id,
    orderNo: order.order_no,
    customerId: order.customer_id,
    customerName: profileResult.data?.full_name ?? "Customer",
    customerPhone: profileResult.data?.phone ?? null,
    status: order.status,
    version: order.version,
    estimateAmount: order.estimate_amount,
    addressSnapshot: order.address_snapshot,
    pickupSlotId: order.pickup_slot_id,
    notes: order.notes,
    createdAt: order.created_at,
    updatedAt: order.updated_at,
    items: (itemsResult.data ?? []).map((item) => ({
      id: item.id,
      serviceId: item.service_id,
      serviceSnapshot: item.service_snapshot,
      estimatedQty: item.estimated_qty,
      preferenceSnapshot: item.preference_snapshot,
      actualQty: item.actual_qty,
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
    task: task
      ? {
          id: task.id,
          assignedAdminId: task.assigned_admin_id,
          status: task.status,
          scheduledAt: task.scheduled_at,
          startedAt: task.started_at,
          arrivedAt: task.arrived_at,
          completedAt: task.completed_at,
        }
      : null,
    bags: (bagsResult.data ?? []).map((bag) => ({
      id: bag.id,
      bagCode: bag.bag_code,
      expectedCount: bag.expected_count,
      receivedCount: bag.received_count,
      verifiedAt: bag.verified_at,
    })),
    condition: condition
      ? {
          code: condition.condition_code,
          description: condition.description,
          createdAt: condition.created_at,
        }
      : null,
    evidence: evidence
      ? {
          id: evidence.id,
          kind: evidence.kind,
          mimeType: evidence.mime_type,
          sizeBytes: evidence.size_bytes,
          sha256: evidence.sha256,
          createdAt: evidence.created_at,
        }
      : null,
    history: (historyResult.data ?? []).map((entry) => ({
      id: entry.id,
      fromStatus: entry.from_status,
      toStatus: entry.to_status,
      actorId: entry.actor_id,
      actorRole: entry.actor_role,
      note: entry.note,
      occurredAt: entry.occurred_at,
    })),
    invoice,
  };
}
