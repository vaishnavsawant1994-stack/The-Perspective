"use client";

import { useEffect, useState, type FormEvent } from "react";

const empty = { title: "", season: "", theme: "", availability: "PUBLIC" };

type DeskIssue = { id: string; title: string; state: string; slug: string };

export function PublishingDesk() {
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState("Opening the desk does not grant publisher authority.");
  const [issues, setIssues] = useState<DeskIssue[]>([]);

  useEffect(() => {
    void fetch("/api/v1/r9/issues").then(async (response) => {
      if (!response.ok) {
        setMessage("The issue list is withheld. A membership grant is required. Opening the desk does not grant publisher authority.");
        return;
      }
      const body = await response.json() as { result?: DeskIssue[] };
      setIssues(Array.isArray(body.result) ? body.result : []);
    }).catch(() => setMessage("The desk could not read the publication ledger."));
  }, []);

  async function createIssue(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/v1/r9/issues", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify(form),
    });
    setMessage(response.ok ? "Issue created in draft. It is not public." : "The desk refused the command. A membership grant is required.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Publishing</p>
      <h1 className="mt-2 text-3xl font-semibold">Publishing desk</h1>
      <p className="mt-3 max-w-2xl text-neutral-700">{message}</p>
      <form className="mt-8 grid gap-3" onSubmit={createIssue}>
        <label className="grid gap-1">Title<input className="rounded border px-3 py-2" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></label>
        <label className="grid gap-1">Season<input className="rounded border px-3 py-2" value={form.season} onChange={(event) => setForm({ ...form, season: event.target.value })} required /></label>
        <label className="grid gap-1">Theme<input className="rounded border px-3 py-2" value={form.theme} onChange={(event) => setForm({ ...form, theme: event.target.value })} required /></label>
        <label className="grid gap-1">Availability
          <select className="rounded border px-3 py-2" value={form.availability} onChange={(event) => setForm({ ...form, availability: event.target.value })}>
            <option value="PUBLIC">Public</option>
            <option value="PREMIUM">Premium</option>
          </select>
        </label>
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Create draft issue</button>
      </form>
      <h2 className="mt-10 text-xl font-semibold">Issues on this desk</h2>
      {issues.length === 0 ? <p className="mt-2">No issue is visible to this membership.</p> : (
        <ul className="mt-3 grid gap-2">
          {issues.map((issue) => <li key={issue.id}>{issue.title} — {issue.state}</li>)}
        </ul>
      )}
    </main>
  );
}
