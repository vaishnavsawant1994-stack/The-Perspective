import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createFirstOwnerInvitation, requireProductionBootstrapConfiguration } from "@/modules/authentication/first-owner-bootstrap";
import { createPrismaClient } from "@/modules/persistence/client";
import { parseAuthenticationJson, requireSameOrigin } from "@/modules/authentication/http/request-security";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  email: z.string().email().max(320),
  setupKey: z.string().min(32).max(256),
}).strict();

function noStoreJson(body: Record<string, string>, status = 200) {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store, max-age=0" } });
}

function validSetupKey(candidate: string, configured: string | undefined) {
  if (!configured || configured.length < 32 || configured.length > 256) return false;
  const candidateBytes = Buffer.from(candidate, "utf8");
  const configuredBytes = Buffer.from(configured, "utf8");
  return candidateBytes.length === configuredBytes.length && timingSafeEqual(candidateBytes, configuredBytes);
}

function safeErrorDetails(error: unknown) {
  if (!error || typeof error !== "object") return {};
  const candidate = error as { name?: unknown; code?: unknown };
  const name = typeof candidate.name === "string" && /^[A-Za-z][A-Za-z0-9_]{0,63}$/u.test(candidate.name)
    ? candidate.name
    : undefined;
  const code = typeof candidate.code === "string" && /^(?:P[0-9]{4}|[0-9A-Z]{5})$/u.test(candidate.code)
    ? candidate.code
    : undefined;
  return { ...(name ? { errorName: name } : {}), ...(code ? { errorCode: code } : {}) };
}

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return noStoreJson({ message: "Request denied." }, 403);
  const input = await parseAuthenticationJson(request, inputSchema);
  if (!input) return noStoreJson({ message: "Enter a valid email and setup key." }, 400);
  if (!validSetupKey(input.setupKey, process.env.PERSPECTIVE_FIRST_OWNER_SETUP_SECRET)) {
    return noStoreJson({ message: "The setup key is incorrect or setup is unavailable." }, 403);
  }

  let client: ReturnType<typeof createPrismaClient> | undefined;
  let failureStage = "production_configuration";
  try {
    const configuration = requireProductionBootstrapConfiguration();
    client = createPrismaClient(configuration.connectionString);
    failureStage = "database_connectivity";
    await client.$queryRaw`SELECT 1`;
    failureStage = "first_owner_transaction";
    const invitationUrl = await createFirstOwnerInvitation(client, input.email);
    return noStoreJson({ invitationUrl });
  } catch (error) {
    if (error instanceof Error && error.message.includes("database is not empty")) {
      return noStoreJson({ message: "The first-owner setup has already been used or the database is not empty." }, 409);
    }
    console.error("First-owner setup failed", JSON.stringify({ stage: failureStage, ...safeErrorDetails(error) }));
    return noStoreJson({ message: "Setup could not be completed. The production team can now identify the failing setup step safely." }, 503);
  } finally {
    await client?.$disconnect().catch(() => undefined);
  }
}
