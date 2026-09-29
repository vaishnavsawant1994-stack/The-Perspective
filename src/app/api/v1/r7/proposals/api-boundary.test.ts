import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const proposalApiRoot = join(process.cwd(), "src/app/api/v1/r7/proposals");

describe("R7 Proposal API boundary", () => {
  it("exposes list/detail reads and explicit draft creation only", () => {
    const list = readFileSync(join(proposalApiRoot, "route.ts"), "utf8");
    const detail = readFileSync(join(proposalApiRoot, "[proposalId]/route.ts"), "utf8");
    expect(list).toContain("resolveR7TeamRequest");
    expect(list).toContain("unavailableR7Request");
    expect(list).toContain("listAuthorizedProposals");
    expect(list).toContain("createDraftProposal");
    expect(list).toContain('permissionKey: "proposal.edit"');
    expect(list).toMatch(/export async function POST/u);
    expect(list).not.toMatch(/export async function (PATCH|PUT|DELETE)/u);
    expect(list).not.toContain("status =");
    expect(detail).toContain("resolveR7TeamRequest");
    expect(detail).toContain("unavailableR7Request");
    expect(detail).toContain("getAuthorizedProposal");
    expect(detail).not.toMatch(/export async function (POST|PATCH|PUT|DELETE)/u);
    expect(detail).not.toContain("status =");
  });

  it("does not expose a customer acceptance route before the authority contract is resolved", () => {
    const exists = readdirSync(proposalApiRoot).some((entry) =>
      entry.includes("accept"),
    );
    expect(exists).toBe(false);
  });
});
