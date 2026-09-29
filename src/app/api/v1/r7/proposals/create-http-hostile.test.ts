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

vi.mock("@/modules/r7/commands", () => ({
  createDraftProposal: mocks.create,
}));

vi.mock("@/modules/r7/resources", () => ({
  buildProspectiveR7ProposalResource: mocks.buildResource,
}));

vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  parseR7ListRequest: () => ({ limit: 50 }),
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, 400),
  r7Json: (body: unknown, status = 200) => response(body, status),
}));

vi.mock("@/modules/r7/queries", () => ({
  listAuthorizedProposals: vi.fn(),
  getAuthorizedProposal: vi.fn(),
}));

import { POST as createProposal } from "./route";

const origin = "https://app.example.test";
const dealId = "00000000-0000-4000-8000-000000000101";
const acceptedBody = {
  dealId,
  currency: "USD",
  lines: [{ description: "Editorial package", quantity: 2, unitAmountMinor: "150000" }],
};

function request(body: unknown = acceptedBody, idempotencyKey = "proposal-create-001") {
  return new Request(`${origin}/api/v1/r7/proposals`, {
    method: "POST",
    headers: {
      origin,
      "content-type": "application/json",
      "idempotency-key": idempotencyKey,
    },
    body: JSON.stringify(body),
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
      tenant: { organizationId: "team-org", surface: "TEAM" },
      membership: { membershipId: "active-team-membership", organizationId: "team-org", surface: "TEAM" },
    },
  });
  mocks.buildResource.mockReturnValue({
    resourceType: "proposal",
    resourceId: "server-generated-proposal-context",
    ownerOrganizationId: "team-org",
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: "DRAFT",
    version: 1,
  });
  mocks.authorize.mockResolvedValue({ kind: "authorized" });
  mocks.create.mockResolvedValue({
    kind: "ok",
    value: {
      id: "proposal-1",
      versionId: "proposal-version-1",
      version: 1,
      status: "DRAFT",
      currency: "USD",
      totalMinor: "300000",
    },
  });
});

describe("R7 Proposal Create HTTP hostile boundary", () => {
  it("rejects a wrong origin before parsing or resolving authority", async () => {
    mocks.sameOrigin.mockReturnValue(false);

    const result = await createProposal(request());

    expect(result.status).toBe(403);
    expect(mocks.parse).not.toHaveBeenCalled();
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("does not authorize or invoke the command for an anonymous session", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response",
      response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });

    const result = await createProposal(request());

    expect(result.status).toBe(401);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("rejects malformed or authority-bearing fields before resolving the session", async () => {
    const attacks = [
      { ...acceptedBody, ownerOrganizationId: "attacker-org" },
      { ...acceptedBody, status: "SENT" },
      { ...acceptedBody, totalMinor: "1" },
      { ...acceptedBody, lines: [{ ...acceptedBody.lines[0], lineTotalMinor: "1" }] },
      { ...acceptedBody, currency: "usd" },
      { ...acceptedBody, lines: [{ ...acceptedBody.lines[0], unitAmountMinor: "1.5" }] },
    ];

    for (const body of attacks) {
      const result = await createProposal(request(body));
      expect(result.status).toBe(400);
    }
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("requires a bounded idempotency key before resolving authority", async () => {
    for (const key of ["", "short", "invalid key", "x".repeat(129)]) {
      const result = await createProposal(request(acceptedBody, key));
      expect(result.status).toBe(400);
    }
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("fails closed when proposal.edit authorization is denied", async () => {
    mocks.authorize.mockResolvedValueOnce({
      kind: "response",
      response: response({ code: "AUTHZ_DENIED" }, 403),
    });

    const result = await createProposal(request());

    expect(result.status).toBe(403);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "proposal.edit",
      resource: expect.objectContaining({
        ownerOrganizationId: "team-org",
        lifecycleState: "DRAFT",
        resourceId: "server-generated-proposal-context",
      }),
      command: expect.objectContaining({ action: "create" }),
    }));
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it("passes only validated fields and integer minor units to the domain command", async () => {
    const result = await createProposal(request());

    expect(result.status).toBe(201);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "proposal.edit",
      resource: expect.objectContaining({ ownerOrganizationId: "team-org" }),
      command: expect.objectContaining({
        action: "create",
        requestedFields: expect.arrayContaining(["dealId", "currency", "unitAmountMinor"]),
      }),
    }));
    expect(mocks.create).toHaveBeenCalledWith(
      expect.any(Object),
      {
        dealId,
        currency: "USD",
        lines: [{ description: "Editorial package", quantity: 2, unitAmountMinor: BigInt(150000) }],
        idempotencyKey: "proposal-create-001",
      },
    );
    await expect(result.json()).resolves.toEqual({
      proposal: {
        id: "proposal-1",
        versionId: "proposal-version-1",
        version: 1,
        status: "DRAFT",
        currency: "USD",
        totalMinor: "300000",
      },
    });
  });

  it("does not expose domain error details in the HTTP response", async () => {
    mocks.create.mockResolvedValueOnce({ kind: "error", code: "TEAM_REQUIRED" });

    const result = await createProposal(request());

    expect(result.status).toBe(400);
    await expect(result.json()).resolves.toEqual({
      code: "R7_COMMAND_REJECTED",
      internalCode: "TEAM_REQUIRED",
    });
  });
});
