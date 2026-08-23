import type { Metadata } from "next";

import { ReportingWorkspaceScreen } from "@/components/workspace/platform-foundation-screens";

export const metadata: Metadata = {
  title: "Client Reporting Workspace — Team Workspace",
};

export default function ClientReportingWorkspacePage() {
  return <ReportingWorkspaceScreen />;
}
