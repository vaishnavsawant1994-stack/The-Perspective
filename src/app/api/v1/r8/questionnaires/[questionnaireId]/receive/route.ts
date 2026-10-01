import { receiveQuestionnaire } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ questionnaireId: string }> }) {
  return receiveQuestionnaire(request, context);
}
