"use client";

import { useEffect, useState, type FormEvent } from "react";

type Issue = { id: string; slug: string; title: string };

export function MemberLibrary() {
  const [message, setMessage] = useState("Reading the library.");
  const [issues, setIssues] = useState<Issue[]>([]);
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    void fetch("/api/v1/r12/member/library").then(async (response) => {
      if (!response.ok) {
        setSignedIn(false);
        setIssues([]);
        setMessage("Sign in to see issues you are entitled to. This page grants nothing.");
        return;
      }
      const body = await response.json() as { result?: Issue[] };
      setSignedIn(true);
      setIssues(Array.isArray(body.result) ? body.result : []);
      setMessage("Only published issues granted to this member are listed.");
    }).catch(() => setMessage("The library could not be read."));
  }, []);

  async function onCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/v1/r12/member/checkout", {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ offerId: String(data.get("offerId") ?? "") }),
    });
    const body = response.ok ? await response.json() as { result?: { state?: string } } : undefined;
    setMessage(body?.result?.state === "PROVIDER_UNAVAILABLE"
      ? "Checkout is unavailable. No payment was taken and no access was granted."
      : "Checkout was not started.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Member</p>
      <h1 className="mt-2 text-3xl font-semibold">Member library</h1>
      <p className="mt-3 text-neutral-700" role="status">{message}</p>
      <h2 className="mt-8 text-xl font-semibold">Entitled issues</h2>
      {!signedIn || issues.length === 0 ? <p>No entitled issue is visible.</p> : (
        <ul className="mt-2 grid gap-2">
          {issues.map((issue) => <li key={issue.id}>{issue.title}</li>)}
        </ul>
      )}
      <form className="mt-8 grid max-w-sm gap-3" onSubmit={onCheckout}>
        <label htmlFor="offer-id">Offer</label>
        <input id="offer-id" name="offerId" className="rounded border px-3 py-2" autoComplete="off" />
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Request checkout</button>
      </form>
    </main>
  );
}
