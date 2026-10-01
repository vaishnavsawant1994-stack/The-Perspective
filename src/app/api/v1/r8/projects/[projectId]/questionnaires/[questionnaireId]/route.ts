import { readQuestionnaire } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string; questionnaireId: string }> }) {
  return readQuestionnaire(request, context);
}
