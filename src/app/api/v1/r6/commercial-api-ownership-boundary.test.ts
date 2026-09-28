import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = join(process.cwd(), "src/app/api/v1/r6");

function routeSources(directory = apiRoot): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return routeSources(path);
    return name === "route.ts" ? [readFileSync(path, "utf8")] : [];
  });
}

const browserOwned = [
  "createDealPipeline",
  "createDeal",
  "updateDealFields",
  "moveDeal",
  "convertDealToClient",
  "addClientRelationship",
  "listAuthorizedDealPipelines",
  "listAuthorizedDeals",
  "listAuthorizedClients",
  "listAuthorizedClientRelationships",
] as const;

const dormantOrR7 = [
  "createProposal",
  "sendProposal",
  "approveProposal",
  "createContract",
  "createInvoice",
  "createPayment",
  "createSubscription",
  "createEntitlement",
  "proposal.approve",
  "proposal.edit",
  "proposal.send",
  "proposal.view",
] as const;

describe("R6 Commercial API ownership boundary", () => {
  const sources = routeSources();
  const joined = sources.join("\n");

  it.each(browserOwned)("%s has a browser API entrypoint", (command) => {
    expect(sources.some((source) => source.includes(command))).toBe(true);
  });

  it.each(dormantOrR7)(
    "%s is not directly callable from an R6 browser route",
    (command) => {
      expect(joined).not.toContain(command);
    },
  );

  it("does not add R7 commercial route trees", () => {
    for (const prohibited of [
      "src/app/api/v1/r6/proposals",
      "src/app/api/v1/r6/contracts",
      "src/app/api/v1/r6/invoices",
      "src/app/api/v1/r6/payments",
      "src/app/api/v1/r6/subscriptions",
      "src/app/api/v1/r6/entitlements",
    ]) {
      expect(existsSync(join(process.cwd(), prohibited))).toBe(false);
    }
  });

  it("keeps PROPOSAL_PREPARATION as the latest forward commercial class in pipeline create", () => {
    const pipeline = readFileSync(
      join(apiRoot, "commercial/pipelines/route.ts"),
      "utf8",
    );
    expect(pipeline).toContain("PROPOSAL_PREPARATION");
    expect(pipeline).not.toContain("PROPOSAL_SENT");
    expect(pipeline).not.toContain("PROPOSAL_ACCEPTED");
    expect(pipeline).not.toContain("CONTRACT_SIGNED");
    expect(pipeline).not.toContain("WON");
  });
});
