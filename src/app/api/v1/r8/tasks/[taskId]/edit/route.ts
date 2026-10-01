import { editTask } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return editTask(request, context);
}
