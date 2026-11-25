import { purgeExpiredProfileRequests } from "@/modules/profile-network/requests-retention";

export function POST(request: Request) {
  return purgeExpiredProfileRequests(request);
}
