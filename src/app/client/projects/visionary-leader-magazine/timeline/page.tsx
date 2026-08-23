import type { Metadata } from "next";
import { ClientProjectTimelineScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Project Timeline — Client Portal" };
export default function Page() { return <ClientProjectTimelineScreen />; }
