import type { Metadata } from "next";
import { ClientProjectsScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "My Projects — Client Portal" };
export default function Page() { return <ClientProjectsScreen />; }
