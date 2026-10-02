import { afterAll, beforeAll, describe, expect, it } from "vitest";

import {
  AccountState,
  AuthSurface,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  PermissionEffect,
  RecordStatus,
  RoleScope,
} from "@/generated/prisma/client";
import { SESSION_COOKIE_NAME } from "@/modules/authentication/http/session-cookie";
import { createOpaqueToken, hashOpaqueToken } from "@/modules/authentication/crypto/tokens";
import { createPrismaClient } from "@/modules/persistence/client";

import { POST as reconcile } from "../internal/r10/worker/reconcile/route";
import { GET, POST } from "./[...path]/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "http://localhost:3100";
const epoch = new Date("2026-10-02T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const clientOrgId = crypto.randomUUID();

type Actor = { token: string };

async function organization(id: string, type: "PLATFORM" | "CLIENT", label: string) {
  await database.organization.create({
    data: {
      id,
      organizationType: type === "PLATFORM" ? OrganizationType.PLATFORM : OrganizationType.CLIENT,
      legalName: label,
      displayName: label,
      slug: `${label}-${id.slice(0, 8)}`.toLowerCase(),
      status: RecordStatus.ACTIVE,
    },
  });
}

async function actor(
  organizationId: string,
  permissions: readonly string[],
  options?: { surface?: "TEAM" | "CLIENT"; issuedAt?: Date },
): Promise<Actor> {
  const surface = options?.surface ?? "TEAM";
  const userId = crypto.randomUUID();
  const personId = crypto.randomUUID();
  const membershipId = crypto.randomUUID();
  const email = `r10-http-${userId.slice(0, 8)}@example.test`;
  await database.person.create({ data: { id: personId, displayName: "R10 HTTP", emailOriginal: email, emailNormalized: email } });
  await database.userAccount.create({ data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch } });
  await database.organizationMembership.create({
    data: {
      id: membershipId,
      organizationId,
      userAccountId: userId,
      membershipType: surface === "CLIENT" ? MembershipType.CLIENT : MembershipType.STAFF,
      status: MembershipStatus.ACTIVE,
      joinedAt: epoch,
    },
  });
  for (const key of permissions) {
    const permission = await database.permission.upsert({
      where: { key },
      create: { id: crypto.randomUUID(), key, domain: key.split(".")[0] ?? "distribution", action: key.split(".").slice(1).join(".") || "access", description: "R10 HTTP qualification", riskLevel: "HIGH" },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({
      data: { id: roleId, organizationId, key: `r10-http-${roleId.slice(0, 8)}`, name: "R10 HTTP", systemRole: false, defaultScope: surface === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, status: RecordStatus.ACTIVE },
    });
    await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} } });
    await database.membershipRole.create({
      data: { id: crypto.randomUUID(), membershipId, roleId, scope: surface === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG, validFrom: new Date(Date.now() - 60_000) },
    });
  }
  const token = createOpaqueToken();
  const issuedAt = options?.issuedAt ?? new Date();
  await database.session.create({
    data: {
      id: crypto.randomUUID(),
      userAccountId: userId,
      activeMembershipId: membershipId,
      tokenHash: hashOpaqueToken(token),
      surface: surface === "CLIENT" ? AuthSurface.CLIENT : AuthSurface.TEAM,
      authenticationMethod: "password",
      mfaVerifiedAt: issuedAt,
      issuedAt,
      expiresAt: new Date(issuedAt.getTime() + 60 * 60 * 1000),
    },
  });
  return { token };
}

