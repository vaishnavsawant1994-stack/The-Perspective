import { randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AccountState,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  RecordStatus,
  PrismaClient,
} from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/modules/authentication/crypto/password";

async function main() {
  if (process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE !== "true") {
    throw new Error("Set PERSPECTIVE_ALLOW_AUTH_FIXTURE=true for a disposable database.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const email = process.env.PERSPECTIVE_R4_BROWSER_EMAIL;
  const password = process.env.PERSPECTIVE_R4_BROWSER_PASSWORD;
  if (!email || !password) {
    throw new Error("R4 browser fixture email and password are required.");
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const userAccountId = randomUUID();
  const personId = randomUUID();
  const identityId = randomUUID();
  const credentialId = randomUUID();

  try {
    await database.$transaction(async (transaction) => {
      await transaction.person.create({
        data: {
          id: personId,
          displayName: "R4 Multi-Organization Client",
          emailOriginal: email,
          emailNormalized: email.toLowerCase(),
        },
      });
      await transaction.userAccount.create({
        data: {
          id: userAccountId,
          personId,
          accountState: AccountState.ACTIVE,
          emailVerifiedAt: new Date(),
        },
      });
      await transaction.userIdentity.create({
        data: {
          id: identityId,
          userAccountId,
          provider: IdentityProvider.PASSWORD,
          providerSubject: email.toLowerCase(),
          credentialReference: credentialId,
        },
      });
      await transaction.passwordCredential.create({
        data: {
          id: credentialId,
          userIdentityId: identityId,
          passwordHash: await hashPassword(password),
          version: 1,
        },
      });

      for (const displayName of [
        "R4 Alpha Client Organization",
        "R4 Beta Client Organization",
      ]) {
        const organizationId = randomUUID();
        await transaction.organization.create({
          data: {
            id: organizationId,
            organizationType: OrganizationType.CLIENT,
            legalName: `${displayName} Legal`,
            displayName,
            slug: `r4-browser-${displayName.toLowerCase().replace(/[^a-z0-9]+/gu, "-")}-${organizationId}`,
            status: RecordStatus.ACTIVE,
          },
        });
        await transaction.organizationMembership.create({
          data: {
            id: randomUUID(),
            organizationId,
            userAccountId,
            membershipType: MembershipType.CLIENT,
            status: MembershipStatus.ACTIVE,
            joinedAt: new Date(),
          },
        });
      }

      const foreignOrganizationId = randomUUID();
      const foreignPersonId = randomUUID();
      const foreignUserId = randomUUID();
      await transaction.organization.create({
        data: {
          id: foreignOrganizationId,
          organizationType: OrganizationType.CLIENT,
          legalName: "R4 Foreign Client Organization Legal",
          displayName: "R4 Foreign Client Organization",
          slug: `r4-browser-foreign-${foreignOrganizationId}`,
          status: RecordStatus.ACTIVE,
        },
      });
      await transaction.person.create({
        data: {
          id: foreignPersonId,
          displayName: "R4 Foreign User",
          emailOriginal: `r4-foreign-${foreignUserId}@example.test`,
          emailNormalized: `r4-foreign-${foreignUserId}@example.test`,
        },
      });
      await transaction.userAccount.create({
        data: {
          id: foreignUserId,
          personId: foreignPersonId,
          accountState: AccountState.ACTIVE,
          emailVerifiedAt: new Date(),
        },
      });
      const foreignMembership = await transaction.organizationMembership.create({
        data: {
          id: randomUUID(),
          organizationId: foreignOrganizationId,
          userAccountId: foreignUserId,
          membershipType: MembershipType.CLIENT,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });

      process.stdout.write(
        `${JSON.stringify({
          fixtureCreated: true,
          userAccountId,
          foreignMembershipId: foreignMembership.id,
        })}\n`,
      );
    });
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown R4 fixture error";
  process.stderr.write(`R4 browser fixture failed: ${message}\n`);
  process.exitCode = 1;
});
