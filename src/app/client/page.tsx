import type { Metadata } from "next";
import { ClientHomeScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Client Portal — The Perspective" };

export default function ClientDashboardPage() { return <ClientHomeScreen />; }
