import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const proposalApiRoot = join(process.cwd(), "src/app/api/v1/r7/proposals");

describe("R7 Proposal API boundary", () => {
  it("exposes list and detail as read-only adapters through the R7 request boundary", () => {
    const list = readFileSync(join(proposalApiRoot, "route.ts"), "utf8");
    const detail = readFileSync(join(proposalApiRoot, "[proposalId]/route.ts"), "utf8");
    for (const source of [list, detail]) {
      expect(source).toContain("resolveR7TeamRequest");
      expect(source).toContain("unavailableR7Request");
      expect(source).not.toMatch(/export async function (POST|PATCH|PUT|DELETE)/u);
      expect(source).not.toContain("status =");
    }
    expect(list).toContain("listAuthorizedProposals");
    expect(detail).toContain("getAuthorizedProposal");
  });

  it("does not expose a customer acceptance route before the authority contract is resolved", () => {
    const exists = readdirSync(proposalApiRoot).some((entry) =>
      entry.includes("accept"),
    );
    expect(exists).toBe(false);
  });
});
