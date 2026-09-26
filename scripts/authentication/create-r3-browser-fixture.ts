import { randomUUID } from "node:crypto";

import { PrismaPg } from "@prisma/adapter-pg";
import {
  AccountState,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  RecordStatus,
  RoleScope,
  PrismaClient,
} from "../../src/generated/prisma/client";
import { hashPassword } from "../../src/modules/authentication/crypto/password";
import { hashOpaqueToken } from "../../src/modules/authentication/crypto/tokens";

type Surface = "TEAM" | "CLIENT";

async function main() {
  if (process.env.PERSPECTIVE_ALLOW_AUTH_FIXTURE !== "true") {
    throw new Error("Set PERSPECTIVE_ALLOW_AUTH_FIXTURE=true for a disposable database.");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

  const required = [
    "PERSPECTIVE_BROWSER_TEAM_EMAIL",
    "PERSPECTIVE_BROWSER_TEAM_PASSWORD",
    "PERSPECTIVE_BROWSER_CLIENT_EMAIL",
    "PERSPECTIVE_BROWSER_CLIENT_PASSWORD",
    "PERSPECTIVE_BROWSER_INVITATION_EMAIL",
    "PERSPECTIVE_BROWSER_INVITATION_TOKEN",
  ] as const;

  for (const name of required) {
    if (!process.env[name]) throw new Error(`${name} is required.`);
  }

  const database = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });

  async function createOrganization(
    surface: Surface,
    displayName: string,
  ) {
    const id = randomUUID();
    return database.organization.create({
      data: {
        id,
        organizationType:
          surface === "TEAM" ? OrganizationType.PLATFORM : OrganizationType.CLIENT,
        legalName: `${displayName} Legal`,
        displayName,
        slug: `r3-browser-${surface.toLowerCase()}-${id}`,
        status: RecordStatus.ACTIVE,
      },
    });
  }

  async function createPasswordUser(
    surface: Surface,
    email: string,
    password: string,
    displayName: string,
  ) {
    const organization = await createOrganization(
      surface,
      surface === "TEAM"
        ? "R3 Browser Team Workspace"
        : "R3 Browser Client Workspace",
    );
    const personId = randomUUID();
    const userAccountId = randomUUID();
    const identityId = randomUUID();
    const credentialId = randomUUID();
    const membershipId = randomUUID();

    await database.$transaction(async (transaction) => {
      await transaction.person.create({
        data: {
          id: personId,
          displayName,
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
          organizationId: organization.id,
          userAccountId,
          membershipType:
            surface === "TEAM" ? MembershipType.STAFF : MembershipType.CLIENT,
          status: MembershipStatus.ACTIVE,
          joinedAt: new Date(),
        },
      });
    });
  }

  try {
    await createPasswordUser(
      "TEAM",
      process.env.PERSPECTIVE_BROWSER_TEAM_EMAIL!,
      process.env.PERSPECTIVE_BROWSER_TEAM_PASSWORD!,
      "R3 Browser Team User",
    );
    await createPasswordUser(
      "CLIENT",
      process.env.PERSPECTIVE_BROWSER_CLIENT_EMAIL!,
      process.env.PERSPECTIVE_BROWSER_CLIENT_PASSWORD!,
      "R3 Browser Client User",
    );

    const invitationOrganization = await createOrganization(
      "CLIENT",
      "R3 Browser Invitation Organization",
    );
    const role = await database.role.create({
      data: {
        id: randomUUID(),
        organizationId: invitationOrganization.id,
        key: `browser-client-${randomUUID()}`,
        name: "Browser Review Client",
        defaultScope: RoleScope.CLIENT,
        status: RecordStatus.ACTIVE,
      },
    });
    await database.invitation.create({
      data: {
        id: randomUUID(),
        organizationId: invitationOrganization.id,
        emailNormalized: process.env.PERSPECTIVE_BROWSER_INVITATION_EMAIL!,
        intendedRoleId: role.id,
        tokenHash: hashOpaqueToken(
          process.env.PERSPECTIVE_BROWSER_INVITATION_TOKEN!,
        ),
        expiresAt: new Date(Date.now() + 2 * 60 * 60_000),
      },
    });

    process.stdout.write(
      `${JSON.stringify({
        fixtureCreated: true,
        teamEmail: process.env.PERSPECTIVE_BROWSER_TEAM_EMAIL,
        clientEmail: process.env.PERSPECTIVE_BROWSER_CLIENT_EMAIL,
        invitationOrganization: invitationOrganization.displayName,
        invitationRole: role.name,
      })}\n`,
    );
  } finally {
    await database.$disconnect();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown browser fixture error";
  process.stderr.write(`R3 browser fixture failed: ${message}\n`);
  process.exitCode = 1;
});
