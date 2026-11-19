import { listProfileRequests } from "@/modules/profile-network/requests-http";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return listProfileRequests(request);
}
