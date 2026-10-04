import { assertSafeSeedTarget } from "@/lib/safety/seed-target";

try {
  const result = assertSafeSeedTarget(process.env);
  console.log(
    JSON.stringify({ ok: true, projectRef: result.projectRef }, null, 2),
  );
} catch (error) {
  const message =
    error instanceof Error ? error.message : "Validasi target seed gagal.";
  console.error(JSON.stringify({ ok: false, error: message }, null, 2));
  process.exitCode = 1;
}
