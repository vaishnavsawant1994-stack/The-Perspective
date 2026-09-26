import type { Metadata } from "next";
import { ClientSignIn } from "@/components/workspace/client-auth-screens";
import { sanitizeAuthenticationReturnPath } from "@/modules/foundation/routing/access-policy";

export const metadata: Metadata = {
  title: "Client Portal Sign In — The Perspective",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const returnPath = next
    ? sanitizeAuthenticationReturnPath(next, "CLIENT")
    : undefined;

  return <ClientSignIn returnPath={returnPath} />;
}
