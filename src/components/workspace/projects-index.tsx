"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ProjectRecord } from "@/components/workspace/project-record";

type Project = { id: string; title: string; state: string; rowVersion: number; proposalId: string | null };

export function ProjectsIndex() {
  const searchParams = useSearchParams();
  const selectedProjectId = searchParams.get("projectId");
  const [projects, setProjects] = useState<Project[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "forbidden" | "error">("loading");

  useEffect(() => {
    let active = true;
    void fetch("/api/v1/r8/projects", { cache: "no-store" })
      .then(async (response) => {
        if (response.status === 403) return { forbidden: true as const };
        if (!response.ok) throw new Error("Project list unavailable");
        return response.json() as Promise<{ result?: Project[] }>;
      })
      .then((body) => {
        if (!active) return;
        if ("forbidden" in body) {
          setState("forbidden");
          return;
        }
        setProjects(Array.isArray(body.result) ? body.result : []);
        setState("ready");
      })
      .catch(() => { if (active) setState("error"); });
    return () => { active = false; };
  }, []);

  if (selectedProjectId) return <ProjectRecord projectId={selectedProjectId} />;

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500">Team Workspace / Delivery</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">Projects</h1>
          <p className="mt-2 text-sm text-neutral-600">Projects available to your organization.</p>
        </div>
        <Link className="rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800" href="/app/projects/new">Create project</Link>
      </header>

      {state === "loading" && <p role="status" className="rounded-lg border p-5 text-sm">Loading projects…</p>}
      {state === "error" && <p role="alert" className="rounded-lg border border-red-300 p-5 text-sm text-red-800">Projects could not be loaded. Refresh the page or contact your workspace administrator.</p>}
      {state === "forbidden" && <p role="status" className="rounded-lg border p-5 text-sm text-neutral-700">Your current team role does not have permission to view projects.</p>}
      {state === "ready" && projects.length === 0 && (
        <section className="rounded-lg border p-8 text-center">
          <h2 className="text-lg font-semibold">No projects yet</h2>
          <p className="mt-2 text-sm text-neutral-600">Create a project to begin tracking delivery work.</p>
          <Link className="mt-5 inline-flex rounded-md bg-neutral-950 px-4 py-2 text-sm font-medium text-white" href="/app/projects/new">Create project</Link>
        </section>
      )}
      {state === "ready" && projects.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {projects.map((project) => (
            <li key={project.id}>
              <Link className="block rounded-lg border p-5 transition hover:border-neutral-500 hover:shadow-sm" href={`/app/projects?projectId=${encodeURIComponent(project.id)}`}>
                <span className="flex items-start justify-between gap-3">
                  <span className="font-semibold">{project.title}</span>
                  <span className="rounded-full bg-neutral-100 px-2.5 py-1 text-xs capitalize text-neutral-700">{project.state.toLowerCase().replaceAll("_", " ")}</span>
                </span>
                <span className="mt-3 block text-xs text-neutral-500">Project ID · {project.id}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
