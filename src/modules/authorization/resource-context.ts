import "server-only";

import { Visibility, type Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { TenantScopedRequestContext } from "@/modules/foundation/request-context";
import { getPrismaClient } from "@/modules/persistence/client";

import type { AuthorizationResourceContext } from "./types";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export interface LoadedResourceEnvelope {
  readonly id: string;
  readonly resourceType: string;
  readonly title: string | null;
  readonly ownerOrganizationId: string;
  readonly clientOrganizationId: string | null;
  readonly projectId: string | null;
  readonly visibility: "INTERNAL" | "CLIENT_SHARED" | "PUBLIC";
  readonly sensitivity:
    | "STANDARD"
    | "CONFIDENTIAL"
    | "PII"
    | "FINANCIAL"
    | "SECURITY"
    | "SECRET";
  readonly createdAt: Date;
  readonly archivedAt: Date | null;
}

function toAuthorizationResourceContext(
  resource: LoadedResourceEnvelope,
): AuthorizationResourceContext {
  return {
    resourceId: resource.id,
    resourceType: resource.resourceType,
    ownerOrganizationId: resource.ownerOrganizationId,
    clientOrganizationId: resource.clientOrganizationId,
    projectId: resource.projectId,
    visibility: resource.visibility,
    sensitivity: resource.sensitivity,
    lifecycleState: resource.archivedAt ? "ARCHIVED" : "ACTIVE",
  };
}

/**
 * Loads only a resource envelope that belongs to the already-selected tenant.
 *
 * This is intentionally not an unrestricted ID lookup:
 * - Team requests are constrained to ownerOrganizationId.
 * - Client requests are constrained to clientOrganizationId + CLIENT_SHARED.
 *
 * A foreign/hidden resource and a nonexistent resource both resolve to null.
 */
export async function loadTrustedResourceContext(
  context: TenantScopedRequestContext,
  resourceId: string,
  database: DatabaseClient = getPrismaClient(),
): Promise<AuthorizationResourceContext | null> {
  const tenantWhere =
    context.tenant.surface === "TEAM"
      ? {
          ownerOrganizationId: context.tenant.organizationId,
        }
      : {
          clientOrganizationId: context.tenant.organizationId,
          visibility: Visibility.CLIENT_SHARED,
        };

  const resource = await database.resource.findFirst({
    where: {
      id: resourceId,
      ...tenantWhere,
    },
    select: {
      id: true,
      resourceType: true,
      title: true,
      ownerOrganizationId: true,
      clientOrganizationId: true,
      projectId: true,
      visibility: true,
      sensitivity: true,
      createdAt: true,
      archivedAt: true,
    },
  });

  if (!resource) return null;

  return toAuthorizationResourceContext({
    ...resource,
    visibility: String(resource.visibility) as LoadedResourceEnvelope["visibility"],
    sensitivity: String(resource.sensitivity) as LoadedResourceEnvelope["sensitivity"],
  });
}

export function buildTrustedIamResourceContext(input: {
  readonly resourceId: string;
  readonly resourceType: "role" | "permission" | "membership" | "role-permission";
  readonly ownerOrganizationId: string;
  readonly targetMembershipId?: string | null;
  readonly lifecycleState?: string;
  readonly version?: string | number | null;
}): AuthorizationResourceContext {
  return {
    resourceId: input.resourceId,
    resourceType: input.resourceType,
    ownerOrganizationId: input.ownerOrganizationId,
    targetMembershipId: input.targetMembershipId,
    lifecycleState: input.lifecycleState,
    version: input.version,
  };
}
