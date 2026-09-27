import { randomUUID } from "node:crypto";

import {
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

import { evaluateAuthorization } from "./policy";
import { loadTrustedResourceContext } from "./resource-context";
import {
  resolveAuthorizedRequestContext,
  resolveEffectiveAuthority,
} from "./resolver";

const database = createPrismaClient();
const createdMembershipRoleIds: string[] = [];
const createdRoleIds: string[] = [];
const now = new Date("2026-09-27T06:00:00.000Z");

function tenantContext(
  surface: "TEAM" | "CLIENT",
  input: {
    userId: string;
    membershipId: string;
    organizationId: string;
  },
): TenantScopedRequestContext {
  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: `r5-db-${surface.toLowerCase()}-${randomUUID()}`,
    identity: { userId: input.userId as UserId },
    session: {
      sessionId: randomUUID() as SessionId,
      issuedAt: new Date("2026-09-27T05:00:00.000Z"),
      expiresAt: new Date("2026-09-27T07:00:00.000Z"),
      authenticationMethod: "test",
    },
    membership: {
      membershipId: input.membershipId as MembershipId,
      organizationId: input.organizationId as OrganizationId,
      surface,
    },
    tenant: {
      membershipId: input.membershipId as MembershipId,
      organizationId: input.organizationId as OrganizationId,
      surface,
    },
  };
}

const teamContext = () =>
  tenantContext("TEAM", {
    userId: seedIds.user.operator,
    membershipId: seedIds.membership.operator,
    organizationId: seedIds.organization.platform,
  });

const asteriaClientContext = () =>
  tenantContext("CLIENT", {
    userId: seedIds.user.asteriaAdmin,
    membershipId: seedIds.membership.asteriaAdmin,
    organizationId: seedIds.organization.asteria,
  });

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
      description: "R5 database attack-test permission",
      riskLevel: "LOW",
    },
    update: {},
  });
}

async function attachRoleGrant(input: {
  organizationId: string;
  membershipId: string;
  permissionKey: string;
  scope: RoleScope;
  effect?: PermissionEffect;
  constraints?: object;
  validFrom?: Date;
  validUntil?: Date | null;
}) {
  const permission = await canonicalPermission(input.permissionKey);
  const roleId = randomUUID();
  const membershipRoleId = randomUUID();

  await database.role.create({
    data: {
      id: roleId,
      organizationId: input.organizationId,
      key: `r5-test-${randomUUID()}`,
      name: "R5 Attack Test Role",
      systemRole: false,
      defaultScope: input.scope,
      status: RecordStatus.ACTIVE,
    },
  });
  createdRoleIds.push(roleId);

  await database.rolePermission.create({
    data: {
      roleId,
      permissionId: permission.id,
      effect: input.effect ?? PermissionEffect.ALLOW,
      constraints: input.constraints ?? {},
    },
  });

  await database.membershipRole.create({
    data: {
      id: membershipRoleId,
      membershipId: input.membershipId,
      roleId,
      scope: input.scope,
      validFrom:
        input.validFrom ?? new Date("2026-09-27T05:00:00.000Z"),
      validUntil: input.validUntil ?? null,
    },
  });
  createdMembershipRoleIds.push(membershipRoleId);

  return { roleId, membershipRoleId, permissionId: permission.id };
}

afterEach(async () => {
  if (createdMembershipRoleIds.length > 0) {
    await database.membershipRole.deleteMany({
      where: { id: { in: [...createdMembershipRoleIds] } },
    });
    createdMembershipRoleIds.length = 0;
  }

  if (createdRoleIds.length > 0) {
    await database.role.deleteMany({
      where: { id: { in: [...createdRoleIds] } },
    });
    createdRoleIds.length = 0;
  }
});

afterAll(async () => {
  await database.$disconnect();
});

