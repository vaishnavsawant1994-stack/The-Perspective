import { randomUUID } from "node:crypto";

import {
  MembershipStatus,
  MembershipType,
  PermissionEffect,
  RecordStatus,
  RoleScope,
} from "@/generated/prisma/client";
import type {
  MembershipId,
  OrganizationId,
  SessionId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";
import { createPrismaClient } from "@/modules/persistence/client";
import { seedIds } from "../../../prisma/seed/stable-ids";
import { afterAll, afterEach, describe, expect, it } from "vitest";

import {
  assignMembershipAuthorizationRole,
  createCustomAuthorizationRole,
  readRolePermissions,
  replaceCustomRolePermissions,
  revokeMembershipAuthorizationRole,
  updateCustomAuthorizationRole,
} from "./admin";
import { resolveAuthorizedRequestContext } from "./resolver";

const database = createPrismaClient();
const now = new Date("2026-09-27T06:50:00.000Z");

const createdRoleIds: string[] = [];
const createdMembershipIds: string[] = [];
const createdMembershipRoleIds: string[] = [];
const requestIds: string[] = [];

function teamContext(requestId: string): TenantScopedRequestContext {
  requestIds.push(requestId);

  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId,
    identity: { userId: seedIds.user.operator as UserId },
    session: {
      sessionId: randomUUID() as SessionId,
      issuedAt: new Date(now.getTime() - 60_000),
      expiresAt: new Date(now.getTime() + 60 * 60_000),
      authenticationMethod: "password+totp",
      mfaVerifiedAt: new Date(now.getTime() - 60_000),
    },
    membership: {
      membershipId: seedIds.membership.operator as MembershipId,
      organizationId: seedIds.organization.platform as OrganizationId,
      surface: "TEAM",
    },
    tenant: {
      membershipId: seedIds.membership.operator as MembershipId,
      organizationId: seedIds.organization.platform as OrganizationId,
      surface: "TEAM",
    },
  };
}

async function canonicalPermission(key: string) {
  const [domain, ...actionParts] = key.split(".");
  const action = actionParts.join(".") || "access";

  return database.permission.upsert({
    where: { key },
    create: {
      id: randomUUID(),
      key,
      domain,
      action,
      description: "R5 authorization-admin database attack permission",
      riskLevel: "CRITICAL",
    },
    update: {},
  });
}

async function createRoleFixture(input: {
  organizationId?: string;
  key: string;
  systemRole: boolean;
  defaultScope?: RoleScope;
  permissionKeys?: readonly string[];
}) {
  const role = await database.role.create({
    data: {
      id: randomUUID(),
      organizationId: input.organizationId ?? seedIds.organization.platform,
      key: input.key,
      name: `R5 DB Attack ${input.key}`,
      systemRole: input.systemRole,
      defaultScope: input.defaultScope ?? RoleScope.ORG,
      status: RecordStatus.ACTIVE,
    },
    select: {
      id: true,
      key: true,
      updatedAt: true,
    },
  });
  createdRoleIds.push(role.id);

  for (const permissionKey of input.permissionKeys ?? []) {
    const permission = await canonicalPermission(permissionKey);
    await database.rolePermission.create({
      data: {
        roleId: role.id,
        permissionId: permission.id,
        effect: PermissionEffect.ALLOW,
        constraints: {},
      },
    });
  }

  return role;
}

async function createStaffMembership() {
  const membership = await database.organizationMembership.create({
    data: {
      id: randomUUID(),
      organizationId: seedIds.organization.platform,
      userAccountId: seedIds.user.asteriaAdmin,
      membershipType: MembershipType.STAFF,
      title: "R5 DB Attack Target",
      status: MembershipStatus.ACTIVE,
      joinedAt: now,
    },
    select: {
      id: true,
      updatedAt: true,
    },
  });
  createdMembershipIds.push(membership.id);
  return membership;
}

async function grantRoleToMembership(input: {
  membershipId: string;
  roleId: string;
  scope?: RoleScope;
  validUntil?: Date | null;
}) {
  const grant = await database.membershipRole.create({
    data: {
      id: randomUUID(),
      membershipId: input.membershipId,
      roleId: input.roleId,
      scope: input.scope ?? RoleScope.ORG,
      validFrom: new Date(now.getTime() - 60_000),
      validUntil: input.validUntil ?? null,
    },
    select: {
      id: true,
      createdAt: true,
    },
  });
  createdMembershipRoleIds.push(grant.id);
  return grant;
}

