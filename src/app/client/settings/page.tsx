import type { Metadata } from "next";
import { ClientAccountSettings } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Account Settings — Client Portal" };
export default function Page(){return <ClientAccountSettings/>}
