import { CheckCircle2, Construction } from "lucide-react";

import type { AuthPrincipal } from "@/lib/auth/session";

export function RoleHome({
  principal,
  title,
  description,
}: {
  principal: AuthPrincipal;
  title: string;
  description: string;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-start">
      <section>
        <p className="text-muted-foreground text-sm font-bold">
          Halo, {principal.fullName ?? "pengguna TitipCuci"}
        </p>
        <h1 className="font-display mt-4 text-6xl leading-[0.92] sm:text-8xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-6 max-w-2xl text-lg leading-relaxed">
          {description}
        </p>
      </section>

      <aside className="bg-ink text-bone shadow-float rounded-3xl p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-bone/55 text-xs font-bold tracking-[0.18em] uppercase">
            Milestone aktif
          </p>
          <span className="bg-primary text-ink rounded-full px-3 py-1 text-xs font-bold">
            M1
          </span>
        </div>
        <ul className="mt-8 space-y-4 text-sm">
          <li className="flex gap-3">
            <CheckCircle2
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Session dan role diverifikasi server-side.
          </li>
          <li className="flex gap-3">
            <CheckCircle2
              className="text-primary mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Area role lain tidak dapat diakses.
          </li>
          <li className="text-bone/65 flex gap-3">
            <Construction
              className="mt-0.5 size-4 shrink-0"
              aria-hidden="true"
            />
            Fitur operasional dimulai pada milestone berikutnya.
          </li>
        </ul>
      </aside>
    </div>
  );
}
