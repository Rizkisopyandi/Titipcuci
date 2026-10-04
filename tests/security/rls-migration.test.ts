import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const migrationsDirectory = join(process.cwd(), "supabase", "migrations");

describe("Supabase migration RLS harness", () => {
  it("requires every public table migration to enable row level security", () => {
    const migrationFiles = readdirSync(migrationsDirectory).filter((file) =>
      file.endsWith(".sql"),
    );
    const violations: string[] = [];

    for (const file of migrationFiles) {
      const sql = readFileSync(
        join(migrationsDirectory, file),
        "utf8",
      ).toLowerCase();
      const tableMatches = [
        ...sql.matchAll(
          /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/g,
        ),
      ];

      for (const match of tableMatches) {
        const table = match[1];
        const enablePattern = new RegExp(
          `alter\\s+table\\s+(?:only\\s+)?public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
        );

        if (!enablePattern.test(sql)) {
          violations.push(`${file}: public.${table}`);
        }
      }
    }

    expect(violations, "Tabel public tanpa ENABLE ROW LEVEL SECURITY").toEqual(
      [],
    );
  });
});
