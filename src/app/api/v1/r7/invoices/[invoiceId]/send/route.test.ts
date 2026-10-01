import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  send: vi.fn(),
  subject: vi.fn(),
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
vi.mock("@/modules/r7/invoice-send", () => ({ sendInvoice: mocks.send }));
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
const invoiceId = "00000000-0000-4000-8000-000000000801";
const route = { params: Promise.resolve({ invoiceId }) };

function request(payload: unknown = { expectedRowVersion: 2 }, key = "invoice-send-01") {
  return new Request(`${origin}/api/v1/r7/invoices/${invoiceId}/send`, {
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
  mocks.resolve.mockResolvedValue({ kind: "authorized", context: { tenant: { organizationId: "team" } } });
  mocks.subject.mockResolvedValue({
    resource: { lifecycleState: "FINALIZED", version: 2, resourceType: "invoice" },
  });
  mocks.authorize.mockResolvedValue({ kind: "authorized" });
  mocks.send.mockResolvedValue({
    kind: "ok",
    value: { invoiceId, status: "FINALIZED", rowVersion: 2, replayed: false, delivery: "QUEUED" },
  });
});

describe("R7 invoice.send HTTP", () => {
  it("rejects a cross-origin request before authorization", async () => {
    mocks.sameOrigin.mockReturnValueOnce(false);
    expect((await POST(request(), route)).status).toBe(403);
    expect(mocks.authorize).not.toHaveBeenCalled();
  });

  it("rejects protected fields", async () => {
    const result = await POST(request({ expectedRowVersion: 2, totalMinor: "1" }), route);
    expect(result.status).toBe(400);
    expect(mocks.send).not.toHaveBeenCalled();
  });

  it("does not call send when the invoice is still a draft", async () => {
    mocks.subject.mockResolvedValueOnce({
      resource: { lifecycleState: "DRAFT", version: 1, resourceType: "invoice" },
    });
    mocks.authorize.mockResolvedValueOnce({ kind: "response", response: response({ code: "AUTHZ_NOT_FOUND" }, 404) });
    expect((await POST(request({ expectedRowVersion: 1 }), route)).status).toBe(404);
    expect(mocks.send).not.toHaveBeenCalled();
    expect(mocks.authorize.mock.calls[0]?.[0].command.workflowSatisfied).toBe(false);
  });

  it("queues delivery without treating replay as a second send", async () => {
    const created = await POST(request(), route);
    expect(created.status).toBe(202);
    mocks.send.mockResolvedValueOnce({
      kind: "ok",
      value: { invoiceId, status: "FINALIZED", rowVersion: 2, replayed: true, delivery: "QUEUED" },
    });
    expect((await POST(request(), route)).status).toBe(200);
  });
});
