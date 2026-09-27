import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { POST as createCompany } from "./crm/companies/route";
import { POST as createContact } from "./crm/contacts/route";
import { POST as createLead } from "./crm/leads/route";

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
      "/api/v1/r6/crm/leads",
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
      "/api/v1/r6/crm/leads",
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
});
