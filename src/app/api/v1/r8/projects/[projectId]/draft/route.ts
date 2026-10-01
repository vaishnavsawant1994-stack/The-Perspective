import { createDraft, readDraft } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return readDraft(request, context);
}

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return createDraft(request, context);
}
