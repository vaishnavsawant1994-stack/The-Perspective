import { openReview } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ versionId: string }> }) {
  return openReview(request, context);
}
