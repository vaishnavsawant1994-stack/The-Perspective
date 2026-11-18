import { submitPublicProfileRequest } from "@/modules/profile-network/requests-http";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return submitPublicProfileRequest(request);
}
