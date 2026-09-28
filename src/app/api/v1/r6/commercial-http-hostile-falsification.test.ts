import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resolve: vi.fn(),
  authorize: vi.fn(),
  loadDeal: vi.fn(),
  loadClient: vi.fn(),
  createDeal: vi.fn(),
  updateDeal: vi.fn(),
  moveDeal: vi.fn(),
  convertDeal: vi.fn(),
  addRelationship: vi.fn(),
  createPipeline: vi.fn(),
  listDeals: vi.fn(),
}));

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

vi.mock("@/modules/authorization/http", () => ({
  authorizeTrustedHttpOperation: mocks.authorize,
  authorizationProblem: (status: number, code: string) => json({ code }, status),
}));

vi.mock("@/modules/r6/http", () => ({
  resolveR6TeamRequest: mocks.resolve,
  invalidR6Request: () => json({ code: "R6_INVALID_REQUEST" }, 400),
  r6CommandError: (code: string) =>
    json(
      { code: "R6_COMMAND_REJECTED" },
      ["STALE_WRITE", "CONFLICT", "TRANSITION_DENIED"].includes(code) ? 409 : 400,
    ),
  r6Json: (body: unknown, status = 200) => json(body, status),
  unavailableR6Request: () => json({ code: "AUTHZ_UNAVAILABLE" }, 503),
  parseR6ListRequest: () => ({ limit: 20 }),
}));

vi.mock("@/modules/r6/resources", () => ({
  loadR6DealResource: mocks.loadDeal,
  loadR6ClientAccountResource: mocks.loadClient,
  buildProspectiveR6Resource: () => ({ resourceType: "deal" }),
}));

vi.mock("@/modules/commercial/core", () => ({
  createDeal: mocks.createDeal,
  updateDealFields: mocks.updateDeal,
  moveDeal: mocks.moveDeal,
  convertDealToClient: mocks.convertDeal,
  addClientRelationship: mocks.addRelationship,
  createDealPipeline: mocks.createPipeline,
}));

vi.mock("@/modules/r6/queries", () => ({
  listAuthorizedDeals: mocks.listDeals,
  listAuthorizedDealPipelines: vi.fn(),
  listAuthorizedClients: vi.fn(),
  listAuthorizedClientRelationships: vi.fn(),
  getAuthorizedDeal: vi.fn(),
  getAuthorizedClient: vi.fn(),
}));

import { GET as listDeals, POST as createDeal } from "./deals/route";
import { PATCH as patchDeal } from "./deals/[dealId]/route";
import { POST as moveDeal } from "./deals/[dealId]/move/route";
import { POST as convertDeal } from "./deals/[dealId]/convert-to-client/route";
import { POST as addRelationship } from "./clients/[clientAccountId]/relationships/route";
import { POST as createPipeline } from "./commercial/pipelines/route";

const origin = "https://app.example.test";
const context = {
  tenant: { organizationId: "org-test", surface: "TEAM" },
  membership: { membershipId: "membership-test", surface: "TEAM" },
};
const dealId = "00000000-0000-4000-8000-000000000201";
const clientId = "00000000-0000-4000-8000-000000000202";
const pipelineId = "00000000-0000-4000-8000-000000000203";
const companyId = "00000000-0000-4000-8000-000000000204";
const stageId = "00000000-0000-4000-8000-000000000205";
const contactId = "00000000-0000-4000-8000-000000000206";

