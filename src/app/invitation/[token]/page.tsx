import type { Metadata } from "next";
import { InvitationAcceptance } from "@/components/auth/invitation-acceptance";

export const metadata: Metadata = {
  title: "Accept Invitation",
  description: "Complete your secure invitation to The Perspective.",
  robots: { index: false, follow: false },
};

export default async function InvitationPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <InvitationAcceptance token={token} />;
}
