import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  resource: vi.fn(),
  send: vi.fn(),
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
vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, code === "STALE_WRITE" ? 409 : 400),
  r7Json: (body: unknown, status = 200) => response(body, status),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
}));
vi.mock("@/modules/r7/resources", () => ({ loadR7ProposalResource: mocks.resource }));
vi.mock("@/modules/r7/proposal-send", () => ({ sendProposal: mocks.send }));

import { POST } from "./route";

const origin = "https://app.example.test";
const proposalId = "00000000-0000-4000-8000-000000000101";
const versionId = "00000000-0000-4000-8000-000000000102";
const body = { expectedVersionId: versionId, expectedVersion: 1, expectedRowVersion: 4 };
const route = { params: Promise.resolve({ proposalId }) };

function request(payload: unknown = body, key = "proposal-send-001") {
  return new Request(`${origin}/api/v1/r7/proposals/${proposalId}/send`, {
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
  mocks.resolve.mockResolvedValue({ kind: "authorized", context: { authentication: "authenticated" } });
  mocks.resource.mockResolvedValue({
    resourceType: "proposal", resourceId: "trusted-resource", ownerOrganizationId: "team-org",
    visibility: "INTERNAL", sensitivity: "FINANCIAL", lifecycleState: "DRAFT", version: 4,
  });
  mocks.authorize.mockResolvedValue({ kind: "allowed" });
  mocks.send.mockResolvedValue({ kind: "ok", value: {
    id: proposalId, versionId, version: 1, rowVersion: 5, status: "SENT",
    currency: "USD", totalMinor: "25000", sentAt: "2026-09-29T10:00:00.000Z",
  } });
});

describe("R7 Proposal Send HTTP boundary", () => {
  it("rejects wrong origin before parsing or resolving authority", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.parse).not.toHaveBeenCalled();
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it("rejects missing or malformed idempotency keys before resolving authority", async () => {
    for (const key of ["", "short", "invalid key", "x".repeat(129)]) {
      const result = await POST(request(body, key), route);
      expect(result.status).toBe(400);
    }
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it.each([
    { ...body, status: "SENT" },
    { ...body, ownerOrganizationId: "foreign-org" },
    { ...body, totalMinor: "1" },
  ])("rejects browser-owned lifecycle, tenant, and financial claims", async (payload) => {
    const result = await POST(request(payload), route);
    expect(result.status).toBe(400);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not invoke the command for an anonymous session", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(401);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("conceals foreign or missing resources and denies an absent send grant", async () => {
    mocks.resource.mockResolvedValueOnce(null);
    const hidden = await POST(request(), route);
    expect(hidden.status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();

    mocks.authorize.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403),
    });
    const denied = await POST(request(), route);
    expect(denied.status).toBe(403);
    expect(mocks.authorize).toHaveBeenLastCalledWith(expect.objectContaining({
      permissionKey: "proposal.send",
      command: expect.objectContaining({
        action: "send", workflowSatisfied: true, exactVersionMatches: true,
      }),
    }));
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("fails closed for stale version and invalid lifecycle even if policy adapter allows", async () => {
    mocks.resource.mockResolvedValueOnce({
      resourceType: "proposal", resourceId: "trusted-resource", ownerOrganizationId: "team-org",
      visibility: "INTERNAL", sensitivity: "FINANCIAL", lifecycleState: "READY", version: 3,
    });
    const stale = await POST(request(), route);
    expect(stale.status).toBe(409);
    expect(mocks.send).not.toHaveBeenCalled();

    mocks.resource.mockResolvedValueOnce({
      resourceType: "proposal", resourceId: "trusted-resource", ownerOrganizationId: "team-org",
      visibility: "INTERNAL", sensitivity: "FINANCIAL", lifecycleState: "ACCEPTED", version: 4,
    });
    const invalidLifecycle = await POST(request(), route);
    expect(invalidLifecycle.status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("invokes only the explicit idempotent send command and returns queued intent", async () => {
    const result = await POST(request(), route);
    expect(result.status).toBe(202);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "proposal.send",
      resource: expect.objectContaining({
        ownerOrganizationId: "team-org", resourceId: "trusted-resource",
      }),
      command: expect.objectContaining({
        action: "send", workflowSatisfied: true, exactVersionMatches: true,
      }),
    }));
    expect(mocks.send).toHaveBeenCalledWith(expect.any(Object), {
      proposalId, expectedVersionId: versionId, expectedVersion: 1,
      expectedRowVersion: 4, idempotencyKey: "proposal-send-001",
    });
    await expect(result.json()).resolves.toMatchObject({
      proposal: { id: proposalId, status: "SENT", totalMinor: "25000" },
      delivery: "QUEUED",
    });
  });
});
