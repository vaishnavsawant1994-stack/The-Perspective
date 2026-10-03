import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createOpaqueToken, hashOpaqueToken } from "../../src/modules/authentication/crypto/tokens";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const now = new Date();
const ownerId = crypto.randomUUID();
const userId = crypto.randomUUID();
const personId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const token = createOpaqueToken();

await database.organization.create({
  data: { id: ownerId, organizationType: "PLATFORM", legalName: "R13 Desk", displayName: "R13 Desk", slug: `r13-desk-${ownerId.slice(0, 8)}`, status: "ACTIVE" },
});
await database.person.create({ data: { id: personId, displayName: "R13 Operator" } });
await database.userAccount.create({ data: { id: userId, personId, accountState: "ACTIVE", emailVerifiedAt: now } });
await database.organizationMembership.create({
  data: { id: membershipId, organizationId: ownerId, userAccountId: userId, membershipType: "STAFF", status: "ACTIVE", joinedAt: now },
});
for (const key of ["settings.manage", "integration.manage"]) {
  const permission = await database.permission.upsert({
    where: { key },
    create: { id: crypto.randomUUID(), key, domain: key.split(".")[0] ?? "settings", action: "access", description: "R13 desk", riskLevel: "CRITICAL" },
    update: {},
  });
  const roleId = crypto.randomUUID();
  await database.role.create({ data: { id: roleId, organizationId: ownerId, key: `r13-desk-${roleId.slice(0, 8)}`, name: "R13 Desk", systemRole: false, defaultScope: "ORG", status: "ACTIVE" } });
  await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: "ALLOW", constraints: {} } });
  await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: "ORG", validFrom: new Date(now.getTime() - 60_000) } });
}
await database.$executeRawUnsafe(
  `INSERT INTO ops.integration_declarations (id, owner_organization_id, integration_type, state, row_version, declared_at)
   VALUES ($1::uuid, $2::uuid, 'EMAIL', 'DECLARED', 1, now())`,
  crypto.randomUUID(), ownerId,
);
await database.session.create({
  data: {
    id: crypto.randomUUID(), userAccountId: userId, activeMembershipId: membershipId, tokenHash: hashOpaqueToken(token),
    surface: "TEAM", authenticationMethod: "password", mfaVerifiedAt: now, issuedAt: now, expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  },
});
await database.$disconnect();
process.stdout.write(token);
