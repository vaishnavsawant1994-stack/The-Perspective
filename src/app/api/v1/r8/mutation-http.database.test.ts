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
import { R8_ACTIVE_PERMISSION_KEYS } from "@/modules/authorization/r8-policy";
import { createPrismaClient } from "@/modules/persistence/client";

import { POST as decideVersion } from "./draft-versions/[versionId]/client-decision/route";
import { GET as listProjects, POST as createProject } from "./projects/route";

const database = createPrismaClient();
const origin = process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ?? "https://r8.example.test";
const epoch = new Date("2026-10-01T12:00:00.000Z");
const ownerId = crypto.randomUUID();
const foreignOrgId = crypto.randomUUID();
const clientOrgId = crypto.randomUUID();
const clientAccountId = crypto.randomUUID();

type Actor = { userId: string; membershipId: string; token: string };

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
  const email = `r8-http-${userId.slice(0, 8)}@example.test`;
  await database.person.create({
    data: { id: personId, displayName: "R8 HTTP", emailOriginal: email, emailNormalized: email },
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
        domain: key.split(".")[0] ?? "project",
        action: key.split(".").slice(1).join(".") || "access",
        description: "R8 HTTP qualification",
        riskLevel: "HIGH",
      },
      update: {},
    });
    const roleId = crypto.randomUUID();
    await database.role.create({
      data: {
        id: roleId,
        organizationId,
        key: `r8-http-${roleId.slice(0, 8)}`,
        name: "R8 HTTP",
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
  return { userId, membershipId, token };
}

async function acceptedProposal(actorUserId: string, actorMembershipId: string) {
  const proposalId = crypto.randomUUID();
  const proposalVersionId = crypto.randomUUID();
  await database.$transaction(async (tx) => {
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposals (
         id, resource_id, owner_organization_id, deal_id, client_account_id, status, current_version, currency
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, 'ACCEPTED', 1, 'USD')`,
      proposalId, crypto.randomUUID(), ownerId, crypto.randomUUID(), clientAccountId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_versions (
         id, owner_organization_id, proposal_id, version, status, immutable, currency,
         subtotal_minor, tax_minor, total_minor
       ) VALUES ($1::uuid, $2::uuid, $3::uuid, 1, 'ACCEPTED', true, 'USD', 100, 0, 100)`,
      proposalVersionId, ownerId, proposalId,
    );
    await tx.$executeRawUnsafe(
      `INSERT INTO commercial.proposal_acceptances (
         id, owner_organization_id, client_organization_id, client_account_id, proposal_id,
         proposal_version_id, proposal_version, expected_row_version, accepted_row_version,
         actor_user_id, actor_membership_id, accepted_at, idempotency_key, request_hash, after_hash
       ) VALUES (
         $1::uuid, $2::uuid, $3::uuid, $4::uuid, $5::uuid, $6::uuid, 1, 1, 2,
         $7::uuid, $8::uuid, $9::timestamptz, $10::text, $11::text, $11::text
       )`,
      crypto.randomUUID(), ownerId, clientOrgId, clientAccountId, proposalId, proposalVersionId,
      actorUserId, actorMembershipId, epoch, `r8http${crypto.randomUUID().replaceAll("-", "")}`, "cd".repeat(32),
    );
  });
  return proposalId;
}

function request(
  path: string,
  token: string | undefined,
  body?: unknown,
  idempotencyKey?: string,
  method = "POST",
  requestOrigin = origin,
) {
  const headers = new Headers({ origin: requestOrigin, "content-type": "application/json" });
  if (token) headers.set("cookie", `${SESSION_COOKIE_NAME}=${token}`);
  if (idempotencyKey) headers.set("idempotency-key", idempotencyKey);
  return new Request(`${origin}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

describe("R8 HTTP boundary against PostgreSQL", () => {
  let producer: Actor;
  let reader: Actor;
  let foreign: Actor;
  let client: Actor;
  let expired: Actor;

  beforeAll(async () => {
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE ??= "sessions";
    process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN ??= origin;
    process.env.PERSPECTIVE_AUTH_DATA_KEY ??= Buffer.alloc(32, 7).toString("base64");
    process.env.PERSPECTIVE_AUTH_KEY_VERSION ??= "1";
    await organization(ownerId, "PLATFORM", "r8httpowner");
    await organization(foreignOrgId, "PLATFORM", "r8httpforeign");
    await organization(clientOrgId, "CLIENT", "r8httpclient");
    const teamKeys = R8_ACTIVE_PERMISSION_KEYS.filter((item) => item !== "approval.client.decide");
    producer = await actor(ownerId, teamKeys);
    reader = await actor(ownerId, ["project.view"]);
    foreign = await actor(foreignOrgId, teamKeys);
    client = await actor(clientOrgId, ["approval.client.decide"], { surface: "CLIENT" });
    expired = await actor(ownerId, teamKeys, { issuedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) });
    await database.$transaction(async (tx) => {
      const resourceId = crypto.randomUUID();
      await tx.$executeRawUnsafe(
        `INSERT INTO platform.resources (
           id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity
         ) VALUES ($1::uuid, 'client-account', 'R8 HTTP client', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
        resourceId, ownerId, clientOrgId,
      );
      await tx.$executeRawUnsafe(
        `INSERT INTO commercial.client_accounts (
           id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at
         ) VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', $5::timestamptz)`,
        clientAccountId, resourceId, ownerId, clientOrgId, epoch,
      );
    });
  });

  afterAll(async () => {
    await database.$disconnect();
  });

  it("closes anonymous, expired, cross-origin, and unpermitted calls", async () => {
    expect((await listProjects(request("/api/v1/r8/projects", undefined, undefined, undefined, "GET"))).status).toBe(401);
    expect((await listProjects(request("/api/v1/r8/projects", expired.token, undefined, undefined, "GET"))).status).toBe(401);
    const crossOrigin = request("/api/v1/r8/projects", producer.token, { proposalId: crypto.randomUUID(), title: "No" }, "r8-origin-key", "POST", "https://evil.example.test");
    expect((await createProject(crossOrigin)).status).toBe(403);
    const proposalId = await acceptedProposal(client.userId, client.membershipId);
    expect((await createProject(request("/api/v1/r8/projects", reader.token, { proposalId, title: "Hidden" }, "r8-reader-key"))).status).toBe(403);
    expect((await createProject(request("/api/v1/r8/projects", producer.token, { proposalId, title: "Hidden", ownerOrganizationId: ownerId }, "r8-forged-key"))).status).toBe(400);
    expect((await createProject(request("/api/v1/r8/projects", producer.token, { proposalId, title: "Missing key" }))).status).toBe(400);
  });

  it("creates and replays a project without exposing it to another tenant", async () => {
    const proposalId = await acceptedProposal(client.userId, client.membershipId);
    const idempotencyKey = `r8-create-${proposalId.slice(0, 8)}`;
    const body = { proposalId, title: "HTTP feature" };
    const created = await createProject(request("/api/v1/r8/projects", producer.token, body, idempotencyKey));
    expect(created.status).toBe(201);
    const createdBody = await created.json() as { result: { projectId: string; state: string; replayed: boolean } };
    expect(createdBody.result).toMatchObject({ state: "PROJECT_CREATED", replayed: false });
    const replay = await createProject(request("/api/v1/r8/projects", producer.token, body, idempotencyKey));
    expect(replay.status).toBe(200);
    const replayBody = await replay.json() as { result: { projectId: string; replayed: boolean } };
    expect(replayBody.result).toMatchObject({ projectId: createdBody.result.projectId, replayed: true });
    const conflict = await createProject(request("/api/v1/r8/projects", producer.token, { proposalId, title: "Changed" }, idempotencyKey));
    expect(conflict.status).toBe(409);
    const listed = await listProjects(request("/api/v1/r8/projects", foreign.token, undefined, undefined, "GET"));
    expect(listed.status).toBe(200);
    const listedBody = await listed.json() as { result: Array<{ id: string }> };
    expect(listedBody.result.some((row) => row.id === createdBody.result.projectId)).toBe(false);
    const clientCall = await decideVersion(
      request(`/api/v1/r8/draft-versions/${crypto.randomUUID()}/client-decision`, producer.token, { decision: "APPROVED" }, "r8-team-client"),
      { params: Promise.resolve({ versionId: crypto.randomUUID() }) },
    );
    expect([401, 403]).toContain(clientCall.status);
    const clientMissing = await decideVersion(
      request(`/api/v1/r8/draft-versions/${crypto.randomUUID()}/client-decision`, client.token, { decision: "APPROVED" }, "r8-client-missing"),
      { params: Promise.resolve({ versionId: crypto.randomUUID() }) },
    );
    expect(clientMissing.status).toBe(404);
  });
});
