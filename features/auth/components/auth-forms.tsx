"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  INITIAL_AUTH_ACTION_STATE,
  type AuthActionState,
} from "@/features/auth/action-state";
import {
  forgotPasswordAction,
  loginAction,
  registerAction,
  resetPasswordAction,
} from "@/features/auth/actions";

function SubmitButton({
  children,
  disabled,
}: {
  children: string;
  disabled?: boolean;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="lg"
      className="w-full"
      disabled={disabled || pending}
    >
      {pending ? "Memproses…" : children}
    </Button>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  errors,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  errors?: string[];
}) {
  const errorId = `${name}-error`;
  return (
    <div>
      <label htmlFor={name} className="mb-2 block text-sm font-bold">
        {label}
      </label>
      <Input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={Boolean(errors?.length)}
        aria-describedby={errors?.length ? errorId : undefined}
      />
      {errors?.length ? (
        <p id={errorId} className="text-destructive mt-2 text-sm">
          {errors[0]}
        </p>
      ) : null}
    </div>
  );
}

function FormMessage({ state }: { state: AuthActionState }) {
  if (!state.message) return null;
  return (
    <div
      role={state.status === "error" ? "alert" : "status"}
      className={
        state.status === "error"
          ? "bg-destructive/10 text-destructive rounded-xl p-4 text-sm"
          : "bg-primary/20 text-foreground rounded-xl p-4 text-sm"
      }
    >
      {state.message}
    </div>
  );
}

export function LoginForm({
  configured,
  next,
  initialMessage,
  initialError,
}: {
  configured: boolean;
  next?: string;
  initialMessage?: string;
  initialError?: string;
}) {
  const [state, action] = useActionState(loginAction, {
    ...INITIAL_AUTH_ACTION_STATE,
    ...(initialError
      ? { status: "error" as const, message: initialError }
      : initialMessage
        ? { status: "success" as const, message: initialMessage }
        : {}),
  });

  return (
    <form action={action} className="min-w-0 space-y-5">
      <input type="hidden" name="next" value={next ?? ""} />
      {!configured ? (
        <FormMessage
          state={{
            status: "error",
            message:
              "Supabase Project URL belum dikonfigurasi. Login live belum tersedia.",
          }}
        />
      ) : (
        <FormMessage state={state} />
      )}
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        errors={state.fieldErrors?.email}
      />
      <div>
        <div className="mb-2 flex items-center justify-between gap-4">
          <label htmlFor="password" className="text-sm font-bold">
            Kata sandi
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-bold hover:underline"
          >
            Lupa kata sandi?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={Boolean(state.fieldErrors?.password?.length)}
        />
      </div>
      <SubmitButton disabled={!configured}>Masuk</SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="text-foreground font-bold hover:underline"
        >
          Daftar sebagai Customer
        </Link>
      </p>
    </form>
  );
}

export function RegistrationForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState(
    registerAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  return (
    <form action={action} className="min-w-0 space-y-5">
      {!configured ? (
        <FormMessage
          state={{
            status: "error",
            message:
              "Supabase Project URL belum dikonfigurasi. Registrasi live belum tersedia.",
          }}
        />
      ) : (
        <FormMessage state={state} />
      )}
      <Field
        label="Nama lengkap"
        name="fullName"
        autoComplete="name"
        errors={state.fieldErrors?.fullName}
      />
      <Field
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        errors={state.fieldErrors?.email}
      />
      <Field
        label="Kata sandi"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Ulangi kata sandi"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.passwordConfirmation}
      />
      <p className="text-muted-foreground text-xs leading-relaxed">
        Registrasi publik selalu membuat akun Customer. Role Admin dan Owner
        tidak dapat dipilih dari halaman ini.
      </p>
      <SubmitButton disabled={!configured}>Buat akun Customer</SubmitButton>
      <p className="text-muted-foreground text-center text-sm">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="text-foreground font-bold hover:underline"
        >
          Masuk
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState(
    forgotPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  return (
    <form action={action} className="min-w-0 space-y-5">
      {!configured ? (
        <FormMessage
          state={{
            status: "error",
            message:
              "Supabase Project URL belum dikonfigurasi. Reset live belum tersedia.",
          }}
        />
      ) : (
        <FormMessage state={state} />
      )}
      <Field
        label="Email akun"
        name="email"
        type="email"
        autoComplete="email"
        errors={state.fieldErrors?.email}
      />
      <SubmitButton disabled={!configured}>Kirim instruksi</SubmitButton>
      <Link
        href="/login"
        className="block text-center text-sm font-bold hover:underline"
      >
        Kembali ke login
      </Link>
    </form>
  );
}

export function ResetPasswordForm({ configured }: { configured: boolean }) {
  const [state, action] = useActionState(
    resetPasswordAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  return (
    <form action={action} className="min-w-0 space-y-5">
      {!configured ? (
        <FormMessage
          state={{
            status: "error",
            message:
              "Supabase Project URL belum dikonfigurasi. Reset live belum tersedia.",
          }}
        />
      ) : (
        <FormMessage state={state} />
      )}
      <Field
        label="Kata sandi baru"
        name="password"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.password}
      />
      <Field
        label="Ulangi kata sandi baru"
        name="passwordConfirmation"
        type="password"
        autoComplete="new-password"
        errors={state.fieldErrors?.passwordConfirmation}
      />
      <SubmitButton disabled={!configured}>Simpan kata sandi</SubmitButton>
    </form>
  );
}