describe("R5 database-backed authority attack tests", () => {
  it("fails closed on legacy unknown permission keys from the inherited seed", async () => {
    const result = await resolveEffectiveAuthority(teamContext(), database, now);

    expect(result.kind).toBe("resolved");
    if (result.kind !== "resolved") throw new Error("Expected resolved authority");

    expect([...result.authority.permissionKeys]).toEqual([]);
    expect(result.authority.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "UNKNOWN_PERMISSION",
          permissionKey: "workspace.view",
        }),
        expect.objectContaining({
          code: "UNKNOWN_PERMISSION",
          permissionKey: "resource.read",
        }),
      ]),
    );
  });

  it("keeps a valid same-tenant ALLOW while rejecting expired, cross-tenant and malformed sibling grants", async () => {
    await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
    });
    await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
      validUntil: new Date("2026-09-27T05:30:00.000Z"),
    });
    await attachRoleGrant({
      organizationId: seedIds.organization.asteria,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
    });
    await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
      constraints: { scopeOverride: "ORG" },
    });

    const resolved = await resolveAuthorizedRequestContext(
      teamContext(),
      database,
      now,
    );

    expect(resolved.kind).toBe("authorized");
    if (resolved.kind !== "authorized") {
      throw new Error("Expected authorized request context");
    }

    expect(
      [...resolved.context.authorization.permissions].map(String),
    ).toContain("team.view");
    expect(
      [...resolved.context.authorization.blockedPermissions].map(String),
    ).toContain("team.view");

    expect(resolved.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "GRANT_NOT_ACTIVE" }),
        expect.objectContaining({ code: "CROSS_TENANT_ROLE" }),
        expect.objectContaining({
          code: "INVALID_CONSTRAINTS",
          permissionKey: "team.view",
        }),
      ]),
    );

    expect(
      evaluateAuthorization(
        resolved.context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: seedIds.organization.platform,
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "ALLOW",
      effectiveScope: "ORG",
    });
  });

  it("makes a real persisted explicit DENY beat a same-scope ALLOW", async () => {
    await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
    });
    await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
      effect: PermissionEffect.DENY,
    });

    const resolved = await resolveAuthorizedRequestContext(
      teamContext(),
      database,
      now,
    );

    expect(resolved.kind).toBe("authorized");
    if (resolved.kind !== "authorized") {
      throw new Error("Expected authorized request context");
    }

    expect(
      evaluateAuthorization(
        resolved.context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: seedIds.organization.platform,
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "PERMISSION_DENIED",
    });
  });

  it("applies membership-role revocation on the next authority resolution", async () => {
    const grant = await attachRoleGrant({
      organizationId: seedIds.organization.platform,
      membershipId: seedIds.membership.operator,
      permissionKey: "team.view",
      scope: RoleScope.ORG,
    });

    const first = await resolveAuthorizedRequestContext(
      teamContext(),
      database,
      now,
    );
    expect(first.kind).toBe("authorized");
    if (first.kind !== "authorized") throw new Error("Expected authorized context");
    expect(
      evaluateAuthorization(
        first.context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: seedIds.organization.platform,
        },
        { action: "view" },
      ).decision,
    ).toBe("ALLOW");

    await database.membershipRole.update({
      where: { id: grant.membershipRoleId },
      data: { validUntil: now },
    });

    const second = await resolveAuthorizedRequestContext(
      teamContext(),
      database,
      new Date(now.getTime() + 1),
    );
    expect(second.kind).toBe("authorized");
    if (second.kind !== "authorized") throw new Error("Expected authorized context");

    expect(
      evaluateAuthorization(
        second.context,
        "team.view",
        {
          resourceType: "team",
          ownerOrganizationId: seedIds.organization.platform,
        },
        { action: "view" },
      ),
    ).toMatchObject({
      decision: "DENY",
      reasonCode: "PERMISSION_MISSING",
    });
  });

  it("keeps Client authority organization-local even if a foreign Client role is attached", async () => {
    await attachRoleGrant({
      organizationId: seedIds.organization.asteria,
      membershipId: seedIds.membership.asteriaAdmin,
      permissionKey: "client.project.view",
      scope: RoleScope.CLIENT,
    });
    await attachRoleGrant({
      organizationId: seedIds.organization.northstar,
      membershipId: seedIds.membership.asteriaAdmin,
      permissionKey: "client.project.view",
      scope: RoleScope.CLIENT,
    });

    const resolved = await resolveAuthorizedRequestContext(
      asteriaClientContext(),
      database,
      now,
    );

    expect(resolved.kind).toBe("authorized");
    if (resolved.kind !== "authorized") {
      throw new Error("Expected authorized client context");
    }

    expect(resolved.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "CROSS_TENANT_ROLE" }),
      ]),
    );

    expect(
      evaluateAuthorization(
        resolved.context,
        "client.project.view",
        {
          resourceType: "project",
          clientOrganizationId: seedIds.organization.asteria,
          visibility: "CLIENT_SHARED",
        },
        {
          action: "view",
          clientSafeProjection: true,
        },
        { activeStages: new Set(["R12"]) },
      ).decision,
    ).toBe("ALLOW");
  });

  it("pre-filters Client resource lookup before exposing rows", async () => {
    await expect(
      loadTrustedResourceContext(
        asteriaClientContext(),
        seedIds.resource.asteriaShared,
        database,
      ),
    ).resolves.toMatchObject({
      resourceId: seedIds.resource.asteriaShared,
      clientOrganizationId: seedIds.organization.asteria,
      visibility: "CLIENT_SHARED",
    });

    await expect(
      loadTrustedResourceContext(
        asteriaClientContext(),
        seedIds.resource.asteriaInternal,
        database,
      ),
    ).resolves.toBeNull();

    await expect(
      loadTrustedResourceContext(
        asteriaClientContext(),
        seedIds.resource.northstarShared,
        database,
      ),
    ).resolves.toBeNull();
  });
});
