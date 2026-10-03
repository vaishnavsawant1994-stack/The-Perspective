import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, AuthSurface, MembershipStatus, MembershipType, OrganizationType, PermissionEffect, RecordStatus, RoleScope } from "@/generated/prisma/client";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { createPrismaClient } from "@/modules/persistence/client";

import { POST as offer } from "../internal/r12/worker/offers/route";
import { GET, POST } from "./[...path]/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "http://localhost:3100";
const epoch = new Date("2026-10-03T12:00:00.000Z");
const ownerId = crypto.randomUUID();

async function actor(surface: "TEAM" | "CLIENT", permissions: readonly string[], scope: "ORG" | "CLIENT") {
  const userId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const organizationId = surface === "TEAM" ? ownerId : crypto.randomUUID();
  if (surface === "CLIENT") {
    await database.organization.create({
      data: { id: organizationId, organizationType: OrganizationType.CLIENT, legalName: "R12 HTTP client", displayName: "R12 HTTP client", slug: `r12-http-${organizationId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    });
  }
  await database.person.create({ data: { id: personId, displayName: "R12 HTTP" } });
  await database.userAccount.create({ data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch } });
  await database.organizationMembership.create({
    data: { id: membershipId, organizationId, userAccountId: userId, membershipType: surface === "TEAM" ? MembershipType.STAFF : MembershipType.CLIENT, status: MembershipStatus.ACTIVE, joinedAt: epoch },
  });
  for (const key of permissions) {
    const permission = await database.permission.upsert({
      where: { key },
      create: { id: crypto.randomUUID(), key, domain: key.split(".")[0] ?? "client", action: "access", description: "R12 HTTP", riskLevel: "HIGH" },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({ data: { id: roleId, organizationId, key: `r12-http-${roleId.slice(0, 8)}`, name: "R12 HTTP", systemRole: false, defaultScope: scope === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, status: RecordStatus.ACTIVE } });
    await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} } });
    await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: scope === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, validFrom: new Date(Date.now() - 60_000) } });
  }
  const token = createOpaqueToken();
  await database.session.create({
    data: {
      id: crypto.randomUUID(), userAccountId: userId, activeMembershipId: membershipId, tokenHash: hashOpaqueToken(token),
      surface: surface === "TEAM" ? AuthSurface.TEAM : AuthSurface.CLIENT, authenticationMethod: "password",
      issuedAt: new Date(), expiresAt: new Date(Date.now() + 60 * 60 * 1000), mfaVerifiedAt: new Date(Date.now() - 1000),
    },
  });
  return token;
}

function call(method: "GET" | "POST", path: string[], token?: string, body?: unknown, idempotencyKey?: string, headers?: Record<string, string>) {
  const requestHeaders = new Headers({ origin, ...headers });
  if (body !== undefined) requestHeaders.set("content-type", "application/json");
  if (token) requestHeaders.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) requestHeaders.set("idempotency-key", idempotencyKey);
  const request = new Request(`${origin}/api/v1/r12/${path.join("/")}`, { method, headers: requestHeaders, body: body === undefined ? undefined : JSON.stringify(body) });
  const context = { params: Promise.resolve({ path }) };
  return method === "GET" ? GET(request, context) : POST(request, context);
}

describe("R12 hostile HTTP boundary against PostgreSQL", () => {
  let clientToken = "";

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    process.env.PERSPECTIVE_R12_WORKER_TOKEN ??= "r12-worker-token-qualification-value";
    await database.organization.create({
      data: { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R12 HTTP", displayName: "R12 HTTP", slug: `r12-http-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    });
    clientToken = await actor("CLIENT", ["client.dashboard.view", "client.project.view"], "CLIENT");
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects anonymous, cross-surface, forged checkout, and an unauthenticated worker", async () => {
    expect((await call("GET", ["client", "dashboard"])).status).toBe(401);
    expect((await call("GET", ["member", "library"])).status).toBe(401);
    const team = await actor("TEAM", ["client.dashboard.view"], "ORG");
    expect((await call("GET", ["client", "dashboard"], team)).status).toBe(401);
    expect((await call("POST", ["member", "checkout"], clientToken, { offerId: crypto.randomUUID(), amount: 1 }, "r12checkout1")).status).toBe(400);
    const worker = new Request(`${origin}/api/v1/internal/r12/worker/offers`, {
      method: "POST",
      headers: { origin, "content-type": "application/json", "idempotency-key": "r12workerkey" },
      body: JSON.stringify({ organizationId: ownerId, code: "nope", currency: "USD", amountMinor: 1, interval: "MONTH", entitlementKey: "none" }),
    });
    expect((await offer(worker)).status).toBe(403);
    const crossOrigin = await call("POST", ["access", "accept"], clientToken, { token: "x".repeat(40) }, "r12accept01", { origin: "https://evil.example" });
    expect(crossOrigin.status).toBe(403);
    const dashboard = await call("GET", ["client", "dashboard"], clientToken);
    expect([200, 404]).toContain(dashboard.status);
    if (dashboard.status === 200) {
      const body = await dashboard.json() as { result?: Record<string, unknown> };
      expect(JSON.stringify(body)).not.toMatch(/health|margin|notes|token/u);
    }
  });
});
