import type { Metadata } from "next";
import { ClientContractsWorkspace } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Contracts — Client Portal" };
export default function Page(){return <ClientContractsWorkspace/>}
