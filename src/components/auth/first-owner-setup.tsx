"use client";

import { FormEvent, useState } from "react";

export function FirstOwnerSetup() {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [invitation, setInvitation] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setMessage("");
    setInvitation("");
    setBusy(true);
      const form = new FormData(formElement);
    try {
      const response = await fetch("/api/auth/first-owner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({
          email: form.get("email"),
          setupKey: form.get("setupKey"),
        }),
      });
      const result = await response.json() as { invitationUrl?: string; message?: string };
      if (!response.ok || !result.invitationUrl) {
        setMessage(result.message ?? "Setup could not be completed. Check the details and try again.");
        return;
      }
      setInvitation(result.invitationUrl);
      setMessage("The one-time invitation is ready. Open it now to create your owner login.");
      formElement.reset();
    } catch {
      setMessage("The setup page could not reach the service. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label className="block text-sm font-medium text-foreground">
        Owner email
        <input name="email" type="email" autoComplete="email" maxLength={320} required className="mt-2 block w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" />
      </label>
      <label className="block text-sm font-medium text-foreground">
        One-time setup key
        <input name="setupKey" type="password" autoComplete="off" minLength={32} maxLength={256} required className="mt-2 block w-full rounded-lg border border-border bg-white px-4 py-3 text-base text-foreground outline-none focus:border-focus focus:ring-2 focus:ring-focus/20" />
      </label>
      <p className="text-sm leading-6 text-muted">The key is checked privately and is never saved in your browser or shown back to you.</p>
      <button type="submit" disabled={busy || Boolean(invitation)} className="rounded-lg bg-accent px-5 py-3 font-semibold text-white transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Creating invitation…" : "Create owner invitation"}
      </button>
      {message && <p role="status" className="text-sm leading-6 text-foreground">{message}</p>}
      {invitation && <a href={invitation} rel="noreferrer" className="inline-flex rounded-lg border border-accent px-5 py-3 font-semibold text-accent underline underline-offset-4">Continue to owner setup</a>}
    </form>
  );
}

