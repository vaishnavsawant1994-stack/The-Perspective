import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ resolve: vi.fn(), list: vi.fn(), get: vi.fn() }));
function response(body: unknown, status: number) {
  return new Response(JSON.stringify(body), { status });
}
vi.mock("@/modules/r7/http", () => ({
  resolveR7TeamRequest: mocks.resolve,
  parseR7ListRequest: (request: Request) => {
    const raw = new URL(request.url).searchParams.get("limit");
    const limit = raw === null ? 50 : Number(raw);
    return Number.isInteger(limit) && limit >= 1 && limit <= 100 ? { limit } : undefined;
  },
  invalidR7Request: () => response({ code: "R7_INVALID_REQUEST" }, 400),
  unavailableR7Request: () => response({ code: "AUTHZ_UNAVAILABLE" }, 503),
  r7Json: (body: unknown) => response(body, 200),
}));
vi.mock("@/modules/r7/queries", () => ({
  listAuthorizedPayments: mocks.list,
  getAuthorizedPayment: mocks.get,
}));
vi.mock("@/modules/authorization/http", () => ({
  authorizationProblem: (status: number, code: string) => response({ code }, status),
}));

import { GET as listPayments } from "./route";
import { GET as getPayment } from "./[paymentId]/route";

const origin = "https://app.example.test";
const paymentId = "00000000-0000-4000-8000-000000000701";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolve.mockResolvedValue({ kind: "authorized", context: { tenant: { organizationId: "org-1" } } });
  mocks.list.mockResolvedValue([]);
  mocks.get.mockResolvedValue(null);
});

describe("R7 payment read HTTP", () => {
  it("denies anonymous list before querying", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response",
      response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });
    const result = await listPayments(new Request(`${origin}/api/v1/r7/payments`));
    expect(result.status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });

  it("rejects an invalid limit before authentication", async () => {
    const result = await listPayments(new Request(`${origin}/api/v1/r7/payments?limit=0`));
    expect(result.status).toBe(400);
    expect(mocks.resolve).not.toHaveBeenCalled();
  });

  it("rejects a malformed payment id before lookup", async () => {
    const result = await getPayment(
      new Request(`${origin}/api/v1/r7/payments/nope`),
      { params: Promise.resolve({ paymentId: "nope" }) },
    );
    expect(result.status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });

  it("conceals a missing payment", async () => {
    const result = await getPayment(
      new Request(`${origin}/api/v1/r7/payments/${paymentId}`),
      { params: Promise.resolve({ paymentId }) },
    );
    expect(result.status).toBe(404);
  });
});
