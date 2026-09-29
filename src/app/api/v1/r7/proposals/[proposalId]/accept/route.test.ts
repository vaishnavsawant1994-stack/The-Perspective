import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  resource: vi.fn(),
  accept: vi.fn(),
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
  resolveR7ClientRequest: mocks.resolve,
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, 409),
  r7Json: (body: unknown, status = 200) => response(body, status),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
}));
vi.mock("@/modules/r7/resources", () => ({
  loadClientProposalAcceptanceResource: mocks.resource,
}));
vi.mock("@/modules/r7/proposal-acceptance", () => ({ acceptProposal: mocks.accept }));

import { POST } from "./route";

const origin = "https://app.example.test";
const proposalId = "00000000-0000-4000-8000-000000000201";
const versionId = "00000000-0000-4000-8000-000000000202";
const body = { expectedVersionId: versionId, expectedVersion: 3, expectedRowVersion: 8 };
const route = { params: Promise.resolve({ proposalId }) };

function request(payload: unknown = body, key = "customer-accept-001") {
  return new Request(`${origin}/api/v1/r7/proposals/${proposalId}/accept`, {
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
  mocks.resolve.mockResolvedValue({ kind: "authorized", context: {
    authentication: "authenticated", tenant: { surface: "CLIENT" }, membership: { surface: "CLIENT" },
  } });
  mocks.resource.mockResolvedValue({
    proposalId, proposalVersionId: versionId, currentVersion: 3, rowVersion: 8,
    separationOfDutySatisfied: true,
    authorizationResource: {
      resourceType: "client-proposal", resourceId: "trusted-proposal-resource",
      ownerOrganizationId: "team-org", clientOrganizationId: "client-org",
      visibility: "CLIENT_SHARED", sensitivity: "FINANCIAL", lifecycleState: "SENT", version: 3,
    },
  });
  mocks.authorize.mockResolvedValue({ kind: "allowed" });
  mocks.accept.mockResolvedValue({ kind: "ok", value: {
    proposalId, versionId, version: 3, status: "ACCEPTED",
    acceptedAt: "2026-09-29T10:00:00.000Z", replayed: false,
  } });
});

describe("R7 customer Proposal Acceptance HTTP boundary", () => {
  it("rejects wrong origin before parsing or resolving CLIENT authority", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.parse).not.toHaveBeenCalled();
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it("requires a bounded idempotency key and strict version-only request body", async () => {
    for (const key of ["", "short", "invalid key", "x".repeat(129)]) {
      expect((await POST(request(body, key), route)).status).toBe(400);
    }
    for (const payload of [
      { ...body, acceptanceEvidence: "customer said yes" },
      { ...body, actorUserId: "forged" },
      { ...body, status: "ACCEPTED" },
      { ...body, ownerOrganizationId: "team-org" },
    ]) expect((await POST(request(payload), route)).status).toBe(400);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.accept).not.toHaveBeenCalled();
  });

  it("does not allow anonymous or TEAM authority to reach customer acceptance", async () => {
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTH_REQUIRED" }, 401) });
    expect((await POST(request(), route)).status).toBe(401);
    mocks.resolve.mockResolvedValueOnce({ kind: "response", response: response({ code: "CLIENT_REQUIRED" }, 403) });
    expect((await POST(request(), route)).status).toBe(403);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.accept).not.toHaveBeenCalled();
  });

  it("conceals foreign proposals and requires the CLIENT proposal.accept grant and SoD", async () => {
    mocks.resource.mockResolvedValueOnce(null);
    expect((await POST(request(), route)).status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();

    mocks.authorize.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403) });
    expect((await POST(request(), route)).status).toBe(403);
    expect(mocks.authorize).toHaveBeenLastCalledWith(expect.objectContaining({
      permissionKey: "proposal.accept",
      resource: expect.objectContaining({
        resourceType: "client-proposal", ownerOrganizationId: "team-org",
        clientOrganizationId: "client-org", resourceId: "trusted-proposal-resource",
      }),
      command: expect.objectContaining({
        action: "accept", workflowSatisfied: true, exactVersionMatches: true,
        optimisticConcurrencySatisfied: true, separationOfDutySatisfied: true,
      }),
    }));
    expect(mocks.accept).not.toHaveBeenCalled();

    mocks.authorize.mockResolvedValueOnce({ kind: "response", response: response({ code: "SEPARATION_OF_DUTY_DENIED" }, 403) });
    expect((await POST(request(), route)).status).toBe(403);
    expect(mocks.accept).not.toHaveBeenCalled();
  });

  it("rejects stale/superseded version and lifecycle before invoking the command", async () => {
    mocks.resource.mockResolvedValueOnce({
      proposalId, proposalVersionId: "00000000-0000-4000-8000-000000000299",
      currentVersion: 3, rowVersion: 8, separationOfDutySatisfied: true,
      authorizationResource: { resourceType: "client-proposal", lifecycleState: "SENT", version: 3 },
    });
    expect((await POST(request(), route)).status).toBe(409);
    mocks.resource.mockResolvedValueOnce({
      proposalId, proposalVersionId: versionId, currentVersion: 3, rowVersion: 8,
      separationOfDutySatisfied: true,
      authorizationResource: { resourceType: "client-proposal", lifecycleState: "SUPERSEDED", version: 3 },
    });
    expect((await POST(request(), route)).status).toBe(409);
    expect(mocks.accept).not.toHaveBeenCalled();
  });

  it("invokes only the explicit authenticated-client acceptance command", async () => {
    const result = await POST(request(), route);
    expect(result.status).toBe(200);
    expect(mocks.accept).toHaveBeenCalledWith(expect.any(Object), {
      proposalId, expectedVersionId: versionId, expectedVersion: 3,
      expectedRowVersion: 8, idempotencyKey: "customer-accept-001",
    });
    await expect(result.json()).resolves.toMatchObject({
      acceptance: { proposalId, versionId, version: 3, status: "ACCEPTED", replayed: false },
    });
  });
});
