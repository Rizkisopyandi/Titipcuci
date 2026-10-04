export type OrderStatus =
  | "NEW"
  | "PICKUP_SCHEDULED"
  | "PICKUP_ON_THE_WAY"
  | "PICKED_UP"
  | "RECEIVED"
  | "NEEDS_CUSTOMER_APPROVAL"
  | "WEIGHING"
  | "INVOICE_DRAFT"
  | "WAITING_PAYMENT"
  | "PROCESSING"
  | "QUALITY_CHECK"
  | "REPROCESSING"
  | "READY"
  | "DELIVERY_ON_THE_WAY"
  | "DELIVERED"
  | "COMPLETED";

export type PaymentStatus = "UNPAID" | "PENDING" | "PAID" | "EXPIRED" | "FAILED" | "REFUNDED";

export type Tone = "lime" | "ink" | "warn" | "info" | "danger" | "muted";

export const STATUS_META: Record<OrderStatus, { label: string; tone: Tone; group: OrderGroup }> = {
  NEW: { label: "Pesanan Baru", tone: "lime", group: "New" },
  PICKUP_SCHEDULED: { label: "Pickup Terjadwal", tone: "info", group: "Confirmed" },
  PICKUP_ON_THE_WAY: { label: "Menuju Pickup", tone: "ink", group: "Pickup" },
  PICKED_UP: { label: "Sudah Dijemput", tone: "info", group: "Pickup" },
  RECEIVED: { label: "Diterima di Laundry", tone: "info", group: "Processing" },
  NEEDS_CUSTOMER_APPROVAL: { label: "Butuh Persetujuan", tone: "warn", group: "Issues" },
  WEIGHING: { label: "Menunggu Timbang", tone: "warn", group: "Processing" },
  INVOICE_DRAFT: { label: "Draft Invoice", tone: "warn", group: "Processing" },
  WAITING_PAYMENT: { label: "Menunggu Bayar", tone: "warn", group: "Processing" },
  PROCESSING: { label: "Diproses", tone: "info", group: "Processing" },
  QUALITY_CHECK: { label: "Quality Check", tone: "info", group: "Processing" },
  REPROCESSING: { label: "Reprocess", tone: "danger", group: "Issues" },
  READY: { label: "Siap Diantar", tone: "lime", group: "Delivery" },
  DELIVERY_ON_THE_WAY: { label: "Dalam Pengantaran", tone: "ink", group: "Delivery" },
  DELIVERED: { label: "Terkirim", tone: "lime", group: "Delivery" },
  COMPLETED: { label: "Selesai", tone: "muted", group: "Completed" },
};

export const ORDER_GROUPS = ["Semua", "New", "Confirmed", "Pickup", "Processing", "Delivery", "Completed", "Issues"] as const;
export type OrderGroup = Exclude<(typeof ORDER_GROUPS)[number], "Semua">;

export const FLOW: OrderStatus[] = [
  "NEW", "PICKUP_SCHEDULED", "PICKUP_ON_THE_WAY", "PICKED_UP", "RECEIVED", "WEIGHING", "INVOICE_DRAFT",
  "WAITING_PAYMENT", "PROCESSING", "QUALITY_CHECK", "READY", "DELIVERY_ON_THE_WAY", "DELIVERED", "COMPLETED",
];

export type Service = { id: string; name: string; pricing: "per kg" | "per item" | "per set"; price: number; duration: string; active: boolean };
export const SERVICES: Service[] = [
  { id: "cks", name: "Cuci + Setrika", pricing: "per kg", price: 10000, duration: "2 hari", active: true },
  { id: "ck", name: "Cuci Kering", pricing: "per kg", price: 8000, duration: "2 hari", active: true },
  { id: "exp", name: "Express 1 Hari", pricing: "per kg", price: 15000, duration: "24 jam", active: true },
  { id: "bed", name: "Household & Bedding", pricing: "per set", price: 35000, duration: "3 hari", active: true },
  { id: "dry", name: "Dry Cleaning", pricing: "per item", price: 25000, duration: "3 hari", active: true },
  { id: "shoe", name: "Cuci Sepatu", pricing: "per item", price: 40000, duration: "4 hari", active: false },
];
export const DELIVERY_FEE = 5000;

export type Bag = { id: string; photo?: boolean };
export type Stage = { name: string; start?: string; end?: string; note?: string };
export type TimelineEntry = { status: OrderStatus | string; at: string; note?: string };

