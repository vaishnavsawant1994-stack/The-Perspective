import type { Metadata } from "next";
import { EditorialDashboard } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "Editorial Dashboard — Team Workspace" };

export default function EditorialDashboardPage() { return <EditorialDashboard />; }
