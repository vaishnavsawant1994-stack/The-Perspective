import { assignTask } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ taskId: string }> }) {
  return assignTask(request, context);
}
