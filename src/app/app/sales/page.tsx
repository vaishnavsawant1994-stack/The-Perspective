import type { Metadata } from "next";
import { SalesDashboard } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "Sales Dashboard — Team Workspace" };

export default function SalesDashboardPage() { return <SalesDashboard />; }
