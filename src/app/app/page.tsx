import type { Metadata } from "next";
import { ExecutiveDashboard } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "Executive Dashboard — Team Workspace" };

export default function ExecutiveDashboardPage() { return <ExecutiveDashboard />; }
