import type { Metadata } from "next";
import { TeamShellShowcase } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "TeamShell — Workspace Foundation" };

export default function TeamShellPage() { return <TeamShellShowcase />; }
