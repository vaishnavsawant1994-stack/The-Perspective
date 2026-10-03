"use client";

import { useEffect, useState, type FormEvent } from "react";

type Settings = { timezone?: string; weekStartsOn?: string; supportLabel?: string | null; expectedVersion?: number; configured?: boolean };
type Integration = { integrationType: string; state: string };

export function OperationsDesk() {
  const [message, setMessage] = useState("Reading the operations desk.");
  const [settings, setSettings] = useState<Settings>({});
  const [integrations, setIntegrations] = useState<Integration[]>([]);

  useEffect(() => {
    void Promise.all([
      fetch("/api/v1/r13/settings"),
      fetch("/api/v1/r13/integrations"),
    ]).then(async ([settingsResponse, integrationsResponse]) => {
      if (!settingsResponse.ok || !integrationsResponse.ok) {
        setMessage("Opening this desk does not grant authority.");
        return;
      }
      const settingsBody = await settingsResponse.json() as { result?: Settings };
      const integrationsBody = await integrationsResponse.json() as { result?: Integration[] };
      setSettings(settingsBody.result ?? {});
      setIntegrations(Array.isArray(integrationsBody.result) ? integrationsBody.result : []);
      setMessage("Opening this desk does not grant authority.");
    }).catch(() => setMessage("The operations desk could not be read."));
  }, []);

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const response = await fetch(`/api/v1/r13/integrations/${String(data.get("integrationType") ?? "")}/verify`, {
      method: "POST",
      headers: { "content-type": "application/json", "idempotency-key": crypto.randomUUID() },
      body: JSON.stringify({ reason: "Check whether a provider is configured" }),
    });
    const body = response.ok ? await response.json() as { result?: { result?: string } } : undefined;
    setMessage(body?.result?.result === "PROVIDER_UNAVAILABLE"
      ? "No provider is configured. Nothing was verified."
      : "The verification was not accepted.");
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Operations</p>
      <h1 className="mt-2 text-3xl font-semibold">Operations desk</h1>
      <p className="mt-3 text-neutral-700" role="status">{message}</p>
      <h2 className="mt-8 text-xl font-semibold">Preferences</h2>
      <p>{settings.configured ? `${settings.timezone} · ${settings.weekStartsOn} · ${settings.supportLabel}` : "No preference has been saved."}</p>
      <h2 className="mt-8 text-xl font-semibold">Integrations</h2>
      {integrations.length === 0 ? <p>No integration is visible.</p> : (
        <ul className="mt-2 grid gap-2">
          {integrations.map((item) => <li key={item.integrationType}>{item.integrationType} — {item.state}</li>)}
        </ul>
      )}
      <form className="mt-8 grid max-w-sm gap-3" onSubmit={onVerify}>
        <label htmlFor="integration-type">Integration</label>
        <input id="integration-type" name="integrationType" className="rounded border px-3 py-2" autoComplete="off" />
        <button className="w-fit rounded bg-neutral-950 px-4 py-2 text-white" type="submit">Check provider</button>
      </form>
    </main>
  );
}
