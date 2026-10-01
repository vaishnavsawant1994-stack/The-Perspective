import { editProject } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return editProject(request, context);
}
