import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  issue: vi.fn(),
  subject: vi.fn(),
  sameOrigin: vi.fn(),
  parse: vi.fn(),
  recent: vi.fn(),
  mfa: vi.fn(),
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
vi.mock("@/modules/r6/security", () => ({
  r6RecentAuthenticationSatisfied: mocks.recent,
  r6MfaSatisfied: mocks.mfa,
}));
vi.mock("@/modules/r7/invoice-draft", () => ({ issueInvoice: mocks.issue }));
vi.mock("@/modules/r7/resources", () => ({ loadR7InvoiceCommandSubject: mocks.subject }));
vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, 409),
  r7Json: (body: unknown, status = 200) => response(body, status),
}));

import { POST } from "./route";

const origin = "https://app.example.test";
const invoiceId = "00000000-0000-4000-8000-000000000401";
const body = { expectedRowVersion: 1, reason: "Issue the signed engagement" };
const route = { params: Promise.resolve({ invoiceId }) };
const resource = {
  resourceType: "invoice",
  resourceId: "trusted-invoice",
  ownerOrganizationId: "team-org",
  visibility: "INTERNAL",
  sensitivity: "FINANCIAL",
  lifecycleState: "DRAFT",
  version: 1,
};

function request(payload: unknown = body, key = "invoice-issue-01", id = invoiceId) {
  return new Request(`${origin}/api/v1/r7/invoices/${id}/issue`, {
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
  mocks.resolve.mockResolvedValue({
    kind: "authorized",
    context: {
      authentication: "authenticated",
      session: { issuedAt: new Date() },
      tenant: { organizationId: "00000000-0000-4000-8000-000000000410" },
    },
  });
  mocks.subject.mockResolvedValue({
    resource,
    financialEvidencePresent: true,
    separationOfDutySatisfied: true,
  });
  mocks.recent.mockReturnValue(true);
  mocks.mfa.mockReturnValue(true);
  mocks.authorize.mockResolvedValue({ kind: "allowed" });
  mocks.issue.mockResolvedValue({
    kind: "ok",
    value: { invoiceId, status: "FINALIZED", totalMinor: "100", rowVersion: 2, replayed: false },
  });
});

describe("R7 invoice.issue HTTP boundary", () => {
  it("rejects a foreign origin before lookup", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("rejects malformed keys, identifiers, and protected fields", async () => {
    expect((await POST(request(body, "short"), route)).status).toBe(400);
    expect((await POST(request(), { params: Promise.resolve({ invoiceId: "not-a-uuid" }) })).status).toBe(400);
    for (const payload of [
      { ...body, status: "FINALIZED" },
      { ...body, currency: "USD" },
      { ...body, totalMinor: "1" },
      { ...body, subtotalMinor: "1" },
      { ...body, taxMinor: "1" },
      { ...body, action: "finalize" },
      { ...body, ownerOrganizationId: "foreign-org" },
      { ...body, separationOfDutySatisfied: true },
      { ...body, financialEvidencePresent: true },
      { ...body, mfaSatisfied: true },
      { expectedRowVersion: 1, reason: "short" },
    ]) {
      expect((await POST(request(payload), route)).status).toBe(400);
    }
    expect(mocks.subject).not.toHaveBeenCalled();
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("denies anonymous and unselected tenants before invoice lookup", async () => {
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401) });
    expect((await POST(request(), route)).status).toBe(401);
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_TENANT_REQUIRED" }, 403) });
    expect((await POST(request(), route)).status).toBe(403);
    expect(mocks.subject).not.toHaveBeenCalled();
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("conceals a missing or foreign invoice before authorization", async () => {
    mocks.subject.mockResolvedValueOnce(null);
    const result = await POST(request(), route);
    expect(result.status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("authorizes invoice.issue from server facts, not caller obligations", async () => {
    const result = await POST(request(), route);
    expect(result.status).toBe(200);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "invoice.issue",
      resource,
      concealResource: true,
      command: expect.objectContaining({
        action: "issue",
        requestedFields: [],
        workflowSatisfied: true,
        exactVersionMatches: true,
        reason: "Issue the signed engagement",
        recentAuthenticationSatisfied: true,
        mfaSatisfied: true,
        financialEvidencePresent: true,
        separationOfDutySatisfied: true,
      }),
    }));
    expect(mocks.issue).toHaveBeenCalledWith(
      expect.objectContaining({ authentication: "authenticated" }),
      { invoiceId, expectedRowVersion: 1, idempotencyKey: "invoice-issue-01" },
    );
  });

  it("does not call issue when permission is denied", async () => {
    mocks.authorize.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_NOT_FOUND" }, 404) });
    const result = await POST(request(), route);
    expect(result.status).toBe(404);
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("rejects a stale row before the domain command", async () => {
    mocks.subject.mockResolvedValueOnce({
      resource: { ...resource, version: 4 },
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(409);
    await expect(result.json()).resolves.toEqual({ code: "R7_COMMAND_REJECTED", internalCode: "STALE_WRITE" });
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("replays a committed issue key even after the draft lifecycle has ended", async () => {
    const organizationId = "00000000-0000-4000-8000-000000000410";
    mocks.subject.mockResolvedValueOnce({
      resource: { ...resource, lifecycleState: "FINALIZED", version: 2 },
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
      issueIdempotencyKey: `r7:invoice-issue:${organizationId}:invoice-issue-01`,
    });
    mocks.issue.mockResolvedValueOnce({
      kind: "ok",
      value: { invoiceId, status: "FINALIZED", totalMinor: "100", rowVersion: 2, replayed: true },
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(200);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      command: expect.objectContaining({ workflowSatisfied: true, exactVersionMatches: false }),
    }));
    expect(mocks.issue).toHaveBeenCalledWith(
      expect.anything(),
      { invoiceId, expectedRowVersion: 1, idempotencyKey: "invoice-issue-01" },
    );
  });

  it("rejects finalized financial mutation even if authorization was bypassed", async () => {
    mocks.subject.mockResolvedValueOnce({
      resource: { ...resource, lifecycleState: "FINALIZED", version: 2 },
      financialEvidencePresent: true,
      separationOfDutySatisfied: true,
    });
    const result = await POST(request({ ...body, expectedRowVersion: 2 }), route);
    expect(result.status).toBe(409);
    await expect(result.json()).resolves.toEqual({ code: "R7_COMMAND_REJECTED", internalCode: "TRANSITION_DENIED" });
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("rejects issue without server financial evidence", async () => {
    mocks.subject.mockResolvedValueOnce({
      resource,
      financialEvidencePresent: false,
      separationOfDutySatisfied: true,
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(409);
    expect(mocks.issue).not.toHaveBeenCalled();
  });

  it("maps domain conflicts and does not treat them as success", async () => {
    for (const code of ["STALE_WRITE", "INELIGIBLE", "IDEMPOTENCY_CONFLICT", "CONFLICT"]) {
      mocks.issue.mockResolvedValueOnce({ kind: "error", code });
      expect((await POST(request(), route)).status).toBe(409);
    }
  });
});
