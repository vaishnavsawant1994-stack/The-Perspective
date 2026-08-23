import type { Metadata } from "next";
import { ClientApprovalsWorkspace } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Approvals Center — Client Portal" };
export default function Page(){return <ClientApprovalsWorkspace/>}
