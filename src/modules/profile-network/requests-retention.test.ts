import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  execute: vi.fn(),
  query: vi.fn(),
  queryUnsafe: vi.fn(),
  transaction: vi.fn(),
}));

vi.mock("@/modules/persistence/client", () => ({
  getPrismaClient: () => ({ $transaction: mocks.transaction }),
}));

import { purgeExpiredProfileRequests } from "./requests-retention";

const token = "pn04-retention-test-token-0123456789abcdef";
const actorId = "4f3c2c9b-587a-4af8-91ab-43a2d0a0c219";
const organizationId = "e8e6149b-88c2-4a4a-a76c-1df5355b08cc";

describe("profile request retention worker", () => {
  afterEach(() => vi.unstubAllEnvs());

  beforeEach(() => {
    vi.stubEnv("PERSPECTIVE_PN04_RETENTION_TOKEN", token);
    vi.stubEnv("PERSPECTIVE_PN04_RETENTION_ACTOR_ID", actorId);
    vi.stubEnv("PERSPECTIVE_PN04_RETENTION_ORGANIZATION_ID", organizationId);
    mocks.execute.mockReset().mockResolvedValue(0);
    mocks.query.mockReset().mockResolvedValue([]);
    mocks.queryUnsafe.mockReset().mockResolvedValue([{ deleted: 7 }]);
    mocks.transaction.mockReset().mockImplementation((work: (transaction: unknown) => unknown) =>
      work({ $executeRawUnsafe: mocks.execute, $queryRaw: mocks.query, $queryRawUnsafe: mocks.queryUnsafe }),
    );
  });

  it("rejects missing or incorrect bearer credentials without touching the database", async () => {
    const missing = await purgeExpiredProfileRequests(new Request("https://example.test/internal", { method: "POST" }));
    const wrong = await purgeExpiredProfileRequests(new Request("https://example.test/internal", {
      method: "POST", headers: { authorization: `Bearer ${"x".repeat(token.length)}` },
    }));

    expect(missing.status).toBe(403);
    expect(wrong.status).toBe(403);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("fails closed while the worker token is not configured", async () => {
    vi.stubEnv("PERSPECTIVE_PN04_RETENTION_TOKEN", "");
    const result = await purgeExpiredProfileRequests(new Request("https://example.test/internal", {
      method: "POST", headers: { authorization: `Bearer ${token}` },
    }));

    expect(result.status).toBe(503);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("requires a configured platform staff actor and tenant before running", async () => {
    vi.stubEnv("PERSPECTIVE_PN04_RETENTION_ACTOR_ID", "invalid");
    const result = await purgeExpiredProfileRequests(new Request("https://example.test/internal", {
      method: "POST", headers: { authorization: `Bearer ${token}` },
    }));

    expect(result.status).toBe(503);
    expect(mocks.transaction).not.toHaveBeenCalled();
  });

  it("runs as the restricted runtime role in the configured platform tenant", async () => {
    const result = await purgeExpiredProfileRequests(new Request("https://example.test/internal", {
      method: "POST", headers: { authorization: `Bearer ${token}` },
    }));
    const body = await result.json();

    expect(result.status).toBe(200);
    expect(body).toEqual({ deleted: 7 });
    expect(result.headers.get("cache-control")).toBe("no-store");
    expect(mocks.execute).toHaveBeenCalledWith("SET LOCAL ROLE perspective_runtime");
    expect(mocks.query).toHaveBeenCalledOnce();
    expect(mocks.queryUnsafe).toHaveBeenCalledWith(
      "SELECT profiles.pn04_purge_expired($1::uuid) AS deleted", actorId,
    );
  });

  it("returns a generic unavailable response without disclosing database errors", async () => {
    mocks.transaction.mockRejectedValue(new Error("private request details"));
    const result = await purgeExpiredProfileRequests(new Request("https://example.test/internal", {
      method: "POST", headers: { authorization: `Bearer ${token}` },
    }));
    const body = await result.json();

    expect(result.status).toBe(503);
    expect(body).toEqual({ code: "PN_RETENTION_UNAVAILABLE" });
    expect(JSON.stringify(body)).not.toContain("private request details");
  });
});
