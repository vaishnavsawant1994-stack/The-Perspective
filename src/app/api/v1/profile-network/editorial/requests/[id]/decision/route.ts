import { decideProfileRequest } from "@/modules/profile-network/requests-http";
export const dynamic = "force-dynamic";
type Props={params:Promise<{id:string}>};
export async function POST(request:Request,{params}:Props) {
  const {id}=await params;
  return decideProfileRequest(request,id);
}