export type Order = {
  id: string;
  customerId: string;
  serviceId: string;
  address: string;
  area: string;
  distanceKm: number;
  pickupDate: string;
  slot: string;
  deliverySlot?: string;
  createdAt: string;
  status: OrderStatus;
  preferences: string[];
  customerNote?: string;
  estWeight?: number;
  actualWeight?: number;
  bags: Bag[];
  arrived?: boolean;
  pickupProof?: { at: string; photo: boolean };
  condition?: { tags: string[]; internalNote: string; photos: number; at: string };
  invoice?: { subtotal: number; fee: number; discount: number; total: number; issued: boolean; issuedAt?: string };
  payment: { status: PaymentStatus; method?: string; ref?: string; at?: string };
  stages: Stage[];
  qcFails: number;
  delivery?: { method: string; note: string; at: string; photo: boolean };
  internalNotes: string[];
  urgent?: boolean;
  delayed?: boolean;
  timeline: TimelineEntry[];
};

export const STAGE_NAMES = ["Sorting", "Washing", "Drying", "Ironing", "Folding", "Packaging"];
export const freshStages = (): Stage[] => STAGE_NAMES.map((name) => ({ name }));

export type Customer = { id: string; name: string; phone: string; since: string; addresses: string[]; preferences: string[] };
export const CUSTOMERS: Customer[] = [
  { id: "c1", name: "Nadia Putri", phone: "+62 812-3345-0921", since: "Mar 2025", addresses: ["Jl. Kemang Raya No. 18, Kemang", "Kantor — Menara Sentraya Lt. 12"], preferences: ["Pewangi lembut", "Lipat, tidak digantung"] },
  { id: "c2", name: "Bima Arditya", phone: "+62 813-7781-2210", since: "Jan 2026", addresses: ["Jl. Cipete Raya No. 4A, Cipete"], preferences: ["Tanpa pewangi"] },
  { id: "c3", name: "Sarah Wijaya", phone: "+62 811-9087-6655", since: "Agu 2024", addresses: ["Apartemen Senopati Suites T2/1508"], preferences: ["Pisahkan warna putih", "Setrika uap"] },
  { id: "c4", name: "Rizky Hamdani", phone: "+62 857-2210-4412", since: "Mei 2026", addresses: ["Jl. Gandaria I No. 22, Kebayoran Baru"], preferences: [] },
  { id: "c5", name: "Ayu Lestari", phone: "+62 878-6623-1190", since: "Okt 2025", addresses: ["Jl. Panglima Polim IX No. 7"], preferences: ["Pewangi lembut"] },
  { id: "c6", name: "Dimas Prakoso", phone: "+62 812-0098-7731", since: "Feb 2026", addresses: ["Jl. Wijaya II No. 31, Melawai"], preferences: ["Lipat rapi"] },
];

const t = (h: number, m = 0) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

const base = (o: Partial<Order> & Pick<Order, "id" | "customerId" | "status">): Order => ({
  serviceId: "cks",
  address: CUSTOMERS.find((c) => c.id === o.customerId)!.addresses[0]!,
  area: "Jakarta Selatan",
  distanceKm: 2.4,
  pickupDate: "Hari ini",
  slot: "13.00 – 15.00",
  createdAt: t(8, 12),
  preferences: CUSTOMERS.find((c) => c.id === o.customerId)!.preferences,
  bags: [],
  payment: { status: "UNPAID" },
  stages: freshStages(),
  qcFails: 0,
  internalNotes: [],
  timeline: [{ status: "NEW", at: o.createdAt ?? t(8, 12) }],
  ...o,
});

