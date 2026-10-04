import type { Metadata } from "next";

import { ForgotPasswordForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";

export const metadata: Metadata = { title: "Lupa kata sandi" };
export const dynamic = "force-dynamic";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title={
        <>
          Atur ulang,
          <br />
          <em>lanjut lagi.</em>
        </>
      }
      description="Masukkan email akun. Respons dibuat netral agar keberadaan akun tidak terungkap."
    >
      <ForgotPasswordForm configured={isSupabaseAuthConfigured()} />
    </AuthShell>
  );
}
