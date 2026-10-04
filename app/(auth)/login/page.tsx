import type { Metadata } from "next";

import { LoginForm } from "@/features/auth/components/auth-forms";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import { redirectAuthenticatedPrincipal } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Masuk" };
export const dynamic = "force-dynamic";

const messages: Record<string, string> = {
  signed_out: "Anda sudah keluar dengan aman.",
  password_updated: "Kata sandi berhasil diperbarui. Silakan masuk kembali.",
};

const errors: Record<string, string> = {
  auth_unavailable:
    "Autentikasi belum tersedia karena konfigurasi Supabase belum lengkap.",
  invalid_callback: "Tautan autentikasi tidak valid atau sudah kedaluwarsa.",
  profile_unavailable: "Profil akun belum siap. Hubungi pengelola aplikasi.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await redirectAuthenticatedPrincipal();
  const params = await searchParams;
  const next = sanitizeRedirectPath(params.next, "");
  const messageKey = typeof params.message === "string" ? params.message : "";
  const errorKey = typeof params.error === "string" ? params.error : "";

  return (
    <AuthShell
      eyebrow="Akses akun"
      title={
        <>
          Selamat <em>datang kembali.</em>
        </>
      }
      description="Masuk dengan akun TitipCuci. Area tujuan ditentukan dari role yang tersimpan aman di server."
    >
      <LoginForm
        configured={isSupabaseAuthConfigured()}
        next={next || undefined}
        initialMessage={messages[messageKey]}
        initialError={errors[errorKey]}
      />
    </AuthShell>
  );
}
