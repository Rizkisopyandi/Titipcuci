import type { Json, OrderStatus } from "@/lib/adapters/supabase/database.types";

export type InvoiceItemDetail = Readonly<{
  id: string;
  description: string;
  qty: number;
  unitPrice: number;
  amount: number;
  sourceRef: string;
}>;

export type InvoiceDetail = Readonly<{
  id: string;
  invoiceNo: string;
  status: "ISSUED";
  subtotal: number;
  discount: number;
  surcharge: number;
  tax: number;
  total: number;
  currency: "IDR";
  pricingSnapshot: Json;
  issuedAt: string;
  paidAt: string | null;
  items: readonly InvoiceItemDetail[];
}>;

export type WeightTransitionResult = Readonly<{
  id: string;
  orderNo: string;
  status: OrderStatus;
  version: number;
  updatedAt: string;
}>;

export type InvoiceIssueResult = Readonly<{
  id: string;
  invoiceNo: string;
  orderId: string;
  orderStatus: OrderStatus;
  orderVersion: number;
  subtotal: number;
  discount: number;
  surcharge: number;
  tax: number;
  total: number;
  currency: "IDR";
  pricingSnapshot: Json;
  issuedAt: string;
}>;
