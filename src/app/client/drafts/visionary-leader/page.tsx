import type { Metadata } from "next";
import { ClientDraftReviewScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Draft Review — Client Portal" };
export default function Page() { return <ClientDraftReviewScreen />; }
