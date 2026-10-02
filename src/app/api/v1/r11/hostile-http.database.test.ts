import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { AccountState, AuthSurface, MembershipStatus, MembershipType, OrganizationType, PermissionEffect, RecordStatus, RoleScope } from "@/generated/prisma/client";
import { hashOpaqueToken, createOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { createPrismaClient } from "@/modules/persistence/client";

import { POST as run } from "../internal/r11/worker/run/route";
import { GET, POST } from "./[...path]/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "http://localhost:3100";
const epoch = new Date("2026-10-02T12:00:00.000Z");
const ownerId = crypto.randomUUID();

async function actor(permissions: readonly string[]) {
  const userId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const email = `r11-http-${userId.slice(0, 8)}@example.test`;
  await database.person.create({ data: { id: personId, displayName: "R11 HTTP", emailOriginal: email, emailNormalized: email } });
  await database.userAccount.create({ data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch } });
  await database.organizationMembership.create({
    data: { id: membershipId, organizationId: ownerId, userAccountId: userId, membershipType: MembershipType.STAFF, status: MembershipStatus.ACTIVE, joinedAt: epoch },
  });
  for (const key of permissions) {
    const permission = await database.permission.upsert({
      where: { key },
      create: { id: crypto.randomUUID(), key, domain: key.split(".")[0] ?? "report", action: "access", description: "R11 HTTP", riskLevel: "HIGH" },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({ data: { id: roleId, organizationId: ownerId, key: `r11-http-${roleId.slice(0, 8)}`, name: "R11 HTTP", systemRole: false, defaultScope: RoleScope.ORG, status: RecordStatus.ACTIVE } });
    await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} } });
    await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: RoleScope.ORG, validFrom: new Date(Date.now() - 60_000) } });
  }
  const token = createOpaqueToken();
  await database.session.create({
    data: {
      id: crypto.randomUUID(),
      userAccountId: userId,
      activeMembershipId: membershipId,
      tokenHash: hashOpaqueToken(token),
      surface: AuthSurface.TEAM,
      authenticationMethod: "password",
      mfaVerifiedAt: epoch,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    },
  });
  return token;
}

function call(method: "GET" | "POST", path: string[], token?: string, body?: unknown, idempotencyKey?: string) {
  const headers = new Headers({ origin });
  if (body !== undefined) headers.set("content-type", "application/json");
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  const request = new Request(`${origin}/api/v1/r11/${path.join("/")}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const context = { params: Promise.resolve({ path }) };
  return method === "GET" ? GET(request, context) : POST(request, context);
}

describe("R11 hostile HTTP boundary against PostgreSQL", () => {
  let editor: string;

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    process.env.PERSPECTIVE_R11_WORKER_TOKEN ??= "r11-worker-token-qualification-value";
    await database.organization.create({
      data: { id: ownerId, organizationType: OrganizationType.PLATFORM, legalName: "R11 HTTP", displayName: "R11 HTTP", slug: `r11-http-${ownerId.slice(0, 8)}`, status: RecordStatus.ACTIVE },
    });
    editor = await actor(["report.create", "report.view"]);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects anonymous, forged aggregates, cross-origin writes, and a browser worker", async () => {
    expect((await call("GET", ["reports"])).status).toBe(401);
    expect((await call("POST", ["reports"], editor, { family: "CONTENT", from: epoch.toISOString(), to: epoch.toISOString(), views: 9 }, "r11-forged-views")).status).toBe(400);
    const headers = new Headers({ origin: "https://evil.example", "content-type": "application/json", cookie: `${SESSION_COOKIE_NAME}=${editor}`, "idempotency-key": "r11-cross-origin" });
    const cross = await POST(new Request(`${origin}/api/v1/r11/reports`, {
      method: "POST",
      headers,
      body: JSON.stringify({ family: "CONTENT", from: epoch.toISOString(), to: epoch.toISOString() }),
    }), { params: Promise.resolve({ path: ["reports"] }) });
    expect(cross.status).toBe(403);
    const created = await call("POST", ["reports"], editor, { family: "CONTENT", from: epoch.toISOString(), to: epoch.toISOString() }, "r11-http-report");
    expect(created.status).toBe(201);
    const worker = new Request(`${origin}/api/v1/internal/r11/worker/run`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect((await run(worker)).status).toBe(403);
    const meta = await call("GET", ["public", "meta", "not-a-published-issue"]);
    expect(meta.status).toBe(404);
  });
});
