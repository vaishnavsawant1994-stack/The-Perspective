import { randomUUID } from "node:crypto";
import { writeFile } from "node:fs/promises";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AccountState,
  AuthenticationSecretKind,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  MfaMethodType,
  OrganizationType,
  PermissionEffect,
  PrismaClient,
  RecordStatus,
  RoleScope,
} from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/modules/authentication/crypto/password";
import { sealSecret } from "../../src/modules/authentication/crypto/sealed-secret";
import { createTotpSeed } from "../../src/modules/authentication/crypto/totp";
import { hashSensitiveSignal } from "../../src/modules/authentication/crypto/tokens";

async function main() {
  if (process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE !== "true") {
    throw new Error("Set PERSPECTIVE_ALLOW_AUTH_FIXTURE=true for a disposable database.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const r01Email = process.env.PERSPECTIVE_R5_BROWSER_R01_EMAIL;
  const r01Password = process.env.PERSPECTIVE_R5_BROWSER_R01_PASSWORD;
  const r02Email = process.env.PERSPECTIVE_R5_BROWSER_R02_EMAIL;
  const r02Password = process.env.PERSPECTIVE_R5_BROWSER_R02_PASSWORD;
  const outputFile =
    process.env.PERSPECTIVE_R5_BROWSER_FIXTURE_FILE ??
    "/tmp/r5-browser-fixture.json";
  const dataKeyValue = process.env.PERSPECTIVE_AUTH_DATA_KEY;
  const keyVersion = Number(process.env.PERSPECTIVE_AUTH_KEY_VERSION ?? "0");
  if (
    !r01Email ||
    !r01Password ||
    !r02Email ||
    !r02Password ||
    !dataKeyValue ||
    !Number.isInteger(keyVersion) ||
    keyVersion <= 0
  ) {
    throw new Error("R5 browser credentials and authentication key material are required.");
  }
  const dataKey = Buffer.from(dataKeyValue, "base64");

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
    password: string;
    displayName: string;
  }) {
    const personId = randomUUID();
    const userAccountId = randomUUID();
    const identityId = randomUUID();
    const credentialId = randomUUID();
    const membershipId = randomUUID();
    const secretId = randomUUID();
    const mfaMethodId = randomUUID();
    const totpSeed = createTotpSeed();
    const sealed = sealSecret(
      totpSeed,
      dataKey,
      keyVersion,
      `totp:${secretId}:${userAccountId}`,
    );

    const membership = await database.$transaction(async (transaction) => {
      await transaction.person.create({
        data: {
          id: personId,
          displayName: input.displayName,
          emailOriginal: input.email,
          emailNormalized: input.email,
        },
      });
      await transaction.userAccount.create({
        data: {
          id: userAccountId,
          personId,
          accountState: AccountState.ACTIVE,
          emailVerifiedAt: now,
        },
      });
      await transaction.userIdentity.create({
        data: {
          id: identityId,
          userAccountId,
          provider: IdentityProvider.PASSWORD,
          providerSubject: input.email,
          credentialReference: credentialId,
        },
      });
      await transaction.passwordCredential.create({
        data: {
          id: credentialId,
          userIdentityId: identityId,
          passwordHash: await hashPassword(input.password),
          version: 1,
        },
      });
      await transaction.authenticationSecret.create({
        data: {
          id: secretId,
          userAccountId,
          secretKind: AuthenticationSecretKind.TOTP_SEED,
          ...sealed,
        },
      });
      await transaction.mfaMethod.create({
        data: {
          id: mfaMethodId,
          userAccountId,
          methodType: MfaMethodType.TOTP,
          secretReference: secretId,
          keyFingerprint: hashSensitiveSignal(totpSeed, dataKey),
          verifiedAt: now,
        },
      });
      return transaction.organizationMembership.create({
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
    });

    return { userAccountId, membership, totpSeed };
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
      email: r01Email,
      password: r01Password,
      displayName: "R5 Browser R01",
    });
    const r02User = await userWithMembership({
      organizationId: platform.id,
      email: r02Email,
      password: r02Password,
      displayName: "R5 Browser R02",
    });
    const targetUser = await userWithMembership({
      organizationId: platform.id,
      email: `r5-target-${randomUUID()}@example.test`,
      password: "R5 Browser Target Passphrase 2026!",
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

    const output = {
      platformOrganizationId: platform.id,
      r01Email,
      r01Password,
      r01TotpSeed: r01User.totpSeed,
      r02Email,
      r02Password,
      r02TotpSeed: r02User.totpSeed,
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
