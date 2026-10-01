import { editDraft } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ draftId: string }> }) {
  return editDraft(request, context);
}
