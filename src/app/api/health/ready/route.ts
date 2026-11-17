import { NextResponse } from "next/server";
import { Client } from "pg";

import { assertProductionConfiguration } from "@/modules/foundation/config/production-boundary";
import { readinessFailureCategory, readyStatus } from "@/modules/r14/health";

export const dynamic = "force-dynamic";

export async function GET() {
  assertProductionConfiguration(process.env);
  const result = await readyStatus(async () => {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw Object.assign(new Error("database unavailable"), { code: "DATABASE_URL_UNSET" });
    const client = new Client({ connectionString });
    try {
      await client.connect();
      await client.query("SELECT 1");
    } finally {
      await client.end().catch(() => undefined);
    }
  }, (error) => {
    console.error("Database readiness probe failed", { category: readinessFailureCategory(error) });
  });
  return NextResponse.json(result.body, { status: result.httpStatus });
}
