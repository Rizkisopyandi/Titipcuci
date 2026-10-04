import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  tone?: "dark" | "light";
};

export function Logo({ className, tone = "dark" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="TitipCuci beranda"
      className={cn(
        "inline-flex min-h-11 items-center gap-2 font-bold tracking-tight",
        tone === "light" ? "text-bone" : "text-foreground",
        className,
      )}
    >
      <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full">
        <svg
          viewBox="0 0 24 24"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M5 13c2.5 3 11.5 3 14 0" />
          <path d="M8 8.5h.01M16 8.5h.01" />
        </svg>
      </span>
      <span className="text-lg">
        Titip
        <span className="font-display text-xl font-normal italic">Cuci</span>
      </span>
    </Link>
  );
}