function call(method: "GET" | "POST", path: string[], token?: string, body?: unknown, idempotencyKey?: string, requestOrigin = origin) {
  const headers = new Headers({ origin: requestOrigin });
  if (body !== undefined) headers.set("content-type", "application/json");
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  const request = new Request(`${origin}/api/v1/r10/${path.join("/")}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const context = { params: Promise.resolve({ path }) };
  return method === "GET" ? GET(request, context) : POST(request, context);
}

describe("R10 hostile HTTP boundary against PostgreSQL", () => {
  let editor: Actor;
  let reader: Actor;
  let foreign: Actor;
  let client: Actor;
  let dormant: Actor;
  let staleAuth: Actor;

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    await organization(ownerId, "PLATFORM", "r10httpowner");
    await organization(foreignOrgId, "PLATFORM", "r10httpforeign");
    await organization(clientOrgId, "CLIENT", "r10httpclient");
    editor = await actor(ownerId, ["distribution.campaign.manage", "distribution.dashboard.view", "distribution.launch", "podcast.episode.edit"]);
    reader = await actor(ownerId, ["distribution.campaign.view"]);
    foreign = await actor(foreignOrgId, ["distribution.campaign.manage", "distribution.campaign.view", "distribution.launch"]);
    client = await actor(clientOrgId, ["distribution.launch"], { surface: "CLIENT" });
    dormant = await actor(ownerId, ["analytics.distribution.view", "publish.execute"]);
    staleAuth = await actor(ownerId, ["distribution.launch"], { issuedAt: new Date(Date.now() - 20 * 60 * 1000) });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects anonymous, invalid, and expired sessions", async () => {
    expect((await call("GET", ["campaigns"])).status).toBe(401);
    expect((await call("GET", ["campaigns"], "not-a-session-token")).status).toBe(401);
    const expired = await actor(ownerId, ["distribution.dashboard.view"], { issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
    expect((await call("GET", ["campaigns"], expired.token)).status).toBe(401);
  });

  it("does not let a reader, a client, a dormant key, or a cross-origin caller launch", async () => {
    const body = { expectedRowVersion: 1 };
    const id = crypto.randomUUID();
    expect((await call("POST", ["campaigns", id, "launch"], reader.token, body, "r10-reader-launch")).status).toBe(403);
    expect((await call("POST", ["campaigns", id, "launch"], client.token, body, "r10-client-launch")).status).toBe(401);
    expect((await call("POST", ["campaigns", id, "launch"], dormant.token, body, "r10-dormant-launch")).status).toBe(403);
    expect((await call("POST", ["campaigns"], editor.token, { name: "No" }, "r10-cross-origin", "https://evil.example.test")).status).toBe(403);
  });

  it("rejects laundered authority, a malformed id, and a stale authentication window", async () => {
    expect((await call("POST", ["shows"], editor.token, { title: "Secret", actor: "Helena", organizationId: ownerId, url: "https://evil.example" }, "r10-launder")).status).toBe(400);
    expect((await call("POST", ["campaigns", "not-a-uuid", "launch"], editor.token, { expectedRowVersion: 1 }, "r10-bad-id")).status).toBe(400);
    expect((await call("GET", ["campaigns", crypto.randomUUID()], foreign.token)).status).toBe(404);
    expect((await call("POST", ["campaigns", crypto.randomUUID(), "launch"], staleAuth.token, { expectedRowVersion: 1 }, "r10-stale-auth")).status).toBe(403);
    expect((await call("GET", ["public", "deliveries", "not-a-real-delivery"])).status).toBe(404);
    expect((await call("POST", ["not-a-command"], editor.token, {}, "r10-unknown")).status).toBe(400);
  });

  it("fails the reconcile worker closed without its token", async () => {
    const previous = process.env.PERSPECTIVE_R10_WORKER_TOKEN;
    delete process.env.PERSPECTIVE_R10_WORKER_TOKEN;
    expect((await reconcile(new Request(`${origin}/api/v1/internal/r10/worker/reconcile`, { method: "POST" }))).status).toBe(403);
    process.env.PERSPECTIVE_R10_WORKER_TOKEN = "this-token-is-long-enough-for-the-gate";
    expect((await reconcile(new Request(`${origin}/api/v1/internal/r10/worker/reconcile`, { method: "POST", headers: { authorization: "Bearer wrong-token-value-not-the-real-one" } }))).status).toBe(403);
    if (previous === undefined) delete process.env.PERSPECTIVE_R10_WORKER_TOKEN;
    else process.env.PERSPECTIVE_R10_WORKER_TOKEN = previous;
  });
});
