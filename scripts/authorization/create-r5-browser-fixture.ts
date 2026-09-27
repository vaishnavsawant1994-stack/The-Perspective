import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AccountState,
  AuthSurface,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  PermissionEffect,
  PrismaClient,
  RecordStatus,
  RoleScope,
} from "../../src/generated/prisma/client";
import { hashOpaqueToken } from "../../src/modules/authentication/crypto/tokens";

async function main() {
  if (process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE !== "true") {
    throw new Error("Set PERSPECTIVE_ALLOW_AUTH_FIXTURE=true for a disposable database.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const r01Token = process.env.PERSPECTIVE_R5_BROWSER_R01_TOKEN;
  const r02Token = process.env.PERSPECTIVE_R5_BROWSER_R02_TOKEN;
  const outputFile =
    process.env.PERSPECTIVE_R5_BROWSER_FIXTURE_FILE ??
    "/tmp/r5-browser-fixture.json";
  if (!r01Token || !r02Token) {
    throw new Error("R5 browser session tokens are required.");
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const now = new Date();

  async function permission(key: string) {
    const [domain, ...parts] = key.split(".");
    return database.permission.upsert({
      where: { key },
      create: {
        id: randomUUID(),
        key,
        domain,
        action: parts.join(".") || "access",
        description: "R5 browser fixture permission",
        riskLevel: "CRITICAL",
      },
      update: {},
    });
  }

  async function userWithMembership(input: {
    organizationId: string;
    email: string;
    displayName: string;
  }) {
    const personId = randomUUID();
    const userAccountId = randomUUID();
    const membershipId = randomUUID();

    await database.person.create({
      data: {
        id: personId,
        displayName: input.displayName,
        emailOriginal: input.email,
        emailNormalized: input.email,
      },
    });
    await database.userAccount.create({
      data: {
        id: userAccountId,
        personId,
        accountState: AccountState.ACTIVE,
        emailVerifiedAt: now,
      },
    });
    await database.userIdentity.create({
      data: {
        id: randomUUID(),
        userAccountId,
        provider: IdentityProvider.PASSWORD,
        providerSubject: input.email,
      },
    });
    const membership = await database.organizationMembership.create({
      data: {
        id: membershipId,
        organizationId: input.organizationId,
        userAccountId,
        membershipType: MembershipType.STAFF,
        status: MembershipStatus.ACTIVE,
        joinedAt: now,
      },
      select: { id: true, updatedAt: true },
    });

    return { userAccountId, membership };
  }

  async function launchRole(
    organizationId: string,
    key: "R01" | "R02" | "R03",
    permissionKeys: readonly string[] = [],
  ) {
    const role = await database.role.create({
      data: {
        id: randomUUID(),
        organizationId,
        key,
        name: `R5 Browser ${key}`,
        systemRole: true,
        defaultScope: RoleScope.ORG,
        status: RecordStatus.ACTIVE,
      },
    });

    for (const key of permissionKeys) {
      const record = await permission(key);
      await database.rolePermission.create({
        data: {
          roleId: role.id,
          permissionId: record.id,
          effect: PermissionEffect.ALLOW,
          constraints: {},
        },
      });
    }
    return role;
  }

  async function grant(membershipId: string, roleId: string) {
    return database.membershipRole.create({
      data: {
        id: randomUUID(),
        membershipId,
        roleId,
        scope: RoleScope.ORG,
        validFrom: new Date(now.getTime() - 60_000),
      },
    });
  }

  try {
    const platform = await database.organization.create({
      data: {
        id: randomUUID(),
        organizationType: OrganizationType.PLATFORM,
        legalName: "R5 Browser Platform Legal",
        displayName: "R5 Browser Platform",
        slug: `r5-browser-platform-${randomUUID()}`,
        status: RecordStatus.ACTIVE,
      },
    });
    const foreign = await database.organization.create({
      data: {
        id: randomUUID(),
        organizationType: OrganizationType.CLIENT,
        legalName: "R5 Browser Foreign Legal",
        displayName: "R5 Browser Foreign",
        slug: `r5-browser-foreign-${randomUUID()}`,
        status: RecordStatus.ACTIVE,
      },
    });

    const r01User = await userWithMembership({
      organizationId: platform.id,
      email: `r5-r01-${randomUUID()}@example.test`,
      displayName: "R5 Browser R01",
    });
    const r02User = await userWithMembership({
      organizationId: platform.id,
      email: `r5-r02-${randomUUID()}@example.test`,
      displayName: "R5 Browser R02",
    });
    const targetUser = await userWithMembership({
      organizationId: platform.id,
      email: `r5-target-${randomUUID()}@example.test`,
      displayName: "R5 Browser Target",
    });

    const r01Role = await launchRole(platform.id, "R01", [
      "team.view",
      "role.manage",
      "permission.manage",
    ]);
    const r02Role = await launchRole(platform.id, "R02", [
      "team.view",
      "role.manage",
      "permission.manage",
    ]);
    const r03Role = await launchRole(platform.id, "R03");

    await grant(r01User.membership.id, r01Role.id);
    await grant(r02User.membership.id, r02Role.id);

    const foreignRole = await database.role.create({
      data: {
        id: randomUUID(),
        organizationId: foreign.id,
        key: `custom-foreign-${randomUUID()}`,
        name: "Foreign role",
        systemRole: false,
        defaultScope: RoleScope.ORG,
        status: RecordStatus.ACTIVE,
      },
    });

    for (const [token, actor] of [
      [r01Token, r01User],
      [r02Token, r02User],
    ] as const) {
      await database.session.create({
        data: {
          id: randomUUID(),
          userAccountId: actor.userAccountId,
          activeMembershipId: actor.membership.id,
          tokenHash: hashOpaqueToken(token),
          surface: AuthSurface.TEAM,
          authenticationMethod: "password+totp",
          mfaVerifiedAt: now,
          issuedAt: now,
          expiresAt: new Date(now.getTime() + 2 * 60 * 60_000),
        },
      });
    }

    const output = {
      platformOrganizationId: platform.id,
      r01MembershipId: r01User.membership.id,
      r01MembershipUpdatedAt: r01User.membership.updatedAt.toISOString(),
      r02MembershipId: r02User.membership.id,
      targetMembershipId: targetUser.membership.id,
      targetMembershipUpdatedAt: targetUser.membership.updatedAt.toISOString(),
      r01RoleId: r01Role.id,
      r03RoleId: r03Role.id,
      foreignRoleId: foreignRole.id,
      foreignRoleUpdatedAt: foreignRole.updatedAt.toISOString(),
    };
    await writeFile(outputFile, JSON.stringify(output), "utf8");
    process.stdout.write(`${JSON.stringify({ fixtureCreated: true, outputFile })}\n`);
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown R5 browser fixture error";
  process.stderr.write(`R5 browser fixture failed: ${message}\n`);
  process.exitCode = 1;
});
