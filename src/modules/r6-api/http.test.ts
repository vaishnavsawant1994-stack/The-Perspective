import { beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { resolveR6Mutation } from "./http";

const schema = z.object({
  name: z.string().min(1),
}).strict();

function request(body: unknown, origin = "https://app.example.test") {
  return new Request("https://app.example.test/api/v1/r6/crm/companies", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin,
      "x-request-id": "r6-api-test",
    },
    body: JSON.stringify(body),
  });
}

describe("R6 API trusted mutation boundary", () => {
  beforeEach(() => {
    vi.stubEnv("PERSPECTIVE_AUTH_BOUNDARY_MODE", "sessions");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/test");
    vi.stubEnv("PERSPECTIVE_PUBLIC_APP_ORIGIN", "https://app.example.test");
    vi.stubEnv(
      "PERSPECTIVE_AUTH_DATA_KEY",
      "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
    );
    vi.stubEnv("PERSPECTIVE_AUTH_KEY_VERSION", "1");
  });

  it("rejects cross-origin mutation requests before authorization", async () => {
    const result = await resolveR6Mutation(
      request({ name: "Acme" }, "https://attacker.example"),
      schema,
    );

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(403);
  });

  it("rejects browser-supplied authority fields through strict input schemas", async () => {
    const result = await resolveR6Mutation(
      request({
        name: "Acme",
        organizationId: "00000000-0000-0000-0000-000000000001",
        membershipId: "00000000-0000-0000-0000-000000000002",
        permissionKey: "company.edit",
        scope: "ORG",
        surface: "TEAM",
      }),
      schema,
    );

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(400);
    await expect(result.response.json()).resolves.toMatchObject({
      code: "R6_API_INVALID",
    });
  });

  it("does not promote a valid direct API call without an authenticated session", async () => {
    const result = await resolveR6Mutation(request({ name: "Acme" }), schema);

    expect(result.kind).toBe("response");
    if (result.kind !== "response") throw new Error("Expected response");
    expect(result.response.status).toBe(401);
    await expect(result.response.json()).resolves.toMatchObject({
      code: "AUTHZ_AUTH_REQUIRED",
    });
  });
});
