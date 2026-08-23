import { randomUUID } from "node:crypto";

import {
  AccountState,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  RecordStatus,
  RoleScope,
} from "@/generated/prisma/client";
import { createPrismaClient } from "@/modules/persistence/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hashPassword } from "./crypto/password";
import { openSecret, type SealedSecret } from "./crypto/sealed-secret";
import { generateTotpCode } from "./crypto/totp";
import { createOpaqueToken, hashOpaqueToken } from "./crypto/tokens";
import {
  acceptInvitation,
  authenticatePassword,
  beginTotpEnrollment,
  completeRecovery,
  confirmTotpEnrollment,
  inspectInvitation,
  requestRecovery,
  revokeSession,
  verifyMfaLogin,
  verifySessionToken,
} from "./service";
import type {
  AuthenticationRequestMetadata,
  AuthenticationSurface,
} from "./types";

const database = createPrismaClient();
const dataKey = Buffer.alloc(32, 23);
const originalEnvironment = {
  boundary: process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE,
  origin: process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN,
  key: process.env.PERSPECTIVE_AUTH_DATA_KEY,
  version: process.env.PERSPECTIVE_AUTH_KEY_VERSION,
};

function metadata(label: string): AuthenticationRequestMetadata {
  return {
    correlationId: `r3-test-${label}-${randomUUID()}`,
    ipAddress: `198.51.100.${Math.floor(Math.random() * 200) + 1}`,
    deviceId: "r3-vitest",
  };
}

function membershipType(surface: AuthenticationSurface) {
  return surface === "TEAM" ? MembershipType.STAFF : MembershipType.CLIENT;
}

async function createOrganization(surface: AuthenticationSurface) {
  const id = randomUUID();
  return database.organization.create({
    data: {
      id,
      organizationType:
        surface === "TEAM" ? OrganizationType.PLATFORM : OrganizationType.CLIENT,
      legalName: `R3 Test ${id}`,
      displayName: `R3 Test ${surface} Organization`,
      slug: `r3-${surface.toLowerCase()}-${id}`,
      status: RecordStatus.ACTIVE,
    },
  });
}

