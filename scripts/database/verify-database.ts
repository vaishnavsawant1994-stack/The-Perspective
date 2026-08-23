import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { Client } from "pg";

import { requireDatabaseUrl } from "../../src/modules/persistence/database-environment";

async function verify() {
  const client = new Client({
    connectionString: requireDatabaseUrl(process.env),
  });
  const verificationFiles = [
    "prisma/migrations/20260823180000_r2_foundation/verify.sql",
    "prisma/migrations/20260823190000_r3_authentication/verify.sql",
  ];
  const verificationSql = await Promise.all(
    verificationFiles.map((file) => readFile(resolve(file), "utf8")),
  );

  await client.connect();

  try {
    const catalog: Record<string, unknown> = {};
    for (const sql of verificationSql) {
      const result = await client.query(sql);
      const finalResult = Array.isArray(result) ? result.at(-1) : result;
      Object.assign(catalog, finalResult?.rows?.[0] ?? {});
    }
    process.stdout.write(
      `${JSON.stringify({ verified: true, catalog })}\n`,
    );
  } finally {
    await client.end();
  }
}

verify().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown verification error";
  process.stderr.write(`Database contract verification failed: ${message}\n`);
  process.exitCode = 1;
});
