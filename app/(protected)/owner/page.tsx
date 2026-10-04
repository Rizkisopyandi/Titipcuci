import type { Metadata } from "next";

import { RoleHome } from "@/components/app/role-home";
import { requireArea } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Area Owner" };

export default async function OwnerHomePage() {
  const principal = await requireArea("owner");
  return (
    <RoleHome
      principal={principal}
      title="Ruang tata kelola"
      description="Area ini hanya menerima role Owner. Analytics, master data, dan pengelolaan Admin tetap berada di milestone berikutnya."
    />
  );
}
