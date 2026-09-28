import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { postQualifiedR6Command } from "./ui-client";

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), "utf8");
}

const boundPages = [
  "src/app/app/deals/page.tsx",
  "src/app/app/sales/leads/page.tsx",
  "src/app/app/inbox/page.tsx",
  "src/app/app/meetings/page.tsx",
  "src/app/app/outreach/page.tsx",
  "src/app/app/outreach/sending-accounts/page.tsx",
] as const;

describe("R6 canonical UI/API binding", () => {
  it("does not let bound R6 pages import Prisma", () => {
    for (const path of [
      ...boundPages,
      "src/components/workspace/r6-bound-lists.tsx",
      "src/modules/r6/ui-client.ts",
    ]) {
      const source = read(path);
      expect(source).not.toContain("getPrismaClient");
      expect(source).not.toContain("@/generated/prisma");
    }
  });

  it("binds authorized list screens to qualified HTTP surfaces", () => {
    const bound = read("src/components/workspace/r6-bound-lists.tsx");
    expect(read("src/app/app/deals/page.tsx")).toContain("BoundDealsPage");
    expect(read("src/app/app/sales/leads/page.tsx")).toContain("BoundLeadsPage");
    expect(read("src/app/app/inbox/page.tsx")).toContain("BoundInboxPage");
    expect(read("src/app/app/meetings/page.tsx")).toContain("BoundMeetingsPage");
    expect(read("src/app/app/outreach/page.tsx")).toContain("BoundCampaignsPage");
    expect(read("src/app/app/outreach/sending-accounts/page.tsx")).toContain(
      "BoundSendingAccountsPage",
    );
    for (const path of [
      "/api/v1/r6/deals",
      "/api/v1/r6/leads",
      "/api/v1/r6/commercial/pipelines",
      "/api/v1/r6/clients",
      "/api/v1/r6/inbox/conversations",
      "/api/v1/r6/meetings",
      "/api/v1/r6/outreach/campaigns",
      "/api/v1/r6/outreach/sequences",
      "/api/v1/r6/outreach/sending-accounts",
    ]) {
      expect(bound).toContain(path);
    }
  });

  it("leaves mock slug client pages unbound so mock IDs cannot mutate production", () => {
    expect(read("src/app/app/clients/nextpay-technologies/page.tsx")).not.toContain(
      "/api/v1/r6/clients",
    );
    expect(
      read("src/app/app/outreach/sequences/personal-magazine-q2/page.tsx"),
    ).not.toContain("/api/v1/r6/outreach/sequences");
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
    for (const path of [
      "src/app/app/deals/proposals/page.tsx",
      "src/app/app/commercial/contracts/page.tsx",
      "src/app/app/commercial/invoices/page.tsx",
      "src/app/app/commercial/payments/page.tsx",
    ]) {
      const source = read(path);
      expect(source).not.toContain("/api/v1/r6/proposals");
      expect(source).not.toContain("/api/v1/r6/contracts");
      expect(source).not.toContain("/api/v1/r6/invoices");
      expect(source).not.toContain("/api/v1/r6/payments");
      expect(source).not.toContain("/api/v1/r6/subscriptions");
    }
  });
});
