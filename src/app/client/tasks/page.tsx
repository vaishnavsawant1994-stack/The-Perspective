import type { Metadata } from "next";
import { ClientTasksScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Tasks & Requests — Client Portal" };
export default function Page() { return <ClientTasksScreen />; }
