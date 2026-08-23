import type { PrismaClient } from "../../src/generated/prisma/client";
import { seedIds } from "./stable-ids";

export interface SeedAssertionSummary {
  readonly organizations: number;
  readonly memberships: number;
  readonly resources: number;
  readonly auditEvents: number;
  readonly outboxAttempts: number;
  readonly automationRuns: number;
}

export async function assertSeedBaseline(
  prisma: PrismaClient,
): Promise<SeedAssertionSummary> {
  const [organizations, memberships, resources, auditEvents, outboxAttempts, automationRuns] =
    await Promise.all([
      prisma.organization.count({
        where: { id: { in: Object.values(seedIds.organization) } },
      }),
      prisma.organizationMembership.count({
        where: { id: { in: Object.values(seedIds.membership) } },
      }),
      prisma.resource.count({
        where: { id: { in: Object.values(seedIds.resource) } },
      }),
      prisma.auditEvent.count({ where: { id: seedIds.auditEvent } }),
      prisma.outboxDeliveryAttempt.count({
        where: {
          id: { in: [seedIds.outboxAttempt1, seedIds.outboxAttempt2] },
        },
      }),
      prisma.automationRun.count({
        where: {
          id: {
            in: [seedIds.automationRunOriginal, seedIds.automationRunRetry],
          },
        },
      }),
    ]);

  const summary = {
    organizations,
    memberships,
    resources,
    auditEvents,
    outboxAttempts,
    automationRuns,
  };

  const expected: SeedAssertionSummary = {
    organizations: 3,
    memberships: 3,
    resources: 3,
    auditEvents: 1,
    outboxAttempts: 2,
    automationRuns: 2,
  };

  if (JSON.stringify(summary) !== JSON.stringify(expected)) {
    throw new Error(
      `Deterministic seed assertion failed: ${JSON.stringify({ summary, expected })}`,
    );
  }

  const sharedResources = await prisma.resource.findMany({
    where: {
      id: {
        in: [seedIds.resource.asteriaShared, seedIds.resource.northstarShared],
      },
    },
    select: { title: true, clientOrganizationId: true, visibility: true },
    orderBy: { clientOrganizationId: "asc" },
  });

  if (
    sharedResources.length !== 2 ||
    sharedResources[0]?.title !== sharedResources[1]?.title ||
    sharedResources[0]?.clientOrganizationId ===
      sharedResources[1]?.clientOrganizationId ||
    sharedResources.some(({ visibility }) => visibility !== "CLIENT_SHARED")
  ) {
    throw new Error("Two-client overlapping-name isolation fixtures are invalid.");
  }

  return summary;
}
