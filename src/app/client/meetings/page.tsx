import type { Metadata } from "next";
import { ClientMeetingsScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Meetings — Client Portal" };
export default function Page() { return <ClientMeetingsScreen />; }
