import type { Metadata } from "next";
import { ClientDashboard } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "Client Portal — The Perspective" };

export default function ClientDashboardPage() { return <ClientDashboard />; }
