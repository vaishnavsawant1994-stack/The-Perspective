import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  list: vi.fn(),
  get: vi.fn(),
}));

function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status });
}

vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  parseR7ListRequest: (request: Request) => {
    const raw = new URL(request.url).searchParams.get("limit");
    const limit = raw === null ? 50 : Number(raw);
    return Number.isInteger(limit) && limit >= 1 && limit <= 100
      ? { limit }
      : undefined;
  },
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
  r7Json: (body: unknown) => response(body, 200),
}));

vi.mock("@/modules/r7/queries", () => ({
  listAuthorizedProposals: mocks.list,
  getAuthorizedProposal: mocks.get,
}));

vi.mock("@/modules/authorization/http", () => ({
  authorizationProblem: (status: number, code: string) => response({ code }, status),
}));

import { GET as listProposals } from "./route";
import { GET as getProposal } from "./[proposalId]/route";

const origin = "https://app.example.test";
const proposalId = "00000000-0000-4000-8000-000000000101";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolve.mockResolvedValue({
    kind: "authorized",
    context: { tenant: { organizationId: "org-1", surface: "TEAM" } },
  });
  mocks.list.mockResolvedValue([]);
  mocks.get.mockResolvedValue(null);
});

describe("R7 Proposal HTTP hostile boundary", () => {
  it("does not execute proposal queries for an unauthenticated list request", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response",
      response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });

    const result = await listProposals(new Request(`${origin}/api/v1/r7/proposals`));

    expect(result.status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("does not execute proposal queries for an unauthenticated detail request", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response",
      response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });

    const result = await getProposal(
      new Request(`${origin}/api/v1/r7/proposals/${proposalId}`),
      { params: Promise.resolve({ proposalId }) },
    );

    expect(result.status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("rejects malformed identifiers before resource lookup", async () => {
    const result = await getProposal(
      new Request(`${origin}/api/v1/r7/proposals/not-a-uuid`),
      { params: Promise.resolve({ proposalId: "not-a-uuid" }) },
    );

    expect(result.status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("conceals a missing or foreign proposal without returning resource data", async () => {
    const result = await getProposal(
      new Request(`${origin}/api/v1/r7/proposals/${proposalId}`),
      { params: Promise.resolve({ proposalId }) },
    );

    expect(result.status).toBe(404);
    await expect(result.json()).resolves.toEqual({ code: "AUTHZ_NOT_FOUND" });
  });

  it("rejects invalid list limits without querying", async () => {
    const result = await listProposals(
      new Request(`${origin}/api/v1/r7/proposals?limit=101`),
    );

    expect(result.status).toBe(400);
    expect(mocks.list).not.toHaveBeenCalled();
    expect(mocks.resolve).not.toHaveBeenCalled();
  });
});