async function createPasswordUser(
  surface: AuthenticationSurface,
  password: string,
  organizationId?: string,
) {
  const suffix = randomUUID();
  const email = `r3-${suffix}@example.test`;
  const organization = organizationId
    ? await database.organization.findUniqueOrThrow({ where: { id: organizationId } })
    : await createOrganization(surface);
  const personId = randomUUID();
  const userAccountId = randomUUID();
  const identityId = randomUUID();
  const credentialId = randomUUID();
  const membershipId = randomUUID();
  const passwordHash = await hashPassword(password);

  await database.$transaction(async (transaction) => {
    await transaction.person.create({
      data: {
        id: personId,
        displayName: `R3 User ${suffix}`,
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
        passwordHash,
        version: 1,
      },
    });
    await transaction.organizationMembership.create({
      data: {
        id: membershipId,
        organizationId: organization.id,
        userAccountId,
        membershipType: membershipType(surface),
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
  });

  return {
    email,
    identityId,
    membershipId,
    organizationId: organization.id,
    password,
    userAccountId,
  };
}

beforeAll(() => {
  process.env.PERSPECTIVE_AUTH_BOUNDARY_MODE = "sessions";
  process.env.PERSPECTIVE_PUBLIC_APP_ORIGIN = "http://localhost:3100";
  process.env.PERSPECTIVE_AUTH_DATA_KEY = dataKey.toString("base64");
  process.env.PERSPECTIVE_AUTH_KEY_VERSION = "1";
});

afterAll(async () => {
  await database.$disconnect();
  for (const [key, value] of Object.entries(originalEnvironment)) {
    const environmentName = {
      boundary: "PERSPECTIVE_AUTH_BOUNDARY_MODE",
      origin: "PERSPECTIVE_PUBLIC_APP_ORIGIN",
      key: "PERSPECTIVE_AUTH_DATA_KEY",
      version: "PERSPECTIVE_AUTH_KEY_VERSION",
    }[key as keyof typeof originalEnvironment];
    if (value === undefined) delete process.env[environmentName];
    else process.env[environmentName] = value;
  }
});

describe("R3 PostgreSQL authentication boundary", () => {
  it("creates opaque surface-bound sessions and revokes them on logout", async () => {
    const user = await createPasswordUser(
      "TEAM",
      "R3 Unique Team Passphrase 2026!",
    );
    const result = await authenticatePassword(
      { email: user.email, password: user.password, surface: "TEAM", remember: true },
      metadata("login"),
      database,
    );
    expect(result.kind).toBe("authenticated");
    if (result.kind !== "authenticated") throw new Error("Expected session.");

    expect(Buffer.from(result.token, "base64url")).toHaveLength(32);
    expect(await verifySessionToken(result.token, "TEAM", database)).toMatchObject({
      userAccountId: user.userAccountId,
      membershipId: user.membershipId,
      surface: "TEAM",
    });
    expect(await verifySessionToken(result.token, "CLIENT", database)).toBeNull();
    expect(await verifySessionToken(createOpaqueToken(), "TEAM", database)).toBeNull();
    const expiredToken = createOpaqueToken();
    await database.session.create({
      data: {
        id: randomUUID(),
        userAccountId: user.userAccountId,
        activeMembershipId: user.membershipId,
        tokenHash: hashOpaqueToken(expiredToken),
        surface: "TEAM",
        authenticationMethod: "password",
        issuedAt: new Date(Date.now() - 2 * 60 * 60_000),
        expiresAt: new Date(Date.now() - 60 * 60_000),
      },
    });
    expect(await verifySessionToken(expiredToken, "TEAM", database)).toBeNull();
    expect(result.session.expiresAt.getTime() - result.session.issuedAt.getTime()).toBe(
      30 * 24 * 60 * 60_000,
    );

    await database.organization.update({
      where: { id: user.organizationId },
      data: { status: RecordStatus.SUSPENDED },
    });
    expect(await verifySessionToken(result.token, "TEAM", database)).toBeNull();
    await database.organization.update({
      where: { id: user.organizationId },
      data: { status: RecordStatus.ACTIVE },
    });
    await database.userAccount.update({
      where: { id: user.userAccountId },
      data: { accountState: AccountState.DISABLED },
    });
    expect(await verifySessionToken(result.token, "TEAM", database)).toBeNull();
    await database.userAccount.update({
      where: { id: user.userAccountId },
      data: { accountState: AccountState.ACTIVE },
    });

    expect(await revokeSession(result.token, metadata("logout"), database)).toBe(true);
    expect(await verifySessionToken(result.token, "TEAM", database)).toBeNull();
    expect(await revokeSession(result.token, metadata("logout-replay"), database)).toBe(false);
  });

  it("returns generic failures, throttles repeated attempts, and rejects ambiguous context", async () => {
    const user = await createPasswordUser(
      "TEAM",
      "R3 Generic Failure Passphrase 2026!",
    );
    const wrong = await authenticatePassword(
      { email: user.email, password: "not-the-password", surface: "TEAM" },
      metadata("wrong"),
      database,
    );
    const unknown = await authenticatePassword(
      {
        email: `missing-${randomUUID()}@example.test`,
        password: "not-the-password",
        surface: "TEAM",
      },
      metadata("unknown"),
      database,
    );
    expect(wrong).toEqual({ kind: "invalid" });
    expect(unknown).toEqual({ kind: "invalid" });

    const throttledEmail = `throttle-${randomUUID()}@example.test`;
    const throttleMetadata = metadata("throttle");
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await expect(
        authenticatePassword(
          { email: throttledEmail, password: "invalid", surface: "TEAM" },
          throttleMetadata,
          database,
        ),
      ).resolves.toEqual({ kind: "invalid" });
    }
    await expect(
      authenticatePassword(
        { email: throttledEmail, password: "invalid", surface: "TEAM" },
        throttleMetadata,
        database,
      ),
    ).resolves.toEqual({ kind: "throttled" });

    const secondOrganization = await createOrganization("TEAM");
    await database.organizationMembership.create({
      data: {
        id: randomUUID(),
        organizationId: secondOrganization.id,
        userAccountId: user.userAccountId,
        membershipType: MembershipType.STAFF,
        status: MembershipStatus.ACTIVE,
        joinedAt: new Date(),
      },
    });
    await expect(
      authenticatePassword(
        { email: user.email, password: user.password, surface: "TEAM" },
        metadata("ambiguous"),
        database,
      ),
    ).resolves.toEqual({ kind: "invalid" });
  });

  it("accepts invitations explicitly, once, and does not consume them during login", async () => {
    const clientOrganization = await createOrganization("CLIENT");
    const role = await database.role.create({
      data: {
        id: randomUUID(),
        organizationId: clientOrganization.id,
        key: `client-${randomUUID()}`,
        name: "Client User",
        defaultScope: RoleScope.CLIENT,
        status: RecordStatus.ACTIVE,
      },
    });
    const token = createOpaqueToken();
    const invitedEmail = `invite-${randomUUID()}@example.test`;
    const invitation = await database.invitation.create({
      data: {
        id: randomUUID(),
        organizationId: clientOrganization.id,
        emailNormalized: invitedEmail,
        intendedRoleId: role.id,
        tokenHash: hashOpaqueToken(token),
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
    });
    expect(await inspectInvitation(token, database)).toMatchObject({
      organizationName: clientOrganization.displayName,
      roleName: "Client User",
      surface: "CLIENT",
    });

    const accepted = await acceptInvitation(
      {
        token,
        displayName: "Invited R3 Client",
        password: "R3 Invitation Passphrase 2026!",
        termsAccepted: true,
      },
      metadata("invite"),
      database,
    );
    expect(accepted.kind).toBe("accepted");
    expect(await inspectInvitation(token, database)).toBeNull();
    await expect(
      acceptInvitation(
        {
          token,
          displayName: "Replay",
          password: "R3 Invitation Passphrase 2026!",
          termsAccepted: true,
        },
        metadata("invite-replay"),
        database,
      ),
    ).resolves.toEqual({ kind: "invalid" });
    expect(
      await database.invitation.findUniqueOrThrow({ where: { id: invitation.id } }),
    ).toMatchObject({ acceptedAt: expect.any(Date), termsAcceptedAt: expect.any(Date) });

    const teamUser = await createPasswordUser(
      "TEAM",
      "R3 Existing Account Passphrase 2026!",
    );
    const pendingToken = createOpaqueToken();
    const pending = await database.invitation.create({
      data: {
        id: randomUUID(),
        organizationId: clientOrganization.id,
        emailNormalized: teamUser.email,
        intendedRoleId: role.id,
        tokenHash: hashOpaqueToken(pendingToken),
        expiresAt: new Date(Date.now() + 60 * 60_000),
      },
    });
    const login = await authenticatePassword(
      { email: teamUser.email, password: teamUser.password, surface: "TEAM" },
      metadata("invite-existing-login"),
      database,
    );
    expect(login.kind).toBe("authenticated");
    expect(
      await database.invitation.findUniqueOrThrow({ where: { id: pending.id } }),
    ).toMatchObject({ acceptedAt: null });
    if (login.kind !== "authenticated") throw new Error("Expected session.");
    const existingAccepted = await acceptInvitation(
      {
        token: pendingToken,
        displayName: "Existing User",
        termsAccepted: true,
        existingSessionToken: login.token,
      },
      metadata("invite-existing-accept"),
      database,
    );
    expect(existingAccepted.kind).toBe("accepted");
  });

  it("enrolls encrypted TOTP and requires a one-time challenge before session creation", async () => {
    const user = await createPasswordUser(
      "CLIENT",
      "R3 MFA Client Passphrase 2026!",
    );
    const login = await authenticatePassword(
      { email: user.email, password: user.password, surface: "CLIENT" },
      metadata("mfa-initial-login"),
      database,
    );
    if (login.kind !== "authenticated") throw new Error("Expected session.");

    const enrollment = await beginTotpEnrollment(
      login.token,
      user.email,
      metadata("mfa-enroll"),
      database,
    );
    expect(enrollment?.uri).toContain("otpauth://totp/");
    if (!enrollment) throw new Error("Expected enrollment.");
    expect(
      await confirmTotpEnrollment(
        login.token,
        enrollment.challengeToken,
        generateTotpCode(enrollment.secret),
        metadata("mfa-confirm"),
        database,
      ),
    ).toBe(true);
    const storedSecret = await database.authenticationSecret.findFirstOrThrow({
      where: { userAccountId: user.userAccountId },
    });
    expect(JSON.stringify(storedSecret)).not.toContain(enrollment.secret);
    await revokeSession(login.token, metadata("mfa-logout"), database);

    const challenged = await authenticatePassword(
      { email: user.email, password: user.password, surface: "CLIENT", remember: true },
      metadata("mfa-login"),
      database,
    );
    expect(challenged.kind).toBe("mfa-required");
    if (challenged.kind !== "mfa-required") throw new Error("Expected MFA.");
    await expect(
      verifyMfaLogin(challenged.challengeToken, "000000", metadata("mfa-wrong"), database),
    ).resolves.toEqual({ kind: "invalid" });
    const verified = await verifyMfaLogin(
      challenged.challengeToken,
      generateTotpCode(enrollment.secret),
      metadata("mfa-correct"),
      database,
    );
    expect(verified.kind).toBe("authenticated");
    if (verified.kind !== "authenticated") throw new Error("Expected MFA session.");
    expect(verified.session).toMatchObject({
      authenticationMethod: "password+totp",
      mfaVerifiedAt: expect.any(Date),
    });
    expect(await verifyMfaLogin(challenged.challengeToken, generateTotpCode(enrollment.secret), metadata("mfa-replay"), database)).toEqual({ kind: "invalid" });
  });

  it("recovers generically with a single-use token, immutable history, and global session revocation", async () => {
    const oldPassword = "R3 Old Recovery Passphrase 2026!";
    const newPassword = "R3 New Recovery Passphrase 2026!";
    const user = await createPasswordUser("TEAM", oldPassword);
    const login = await authenticatePassword(
      { email: user.email, password: oldPassword, surface: "TEAM" },
      metadata("recovery-login"),
      database,
    );
    if (login.kind !== "authenticated") throw new Error("Expected session.");
    await expect(
      requestRecovery(
        { email: `missing-${randomUUID()}@example.test`, surface: "TEAM" },
        metadata("recovery-missing"),
        database,
      ),
    ).resolves.toEqual({ accepted: true });
    await expect(
      requestRecovery(
        { email: user.email, surface: "TEAM" },
        metadata("recovery-known"),
        database,
      ),
    ).resolves.toEqual({ accepted: true });

    const challenge = await database.recoveryChallenge.findFirstOrThrow({
      where: { userAccountId: user.userAccountId, consumedAt: null, revokedAt: null },
      orderBy: { createdAt: "desc" },
    });
    const event = await database.outboxEvent.findFirstOrThrow({
      where: { idempotencyKey: `auth-recovery:${challenge.id}` },
    });
    const payload = event.payload as unknown as {
      sealedToken: SealedSecret;
    };
    const token = openSecret(
      payload.sealedToken,
      dataKey,
      1,
      `recovery:${challenge.id}:${user.userAccountId}`,
    );
    expect(JSON.stringify(event.payload)).not.toContain(token);
    expect(
      await completeRecovery(
        { token, password: newPassword, surface: "TEAM" },
        metadata("recovery-complete"),
        database,
      ),
    ).toBe(true);
    expect(await verifySessionToken(login.token, "TEAM", database)).toBeNull();
    await expect(
      completeRecovery(
        { token, password: newPassword, surface: "TEAM" },
        metadata("recovery-replay"),
        database,
      ),
    ).resolves.toBe(false);
    await expect(
      authenticatePassword(
        { email: user.email, password: oldPassword, surface: "TEAM" },
        metadata("recovery-old-password"),
        database,
      ),
    ).resolves.toEqual({ kind: "invalid" });
    expect(
      await authenticatePassword(
        { email: user.email, password: newPassword, surface: "TEAM" },
        metadata("recovery-new-password"),
        database,
      ),
    ).toMatchObject({ kind: "authenticated" });
    expect(
      await database.passwordCredential.count({ where: { userIdentityId: user.identityId } }),
    ).toBe(2);
  });

  it.each(["password_credentials", "authentication_attempts", "authentication_secrets"])(
    "rejects mutation of append-only iam.%s evidence",
    async (table) => {
      await expect(
        database.$executeRawUnsafe(
          `DELETE FROM iam.${table} WHERE id = (SELECT id FROM iam.${table} LIMIT 1)`,
        ),
      ).rejects.toMatchObject({ code: "P2010" });
    },
  );
});
