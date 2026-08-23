import type { Metadata } from "next";
import { ClientOrganizationSettings } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Organization Settings — Client Portal" };
export default function Page(){return <ClientOrganizationSettings/>}
