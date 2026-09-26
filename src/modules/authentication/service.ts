import "server-only";

import { randomUUID } from "node:crypto";
import {
  AccountState,
  AuditActorType,
  AuthAttemptKind,
  AuthAttemptOutcome,
  AuthSurface,
  AuthenticationSecretKind,
  IdentityProvider,
  MembershipStatus,
  MembershipType,
  MfaChallengePurpose,
  MfaMethodType,
  OrganizationType,
  Prisma,
  RoleScope,
  type PrismaClient,
} from "@/generated/prisma/client";
import { getPrismaClient } from "@/modules/persistence/client";
import {
  getAuthenticationConfiguration,
  requireAuthenticationConfiguration,
} from "./configuration";
import {
  getDummyPasswordHash,
  hashPassword,
  validatePassword,
  verifyPassword,
} from "./crypto/password";
import { openSecret, sealSecret } from "./crypto/sealed-secret";
import {
  buildTotpUri,
  createTotpSeed,
  verifyTotpCode,
} from "./crypto/totp";
import {
  createOpaqueToken,
  hashOpaqueToken,
  hashSensitiveSignal,
  normalizeLoginIdentifier,
} from "./crypto/tokens";
import type {
  AuthenticationRequestMetadata,
  AuthenticationSurface,
  LoginResult,
  VerifiedAuthenticationSession,
  VerifiedIdentitySession,
  VerifiedUnselectedAuthenticationSession,
} from "./types";

const LOGIN_WINDOW_MS = 15 * 60_000;
const RECOVERY_WINDOW_MS = 60 * 60_000;
const MFA_CHALLENGE_MS = 5 * 60_000;
const RECOVERY_CHALLENGE_MS = 60 * 60_000;
const STANDARD_SESSION_MS = 12 * 60 * 60_000;
const REMEMBERED_SESSION_MS = 30 * 24 * 60 * 60_000;

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

function membershipTypeFor(surface: AuthenticationSurface) {
  return surface === "TEAM" ? MembershipType.STAFF : MembershipType.CLIENT;
}

function organizationTypeFor(surface: AuthenticationSurface) {
  return surface === "TEAM" ? OrganizationType.PLATFORM : OrganizationType.CLIENT;
}

function toPrismaSurface(surface: AuthenticationSurface) {
  return surface === "TEAM" ? AuthSurface.TEAM : AuthSurface.CLIENT;
}

function hashRequestSignals(
  identifier: string,
  metadata: AuthenticationRequestMetadata,
  dataKey: Buffer,
) {
  return {
    identifierHash: hashSensitiveSignal(identifier, dataKey),
    ipHash: metadata.ipAddress
      ? hashSensitiveSignal(metadata.ipAddress, dataKey)
      : undefined,
  };
}

async function recordAttempt(
  database: DatabaseClient,
  input: {
    surface: AuthenticationSurface;
    kind: keyof typeof AuthAttemptKind;
    outcome: keyof typeof AuthAttemptOutcome;
    identifierHash: string;
    ipHash?: string;
    userAccountId?: string;
    metadata: AuthenticationRequestMetadata;
    evidence?: Prisma.InputJsonObject;
  },
) {
  await database.authenticationAttempt.create({
    data: {
      id: randomUUID(),
      surface: toPrismaSurface(input.surface),
      kind: AuthAttemptKind[input.kind],
      outcome: AuthAttemptOutcome[input.outcome],
      identifierHash: input.identifierHash,
      ipHash: input.ipHash,
      userAccountId: input.userAccountId,
      correlationId: input.metadata.correlationId,
      evidence: input.evidence ?? {},
    },
  });
}

async function recordUserAudit(
  database: DatabaseClient,
  input: {
    organizationId: string;
    userAccountId: string;
    membershipId?: string;
    action: string;
    metadata: AuthenticationRequestMetadata;
    ipHash?: string;
    reason?: string;
  },
) {
  await database.auditEvent.create({
    data: {
      id: randomUUID(),
      ownerOrganizationId: input.organizationId,
      actorType: AuditActorType.USER,
      actorUserId: input.userAccountId,
      actorMembershipId: input.membershipId,
      action: input.action,
      requestId: input.metadata.correlationId,
      correlationId: input.metadata.correlationId,
      ipHash: input.ipHash,
      deviceId: input.metadata.deviceId,
      reason: input.reason,
      occurredAt: new Date(),
    },
  });
}

async function resolveEligibleMemberships(
  database: DatabaseClient,
  userAccountId: string,
  surface: AuthenticationSurface,
) {
  return database.organizationMembership.findMany({
    where: {
      userAccountId,
      membershipType: membershipTypeFor(surface),
      status: MembershipStatus.ACTIVE,
      endedAt: null,
      organization: {
        status: "ACTIVE",
        organizationType: organizationTypeFor(surface),
      },
    },
    orderBy: [{ organization: { displayName: "asc" } }, { id: "asc" }],
    select: {
      id: true,
      organizationId: true,
      organization: {
        select: {
          displayName: true,
          organizationType: true,
        },
      },
    },
    take: 50,
  });
}

