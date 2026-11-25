"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Project = { id: string; title: string; state: string; rowVersion: number; proposalId: string | null };

export function ProjectRecord({ projectId }: { projectId: string }) {
  const [project, setProject] = useState<Project | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");

  useEffect(() => {
    let active = true;
    void fetch(`/api/v1/r8/projects/${encodeURIComponent(projectId)}`, { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 404) return null;
        if (!response.ok) throw new Error("Project unavailable");
        const body = await response.json() as { result?: Project };
        return body.result ?? null;
      })
      .then((record) => {
        if (!active) return;
        setProject(record);
        setStatus(record ? "ready" : "missing");
      })
      .catch(() => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [projectId]);

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <Link className="text-sm text-neutral-600 underline underline-offset-4" href="/app/projects">← All projects</Link>
      {status === "loading" && <p className="mt-6" role="status">Loading project…</p>}
      {status === "error" && <p className="mt-6 rounded-lg border border-red-300 p-5 text-sm text-red-800" role="alert">This project could not be loaded. Refresh the page or contact your workspace administrator.</p>}
      {status === "missing" && <section className="mt-6 rounded-lg border p-6"><h1 className="text-xl font-semibold">Project not found</h1><p className="mt-2 text-sm text-neutral-600">This project may have been removed or is not available to your organization.</p></section>}
      {status === "ready" && project && <section className="mt-6 rounded-lg border p-6">
        <p className="text-sm text-neutral-500">Project Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold">{project.title}</h1>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Status</dt><dd className="mt-1 capitalize">{project.state.toLowerCase().replaceAll("_", " ")}</dd></div>
          <div><dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Record version</dt><dd className="mt-1">{project.rowVersion}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Project ID</dt><dd className="mt-1 break-all font-mono text-sm">{project.id}</dd></div>
        </dl>
      </section>}
    </main>
  );
}
