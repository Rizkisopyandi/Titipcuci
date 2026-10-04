export function sanitizeRedirectPath(value: unknown, fallback = "/") {
  if (typeof value !== "string") return fallback;

  const candidate = value.trim();
  if (
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    candidate.includes("\r") ||
    candidate.includes("\n")
  ) {
    return fallback;
  }

  try {
    const parsed = new URL(candidate, "https://titipcuci.local");
    return parsed.origin === "https://titipcuci.local"
      ? `${parsed.pathname}${parsed.search}${parsed.hash}`
      : fallback;
  } catch {
    return fallback;
  }
}
