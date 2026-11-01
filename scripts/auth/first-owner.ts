import { randomUUID } from "node:crypto";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  AuditActorType,
  OrganizationType,
  Prisma,
  PermissionEffect,
  PrismaClient,
  RecordStatus,
  RoleScope,
} from "../../src/generated/prisma/client";
import { LAUNCH_ROLES } from "../../src/modules/authorization/launch-roles";
import { PERMISSION_DEFINITIONS } from "../../src/modules/authorization/registry";
import { createOpaqueToken, hashOpaqueToken, normalizeLoginIdentifier } from "../../src/modules/authentication/crypto/tokens";
import { requireAuthenticationConfiguration } from "../../src/modules/authentication/configuration";

const PLATFORM_SLUG = "the-perspective";
const BOOTSTRAP_ROLE_KEY = "R01";
const INVITATION_LIFETIME_MS = 24 * 60 * 60_000;

function databaseUrl() {
  if (
    process.env.PERSPECTIVE_BOOTSTRAP_TARGET !== "production" ||
    process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE !== "sessions" ||
    process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE === "true"
  ) {
    throw new Error("Explicit production target and sessions auth mode are required; test fixtures must be disabled.");
  }
  const configuration = requireAuthenticationConfiguration(process.env);
  const url = new URL(configuration.databaseUrl);
  if (!url.hostname.endsWith(".neon.tech")) {
    throw new Error("The production bootstrap command only accepts the configured Neon production database.");
  }
  if (url.searchParams.get("sslmode") !== "verify-full") {
    throw new Error("The production database connection must enforce sslmode=verify-full.");
  }
  if (new URL(configuration.publicOrigin).protocol !== "https:") {
    throw new Error("A production HTTPS app origin is required.");
  }
  return { connectionString: configuration.databaseUrl, origin: configuration.publicOrigin };
}

function requireInteractiveTerminal() {
  if (!stdin.isTTY || !stdout.isTTY) {
    throw new Error("This command must run interactively in a private operator terminal.");
  }
}

function emailInput(value: string) {
  const email = normalizeLoginIdentifier(value);
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

async function bootstrapFirstOwner(
  client: PrismaClient,
  origin: string,
  email: string,
  confirmation: string,
) {
  if (confirmation !== "CREATE FIRST OWNER") {
    throw new Error("Confirmation did not match; no data was changed.");
  }
  const roleDefinition = canonicalRole();
  const token = createOpaqueToken();
  const now = new Date();
  const invitationId = randomUUID();
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
          throw new Error(`Canonical permission key is malformed: ${definition.key}`);
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
        id: invitationId,
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

async function main() {
  requireInteractiveTerminal();
  const configuration = databaseUrl();
  if (process.argv[2] !== "bootstrap") {
    throw new Error("Usage: npm run auth:first-owner -- bootstrap");
  }
  const prompt = createInterface({ input: stdin, output: stdout });
  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString: configuration.connectionString }),
  });
  try {
    const email = emailInput(await prompt.question("Owner email: "));
    const confirmation = await prompt.question("Type CREATE FIRST OWNER to continue: ");
    const link = await bootstrapFirstOwner(client, configuration.origin, email, confirmation);
    stdout.write("First-owner invitation created. Deliver this single-use link privately; do not paste it into chat, tickets, or logs.\n");
    stdout.write(`${link}\n`);
  } finally {
    prompt.close();
    await client.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "First-owner operation failed.";
  process.stderr.write(`${message}\n`);
  process.exitCode = 1;
});
