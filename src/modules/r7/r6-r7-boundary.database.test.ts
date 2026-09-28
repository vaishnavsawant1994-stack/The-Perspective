import { afterAll, describe, expect, it } from "vitest";

import { createPrismaClient } from "@/modules/persistence/client";

const database = createPrismaClient();

afterAll(async () => {
  await database.$disconnect();
});

describe("R6 authority ceiling after authorized R7 persistence", () => {
  it("keeps authorized finance tables present and later-slice tables absent", async () => {
    const rows = await database.$queryRawUnsafe<
      Array<{
        proposals: string | null;
        products: string | null;
        packages: string | null;
        contracts: string | null;
        invoices: string | null;
        payments: string | null;
      }>
    >(
      `SELECT
         to_regclass('commercial.proposals')::text AS proposals,
         to_regclass('commercial.products')::text AS products,
         to_regclass('commercial.packages')::text AS packages,
         to_regclass('commercial.contracts')::text AS contracts,
         to_regclass('commercial.invoices')::text AS invoices,
         to_regclass('commercial.payments')::text AS payments`,
    );

    expect(rows[0]).toEqual({
      proposals: "commercial.proposals",
      products: "commercial.products",
      packages: null,
      contracts: null,
      invoices: "commercial.invoices",
      payments: "commercial.payments",
    });
  });

  it("does not grant the runtime role access to still-absent contract tables", async () => {
    const grants = await database.$queryRawUnsafe<Array<{ table_name: string }>>(
      `SELECT table_name
         FROM information_schema.role_table_grants
        WHERE grantee = 'perspective_runtime'
          AND table_schema = 'commercial'
          AND table_name IN ('contracts', 'packages')`,
    );
    expect(grants).toEqual([]);
  });
});
