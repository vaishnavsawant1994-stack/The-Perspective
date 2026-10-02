import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createOpaqueToken, hashOpaqueToken } from "../../src/modules/authentication/crypto/tokens";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const now = new Date();
const organizationId = crypto.randomUUID();
const userId = crypto.randomUUID();
const personId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const token = createOpaqueToken();

await database.organization.create({
  data: { id: organizationId, organizationType: "PLATFORM", legalName: "R11 Desk", displayName: "R11 Desk", slug: `r11-desk-${organizationId.slice(0, 8)}`, status: "ACTIVE" },
});
await database.person.create({ data: { id: personId, displayName: "R11 Desk", emailOriginal: "r11-desk@example.test", emailNormalized: "r11-desk@example.test" } });
await database.userAccount.create({ data: { id: userId, personId, accountState: "ACTIVE", emailVerifiedAt: now } });
await database.organizationMembership.create({
  data: { id: membershipId, organizationId, userAccountId: userId, membershipType: "STAFF", status: "ACTIVE", joinedAt: now },
});
for (const key of ["report.create", "report.view"]) {
  const permission = await database.permission.upsert({
    where: { key },
    create: { id: crypto.randomUUID(), key, domain: "report", action: "access", description: "R11 desk qualification", riskLevel: "HIGH" },
    update: {},
  });
  const roleId = crypto.randomUUID();
  await database.role.create({ data: { id: roleId, organizationId, key: `r11-desk-${roleId.slice(0, 8)}`, name: "R11 Desk", systemRole: false, defaultScope: "ORG", status: "ACTIVE" } });
  await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: "ALLOW", constraints: {} } });
  await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: "ORG", validFrom: new Date(now.getTime() - 60_000) } });
}
await database.session.create({
  data: {
    id: crypto.randomUUID(),
    userAccountId: userId,
    activeMembershipId: membershipId,
    tokenHash: hashOpaqueToken(token),
    surface: "TEAM",
    authenticationMethod: "password",
    mfaVerifiedAt: now,
    issuedAt: now,
    expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  },
});
await database.$disconnect();
process.stdout.write(token);
