import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const TABLES = [
  "products",
  "proposals",
  "proposal_versions",
  "proposal_lines",
  "invoices",
  "payments",
  "ledger_entries",
  "subscriptions",
  "entitlements",
] as const;

describe("R7 schema/migration parity", () => {
  const migration = readFileSync(
    join(process.cwd(), "prisma/migrations/20260928213000_r7_finance_foundation/migration.sql"),
    "utf8",
  );
  const models = readFileSync(join(process.cwd(), "prisma/r7-models.prisma"), "utf8");

  it("creates exactly the authorized finance tables", () => {
    for (const table of TABLES) {
      expect(migration).toContain(`\"commercial\".\"${table}\"`);
      expect(models).toContain(`@@map("${table}")`);
    }
    expect(migration).not.toContain("editorial_works");
    expect(models).not.toContain("EditorialWork");
  });

  it("keeps money as integer minor units and explicit currency", () => {
    expect(models).toContain("unitAmountMinor     BigInt");
    expect(models).toContain("totalMinor          BigInt");
    expect(models).toContain("@db.Char(3)");
    expect(models).not.toContain("Float");
    expect(migration).toContain("unit_amount_minor\" BIGINT");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
  });
});
