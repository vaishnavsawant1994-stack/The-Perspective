import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const apiRoot = join(process.cwd(), "src/app/api/v1/r6");

function routeFiles(directory = apiRoot): string[] {
  return readdirSync(directory).flatMap((name) => {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) return routeFiles(path);
    return name === "route.ts" ? [path] : [];
  });
}

function source(path: string) {
  return readFileSync(join(apiRoot, path), "utf8");
}

const crmRoutes = [
  "crm/lead-sources/route.ts",
  "crm/extraction-jobs/route.ts",
  "crm/enrichment-jobs/route.ts",
  "crm/enrichment-facts/[enrichmentFactId]/review/route.ts",
  "crm/staged-records/[stagedRecordId]/review/route.ts",
  "crm/companies/route.ts",
  "crm/companies/[companyId]/route.ts",
  "crm/contacts/route.ts",
  "crm/contacts/[contactId]/route.ts",
  "crm/lead-lists/route.ts",
  "crm/lead-lists/[leadListId]/members/route.ts",
  "leads/route.ts",
  "leads/[leadId]/route.ts",
  "leads/[leadId]/qualification/route.ts",
] as const;

const browserMutationRoutes = [
  "crm/lead-sources/route.ts",
  "crm/extraction-jobs/route.ts",
  "crm/enrichment-jobs/route.ts",
  "crm/enrichment-facts/[enrichmentFactId]/review/route.ts",
  "crm/staged-records/[stagedRecordId]/review/route.ts",
  "crm/companies/route.ts",
  "crm/companies/[companyId]/route.ts",
  "crm/contacts/route.ts",
  "crm/contacts/[contactId]/route.ts",
  "crm/lead-lists/route.ts",
  "crm/lead-lists/[leadListId]/members/route.ts",
  "leads/route.ts",
  "leads/[leadId]/route.ts",
  "leads/[leadId]/qualification/route.ts",
] as const;

const forbiddenBrowserCommands = [
  "stageExtractedRecord",
  "recordEnrichmentFact",
  "recordLeadScore",
  "recordQualification",
  "createDuplicateCandidate",
  "createSuppressionEntry",
  "suppressLead",
] as const;

