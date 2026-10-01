import { setRights } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ assetId: string }> }) {
  return setRights(request, context);
}
