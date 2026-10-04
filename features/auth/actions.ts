"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/adapters/supabase/server";
import { isSupabaseAuthConfigured } from "@/lib/auth/config";
import { destinationForRole, isUserRole } from "@/lib/auth/roles";
import { sanitizeRedirectPath } from "@/lib/auth/safe-redirect";
import { getPublicEnvironment } from "@/lib/config/public-env";
import { getCorrelationId } from "@/lib/observability/correlation-id";
import { logger } from "@/lib/observability/logger";
import type { AuthActionState, AuthField } from "@/features/auth/action-state";
import {
  forgotPasswordSchema,
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";
import {
  authErrorMessage,
  login,
  logout,
  registerCustomer,
} from "@/features/auth/service";

function fieldValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value : "";
}

function validationError(error: {
  flatten(): { fieldErrors: Record<string, string[] | undefined> };
}): AuthActionState {
  const { fieldErrors } = error.flatten();
  return {
    status: "error",
    message: "Periksa kembali data yang diisi.",
    fieldErrors: fieldErrors as Partial<Record<AuthField, string[]>>,
  };
}

async function actionRequestId() {
  return getCorrelationId(await headers());
}

const unavailableState: AuthActionState = {
  status: "error",
  message:
    "Autentikasi belum tersedia karena Supabase Project URL belum dikonfigurasi.",
};

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: fieldValue(formData, "email"),
    password: fieldValue(formData, "password"),
    next: fieldValue(formData, "next") || undefined,
  });

  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseAuthConfigured()) return unavailableState;

  const requestId = await actionRequestId();
  const supabase = await createServerSupabaseClient();
  const result = await login(
    {
      signInWithPassword: async (input) => {
        const { data, error } = await supabase.auth.signInWithPassword(input);
        return { data, error };
      },
    },
    parsed.data,
  );

  if (result.error || !result.data.user) {
    logger.warn("auth_login_failed", {
      requestId,
      errorCode: result.error?.code,
    });
    return { status: "error", message: authErrorMessage(result.error?.code) };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", result.data.user.id)
    .single();

  if (profileError || !profile || !isUserRole(profile.role)) {
    await supabase.auth.signOut({ scope: "local" });
    logger.error("auth_profile_missing", {
      requestId,
      userId: result.data.user.id,
    });
    return {
      status: "error",
      message: `Profil akun belum siap. Hubungi pengelola dengan ID permintaan ${requestId}.`,
    };
  }

  if (profile.status !== "ACTIVE") {
    await supabase.auth.signOut({ scope: "local" });
    logger.warn("auth_disabled_account_login", {
      requestId,
      userId: result.data.user.id,
    });
    return { status: "error", message: "Akun ini sedang dinonaktifkan." };
  }

  const requestedPath = sanitizeRedirectPath(parsed.data.next, "");
  redirect(destinationForRole(profile.role, requestedPath || undefined));
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registrationSchema.safeParse({
    fullName: fieldValue(formData, "fullName"),
    email: fieldValue(formData, "email"),
    password: fieldValue(formData, "password"),
    passwordConfirmation: fieldValue(formData, "passwordConfirmation"),
  });

  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseAuthConfigured()) return unavailableState;

  const requestId = await actionRequestId();
  const supabase = await createServerSupabaseClient();
  const result = await registerCustomer(
    {
      signUp: async (input) => {
        const { data, error } = await supabase.auth.signUp(input);
        return { data, error };
      },
    },
    {
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      password: parsed.data.password,
    },
  );

  if (result.error || !result.data.user) {
    logger.warn("auth_registration_failed", {
      requestId,
      errorCode: result.error?.code,
    });
    return { status: "error", message: authErrorMessage(result.error?.code) };
  }

  logger.info("auth_customer_registered", {
    requestId,
    userId: result.data.user.id,
  });

  if (result.data.session) redirect("/app");

  return {
    status: "success",
    message:
      "Akun dibuat. Periksa email untuk mengonfirmasi akun sebelum masuk.",
  };
}

export async function forgotPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: fieldValue(formData, "email"),
  });

  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseAuthConfigured()) return unavailableState;

  const requestId = await actionRequestId();
  const supabase = await createServerSupabaseClient();
  const appUrl = getPublicEnvironment().NEXT_PUBLIC_APP_URL;
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${appUrl}/auth/callback?next=/reset-password`,
    },
  );

  if (error) {
    logger.warn("auth_password_reset_request_failed", {
      requestId,
      errorCode: error.code,
    });
  }

  return {
    status: "success",
    message:
      "Jika akun tersedia, instruksi pengaturan ulang kata sandi akan dikirim ke email tersebut.",
  };
}

export async function resetPasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = resetPasswordSchema.safeParse({
    password: fieldValue(formData, "password"),
    passwordConfirmation: fieldValue(formData, "passwordConfirmation"),
  });

  if (!parsed.success) return validationError(parsed.error);
  if (!isSupabaseAuthConfigured()) return unavailableState;

  const requestId = await actionRequestId();
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "error",
      message: "Tautan pengaturan ulang tidak valid atau sudah kedaluwarsa.",
    };
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password,
  });
  if (error) {
    logger.warn("auth_password_update_failed", {
      requestId,
      errorCode: error.code,
    });
    return { status: "error", message: authErrorMessage(error.code) };
  }

  logger.info("auth_password_updated", { requestId, userId: user.id });
  redirect("/login?message=password_updated");
}

export async function logoutAction() {
  if (isSupabaseAuthConfigured()) {
    const requestId = await actionRequestId();
    const supabase = await createServerSupabaseClient();
    const result = await logout({
      signOut: (input) => supabase.auth.signOut(input),
    });
    if (result.error) logger.warn("auth_logout_failed", { requestId });
  }

  redirect("/login?message=signed_out");
}
