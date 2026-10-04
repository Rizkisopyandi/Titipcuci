import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { seedOrders, seedComplaints, type Order, type OrderStatus, type Complaint } from "./data";

export type Activity = { at: string; text: string; orderId?: string };

type Ctx = {
  orders: Order[];
  complaints: Complaint[];
  activity: Activity[];
  get: (id: string) => Order | undefined;
  /** Update an order. Pass `to` to move it along the status flow (logged in timeline + activity). */
  update: (id: string, patch: Partial<Order>, to?: OrderStatus, note?: string) => void;
  create: (o: Order) => void;
  updateComplaint: (id: string, patch: Partial<Complaint>, note?: string) => void;
};

const AdminCtx = createContext<Ctx | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [complaints, setComplaints] = useState<Complaint[]>(seedComplaints);
  const [activity, setActivity] = useState<Activity[]>(() => [
    { at: new Date(Date.now() - 6e5).toISOString(), text: "TC-00127 · Admin berangkat menuju pickup", orderId: "TC-00127" },
    { at: new Date(Date.now() - 18e5).toISOString(), text: "TC-00122 · Invoice diterbitkan Rp47.000", orderId: "TC-00122" },
    { at: new Date(Date.now() - 36e5).toISOString(), text: "TC-00119 · Pembayaran terverifikasi (webhook)", orderId: "TC-00119" },
  ]);

  const update = useCallback<Ctx["update"]>((id, patch, to, note) => {
    const at = new Date().toISOString();
    setOrders((os) =>
      os.map((o) =>
        o.id !== id ? o : { ...o, ...patch, ...(to ? { status: to, timeline: [...o.timeline, { status: to, at, ...(note ? { note } : {}) }] } : {}) },
      ),
    );
    if (to || note) setActivity((a) => [{ at, text: `${id} · ${note ?? to}`, orderId: id }, ...a].slice(0, 30));
  }, []);

  const updateComplaint = useCallback<Ctx["updateComplaint"]>((id, patch, note) => {
    const at = new Date().toISOString();
    setComplaints((cs) => cs.map((c) => (c.id !== id ? c : { ...c, ...patch, timeline: note ? [...c.timeline, { at, note }] : c.timeline })));
  }, []);

  const create = useCallback((o: Order) => {
    setOrders((os) => [o, ...os]);
    setActivity((a) => [{ at: o.createdAt, text: `${o.id} · Pesanan baru dari customer`, orderId: o.id }, ...a]);
  }, []);

  const get = useCallback((id: string) => orders.find((o) => o.id === id), [orders]);

  return <AdminCtx.Provider value={{ orders, complaints, activity, get, update, create, updateComplaint }}>{children}</AdminCtx.Provider>;
}

export function useAdmin() {
  const c = useContext(AdminCtx);
  if (!c) throw new Error("useAdmin outside AdminProvider");
  return c;
}
