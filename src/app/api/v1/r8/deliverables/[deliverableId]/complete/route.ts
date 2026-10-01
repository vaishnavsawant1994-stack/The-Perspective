import { completeDeliverable } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ deliverableId: string }> }) {
  return completeDeliverable(request, context);
}
