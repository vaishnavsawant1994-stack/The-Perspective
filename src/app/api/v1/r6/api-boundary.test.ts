import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as createCompany } from "./crm/companies/route";
import { POST as createContact } from "./crm/contacts/route";
import { POST as createLead } from "./leads/route";
import { PATCH as updateDeal } from "./deals/[dealId]/route";
import { POST as createLeadSource } from "./crm/lead-sources/route";
import { POST as createExtractionJob } from "./crm/extraction-jobs/route";
import { POST as requestEnrichment } from "./crm/enrichment-jobs/route";
import { POST as createLeadList } from "./crm/lead-lists/route";
import { POST as addLeadListMember } from "./crm/lead-lists/[leadListId]/members/route";
import { GET as listCompanies } from "./crm/companies/route";
import {
  GET as getCompany,
  PATCH as patchCompany,
} from "./crm/companies/[companyId]/route";
import {
  GET as getContact,
  PATCH as patchContact,
} from "./crm/contacts/[contactId]/route";
import {
  GET as getLead,
  PATCH as patchLead,
} from "./leads/[leadId]/route";
import { POST as reviewStagedRecord } from "./crm/staged-records/[stagedRecordId]/review/route";
import { POST as reviewEnrichmentFact } from "./crm/enrichment-facts/[enrichmentFactId]/review/route";

const origin = "https://app.example.test";