export const seedOrders = (): Order[] => [
  base({ id: "TC-00131", customerId: "c4", status: "NEW", createdAt: t(9, 41), slot: "15.00 – 17.00", distanceKm: 3.1, customerNote: "Pagar hitam, bel di sebelah kiri.", estWeight: 4, urgent: true, timeline: [{ status: "NEW", at: t(9, 41) }] }),
  base({ id: "TC-00130", customerId: "c5", status: "NEW", serviceId: "exp", createdAt: t(9, 2), slot: "13.00 – 15.00", distanceKm: 1.6, estWeight: 3, timeline: [{ status: "NEW", at: t(9, 2) }] }),
  base({ id: "TC-00128", customerId: "c1", status: "PICKUP_SCHEDULED", createdAt: t(7, 30), slot: "10.00 – 12.00", distanceKm: 2.4, estWeight: 5, customerNote: "Ada 1 kemeja putih, mohon dipisah.", timeline: [{ status: "NEW", at: t(7, 30) }, { status: "PICKUP_SCHEDULED", at: t(7, 48) }] }),
  base({ id: "TC-00127", customerId: "c2", status: "PICKUP_ON_THE_WAY", createdAt: t(7, 5), slot: "10.00 – 12.00", distanceKm: 1.2, timeline: [{ status: "NEW", at: t(7, 5) }, { status: "PICKUP_SCHEDULED", at: t(7, 20) }, { status: "PICKUP_ON_THE_WAY", at: t(9, 50) }] }),
  base({ id: "TC-00125", customerId: "c3", status: "WEIGHING", createdAt: t(6, 40), serviceId: "cks", bags: [{ id: "TC-00125-A" }, { id: "TC-00125-B" }], pickupProof: { at: t(8, 15), photo: true }, condition: { tags: ["Normal"], internalNote: "", photos: 0, at: t(9, 0) }, estWeight: 6, timeline: [{ status: "NEW", at: t(6, 40) }, { status: "PICKUP_SCHEDULED", at: t(6, 55) }, { status: "PICKUP_ON_THE_WAY", at: t(7, 50) }, { status: "PICKED_UP", at: t(8, 15) }, { status: "RECEIVED", at: t(8, 50) }, { status: "WEIGHING", at: t(9, 0) }] }),
  base({ id: "TC-00122", customerId: "c1", status: "WAITING_PAYMENT", createdAt: t(6, 0), actualWeight: 4.2, bags: [{ id: "TC-00122-A" }], pickupProof: { at: t(7, 10), photo: false }, invoice: { subtotal: 42000, fee: DELIVERY_FEE, discount: 0, total: 47000, issued: true, issuedAt: t(8, 40) }, payment: { status: "PENDING", method: "QRIS", ref: "QR-88120931" }, timeline: [{ status: "NEW", at: t(6, 0) }, { status: "PICKED_UP", at: t(7, 10) }, { status: "WEIGHING", at: t(8, 20) }, { status: "WAITING_PAYMENT", at: t(8, 40) }] }),
  base({ id: "TC-00119", customerId: "c1", status: "PROCESSING", createdAt: t(7, 0), pickupDate: "Kemarin", actualWeight: 6.1, bags: [{ id: "TC-00119-A" }, { id: "TC-00119-B" }], invoice: { subtotal: 61000, fee: DELIVERY_FEE, discount: 0, total: 66000, issued: true }, payment: { status: "PAID", method: "Virtual Account BCA", ref: "VA-3920118812", at: t(7, 32) }, stages: [{ name: "Sorting", start: t(8, 0), end: t(8, 20) }, { name: "Washing", start: t(8, 25), end: t(9, 30) }, { name: "Drying", start: t(9, 35) }, { name: "Ironing" }, { name: "Folding" }, { name: "Packaging" }], timeline: [{ status: "NEW", at: t(7, 0) }, { status: "WAITING_PAYMENT", at: t(7, 10) }, { status: "PROCESSING", at: t(7, 32) }] }),
  base({ id: "TC-00117", customerId: "c3", status: "QUALITY_CHECK", createdAt: t(6, 0), pickupDate: "Kemarin", actualWeight: 3.4, bags: [{ id: "TC-00117-A" }], invoice: { subtotal: 34000, fee: DELIVERY_FEE, discount: 0, total: 39000, issued: true }, payment: { status: "PAID", method: "QRIS", ref: "QR-88011277", at: t(6, 30) }, stages: STAGE_NAMES.map((name, i) => ({ name, start: t(7, i * 10), end: t(7, i * 10 + 8) })), timeline: [{ status: "PROCESSING", at: t(6, 30) }, { status: "QUALITY_CHECK", at: t(8, 0) }] }),
  base({ id: "TC-00114", customerId: "c5", status: "READY", createdAt: t(6, 0), pickupDate: "2 hari lalu", deliverySlot: "16.00 – 18.00", actualWeight: 5, bags: [{ id: "TC-00114-A" }], invoice: { subtotal: 50000, fee: DELIVERY_FEE, discount: 5000, total: 50000, issued: true }, payment: { status: "PAID", method: "GoPay", ref: "GP-1102993", at: t(6, 20) }, stages: STAGE_NAMES.map((name) => ({ name, start: t(7), end: t(8) })), timeline: [{ status: "QUALITY_CHECK", at: t(8, 30) }, { status: "READY", at: t(9, 0) }] }),
  base({ id: "TC-00112", customerId: "c2", status: "DELIVERY_ON_THE_WAY", createdAt: t(6, 0), pickupDate: "2 hari lalu", deliverySlot: "10.00 – 12.00", distanceKm: 1.8, actualWeight: 2.8, bags: [{ id: "TC-00112-A" }], invoice: { subtotal: 28000, fee: DELIVERY_FEE, discount: 0, total: 33000, issued: true }, payment: { status: "PAID", method: "QRIS", ref: "QR-87990012", at: t(6, 5) }, stages: STAGE_NAMES.map((name) => ({ name, start: t(7), end: t(8) })), timeline: [{ status: "READY", at: t(8, 30) }, { status: "DELIVERY_ON_THE_WAY", at: t(9, 45) }] }),
  base({ id: "TC-00110", customerId: "c4", status: "NEEDS_CUSTOMER_APPROVAL", createdAt: t(6, 0), pickupDate: "Kemarin", delayed: true, bags: [{ id: "TC-00110-A" }], condition: { tags: ["Existing stain", "Special handling"], internalNote: "Noda tinta di kemeja biru, perlu treatment khusus +Rp15.000.", photos: 2, at: t(8, 10) }, timeline: [{ status: "RECEIVED", at: t(7, 50) }, { status: "NEEDS_CUSTOMER_APPROVAL", at: t(8, 10) }] }),
  base({ id: "TC-00105", customerId: "c6", status: "COMPLETED", createdAt: t(6, 0), pickupDate: "3 hari lalu", actualWeight: 4.5, bags: [{ id: "TC-00105-A" }], invoice: { subtotal: 45000, fee: DELIVERY_FEE, discount: 0, total: 50000, issued: true }, payment: { status: "PAID", method: "QRIS", ref: "QR-87001920", at: t(6, 0) }, delivery: { method: "Diserahkan ke customer", note: "", at: t(9, 10), photo: true }, timeline: [{ status: "DELIVERED", at: t(9, 10) }, { status: "COMPLETED", at: t(9, 12) }] }),
];

