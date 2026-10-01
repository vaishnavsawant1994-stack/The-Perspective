import { readVersion } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return readVersion(request, context);
}
