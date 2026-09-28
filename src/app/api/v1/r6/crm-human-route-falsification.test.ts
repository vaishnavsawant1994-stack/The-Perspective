import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  loadCompany: vi.fn(),
  loadContact: vi.fn(),
  loadLead: vi.fn(),
  loadStaged: vi.fn(),
  loadFact: vi.fn(),
  updateCompany: vi.fn(),
  updateContact: vi.fn(),
  updateLead: vi.fn(),
  reviewStaged: vi.fn(),
  reviewFact: vi.fn(),
}));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

vi.mock("@/modules/authorization/http", () => ({
  authorizeTrustedHttpOperation: mocks.authorize,
  authorizationProblem: (status: number, code: string) => json({ code }, status),
}));

vi.mock("@/modules/r6/http", () => ({
  resolveR6TeamRequest: mocks.resolve,
  invalidR6Request: () => json({ code: "R6_INVALID_REQUEST" }, 400),
  r6CommandError: (code: string) =>
    json(
      { code: "R6_COMMAND_REJECTED" },
      code === "NOT_FOUND"
        ? 404
        : ["STALE_WRITE", "CONFLICT", "TRANSITION_DENIED"].includes(code)
          ? 409
          : code === "TEAM_REQUIRED"
            ? 403
            : 400,
    ),
  r6Json: (body: unknown, status = 200) => json(body, status),
  unavailableR6Request: () => json({ code: "AUTHZ_UNAVAILABLE" }, 503),
}));

vi.mock("@/modules/r6/resources", () => ({
  loadR6CompanyResource: mocks.loadCompany,
  loadR6ContactResource: mocks.loadContact,
  loadR6LeadResource: mocks.loadLead,
  loadR6StagedRecordResource: mocks.loadStaged,
  loadR6EnrichmentFactResource: mocks.loadFact,
}));

vi.mock("@/modules/crm/core", () => ({
  updateCompany: mocks.updateCompany,
  updateContact: mocks.updateContact,
  updateLead: mocks.updateLead,
  reviewStagedRecord: mocks.reviewStaged,
  reviewEnrichmentFact: mocks.reviewFact,
}));

vi.mock("@/modules/r6/queries", () => ({
  getAuthorizedCompany: vi.fn(),
  getAuthorizedContact: vi.fn(),
  getAuthorizedLead: vi.fn(),
}));

import { PATCH as patchCompany } from "./crm/companies/[companyId]/route";
import { PATCH as patchContact } from "./crm/contacts/[contactId]/route";
import { PATCH as patchLead } from "./leads/[leadId]/route";
import { POST as reviewStagedRecord } from "./crm/staged-records/[stagedRecordId]/review/route";
import { POST as reviewEnrichmentFact } from "./crm/enrichment-facts/[enrichmentFactId]/review/route";

const origin = "https://app.example.test";
const context = {
  tenant: { organizationId: "org-test", surface: "TEAM" },
  membership: { membershipId: "membership-test", surface: "TEAM" },
};

