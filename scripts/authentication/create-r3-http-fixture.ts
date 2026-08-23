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
  const email = process.env.PERSPECTIVE_AUTH_FIXTURE_EMAIL?.trim().toLowerCase();
  const password = process.env.PERSPECTIVE_AUTH_FIXTURE_PASSWORD;
  if (!email || !password) {
    throw new Error("Fixture email and password must be supplied through the process environment.");
  }

  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");
  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  const suffix = randomUUID();
  const organizationId = randomUUID();
  const personId = randomUUID();
  const userAccountId = randomUUID();
  const identityId = randomUUID();
  const credentialId = randomUUID();
  const membershipId = randomUUID();

  try {
    await database.$transaction(async (transaction) => {
      await transaction.organization.create({
        data: {
          id: organizationId,
          organizationType: OrganizationType.PLATFORM,
          legalName: `R3 HTTP Fixture ${suffix}`,
          displayName: "R3 HTTP Validation Workspace",
          slug: `r3-http-${suffix}`,
          status: RecordStatus.ACTIVE,
        },
      });
      await transaction.person.create({
        data: {
          id: personId,
          displayName: "R3 HTTP Validator",
          emailOriginal: email,
          emailNormalized: email,
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
          providerSubject: email,
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
      await transaction.organizationMembership.create({
        data: {
          id: membershipId,
          organizationId,
          userAccountId,
          membershipType: MembershipType.STAFF,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    });
    process.stdout.write(
      `${JSON.stringify({ fixtureCreated: true, email, surface: "TEAM" })}\n`,
    );
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown fixture error";
  process.stderr.write(`R3 HTTP fixture failed: ${message}\n`);
  process.exitCode = 1;
});
