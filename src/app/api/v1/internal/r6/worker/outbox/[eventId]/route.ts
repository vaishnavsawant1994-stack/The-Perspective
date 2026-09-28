import { z } from "zod";

import { invalidR6Request, r6Json } from "@/modules/r6/http";
import { verifyR6WorkerRequest } from "@/modules/r6/security";
import {
  processR6OutboxEvent,
  R6WorkerError,
} from "@/modules/r6/worker";

export async function POST(
  request: Request,
  route: { params: Promise<{ eventId: string }> },
) {
  if (!verifyR6WorkerRequest(request)) {
    return new Response(null, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  const { eventId } = await route.params;
  if (!z.string().uuid().safeParse(eventId).success) return invalidR6Request();

  try {
    return r6Json({ worker: await processR6OutboxEvent(eventId) }, 202);
  } catch (error) {
    if (error instanceof R6WorkerError) {
      const status =
        error.code === "EVENT_NOT_FOUND" ? 404 :
        error.code === "EVENT_BUSY" ? 409 : 422;
      return Response.json(
        {
          type: "about:blank",
          title: "R6 worker request rejected.",
          status,
          code: "R6_WORKER_REJECTED",
        },
        {
          status,
          headers: {
            "Cache-Control": "no-store",
            "Content-Type": "application/problem+json",
          },
        },
      );
    }
    throw error;
  }
}
