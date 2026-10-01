import { createDeliverable, listDeliverables } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return listDeliverables(request, context);
}

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return createDeliverable(request, context);
}
