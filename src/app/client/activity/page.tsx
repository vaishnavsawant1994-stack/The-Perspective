import type { Metadata } from "next";
import { ClientActivityHistory } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Activity History — Client Portal" };
export default function Page(){return <ClientActivityHistory/>}
