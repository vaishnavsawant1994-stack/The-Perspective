import type { Metadata } from "next";

import { RolesPermissionsScreen } from "@/components/workspace/platform-foundation-screens";

export const metadata: Metadata = {
  title: "Roles & Permissions Management — Team Workspace",
};

export default function RolesPermissionsManagementPage() {
  return <RolesPermissionsScreen />;
}
