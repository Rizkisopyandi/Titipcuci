import { z } from "zod";

const email = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email("Masukkan alamat email yang valid."));
const password = z
  .string()
  .min(8, "Kata sandi minimal 8 karakter.")
  .max(72, "Kata sandi maksimal 72 karakter.");

export const loginSchema = z
  .object({
    email,
    password,
    next: z.string().optional(),
  })
  .strict();

export const registrationSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Nama minimal 2 karakter.")
      .max(100, "Nama maksimal 100 karakter."),
    email,
    password,
    passwordConfirmation: z.string(),
  })
  .strict()
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["passwordConfirmation"],
  });

export const forgotPasswordSchema = z.object({ email }).strict();

export const resetPasswordSchema = z
  .object({
    password,
    passwordConfirmation: z.string(),
  })
  .strict()
  .refine((value) => value.password === value.passwordConfirmation, {
    message: "Konfirmasi kata sandi tidak cocok.",
    path: ["passwordConfirmation"],
  });
