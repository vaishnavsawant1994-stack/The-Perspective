import { describe, expect, it, vi } from "vitest";

import type {
  MembershipId,
  OrganizationId,
  SessionId,
  TenantScopedRequestContext,
  UserId,
} from "@/modules/foundation/request-context";

import {
  buildTrustedIamResourceContext,
  loadTrustedResourceContext,
} from "./resource-context";
import {
  getR5FieldPolicy,
  projectClientSafeResourceMetadata,
} from "./fields";

function tenantContext(surface: "TEAM" | "CLIENT"): TenantScopedRequestContext {
  const organizationId = "org-1" as OrganizationId;
  const membershipId = "membership-1" as MembershipId;

  return {
    authentication: "authenticated",
    scope: "tenant",
    requestId: "request-1",
    identity: { userId: "user-1" as UserId },
    session: {
      sessionId: "session-1" as SessionId,
      issuedAt: new Date("2026-09-27T00:00:00.000Z"),
      expiresAt: new Date("2026-09-28T00:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId,
      surface,
    },
    tenant: {
      membershipId,
      organizationId,
      surface,
    },
  };
}

describe("R5 trusted resource context", () => {
  it("constrains Team resource lookup to the selected owner organization", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const database = {
      resource: { findFirst },
    } as unknown as Parameters<typeof loadTrustedResourceContext>[2];

    await loadTrustedResourceContext(
      tenantContext("TEAM"),
      "resource-1",
      database,
    );

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "resource-1",
          ownerOrganizationId: "org-1",
        },
      }),
    );
  });

  it("constrains Client resource lookup to own client org and CLIENT_SHARED", async () => {
    const findFirst = vi.fn().mockResolvedValue(null);
    const database = {
      resource: { findFirst },
    } as unknown as Parameters<typeof loadTrustedResourceContext>[2];

    await loadTrustedResourceContext(
      tenantContext("CLIENT"),
      "resource-1",
      database,
    );

    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: "resource-1",
          clientOrganizationId: "org-1",
          visibility: "CLIENT_SHARED",
        },
      }),
    );
  });

  it("normalizes a trusted resource envelope for the policy engine", async () => {
    const findFirst = vi.fn().mockResolvedValue({
      id: "resource-1",
      resourceType: "REPORT",
      title: "Client report",
      ownerOrganizationId: "platform-org",
      clientOrganizationId: "org-1",
      projectId: "project-1",
      visibility: "CLIENT_SHARED",
      sensitivity: "CONFIDENTIAL",
      createdAt: new Date("2026-09-27T01:00:00.000Z"),
      archivedAt: null,
    });
    const database = {
      resource: { findFirst },
    } as unknown as Parameters<typeof loadTrustedResourceContext>[2];

    await expect(
      loadTrustedResourceContext(
        tenantContext("CLIENT"),
        "resource-1",
        database,
      ),
    ).resolves.toEqual({
      resourceId: "resource-1",
      resourceType: "REPORT",
      ownerOrganizationId: "platform-org",
      clientOrganizationId: "org-1",
      projectId: "project-1",
      visibility: "CLIENT_SHARED",
      sensitivity: "CONFIDENTIAL",
      lifecycleState: "ACTIVE",
    });
  });

  it("builds IAM context only from trusted server values", () => {
    expect(
      buildTrustedIamResourceContext({
        resourceId: "role-1",
        resourceType: "role",
        ownerOrganizationId: "org-1",
        targetMembershipId: "membership-2",
        lifecycleState: "ACTIVE",
        version: 7,
      }),
    ).toEqual({
      resourceId: "role-1",
      resourceType: "role",
      ownerOrganizationId: "org-1",
      targetMembershipId: "membership-2",
      lifecycleState: "ACTIVE",
      version: 7,
    });
  });
});

describe("R5 field and client projection policy", () => {
  it("declares every role-permission read field returned by the admin API", () => {
    const policy = getR5FieldPolicy("TEAM", "role-permission");
    expect(policy).toBeDefined();
    expect(policy?.readableFields).toEqual(
      expect.arrayContaining([
        "roleId",
        "permissionsHash",
        "permissionKey",
        "effect",
        "constraints",
      ]),
    );
  });

  it("keeps client IAM field policies unavailable", () => {
    expect(getR5FieldPolicy("CLIENT", "role")).toBeUndefined();
    expect(getR5FieldPolicy("CLIENT", "permission")).toBeUndefined();
    expect(getR5FieldPolicy("CLIENT", "membership")).toBeUndefined();
    expect(getR5FieldPolicy("CLIENT", "role-permission")).toBeUndefined();
  });

  it("does not expose authority or sensitivity fields in client resource metadata", () => {
    const projection = projectClientSafeResourceMetadata({
      resource: {
        resourceId: "resource-1",
        resourceType: "REPORT",
        ownerOrganizationId: "platform-org",
        clientOrganizationId: "org-1",
        projectId: "project-1",
        visibility: "CLIENT_SHARED",
        sensitivity: "SECRET",
        lifecycleState: "ACTIVE",
      },
      title: "Report",
      createdAt: new Date("2026-09-27T01:00:00.000Z"),
    });

    expect(projection).toEqual({
      id: "resource-1",
      resourceType: "REPORT",
      title: "Report",
      projectId: "project-1",
      visibility: "CLIENT_SHARED",
      createdAt: new Date("2026-09-27T01:00:00.000Z"),
    });

    expect(projection).not.toHaveProperty("ownerOrganizationId");
    expect(projection).not.toHaveProperty("clientOrganizationId");
    expect(projection).not.toHaveProperty("sensitivity");
    expect(projection).not.toHaveProperty("lifecycleState");
  });

  it("refuses to project non-client-shared resources", () => {
    expect(
      projectClientSafeResourceMetadata({
        resource: {
          resourceId: "resource-1",
          resourceType: "INTERNAL_NOTE",
          ownerOrganizationId: "platform-org",
          clientOrganizationId: "org-1",
          visibility: "INTERNAL",
          sensitivity: "CONFIDENTIAL",
        },
        title: "Internal",
        createdAt: new Date("2026-09-27T01:00:00.000Z"),
      }),
    ).toBeNull();
  });
});
