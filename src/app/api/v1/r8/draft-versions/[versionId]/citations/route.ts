import { addCitation, listCitations } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return listCitations(request, context);
}

export function POST(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return addCitation(request, context);
}
