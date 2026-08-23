import type { Metadata } from "next";
import { OperationsCommandCenterScreen } from "@/components/workspace/operations-insights-screens";

export const metadata: Metadata = { title: "Operations Dashboard — Team Workspace" };

export default function OperationsDashboardPage() { return <OperationsCommandCenterScreen />; }
