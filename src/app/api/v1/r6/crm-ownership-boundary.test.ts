import { readFileSync, readdirSync, statSync } from "node:fs";
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
  "createLeadSource",
  "createCompany",
  "createContact",
  "createLead",
  "createExtractionJob",
  "requestEnrichment",
  "createLeadList",
  "addLeadListMember",
  "removeLeadListMember",
  "transitionLeadLifecycle",
  "updateCompany",
  "updateContact",
  "updateLead",
  "reviewStagedRecord",
  "reviewEnrichmentFact",
] as const;

const nonBrowserOwned = [
  "stageExtractedRecord",
  "recordEnrichmentFact",
  "recordLeadScore",
  "recordQualification",
  "createDuplicateCandidate",
  "createSuppressionEntry",
  "suppressLead",
] as const;

describe("R6 CRM API ownership boundary", () => {
  const sources = routeSources();

  it.each(browserOwned)("%s has a browser API entrypoint", (command) => {
    expect(sources.some((source) => source.includes(command))).toBe(true);
  });

  it.each(nonBrowserOwned)(
    "%s is not directly callable from an R6 browser route",
    (command) => {
      expect(sources.some((source) => source.includes(command))).toBe(false);
    },
  );

  it("keeps provider evidence writes out of the browser route tree", () => {
    const joined = sources.join("\n");
    for (const evidenceCommand of [
      "stageExtractedRecord",
      "recordEnrichmentFact",
    ]) {
      expect(joined).not.toContain(evidenceCommand);
    }
  });

  it("keeps derived score, qualification, duplicate and suppression evidence server-owned", () => {
    const joined = sources.join("\n");
    for (const evidenceCommand of [
      "recordLeadScore",
      "recordQualification",
      "createDuplicateCandidate",
      "createSuppressionEntry",
    ]) {
      expect(joined).not.toContain(evidenceCommand);
    }
  });
});
