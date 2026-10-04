type JsonRecord = Record<string, unknown>;

export function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : {};
}

export function textValue(record: JsonRecord, key: string, fallback = "—") {
  const value = record[key];
  return typeof value === "string" && value.trim() ? value : fallback;
}

export function numberValue(record: JsonRecord, key: string) {
  const value = record[key];
  return typeof value === "number" ? value : null;
}
