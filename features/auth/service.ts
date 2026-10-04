type AuthResult = {
  data: { user: { id: string } | null; session: unknown | null };
  error: { message: string; code?: string } | null;
};

export type RegistrationGateway = {
  signUp(input: {
    email: string;
    password: string;
    options: { data: { full_name: string } };
  }): Promise<AuthResult>;
};

export type LoginGateway = {
  signInWithPassword(input: {
    email: string;
    password: string;
  }): Promise<AuthResult>;
};

export type LogoutGateway = {
  signOut(input: {
    scope: "local";
  }): Promise<{ error: { message: string } | null }>;
};

export function registerCustomer(
  gateway: RegistrationGateway,
  input: { fullName: string; email: string; password: string },
) {
  return gateway.signUp({
    email: input.email,
    password: input.password,
    options: { data: { full_name: input.fullName } },
  });
}

export function login(
  gateway: LoginGateway,
  input: { email: string; password: string },
) {
  return gateway.signInWithPassword(input);
}

export function logout(gateway: LogoutGateway) {
  return gateway.signOut({ scope: "local" });
}

export function authErrorMessage(code?: string) {
  if (code === "invalid_credentials")
    return "Email atau kata sandi tidak sesuai.";
  if (code === "email_not_confirmed") return "Konfirmasi email sebelum masuk.";
  if (code === "user_already_exists")
    return "Akun dengan email tersebut sudah terdaftar.";
  if (code === "over_email_send_rate_limit") {
    return "Terlalu banyak permintaan email. Coba kembali beberapa saat lagi.";
  }
  return "Autentikasi belum dapat diproses. Coba kembali.";
}
