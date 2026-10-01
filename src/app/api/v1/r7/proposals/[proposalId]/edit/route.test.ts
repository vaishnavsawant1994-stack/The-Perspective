import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  resource: vi.fn(),
  edit: vi.fn(),
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
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, 400),
  r7Json: (body: unknown) => response(body, 200),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
}));
vi.mock("@/modules/r7/resources", () => ({
  loadR7ProposalResource: mocks.resource,
}));
vi.mock("@/modules/r7/proposal-edit", () => ({
  editDraftProposal: mocks.edit,
}));

import { POST } from "./route";

const proposalId = "00000000-0000-4000-8000-000000000101";
const versionId = "00000000-0000-4000-8000-000000000102";
const input = {
  expectedVersionId: versionId,
  expectedVersion: 1,
  expectedRowVersion: 4,
  currency: "USD",
  lines: [{ description: "Updated service", quantity: 2, unitAmountMinor: "12500" }],
};

function request(body: unknown = input) {
  return new Request("https://app.example.test/api/v1/r7/proposals/test/edit", {
    method: "POST",
    headers: { origin: "https://app.example.test", "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const route = { params: Promise.resolve({ proposalId }) };

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
  mocks.edit.mockResolvedValue({ kind: "ok", value: {
    id: proposalId, versionId, version: 1, rowVersion: 5, status: "DRAFT", currency: "USD",
    totalMinor: "25000", lineCount: 1,
  } });
});

describe("R7 Proposal Edit HTTP boundary", () => {
  it("rejects wrong origin before parsing or resolving authority", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.parse).not.toHaveBeenCalled();
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it.each([
    { ...input, status: "ACCEPTED" },
    { ...input, ownerOrganizationId: "foreign" },
    { ...input, totalMinor: "1" },
    { ...input, lines: [{ ...input.lines[0], lineTotalMinor: "1" }] },
    { ...input, lines: [{ ...input.lines[0], lineId: "00000000-0000-4000-8000-000000000999" }] },
    { ...input, lines: [{ ...input.lines[0], position: 2 }] },
    { ...input, lines: [{ ...input.lines[0], quantity: 0 }] },
    { ...input, lines: [{ ...input.lines[0], unitAmountMinor: "999999999999999999999" }] },
  ])("rejects authority, structure, derived, and malformed line fields", async (body) => {
    const result = await POST(request(body), route);
    expect(result.status).toBe(400);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.edit).not.toHaveBeenCalled();
  });

  it("denies a CLIENT identity before resource lookup and the TEAM edit command", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403),
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.resource).not.toHaveBeenCalled();
    expect(mocks.edit).not.toHaveBeenCalled();
  });

  it("conceals a foreign or missing proposal and does not invoke edit", async () => {
    mocks.resource.mockResolvedValueOnce(null);
    const result = await POST(request(), route);
    expect(result.status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.edit).not.toHaveBeenCalled();
  });

  it("requires the edit grant and exact row version before calling the domain command", async () => {
    mocks.authorize.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403),
    });
    const denied = await POST(request(), route);
    expect(denied.status).toBe(403);
    expect(mocks.edit).not.toHaveBeenCalled();

    mocks.authorize.mockResolvedValueOnce({ kind: "allowed" });
    const result = await POST(request(), route);
    expect(result.status).toBe(200);
    expect(mocks.authorize).toHaveBeenLastCalledWith(expect.objectContaining({
      permissionKey: "proposal.edit",
      command: expect.objectContaining({
        action: "edit",
        requestedFields: ["currency", "description", "quantity", "unitAmountMinor"],
        exactVersionMatches: true,
        optimisticConcurrencySatisfied: true,
      }),
    }));
    expect(mocks.edit).toHaveBeenCalledWith(expect.any(Object), {
      proposalId,
      expectedVersionId: versionId,
      expectedVersion: 1,
      expectedRowVersion: 4,
      currency: "USD",
      lines: [{ description: "Updated service", quantity: 2, unitAmountMinor: BigInt(12500) }],
    });
  });

  it("rejects stale versions before invoking the domain command", async () => {
    mocks.resource.mockResolvedValueOnce({
      resourceType: "proposal", resourceId: "trusted-resource", ownerOrganizationId: "team-org",
      visibility: "INTERNAL", sensitivity: "FINANCIAL", lifecycleState: "DRAFT", version: 3,
    });
    mocks.authorize.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403),
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.edit).not.toHaveBeenCalled();
  });
});
