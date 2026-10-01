import { readApproval } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return readApproval(request, context);
}
