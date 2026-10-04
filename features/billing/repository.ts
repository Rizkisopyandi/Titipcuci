import "server-only";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import type { InvoiceDetail } from "@/features/billing/types";

export async function getInvoiceForOrder(
  orderId: string,
): Promise<InvoiceDetail | null> {
  const supabase = await createServerSupabaseClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select(
      "id, invoice_no, status, subtotal, discount, surcharge, tax, total, currency, pricing_snapshot, issued_at, paid_at",
    )
    .eq("order_id", orderId)
    .maybeSingle();
  if (error) throw error;
  if (!invoice) return null;

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("id, description, qty, unit_price, amount, source_ref")
    .eq("invoice_id", invoice.id)
    .order("created_at");
  if (itemsError) throw itemsError;

  return {
    id: invoice.id,
    invoiceNo: invoice.invoice_no,
    status: invoice.status,
    subtotal: invoice.subtotal,
    discount: invoice.discount,
    surcharge: invoice.surcharge,
    tax: invoice.tax,
    total: invoice.total,
    currency: invoice.currency,
    pricingSnapshot: invoice.pricing_snapshot,
    issuedAt: invoice.issued_at,
    paidAt: invoice.paid_at,
    items: (items ?? []).map((item) => ({
      id: item.id,
      description: item.description,
      qty: item.qty,
      unitPrice: item.unit_price,
      amount: item.amount,
      sourceRef: item.source_ref,
    })),
  };
}
