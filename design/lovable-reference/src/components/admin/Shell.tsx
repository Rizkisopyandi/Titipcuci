import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, ClipboardList, Truck, WashingMachine, Wallet, MessageSquareWarning, Users, Tag, BarChart3, UserCircle, Menu, X } from "lucide-react";
import { Logo } from "@/components/landing/Navbar";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutGrid, exact: true },
  { to: "/admin/orders", label: "Pesanan", icon: ClipboardList },
  { to: "/admin/schedule", label: "Pickup & Delivery", icon: Truck },
  { to: "/admin/processing", label: "Processing", icon: WashingMachine },
  { to: "/admin/payments", label: "Payments", icon: Wallet },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/services", label: "Services", icon: Tag },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  { to: "/admin/profile", label: "Profile", icon: UserCircle },
] as const;

const MOBILE = [NAV[0], NAV[1], NAV[2], NAV[3]];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const isOn = (to: string, exact?: boolean) => (exact ? path === to || path === to + "/" : path.startsWith(to));

  const Item = ({ n, onClick }: { n: (typeof NAV)[number]; onClick?: () => void }) => {
    const on = isOn(n.to, "exact" in n ? n.exact : false);
    return (
      <Link to={n.to} onClick={onClick} className={cn("flex items-center gap-3 rounded-full px-4 py-2.5 text-sm font-medium transition-all duration-300", on ? "bg-ink text-bone" : "text-foreground/70 hover:bg-secondary hover:text-foreground")}>
        <n.icon className={cn("h-4 w-4", on && "text-primary")} /> {n.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-background px-4 py-6 lg:flex">
        <div className="px-3"><Logo /></div>
        <p className="mt-2 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Admin · Operasional</p>
        <nav className="mt-8 flex flex-col gap-1">{NAV.map((n) => <Item key={n.to} n={n} />)}</nav>
        <div className="mt-auto rounded-2xl bg-ink p-4 text-bone">
          <p className="text-xs text-bone/60">Shift hari ini</p>
          <p className="mt-1 font-semibold">Rudi Hartono</p>
          <p className="text-xs text-bone/60">Admin · Jakarta Selatan</p>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/90 px-5 py-3 backdrop-blur-md lg:hidden">
        <Logo />
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">Admin</span>
      </header>

      <main className="px-5 pb-32 pt-6 md:px-10 lg:ml-64 lg:pb-16 lg:pt-10">
        <div className="mx-auto max-w-[1200px]">{children}</div>
      </main>

      <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-around rounded-full bg-ink p-1.5 text-bone shadow-float lg:hidden">
        {MOBILE.map((n) => {
          const on = isOn(n.to, "exact" in n ? n.exact : false);
          return (
            <Link key={n.to} to={n.to} className={cn("flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-semibold transition-all", on ? "bg-primary text-primary-foreground" : "text-bone/70")}>
              <n.icon className="h-4 w-4" />
              {n.label.split(" ")[0]}
            </Link>
          );
        })}
        <button onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center gap-0.5 rounded-full py-2 text-[10px] font-semibold text-bone/70">
          <Menu className="h-4 w-4" /> Lainnya
        </button>
      </nav>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Tutup" className="absolute inset-0 bg-ink/40 animate-in fade-in" onClick={() => setOpen(false)} />
          <div className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-background p-5 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="mb-4 flex items-center justify-between"><p className="font-display text-3xl">Menu</p><button onClick={() => setOpen(false)} aria-label="Tutup"><X className="h-5 w-5" /></button></div>
            <div className="grid grid-cols-2 gap-1">{NAV.map((n) => <Item key={n.to} n={n} onClick={() => setOpen(false)} />)}</div>
          </div>
        </div>
      )}
    </div>
  );
}
