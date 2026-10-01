import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  create: vi.fn(),
  buildResource: vi.fn(),
  sameOrigin: vi.fn(),
  parse: vi.fn(),
}));

function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status });
}

vi.mock("@/modules/authentication/http/request-security", () => ({
  requireSameOrigin: mocks.sameOrigin,
  parseAuthenticationJson: mocks.parse,
}));
vi.mock("@/modules/authorization/http", () => ({
  authorizeTrustedHttpOperation: mocks.authorize,
  authorizationProblem: (status: number, code: string) => response({ code }, status),
}));
vi.mock("@/modules/r7/invoice-draft", () => ({ createInvoiceDraft: mocks.create }));
vi.mock("@/modules/r7/resources", () => ({
  buildProspectiveR7InvoiceResource: mocks.buildResource,
}));
vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  parseR7ListRequest: () => ({ limit: 50 }),
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, code === "NOT_FOUND" ? 404 : 409),
  r7Json: (body: unknown, status = 200) => response(body, status),
}));
vi.mock("@/modules/r7/queries", () => ({ listAuthorizedInvoices: vi.fn() }));

import { POST } from "./route";

const origin = "https://app.example.test";
const contractId = "00000000-0000-4000-8000-000000000301";
const versionId = "00000000-0000-4000-8000-000000000302";
const body = { contractId, expectedContractVersionId: versionId, expectedContractVersion: 2 };
const resource = {
  resourceType: "invoice",
  ownerOrganizationId: "team-org",
  visibility: "INTERNAL",
  sensitivity: "FINANCIAL",
  lifecycleState: "DRAFT",
  version: 1,
};

function request(payload: unknown = body, key = "invoice-draft-01") {
  return new Request(`${origin}/api/v1/r7/invoices`, {
    method: "POST",
    headers: { origin, "content-type": "application/json", "idempotency-key": key },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sameOrigin.mockReturnValue(true);
  mocks.parse.mockImplementation(async (req: Request, schema: { safeParse(value: unknown): { success: boolean; data?: unknown } }) => {
    try {
      const parsed = schema.safeParse(await req.json());
      return parsed.success ? parsed.data ?? null : null;
    } catch {
      return null;
    }
  });
  mocks.resolve.mockResolvedValue({ kind: "authorized", context: { authentication: "authenticated", tenant: { organizationId: "team-org" } } });
  mocks.buildResource.mockReturnValue(resource);
  mocks.authorize.mockResolvedValue({ kind: "allowed" });
  mocks.create.mockResolvedValue({
    kind: "ok",
    value: {
      invoiceId: "00000000-0000-4000-8000-000000000303",
      contractId,
      contractVersionId: versionId,
      status: "DRAFT",
      currency: "USD",
      subtotalMinor: "100",
      taxMinor: "0",
      totalMinor: "100",
      rowVersion: 1,
      lineCount: 1,
      replayed: false,
    },
  });
});

describe("R7 invoice draft HTTP boundary", () => {
  it("rejects a foreign origin before the session or command", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request());
    expect(result.status).toBe(403);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects malformed idempotency keys before authority is resolved", async () => {
    for (const key of ["", "short", "bad key", "x".repeat(129)]) {
      expect((await POST(request(body, key))).status).toBe(400);
    }
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it.each([
    { ...body, currency: "EUR" },
    { ...body, subtotalMinor: "1" },
    { ...body, taxMinor: "1" },
    { ...body, totalMinor: "1" },
    { ...body, status: "SIGNED" },
    { ...body, status: "FINALIZED" },
    { ...body, ownerOrganizationId: "foreign-org" },
    { ...body, organizationId: "foreign-org" },
    { ...body, proposalId: contractId },
    { ...body, sourceContractVersionId: versionId },
    { ...body, lines: [{ description: "forged", quantity: 1, unitAmountMinor: "1" }] },
    { ...body, separationOfDutySatisfied: true },
    { ...body, permissionKey: "invoice.issue" },
    { contractId, expectedContractVersionId: "not-a-uuid", expectedContractVersion: 1 },
    { contractId, expectedContractVersionId: versionId, expectedContractVersion: 0 },
  ])("rejects caller-owned money, source, tenant, and line fields", async (payload) => {
    expect((await POST(request(payload))).status).toBe(400);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("denies an anonymous session before building a resource or creating a draft", async () => {
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401) });
    const result = await POST(request());
    expect(result.status).toBe(401);
    expect(mocks.buildResource).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("denies a session with no selected tenant before the command", async () => {
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_TENANT_REQUIRED" }, 403) });
    const result = await POST(request());
    expect(result.status).toBe(403);
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("does not authorize from a caller-supplied organization", async () => {
    mocks.buildResource.mockReturnValueOnce(null);
    const result = await POST(request());
    expect(result.status).toBe(403);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("requires invoice.edit on the server-built prospective invoice", async () => {
    mocks.authorize.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403) });
    const result = await POST(request());
    expect(result.status).toBe(403);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "invoice.edit",
      resource,
      command: {
        action: "create",
        requestedFields: ["contractId", "expectedContractVersionId", "expectedContractVersion"],
      },
    }));
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("passes only the authorized correlation triple to createInvoiceDraft", async () => {
    const result = await POST(request());
    expect(result.status).toBe(201);
    expect(mocks.create).toHaveBeenCalledWith(
      expect.objectContaining({ authentication: "authenticated" }),
      {
        contractId,
        expectedContractVersionId: versionId,
        expectedContractVersion: 2,
        idempotencyKey: "invoice-draft-01",
      },
    );
    await expect(result.json()).resolves.toEqual({
      invoice: expect.objectContaining({ status: "DRAFT", currency: "USD", totalMinor: "100", replayed: false }),
    });
  });

  it("conceals a foreign or missing contract version", async () => {
    mocks.create.mockResolvedValueOnce({ kind: "error", code: "NOT_FOUND" });
    const result = await POST(request());
    expect(result.status).toBe(404);
    await expect(result.json()).resolves.toEqual({ code: "AUTHZ_NOT_FOUND" });
  });

  it("returns command conflicts without creating a second draft", async () => {
    for (const code of ["CONFLICT", "IDEMPOTENCY_CONFLICT", "INELIGIBLE", "CORRELATION_DENIED"]) {
      mocks.create.mockResolvedValueOnce({ kind: "error", code });
      const result = await POST(request());
      expect(result.status).toBe(409);
      await expect(result.json()).resolves.toEqual({ code: "R7_COMMAND_REJECTED", internalCode: code });
    }
  });
});
