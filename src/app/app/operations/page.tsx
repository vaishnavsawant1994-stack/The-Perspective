import type { Metadata } from "next";
import { OperationsDashboard } from "@/components/workspace/operational-screens";

export const metadata: Metadata = { title: "Operations Dashboard — Team Workspace" };

export default function OperationsDashboardPage() { return <OperationsDashboard />; }
