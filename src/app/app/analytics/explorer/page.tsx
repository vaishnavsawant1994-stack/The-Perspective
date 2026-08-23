import type { Metadata } from "next";

import { AnalyticsWorkspaceScreen } from "@/components/workspace/platform-foundation-screens";

export const metadata: Metadata = {
  title: "Analytics Workspace — Team Workspace",
};

export default function AnalyticsWorkspacePage() {
  return <AnalyticsWorkspaceScreen />;
}
