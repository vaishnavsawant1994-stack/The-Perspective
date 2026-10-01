import { addCredit, listCredits } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return listCredits(request, context);
}

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return addCredit(request, context);
}
