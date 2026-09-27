import "server-only";

import type {
  AuthorizationFieldPolicy,
  AuthorizationResourceContext,
} from "./types";

export type R5FieldPolicyResourceType =
  | "role"
  | "permission"
  | "membership"
  | "role-permission"
  | "resource";

const TEAM_FIELD_POLICIES: Record<
  R5FieldPolicyResourceType,
  AuthorizationFieldPolicy
> = {
  role: {
    readableFields: [
      "id",
      "key",
      "name",
      "description",
      "systemRole",
      "defaultScope",
      "status",
      "createdAt",
      "updatedAt",
    ],
    mutableFields: ["name", "description", "defaultScope", "status"],
  },
  permission: {
    readableFields: [
      "id",
      "key",
      "domain",
      "action",
      "description",
      "riskLevel",
      "createdAt",
    ],
    mutableFields: [],
  },
  membership: {
    readableFields: [
      "id",
      "organizationId",
      "userAccountId",
      "membershipType",
      "title",
      "departmentId",
      "managerMembershipId",
      "status",
      "joinedAt",
      "endedAt",
      "createdAt",
      "updatedAt",
    ],
    mutableFields: [
      "title",
      "departmentId",
      "managerMembershipId",
      "status",
      "endedAt",
    ],
  },
  "role-permission": {
    readableFields: [
      "roleId",
      "permissionId",
      "effect",
      "constraints",
      "createdAt",
    ],
    mutableFields: ["effect", "constraints"],
  },
  resource: {
    readableFields: [
      "id",
      "resourceType",
      "title",
      "ownerOrganizationId",
      "clientOrganizationId",
      "projectId",
      "visibility",
      "sensitivity",
      "createdAt",
      "archivedAt",
    ],
    mutableFields: ["title", "clientOrganizationId", "projectId", "visibility"],
  },
};

const CLIENT_FIELD_POLICIES: Partial<
  Record<R5FieldPolicyResourceType, AuthorizationFieldPolicy>
> = {
  resource: {
    readableFields: [
      "id",
      "resourceType",
      "title",
      "projectId",
      "visibility",
      "createdAt",
    ],
    mutableFields: [],
  },
};

export function getR5FieldPolicy(
  surface: "TEAM" | "CLIENT",
  resourceType: R5FieldPolicyResourceType,
): AuthorizationFieldPolicy | undefined {
  return surface === "TEAM"
    ? TEAM_FIELD_POLICIES[resourceType]
    : CLIENT_FIELD_POLICIES[resourceType];
}

export interface ClientSafeResourceMetadata {
  readonly id: string;
  readonly resourceType: string;
  readonly title: string | null;
  readonly projectId: string | null;
  readonly visibility: "CLIENT_SHARED";
  readonly createdAt: Date;
}

/**
 * Explicit Client projection. Internal ownership, sensitivity, archive state,
 * provider/security metadata and other tenant data are intentionally absent.
 */
export function projectClientSafeResourceMetadata(input: {
  readonly resource: AuthorizationResourceContext;
  readonly title: string | null;
  readonly createdAt: Date;
}): ClientSafeResourceMetadata | null {
  if (
    input.resource.visibility !== "CLIENT_SHARED" ||
    !input.resource.resourceId
  ) {
    return null;
  }

  return {
    id: input.resource.resourceId,
    resourceType: input.resource.resourceType,
    title: input.title,
    projectId: input.resource.projectId ?? null,
    visibility: "CLIENT_SHARED",
    createdAt: input.createdAt,
  };
}
