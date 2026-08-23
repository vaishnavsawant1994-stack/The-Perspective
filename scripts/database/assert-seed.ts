import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import { assertSeedBaseline } from "../../prisma/seed/assertions";
import { requireDatabaseUrl } from "../../src/modules/persistence/database-environment";

async function assertSeed() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: requireDatabaseUrl(process.env),
    }),
  });

  try {
    const summary = await assertSeedBaseline(prisma);
    process.stdout.write(`${JSON.stringify({ seedVerified: true, summary })}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

assertSeed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown seed assertion error";
  process.stderr.write(`R2 seed assertion failed: ${message}\n`);
  process.exitCode = 1;
});
