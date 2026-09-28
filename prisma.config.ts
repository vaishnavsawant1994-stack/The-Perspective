import "dotenv/config";

import { defineConfig } from "prisma/config";

const unavailableDatabaseUrl =
  "postgresql://perspective_unconfigured:perspective_unconfigured@127.0.0.1:1/perspective_unconfigured";

export default defineConfig({
  schema: ["prisma/schema.prisma", "prisma/r7-models.prisma"],
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed/index.ts",
  },
  datasource: {
    // Schema validation/generation must work without a secret. Commands that
    // actually connect fail against this closed local placeholder when the
    // operator has not supplied DATABASE_URL.
    url: process.env.DATABASE_URL ?? unavailableDatabaseUrl,
    shadowDatabaseUrl:
      process.env.SHADOW_DATABASE_URL ?? unavailableDatabaseUrl,
  },
});
