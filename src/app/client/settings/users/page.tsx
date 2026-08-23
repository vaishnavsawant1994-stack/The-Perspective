import type { Metadata } from "next";
import { ClientTeamAccess } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Team Access & Users — Client Portal" };
export default function Page(){return <ClientTeamAccess/>}
