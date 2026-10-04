import { describe, expect, it } from "vitest";

import {
  loginSchema,
  registrationSchema,
  resetPasswordSchema,
} from "@/features/auth/schemas";

describe("authentication schemas", () => {
  it("normalizes valid login input", () => {
    const result = loginSchema.parse({
      email: "  Customer@Example.com ",
      password: "rahasia-kuat",
      next: "/app",
    });

    expect(result.email).toBe("customer@example.com");
  });

  it("accepts a valid Customer registration payload", () => {
    const result = registrationSchema.safeParse({
      fullName: "Pelanggan TitipCuci",
      email: "customer@example.com",
      password: "rahasia-kuat",
      passwordConfirmation: "rahasia-kuat",
    });

    expect(result.success).toBe(true);
  });

  it.each(["OWNER", "ADMIN", "CUSTOMER"])(
    "rejects a client-supplied %s role",
    (role) => {
      const result = registrationSchema.safeParse({
        fullName: "Pelanggan TitipCuci",
        email: "customer@example.com",
        password: "rahasia-kuat",
        passwordConfirmation: "rahasia-kuat",
        role,
      });

      expect(result.success).toBe(false);
    },
  );

  it("rejects non-matching password confirmation", () => {
    const result = resetPasswordSchema.safeParse({
      password: "rahasia-kuat",
      passwordConfirmation: "berbeda-sekali",
    });

    expect(result.success).toBe(false);
  });
});