function request(path: string, body: unknown, requestOrigin = origin) {
  return new Request(`${origin}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", origin: requestOrigin },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("PERSPECTIVE_PUBLIC_APP_ORIGIN", origin);
  mocks.resolve.mockResolvedValue({ kind: "authorized", context });
  mocks.authorize.mockResolvedValue({ kind: "allowed", decision: { decision: "ALLOW" } });
  mocks.loadDeal.mockResolvedValue({
    resourceType: "deal",
    ownerOrganizationId: "org-test",
    version: 1,
  });
  mocks.loadClient.mockResolvedValue({
    resourceType: "client-account",
    ownerOrganizationId: "org-test",
    version: 1,
  });
  mocks.createDeal.mockResolvedValue({ kind: "ok", value: { dealId } });
  mocks.updateDeal.mockResolvedValue({ kind: "ok", value: { dealId, rowVersion: 2 } });
  mocks.moveDeal.mockResolvedValue({ kind: "ok", value: { dealId, toStageId: stageId } });
  mocks.convertDeal.mockResolvedValue({ kind: "ok", value: { clientAccountId: clientId } });
  mocks.addRelationship.mockResolvedValue({ kind: "ok", value: { relationshipId: "rel" } });
  mocks.createPipeline.mockResolvedValue({ kind: "ok", value: { pipelineId } });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("R6 Commercial HTTP hostile falsification", () => {
  it("fails closed when deal list has no authenticated team context", async () => {
    mocks.resolve.mockResolvedValueOnce({
      kind: "response",
      response: json({ code: "AUTHZ_UNAUTHENTICATED" }, 401),
    });
    const response = await listDeals(new Request(`${origin}/api/v1/r6/deals?limit=20`));
    expect(response.status).toBe(401);
    expect(mocks.listDeals).not.toHaveBeenCalled();
  });

  it("maps illegal stage transitions to conflict without durable success", async () => {
    mocks.moveDeal.mockResolvedValueOnce({ kind: "error", code: "TRANSITION_DENIED" });
    const response = await moveDeal(
      request(`/api/v1/r6/deals/${dealId}/move`, {
        toStageId: stageId,
        expectedRowVersion: 1,
      }),
      { params: Promise.resolve({ dealId }) },
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ code: "R6_COMMAND_REJECTED" });
  });

  it("rejects cross-origin deal creation before domain mutation", async () => {
    const response = await createDeal(
      request(
        "/api/v1/r6/deals",
        { pipelineId, companyId },
        "https://evil.example",
      ),
    );
    expect(response.status).toBe(403);
    expect(mocks.createDeal).not.toHaveBeenCalled();
  });

  it("conceals a missing deal before move", async () => {
    mocks.loadDeal.mockResolvedValueOnce(null);
    const response = await moveDeal(
      request(`/api/v1/r6/deals/${dealId}/move`, {
        toStageId: stageId,
        expectedRowVersion: 1,
      }),
      { params: Promise.resolve({ dealId }) },
    );
    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toMatchObject({ code: "AUTHZ_NOT_FOUND" });
    expect(mocks.moveDeal).not.toHaveBeenCalled();
  });

  it("conceals a missing deal before convert-to-client", async () => {
    mocks.loadDeal.mockResolvedValueOnce(null);
    const response = await convertDeal(
      request(`/api/v1/r6/deals/${dealId}/convert-to-client`, {
        expectedRowVersion: 1,
        idempotencyKey: "convert-1",
      }),
      { params: Promise.resolve({ dealId }) },
    );
    expect(response.status).toBe(404);
    expect(mocks.convertDeal).not.toHaveBeenCalled();
  });

  it("conceals a missing client account before relationship create", async () => {
    mocks.loadClient.mockResolvedValueOnce(null);
    const response = await addRelationship(
      request(`/api/v1/r6/clients/${clientId}/relationships`, {
        contactId,
        relationshipRole: "BILLING",
      }),
      { params: Promise.resolve({ clientAccountId: clientId }) },
    );
    expect(response.status).toBe(404);
    expect(mocks.addRelationship).not.toHaveBeenCalled();
  });

  it("maps stale deal field writes to conflict", async () => {
    mocks.updateDeal.mockResolvedValueOnce({ kind: "error", code: "STALE_WRITE" });
    const response = await patchDeal(
      request(`/api/v1/r6/deals/${dealId}`, {
        expectedRowVersion: 1,
        probability: 0.4,
      }),
      { params: Promise.resolve({ dealId }) },
    );
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toMatchObject({ code: "R6_COMMAND_REJECTED" });
  });

  it("rejects mass-assigned owner and organization fields on deal create", async () => {
    const response = await createDeal(
      request("/api/v1/r6/deals", {
        pipelineId,
        companyId,
        ownerOrganizationId: "org-attacker",
        ownerMembershipId: "membership-attacker",
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.createDeal).not.toHaveBeenCalled();
  });

  it("rejects mass-assigned stageId on deal create", async () => {
    const response = await createDeal(
      request("/api/v1/r6/deals", {
        pipelineId,
        companyId,
        stageId,
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.createDeal).not.toHaveBeenCalled();
  });

  it("rejects malformed deal identifiers before resource load", async () => {
    const response = await moveDeal(
      request("/api/v1/r6/deals/not-a-uuid/move", {
        toStageId: stageId,
        expectedRowVersion: 1,
      }),
      { params: Promise.resolve({ dealId: "not-a-uuid" }) },
    );
    expect(response.status).toBe(400);
    expect(mocks.loadDeal).not.toHaveBeenCalled();
  });

  it("does not accept WON as a pipeline canonical class", async () => {
    const response = await createPipeline(
      request("/api/v1/r6/commercial/pipelines", {
        name: "Attack",
        version: 1,
        stages: [
          { key: "q", name: "Q", position: 1, canonicalClass: "QUALIFIED" },
          { key: "i", name: "I", position: 2, canonicalClass: "INTERESTED" },
          { key: "d", name: "D", position: 3, canonicalClass: "DISCOVERY_SCHEDULED" },
          { key: "c", name: "C", position: 4, canonicalClass: "DISCOVERY_COMPLETED" },
          { key: "w", name: "W", position: 5, canonicalClass: "WON" },
        ],
      }),
    );
    expect(response.status).toBe(400);
    expect(mocks.createPipeline).not.toHaveBeenCalled();
  });
});
