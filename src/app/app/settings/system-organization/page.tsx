import type { Metadata } from "next";

import { OrganizationSettingsScreen } from "@/components/workspace/platform-foundation-screens";

export const metadata: Metadata = {
  title: "System / Organization Settings — Team Workspace",
};

export default function SystemOrganizationSettingsPage() {
  return <OrganizationSettingsScreen />;
}
