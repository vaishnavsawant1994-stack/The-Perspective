"use client";

import { useEffect, useState, type FormEvent } from "react";

type Row = { id: string; title?: string; name?: string; state: string };

export function MediaDesk(props: {
  kicker: string;
  title: string;
  endpoint: string;
  field: "title" | "name";
  fieldLabel: string;
  empty: string;
  includeStart?: boolean;
}) {
  const [value, setValue] = useState("");
  const [start, setStart] = useState("");
  const [message, setMessage] = useState("Reading the desk.");
  const [rows, setRows] = useState<Row[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetch(props.endpoint).then(async (response) => {
      if (!response.ok) {
        setMessage("The list is withheld. A membership grant is required. Opening this desk does not grant authority.");
        setReady(true);
        return;
      }
      const body = await response.json() as { result?: Row[] };
      setRows(Array.isArray(body.result) ? body.result : []);
      setMessage("Opening this desk does not grant authority.");
      setReady(true);
    }).catch(() => {
      setMessage("The desk could not read the ledger.");
      setReady(true);
    });
  }, [props.endpoint]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const body = props.includeStart
      ? { title: value, startsAt: new Date(start).toISOString() }
      : { [props.field]: value };
    const response = await fetch(props.endpoint, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify(body),
    });
    setMessage(response.ok ? "Created. It is not public and it is not delivered." : "The desk refused the command. A membership grant is required.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">{props.kicker}</p>
      <h1 className="mt-2 text-3xl font-semibold">{props.title}</h1>
      <p className="mt-3 max-w-2xl text-neutral-700" role="status">{message}</p>
      <nav className="mt-6 flex flex-wrap gap-3 text-sm" aria-label="Media desks">
        <a className="underline" href="/app/distribution/desk">Distribution</a>
        <a className="underline" href="/app/podcasts/desk">Podcasts</a>
        <a className="underline" href="/app/videos/desk">Videos</a>
        <a className="underline" href="/app/events/desk">Events</a>
      </nav>
      <form className="mt-8 grid gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1" htmlFor={`${props.field}-field`}>{props.fieldLabel}
          <input id={`${props.field}-field`} className="w-full rounded border px-3 py-2" value={value} onChange={(event) => setValue(event.target.value)} required />
        </label>
        {props.includeStart ? (
          <label className="grid gap-1" htmlFor="start-field">Starts
            <input id="start-field" className="w-full rounded border px-3 py-2" type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} required />
          </label>
        ) : null}
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Create</button>
      </form>
      <h2 className="mt-10 text-xl font-semibold">Visible to this membership</h2>
      {!ready ? <p className="mt-2">Loading.</p> : rows.length === 0 ? <p className="mt-2">{props.empty}</p> : (
        <ul className="mt-3 grid gap-2">
          {rows.map((row) => <li key={row.id}>{(row.title ?? row.name) ?? "Untitled"} — {row.state}</li>)}
        </ul>
      )}
    </main>
  );
}
