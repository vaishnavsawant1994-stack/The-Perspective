import { PrismaPg } from "@prisma/adapter-pg";

import {
  AccountState,
  AuditActorType,
  AutomationRunStatus,
  CallbackStatus,
  IncidentSeverity,
  IncidentStatus,
  MembershipStatus,
  MembershipType,
  OrganizationType,
  PermissionEffect,
  PrismaClient,
  ProcessingStatus,
  ReconciliationStatus,
  RecordStatus,
  RoleScope,
  Sensitivity,
  Visibility,
} from "../../src/generated/prisma/client";
import { assertDemoSeedEnvironment } from "../../src/modules/persistence/database-environment";
import { assertSeedBaseline } from "./assertions";
import { assertKnownSeedOrganizations } from "./seed-safety";
import {
  DEMO_EPOCH,
  seedIds,
} from "./stable-ids";

const atMinutes = (minutes: number) =>
  new Date(DEMO_EPOCH.getTime() + minutes * 60_000);

async function assertDatabaseContainsOnlyKnownSeedOrganizations(
  prisma: PrismaClient,
) {
  const existingOrganizations = await prisma.organization.findMany({
    select: { id: true, slug: true },
  });

  assertKnownSeedOrganizations(existingOrganizations);
}

async function seed() {
  const databaseUrl = assertDemoSeedEnvironment(process.env);
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    await assertDatabaseContainsOnlyKnownSeedOrganizations(prisma);

    const organizations = [
      {
        id: seedIds.organization.platform,
        organizationType: OrganizationType.PLATFORM,
        legalName: "The Perspective Media Group Demo",
        displayName: "The Perspective Demo",
        slug: "perspective-demo",
        normalizedDomain: "perspective.example.com",
      },
      {
        id: seedIds.organization.asteria,
        organizationType: OrganizationType.CLIENT,
        legalName: "Asteria Systems Example Ltd",
        displayName: "Asteria Systems",
        slug: "asteria-systems-example",
        normalizedDomain: "asteria.example.com",
      },
      {
        id: seedIds.organization.northstar,
        organizationType: OrganizationType.CLIENT,
        legalName: "Northstar Labs Example Ltd",
        displayName: "Northstar Labs",
        slug: "northstar-labs-example",
        normalizedDomain: "northstar.example.com",
      },
    ];

    for (const organization of organizations) {
      await prisma.organization.upsert({
        where: { id: organization.id },
        create: {
          ...organization,
          status: RecordStatus.ACTIVE,
          createdAt: DEMO_EPOCH,
          updatedAt: DEMO_EPOCH,
        },
        update: {
          legalName: organization.legalName,
          displayName: organization.displayName,
          normalizedDomain: organization.normalizedDomain,
          status: RecordStatus.ACTIVE,
          updatedAt: DEMO_EPOCH,
        },
      });
    }

    const people = [
      {
        id: seedIds.person.operator,
        userId: seedIds.user.operator,
        displayName: "Jordan Example",
        email: "jordan.operator@example.com",
      },
      {
        id: seedIds.person.asteriaAdmin,
        userId: seedIds.user.asteriaAdmin,
        displayName: "Avery Asteria",
        email: "avery@asteria.example.com",
      },
      {
        id: seedIds.person.northstarAdmin,
        userId: seedIds.user.northstarAdmin,
        displayName: "Noah Northstar",
        email: "noah@northstar.example.com",
      },
    ];

    for (const person of people) {
      await prisma.person.upsert({
        where: { id: person.id },
        create: {
          id: person.id,
          displayName: person.displayName,
          emailOriginal: person.email,
          emailNormalized: person.email,
          createdAt: DEMO_EPOCH,
          updatedAt: DEMO_EPOCH,
        },
        update: {
          displayName: person.displayName,
          emailOriginal: person.email,
          emailNormalized: person.email,
          updatedAt: DEMO_EPOCH,
        },
      });

      await prisma.userAccount.upsert({
        where: { id: person.userId },
        create: {
          id: person.userId,
          personId: person.id,
          accountState: AccountState.PENDING,
          createdAt: DEMO_EPOCH,
          updatedAt: DEMO_EPOCH,
        },
        update: {
          accountState: AccountState.PENDING,
          updatedAt: DEMO_EPOCH,
        },
      });
    }

    await prisma.department.upsert({
      where: { id: seedIds.department.operations },
      create: {
        id: seedIds.department.operations,
        organizationId: seedIds.organization.platform,
        name: "Operations",
        slug: "operations",
        createdAt: DEMO_EPOCH,
        updatedAt: DEMO_EPOCH,
      },
      update: { name: "Operations", updatedAt: DEMO_EPOCH },
    });

    const memberships = [
      {
        id: seedIds.membership.operator,
        organizationId: seedIds.organization.platform,
        userAccountId: seedIds.user.operator,
        membershipType: MembershipType.STAFF,
        departmentId: seedIds.department.operations,
        title: "Platform Operator",
      },
      {
        id: seedIds.membership.asteriaAdmin,
        organizationId: seedIds.organization.asteria,
        userAccountId: seedIds.user.asteriaAdmin,
        membershipType: MembershipType.CLIENT,
        departmentId: null,
        title: "Client Administrator",
      },
      {
        id: seedIds.membership.northstarAdmin,
        organizationId: seedIds.organization.northstar,
        userAccountId: seedIds.user.northstarAdmin,
        membershipType: MembershipType.CLIENT,
        departmentId: null,
        title: "Client Administrator",
      },
    ];

    for (const membership of memberships) {
      await prisma.organizationMembership.upsert({
        where: { id: membership.id },
        create: {
          ...membership,
          status: MembershipStatus.ACTIVE,
          joinedAt: DEMO_EPOCH,
          createdAt: DEMO_EPOCH,
          updatedAt: DEMO_EPOCH,
        },
        update: {
          title: membership.title,
          status: MembershipStatus.ACTIVE,
          endedAt: null,
          updatedAt: DEMO_EPOCH,
        },
      });
    }

    const permissions = [
      {
        id: seedIds.permission.workspaceView,
        key: "workspace.view",
        domain: "workspace",
        action: "view",
      },
      {
        id: seedIds.permission.resourceRead,
        key: "resource.read",
        domain: "resource",
        action: "read",
      },
    ];

    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { id: permission.id },
        create: {
          ...permission,
          description: "Deterministic R2 reference permission",
          riskLevel: "LOW",
          createdAt: DEMO_EPOCH,
        },
        update: {
          description: "Deterministic R2 reference permission",
          riskLevel: "LOW",
        },
      });
    }

    const roles = [
      {
        id: seedIds.role.platformAdmin,
        organizationId: seedIds.organization.platform,
        key: "platform-admin-demo",
        name: "Platform Admin Demo",
        scope: RoleScope.ORG,
      },
      {
        id: seedIds.role.asteriaClientAdmin,
        organizationId: seedIds.organization.asteria,
        key: "client-admin-demo",
        name: "Client Admin Demo",
        scope: RoleScope.CLIENT,
      },
      {
        id: seedIds.role.northstarClientAdmin,
        organizationId: seedIds.organization.northstar,
        key: "client-admin-demo",
        name: "Client Admin Demo",
        scope: RoleScope.CLIENT,
      },
    ];

    for (const role of roles) {
      await prisma.role.upsert({
        where: { id: role.id },
        create: {
          id: role.id,
          organizationId: role.organizationId,
          key: role.key,
          name: role.name,
          systemRole: false,
          defaultScope: role.scope,
          createdAt: DEMO_EPOCH,
          updatedAt: DEMO_EPOCH,
        },
        update: {
          name: role.name,
          defaultScope: role.scope,
          updatedAt: DEMO_EPOCH,
        },
      });
    }

    for (const role of roles) {
      for (const permission of permissions) {
        await prisma.rolePermission.upsert({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
          create: {
            roleId: role.id,
            permissionId: permission.id,
            effect: PermissionEffect.ALLOW,
            createdAt: DEMO_EPOCH,
          },
          update: { effect: PermissionEffect.ALLOW },
        });
      }
    }

    const membershipRoles = [
      {
        id: seedIds.membershipRole.operator,
        membershipId: seedIds.membership.operator,
        roleId: seedIds.role.platformAdmin,
        scope: RoleScope.ORG,
      },
      {
        id: seedIds.membershipRole.asteriaAdmin,
        membershipId: seedIds.membership.asteriaAdmin,
        roleId: seedIds.role.asteriaClientAdmin,
        scope: RoleScope.CLIENT,
      },
      {
        id: seedIds.membershipRole.northstarAdmin,
        membershipId: seedIds.membership.northstarAdmin,
        roleId: seedIds.role.northstarClientAdmin,
        scope: RoleScope.CLIENT,
      },
    ];

    for (const grant of membershipRoles) {
      await prisma.membershipRole.upsert({
        where: { id: grant.id },
        create: { ...grant, validFrom: DEMO_EPOCH, createdAt: DEMO_EPOCH },
        update: { scope: grant.scope, validUntil: null },
      });
    }

    const sharedTitle = "May 2026 Leadership Report";
    const resources = [
      {
        id: seedIds.resource.asteriaShared,
        resourceType: "REPORT",
        title: sharedTitle,
        clientOrganizationId: seedIds.organization.asteria,
        visibility: Visibility.CLIENT_SHARED,
        sensitivity: Sensitivity.CONFIDENTIAL,
      },
      {
        id: seedIds.resource.northstarShared,
        resourceType: "REPORT",
        title: sharedTitle,
        clientOrganizationId: seedIds.organization.northstar,
        visibility: Visibility.CLIENT_SHARED,
        sensitivity: Sensitivity.CONFIDENTIAL,
      },
      {
        id: seedIds.resource.asteriaInternal,
        resourceType: "INTERNAL_NOTE",
        title: "Asteria internal delivery note",
        clientOrganizationId: seedIds.organization.asteria,
        visibility: Visibility.INTERNAL,
        sensitivity: Sensitivity.CONFIDENTIAL,
      },
    ];

    for (const resource of resources) {
      await prisma.resource.upsert({
        where: { id: resource.id },
        create: {
          ...resource,
          ownerOrganizationId: seedIds.organization.platform,
          createdAt: DEMO_EPOCH,
        },
        update: {
          title: resource.title,
          clientOrganizationId: resource.clientOrganizationId,
          visibility: resource.visibility,
          sensitivity: resource.sensitivity,
        },
      });
    }

    await prisma.idempotencyReceipt.upsert({
      where: { id: seedIds.idempotency },
      create: {
        id: seedIds.idempotency,
        ownerOrganizationId: seedIds.organization.platform,
        scope: "r2.seed",
        idempotencyKey: "r2-seed-baseline-v1",
        requestHash: "sha256:r2-seed-request",
        state: "COMPLETED",
        responseStatus: 200,
        responseHash: "sha256:r2-seed-response",
        createdAt: DEMO_EPOCH,
        completedAt: atMinutes(1),
        expiresAt: atMinutes(1_440),
      },
      update: {},
    });

    await prisma.outboxEvent.upsert({
      where: { id: seedIds.outbox },
      create: {
        id: seedIds.outbox,
        ownerOrganizationId: seedIds.organization.platform,
        aggregateResourceId: seedIds.resource.asteriaShared,
        eventType: "R2_SEED_RESOURCE_REGISTERED",
        payload: { resourceId: seedIds.resource.asteriaShared },
        idempotencyKey: "r2-outbox-resource-registered-v1",
        status: ProcessingStatus.SUCCEEDED,
        availableAt: atMinutes(2),
        publishedAt: atMinutes(4),
        createdAt: atMinutes(2),
      },
      update: {},
    });

    await prisma.outboxDeliveryAttempt.createMany({
      data: [
        {
          id: seedIds.outboxAttempt1,
          outboxEventId: seedIds.outbox,
          attemptNumber: 1,
          status: ProcessingStatus.FAILED,
          startedAt: atMinutes(2),
          finishedAt: atMinutes(3),
          errorCode: "DEMO_TRANSIENT_FAILURE",
          errorSummary: "Fictional transient failure for retry evidence",
          createdAt: atMinutes(3),
        },
        {
          id: seedIds.outboxAttempt2,
          outboxEventId: seedIds.outbox,
          attemptNumber: 2,
          status: ProcessingStatus.SUCCEEDED,
          startedAt: atMinutes(3),
          finishedAt: atMinutes(4),
          responseHash: "sha256:r2-demo-delivery",
          createdAt: atMinutes(4),
        },
      ],
      skipDuplicates: true,
    });

    await prisma.callbackReceipt.upsert({
      where: { id: seedIds.callback },
      create: {
        id: seedIds.callback,
        ownerOrganizationId: seedIds.organization.platform,
        provider: "demo-provider",
        externalEventId: "evt_r2_demo_001",
        connectionReference: "secret-ref:demo-not-a-secret",
        signatureValid: true,
        payloadHash: "sha256:r2-demo-callback",
        payload: { type: "demo.callback" },
        status: CallbackStatus.PROCESSED,
        receivedAt: atMinutes(5),
        processedAt: atMinutes(6),
      },
      update: {},
    });

    await prisma.callbackAttempt.createMany({
      data: [
        {
          id: seedIds.callbackAttempt,
          callbackReceiptId: seedIds.callback,
          attemptNumber: 1,
          status: ProcessingStatus.SUCCEEDED,
          startedAt: atMinutes(5),
          finishedAt: atMinutes(6),
          resultHash: "sha256:r2-demo-callback-result",
          createdAt: atMinutes(6),
        },
      ],
      skipDuplicates: true,
    });

    await prisma.automationRun.upsert({
      where: { id: seedIds.automationRunOriginal },
      create: {
        id: seedIds.automationRunOriginal,
        ownerOrganizationId: seedIds.organization.platform,
        workflowKey: "r2.demo.workflow",
        triggerKey: "r2.demo.trigger",
        executionNumber: 1,
        status: AutomationRunStatus.FAILED,
        inputHash: "sha256:r2-demo-input",
        startedAt: atMinutes(10),
        completedAt: atMinutes(11),
        createdAt: atMinutes(10),
      },
      update: {},
    });

    await prisma.automationRun.upsert({
      where: { id: seedIds.automationRunRetry },
      create: {
        id: seedIds.automationRunRetry,
        ownerOrganizationId: seedIds.organization.platform,
        workflowKey: "r2.demo.workflow",
        triggerKey: "r2.demo.trigger",
        rootRunId: seedIds.automationRunOriginal,
        parentRunId: seedIds.automationRunOriginal,
        executionNumber: 2,
        status: AutomationRunStatus.COMPLETED,
        inputHash: "sha256:r2-demo-input",
        startedAt: atMinutes(12),
        completedAt: atMinutes(13),
        createdAt: atMinutes(12),
      },
      update: {},
    });

    await prisma.automationStepAttempt.createMany({
      data: [
        {
          id: seedIds.automationAttemptOriginal,
          automationRunId: seedIds.automationRunOriginal,
          stepKey: "publish",
          attemptNumber: 1,
          status: ProcessingStatus.FAILED,
          inputHash: "sha256:r2-demo-step-input",
          errorCode: "DEMO_TIMEOUT",
          errorSummary: "Fictional timeout",
          startedAt: atMinutes(10),
          finishedAt: atMinutes(11),
          createdAt: atMinutes(11),
        },
        {
          id: seedIds.automationAttemptRetry,
          automationRunId: seedIds.automationRunRetry,
          stepKey: "publish",
          attemptNumber: 1,
          status: ProcessingStatus.SUCCEEDED,
          inputHash: "sha256:r2-demo-step-input",
          outputHash: "sha256:r2-demo-step-output",
          startedAt: atMinutes(12),
          finishedAt: atMinutes(13),
          createdAt: atMinutes(13),
        },
      ],
      skipDuplicates: true,
    });

    await prisma.incident.upsert({
      where: { id: seedIds.incident },
      create: {
        id: seedIds.incident,
        ownerOrganizationId: seedIds.organization.platform,
        incidentKey: "INC-R2-DEMO-001",
        title: "Fictional dependency degradation",
        severity: IncidentSeverity.MEDIUM,
        status: IncidentStatus.RESOLVED,
        startedAt: atMinutes(20),
        resolvedAt: atMinutes(30),
        createdAt: atMinutes(20),
        updatedAt: atMinutes(30),
      },
      update: {},
    });

    await prisma.incidentEvent.createMany({
      data: [
        {
          id: seedIds.incidentEventOpened,
          incidentId: seedIds.incident,
          eventType: "OPENED",
          actorMembershipId: seedIds.membership.operator,
          newStatus: IncidentStatus.INVESTIGATING,
          summary: "Fictional incident opened",
          occurredAt: atMinutes(20),
          createdAt: atMinutes(20),
        },
        {
          id: seedIds.incidentEventResolved,
          incidentId: seedIds.incident,
          eventType: "RESOLVED",
          actorMembershipId: seedIds.membership.operator,
          previousStatus: IncidentStatus.MONITORING,
          newStatus: IncidentStatus.RESOLVED,
          summary: "Fictional incident resolved",
          occurredAt: atMinutes(30),
          createdAt: atMinutes(30),
        },
      ],
      skipDuplicates: true,
    });

    await prisma.reconciliationRun.upsert({
      where: { id: seedIds.reconciliationRun },
      create: {
        id: seedIds.reconciliationRun,
        ownerOrganizationId: seedIds.organization.platform,
        reconciliationType: "R2_FOUNDATION",
        scopeKey: "seed-baseline",
        status: ReconciliationStatus.COMPLETED,
        cutoffAt: DEMO_EPOCH,
        startedAt: atMinutes(40),
        finishedAt: atMinutes(41),
        resultHash: "sha256:r2-demo-reconciliation",
        createdAt: atMinutes(40),
      },
      update: {},
    });

    await prisma.reconciliationFinding.createMany({
      data: [
        {
          id: seedIds.reconciliationFinding,
          reconciliationRunId: seedIds.reconciliationRun,
          resourceId: seedIds.resource.asteriaShared,
          findingKey: "R2_DEMO_MATCH",
          severity: "INFORMATIONAL",
          expectedHash: "sha256:r2-demo-equal",
          actualHash: "sha256:r2-demo-equal",
          details: { fictional: true },
          createdAt: atMinutes(41),
        },
      ],
      skipDuplicates: true,
    });

    await prisma.auditEvent.createMany({
      data: [
        {
          id: seedIds.auditEvent,
          ownerOrganizationId: seedIds.organization.platform,
          targetResourceId: seedIds.resource.asteriaShared,
          actorType: AuditActorType.SYSTEM,
          action: "R2_SEED_BASELINE_CREATED",
          requestId: "request-r2-seed-baseline",
          afterHash: "sha256:r2-demo-audit",
          redactedDiff: { seeded: true },
          reason: "Deterministic R2 persistence validation",
          idempotencyKey: "audit-r2-seed-baseline-v1",
          occurredAt: atMinutes(50),
          createdAt: atMinutes(50),
        },
      ],
      skipDuplicates: true,
    });

    const summary = await assertSeedBaseline(prisma);
    process.stdout.write(`${JSON.stringify({ seeded: true, summary })}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed error";
  process.stderr.write(`R2 seed failed: ${message}\n`);
  process.exitCode = 1;
});
