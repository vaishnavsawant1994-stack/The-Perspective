import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { Prisma } from "@/generated/prisma/client";

const TABLES = [
  "products",
  "proposals",
  "proposal_versions",
  "proposal_lines",
  "invoices",
  "payments",
  "ledger_entries",
  "subscriptions",
  "entitlements",
] as const;

describe("R7 schema/migration parity", () => {
  const migration = readFileSync(
    join(process.cwd(), "prisma/migrations/20260928213000_r7_finance_foundation/migration.sql"),
    "utf8",
  );
  const models = readFileSync(join(process.cwd(), "prisma/r7-models.prisma"), "utf8");
  const contractMigration = readFileSync(join(process.cwd(), "prisma/migrations/20260929183000_r7_contract_signing_foundation/migration.sql"), "utf8");
  const acceptanceMigration = readFileSync(
    join(process.cwd(), "prisma/migrations/20260929170000_r7_proposal_acceptance/migration.sql"),
    "utf8",
  );

  it("creates exactly the authorized finance tables", () => {
    for (const table of TABLES) {
      expect(migration).toContain(`\"commercial\".\"${table}\"`);
      expect(models).toContain(`@@map("${table}")`);
    }
    expect(migration).not.toContain("editorial_works");
    for (const table of ["contracts", "contract_versions", "contract_signers", "signature_requests", "signature_events"]) {
      expect(contractMigration).toContain(`commercial.${table}`);
      expect(models).toContain(`@@map("${table}")`);
    }
    expect(models).not.toContain("EditorialWork");
    expect(models).not.toContain("CommercialPackage");
  });

  it("exposes authorized models on the generated Prisma client", () => {
    expect(Prisma.ModelName.CommercialProduct).toBe("CommercialProduct");
    expect(Prisma.ModelName.CommercialProposal).toBe("CommercialProposal");
    expect(Prisma.ModelName.CommercialProposalVersion).toBe(
      "CommercialProposalVersion",
    );
    expect(Prisma.ModelName.CommercialProposalLine).toBe("CommercialProposalLine");
    expect(Prisma.ModelName.CommercialProposalAcceptanceEvidence).toBe("CommercialProposalAcceptanceEvidence");
    expect(Prisma.ModelName.CommercialInvoice).toBe("CommercialInvoice");
    expect(Prisma.ModelName.CommercialPayment).toBe("CommercialPayment");
    expect(Prisma.ModelName.CommercialLedgerEntry).toBe("CommercialLedgerEntry");
    expect(Prisma.ModelName.CommercialSubscription).toBe(
      "CommercialSubscription",
    );
    expect(Prisma.ModelName.CommercialEntitlement).toBe("CommercialEntitlement");
    expect(Prisma.ModelName.CommercialContract).toBe("CommercialContract");
    expect(Prisma.ModelName.CommercialContractVersion).toBe("CommercialContractVersion");
    expect(Prisma.ModelName.CommercialContractSigner).toBe("CommercialContractSigner");
    expect(Prisma.ModelName.CommercialSignatureRequest).toBe("CommercialSignatureRequest");
    expect(Prisma.ModelName.CommercialSignatureEvent).toBe("CommercialSignatureEvent");
    expect(contractMigration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(contractMigration).toContain("FORCE ROW LEVEL SECURITY");
    expect(contractMigration).toContain("signature_events_provider_event");
    expect(contractMigration).toContain("signature_events_immutable");
    expect(contractMigration).toContain("contract_versions_lifecycle_guard");
    expect(contractMigration).toContain("guard_r7_contract_version_mutation");
    expect(contractMigration).toContain("REVOKE ALL ON commercial.contracts");
    expect(contractMigration).not.toContain("CREATE TRIGGER contract_versions_immutable");
    expect(contractMigration).toContain("document_sha256");
    expect(contractMigration).toContain("contract_versions_immutable");
    expect(contractMigration).toContain("signed_at evidence is immutable");
    expect("CommercialPackage" in Prisma.ModelName).toBe(false);
  });

  it("adds only the owner-authorized immutable customer acceptance evidence model", () => {
    expect(acceptanceMigration).toContain("CREATE TABLE commercial.proposal_acceptances");
    expect(acceptanceMigration).toContain("ENABLE ROW LEVEL SECURITY");
    expect(acceptanceMigration).toContain("FORCE ROW LEVEL SECURITY");
    expect(acceptanceMigration).toContain("CREATE OR REPLACE FUNCTION platform.complete_r7_proposal_acceptance");
    expect(acceptanceMigration).toContain("proposal_acceptances_immutable");
    expect(models).toContain('@@map("proposal_acceptances")');
    expect(acceptanceMigration).not.toContain("commercial.contracts");
    expect(acceptanceMigration).not.toContain("commercial.packages");
  });

  it("keeps money as integer minor units and explicit currency", () => {
    expect(models).toContain("unitAmountMinor     BigInt");
    expect(models).toContain("totalMinor          BigInt");
    expect(models).toContain("@db.Char(3)");
    expect(models).not.toContain("Float");
    expect(migration).toContain("unit_amount_minor\" BIGINT");
    expect(migration).toContain("ENABLE ROW LEVEL SECURITY");
  });
});
