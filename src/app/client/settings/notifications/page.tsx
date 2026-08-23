import type { Metadata } from "next";
import { ClientNotificationPreferences } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Notification Preferences — Client Portal" };
export default function Page(){return <ClientNotificationPreferences/>}