function toContextOptions(
  memberships: Awaited<ReturnType<typeof resolveEligibleMemberships>>,
  surface: AuthenticationSurface,
) {
  return memberships.map((membership) => ({
    membershipId: membership.id,
    organizationId: membership.organizationId,
    organizationName: membership.organization.displayName,
    surface,
  }));
}

async function isThrottled(
  database: DatabaseClient,
  kind: keyof typeof AuthAttemptKind,
  identifierHash: string,
  ipHash: string | undefined,
  windowMs: number,
) {
  const occurredAt = { gte: new Date(Date.now() - windowMs) };
  const outcomes = [AuthAttemptOutcome.FAILED, AuthAttemptOutcome.THROTTLED];
  const [identifierFailures, ipFailures] = await Promise.all([
    database.authenticationAttempt.count({
      where: {
        kind: AuthAttemptKind[kind],
        identifierHash,
        outcome: { in: outcomes },
        occurredAt,
      },
    }),
    ipHash
      ? database.authenticationAttempt.count({
          where: {
            kind: AuthAttemptKind[kind],
            ipHash,
            outcome: { in: outcomes },
            occurredAt,
          },
        })
      : Promise.resolve(0),
  ]);

  return identifierFailures >= 5 || ipFailures >= 20;
}

async function createSession(
  database: DatabaseClient,
  input: {
    userAccountId: string;
    membershipId: string;
    organizationId: string;
    surface: AuthenticationSurface;
    remember: boolean;
    authenticationMethod: string;
    mfaVerifiedAt?: Date;
    metadata: AuthenticationRequestMetadata;
    ipHash?: string;
  },
) {
  const token = createOpaqueToken();
  const issuedAt = new Date();
  const expiresAt = new Date(
    issuedAt.getTime() +
      (input.remember ? REMEMBERED_SESSION_MS : STANDARD_SESSION_MS),
  );
  const session = await database.session.create({
    data: {
      id: randomUUID(),
      userAccountId: input.userAccountId,
      activeMembershipId: input.membershipId,
      tokenHash: hashOpaqueToken(token),
      surface: toPrismaSurface(input.surface),
      authenticationMethod: input.authenticationMethod,
      mfaVerifiedAt: input.mfaVerifiedAt,
      deviceId: input.metadata.deviceId,
      ipHash: input.ipHash,
      issuedAt,
      expiresAt,
    },
  });

  await recordUserAudit(database, {
    organizationId: input.organizationId,
    userAccountId: input.userAccountId,
    membershipId: input.membershipId,
    action: "auth.session.created",
    metadata: input.metadata,
    ipHash: input.ipHash,
  });

  return {
    token,
    session: {
      sessionId: session.id,
      userAccountId: session.userAccountId,
      contextState: "selected",
      membershipId: input.membershipId,
      organizationId: input.organizationId,
      surface: input.surface,
      issuedAt: session.issuedAt,
      expiresAt: session.expiresAt,
      authenticationMethod: session.authenticationMethod,
      mfaVerifiedAt: session.mfaVerifiedAt ?? undefined,
    } satisfies VerifiedAuthenticationSession,
  };
}

async function createUnselectedSession(
  database: DatabaseClient,
  input: {
    userAccountId: string;
    surface: AuthenticationSurface;
    remember: boolean;
    authenticationMethod: string;
    mfaVerifiedAt?: Date;
    metadata: AuthenticationRequestMetadata;
    ipHash?: string;
  },
) {
  const token = createOpaqueToken();
  const issuedAt = new Date();
  const expiresAt = new Date(
    issuedAt.getTime() +
      (input.remember ? REMEMBERED_SESSION_MS : STANDARD_SESSION_MS),
  );
  const session = await database.session.create({
    data: {
      id: randomUUID(),
      userAccountId: input.userAccountId,
      activeMembershipId: null,
      tokenHash: hashOpaqueToken(token),
      surface: toPrismaSurface(input.surface),
      authenticationMethod: input.authenticationMethod,
      mfaVerifiedAt: input.mfaVerifiedAt,
      deviceId: input.metadata.deviceId,
      ipHash: input.ipHash,
      issuedAt,
      expiresAt,
    },
  });

  return {
    token,
    session: {
      sessionId: session.id,
      userAccountId: session.userAccountId,
      contextState: "selection-required",
      surface: input.surface,
      issuedAt: session.issuedAt,
      expiresAt: session.expiresAt,
      authenticationMethod: session.authenticationMethod,
      mfaVerifiedAt: session.mfaVerifiedAt ?? undefined,
    } satisfies VerifiedUnselectedAuthenticationSession,
  };
}

