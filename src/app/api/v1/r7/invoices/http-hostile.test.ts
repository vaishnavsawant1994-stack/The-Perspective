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
  listAuthorizedInvoices: mocks.list,
  getAuthorizedInvoice: mocks.get,
}));
vi.mock("@/modules/authorization/http", () => ({
  authorizationProblem: (status: number, code: string) => response({ code }, status),
}));

import { GET as listInvoices } from "./route";
import { GET as getInvoice } from "./[invoiceId]/route";
const origin = "https://app.example.test";
const invoiceId = "00000000-0000-4000-8000-000000000102";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.resolve.mockResolvedValue({
    kind: "authorized", context: { tenant: { organizationId: "org-1", surface: "TEAM" } },
  });
  mocks.list.mockResolvedValue([]);
  mocks.get.mockResolvedValue(null);
});

describe("R7 Invoice read HTTP hostile boundary", () => {
  it("denies anonymous list before querying", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });
    const result = await listInvoices(new Request(`${origin}/api/v1/r7/invoices`));
    expect(result.status).toBe(401);
    expect(mocks.list).not.toHaveBeenCalled();
  });
  it("rejects invalid list limits without authentication or query", async () => {
    const result = await listInvoices(new Request(`${origin}/api/v1/r7/invoices?limit=101`));
    expect(result.status).toBe(400);
    expect(mocks.resolve).not.toHaveBeenCalled();
    expect(mocks.list).not.toHaveBeenCalled();
  });
  it("denies anonymous detail before parsing or lookup", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response", response: response({ code: "AUTHZ_AUTH_REQUIRED" }, 401),
    });
    const result = await getInvoice(
      new Request(`${origin}/api/v1/r7/invoices/not-a-uuid`),
      { params: Promise.resolve({ invoiceId: "not-a-uuid" }) },
    );
    expect(result.status).toBe(401);
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it("rejects malformed IDs before invoice lookup", async () => {
    const result = await getInvoice(
      new Request(`${origin}/api/v1/r7/invoices/not-a-uuid`),
      { params: Promise.resolve({ invoiceId: "not-a-uuid" }) },
    );
    expect(result.status).toBe(400);
    expect(mocks.get).not.toHaveBeenCalled();
  });
  it("conceals missing and foreign invoices", async () => {
    const result = await getInvoice(
      new Request(`${origin}/api/v1/r7/invoices/${invoiceId}`),
      { params: Promise.resolve({ invoiceId }) },
    );
    expect(result.status).toBe(404);
    await expect(result.json()).resolves.toEqual({ code: "AUTHZ_NOT_FOUND" });
  });
});
