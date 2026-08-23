import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

import { requireDatabaseUrl } from "./database-environment";

const globalDatabase = globalThis as typeof globalThis & {
  perspectivePrisma?: PrismaClient;
};

export function createPrismaClient(databaseUrl = requireDatabaseUrl(process.env)) {
  const adapter = new PrismaPg({ connectionString: databaseUrl });
  return new PrismaClient({ adapter });
}

export function getPrismaClient() {
  if (!globalDatabase.perspectivePrisma) {
    globalDatabase.perspectivePrisma = createPrismaClient();
  }

  return globalDatabase.perspectivePrisma;
}
