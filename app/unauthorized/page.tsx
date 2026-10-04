import Link from "next/link";
import { ShieldX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROLE_HOME } from "@/lib/auth/roles";
import { getCurrentPrincipal } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function UnauthorizedPage() {
  const principal = await getCurrentPrincipal();
  const destination = principal ? ROLE_HOME[principal.role] : "/login";

  return (
    <main className="grid min-h-svh place-items-center px-5 py-12">
      <div className="max-w-xl text-center">
        <span className="bg-destructive/10 text-destructive mx-auto grid size-14 place-items-center rounded-full">
          <ShieldX className="size-6" aria-hidden="true" />
        </span>
        <p className="text-muted-foreground mt-8 text-xs font-bold tracking-[0.2em] uppercase">
          Akses ditolak
        </p>
        <h1 className="font-display mt-4 text-6xl">
          Area ini bukan untuk role Anda.
        </h1>
        <p className="text-muted-foreground mt-5">
          Kembali ke area akun yang sesuai. Menyembunyikan navigasi tidak
          digunakan sebagai pengganti otorisasi server.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href={destination}>Kembali ke area saya</Link>
        </Button>
      </div>
    </main>
  );
}
