import { endMember } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ projectId: string; membershipId: string }> }) {
  return endMember(request, context);
}
