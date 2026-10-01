import { projectDetail } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return projectDetail(request, context);
}
