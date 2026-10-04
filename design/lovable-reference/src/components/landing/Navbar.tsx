import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const links = ["Layanan", "Cara Kerja", "Harga", "Lacak Pesanan"];

export function Logo({ className }: { className?: string }) {
  return (
    <a href="#" className={cn("flex items-center gap-2", className)} aria-label="TitipCuci beranda">
      <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
          <path d="M5 13c2.5 3 11.5 3 14 0" />
          <path d="M8 8.5h.01M16 8.5h.01" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight">
        Titip<span className="font-display text-xl italic font-normal">Cuci</span>
      </span>
    </a>
  );
}

export function Navbar() {
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const on = () => setSolid(window.scrollY > 60);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        solid ? "bg-background/90 text-foreground backdrop-blur-md border-b border-border py-3" : "py-6 text-bone",
      )}
    >
      <nav className="mx-auto flex max-w-[1320px] items-center justify-between px-8">
        <Logo />
        <ul className="hidden items-center gap-9 text-sm font-medium md:flex">
          {links.map((l) => (
            <li key={l}>
              <a href="#" className="opacity-80 transition-opacity hover:opacity-100">{l}</a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-5 text-sm font-semibold">
          <a href="/admin" className="hidden opacity-80 hover:opacity-100 sm:inline">Admin</a>
          <a href="/app" className="rounded-full bg-primary px-5 py-2.5 text-primary-foreground transition-transform hover:scale-[1.03]">
            Jemput Laundry
          </a>
        </div>
      </nav>
    </header>
  );
}
