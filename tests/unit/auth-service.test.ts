import { describe, expect, it, vi } from "vitest";

import {
  authErrorMessage,
  login,
  logout,
  registerCustomer,
} from "@/features/auth/service";

const success = {
  data: { user: { id: "user-1" }, session: { access_token: "redacted" } },
  error: null,
};

describe("authentication service", () => {
  it("registers only Customer-safe metadata and never forwards role", async () => {
    const signUp = vi.fn().mockResolvedValue(success);

    await registerCustomer(
      { signUp },
      {
        fullName: "Pelanggan TitipCuci",
        email: "customer@example.com",
        password: "rahasia-kuat",
      },
    );

    expect(signUp).toHaveBeenCalledWith({
      email: "customer@example.com",
      password: "rahasia-kuat",
      options: { data: { full_name: "Pelanggan TitipCuci" } },
    });
    expect(JSON.stringify(signUp.mock.calls)).not.toContain("role");
  });

  it("forwards login credentials to the authentication gateway", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue(success);

    const result = await login(
      { signInWithPassword },
      { email: "customer@example.com", password: "rahasia-kuat" },
    );

    expect(result.data.user?.id).toBe("user-1");
    expect(signInWithPassword).toHaveBeenCalledOnce();
  });

  it("uses local sign-out so other device sessions are not implicitly revoked", async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null });

    await logout({ signOut });

    expect(signOut).toHaveBeenCalledWith({ scope: "local" });
  });

  it("maps known provider failures without exposing raw provider messages", () => {
    expect(authErrorMessage("invalid_credentials")).toBe(
      "Email atau kata sandi tidak sesuai.",
    );
    expect(authErrorMessage("unexpected_internal_detail")).toBe(
      "Autentikasi belum dapat diproses. Coba kembali.",
    );
  });
});
