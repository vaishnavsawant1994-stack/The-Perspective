import { resolveReview } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ reviewId: string }> }) {
  return resolveReview(request, context);
}
