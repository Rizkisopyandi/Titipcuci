import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Home, ClipboardList, History, MapPin, SlidersHorizontal, UserCircle, Plus } from "lucide-react";
import { Logo } from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";

export const ME = "c1";

const NAV = [
  { to: "/app", label: "Dashboard", icon: Home, exact: true },
  { to: "/app/orders", label: "Pesanan", icon: ClipboardList },
  { to: "/app/history", label: "Riwayat", icon: History },
  { to: "/app/addresses", label: "Alamat", icon: MapPin },
  { to: "/app/preferences", label: "Preferensi", icon: SlidersHorizontal },
  { to: "/app/profile", label: "Profil", icon: UserCircle },
] as const;

export function CustomerShell({ children, bare }: { children: ReactNode; bare?: boolean }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const on = (to: string, exact?: boolean) => (exact ? path === to || path === to + "/" : path.startsWith(to));
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-5 py-3 md:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link key={n.to} to={n.to} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-all duration-300", on(n.to, "exact" in n) ? "bg-ink text-bone" : "text-foreground/70 hover:bg-secondary")}>{n.label}</Link>
            ))}
          </nav>
          <Link to="/app/new" className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold transition-transform hover:scale-[1.03]"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Buat Pesanan</span></Link>
        </div>
      </header>
      <main className={cn(!bare && "mx-auto max-w-[1200px] px-5 pb-32 pt-8 md:px-8 md:pb-16 md:pt-12")}>{children}</main>
      <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-6 rounded-full bg-ink p-1.5 text-bone shadow-float md:hidden">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className={cn("flex flex-col items-center gap-0.5 rounded-full py-2 text-[9px] font-semibold transition-all", on(n.to, "exact" in n) ? "bg-primary text-primary-foreground" : "text-bone/70")}>
            <n.icon className="h-4 w-4" />{n.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

const CSTEPS = [
  { label: "Dikonfirmasi", match: ["PICKUP_SCHEDULED"] },
  { label: "Dijemput", match: ["PICKUP_ON_THE_WAY", "PICKED_UP"] },
  { label: "Ditimbang", match: ["RECEIVED", "NEEDS_CUSTOMER_APPROVAL", "WEIGHING", "INVOICE_DRAFT"] },
  { label: "Pembayaran", match: ["WAITING_PAYMENT"] },
  { label: "Dicuci", match: ["PROCESSING", "QUALITY_CHECK", "REPROCESSING", "READY"] },
  { label: "Diantar", match: ["DELIVERY_ON_THE_WAY"] },
  { label: "Selesai", match: ["DELIVERED", "COMPLETED"] },
];
export const customerStep = (s: string) => CSTEPS.findIndex((c) => c.match.includes(s));
export const CUSTOMER_STEPS = CSTEPS.map((c) => c.label);

export const CUSTOMER_LABEL: Record<string, string> = {
  NEW: "Menunggu konfirmasi TitipCuci",
  PICKUP_SCHEDULED: "Pickup terjadwal",
  PICKUP_ON_THE_WAY: "Petugas sedang menuju lokasi kamu",
  PICKED_UP: "Laundry sudah dijemput",
  RECEIVED: "Laundry kamu sudah kami terima",
  NEEDS_CUSTOMER_APPROVAL: "Butuh persetujuan kamu",
  WEIGHING: "Sedang ditimbang",
  INVOICE_DRAFT: "Sedang ditimbang",
  WAITING_PAYMENT: "Menunggu pembayaran",
  PROCESSING: "Sedang dicuci",
  QUALITY_CHECK: "Pemeriksaan kualitas",
  REPROCESSING: "Sedang dicuci ulang agar sempurna",
  READY: "Siap diantar",
  DELIVERY_ON_THE_WAY: "Laundry sedang diantar",
  DELIVERED: "Laundry sudah sampai",
  COMPLETED: "Selesai",
};

export function Progress({ status }: { status: string }) {
  const i = customerStep(status);
  return (
    <div>
      <div className="flex gap-1">{CUSTOMER_STEPS.map((s, j) => <div key={s} className={cn("h-1.5 flex-1 rounded-full transition-colors duration-700", j < i ? "bg-ink" : j === i ? "bg-primary" : "bg-border")} />)}</div>
      <div className="mt-2 hidden justify-between text-[11px] font-medium text-muted-foreground sm:flex">{CUSTOMER_STEPS.map((s, j) => <span key={s} className={cn(j === i && "font-bold text-foreground")}>{s}</span>)}</div>
    </div>
  );
}
