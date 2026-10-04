import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions";
import type { AuthPrincipal } from "@/lib/auth/session";

const roleLabel = {
  CUSTOMER: "Customer",
  ADMIN: "Admin",
  OWNER: "Owner",
} as const;

export function ProtectedShell({
  principal,
  children,
}: {
  principal: AuthPrincipal;
  children: ReactNode;
}) {
  return (
    <div className="bg-background min-h-svh">
      <header className="bg-background/92 sticky top-0 z-30 border-b backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-5 px-5 py-4 sm:px-8">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="bg-secondary hidden rounded-full px-3 py-1.5 text-xs font-bold sm:inline-flex">
              {roleLabel[principal.role]}
            </span>
            {principal.role === "CUSTOMER" && (
              <nav
                className="hidden items-center gap-1 md:flex"
                aria-label="Navigasi Customer"
              >
                <Link
                  href="/app"
                  className="hover:bg-secondary rounded-full px-3 py-2 text-sm font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/app/orders"
                  className="hover:bg-secondary rounded-full px-3 py-2 text-sm font-bold"
                >
                  Pesanan
                </Link>
              </nav>
            )}
            {principal.role === "ADMIN" && (
              <nav
                className="hidden items-center gap-1 md:flex"
                aria-label="Navigasi Admin"
              >
                <Link
                  href="/admin"
                  className="hover:bg-secondary rounded-full px-3 py-2 text-sm font-bold"
                >
                  Dashboard
                </Link>
                <Link
                  href="/admin/orders"
                  className="hover:bg-secondary rounded-full px-3 py-2 text-sm font-bold"
                >
                  Operasi pesanan
                </Link>
              </nav>
            )}
          </div>
          <form action={logoutAction}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="size-4" aria-hidden="true" />
              Keluar
            </Button>
          </form>
        </div>
      </header>

      <main
        className={`mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16 ${
          principal.role === "ADMIN" ? "pb-28 md:pb-16" : ""
        }`}
      >
        <div className="text-muted-foreground mb-10 flex items-center gap-3 text-xs font-bold tracking-[0.18em] uppercase">
          <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full">
            <ShieldCheck className="size-4" aria-hidden="true" />
          </span>
          Area terproteksi · {roleLabel[principal.role]}
        </div>
        {children}
      </main>

      {principal.role === "ADMIN" && (
        <nav
          aria-label="Navigasi Admin seluler"
          className="bg-background/95 fixed inset-x-0 bottom-0 z-30 grid grid-cols-2 border-t px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md md:hidden"
        >
          <Link
            href="/admin"
            className="text-muted-foreground hover:text-foreground flex min-h-12 flex-col items-center justify-center gap-1 text-[0.7rem] font-extrabold"
          >
            <LayoutDashboard className="size-5" aria-hidden="true" />
            Dashboard
          </Link>
          <Link
            href="/admin/orders"
            className="text-muted-foreground hover:text-foreground flex min-h-12 flex-col items-center justify-center gap-1 text-[0.7rem] font-extrabold"
          >
            <ClipboardList className="size-5" aria-hidden="true" />
            Pesanan
          </Link>
        </nav>
      )}
    </div>
  );
}
