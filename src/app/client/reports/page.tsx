import type { Metadata } from "next";
import { ClientReportsWorkspace } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Reports & Downloads — Client Portal" };
export default function Page(){return <ClientReportsWorkspace/>}
