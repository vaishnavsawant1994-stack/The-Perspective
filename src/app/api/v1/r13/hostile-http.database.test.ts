import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, AuthSurface, MembershipStatus, MembershipType, OrganizationType, PermissionEffect, RecordStatus, RoleScope } from "@/generated/prisma/client";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { createPrismaClient } from "@/modules/persistence/client";

import { GET, POST } from "./[...path]/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "http://localhost:3100";
const ownerId = crypto.randomUUID();

async function actor(surface: "TEAM" | "CLIENT", permissions: readonly string[], scope: "ORG" | "CLIENT", mfa = true) {
  const userId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const organizationId = surface === "TEAM" ? ownerId : crypto.randomUUID();
  if (surface === "CLIENT") {
    await database.organization.create({
      data: { id: organizationId, organizationType: OrganizationType.CLIENT, legalName: "R13 HTTP client", displayName: "R13 HTTP client", slug: `r13-http-${organizationId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    });
  }
  await database.person.create({ data: { id: personId, displayName: "R13 HTTP" } });
  await database.userAccount.create({ data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: new Date() } });
  await database.organizationMembership.create({
    data: { id: membershipId, organizationId, userAccountId: userId, membershipType: surface === "TEAM" ? MembershipType.STAFF : MembershipType.CLIENT, status: MembershipStatus.ACTIVE, joinedAt: new Date() },
  });
  for (const key of permissions) {
    const permission = await database.permission.upsert({
      where: { key },
      create: { id: crypto.randomUUID(), key, domain: key.split(".")[0] ?? "settings", action: "access", description: "R13 HTTP", riskLevel: "CRITICAL" },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({ data: { id: roleId, organizationId, key: `r13-http-${roleId.slice(0, 8)}`, name: "R13 HTTP", systemRole: false, defaultScope: scope === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, status: RecordStatus.ACTIVE } });
    await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} } });
    await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: scope === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, validFrom: new Date(Date.now() - 60_000) } });
  }
  const token = createOpaqueToken();
  await database.session.create({
    data: {
      id: crypto.randomUUID(), userAccountId: userId, activeMembershipId: membershipId, tokenHash: hashOpaqueToken(token),
      surface: surface === "TEAM" ? AuthSurface.TEAM : AuthSurface.CLIENT, authenticationMethod: "password",
      issuedAt: new Date(), expiresAt: new Date(Date.now() + 60 * 60 * 1000), mfaVerifiedAt: mfa ? new Date(Date.now() - 1000) : null,
    },
  });
  return token;
}

function call(method: "GET" | "POST", path: string[], token?: string, body?: unknown, idempotencyKey?: string, headers?: Record<string, string>) {
  const requestHeaders = new Headers({ origin, ...headers });
  if (body !== undefined) requestHeaders.set("content-type", "application/json");
  if (token) requestHeaders.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) requestHeaders.set("idempotency-key", idempotencyKey);
  const request = new Request(`${origin}/api/v1/r13/${path.join("/")}`, { method, headers: requestHeaders, body: body === undefined ? undefined : JSON.stringify(body) });
  const context = { params: Promise.resolve({ path }) };
  return method === "GET" ? GET(request, context) : POST(request, context);
}

describe("R13 hostile HTTP boundary against PostgreSQL", () => {
  let operator = "";

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    await database.organization.create({
      data: { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R13 HTTP", displayName: "R13 HTTP", slug: `r13-http-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    });
    operator = await actor("TEAM", ["settings.manage", "integration.manage"], "ORG");
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects anonymous, client, laundered authority, missing MFA, and forged verification", async () => {
    expect((await call("GET", ["settings"])).status).toBe(401);
    const client = await actor("CLIENT", ["settings.manage"], "CLIENT");
    expect((await call("GET", ["settings"], client)).status).toBe(401);
    const outsider = await actor("TEAM", ["team.view"], "ORG");
    expect([403, 404]).toContain((await call("GET", ["settings"], outsider)).status);
    const withoutMfa = await actor("TEAM", ["settings.manage"], "ORG", false);
    expect((await call("GET", ["settings"], withoutMfa)).status).toBe(404);
    expect((await call("POST", ["settings"], operator, {
      timezone: "UTC", weekStartsOn: "MONDAY", supportLabel: "Ops", expectedVersion: 0, reason: "Save preferences", isAdmin: true,
    }, "r13settings1")).status).toBe(400);
    expect((await call("POST", ["integrations"], operator, {
      integrationType: "EMAIL", reason: "Declare email", verified: true,
    }, "r13declare1")).status).toBe(400);
    const crossOrigin = await call("POST", ["integrations"], operator, { integrationType: "EMAIL", reason: "Declare email" }, "r13declare2", { origin: "https://evil.example" });
    expect(crossOrigin.status).toBe(403);
    const declared = await call("POST", ["integrations"], operator, { integrationType: "EMAIL", reason: "Declare email" }, "r13declare3");
    expect(declared.status).toBe(201);
    const verified = await call("POST", ["integrations", "EMAIL", "verify"], operator, { reason: "Check the provider" }, "r13verify01");
    expect(verified.status).toBe(201);
    const body = await verified.json() as { result?: { state?: string; result?: string } };
    expect(body.result).toMatchObject({ state: "DECLARED", result: "PROVIDER_UNAVAILABLE" });
    expect(JSON.stringify(body)).not.toMatch(/VERIFIED|secret|apiKey/u);
  });
});
