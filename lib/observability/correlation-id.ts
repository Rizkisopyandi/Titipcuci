import { randomUUID } from "node:crypto";

const safeCorrelationId = /^[A-Za-z0-9._-]{8,128}$/;

export function getCorrelationId(headers: Headers) {
  const incomingId = headers.get("x-request-id")?.trim();
  return incomingId && safeCorrelationId.test(incomingId)
    ? incomingId
    : randomUUID();
}