async function adminActor(roleCode: "R01" | "R02", requestId: string) {
  const role = await createRoleFixture({
    key: roleCode,
    systemRole: true,
    defaultScope: RoleScope.ORG,
    permissionKeys: ["role.manage", "permission.manage"],
  });
  const grant = await grantRoleToMembership({
    membershipId: seedIds.membership.operator,
    roleId: role.id,
  });

  const resolved = await resolveAuthorizedRequestContext(
    teamContext(requestId),
    database,
    now,
  );

  expect(resolved.kind).toBe("authorized");
  if (resolved.kind !== "authorized") {
    throw new Error("Expected R5 authorization-admin actor");
  }

  return {
    context: resolved.context,
    actorRole: role,
    actorGrant: grant,
  };
}

async function auditActions(requestId: string) {
  return database.auditEvent.findMany({
    where: { requestId },
    select: {
      action: true,
      reason: true,
      actorMembershipId: true,
      beforeHash: true,
      afterHash: true,
      redactedDiff: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

afterEach(async () => {
  // Audit evidence is intentionally immutable. Tests use unique request IDs and
  // leave denial/success evidence in the ephemeral CI database rather than
  // weakening the production immutability invariant for cleanup.
  requestIds.length = 0;

  const membershipRoleConditions = [];
  if (createdMembershipRoleIds.length > 0) {
    membershipRoleConditions.push({
      id: { in: [...createdMembershipRoleIds] },
    });
  }
  if (createdRoleIds.length > 0) {
    membershipRoleConditions.push({
      roleId: { in: [...createdRoleIds] },
    });
  }
  if (createdMembershipIds.length > 0) {
    membershipRoleConditions.push({
      membershipId: { in: [...createdMembershipIds] },
    });
  }

  if (membershipRoleConditions.length > 0) {
    await database.membershipRole.deleteMany({
      where: { OR: membershipRoleConditions },
    });
  }
  createdMembershipRoleIds.length = 0;

  if (createdRoleIds.length > 0) {
    await database.role.deleteMany({
      where: { id: { in: [...createdRoleIds] } },
    });
    createdRoleIds.length = 0;
  }

  if (createdMembershipIds.length > 0) {
    await database.organizationMembership.deleteMany({
      where: { id: { in: [...createdMembershipIds] } },
    });
    createdMembershipIds.length = 0;
  }
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R5 live database authorization-admin attacks", () => {
  it("conceals a foreign role id and leaves the foreign row untouched", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-cross-tenant-role",
    );
    const foreignRole = await createRoleFixture({
      organizationId: seedIds.organization.asteria,
      key: `custom-foreign-${randomUUID()}`,
      systemRole: false,
    });

    const before = await database.role.findUniqueOrThrow({
      where: { id: foreignRole.id },
      select: { name: true, updatedAt: true },
    });

    const result = await updateCustomAuthorizationRole(
      context,
      foreignRole.id,
      {
        name: "Cross-tenant overwrite",
        expectedUpdatedAt: before.updatedAt,
        reason: "cross tenant attack",
      },
      database,
      now,
    );

    expect(result).toEqual({ kind: "error", code: "NOT_FOUND" });

    await expect(
      database.role.findUniqueOrThrow({
        where: { id: foreignRole.id },
        select: { name: true, updatedAt: true },
      }),
    ).resolves.toEqual(before);

    expect(
      await database.membershipRole.count({
        where: { roleId: foreignRole.id },
      }),
    ).toBe(0);
    expect(await auditActions(context.requestId)).toEqual([]);
  });

  it("denies self-assignment and leaves no MembershipRole residue", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-self-assignment",
    );
    const targetRole = await createRoleFixture({
      key: "R03",
      systemRole: true,
    });
    const actorMembership =
      await database.organizationMembership.findUniqueOrThrow({
        where: { id: seedIds.membership.operator },
        select: { updatedAt: true },
      });

    const result = await assignMembershipAuthorizationRole(
      context,
      {
        membershipId: seedIds.membership.operator,
        roleId: targetRole.id,
        scope: "ORG",
        expectedMembershipUpdatedAt: actorMembership.updatedAt,
        reason: "attempt self escalation",
      },
      database,
      now,
    );

    expect(result.kind).toBe("denied");
    expect(
      await database.membershipRole.count({
        where: {
          membershipId: seedIds.membership.operator,
          roleId: targetRole.id,
        },
      }),
    ).toBe(0);

    expect(
      (await auditActions(context.requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.role.manage");
  });

  it("denies protected administrator self-revocation and preserves the live grant", async () => {
    const requestId = "r5-admin-db-protected-self-revocation";
    const { context, actorGrant } = await adminActor("R01", requestId);

    const before = await database.membershipRole.findUniqueOrThrow({
      where: { id: actorGrant.id },
      select: { validUntil: true, createdAt: true },
    });
    expect(before.validUntil).toBeNull();

    const result = await revokeMembershipAuthorizationRole(
      context,
      {
        membershipRoleId: actorGrant.id,
        expectedCreatedAt: actorGrant.createdAt,
        reason: "attempt protected administrator self revocation",
      },
      database,
      now,
    );

    expect(result.kind).toBe("denied");
    await expect(
      database.membershipRole.findUniqueOrThrow({
        where: { id: actorGrant.id },
        select: { validUntil: true, createdAt: true },
      }),
    ).resolves.toEqual(before);
    expect(
      (await auditActions(requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.role.manage");
  });

  it("rejects a duplicate live MembershipRole without widening authority", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-duplicate-membership-role",
    );
    const targetMembership = await createStaffMembership();
    const targetRole = await createRoleFixture({
      key: "R03",
      systemRole: true,
    });
    const input = {
      membershipId: targetMembership.id,
      roleId: targetRole.id,
      scope: "ORG" as const,
      expectedMembershipUpdatedAt: targetMembership.updatedAt,
      reason: "duplicate live grant attack",
    };

    const first = await assignMembershipAuthorizationRole(
      context,
      input,
      database,
      now,
    );
    expect(first.kind).toBe("ok");

    const second = await assignMembershipAuthorizationRole(
      context,
      input,
      database,
      new Date(now.getTime() + 1),
    );
    expect(second).toEqual({ kind: "error", code: "CONFLICT" });

    expect(
      await database.membershipRole.count({
        where: {
          membershipId: targetMembership.id,
          roleId: targetRole.id,
          OR: [{ validUntil: null }, { validUntil: { gt: now } }],
        },
      }),
    ).toBe(1);
  });

  it("denies R02 assigning R01 and leaves no elevated grant", async () => {
    const { context } = await adminActor(
      "R02",
      "r5-admin-db-r02-r01-escalation",
    );
    const targetMembership = await createStaffMembership();
    const r01 = await createRoleFixture({
      key: "R01",
      systemRole: true,
    });

    const result = await assignMembershipAuthorizationRole(
      context,
      {
        membershipId: targetMembership.id,
        roleId: r01.id,
        scope: "ORG",
        expectedMembershipUpdatedAt: targetMembership.updatedAt,
        reason: "attempt R02 to R01 escalation",
      },
      database,
      now,
    );

    expect(result.kind).toBe("denied");
    expect(
      await database.membershipRole.count({
        where: {
          membershipId: targetMembership.id,
          roleId: r01.id,
        },
      }),
    ).toBe(0);

    expect(
      (await auditActions(context.requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.role.manage");
  });

  it("blocks access-admin permissions on custom roles without changing existing edges", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-custom-access-admin",
    );
    const customRole = await createRoleFixture({
      key: `custom-sales-${randomUUID()}`,
      systemRole: false,
      permissionKeys: ["team.view"],
    });
    const before = await readRolePermissions(context, customRole.id, database);
    expect(before.kind).toBe("ok");
    if (before.kind !== "ok") throw new Error("Expected role permissions");

    const result = await replaceCustomRolePermissions(
      context,
      customRole.id,
      {
        expectedPermissionsHash: before.value.permissionsHash,
        permissions: [
          {
            permissionKey: "role.manage",
            effect: "ALLOW",
            constraints: {},
          },
        ],
        reason: "attempt custom access-admin escalation",
      },
      database,
      now,
    );

    expect(result.kind).toBe("denied");

    const after = await readRolePermissions(context, customRole.id, database);
    expect(after).toEqual(before);
    expect(
      await database.rolePermission.count({
        where: {
          roleId: customRole.id,
          permission: { key: "role.manage" },
        },
      }),
    ).toBe(0);
    expect(
      (await auditActions(context.requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.permission.manage");
  });

  it("rejects stale optimistic concurrency without mutating the role", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-stale-role-update",
    );
    const customRole = await createRoleFixture({
      key: `custom-stale-${randomUUID()}`,
      systemRole: false,
    });

    const before = await database.role.findUniqueOrThrow({
      where: { id: customRole.id },
      select: { name: true, updatedAt: true },
    });

    const result = await updateCustomAuthorizationRole(
      context,
      customRole.id,
      {
        name: "Should never persist",
        expectedUpdatedAt: new Date(before.updatedAt.getTime() - 1),
        reason: "stale write attack",
      },
      database,
      now,
    );

    expect(result.kind).toBe("denied");

    await expect(
      database.role.findUniqueOrThrow({
        where: { id: customRole.id },
        select: { name: true, updatedAt: true },
      }),
    ).resolves.toEqual(before);

    expect(
      (await auditActions(context.requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.role.manage");
  });

  it("denies a stale preflight context after actor authority is revoked", async () => {
    const requestId = "r5-admin-db-mid-mutation-revocation";
    const { context, actorGrant } = await adminActor("R01", requestId);

    await database.membershipRole.update({
      where: { id: actorGrant.id },
      data: { validUntil: now },
    });

    const key = `custom-after-revoke-${randomUUID()}`;
    const result = await createCustomAuthorizationRole(
      context,
      {
        key,
        name: "Must not exist",
        defaultScope: "ORG",
        reason: "authority revoked after preflight",
      },
      database,
      new Date(now.getTime() + 1),
    );

    expect(result.kind).toBe("denied");
    expect(
      await database.role.count({
        where: {
          organizationId: seedIds.organization.platform,
          key,
        },
      }),
    ).toBe(0);

    expect(
      (await auditActions(requestId)).map((entry) => entry.action),
    ).toContain("authorization.denied.role.manage");
  });

  it("rejects foreign membership and foreign role combinations with zero grant residue", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-foreign-combinations",
    );
    const targetMembership = await createStaffMembership();
    const localRole = await createRoleFixture({
      key: "R03",
      systemRole: true,
    });
    const foreignRole = await createRoleFixture({
      organizationId: seedIds.organization.asteria,
      key: `custom-foreign-role-${randomUUID()}`,
      systemRole: false,
    });

    const foreignMembershipResult = await assignMembershipAuthorizationRole(
      context,
      {
        membershipId: seedIds.membership.asteriaAdmin,
        roleId: localRole.id,
        scope: "ORG",
        expectedMembershipUpdatedAt: new Date(0),
        reason: "foreign membership attack",
      },
      database,
      now,
    );
    expect(foreignMembershipResult).toEqual({
      kind: "error",
      code: "NOT_FOUND",
    });

    const foreignRoleResult = await assignMembershipAuthorizationRole(
      context,
      {
        membershipId: targetMembership.id,
        roleId: foreignRole.id,
        scope: "ORG",
        expectedMembershipUpdatedAt: targetMembership.updatedAt,
        reason: "foreign role attack",
      },
      database,
      now,
    );
    expect(foreignRoleResult).toEqual({
      kind: "error",
      code: "NOT_FOUND",
    });

    expect(
      await database.membershipRole.count({
        where: {
          OR: [
            {
              membershipId: seedIds.membership.asteriaAdmin,
              roleId: localRole.id,
            },
            {
              membershipId: targetMembership.id,
              roleId: foreignRole.id,
            },
          ],
        },
      }),
    ).toBe(0);
  });

  it("commits a legitimate admin mutation with durable mutation and authorization evidence", async () => {
    const { context } = await adminActor(
      "R01",
      "r5-admin-db-success-audit",
    );
    const key = `custom-audited-${randomUUID()}`;

    const result = await createCustomAuthorizationRole(
      context,
      {
        key,
        name: "Audited Custom Role",
        defaultScope: "ORG",
        reason: "legitimate owner-authorized administration",
      },
      database,
      now,
    );

    expect(result.kind).toBe("ok");
    if (result.kind !== "ok") throw new Error("Expected successful mutation");
    createdRoleIds.push(result.value.id);

    await expect(
      database.role.findUnique({
        where: { id: result.value.id },
        select: { key: true, systemRole: true },
      }),
    ).resolves.toEqual({
      key,
      systemRole: false,
    });

    const evidence = await auditActions(context.requestId);
    expect(evidence.map((entry) => entry.action)).toEqual(
      expect.arrayContaining([
        "iam.role.created",
        "authorization.completed.role.manage",
      ]),
    );

    const mutationAudit = evidence.find(
      (entry) => entry.action === "iam.role.created",
    );
    expect(mutationAudit).toMatchObject({
      actorMembershipId: seedIds.membership.operator,
      reason: "legitimate owner-authorized administration",
    });
    expect(mutationAudit?.afterHash).toMatch(/^[a-f0-9]{64}$/u);

    const completedAudit = evidence.find(
      (entry) => entry.action === "authorization.completed.role.manage",
    );
    expect(completedAudit?.redactedDiff).toEqual(
      expect.objectContaining({
        authorization: expect.objectContaining({
          phase: "COMPLETED",
          permissionKey: "role.manage",
          decision: "ALLOW",
        }),
      }),
    );
  });
});
