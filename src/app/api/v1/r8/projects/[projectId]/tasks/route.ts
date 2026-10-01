import { createTask, listTasks } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return listTasks(request, context);
}

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return createTask(request, context);
}
