import "server-only";

import { randomUUID } from "node:crypto";
import {
  AuditActorType,
  OrganizationType,
  PermissionEffect,
  Prisma,
  RecordStatus,
  RoleScope,
  type PrismaClient,
} from "@/generated/prisma/client";
import { LAUNCH_ROLES } from "@/modules/authorization/launch-roles";
import { PERMISSION_DEFINITIONS } from "@/modules/authorization/registry";
import { createOpaqueToken, hashOpaqueToken } from "./crypto/tokens";
import { requireAuthenticationConfiguration } from "./configuration";
import { assertProductionDatabaseTarget } from "./production-database-target";

const PLATFORM_SLUG = "the-perspective";
const BOOTSTRAP_ROLE_KEY = "R01";
const INVITATION_LIFETIME_MS = 24 * 60 * 60_000;

export function requireProductionBootstrapConfiguration() {
  if (
    process.env.PERSPECTIVE_BOOTSTRAP_TARGET !== "production" ||
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE !== "sessions" ||
    process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE === "true"
  ) {
    throw new Error("Explicit production target and sessions auth mode are required; test fixtures must be disabled.");
  }
  const configuration = requireAuthenticationConfiguration(process.env);
  assertProductionDatabaseTarget(configuration.databaseUrl);
  if (new URL(configuration.publicOrigin).protocol !== "https:") {
    throw new Error("A production HTTPS app origin is required.");
  }
  return { connectionString: configuration.databaseUrl, origin: configuration.publicOrigin };
}

function emailInput(value: string) {
  const email = value.trim().toLocaleLowerCase("en-US");
  if (email.length > 320 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(email)) {
    throw new Error("Enter a valid owner email address.");
  }
  return email;
}

function canonicalRole() {
  const role = LAUNCH_ROLES.find((candidate) => candidate.code === BOOTSTRAP_ROLE_KEY);
  if (!role || !role.scopes.includes("ORG")) {
    throw new Error("The canonical R01 launch role is unavailable or invalid.");
  }
  return role;
}

async function takeBootstrapLock(transaction: Prisma.TransactionClient) {
  await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('the-perspective:first-owner-bootstrap'))`;
}

async function assertEmptyDatabase(transaction: Prisma.TransactionClient) {
  const counts = await Promise.all([
    transaction.organization.count(),
    transaction.userAccount.count(),
    transaction.organizationMembership.count(),
    transaction.invitation.count(),
    transaction.role.count(),
    transaction.permission.count(),
    transaction.session.count(),
    transaction.auditEvent.count(),
  ]);
  if (counts.some((count) => count !== 0)) {
    throw new Error("Bootstrap stopped: the database is not empty; no data was changed.");
  }
}

export async function createFirstOwnerInvitation(
  client: PrismaClient,
  ownerEmail: string,
) {
  const { origin } = requireProductionBootstrapConfiguration();
  const email = emailInput(ownerEmail);
  const roleDefinition = canonicalRole();
  const token = createOpaqueToken();
  const now = new Date();
  const organizationId = randomUUID();
  const roleId = randomUUID();
  const requestId = randomUUID();

  await client.$transaction(async (transaction) => {
    await takeBootstrapLock(transaction);
    await assertEmptyDatabase(transaction);
    await transaction.organization.create({
      data: {
        id: organizationId,
        organizationType: OrganizationType.PLATFORM,
        legalName: "The Perspective",
        displayName: "The Perspective",
        slug: PLATFORM_SLUG,
        status: RecordStatus.ACTIVE,
        settings: { firstOwnerBootstrap: true },
      },
    });
    await transaction.permission.createMany({
      data: PERMISSION_DEFINITIONS.map((definition) => {
        const separator = definition.key.lastIndexOf(".");
        if (separator < 1 || separator === definition.key.length - 1) {
          throw new Error("Canonical permission key is malformed.");
        }
        return {
          id: randomUUID(),
          key: definition.key,
          domain: definition.key.slice(0, separator),
          action: definition.key.slice(separator + 1),
          description: `Canonical ${definition.activationStage} permission.`,
          riskLevel: definition.risk,
        };
      }),
    });
    const permissions = await transaction.permission.findMany({
      where: { key: { in: [...roleDefinition.permissions] } },
      select: { id: true, key: true },
    });
    if (permissions.length !== roleDefinition.permissions.length) {
      throw new Error("Canonical R01 permission graph is incomplete; transaction rolled back.");
    }
    await transaction.role.create({
      data: {
        id: roleId,
        organizationId,
        key: roleDefinition.code,
        name: roleDefinition.name,
        description: "Canonical first-owner role; activation requires verified MFA.",
        systemRole: true,
        defaultScope: RoleScope.ORG,
        status: RecordStatus.ACTIVE,
      },
    });
    await transaction.rolePermission.createMany({
      data: permissions.map((permission) => ({
        roleId,
        permissionId: permission.id,
        effect: PermissionEffect.ALLOW,
        constraints: {},
      })),
    });
    await transaction.invitation.create({
      data: {
        id: randomUUID(),
        organizationId,
        emailNormalized: email,
        intendedRoleId: roleId,
        tokenHash: hashOpaqueToken(token),
        inviterMembershipId: null,
        expiresAt: new Date(now.getTime() + INVITATION_LIFETIME_MS),
      },
    });
    await transaction.auditEvent.create({
      data: {
        id: randomUUID(),
        ownerOrganizationId: organizationId,
        actorType: AuditActorType.SYSTEM,
        action: "auth.bootstrap.first_owner.invited",
        requestId,
        correlationId: requestId,
        reason: "One-time first-owner invite; R01 is deferred until password plus TOTP login.",
        redactedDiff: { roleKey: BOOTSTRAP_ROLE_KEY, tokenStoredAsHash: true },
        occurredAt: now,
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return `${origin}/invitation/${token}`;
}

