import { assignMember } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return assignMember(request, context);
}