export type ComplaintStatus = "OPEN" | "REVIEWING" | "ACTION_REQUIRED" | "RESOLVED" | "CLOSED";
export type Complaint = { id: string; orderId: string; customerId: string; type: string; status: ComplaintStatus; detail: string; evidence: number; createdAt: string; resolution?: string; timeline: { at: string; note: string }[] };
export const COMPLAINT_TYPES = ["Missing item", "Damaged item", "Cleaning quality", "Wrong item", "Payment issue", "Pickup/delivery issue", "Other"];
export const RESOLUTIONS = ["Re-clean", "Redelivery", "Refund (simulasi)", "Kompensasi", "Tidak ada tindakan"];
export const seedComplaints = (): Complaint[] => [
  { id: "CP-0042", orderId: "TC-00105", customerId: "c6", type: "Missing item", status: "OPEN", detail: "Kaus kaki hitam 1 pasang tidak ada di paket.", evidence: 1, createdAt: t(9, 30), timeline: [{ at: t(9, 30), note: "Komplain dibuat oleh customer" }] },
  { id: "CP-0041", orderId: "TC-00110", customerId: "c4", type: "Cleaning quality", status: "REVIEWING", detail: "Noda masih terlihat di kerah kemeja.", evidence: 2, createdAt: t(8, 0), timeline: [{ at: t(8, 0), note: "Komplain dibuat" }, { at: t(8, 30), note: "Admin mulai meninjau" }] },
  { id: "CP-0038", orderId: "TC-00114", customerId: "c5", type: "Pickup/delivery issue", status: "RESOLVED", detail: "Pengantaran terlambat 40 menit.", evidence: 0, createdAt: t(7, 0), resolution: "Kompensasi", timeline: [{ at: t(7, 0), note: "Komplain dibuat" }, { at: t(7, 40), note: "Voucher Rp10.000 diberikan" }] },
];

export const rp = (n: number) => "Rp" + n.toLocaleString("id-ID");
export const clock = (iso?: string) => (iso ? new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "—");
export const customerOf = (id: string) => CUSTOMERS.find((c) => c.id === id)!;
export const serviceOf = (id: string) => SERVICES.find((s) => s.id === id)!;
