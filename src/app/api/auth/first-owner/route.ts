import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createFirstOwnerInvitation, requireProductionBootstrapConfiguration } from "@/modules/authentication/first-owner-bootstrap";
import { getPrismaClient } from "@/modules/persistence/client";
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

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return noStoreJson({ message: "Request denied." }, 403);
  const input = await parseAuthenticationJson(request, inputSchema);
  if (!input) return noStoreJson({ message: "Enter a valid email and setup key." }, 400);
  if (!validSetupKey(input.setupKey, process.env.PERSPECTIVE_FIRST_OWNER_SETUP_SECRET)) {
    return noStoreJson({ message: "The setup key is incorrect or setup is unavailable." }, 403);
  }

  try {
    requireProductionBootstrapConfiguration();
    const invitationUrl = await createFirstOwnerInvitation(getPrismaClient(), input.email);
    return noStoreJson({ invitationUrl });
  } catch (error) {
    if (error instanceof Error && error.message.includes("database is not empty")) {
      return noStoreJson({ message: "The first-owner setup has already been used or the database is not empty." }, 409);
    }
    return noStoreJson({ message: "Setup could not be completed. Check the production settings and try again." }, 503);
  }
}

