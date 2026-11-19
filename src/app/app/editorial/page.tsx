import type { Metadata } from "next";
import Link from "next/link";
import { EditorialDashboard } from "@/components/workspace/workspace-dashboards";

export const metadata: Metadata = { title: "Editorial Dashboard — Team Workspace" };

export default function EditorialDashboardPage() {
  return <>
    <div className="mx-auto max-w-7xl px-5 pt-5 sm:px-8">
      <Link className="inline-flex rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-accent hover:underline" href="/app/editorial/profile-network">
        Open Profile Network editorial studio
      </Link>
    </div>
    <EditorialDashboard />
  </>;
}
