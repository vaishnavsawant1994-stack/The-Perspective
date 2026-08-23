import type { Metadata } from "next";
import { TeamMyWork } from "@/components/workspace/team-route-variants";
export const metadata: Metadata = { title: "My Work — Team Workspace" };
export default function Page() { return <TeamMyWork/>; }
