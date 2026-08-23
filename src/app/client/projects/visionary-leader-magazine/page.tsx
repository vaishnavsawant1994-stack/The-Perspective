import type { Metadata } from "next";
import { ClientProjectDetailScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "The Visionary Leader Magazine — Client Portal" };
export default function Page() { return <ClientProjectDetailScreen />; }
