import { listSubmissions, submitProfile } from "@/modules/profile-network/editorial-http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return listSubmissions(request);
}

export async function POST(request: Request) {
  return submitProfile(request);
}
