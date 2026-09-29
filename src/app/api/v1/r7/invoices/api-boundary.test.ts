import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const invoiceApiRoot = join(process.cwd(), "src/app/api/v1/r7/invoices");
function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? routeFiles(path)
      : entry.name === "route.ts"
        ? [relative(invoiceApiRoot, path).replaceAll("\\\\", "/")]
        : [];
  }).sort();
}

describe("R7 Invoice API boundary", () => {
  it("exposes only tenant-scoped reads until mutation contracts are implemented", () => {
    expect(routeFiles(invoiceApiRoot)).toEqual(["[invoiceId]/route.ts", "route.ts"]);
    const collection = readFileSync(join(invoiceApiRoot, "route.ts"), "utf8");
    const detail = readFileSync(join(invoiceApiRoot, "[invoiceId]/route.ts"), "utf8");
    for (const route of [collection, detail]) {
      expect(route).toMatch(/export async function GET/u);
      expect(route).not.toMatch(/export async function (POST|PATCH|PUT|DELETE)/u);
      expect(route).toContain("resolveR7TeamRequest");
      expect(route).toContain("AuthorizedInvoice");
    }
  });
});
