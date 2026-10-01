import { uploadAsset } from "@/modules/r8/routes";

export function POST(request: Request, context: { params: Promise<{ projectId: string }> }) {
  return uploadAsset(request, context);
}
