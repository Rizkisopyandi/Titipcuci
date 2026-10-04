import type { ReactNode } from "react";

import { ProtectedShell } from "@/components/app/protected-shell";
import { requireArea } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const principal = await requireArea("admin");
  return <ProtectedShell principal={principal}>{children}</ProtectedShell>;
}
