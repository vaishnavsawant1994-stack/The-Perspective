import { completeMilestone } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ milestoneId: string }> }) {
  return completeMilestone(request, context);
}
