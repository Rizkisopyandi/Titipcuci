import Image from "next/image";
import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Layers3,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { Logo } from "@/components/brand/logo";

const principles = [
  {
    icon: Sparkles,
    number: "01",
    title: "Tenang",
    description:
      "Ruang yang hangat, bersih, dan fokus pada satu tindakan utama.",
  },
  {
    icon: Layers3,
    number: "02",
    title: "Transparan",
    description:
      "Hierarki informasi membuat status dan langkah berikutnya mudah dipahami.",
  },
  {
    icon: ShieldCheck,
    number: "03",
    title: "Terjaga",
    description:
      "Fondasi aksesibilitas, privasi, dan integrasi disiapkan sejak awal.",
  },
] as const;

export default function HomePage() {
  return (
    <main>
      <section className="bg-ink text-bone relative min-h-svh overflow-hidden">
        <Image
          src="/assets/brand/titipcuci-hero.webp"
          alt="Petugas membawa tas laundry kepada pelanggan di depan rumah"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,oklch(0.12_0.01_150/.55)_0%,oklch(0.12_0.01_150/.24)_42%,oklch(0.12_0.01_150/.92)_100%)]" />

        <header className="relative z-10 mx-auto flex max-w-[82.5rem] items-center justify-between px-5 py-6 sm:px-8 lg:px-10">
          <Logo tone="light" />
          <span className="border-bone/25 bg-ink/20 rounded-full border px-4 py-2 text-[0.6875rem] font-bold tracking-[0.18em] uppercase backdrop-blur-sm">
            <span className="sm:hidden">M0</span>
            <span className="hidden sm:inline">Foundation · M0</span>
          </span>
        </header>

        <div className="relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] max-w-[82.5rem] flex-col justify-end px-5 pb-14 sm:px-8 sm:pb-20 lg:px-10 lg:pb-24">
          <div className="grid items-end gap-10 lg:grid-cols-[1.35fr_0.65fr]">
            <div className="animate-rise">
              <p className="text-bone/70 mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.22em] uppercase">
                <span className="bg-primary h-px w-8" aria-hidden="true" />
                Laundry, dibuat lebih ringan
              </p>
              <h1 className="font-display max-w-5xl text-[clamp(4rem,10vw,9rem)] leading-[0.86]">
                Kotor dititip.
                <br />
                <em className="text-primary">Baliknya bersih.</em>
              </h1>
            </div>

            <div className="animate-rise [animation-delay:180ms]">
              <p className="text-bone/78 max-w-md text-base leading-relaxed sm:text-lg">
                TitipCuci sedang menyiapkan pengalaman laundry antar-jemput yang
                terasa premium, transparan, dan mudah dipahami.
              </p>
              <a
                href="#prinsip"
                className="bg-primary text-primary-foreground mt-7 inline-flex min-h-11 items-center gap-3 rounded-full px-6 py-3.5 font-bold transition-transform hover:scale-[1.025]"
              >
                Jelajahi fondasi
                <ArrowDown className="size-4" aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="prinsip" className="px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto max-w-[82.5rem]">
          <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
            <div>
              <p className="text-muted-foreground mb-5 text-xs font-bold tracking-[0.22em] uppercase">
                Bahasa visual TitipCuci
              </p>
              <h2 className="font-display text-6xl leading-[0.92] sm:text-7xl lg:text-8xl">
                Bersih pada tampilan.
                <br />
                <em>Jelas pada tujuan.</em>
              </h2>
            </div>
            <p className="text-muted-foreground max-w-xl text-lg leading-relaxed lg:justify-self-end">
              Sistem desain mengambil arah editorial dari referensi Lovable:
              tipografi berkarakter, ruang lapang, kontras hangat, dan motion
              yang membantu orientasi.
            </p>
          </div>

          <ol className="bg-border mt-16 grid gap-px overflow-hidden rounded-3xl border md:grid-cols-3">
            {principles.map(({ icon: Icon, number, title, description }) => (
              <li key={number} className="group bg-card p-7 sm:p-9">
                <div className="flex items-center justify-between">
                  <span className="font-display text-muted-foreground/35 text-5xl">
                    {number}
                  </span>
                  <span className="bg-primary text-primary-foreground grid size-11 place-items-center rounded-full transition-transform group-hover:-rotate-6">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                </div>
                <h3 className="font-display mt-16 text-4xl">{title}</h3>
                <p className="text-muted-foreground mt-3 max-w-sm leading-relaxed">
                  {description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="bg-ink text-bone px-5 py-24 sm:px-8 sm:py-32 lg:px-10">
        <div className="mx-auto grid max-w-[82.5rem] gap-14 lg:grid-cols-[1fr_0.82fr] lg:items-center">
          <div>
            <p className="text-bone/60 mb-5 flex items-center gap-3 text-xs font-bold tracking-[0.22em] uppercase">
              <span className="bg-primary h-px w-8" aria-hidden="true" />
              Siap dikembangkan
            </p>
            <h2 className="font-display max-w-4xl text-6xl leading-[0.94] sm:text-7xl lg:text-8xl">
              Fondasi yang rapi,
              <br />
              <em className="text-primary">tanpa fitur semu.</em>
            </h2>
            <p className="text-bone/65 mt-7 max-w-xl text-lg leading-relaxed">
              App Router, strict TypeScript, Tailwind, dan batas adapter untuk
              Supabase, Mapbox, serta Midtrans sudah disiapkan. Fitur bisnis
              baru dimulai pada milestone berikutnya.
            </p>
          </div>

          <div className="bg-bone text-ink shadow-float relative overflow-hidden rounded-3xl p-3">
            <Image
              src="/assets/brand/titipcuci-package.webp"
              alt="Pakaian bersih yang terlipat dan tersegel rapi"
              width={1200}
              height={1500}
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="aspect-[4/5] w-full rounded-2xl object-cover"
            />
            <div className="bg-card/95 absolute inset-x-7 bottom-7 rounded-2xl p-5 backdrop-blur-sm">
              <p className="text-muted-foreground text-xs font-bold tracking-[0.18em] uppercase">
                Status milestone
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="font-display text-4xl">Foundation</p>
                <span className="bg-primary rounded-full px-3 py-1.5 text-xs font-bold">
                  M0
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-ink text-bone px-5 pb-12 sm:px-8 lg:px-10">
        <div className="border-bone/10 mx-auto flex max-w-[82.5rem] flex-col gap-6 border-t pt-9 sm:flex-row sm:items-center sm:justify-between">
          <Logo tone="light" />
          <p className="text-bone/55 text-sm">
            Milestone M0 · belum menerima pesanan.
          </p>
          <Link
            href="/health"
            className="text-bone/75 hover:text-bone inline-flex min-h-11 items-center gap-2 text-sm font-bold"
          >
            Status fondasi
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </main>
  );
}
