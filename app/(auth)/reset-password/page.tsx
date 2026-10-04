import type { Metadata } from "next";

import { ResetPasswordForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";

export const metadata: Metadata = { title: "Kata sandi baru" };
export const dynamic = "force-dynamic";

export default function ResetPasswordPage() {
  return (
    <AuthShell
      eyebrow="Pemulihan akun"
      title={
        <>
          Kata sandi
          <br />
          <em>yang baru.</em>
        </>
      }
      description="Gunakan tautan pemulihan dari email, lalu buat kata sandi baru untuk akun Anda."
    >
      <ResetPasswordForm configured={isSupabaseAuthConfigured()} />
    </AuthShell>
  );
}
