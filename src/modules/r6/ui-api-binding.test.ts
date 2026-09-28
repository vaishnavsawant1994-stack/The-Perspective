import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { postQualifiedR6Command } from "./ui-client";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

describe("R6 canonical UI/API binding", () => {
  it("does not let workspace R6 list pages import Prisma", () => {
    for (const path of [
      "src/app/app/deals/page.tsx",
      "src/app/app/sales/leads/page.tsx",
      "src/components/workspace/r6-bound-lists.tsx",
      "src/modules/r6/ui-client.ts",
    ]) {
      const source = read(path);
      expect(source).not.toContain("getPrismaClient");
      expect(source).not.toContain("@/generated/prisma");
    }
  });

  it("binds deals and leads pages to qualified HTTP surfaces", () => {
    expect(read("src/app/app/deals/page.tsx")).toContain("BoundDealsPage");
    expect(read("src/app/app/sales/leads/page.tsx")).toContain("BoundLeadsPage");
    expect(read("src/components/workspace/r6-bound-lists.tsx")).toContain(
      "/api/v1/r6/deals",
    );
    expect(read("src/components/workspace/r6-bound-lists.tsx")).toContain(
      "/api/v1/r6/leads",
    );
  });

  it("strips browser-supplied tenant authority from mutations", async () => {
    const calls: Array<{ url: string; body: string }> = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push({
        url: String(input),
        body: typeof init?.body === "string" ? init.body : "",
      });
      return new Response("{}", { status: 403 });
    }) as typeof fetch;
    try {
      await postQualifiedR6Command("/api/v1/r6/deals", {
        pipelineId: "00000000-0000-4000-8000-000000000203",
        companyId: "00000000-0000-4000-8000-000000000204",
        ownerOrganizationId: "org-attacker",
        organizationId: "org-attacker",
        permissionKey: "deal.manage",
      });
    } finally {
      globalThis.fetch = original;
    }
    expect(calls).toHaveLength(1);
    expect(calls[0]?.body).not.toContain("ownerOrganizationId");
    expect(calls[0]?.body).not.toContain("organizationId");
    expect(calls[0]?.body).not.toContain("permissionKey");
  });

  it("does not bind R7 commercial screens to live R6 APIs", () => {
    const dealsProposals = read("src/app/app/deals/proposals/page.tsx");
    const contracts = read("src/app/app/commercial/contracts/page.tsx");
    const invoices = read("src/app/app/commercial/invoices/page.tsx");
    for (const source of [dealsProposals, contracts, invoices]) {
      expect(source).not.toContain("/api/v1/r6/proposals");
      expect(source).not.toContain("/api/v1/r6/contracts");
      expect(source).not.toContain("/api/v1/r6/invoices");
    }
  });
});