describe("R6 whole-CRM API post-falsification boundary", () => {
  it("pins the complete expected CRM browser route inventory", () => {
    const existing = new Set(
      routeFiles()
        .map((path) => relative(apiRoot, path).replaceAll("\\", "/"))
        .filter(
          (path) =>
            path.startsWith("crm/") ||
            path === "leads/route.ts" ||
            path.startsWith("leads/"),
        ),
    );

    expect(existing).toEqual(new Set(crmRoutes));
  });

  it.each(browserMutationRoutes)(
    "%s uses the canonical same-origin, tenant-resolution and authorization chain",
    (path) => {
      const text = source(path);
      expect(text).toContain("requireSameOrigin");
      expect(text).toContain("resolveR6TeamRequest");
      expect(text).toContain("authorizeTrustedHttpOperation");
      expect(text).toContain(".strict()");
    },
  );

  it("pins permission/action mapping for qualified human update routes", () => {
    expect(source("crm/companies/[companyId]/route.ts")).toMatch(
      /permissionKey:\s*"company\.edit"[\s\S]*action:\s*"update"/u,
    );
    expect(source("crm/contacts/[contactId]/route.ts")).toMatch(
      /permissionKey:\s*"contact\.edit"[\s\S]*action:\s*"update"/u,
    );
    expect(source("leads/[leadId]/route.ts")).toMatch(
      /permissionKey:\s*"lead\.edit"[\s\S]*action:\s*"update"/u,
    );
  });

  it("pins explicit review actions instead of generic evidence mutation", () => {
    const staged = source(
      "crm/staged-records/[stagedRecordId]/review/route.ts",
    );
    const enrichment = source(
      "crm/enrichment-facts/[enrichmentFactId]/review/route.ts",
    );

    expect(staged).toContain('permissionKey: "lead.import.review"');
    expect(staged).toContain('APPROVED: "approve"');
    expect(staged).toContain('REJECTED: "reject"');
    expect(staged).toContain("workflowSatisfied");

    expect(enrichment).toContain('permissionKey: "lead.enrich"');
    expect(enrichment).toContain('ACCEPTED: "accept"');
    expect(enrichment).toContain('REJECTED: "reject"');
    expect(enrichment).toContain("workflowSatisfied");
  });

  it("does not expose provider evidence fields through human review schemas", () => {
    const staged = source(
      "crm/staged-records/[stagedRecordId]/review/route.ts",
    );
    const enrichment = source(
      "crm/enrichment-facts/[enrichmentFactId]/review/route.ts",
    );

    for (const field of [
      "rawPayload",
      "normalizedPayload",
      "provenanceUrl",
      "confidence",
      "sourceRecordKey",
    ]) {
      expect(staged).not.toContain(field);
    }

    for (const field of [
      "typedValue",
      "sourceUrl",
      "confidence",
      "observedAt",
      "targetResourceId",
      "jobId",
      "fieldKey",
    ]) {
      expect(enrichment).not.toContain(field);
    }
  });

  it("keeps generic updates free of lifecycle, consent, scoring and authority mutation", () => {
    const company = source("crm/companies/[companyId]/route.ts");
    const contact = source("crm/contacts/[contactId]/route.ts");
    const lead = source("leads/[leadId]/route.ts");

    for (const field of [
      "ownerOrganizationId",
      "ownerMembershipId",
      "departmentId",
      "visibility",
      "sensitivity",
      "archivedAt",
      "linkedOrganizationId",
    ]) {
      expect(company).not.toContain(field);
    }

    for (const field of [
      "consentState",
      "contactabilityState",
      "emailOriginal",
      "emailNormalized",
      "phoneNormalized",
      "ownerOrganizationId",
      "ownerMembershipId",
      "archivedAt",
    ]) {
      expect(contact).not.toContain(field);
    }

    for (const field of [
      "sourceRecordKey",
      "lifecycleState",
      "fitScore",
      "qualificationState",
      "legalBasis",
      "consentState",
      "convertedDealId",
      "ownerOrganizationId",
      "ownerMembershipId",
      "archivedAt",
    ]) {
      expect(lead).not.toContain(field);
    }
  });

  it("keeps all seven server/worker evidence commands absent from every R6 browser route", () => {
    const joined = routeFiles().map((path) => readFileSync(path, "utf8")).join("\n");
    for (const command of forbiddenBrowserCommands) {
      expect(joined).not.toContain(command);
    }
  });

  it("keeps Proposal and template management dormant at the R6 browser boundary", () => {
    const files = routeFiles();
    const paths = files.map((path) =>
      relative(apiRoot, path).replaceAll("\\", "/").toLowerCase(),
    );
    const joined = files.map((path) => readFileSync(path, "utf8")).join("\n");

    expect(paths.some((path) => path.includes("proposal"))).toBe(false);
    expect(joined).not.toContain("proposal.view");
    expect(joined).not.toContain("proposal.edit");
    expect(joined).not.toContain("proposal.send");
    expect(joined).not.toContain("proposal.approve");
    expect(joined).not.toContain("template.manage");
  });

  it("uses trusted object loaders for object-level CRM browser mutations", () => {
    const mappings = [
      ["crm/companies/[companyId]/route.ts", "loadR6CompanyResource"],
      ["crm/contacts/[contactId]/route.ts", "loadR6ContactResource"],
      ["leads/[leadId]/route.ts", "loadR6LeadResource"],
      [
        "crm/staged-records/[stagedRecordId]/review/route.ts",
        "loadR6StagedRecordResource",
      ],
      [
        "crm/enrichment-facts/[enrichmentFactId]/review/route.ts",
        "loadR6EnrichmentFactResource",
      ],
      ["leads/[leadId]/qualification/route.ts", "loadR6LeadResource"],
    ] as const;

    for (const [path, loader] of mappings) {
      const text = source(path);
      expect(text).toContain(loader);
      expect(text).toContain("concealResource: true");
    }
  });
});
