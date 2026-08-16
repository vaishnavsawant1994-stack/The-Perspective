import type { Metadata } from "next";
import { FinanceDashboard } from "@/components/workspace/operational-screens";

export const metadata: Metadata = { title: "Finance Dashboard — Team Workspace" };

export default function FinanceDashboardPage() { return <FinanceDashboard />; }
