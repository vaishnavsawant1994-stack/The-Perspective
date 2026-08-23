import type { Metadata } from "next";
import { ClientDesignReviewScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Design Review — Client Portal" };
export default function Page() { return <ClientDesignReviewScreen />; }
