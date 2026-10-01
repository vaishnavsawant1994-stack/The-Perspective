import { listFactChecks, recordFactCheck } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return listFactChecks(request, context);
}

export function POST(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return recordFactCheck(request, context);
}
