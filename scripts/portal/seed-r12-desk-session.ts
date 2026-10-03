import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../src/generated/prisma/client";
import { createOpaqueToken, hashOpaqueToken } from "../../src/modules/authentication/crypto/tokens";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required.");

const database = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const now = new Date();
const ownerId = crypto.randomUUID();
const clientOrgId = crypto.randomUUID();
const clientUserId = crypto.randomUUID();
const memberUserId = crypto.randomUUID();
const clientPersonId = crypto.randomUUID();
const memberPersonId = crypto.randomUUID();
const membershipId = crypto.randomUUID();
const accountId = crypto.randomUUID();
const resourceId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const clientToken = createOpaqueToken();
const memberToken = createOpaqueToken();

await database.organization.createMany({ data: [
  { id: ownerId, organizationType: "PLATFORM", legalName: "R12 Desk", displayName: "R12 Desk", slug: `r12-desk-${ownerId.slice(0, 8)}`, status: "ACTIVE" },
  { id: clientOrgId, organizationType: "CLIENT", legalName: "R12 Desk Client", displayName: "R12 Desk Client", slug: `r12-client-${clientOrgId.slice(0, 8)}`, status: "ACTIVE" },
] });
await database.person.createMany({ data: [
  { id: clientPersonId, displayName: "R12 Client", emailOriginal: "r12-client@example.test", emailNormalized: "r12-client@example.test" },
  { id: memberPersonId, displayName: "R12 Member" },
] });
await database.userAccount.createMany({ data: [
  { id: clientUserId, personId: clientPersonId, accountState: "ACTIVE", emailVerifiedAt: now },
  { id: memberUserId, personId: memberPersonId, accountState: "ACTIVE", emailVerifiedAt: now },
] });
await database.organizationMembership.create({
  data: { id: membershipId, organizationId: clientOrgId, userAccountId: clientUserId, membershipType: "CLIENT", status: "ACTIVE", joinedAt: now },
});
for (const key of ["client.dashboard.view", "client.project.view", "client.approval.view"]) {
  const permission = await database.permission.upsert({
    where: { key },
    create: { id: crypto.randomUUID(), key, domain: "client", action: "access", description: "R12 desk", riskLevel: "LOW" },
    update: {},
  });
  const roleId = crypto.randomUUID();
  await database.role.create({ data: { id: roleId, organizationId: clientOrgId, key: `r12-desk-${roleId.slice(0, 8)}`, name: "R12 Desk", systemRole: false, defaultScope: "CLIENT", status: "ACTIVE" } });
  await database.rolePermission.create({ data: { roleId, permissionId: permission.id, effect: "ALLOW", constraints: {} } });
  await database.membershipRole.create({ data: { id: crypto.randomUUID(), membershipId, roleId, scope: "CLIENT", validFrom: new Date(now.getTime() - 60_000) } });
}
await database.$executeRawUnsafe(
  `INSERT INTO platform.resources (id, resource_type, title, owner_organization_id, client_organization_id, visibility, sensitivity)
   VALUES ($1::uuid, 'client-account', 'Desk', $2::uuid, $3::uuid, 'INTERNAL', 'CONFIDENTIAL')`,
  resourceId, ownerId, clientOrgId,
);
await database.$executeRawUnsafe(
  `INSERT INTO commercial.client_accounts (id, resource_id, owner_organization_id, client_organization_id, visibility, sensitivity, updated_at)
   VALUES ($1::uuid, $2::uuid, $3::uuid, $4::uuid, 'INTERNAL', 'CONFIDENTIAL', now())`,
  accountId, resourceId, ownerId, clientOrgId,
);
await database.$executeRawUnsafe(
  `INSERT INTO portal.access_grants (
     id, owner_organization_id, client_account_id, client_organization_id, email_normalized, token_hash,
     state, user_account_id, membership_id, expires_at, accepted_at, row_version, created_by
   ) VALUES (
     $1::uuid, $2::uuid, $3::uuid, $4::uuid, 'r12-client@example.test', $5, 'ACTIVE', $6::uuid, $7::uuid,
     now() + interval '1 day', now(), 1, $7::uuid
   )`,
  crypto.randomUUID(), ownerId, accountId, clientOrgId, "ab".repeat(32), clientUserId, membershipId,
);
await database.$executeRawUnsafe(
  `INSERT INTO production.projects (
     id, resource_id, owner_organization_id, proposal_id, proposal_version_id, client_account_id, client_organization_id, title, state
   ) VALUES ($1::uuid, $1::uuid, $2::uuid, $1::uuid, $1::uuid, $3::uuid, $4::uuid, 'Visible project', 'PROJECT_CREATED')`,
  projectId, ownerId, accountId, clientOrgId,
);
await database.session.create({
  data: {
    id: crypto.randomUUID(), userAccountId: clientUserId, activeMembershipId: membershipId, tokenHash: hashOpaqueToken(clientToken),
    surface: "CLIENT", authenticationMethod: "password", mfaVerifiedAt: now, issuedAt: now, expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  },
});
await database.session.create({
  data: {
    id: crypto.randomUUID(), userAccountId: memberUserId, tokenHash: hashOpaqueToken(memberToken),
    surface: "TEAM", authenticationMethod: "password", mfaVerifiedAt: now, issuedAt: now, expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
  },
});
await database.$disconnect();
process.stdout.write(`${clientToken}\n${memberToken}`);
