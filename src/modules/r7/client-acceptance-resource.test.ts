import { describe, expect, it, vi } from "vitest";

import type { PrismaClient } from "@/generated/prisma/client";
import type { AuthorizedRequestContext } from "@/modules/foundation/request-context";
import { loadClientProposalAcceptanceResource } from "./resources";

function clientContext(
  overrides: Partial<AuthorizedRequestContext> = {},
): AuthorizedRequestContext {
  const orgId = "client-org-1" as never;
  const membershipId = "client-membership-1" as never;
  return {
    authentication: "authenticated",
    scope: "authorized",
    requestId: "client-acceptance-resource-test",
    identity: { userId: "customer-user-1" as never },
    session: {
      sessionId: "client-session-1" as never,
      issuedAt: new Date("2026-09-29T00:00:00.000Z"),
      expiresAt: new Date("2026-09-29T01:00:00.000Z"),
      authenticationMethod: "password",
    },
    membership: {
      membershipId,
      organizationId: orgId,
      surface: "CLIENT",
    },
    tenant: {
      membershipId,
      organizationId: orgId,
      surface: "CLIENT",
    },
    authorization: {
      roleKeys: ["R17"],
      permissions: new Set(),
      blockedPermissions: new Set(),
      grantPaths: [],
    },
    ...overrides,
  };
}

const canonicalRow = {
  proposal_id: "proposal-1",
  proposal_resource_id: "resource-1",
  owner_organization_id: "owner-org-1",
  client_organization_id: "client-org-1",
  proposal_status: "SENT",
  current_version: 4,
  row_version: 9,
  proposal_version_id: "proposal-version-4",
  proposal_version: 4,
};

describe("R7 customer acceptance resource", () => {
  it("builds context only from the canonical relationship and exact current immutable version", async () => {
    const query = vi.fn().mockResolvedValue([canonicalRow]);
    const database = { $queryRawUnsafe: query } as unknown as PrismaClient;

    const loaded = await loadClientProposalAcceptanceResource(
      clientContext(),
      "proposal-1",
      database,
    );

    expect(loaded).toMatchObject({
      proposalId: "proposal-1",
      proposalVersionId: "proposal-version-4",
      currentVersion: 4,
      rowVersion: 9,
      separationOfDutySatisfied: true,
      authorizationResource: {
        resourceType: "client-proposal",
        resourceId: "resource-1",
        ownerOrganizationId: "owner-org-1",
        clientOrganizationId: "client-org-1",
        visibility: "CLIENT_SHARED",
        lifecycleState: "SENT",
        version: 4,
      },
    });
    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("customer_membership.membership_type = 'CLIENT'"),
      "proposal-1",
      "client-org-1",
      "client-membership-1",
      "customer-user-1",
    );
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toContain("customer_membership.status = 'ACTIVE'");
    expect(sql).toContain("creator_membership.user_account_id <> customer_membership.user_account_id");
    expect(sql).toContain("version.version = proposal.current_version");
    expect(sql).toContain("version.immutable IS TRUE");
    expect(sql).toContain("version.issued_at IS NOT NULL");
    expect(sql).toContain("proposal.status IN ('SENT', 'VIEWED', 'ACCEPTED')");
  });

  it("loads the accepted exact version only so the domain can enforce idempotent replay", async () => {
    const query = vi.fn().mockResolvedValue([{
      ...canonicalRow,
      proposal_status: "ACCEPTED",
      proposal_version_status: "ACCEPTED",
    }]);
    const loaded = await loadClientProposalAcceptanceResource(
      clientContext(), "proposal-1", { $queryRawUnsafe: query } as unknown as PrismaClient,
    );
    expect(loaded?.authorizationResource.lifecycleState).toBe("ACCEPTED");
    // Resource loading alone does not confer replay authority; the transaction
    // command still requires the matching completed idempotency receipt.
  });

  it("rejects TEAM contexts and mismatched selected organizations before querying", async () => {
    const query = vi.fn().mockResolvedValue([canonicalRow]);
    const database = { $queryRawUnsafe: query } as unknown as PrismaClient;
    const team = clientContext({
      membership: {
        membershipId: "team-membership-1" as never,
        organizationId: "owner-org-1" as never,
        surface: "TEAM",
      },
      tenant: {
        membershipId: "team-membership-1" as never,
        organizationId: "owner-org-1" as never,
        surface: "TEAM",
      },
    });

    expect(
      await loadClientProposalAcceptanceResource(team, "proposal-1", database),
    ).toBeNull();
    expect(
      await loadClientProposalAcceptanceResource(
        clientContext({
          tenant: {
            membershipId: "other-membership" as never,
            organizationId: "other-client-org" as never,
            surface: "CLIENT",
          },
        }),
        "proposal-1",
        database,
      ),
    ).toBeNull();
    expect(query).not.toHaveBeenCalled();
  });

  it("conceals proposals without the authenticated customer's active relationship", async () => {
    const query = vi.fn().mockResolvedValue([]);
    const database = { $queryRawUnsafe: query } as unknown as PrismaClient;

    expect(
      await loadClientProposalAcceptanceResource(
        clientContext(),
        "foreign-or-unrelated-proposal",
        database,
      ),
    ).toBeNull();
    const sql = query.mock.calls[0]?.[0] as string;
    expect(sql).toContain("client_account.client_organization_id = $2::uuid");
    expect(sql).toContain("customer_membership.id = $3::uuid");
    expect(sql).toContain("customer_membership.user_account_id = $4::uuid");
  });

  it("fails closed if the database result does not match the selected client", async () => {
    const query = vi
      .fn()
      .mockResolvedValue([{ ...canonicalRow, client_organization_id: "foreign-org" }]);
    const database = { $queryRawUnsafe: query } as unknown as PrismaClient;

    expect(
      await loadClientProposalAcceptanceResource(
        clientContext(),
        "proposal-1",
        database,
      ),
    ).toBeNull();
  });
});
