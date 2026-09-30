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
  r7CommandError: (code: string) => response({ code: "R7_COMMAND_REJECTED", internalCode: code }, 409),
  r7Json: (body: unknown, status = 200) => response(body, status),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
}));
vi.mock("@/modules/r7/resources", () => ({ loadR7ContractResource: mocks.resource }));
vi.mock("@/modules/r7/signature-request", () => ({ requestContractSignature: mocks.send }));

import { POST } from "./route";

const origin = "https://app.example.test";
const contractId = "00000000-0000-4000-8000-000000000201";
const versionId = "00000000-0000-4000-8000-000000000202";
const digest = "ab".repeat(32);
const body = {
  expectedVersionId: versionId,
  expectedVersion: 1,
  expectedRowVersion: 3,
  expectedDocumentSha256: digest,
};
const route = { params: Promise.resolve({ contractId }) };

function request(payload: unknown = body, key = "contract-send-001") {
  return new Request(`${origin}/api/v1/r7/contracts/${contractId}/send`, {
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
    resourceType: "contract",
    resourceId: "trusted-contract",
    ownerOrganizationId: "team-org",
    visibility: "INTERNAL",
    sensitivity: "FINANCIAL",
    lifecycleState: "READY_FOR_SIGNATURE",
    version: 3,
  });
  mocks.authorize.mockResolvedValue({ kind: "allowed" });
  mocks.send.mockResolvedValue({
    kind: "ok",
    value: {
      signatureRequestId: "00000000-0000-4000-8000-000000000203",
      contractId,
      contractVersionId: versionId,
      provider: "test-provider",
      providerRequestId: "env-1",
      contractStatus: "OUT_FOR_SIGNATURE",
      replayed: false,
    },
  });
});

describe("R7 contract.send HTTP boundary", () => {
  it("rejects a foreign origin before authority is resolved", async () => {
    mocks.sameOrigin.mockReturnValue(false);
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("rejects malformed idempotency keys before authority is resolved", async () => {
    for (const key of ["", "short", "bad key", "x".repeat(129)]) {
      expect((await POST(request(body, key), route)).status).toBe(400);
    }
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it.each([
    { ...body, status: "SIGNED" },
    { ...body, provider: "evil-provider" },
    { ...body, providerRequestId: "forged" },
    { ...body, signerKey: "intruder" },
    { ...body, ownerOrganizationId: "foreign-org" },
    { ...body, documentSha256: digest },
  ])("rejects protected provider, signer, and lifecycle fields", async (payload) => {
    expect((await POST(request(payload), route)).status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("conceals a missing contract before authorization", async () => {
    mocks.resource.mockResolvedValue(null);
    const result = await POST(request(), route);
    expect(result.status).toBe(404);
    expect(mocks.authorize).not.toHaveBeenCalled();
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("requires contract.send and does not call the command when denied", async () => {
    mocks.authorize.mockResolvedValue({ kind: "response", response: response({ code: "AUTHZ_DENIED" }, 403) });
    const result = await POST(request(), route);
    expect(result.status).toBe(403);
    expect(mocks.authorize).toHaveBeenCalledWith(expect.objectContaining({
      permissionKey: "contract.send",
      command: expect.objectContaining({ action: "send" }),
    }));
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("denies a draft contract before the provider is contacted", async () => {
    mocks.resource.mockResolvedValue({
      resourceType: "contract",
      resourceId: "trusted-contract",
      ownerOrganizationId: "team-org",
      visibility: "INTERNAL",
      sensitivity: "FINANCIAL",
      lifecycleState: "DRAFT",
      version: 3,
    });
    const result = await POST(request(), route);
    expect(result.status).toBe(409);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("submits only the exact version identifiers to the command", async () => {
    const result = await POST(request(), route);
    expect(result.status).toBe(202);
    expect(mocks.send).toHaveBeenCalledWith(
      { authentication: "authenticated" },
      {
        contractId,
        expectedVersionId: versionId,
        expectedVersion: 1,
        expectedRowVersion: 3,
        expectedDocumentSha256: digest,
        idempotencyKey: "contract-send-001",
      },
    );
  });
});
