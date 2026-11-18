import { reviewProfile } from "@/modules/profile-network/editorial-http";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  return reviewProfile(request, id);
}
