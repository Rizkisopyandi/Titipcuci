const PROTECTED_PREFIXES = ["/app", "/admin", "/owner"] as const;

export function isProtectedPath(pathname: string) {
  return PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function protectedLoginDestination(pathname: string, search = "") {
  return `${pathname}${search}`;
}
