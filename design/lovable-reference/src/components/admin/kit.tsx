import type { ReactNode, ButtonHTMLAttributes } from "react";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_META, type OrderStatus, type Tone, type PaymentStatus } from "@/lib/admin/data";

const toneCls: Record<Tone, string> = {
  lime: "bg-primary text-primary-foreground",
  ink: "bg-ink text-bone",
  warn: "bg-warn-soft text-warn",
  info: "bg-info-soft text-info",
  danger: "bg-danger-soft text-destructive",
  muted: "bg-secondary text-muted-foreground",
};

export function Pill({ tone = "muted", children, live, className }: { tone?: Tone; children: ReactNode; live?: boolean; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide transition-colors duration-500", toneCls[tone], className)}>
      {live ? (
        <span className="relative flex h-1.5 w-1.5"><span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" /><span className="relative h-1.5 w-1.5 rounded-full bg-primary" /></span>
      ) : (
        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      )}
      {children}
    </span>
  );
}

export function StatusPill({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return <Pill tone={m.tone} live={status === "PICKUP_ON_THE_WAY" || status === "DELIVERY_ON_THE_WAY"}>{m.label}</Pill>;
}

const payTone: Record<PaymentStatus, Tone> = { UNPAID: "muted", PENDING: "warn", PAID: "lime", EXPIRED: "danger", FAILED: "danger", REFUNDED: "info" };
export const PayPill = ({ s }: { s: PaymentStatus }) => <Pill tone={payTone[s]}>{s}</Pill>;

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground", className)}>
      <span className="h-px w-6 bg-current" /> {children}
    </p>
  );
}

export function PageHead({ eyebrow, title, children }: { eyebrow: string; title: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-slidein">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h1 className="mt-3 font-display text-4xl leading-[0.95] md:text-6xl">{title}</h1>
      </div>
      {children}
    </div>
  );
}

export function Panel({ children, className, title, action }: { children: ReactNode; className?: string; title?: ReactNode; action?: ReactNode }) {
  return (
    <section className={cn("rounded-3xl border border-border bg-card p-5 md:p-6", className)}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="text-sm font-bold tracking-tight">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ink" | "ghost" | "danger"; size?: "md" | "lg" };
export function Btn({ variant = "primary", size = "md", className, ...p }: BtnProps) {
  return (
    <button
      {...p}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
        size === "lg" ? "px-7 py-4 text-base" : "px-5 py-2.5 text-sm",
        variant === "primary" && "bg-primary text-primary-foreground",
        variant === "ink" && "bg-ink text-bone",
        variant === "ghost" && "border border-border bg-card text-foreground hover:bg-secondary",
        variant === "danger" && "bg-danger-soft text-destructive",
        className,
      )}
    />
  );
}

export function Row({ k, v, strong }: { k: ReactNode; v: ReactNode; strong?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{k}</span>
      <span className={cn("text-right", strong ? "font-bold" : "font-medium")}>{v}</span>
    </div>
  );
}

export function Chip({ on, children, onClick }: { on: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-all duration-300",
        on ? "border-ink bg-ink text-bone" : "border-border bg-card hover:border-foreground/40",
      )}
    >
      {on && <Check className="h-3.5 w-3.5 animate-pop" />}
      {children}
    </button>
  );
}

export function CheckRow({ on, label, onClick, sub }: { on: boolean; label: string; sub?: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={cn("flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-300", on ? "border-primary bg-ok-soft" : "border-border bg-card hover:bg-secondary")}>
      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 transition-all", on ? "border-ink bg-ink text-primary" : "border-border")}>
        {on && <Check className="h-4 w-4 animate-pop" strokeWidth={3} />}
      </span>
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        {sub && <span className="block text-xs text-muted-foreground">{sub}</span>}
      </span>
    </button>
  );
}

/** Stylized map in the TitipCuci landing style. `live` animates the route and rider. */
export function MapView({ live, className, progress = 0.45, label }: { live?: boolean; className?: string; progress?: number; label?: string }) {
  const rx = 70 + (355 - 70) * progress;
  return (
    <div className={cn("relative overflow-hidden rounded-3xl bg-map", className)}>
      <svg viewBox="0 0 500 400" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" aria-hidden>
        <g stroke="var(--map-road)" strokeWidth="14" fill="none" strokeLinecap="round">
          <path d="M-10 80 L520 120" /><path d="M-10 260 L520 230" /><path d="M120 -10 L160 420" /><path d="M360 -10 L330 420" /><path d="M-10 360 L240 300 L520 340" />
        </g>
        <g stroke="var(--map-road)" strokeWidth="5" fill="none" opacity=".8">
          <path d="M40 -10 L60 420" /><path d="M250 -10 L240 420" /><path d="M440 -10 L460 420" /><path d="M-10 180 L520 170" />
        </g>
        <rect x="180" y="130" width="40" height="30" rx="4" fill="var(--sage)" opacity=".18" />
        <rect x="390" y="270" width="60" height="40" rx="4" fill="var(--sage)" opacity=".18" />
        <path d="M70 330 L140 290 L150 180 L245 172 L340 166 L355 110" stroke="var(--ink)" strokeOpacity={live ? 1 : 0.25} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" className={live ? "animate-dash" : ""} />
      </svg>
      {live && (
        <div className="absolute transition-all duration-1000 ease-out" style={{ left: `${(rx / 500) * 100}%`, top: `${progress < 0.4 ? 60 : 42}%` }}>
          <span className="absolute inset-0 rounded-full bg-primary animate-pulse-ring" />
          <span className="relative -ml-5 -mt-5 grid h-10 w-10 place-items-center rounded-full border-4 border-card bg-ink text-[10px] font-bold text-primary">TC</span>
        </div>
      )}
      <div className="absolute left-[71%] top-[27%] -translate-x-1/2 -translate-y-full">
        <div className="rounded-full bg-primary p-2 shadow-float"><MapPin className="h-5 w-5" /></div>
      </div>
      {label && <span className="absolute bottom-3 left-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-semibold backdrop-blur">{label}</span>}
    </div>
  );
}

export function PhotoSlot({ taken, onClick, label = "Foto" }: { taken: boolean; onClick: () => void; label?: string }) {
  return (
    <button type="button" onClick={onClick} className={cn("grid aspect-square w-24 place-items-center rounded-2xl border-2 border-dashed text-xs font-semibold transition-all", taken ? "border-primary bg-ok-soft" : "border-border text-muted-foreground hover:bg-secondary")}>
      {taken ? <span className="flex flex-col items-center gap-1 animate-pop"><Check className="h-5 w-5" />Tersimpan</span> : <span>+ {label}</span>}
    </button>
  );
}

export function Success({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex flex-col items-center py-6 text-center animate-slidein">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-primary animate-pop"><Check className="h-8 w-8" strokeWidth={3} /></span>
      <p className="mt-4 font-display text-3xl">{title}</p>
      {children && <div className="mt-2 text-sm text-muted-foreground">{children}</div>}
    </div>
  );
}