function request(path: string, body: unknown) {
  return new Request(`${origin}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
    },
    body: JSON.stringify(body),
  });
}

function routeResource(resourceType: string, lifecycleState = "ACTIVE", version = 1) {
  return {
    resourceType,
    ownerOrganizationId: "org-test",
    visibility: "INTERNAL",
    sensitivity: resourceType.includes("contact") || resourceType.includes("fact") || resourceType.includes("staged")
      ? "PII"
      : "CONFIDENTIAL",
    lifecycleState,
    version,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolve.mockResolvedValue({ kind: "authorized", context });
  mocks.authorize.mockResolvedValue({ kind: "allowed", decision: { decision: "ALLOW" } });
  mocks.loadCompany.mockResolvedValue(routeResource("company"));
  mocks.loadContact.mockResolvedValue(routeResource("contact"));
  mocks.loadLead.mockResolvedValue(routeResource("lead", "NEW"));
  mocks.loadStaged.mockResolvedValue(routeResource("staged-record", "PENDING"));
  mocks.loadFact.mockResolvedValue(routeResource("enrichment-fact", "PENDING"));
  mocks.updateCompany.mockResolvedValue({ kind: "ok", value: { companyId: "x", rowVersion: 2 } });
  mocks.updateContact.mockResolvedValue({ kind: "ok", value: { contactId: "x", rowVersion: 2 } });
  mocks.updateLead.mockResolvedValue({ kind: "ok", value: { leadId: "x", rowVersion: 2 } });
  mocks.reviewStaged.mockResolvedValue({ kind: "ok", value: { stagedRecordId: "x", rowVersion: 2 } });
  mocks.reviewFact.mockResolvedValue({ kind: "ok", value: { enrichmentFactId: "x", rowVersion: 2 } });
});

describe("R6 CRM human-owned route falsification", () => {
  it.each([
    [
      "company",
      patchCompany,
      mocks.loadCompany,
      mocks.updateCompany,
      "/api/v1/r6/crm/companies/00000000-0000-4000-8000-000000000101",
      { expectedRowVersion: 1, name: "x" },
      { companyId: "00000000-0000-4000-8000-000000000101" },
    ],
    [
      "contact",
      patchContact,
      mocks.loadContact,
      mocks.updateContact,
      "/api/v1/r6/crm/contacts/00000000-0000-4000-8000-000000000102",
      { expectedRowVersion: 1, title: "x" },
      { contactId: "00000000-0000-4000-8000-000000000102" },
    ],
    [
      "lead",
      patchLead,
      mocks.loadLead,
      mocks.updateLead,
      "/api/v1/r6/leads/00000000-0000-4000-8000-000000000103",
      { expectedRowVersion: 1, companyId: null },
      { leadId: "00000000-0000-4000-8000-000000000103" },
    ],
  ] as const)(
    "conceals a foreign or archived %s target before domain mutation",
    async (_name, handler, loader, command, path, body, params) => {
      loader.mockResolvedValueOnce(null);
      const response = await handler(
        request(path, body),
        { params: Promise.resolve(params as never) } as never,
      );
      expect(response.status).toBe(404);
      await expect(response.json()).resolves.toMatchObject({ code: "AUTHZ_NOT_FOUND" });
      expect(command).not.toHaveBeenCalled();
    },
  );

  it.each([
    [
      "company",
      patchCompany,
      mocks.updateCompany,
      "/api/v1/r6/crm/companies/00000000-0000-4000-8000-000000000111",
      { expectedRowVersion: 1, name: "x" },
      { companyId: "00000000-0000-4000-8000-000000000111" },
    ],
    [
      "contact",
      patchContact,
      mocks.updateContact,
      "/api/v1/r6/crm/contacts/00000000-0000-4000-8000-000000000112",
      { expectedRowVersion: 1, title: "x" },
      { contactId: "00000000-0000-4000-8000-000000000112" },
    ],
    [
      "lead",
      patchLead,
      mocks.updateLead,
      "/api/v1/r6/leads/00000000-0000-4000-8000-000000000113",
      { expectedRowVersion: 1, companyId: null },
      { leadId: "00000000-0000-4000-8000-000000000113" },
    ],
  ] as const)(
    "maps stale %s updates to conflict without bypass",
    async (_name, handler, command, path, body, params) => {
      command.mockResolvedValueOnce({ kind: "error", code: "STALE_WRITE" });
      const response = await handler(
        request(path, body),
        { params: Promise.resolve(params as never) } as never,
      );
      expect(response.status).toBe(409);
      await expect(response.json()).resolves.toMatchObject({ code: "R6_COMMAND_REJECTED" });
    },
  );

  it("maps a foreign lead relationship rejected by the domain to an invalid request", async () => {
    mocks.updateLead.mockResolvedValueOnce({ kind: "error", code: "INVALID" });
    const leadId = "00000000-0000-4000-8000-000000000120";
    const response = await patchLead(
      request(`/api/v1/r6/leads/${leadId}`, {
        expectedRowVersion: 1,
        companyId: "00000000-0000-4000-8000-000000000121",
      }),
      { params: Promise.resolve({ leadId }) },
    );
    expect(response.status).toBe(400);
    expect(mocks.updateLead).toHaveBeenCalledTimes(1);
  });

  it("passes staged-record lifecycle state into canonical review authorization", async () => {
    mocks.loadStaged.mockResolvedValueOnce(routeResource("staged-record", "APPROVED", 2));
    mocks.authorize.mockImplementationOnce(async (input) => {
      expect(input.permissionKey).toBe("lead.import.review");
      expect(input.command).toMatchObject({
        action: "reject",
        requestedFields: ["decision", "expectedRowVersion"],
        workflowSatisfied: false,
      });
      return {
        kind: "response",
        decision: { decision: "DENY" },
        response: json({ code: "AUTHZ_NOT_FOUND" }, 404),
      };
    });

    const id = "00000000-0000-4000-8000-000000000130";
    const response = await reviewStagedRecord(
      request(`/api/v1/r6/crm/staged-records/${id}/review`, {
        decision: "REJECTED",
        expectedRowVersion: 2,
      }),
      { params: Promise.resolve({ stagedRecordId: id }) },
    );
    expect(response.status).toBe(404);
    expect(mocks.reviewStaged).not.toHaveBeenCalled();
  });

  it("passes enrichment decision/version through canonical action-field authorization", async () => {
    const id = "00000000-0000-4000-8000-000000000131";
    const response = await reviewEnrichmentFact(
      request(`/api/v1/r6/crm/enrichment-facts/${id}/review`, {
        decision: "ACCEPTED",
        expectedRowVersion: 3,
      }),
      { params: Promise.resolve({ enrichmentFactId: id }) },
    );

    expect(response.status).toBe(200);
    expect(mocks.authorize).toHaveBeenCalledWith(
      expect.objectContaining({
        permissionKey: "lead.enrich",
        command: expect.objectContaining({
          action: "accept",
          requestedFields: ["decision", "expectedRowVersion"],
          workflowSatisfied: true,
        }),
      }),
    );
    expect(mocks.reviewFact).toHaveBeenCalledWith(
      context,
      expect.objectContaining({
        enrichmentFactId: id,
        decision: "ACCEPTED",
        expectedRowVersion: 3,
      }),
    );
  });
});
