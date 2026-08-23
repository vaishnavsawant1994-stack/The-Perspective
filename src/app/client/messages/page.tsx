import type { Metadata } from "next";
import { ClientMessagesScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Messages — Client Portal" };
export default function Page() { return <ClientMessagesScreen />; }
