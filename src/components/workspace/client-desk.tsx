"use client";

import { useEffect, useState, type FormEvent } from "react";

type Project = { id: string; title: string; status: string };
type Dashboard = { projectCount: number; approvalCount: number; invoiceCount: number };

export function ClientDesk() {
  const [message, setMessage] = useState("Reading the client desk.");
  const [dashboard, setDashboard] = useState<Dashboard | undefined>();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/v1/r12/client/dashboard"),
      fetch("/api/v1/r12/client/projects"),
    ]).then(async ([home, list]) => {
      if (!home.ok || !list.ok) {
        setMessage("Opening this desk does not grant authority.");
        return;
      }
      const homeBody = await home.json() as { result?: Dashboard };
      const listBody = await list.json() as { result?: Project[] };
      setDashboard(homeBody.result);
      setProjects(Array.isArray(listBody.result) ? listBody.result : []);
      setMessage("Opening this desk does not grant authority.");
    }).catch(() => setMessage("The client desk could not be read."));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/v1/r12/client/approvals/${String(data.get("versionId") ?? "")}`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ decision: "APPROVED", expectedVersion: Number(data.get("expectedVersion") ?? 0) }),
    });
    setMessage(response.ok ? "Decision recorded for that version only." : "The decision was not recorded.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Client</p>
      <h1 className="mt-2 text-3xl font-semibold">Client desk</h1>
      <p className="mt-3 text-neutral-700" role="status">{message}</p>
      <h2 className="mt-8 text-xl font-semibold">Your account</h2>
      {dashboard ? (
        <p>Projects {dashboard.projectCount}. Approvals {dashboard.approvalCount}. Invoices {dashboard.invoiceCount}.</p>
      ) : <p>No client account is visible.</p>}
      <h2 className="mt-8 text-xl font-semibold">Projects</h2>
      {projects.length === 0 ? <p>No project is visible to this client.</p> : (
        <ul className="mt-2 grid gap-2">
          {projects.map((project) => <li key={project.id}>{project.title} — {project.status}</li>)}
        </ul>
      )}
      <form className="mt-8 grid max-w-sm gap-3" onSubmit={onSubmit}>
        <label htmlFor="version-id">Version</label>
        <input id="version-id" name="versionId" className="rounded border px-3 py-2" autoComplete="off" />
        <label htmlFor="expected-version">Exact version number</label>
        <input id="expected-version" name="expectedVersion" inputMode="numeric" className="rounded border px-3 py-2" />
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Approve this version</button>
      </form>
    </main>
  );
}
