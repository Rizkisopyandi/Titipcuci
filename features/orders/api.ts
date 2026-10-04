import { NextResponse } from "next/server";

import type { AuthPrincipal } from "@/lib/auth/session";
import { getCurrentPrincipal } from "@/lib/auth/session";

export function apiError(
  code: string,
  message: string,
  requestId: string,
  status: number,
  fieldErrors: unknown = {},
) {
  return NextResponse.json(
    { error: { code, message, fieldErrors }, meta: { requestId } },
    { status },
  );
}

export async function requireCustomerApi(
  requestId: string,
): Promise<
  { ok: true; principal: AuthPrincipal } | { ok: false; response: NextResponse }
> {
  const principal = await getCurrentPrincipal();
  if (!principal) {
    return {
      ok: false,
      response: apiError("AUTH_001", "Silakan masuk kembali.", requestId, 401),
    };
  }
  if (principal.role !== "CUSTOMER") {
    return {
      ok: false,
      response: apiError(
        "AUTH_002",
        "Anda tidak memiliki akses untuk tindakan ini.",
        requestId,
        403,
      ),
    };
  }
  return { ok: true, principal };
}
