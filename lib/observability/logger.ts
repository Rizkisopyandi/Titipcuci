const redactedKeys = new Set([
  "authorization",
  "cookie",
  "password",
  "token",
  "accessToken",
  "serverKey",
  "serviceRoleKey",
  "signedUrl",
  "latitude",
  "longitude",
  "address",
]);

export function redactLogValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(redactLogValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        redactedKeys.has(key) ? "[REDACTED]" : redactLogValue(nestedValue),
      ]),
    );
  }

  return value;
}

function write(level: "info" | "warn" | "error", event: string, context = {}) {
  const entry = JSON.stringify(
    redactLogValue({
      timestamp: new Date().toISOString(),
      level,
      event,
      ...context,
    }),
  );

  if (level === "error") {
    console.error(entry);
    return;
  }

  if (level === "warn") {
    console.warn(entry);
    return;
  }

  console.info(entry);
}

export const logger = {
  info: (event: string, context?: Record<string, unknown>) =>
    write("info", event, context),
  warn: (event: string, context?: Record<string, unknown>) =>
    write("warn", event, context),
  error: (event: string, context?: Record<string, unknown>) =>
    write("error", event, context),
};
