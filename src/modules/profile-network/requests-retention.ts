import "server-only";

import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

import { getPrismaClient } from "@/modules/persistence/client";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

function response(status: number, body: Record<string, unknown>) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function matchesSecret(supplied: string, expected: string | undefined) {
  if (!expected || expected.length < 32) return false;
  const actualBytes = Buffer.from(supplied);
  const expectedBytes = Buffer.from(expected);
  return actualBytes.length === expectedBytes.length && timingSafeEqual(actualBytes, expectedBytes);
}

export async function purgeExpiredProfileRequests(request: Request) {
  const config = process.env;
  const expectedToken = config.PERSPECTIVE_PN04_RETENTION_TOKEN;
  if (!expectedToken || expectedToken.length < 32) {
    return response(503, { code: "PN_RETENTION_UNAVAILABLE" });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const supplied = /^Bearer\s+(.+)$/iu.exec(authorization)?.[1]?.trim() ?? "";
  if (!matchesSecret(supplied, expectedToken)) {
    return response(403, { code: "AUTHZ_DENIED" });
  }

  const actorId = config.PERSPECTIVE_PN04_RETENTION_ACTOR_ID?.trim() ?? "";
  const organizationId = config.PERSPECTIVE_PN04_RETENTION_ORGANIZATION_ID?.trim() ?? "";
  if (!UUID.test(actorId) || !UUID.test(organizationId)) {
    return response(503, { code: "PN_RETENTION_UNAVAILABLE" });
  }

  try {
    const rows = await getPrismaClient().$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe("SET LOCAL ROLE perspective_runtime");
      await transaction.$queryRaw`SELECT set_config('app.organization_id', ${organizationId}, true)`;
      return transaction.$queryRawUnsafe<Array<{ deleted: number }>>(
        "SELECT profiles.pn04_purge_expired($1::uuid) AS deleted",
        actorId,
      );
    });
    return response(200, { deleted: Number(rows[0]?.deleted ?? 0) });
  } catch {
    // Do not return database messages: they can contain private schema or request data.
    return response(503, { code: "PN_RETENTION_UNAVAILABLE" });
  }
}
