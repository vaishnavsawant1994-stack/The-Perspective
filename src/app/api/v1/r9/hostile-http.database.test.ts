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

import { POST as publishDue } from "../internal/r9/worker/publish-due/route";
import { GET, POST } from "./[...path]/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "http://localhost:3100";
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const clientOrgId = crypto.randomUUID();

type Actor = { membershipId: string; token: string };

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
  const email = `r9-http-${userId.slice(0, 8)}@example.test`;
  await database.person.create({
    data: { id: personId, displayName: "R9 HTTP", emailOriginal: email, emailNormalized: email },
  });
  await database.userAccount.create({
    data: { id: userId, personId, accountState: AccountState.ACTIVE, emailVerifiedAt: epoch },
  });
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
      create: {
        id: crypto.randomUUID(),
        key,
        domain: key.split(".")[0] ?? "magazine",
        action: key.split(".").slice(1).join(".") || "access",
        description: "R9 HTTP qualification",
        riskLevel: "HIGH",
      },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({
      data: {
        id: roleId,
        organizationId,
        key: `r9-http-${roleId.slice(0, 8)}`,
        name: "R9 HTTP",
        systemRole: false,
        defaultScope: surface === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG,
        status: RecordStatus.ACTIVE,
      },
    });
    await database.rolePermission.create({
      data: { roleId, permissionId: permission.id, effect: PermissionEffect.ALLOW, constraints: {} },
    });
    await database.membershipRole.create({
      data: {
        id: crypto.randomUUID(),
        membershipId,
        roleId,
        scope: surface === "CLIENT" ? RoleScope.CLIENT : RoleScope.ORG,
        validFrom: new Date(Date.now() - 60_000),
      },
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
  return { membershipId, token };
}

function call(
  method: "GET" | "POST",
  path: string[],
  token?: string,
  body?: unknown,
  idempotencyKey?: string,
  requestOrigin = origin,
) {
  const headers = new Headers({ origin: requestOrigin });
  if (body !== undefined) headers.set("content-type", "application/json");
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  const request = new Request(`${origin}/api/v1/r9/${path.join("/")}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const context = { params: Promise.resolve({ path }) };
  return method === "GET" ? GET(request, context) : POST(request, context);
}

describe("R9 hostile HTTP boundary against PostgreSQL", () => {
  let publisher: Actor;
  let reader: Actor;
  let foreign: Actor;
  let client: Actor;
  let dormant: Actor;

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    await organization(ownerId, "PLATFORM", "r9httpowner");
    await organization(foreignOrgId, "PLATFORM", "r9httpforeign");
    await organization(clientOrgId, "CLIENT", "r9httpclient");
    publisher = await actor(ownerId, ["design.layout.manage", "magazine.view", "publication.publish", "publish.schedule", "magazine.proof.review"]);
    reader = await actor(ownerId, ["magazine.view"]);
    foreign = await actor(foreignOrgId, ["magazine.view", "design.layout.manage", "publication.publish"]);
    client = await actor(clientOrgId, ["design.layout.manage"], { surface: "CLIENT" });
    dormant = await actor(ownerId, ["magazine.reader.publish", "publish.execute"]);
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("rejects anonymous, invalid, and expired desk calls", async () => {
    expect((await call("GET", ["issues"])).status).toBe(401);
    expect((await call("GET", ["issues"], "not-a-session-token")).status).toBe(401);
    const expired = await actor(ownerId, ["magazine.dashboard.view"], { issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
    expect((await call("GET", ["issues"], expired.token)).status).toBe(401);
  });

  it("does not let a reader, a client, a dormant publish key, or a cross-origin caller publish", async () => {
    const body = { expectedRowVersion: 1 };
    expect((await call("POST", ["issues", crypto.randomUUID(), "publish"], reader.token, body, "r9-reader-publish")).status).toBe(403);
    expect((await call("POST", ["issues", crypto.randomUUID(), "publish"], client.token, body, "r9-client-publish")).status).toBe(401);
    expect((await call("POST", ["issues", crypto.randomUUID(), "publish"], dormant.token, body, "r9-dormant-publish")).status).toBe(403);
    expect((await call("POST", ["issues"], publisher.token, { title: "No", season: "Now", theme: "Here", availability: "PUBLIC" }, "r9-cross-origin", "https://evil.example.test")).status).toBe(403);
  });

  it("rejects laundered authority and does not publish a draft", async () => {
    const forged = { title: "Laundered", season: "Now", theme: "Here", availability: "PUBLIC", actor: "Helena Marlow", ready: true, organizationId: ownerId };
    expect((await call("POST", ["issues"], publisher.token, forged, "r9-launder-actor")).status).toBe(400);
    const created = await call("POST", ["issues"], publisher.token, { title: "Still Draft", season: "Now", theme: "Here", availability: "PUBLIC" }, "r9-create-draft");
    expect(created.status).toBe(201);
    const payload = await created.json() as { result: { issueId: string; slug: string; state: string } };
    expect(payload.result.state).toBe("ISSUE_DRAFT");
    expect((await call("GET", ["issues", payload.result.issueId], foreign.token)).status).toBe(404);
    expect((await call("POST", ["issues", payload.result.issueId, "ready"], publisher.token, { expectedRowVersion: 1 }, "r9-ready-draft")).status).toBe(409);
    expect((await call("POST", ["issues", payload.result.issueId, "publish"], publisher.token, { expectedRowVersion: 1 }, "r9-publish-draft")).status).toBe(409);
    expect((await call("POST", ["issues", payload.result.issueId, "archive"], publisher.token, { expectedRowVersion: 1 }, "r9-archive-draft")).status).toBe(409);
    expect((await call("POST", ["issues", payload.result.issueId, "schedule"], publisher.token, { runAt: "2000-01-01T00:00:00Z", expectedRowVersion: 1 }, "r9-past-schedule")).status).toBe(409);
    expect((await call("GET", ["public", "issues", payload.result.slug])).status).toBe(404);
    const replay = await call("POST", ["issues"], publisher.token, { title: "Still Draft", season: "Now", theme: "Here", availability: "PUBLIC" }, "r9-create-draft");
    expect(replay.status).toBe(200);
    const changed = await call("POST", ["issues"], publisher.token, { title: "Different Draft", season: "Now", theme: "Here", availability: "PUBLIC" }, "r9-create-draft");
    expect(changed.status).toBe(409);
  });

  it("fails the due worker closed when the token is missing or wrong", async () => {
    const previous = process.env.PERSPECTIVE_R9_WORKER_TOKEN;
    delete process.env.PERSPECTIVE_R9_WORKER_TOKEN;
    expect((await publishDue(new Request(`${origin}/api/v1/internal/r9/worker/publish-due`, { method: "POST" }))).status).toBe(403);
    process.env.PERSPECTIVE_R9_WORKER_TOKEN = "this-token-is-long-enough-for-the-gate";
    expect((await publishDue(new Request(`${origin}/api/v1/internal/r9/worker/publish-due`, { method: "POST", headers: { authorization: "Bearer wrong-token-value-not-the-real-one" } }))).status).toBe(403);
    if (previous === undefined) delete process.env.PERSPECTIVE_R9_WORKER_TOKEN;
    else process.env.PERSPECTIVE_R9_WORKER_TOKEN = previous;
  });
});
