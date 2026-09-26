import type { Metadata } from "next";
import { ClientSignIn } from "@/components/workspace/client-auth-screens";
import { sanitizeProtectedReturnPath } from "@/modules/foundation/routing/access-policy";

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
    ? sanitizeProtectedReturnPath(next, "CLIENT")
    : undefined;

  return <ClientSignIn returnPath={returnPath} />;
}
