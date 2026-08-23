import type { Metadata } from "next";
import { TeamGlobalSearch } from "@/components/workspace/team-route-variants";
export const metadata: Metadata = { title: "Global Search — Team Workspace" };
export default function Page() { return <TeamGlobalSearch/>; }
