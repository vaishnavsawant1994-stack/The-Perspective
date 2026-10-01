import { decideVersion } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return decideVersion(request, context);
}
