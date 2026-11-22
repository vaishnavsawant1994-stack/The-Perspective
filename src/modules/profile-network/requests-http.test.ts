import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sameOrigin: vi.fn(),
  rateKey: vi.fn(),
  executeRaw: vi.fn(),
  queryRaw: vi.fn(),
  queryRawUnsafe: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/modules/authentication/http/request-security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/modules/authentication/http/request-security")>();
  return { ...actual, requireSameOrigin: mocks.sameOrigin };
});
vi.mock("@/modules/profile-network/request-rate-key", () => ({
  profileRequestRateKeyFromHeaders: mocks.rateKey,
}));
vi.mock("@/modules/persistence/client", () => ({
  getPrismaClient: () => ({ $transaction: mocks.transaction }),
}));
vi.mock("@/modules/authorization/http", () => ({
  authorizationProblem: (status: number, code: string) =>
    new Response(JSON.stringify({ code }), { status }),
  authorizeTrustedHttpOperation: vi.fn(),
  resolveAuthorizedHttpRequest: vi.fn(),
}));
vi.mock("@/modules/commercial/persistence", () => ({
  withCommercialTenantTransaction: vi.fn(),
}));
vi.mock("@/modules/r6/security", () => ({
  r6MfaSatisfied: vi.fn(() => false),
  r6RecentAuthenticationSatisfied: vi.fn(() => false),
}));

import { submitPublicProfileRequest } from "./requests-http";

const origin = "https://app.example.test";
const subjectSlug = "synthetic-company";
const contactEmail = "qa@example.test";
const rateKey = "a".repeat(64);

function request(payload: unknown = {
  kind: "CORRECTION",
  subjectKind: "COMPANY",
  subjectSlug,
  description: "A synthetic correction request for isolated HTTP boundary testing.",
  sourceUrl: "https://example.test/source",
  contactEmail,
  website: "",
}) {
  return new Request(`${origin}/api/v1/profile-network/requests`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sameOrigin.mockReturnValue(true);
  mocks.rateKey.mockReturnValue(rateKey);
  mocks.executeRaw.mockResolvedValue(0);
  mocks.queryRaw.mockResolvedValue([]);
  mocks.queryRawUnsafe.mockResolvedValue([{ result: "synthetic-request-id" }]);
  mocks.transaction.mockImplementation(async (callback: (tx: unknown) => Promise<unknown>) =>
    callback({
      $executeRawUnsafe: mocks.executeRaw,
      $queryRaw: mocks.queryRaw,
      $queryRawUnsafe: mocks.queryRawUnsafe,
    }),
  );
});

describe("Profile Network public request HTTP boundary", () => {
  it("stores only through the public database function and returns an opaque 202", async () => {
    const result = await submitPublicProfileRequest(request());
    const body = await result.json();

    expect(result.status).toBe(202);
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(body.message).toContain("private editorial review queue");
    expect(JSON.stringify(body)).not.toContain(subjectSlug);
    expect(JSON.stringify(body)).not.toContain(contactEmail);
    expect(mocks.executeRaw).toHaveBeenCalledWith("SET LOCAL ROLE perspective_public");
    expect(mocks.queryRaw).toHaveBeenCalled();
    expect(mocks.queryRawUnsafe).toHaveBeenCalledWith(
      expect.stringContaining("profiles.pn04_public_submit"),
      "CORRECTION",
      "COMPANY",
      subjectSlug,
      "A synthetic correction request for isolated HTTP boundary testing.",
      "https://example.test/source",
      contactEmail,
      rateKey,
      "",
    );
  });

  it("rejects a foreign origin before parsing or opening the database", async () => {
    mocks.sameOrigin.mockReturnValue(false);

    const result = await submitPublicProfileRequest(request());

    expect(result.status).toBe(403);
    expect(mocks.rateKey).not.toHaveBeenCalled();
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it.each([
    {
      kind: "CORRECTION",
      subjectKind: "COMPANY",
      subjectSlug: "not a valid slug",
      description: "A valid enough synthetic description for this request.",
      website: "",
    },
    {
      kind: "CORRECTION",
      subjectKind: "COMPANY",
      subjectSlug,
      description: "A valid enough synthetic description for this request.",
      sourceUrl: "http://example.test/insecure",
      website: "",
    },
    {
      kind: "CLAIM",
      subjectKind: "COMPANY",
      subjectSlug,
      description: "A valid enough synthetic description for this request.",
      website: "",
    },
  ])("rejects invalid request input without touching the database", async (payload) => {
    const result = await submitPublicProfileRequest(request(payload));

    expect(result.status).toBe(400);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("fails closed when the database transaction fails", async () => {
    mocks.transaction.mockRejectedValue(new Error("synthetic database failure"));

    const result = await submitPublicProfileRequest(request());
    const body = await result.json();

    expect(result.status).toBe(503);
    expect(JSON.stringify(body)).not.toContain("synthetic database failure");
    expect(JSON.stringify(body)).not.toContain(contactEmail);
  });
});
