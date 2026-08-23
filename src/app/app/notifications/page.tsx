import type { Metadata } from "next";
import { TeamNotifications } from "@/components/workspace/team-route-variants";
export const metadata: Metadata = { title: "Notifications — Team Workspace" };
export default function Page() { return <TeamNotifications/>; }
