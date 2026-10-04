import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { Logo } from "@/components/brand/logo";

type AuthShellProps = {
  eyebrow: string;
  title: ReactNode;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <main className="bg-background grid min-h-svh min-w-0 overflow-x-hidden lg:grid-cols-[0.92fr_1.08fr]">
      <section className="flex min-h-svh min-w-0 flex-col px-5 py-6 sm:px-10 lg:px-14">
        <div className="flex items-center justify-between">
          <Logo />
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground min-h-11 rounded-full px-4 py-3 text-sm font-bold"
          >
            Beranda
          </Link>
        </div>

        <div className="mx-auto flex w-full max-w-md min-w-0 flex-1 flex-col justify-center py-14">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.22em] uppercase">
            {eyebrow}
          </p>
          <h1 className="font-display mt-5 text-5xl leading-[0.94] sm:text-7xl sm:leading-[0.92]">
            {title}
          </h1>
          <p className="text-muted-foreground mt-5 max-w-sm leading-relaxed">
            {description}
          </p>
          <div className="mt-9">{children}</div>
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          Kami jemput, kami cuci, kami balikin.
        </p>
      </section>

      <aside className="bg-ink relative hidden overflow-hidden lg:block">
        <Image
          src="/assets/brand/titipcuci-package.webp"
          alt="Pakaian bersih yang terlipat dan tersegel rapi"
          fill
          priority
          sizes="55vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.12_0.01_150/.08),oklch(0.12_0.01_150/.72))]" />
        <div className="text-bone absolute inset-x-0 bottom-0 p-14">
          <p className="text-bone/65 text-xs font-bold tracking-[0.22em] uppercase">
            TitipCuci
          </p>
          <p className="font-display mt-4 max-w-xl text-6xl leading-[0.94]">
            Satu akun untuk perjalanan laundry yang{" "}
            <em className="text-primary">jelas.</em>
          </p>
        </div>
      </aside>
    </main>
  );
}
