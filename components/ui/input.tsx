import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      className={cn(
        "border-input bg-card text-foreground placeholder:text-muted-foreground min-h-12 w-full rounded-xl border px-4 py-3 text-base shadow-sm transition-[border-color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm",
        "focus-visible:border-ring focus-visible:ring-ring/25 focus-visible:ring-4",
        "aria-invalid:border-destructive aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
}
