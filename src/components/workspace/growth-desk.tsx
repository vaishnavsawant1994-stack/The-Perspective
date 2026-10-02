"use client";

import { useEffect, useState, type FormEvent } from "react";

type Report = { id: string; family: string; state: string };

export function GrowthDesk() {
  const [message, setMessage] = useState("Reading the desk.");
  const [rows, setRows] = useState<Report[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    void fetch("/api/v1/r11/reports").then(async (response) => {
      if (!response.ok) {
        setMessage("The list is withheld. A membership grant is required. Opening this desk does not grant authority.");
        setReady(true);
        return;
      }
      const body = await response.json() as { result?: Report[] };
      setRows(Array.isArray(body.result) ? body.result : []);
      setMessage("Opening this desk does not grant authority.");
      setReady(true);
    }).catch(() => {
      setMessage("The desk could not read the ledger.");
      setReady(true);
    });
  }, []);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    const response = await fetch("/api/v1/r11/reports", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ family: "CONTENT", from: from.toISOString(), to: to.toISOString() }),
    });
    setMessage(response.ok
      ? "Report requested. The numbers were derived by the server."
      : "The desk refused the command. A membership grant is required.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Growth</p>
      <h1 className="mt-2 text-3xl font-semibold">Growth desk</h1>
      <p className="mt-3 max-w-2xl text-neutral-700" role="status">{message}</p>
      <form className="mt-8 grid gap-3" onSubmit={onSubmit}>
        <p id="report-range">Content report for the last seven days. This form does not accept a view count.</p>
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Request report</button>
      </form>
      <h2 className="mt-10 text-xl font-semibold">Visible to this membership</h2>
      {!ready ? <p className="mt-2">Loading.</p> : rows.length === 0 ? <p className="mt-2">No report is visible to this membership.</p> : (
        <ul className="mt-3 grid gap-2">
          {rows.map((row) => <li key={row.id}>{row.family} — {row.state}</li>)}
        </ul>
      )}
    </main>
  );
}
