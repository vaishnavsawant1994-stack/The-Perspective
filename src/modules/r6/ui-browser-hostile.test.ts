import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { postQualifiedR6Command } from "./ui-client";

function read(path: string) {
  return readFileSync(join(process.cwd(), path), "utf8");
}

describe("R6 UI/browser hostile boundary", () => {
  it("does not submit mock slug identities to qualified APIs", () => {
    const bound = read("src/components/workspace/r6-bound-lists.tsx");
    expect(bound).not.toContain("nextpay-technologies");
    expect(bound).not.toContain("personal-magazine-q2");
    expect(bound).not.toContain("tech-leaders-q2");
    expect(bound).not.toContain("technova-premium-magazine");
  });

  it("keeps mock slug pages off the qualified client", () => {
    expect(read("src/app/app/clients/nextpay-technologies/page.tsx")).not.toContain(
      "fetchQualifiedR6List",
    );
    expect(
      read("src/app/app/outreach/campaigns/tech-leaders-q2/page.tsx"),
    ).not.toContain("postQualifiedR6Command");
  });

  it("rejects authority laundering at the UI client before fetch", async () => {
    const seen: string[] = [];
    const original = globalThis.fetch;
    globalThis.fetch = (async (_input: RequestInfo | URL, init?: RequestInit) => {
      seen.push(String(init?.body ?? ""));
      return new Response("{}", { status: 403 });
    }) as typeof fetch;
    try {
      await postQualifiedR6Command("/api/v1/r6/deals/00000000-0000-4000-8000-000000000201/move", {
        toStageId: "00000000-0000-4000-8000-000000000205",
        expectedRowVersion: 1,
        ownerOrganizationId: "org-attacker",
        organizationId: "org-attacker",
        membershipId: "membership-attacker",
        permissionKey: "deal.move",
        resourceContext: { ownerOrganizationId: "org-attacker" },
      });
    } finally {
      globalThis.fetch = original;
    }
    expect(seen).toHaveLength(1);
    expect(seen[0]).not.toMatch(/ownerOrganizationId|organizationId|permissionKey|resourceContext/);
  });

  it("does not create R7 HTTP surfaces from binding work", () => {
    const bound = read("src/components/workspace/r6-bound-lists.tsx");
    const client = read("src/modules/r6/ui-client.ts");
    for (const source of [bound, client]) {
      expect(source).not.toContain("/api/v1/r6/proposals");
      expect(source).not.toContain("/api/v1/r6/contracts");
      expect(source).not.toContain("/api/v1/r6/invoices");
      expect(source).not.toContain("/api/v1/r6/payments");
      expect(source).not.toContain("/api/v1/r6/subscriptions");
      expect(source).not.toContain("/api/v1/r6/entitlements");
    }
  });
});
