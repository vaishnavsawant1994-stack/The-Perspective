import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const proposalApiRoot = join(process.cwd(), "src/app/api/v1/r7/proposals");

function routeFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory()
      ? routeFiles(path)
      : entry.name === "route.ts"
        ? [relative(proposalApiRoot, path).replaceAll("\\\\", "/")]
        : [];
  }).sort();
}

function readRoute(path: string) {
  return readFileSync(join(proposalApiRoot, path), "utf8");
}

describe("R7 whole Proposal API boundary", () => {
  it("exposes only the frozen read and explicit command routes", () => {
    expect(routeFiles(proposalApiRoot)).toEqual([
      "[proposalId]/accept/route.ts",
      "[proposalId]/edit/route.ts",
      "[proposalId]/route.ts",
      "[proposalId]/send/route.ts",
      "route.ts",
    ]);

    const collection = readRoute("route.ts");
    const detail = readRoute("[proposalId]/route.ts");
    const edit = readRoute("[proposalId]/edit/route.ts");
    const send = readRoute("[proposalId]/send/route.ts");
    const accept = readRoute("[proposalId]/accept/route.ts");

    expect(collection).toContain("listAuthorizedProposals");
    expect(collection).toContain("createDraftProposal");
    expect(collection).toContain('permissionKey: "proposal.edit"');
    expect(collection).toMatch(/export async function GET/u);
    expect(collection).toMatch(/export async function POST/u);
    expect(detail).toContain("getAuthorizedProposal");
    expect(detail).toMatch(/export async function GET/u);
    expect(detail).not.toMatch(/export async function (POST|PATCH|PUT|DELETE)/u);

    for (const route of [collection, edit, send, accept]) {
      expect(route).toContain("requireSameOrigin");
      expect(route).toContain("authorizeTrustedHttpOperation");
      expect(route).not.toMatch(/export async function (PATCH|PUT|DELETE)/u);
    }
    expect(edit).toContain("editDraftProposal");
    expect(edit).toContain('permissionKey: "proposal.edit"');
    expect(send).toContain("sendProposal");
    expect(send).toContain('permissionKey: "proposal.send"');
    expect(accept).toContain("acceptProposal");
    expect(accept).toContain("resolveR7ClientRequest");
    expect(accept).toContain('permissionKey: "proposal.accept"');
    expect(accept).not.toContain("proposal.approve");
  });

  it("keeps lifecycle changes behind explicit commands, never generic status mutation", () => {
    const allRoutes = routeFiles(proposalApiRoot).map(readRoute);
    for (const route of allRoutes) {
      expect(route).not.toMatch(/export async function (PATCH|PUT|DELETE)/u);
    }
    expect(readRoute("[proposalId]/accept/route.ts")).toContain("action: \"accept\"");
    expect(readRoute("[proposalId]/send/route.ts")).toContain("action: \"send\"");
    expect(readRoute("[proposalId]/edit/route.ts")).toContain("action: \"edit\"");
    expect(readRoute("route.ts")).toContain("action: \"create\"");
  });

  it("retains a hostile test suite for every route family and the customer trust boundary", () => {
    const hostileSuites = [
      ["http-hostile.test.ts", ["unauthenticated list request", "unauthenticated detail request", "foreign proposal"]],
      ["create-http-hostile.test.ts", ["wrong origin", "anonymous session", "authority-bearing fields", "authorization is denied"]],
      ["[proposalId]/edit/route.test.ts", ["wrong origin", "CLIENT identity", "foreign or missing proposal", "stale versions"]],
      ["[proposalId]/send/route.test.ts", ["wrong origin", "anonymous session", "idempotency", "invalid lifecycle"]],
      ["[proposalId]/accept/route.test.ts", ["wrong origin", "TEAM authority", "proposal.accept grant", "stale/superseded version"]],
    ] as const;

    for (const [suite, assertions] of hostileSuites) {
      const source = readFileSync(join(proposalApiRoot, suite), "utf8");
      for (const assertion of assertions) expect(source).toContain(assertion);
    }
  });
});
