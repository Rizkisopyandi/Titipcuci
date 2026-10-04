import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleDashed } from "lucide-react";

import { getEnvironmentReadiness } from "@/lib/config/environment";

export const metadata: Metadata = {
  title: "Status fondasi",
};

export const dynamic = "force-dynamic";

export default function HealthPage() {
  const readiness = getEnvironmentReadiness(process.env);

  return (
    <main className="min-h-svh px-5 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex min-h-11 items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Kembali ke beranda
        </Link>

        <header className="mt-16 max-w-3xl">
          <p className="text-muted-foreground text-xs font-bold tracking-[0.22em] uppercase">
            Operability · REQ-OPS-001
          </p>
          <h1 className="font-display mt-5 text-6xl leading-[0.92] sm:text-8xl">
            Fondasi <em>berjalan.</em>
          </h1>
          <p className="text-muted-foreground mt-6 text-lg leading-relaxed">
            Runtime aplikasi aktif. Status integrasi hanya menunjukkan
            kelengkapan konfigurasi dan tidak pernah menampilkan nilai
            kredensial.
          </p>
        </header>

        <section aria-labelledby="integration-heading" className="mt-14">
          <h2 id="integration-heading" className="sr-only">
            Status konfigurasi integrasi
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {readiness.integrations.map((integration) => {
              const Icon = integration.configured ? CheckCircle2 : CircleDashed;

              return (
                <li
                  key={integration.name}
                  className="bg-card rounded-2xl border p-5"
                >
                  <Icon
                    className={
                      integration.configured
                        ? "text-success size-5"
                        : "text-warning size-5"
                    }
                    aria-hidden="true"
                  />
                  <p className="font-display mt-8 text-3xl">
                    {integration.name}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    {integration.configured
                      ? "Terkonfigurasi"
                      : "Menunggu environment"}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="bg-ink text-bone mt-8 rounded-2xl p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-bone/55 text-xs font-bold tracking-[0.18em] uppercase">
                Health endpoint
              </p>
              <code className="mt-2 block text-sm">GET /api/health</code>
            </div>
            <span className="bg-primary text-ink rounded-full px-3 py-1.5 text-xs font-bold">
              HTTP 200
            </span>
          </div>
        </div>
      </div>
    </main>
  );
}
