import { readAsset } from "@/modules/r8/routes";

export function GET(request: Request, context: { params: Promise<{ projectId: string; assetId: string }> }) {
  return readAsset(request, context);
}
