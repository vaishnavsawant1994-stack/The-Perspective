import { transitionProject } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return transitionProject(request, context);
}
