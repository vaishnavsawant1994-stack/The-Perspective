import { createMilestone, listMilestones } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return listMilestones(request, context);
}

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return createMilestone(request, context);
}
