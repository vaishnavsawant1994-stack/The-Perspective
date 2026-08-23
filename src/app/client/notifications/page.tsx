import type { Metadata } from "next";
import { ClientNotificationsCenter } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Notifications Center — Client Portal" };
export default function Page(){return <ClientNotificationsCenter/>}
