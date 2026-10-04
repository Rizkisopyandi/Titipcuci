import type { Metadata } from "next";

import { RegistrationForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";
import { redirectAuthenticatedPrincipal } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Daftar Customer" };
export const dynamic = "force-dynamic";

export default async function RegisterPage() {
  await redirectAuthenticatedPrincipal();
  return (
    <AuthShell
      eyebrow="Akun Customer"
      title={
        <>
          Mulai dengan <em>tenang.</em>
        </>
      }
      description="Registrasi publik khusus Customer. Admin dan Owner dibuat melalui mekanisme terkontrol, bukan dari browser."
    >
      <RegistrationForm configured={isSupabaseAuthConfigured()} />
    </AuthShell>
  );
}