function request(path: string, body: unknown, requestOrigin = origin) {
  return new Request(`${origin}${path}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: requestOrigin,
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.stubEnv("PERSPECTIVE_AUTH_BOUNDARY_MODE", "sessions");
  vi.stubEnv("DATABASE_URL", "postgresql://test:test@example.test:5432/test");
  vi.stubEnv("PERSPECTIVE_PUBLIC_APP_ORIGIN", origin);
  vi.stubEnv(
    "PERSPECTIVE_AUTH_DATA_KEY",
    Buffer.alloc(32, 7).toString("base64"),
  );
  vi.stubEnv("PERSPECTIVE_AUTH_KEY_VERSION", "1");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("R6 CRM direct-call API boundary", () => {
  it("rejects cross-origin mutations before authentication or domain execution", async () => {
    const response = await createCompany(
      request(
        "/api/v1/r6/crm/companies",
        { name: "Acme" },
        "https://attacker.example",
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: "AUTHZ_DENIED",
    });
  });

  it.each([
    [
      "company",
      createCompany,
      "/api/v1/r6/crm/companies",
      { name: "Acme", organizationId: "00000000-0000-4000-8000-000000000001" },
    ],
    [
      "contact",
      createContact,
      "/api/v1/r6/crm/contacts",
      {
        title: "CFO",
        membershipId: "00000000-0000-4000-8000-000000000002",
        scope: "ORG",
      },
    ],
    [
      "lead",
      createLead,
      "/api/v1/r6/leads",
      {
        companyId: "00000000-0000-4000-8000-000000000003",
        ownerOrganizationId: "00000000-0000-4000-8000-000000000004",
        roleKey: "R01",
        surface: "TEAM",
      },
    ],
  ] as const)(
    "rejects browser-supplied authority fields for %s creation",
    async (_name, handler, path, body) => {
      const response = await handler(request(path, body));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    },
  );

  it("rejects pipeline reassignment through the deal PATCH boundary", async () => {
    const dealId = "00000000-0000-4000-8000-000000000020";
    const response = await updateDeal(
      request(`/api/v1/r6/deals/${dealId}`, {
        expectedRowVersion: 1,
        amountMinor: "1000",
        pipelineId: "00000000-0000-4000-8000-000000000021",
      }),
      { params: Promise.resolve({ dealId }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "R6_INVALID_REQUEST",
    });
  });

  it("returns 401 for an anonymous valid CRM mutation", async () => {
    const response = await createLeadSource(
      request("/api/v1/r6/crm/lead-sources", {
        sourceType: "PUBLIC_WEB",
        name: "Anonymous source",
      }),
    );

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      code: "AUTHZ_AUTH_REQUIRED",
    });
  });

  it("rejects cross-origin extraction requests before execution", async () => {
    const response = await createExtractionJob(
      request(
        "/api/v1/r6/crm/extraction-jobs",
        {
          leadSourceId: "00000000-0000-4000-8000-000000000011",
          querySnapshot: { query: "test" },
        },
        "https://attacker.example",
      ),
    );

    expect(response.status).toBe(403);
    await expect(response.json()).resolves.toMatchObject({
      code: "AUTHZ_DENIED",
    });
  });

  it.each([
    [
      "lead-source authority",
      createLeadSource,
      "/api/v1/r6/crm/lead-sources",
      {
        sourceType: "PUBLIC_WEB",
        name: "Injected",
        organizationId: "00000000-0000-4000-8000-000000000012",
      },
    ],
    [
      "extraction server-owned status",
      createExtractionJob,
      "/api/v1/r6/crm/extraction-jobs",
      {
        leadSourceId: "00000000-0000-4000-8000-000000000013",
        querySnapshot: {},
        status: "COMPLETED",
      },
    ],
    [
      "enrichment server-owned request hash",
      requestEnrichment,
      "/api/v1/r6/crm/enrichment-jobs",
      {
        targetResourceId: "00000000-0000-4000-8000-000000000014",
        provider: "provider.test",
        requestedFields: ["title"],
        requestHash: "browser-forged",
      },
    ],
    [
      "lead-list authority",
      createLeadList,
      "/api/v1/r6/crm/lead-lists",
      {
        name: "Injected list",
        memberCount: 999,
        ownerMembershipId: "00000000-0000-4000-8000-000000000015",
      },
    ],
  ] as const)(
    "rejects forged/server-owned CRM input: %s",
    async (_name, handler, path, body) => {
      const response = await handler(request(path, body));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    },
  );

  it("rejects forged lead-list membership authority fields", async () => {
    const leadListId = "00000000-0000-4000-8000-000000000016";
    const response = await addLeadListMember(
      request(`/api/v1/r6/crm/lead-lists/${leadListId}/members`, {
        leadId: "00000000-0000-4000-8000-000000000017",
        scope: "ORG",
      }),
      { params: Promise.resolve({ leadListId }) },
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "R6_INVALID_REQUEST",
    });
  });

  it("rejects malformed extraction and enrichment identifiers", async () => {
    const extraction = await createExtractionJob(
      request("/api/v1/r6/crm/extraction-jobs", {
        leadSourceId: "not-a-uuid",
        querySnapshot: {},
      }),
    );
    expect(extraction.status).toBe(400);

    const enrichment = await requestEnrichment(
      request("/api/v1/r6/crm/enrichment-jobs", {
        targetResourceId: "not-a-uuid",
        provider: "provider.test",
        requestedFields: ["title"],
      }),
    );
    expect(enrichment.status).toBe(400);
  });

  it("rejects server-owned contact PII at the browser schema", async () => {
    const response = await createContact(
      request("/api/v1/r6/crm/contacts", {
        title: "CFO",
        emailOriginal: "browser@example.test",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "R6_INVALID_REQUEST",
    });
  });

  it("rejects server-owned lead sourceRecordKey at the canonical lead API", async () => {
    const response = await createLead(
      request("/api/v1/r6/leads", {
        companyId: "00000000-0000-4000-8000-000000000018",
        sourceRecordKey: "browser-forged-source-key",
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "R6_INVALID_REQUEST",
    });
  });

  it("rejects malformed CRM detail identifiers before database access", async () => {
    const request = new Request(`${origin}/api/v1/r6/malformed-detail`);
    const responses = [
      await getCompany(request, {
        params: Promise.resolve({ companyId: "not-a-uuid" }),
      }),
      await getContact(request, {
        params: Promise.resolve({ contactId: "not-a-uuid" }),
      }),
      await getLead(request, {
        params: Promise.resolve({ leadId: "not-a-uuid" }),
      }),
    ];

    for (const response of responses) {
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    }
  });

  it("rejects out-of-range CRM list pagination before authorization", async () => {
    const response = await listCompanies(
      new Request(`${origin}/api/v1/r6/crm/companies?limit=101`),
    );
    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      code: "R6_INVALID_REQUEST",
    });
  });

  it.each([
    [
      "contact company id",
      createContact,
      "/api/v1/r6/crm/contacts",
      { companyId: "not-a-uuid", title: "CFO" },
    ],
    [
      "lead source id",
      createLead,
      "/api/v1/r6/leads",
      { leadSourceId: "not-a-uuid" },
    ],
  ] as const)(
    "rejects malformed %s before trusted context resolution",
    async (_name, handler, path, body) => {
      const response = await handler(request(path, body));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    },
  );

  it.each([
    [
      "company update",
      patchCompany,
      "/api/v1/r6/crm/companies/00000000-0000-4000-8000-000000000030",
      { expectedRowVersion: 1, name: "Updated" },
      { companyId: "00000000-0000-4000-8000-000000000030" },
    ],
    [
      "contact update",
      patchContact,
      "/api/v1/r6/crm/contacts/00000000-0000-4000-8000-000000000031",
      { expectedRowVersion: 1, title: "Updated" },
      { contactId: "00000000-0000-4000-8000-000000000031" },
    ],
    [
      "lead update",
      patchLead,
      "/api/v1/r6/leads/00000000-0000-4000-8000-000000000032",
      {
        expectedRowVersion: 1,
        companyId: "00000000-0000-4000-8000-000000000033",
      },
      { leadId: "00000000-0000-4000-8000-000000000032" },
    ],
    [
      "staged review",
      reviewStagedRecord,
      "/api/v1/r6/crm/staged-records/00000000-0000-4000-8000-000000000034/review",
      { decision: "APPROVED", expectedRowVersion: 1 },
      { stagedRecordId: "00000000-0000-4000-8000-000000000034" },
    ],
    [
      "enrichment review",
      reviewEnrichmentFact,
      "/api/v1/r6/crm/enrichment-facts/00000000-0000-4000-8000-000000000035/review",
      { decision: "ACCEPTED", expectedRowVersion: 1 },
      { enrichmentFactId: "00000000-0000-4000-8000-000000000035" },
    ],
  ] as const)(
    "rejects cross-origin browser-owned CRM mutation: %s",
    async (_name, handler, path, body, params) => {
      const response = await handler(
        request(path, body, "https://attacker.example"),
        { params: Promise.resolve(params as never) } as never,
      );
      expect(response.status).toBe(403);
      await expect(response.json()).resolves.toMatchObject({
        code: "AUTHZ_DENIED",
      });
    },
  );

  it.each([
    [
      "company authority",
      patchCompany,
      "/api/v1/r6/crm/companies/00000000-0000-4000-8000-000000000040",
      {
        expectedRowVersion: 1,
        name: "Injected",
        ownerMembershipId: "00000000-0000-4000-8000-000000000041",
      },
      { companyId: "00000000-0000-4000-8000-000000000040" },
    ],
    [
      "contact consent and PII",
      patchContact,
      "/api/v1/r6/crm/contacts/00000000-0000-4000-8000-000000000042",
      {
        expectedRowVersion: 1,
        title: "Injected",
        consentState: "OPTED_IN",
        emailOriginal: "attacker@example.test",
      },
      { contactId: "00000000-0000-4000-8000-000000000042" },
    ],
    [
      "lead lifecycle and score",
      patchLead,
      "/api/v1/r6/leads/00000000-0000-4000-8000-000000000043",
      {
        expectedRowVersion: 1,
        companyId: "00000000-0000-4000-8000-000000000044",
        lifecycleState: "CONVERTED",
        fitScore: 100,
      },
      { leadId: "00000000-0000-4000-8000-000000000043" },
    ],
    [
      "staged provider evidence",
      reviewStagedRecord,
      "/api/v1/r6/crm/staged-records/00000000-0000-4000-8000-000000000045/review",
      {
        decision: "APPROVED",
        expectedRowVersion: 1,
        normalizedPayload: { injected: true },
        provenanceUrl: "https://attacker.example/evidence",
      },
      { stagedRecordId: "00000000-0000-4000-8000-000000000045" },
    ],
    [
      "enrichment provider evidence",
      reviewEnrichmentFact,
      "/api/v1/r6/crm/enrichment-facts/00000000-0000-4000-8000-000000000046/review",
      {
        decision: "ACCEPTED",
        expectedRowVersion: 1,
        typedValue: "attacker",
        sourceUrl: "https://attacker.example/fact",
        confidence: 1,
      },
      { enrichmentFactId: "00000000-0000-4000-8000-000000000046" },
    ],
  ] as const)(
    "rejects protected-field smuggling through %s",
    async (_name, handler, path, body, params) => {
      const response = await handler(
        request(path, body),
        { params: Promise.resolve(params as never) } as never,
      );
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    },
  );

  it.each([
    [
      "company",
      patchCompany,
      "/api/v1/r6/crm/companies/00000000-0000-4000-8000-000000000050",
      { companyId: "00000000-0000-4000-8000-000000000050" },
    ],
    [
      "contact",
      patchContact,
      "/api/v1/r6/crm/contacts/00000000-0000-4000-8000-000000000051",
      { contactId: "00000000-0000-4000-8000-000000000051" },
    ],
    [
      "lead",
      patchLead,
      "/api/v1/r6/leads/00000000-0000-4000-8000-000000000052",
      { leadId: "00000000-0000-4000-8000-000000000052" },
    ],
  ] as const)(
    "rejects no-op %s update before authorization",
    async (_name, handler, path, params) => {
      const response = await handler(
        request(path, { expectedRowVersion: 1 }),
        { params: Promise.resolve(params as never) } as never,
      );
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toMatchObject({
        code: "R6_INVALID_REQUEST",
      });
    },
  );
});
