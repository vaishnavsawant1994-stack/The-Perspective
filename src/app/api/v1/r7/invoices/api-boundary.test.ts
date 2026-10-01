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
        ? [relative(invoiceApiRoot, path).replaceAll("\\", "/")]
        : [];
  }).sort();
}

describe("R7 Invoice API boundary", () => {
  it("exposes qualified reads, draft create, invoice.issue, and invoice.send only", () => {
    expect(routeFiles(invoiceApiRoot)).toEqual([
      "[invoiceId]/issue/route.ts",
      "[invoiceId]/route.ts",
      "[invoiceId]/send/route.ts",
      "route.ts",
    ]);
    const collection = readFileSync(join(invoiceApiRoot, "route.ts"), "utf8");
    const detail = readFileSync(join(invoiceApiRoot, "[invoiceId]/route.ts"), "utf8");
    const issue = readFileSync(join(invoiceApiRoot, "[invoiceId]/issue/route.ts"), "utf8");
    const send = readFileSync(join(invoiceApiRoot, "[invoiceId]/send/route.ts"), "utf8");
    expect(collection).toMatch(/export async function GET/u);
    expect(collection).toMatch(/export async function POST/u);
    expect(collection).not.toMatch(/export async function (PATCH|PUT|DELETE)/u);
    expect(collection).toContain("createInvoiceDraft");
    expect(collection).toContain("invoice.edit");
    expect(collection).not.toContain("issueInvoice");
    expect(detail).toMatch(/export async function GET/u);
    expect(detail).not.toMatch(/export async function (POST|PATCH|PUT|DELETE)/u);
    expect(issue).toMatch(/export async function POST/u);
    expect(issue).not.toMatch(/export async function (GET|PATCH|PUT|DELETE)/u);
    expect(issue).toContain("issueInvoice");
    expect(issue).toContain('permissionKey: "invoice.issue"');
    expect(issue).toContain('action: "issue"');
    expect(issue).not.toMatch(/action:\s*"finalize"/u);
    expect(issue).not.toContain("invoice.send");
    expect(send).toMatch(/export async function POST/u);
    expect(send).not.toMatch(/export async function (GET|PATCH|PUT|DELETE)/u);
    expect(send).toContain("sendInvoice");
    expect(send).toContain('permissionKey: "invoice.send"');
    expect(send).not.toContain("issueInvoice");
    for (const route of [collection, detail, issue, send]) {
      expect(route).not.toContain("addInvoiceLine");
      expect(route).not.toContain("payment.");
    }
  });
});