export async function authenticatePassword(
  input: {
    email: string;
    password: string;
    surface: AuthenticationSurface;
    remember?: boolean;
  },
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
): Promise<LoginResult> {
  const configuration = requireAuthenticationConfiguration(process.env);
  const identifier = normalizeLoginIdentifier(input.email);
  const signals = hashRequestSignals(identifier, metadata, configuration.dataKey);
  const throttled = await isThrottled(
    database,
    "LOGIN",
    signals.identifierHash,
    signals.ipHash,
    LOGIN_WINDOW_MS,
  );

  const identity = await database.userIdentity.findUnique({
    where: {
      provider_providerSubject: {
        provider: IdentityProvider.PASSWORD,
        providerSubject: identifier,
      },
    },
    include: {
      userAccount: {
        include: {
          mfaMethods: {
            where: {
              methodType: MfaMethodType.TOTP,
              verifiedAt: { not: null },
              disabledAt: null,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
    },
  });
  const credential = identity?.credentialReference
    ? await database.passwordCredential.findUnique({
        where: { id: identity.credentialReference },
      })
    : null;
  const encoded = credential?.passwordHash ?? (await getDummyPasswordHash());
  const passwordValid = await verifyPassword(input.password, encoded);
  const now = new Date();
  const accountEligible =
    identity?.userAccount.accountState === AccountState.ACTIVE &&
    (!identity.userAccount.lockedUntil || identity.userAccount.lockedUntil <= now) &&
    credential?.userIdentityId === identity.id;
  const memberships = identity
    ? await resolveEligibleMemberships(database, identity.userAccountId, input.surface)
    : [];

  if (throttled) {
    await recordAttempt(database, {
      surface: input.surface,
      kind: "LOGIN",
      outcome: "THROTTLED",
      ...signals,
      userAccountId: identity?.userAccountId,
      metadata,
    });
    return { kind: "throttled" };
  }

  if (!passwordValid || !accountEligible || memberships.length === 0) {
    await recordAttempt(database, {
      surface: input.surface,
      kind: "LOGIN",
      outcome: "FAILED",
      ...signals,
      userAccountId: identity?.userAccountId,
      metadata,
      evidence: { reasonClass: "invalid" },
    });
    return { kind: "invalid" };
  }

  const membership = memberships[0];
  const mfaMethod = identity!.userAccount.mfaMethods[0];

  if (mfaMethod) {
    const challengeToken = createOpaqueToken();
    const expiresAt = new Date(Date.now() + MFA_CHALLENGE_MS);
    await database.$transaction(async (transaction) => {
      await transaction.mfaChallenge.create({
        data: {
          id: randomUUID(),
          userAccountId: identity.userAccountId,
          mfaMethodId: mfaMethod.id,
          purpose: MfaChallengePurpose.LOGIN,
          tokenHash: hashOpaqueToken(challengeToken),
          surface: toPrismaSurface(input.surface),
          rememberSession: input.remember ?? false,
          expiresAt,
        },
      });
      await recordAttempt(transaction, {
        surface: input.surface,
        kind: "LOGIN",
        outcome: "CHALLENGE_REQUIRED",
        ...signals,
        userAccountId: identity.userAccountId,
        metadata,
      });
    });
    return { kind: "mfa-required", challengeToken, expiresAt };
  }

  return database.$transaction(async (transaction) => {
    const created =
      memberships.length === 1
        ? await createSession(transaction, {
            userAccountId: identity!.userAccountId,
            membershipId: membership.id,
            organizationId: membership.organizationId,
            surface: input.surface,
            remember: input.remember ?? false,
            authenticationMethod: "password",
            metadata,
            ipHash: signals.ipHash,
          })
        : await createUnselectedSession(transaction, {
            userAccountId: identity!.userAccountId,
            surface: input.surface,
            remember: input.remember ?? false,
            authenticationMethod: "password",
            metadata,
            ipHash: signals.ipHash,
          });
    await transaction.userAccount.update({
      where: { id: identity!.userAccountId },
      data: { lastLoginAt: now },
    });
    await transaction.userIdentity.update({
      where: { id: identity!.id },
      data: { lastUsedAt: now },
    });
    await recordAttempt(transaction, {
      surface: input.surface,
      kind: "LOGIN",
      outcome: "SUCCEEDED",
      ...signals,
      userAccountId: identity!.userAccountId,
      metadata,
      evidence:
        memberships.length > 1 ? { contextSelectionRequired: true } : {},
    });
    return memberships.length === 1
      ? ({ kind: "authenticated", ...created } as const)
      : ({
          kind: "context-selection-required",
          ...created,
          contexts: toContextOptions(memberships, input.surface),
        } as const);
  });
}

export async function verifyIdentitySessionToken(
  token: string | undefined,
  surface: AuthenticationSurface,
  database = getPrismaClient(),
): Promise<VerifiedIdentitySession | null> {
  const configuration = getAuthenticationConfiguration(process.env);
  if (configuration.mode !== "sessions" || !token) return null;

  const session = await database.session.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    include: {
      userAccount: true,
      activeMembership: { include: { organization: true } },
    },
  });
  const membership = session?.activeMembership;
  const now = new Date();

  if (
    !session ||
    session.surface !== toPrismaSurface(surface) ||
    session.revokedAt ||
    session.expiresAt <= now ||
    session.userAccount.accountState !== AccountState.ACTIVE ||
    (session.userAccount.lockedUntil && session.userAccount.lockedUntil > now)
  ) {
    return null;
  }

  const base = {
    sessionId: session.id,
    userAccountId: session.userAccountId,
    surface,
    issuedAt: session.issuedAt,
    expiresAt: session.expiresAt,
    authenticationMethod: session.authenticationMethod,
    mfaVerifiedAt: session.mfaVerifiedAt ?? undefined,
  };

  if (!membership) {
    return {
      ...base,
      contextState: "selection-required",
    } satisfies VerifiedUnselectedAuthenticationSession;
  }

  if (
    membership.userAccountId !== session.userAccountId ||
    membership.membershipType !== membershipTypeFor(surface) ||
    membership.status !== MembershipStatus.ACTIVE ||
    membership.endedAt ||
    membership.organization.status !== "ACTIVE" ||
    membership.organization.organizationType !== organizationTypeFor(surface)
  ) {
    return null;
  }

  return {
    ...base,
    contextState: "selected",
    membershipId: membership.id,
    organizationId: membership.organizationId,
  } satisfies VerifiedAuthenticationSession;
}

export async function verifySessionToken(
  token: string | undefined,
  surface: AuthenticationSurface,
  database = getPrismaClient(),
) {
  const verified = await verifyIdentitySessionToken(token, surface, database);
  return verified?.contextState === "selected" ? verified : null;
}

export async function listSessionContexts(
  token: string | undefined,
  database = getPrismaClient(),
) {
  const verified =
    (await verifyIdentitySessionToken(token, "TEAM", database)) ??
    (await verifyIdentitySessionToken(token, "CLIENT", database));
  if (!verified) return null;

  const memberships = await resolveEligibleMemberships(
    database,
    verified.userAccountId,
    verified.surface,
  );

  return {
    currentMembershipId:
      verified.contextState === "selected" ? verified.membershipId : null,
    contexts: toContextOptions(memberships, verified.surface),
    session: verified,
  };
}

export async function selectSessionContext(
  token: string | undefined,
  membershipId: string,
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const verified =
    (await verifyIdentitySessionToken(token, "TEAM", database)) ??
    (await verifyIdentitySessionToken(token, "CLIENT", database));
  if (!verified) return null;

  const membership = await database.organizationMembership.findFirst({
    where: {
      id: membershipId,
      userAccountId: verified.userAccountId,
      membershipType: membershipTypeFor(verified.surface),
      status: MembershipStatus.ACTIVE,
      endedAt: null,
      organization: {
        status: "ACTIVE",
        organizationType: organizationTypeFor(verified.surface),
      },
    },
    include: { organization: true },
  });
  if (!membership) return null;

  const previousMembershipId =
    verified.contextState === "selected" ? verified.membershipId : null;

  return database.$transaction(async (transaction) => {
    const updated = await transaction.session.updateMany({
      where: {
        id: verified.sessionId,
        userAccountId: verified.userAccountId,
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      data: { activeMembershipId: membership.id },
    });
    if (updated.count !== 1) return null;

    await recordUserAudit(transaction, {
      organizationId: membership.organizationId,
      userAccountId: verified.userAccountId,
      membershipId: membership.id,
      action:
        previousMembershipId && previousMembershipId !== membership.id
          ? "tenant.context.switched"
          : "tenant.context.selected",
      metadata,
      reason: previousMembershipId
        ? `previous_membership:${previousMembershipId}`
        : undefined,
    });

    return {
      membershipId: membership.id,
      organizationId: membership.organizationId,
      organizationName: membership.organization.displayName,
      surface: verified.surface,
    };
  });
}

export async function revokeSession(
  token: string | undefined,
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  if (!token) return false;
  const tokenHash = hashOpaqueToken(token);
  const existing = await database.session.findUnique({
    where: { tokenHash },
    include: { activeMembership: true },
  });
  if (!existing || existing.revokedAt) return false;

  await database.$transaction(async (transaction) => {
    await transaction.session.update({
      where: { id: existing.id },
      data: { revokedAt: new Date(), revokeReason: "user_logout" },
    });
    if (existing.activeMembership) {
      await recordUserAudit(transaction, {
        organizationId: existing.activeMembership.organizationId,
        userAccountId: existing.userAccountId,
        membershipId: existing.activeMembership.id,
        action: "auth.session.revoked",
        metadata,
        ipHash: existing.ipHash ?? undefined,
        reason: "user_logout",
      });
    }
  });
  return true;
}

export async function verifyMfaLogin(
  challengeToken: string,
  code: string,
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
): Promise<LoginResult> {
  const configuration = requireAuthenticationConfiguration(process.env);
  const tokenHash = hashOpaqueToken(challengeToken);
  const challenge = await database.mfaChallenge.findUnique({
    where: { tokenHash },
    include: { mfaMethod: true },
  });
  const surface = challenge?.surface === AuthSurface.TEAM ? "TEAM" : "CLIENT";
  const signals = hashRequestSignals(tokenHash, metadata, configuration.dataKey);
  const method = challenge?.mfaMethod;
  const secret = method?.secretReference
    ? await database.authenticationSecret.findUnique({
        where: { id: method.secretReference },
      })
    : null;
  const validState = Boolean(
    challenge &&
      challenge.purpose === MfaChallengePurpose.LOGIN &&
      !challenge.consumedAt &&
      challenge.expiresAt > new Date() &&
      challenge.failedAttempts < 5 &&
      method?.verifiedAt &&
      !method.disabledAt &&
      secret &&
      secret.userAccountId === challenge.userAccountId,
  );
  let codeValid = false;
  if (validState && secret) {
    try {
      const seed = openSecret(
        secret,
        configuration.dataKey,
        configuration.keyVersion,
        `totp:${secret.id}:${secret.userAccountId}`,
      );
      codeValid = verifyTotpCode(seed, code);
    } catch {
      codeValid = false;
    }
  }

  if (!challenge || !validState || !codeValid) {
    if (challenge && !challenge.consumedAt && challenge.expiresAt > new Date()) {
      await database.mfaChallenge.update({
        where: { id: challenge.id },
        data: {
          failedAttempts: { increment: 1 },
          ...(challenge.failedAttempts >= 4 ? { consumedAt: new Date() } : {}),
        },
      });
    }
    await recordAttempt(database, {
      surface,
      kind: "MFA_VERIFY",
      outcome: "FAILED",
      ...signals,
      userAccountId: challenge?.userAccountId,
      metadata,
    });
    return { kind: "invalid" };
  }

  const memberships = await resolveEligibleMemberships(
    database,
    challenge.userAccountId,
    surface,
  );
  if (memberships.length === 0) return { kind: "invalid" };
  const membership = memberships[0];
  const verifiedAt = new Date();

  return database.$transaction(async (transaction) => {
    const consumed = await transaction.mfaChallenge.updateMany({
      where: {
        id: challenge.id,
        consumedAt: null,
        expiresAt: { gt: verifiedAt },
        failedAttempts: { lt: 5 },
      },
      data: { consumedAt: verifiedAt },
    });
    if (consumed.count !== 1) return { kind: "invalid" } as const;
    await transaction.mfaMethod.update({
      where: { id: method!.id },
      data: { lastUsedAt: verifiedAt },
    });
    const created =
      memberships.length === 1
        ? await createSession(transaction, {
            userAccountId: challenge.userAccountId,
            membershipId: membership.id,
            organizationId: membership.organizationId,
            surface,
            remember: challenge.rememberSession,
            authenticationMethod: "password+totp",
            mfaVerifiedAt: verifiedAt,
            metadata,
            ipHash: signals.ipHash,
          })
        : await createUnselectedSession(transaction, {
            userAccountId: challenge.userAccountId,
            surface,
            remember: challenge.rememberSession,
            authenticationMethod: "password+totp",
            mfaVerifiedAt: verifiedAt,
            metadata,
            ipHash: signals.ipHash,
          });
    await recordAttempt(transaction, {
      surface,
      kind: "MFA_VERIFY",
      outcome: "SUCCEEDED",
      ...signals,
      userAccountId: challenge.userAccountId,
      metadata,
      evidence:
        memberships.length > 1 ? { contextSelectionRequired: true } : {},
    });
    return memberships.length === 1
      ? ({ kind: "authenticated", ...created } as const)
      : ({
          kind: "context-selection-required",
          ...created,
          contexts: toContextOptions(memberships, surface),
        } as const);
  });
}

export async function beginTotpEnrollment(
  token: string,
  accountName: string,
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const verified =
    (await verifySessionToken(token, "TEAM", database)) ??
    (await verifySessionToken(token, "CLIENT", database));
  if (!verified) return null;

  const seed = createTotpSeed();
  const secretId = randomUUID();
  const methodId = randomUUID();
  const challengeToken = createOpaqueToken();
  const sealed = sealSecret(
    seed,
    configuration.dataKey,
    configuration.keyVersion,
    `totp:${secretId}:${verified.userAccountId}`,
  );
  const expiresAt = new Date(Date.now() + MFA_CHALLENGE_MS);

  await database.$transaction(async (transaction) => {
    await transaction.authenticationSecret.create({
      data: {
        id: secretId,
        userAccountId: verified.userAccountId,
        secretKind: AuthenticationSecretKind.TOTP_SEED,
        ...sealed,
      },
    });
    await transaction.mfaMethod.create({
      data: {
        id: methodId,
        userAccountId: verified.userAccountId,
        methodType: MfaMethodType.TOTP,
        secretReference: secretId,
        keyFingerprint: hashSensitiveSignal(seed, configuration.dataKey),
      },
    });
    await transaction.mfaChallenge.create({
      data: {
        id: randomUUID(),
        userAccountId: verified.userAccountId,
        mfaMethodId: methodId,
        purpose: MfaChallengePurpose.ENROLLMENT,
        tokenHash: hashOpaqueToken(challengeToken),
        surface: toPrismaSurface(verified.surface),
        expiresAt,
      },
    });
    await recordUserAudit(transaction, {
      organizationId: verified.organizationId,
      userAccountId: verified.userAccountId,
      membershipId: verified.membershipId,
      action: "auth.mfa.enrollment.started",
      metadata,
    });
  });

  return {
    challengeToken,
    secret: seed,
    uri: buildTotpUri(seed, accountName),
    expiresAt,
  };
}

export async function confirmTotpEnrollment(
  sessionToken: string,
  challengeToken: string,
  code: string,
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const verified =
    (await verifySessionToken(sessionToken, "TEAM", database)) ??
    (await verifySessionToken(sessionToken, "CLIENT", database));
  if (!verified) return false;

  const challenge = await database.mfaChallenge.findUnique({
    where: { tokenHash: hashOpaqueToken(challengeToken) },
    include: { mfaMethod: true },
  });
  if (
    !challenge ||
    challenge.userAccountId !== verified.userAccountId ||
    challenge.purpose !== MfaChallengePurpose.ENROLLMENT ||
    challenge.consumedAt ||
    challenge.expiresAt <= new Date() ||
    challenge.failedAttempts >= 5 ||
    !challenge.mfaMethod?.secretReference
  ) {
    return false;
  }
  const secret = await database.authenticationSecret.findUnique({
    where: { id: challenge.mfaMethod.secretReference },
  });
  if (!secret) return false;

  let valid = false;
  try {
    const seed = openSecret(
      secret,
      configuration.dataKey,
      configuration.keyVersion,
      `totp:${secret.id}:${secret.userAccountId}`,
    );
    valid = verifyTotpCode(seed, code);
  } catch {
    valid = false;
  }
  if (!valid) {
    await database.mfaChallenge.update({
      where: { id: challenge.id },
      data: { failedAttempts: { increment: 1 } },
    });
    return false;
  }

  const now = new Date();
  await database.$transaction(async (transaction) => {
    await transaction.mfaChallenge.update({
      where: { id: challenge.id },
      data: { consumedAt: now },
    });
    await transaction.mfaMethod.update({
      where: { id: challenge.mfaMethod!.id },
      data: { verifiedAt: now },
    });
    await recordUserAudit(transaction, {
      organizationId: verified.organizationId,
      userAccountId: verified.userAccountId,
      membershipId: verified.membershipId,
      action: "auth.mfa.enrollment.confirmed",
      metadata,
    });
  });
  return true;
}

export async function inspectInvitation(
  token: string,
  database = getPrismaClient(),
) {
  const invitation = await database.invitation.findUnique({
    where: { tokenHash: hashOpaqueToken(token) },
    include: { organization: true, intendedRole: true },
  });
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= new Date()
  ) {
    return null;
  }
  return {
    organizationName: invitation.organization.displayName,
    roleName: invitation.intendedRole?.name,
    expiresAt: invitation.expiresAt,
    surface:
      invitation.organization.organizationType === OrganizationType.CLIENT
        ? ("CLIENT" as const)
        : ("TEAM" as const),
  };
}

export async function acceptInvitation(
  input: {
    token: string;
    displayName: string;
    password?: string;
    termsAccepted: boolean;
    existingSessionToken?: string;
  },
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const invitation = await database.invitation.findUnique({
    where: { tokenHash: hashOpaqueToken(input.token) },
    include: { organization: true, intendedRole: true },
  });
  if (
    !invitation ||
    invitation.acceptedAt ||
    invitation.revokedAt ||
    invitation.expiresAt <= new Date() ||
    !input.termsAccepted
  ) {
    return { kind: "invalid" } as const;
  }
  const surface: AuthenticationSurface =
    invitation.organization.organizationType === OrganizationType.CLIENT
      ? "CLIENT"
      : "TEAM";
  const identifier = normalizeLoginIdentifier(invitation.emailNormalized);
  const signals = hashRequestSignals(identifier, metadata, configuration.dataKey);
  const existingIdentity = await database.userIdentity.findUnique({
    where: {
      provider_providerSubject: {
        provider: IdentityProvider.PASSWORD,
        providerSubject: identifier,
      },
    },
  });
  let existingSession: VerifiedAuthenticationSession | null = null;
  let passwordHash: string | undefined;

  if (existingIdentity) {
    existingSession =
      (await verifySessionToken(input.existingSessionToken, "TEAM", database)) ??
      (await verifySessionToken(input.existingSessionToken, "CLIENT", database));
    if (!existingSession || existingSession.userAccountId !== existingIdentity.userAccountId) {
      return { kind: "sign-in-required", surface } as const;
    }
  } else {
    if (!input.password || !validatePassword(input.password).valid) {
      return { kind: "invalid" } as const;
    }
    passwordHash = await hashPassword(input.password);
  }

  return database.$transaction(
    async (transaction) => {
      const acceptedAt = new Date();
      let userAccountId: string;
      let membershipId: string;

      if (existingIdentity && existingSession) {
        userAccountId = existingIdentity.userAccountId;
        const currentMembership = await transaction.organizationMembership.findFirst({
          where: {
            organizationId: invitation.organizationId,
            userAccountId,
            endedAt: null,
          },
        });
        const membership = currentMembership
          ? await transaction.organizationMembership.update({
              where: { id: currentMembership.id },
              data: {
                membershipType: membershipTypeFor(surface),
                status: MembershipStatus.ACTIVE,
                joinedAt: currentMembership.joinedAt ?? acceptedAt,
              },
            })
          : await transaction.organizationMembership.create({
              data: {
                id: randomUUID(),
                organizationId: invitation.organizationId,
                userAccountId,
                membershipType: membershipTypeFor(surface),
                status: MembershipStatus.ACTIVE,
                joinedAt: acceptedAt,
              },
            });
        membershipId = membership.id;
      } else {
        const personId = randomUUID();
        userAccountId = randomUUID();
        const identityId = randomUUID();
        const credentialId = randomUUID();
        membershipId = randomUUID();
        await transaction.person.create({
          data: {
            id: personId,
            displayName: input.displayName,
            emailOriginal: invitation.emailNormalized,
            emailNormalized: identifier,
          },
        });
        await transaction.userAccount.create({
          data: {
            id: userAccountId,
            personId,
            accountState: AccountState.ACTIVE,
            emailVerifiedAt: acceptedAt,
          },
        });
        await transaction.userIdentity.create({
          data: {
            id: identityId,
            userAccountId,
            provider: IdentityProvider.PASSWORD,
            providerSubject: identifier,
            credentialReference: credentialId,
          },
        });
        await transaction.passwordCredential.create({
          data: {
            id: credentialId,
            userIdentityId: identityId,
            passwordHash: passwordHash!,
            version: 1,
          },
        });
        await transaction.organizationMembership.create({
          data: {
            id: membershipId,
            organizationId: invitation.organizationId,
            userAccountId,
            membershipType: membershipTypeFor(surface),
            status: MembershipStatus.ACTIVE,
            joinedAt: acceptedAt,
          },
        });
      }

      if (invitation.intendedRoleId) {
        const existingRole = await transaction.membershipRole.findFirst({
          where: {
            membershipId,
            roleId: invitation.intendedRoleId,
            validUntil: null,
          },
        });
        if (!existingRole) {
          await transaction.membershipRole.create({
            data: {
              id: randomUUID(),
              membershipId,
              roleId: invitation.intendedRoleId,
              scope: invitation.intendedRole?.defaultScope ?? RoleScope.NONE,
            },
          });
        }
      }
      const consumed = await transaction.invitation.updateMany({
        where: {
          id: invitation.id,
          acceptedAt: null,
          revokedAt: null,
          expiresAt: { gt: acceptedAt },
        },
        data: { acceptedAt, termsAcceptedAt: acceptedAt },
      });
      if (consumed.count !== 1) throw new Error("Invitation is no longer available.");
      await recordAttempt(transaction, {
        surface,
        kind: "INVITATION_ACCEPT",
        outcome: "SUCCEEDED",
        ...signals,
        userAccountId,
        metadata,
      });
      await recordUserAudit(transaction, {
        organizationId: invitation.organizationId,
        userAccountId,
        membershipId,
        action: "auth.invitation.accepted",
        metadata,
        ipHash: signals.ipHash,
      });
      const created = await createSession(transaction, {
        userAccountId,
        membershipId,
        organizationId: invitation.organizationId,
        surface,
        remember: false,
        authenticationMethod: existingIdentity ? "existing-session+invitation" : "invitation+password",
        metadata,
        ipHash: signals.ipHash,
      });
      return { kind: "accepted", ...created } as const;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

export async function requestRecovery(
  input: { email: string; surface: AuthenticationSurface },
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const identifier = normalizeLoginIdentifier(input.email);
  const signals = hashRequestSignals(identifier, metadata, configuration.dataKey);
  const throttled = await isThrottled(
    database,
    "RECOVERY_REQUEST",
    signals.identifierHash,
    signals.ipHash,
    RECOVERY_WINDOW_MS,
  );
  const identity = await database.userIdentity.findUnique({
    where: {
      provider_providerSubject: {
        provider: IdentityProvider.PASSWORD,
        providerSubject: identifier,
      },
    },
  });
  const memberships = identity
    ? await resolveEligibleMemberships(database, identity.userAccountId, input.surface)
    : [];
  await verifyPassword("invalid-authentication-credential", await getDummyPasswordHash());

  if (throttled || !identity || memberships.length !== 1) {
    await recordAttempt(database, {
      surface: input.surface,
      kind: "RECOVERY_REQUEST",
      outcome: throttled ? "THROTTLED" : "FAILED",
      ...signals,
      userAccountId: identity?.userAccountId,
      metadata,
    });
    return { accepted: true } as const;
  }

  const membership = memberships[0];
  const token = createOpaqueToken();
  const challengeId = randomUUID();
  const sealed = sealSecret(
    token,
    configuration.dataKey,
    configuration.keyVersion,
    `recovery:${challengeId}:${identity.userAccountId}`,
  );
  await database.$transaction(async (transaction) => {
    await transaction.recoveryChallenge.updateMany({
      where: {
        userAccountId: identity.userAccountId,
        consumedAt: null,
        revokedAt: null,
      },
      data: { revokedAt: new Date() },
    });
    await transaction.recoveryChallenge.create({
      data: {
        id: challengeId,
        userAccountId: identity.userAccountId,
        tokenHash: hashOpaqueToken(token),
        surface: toPrismaSurface(input.surface),
        identifierHash: signals.identifierHash,
        requestedIpHash: signals.ipHash,
        expiresAt: new Date(Date.now() + RECOVERY_CHALLENGE_MS),
      },
    });
    await transaction.outboxEvent.create({
      data: {
        id: randomUUID(),
        ownerOrganizationId: membership.organizationId,
        eventType: "AUTH_RECOVERY_REQUESTED",
        payload: {
          challengeId,
          destination: identifier,
          surface: input.surface,
          sealedToken: {
            ciphertext: sealed.ciphertext,
            nonce: sealed.nonce,
            authTag: sealed.authTag,
            keyVersion: sealed.keyVersion,
          },
          publicOrigin: configuration.publicOrigin,
        },
        idempotencyKey: `auth-recovery:${challengeId}`,
      },
    });
    await recordAttempt(transaction, {
      surface: input.surface,
      kind: "RECOVERY_REQUEST",
      outcome: "SUCCEEDED",
      ...signals,
      userAccountId: identity.userAccountId,
      metadata,
    });
    await recordUserAudit(transaction, {
      organizationId: membership.organizationId,
      userAccountId: identity.userAccountId,
      membershipId: membership.id,
      action: "auth.recovery.requested",
      metadata,
      ipHash: signals.ipHash,
    });
  });
  return { accepted: true } as const;
}

export async function completeRecovery(
  input: {
    token: string;
    password: string;
    surface: AuthenticationSurface;
  },
  metadata: AuthenticationRequestMetadata,
  database = getPrismaClient(),
) {
  const configuration = requireAuthenticationConfiguration(process.env);
  const passwordValidation = validatePassword(input.password);
  if (!passwordValidation.valid) return false;
  const passwordHash = await hashPassword(input.password);
  const challenge = await database.recoveryChallenge.findUnique({
    where: { tokenHash: hashOpaqueToken(input.token) },
    include: {
      userAccount: {
        include: {
          identities: { where: { provider: IdentityProvider.PASSWORD } },
        },
      },
    },
  });
  if (
    !challenge ||
    challenge.surface !== toPrismaSurface(input.surface) ||
    challenge.consumedAt ||
    challenge.revokedAt ||
    challenge.expiresAt <= new Date() ||
    challenge.attemptCount >= 10 ||
    challenge.userAccount.accountState === AccountState.DISABLED
  ) {
    return false;
  }
  const identity = challenge.userAccount.identities[0];
  if (!identity) return false;
  const memberships = await resolveEligibleMemberships(
    database,
    challenge.userAccountId,
    input.surface,
  );
  if (memberships.length !== 1) return false;
  const membership = memberships[0];
  const currentVersion = await database.passwordCredential.aggregate({
    where: { userIdentityId: identity.id },
    _max: { version: true },
  });
  const signals = hashRequestSignals(
    challenge.identifierHash,
    metadata,
    configuration.dataKey,
  );
  const completedAt = new Date();

  return database.$transaction(
    async (transaction) => {
      const consumed = await transaction.recoveryChallenge.updateMany({
        where: {
          id: challenge.id,
          consumedAt: null,
          revokedAt: null,
          expiresAt: { gt: completedAt },
          attemptCount: { lt: 10 },
        },
        data: { consumedAt: completedAt, attemptCount: { increment: 1 } },
      });
      if (consumed.count !== 1) return false;
      const credential = await transaction.passwordCredential.create({
        data: {
          id: randomUUID(),
          userIdentityId: identity.id,
          passwordHash,
          version: (currentVersion._max.version ?? 0) + 1,
        },
      });
      await transaction.userIdentity.update({
        where: { id: identity.id },
        data: { credentialReference: credential.id },
      });
      await transaction.session.updateMany({
        where: { userAccountId: challenge.userAccountId, revokedAt: null },
        data: { revokedAt: completedAt, revokeReason: "credential_recovered" },
      });
      await recordAttempt(transaction, {
        surface: input.surface,
        kind: "RECOVERY_COMPLETE",
        outcome: "SUCCEEDED",
        ...signals,
        userAccountId: challenge.userAccountId,
        metadata,
      });
      await recordUserAudit(transaction, {
        organizationId: membership.organizationId,
        userAccountId: challenge.userAccountId,
        membershipId: membership.id,
        action: "auth.recovery.completed",
        metadata,
        ipHash: signals.ipHash,
      });
      return true;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}
