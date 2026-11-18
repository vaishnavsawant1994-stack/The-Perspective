"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { ProfileRequestInbox } from "./request-inbox";

type Kind = "COMPANY" | "PROFESSIONAL" | "EDITOR";
type State = "SUBMITTED" | "APPROVED" | "REJECTED";
type Submission = {
  submissionId: string;
  kind: Kind;
  slug: string;
  payload: {
    name: string;
    summary: string;
    sources: Array<{label:string;url:string;capturedAt:string}>;
    disclosureKind?: string;
    disclosureText?: string | null;
    industry?: string;
    headline?: string;
  };
  state: State;
  submittedAt: string;
  reviewedAt: string | null;
  reviewReason: string | null;
};

const api = "/api/v1/profile-network/editorial/submissions";

function newKey() {
  return `pn11-${crypto.randomUUID()}`;
}

function displayError(status: number, data: unknown) {
  if (data && typeof data === "object" && "code" in data && typeof data.code === "string") {
    return `Request rejected (${status}: ${data.code}). Confirm your Team access, recent authentication and editorial permissions.`;
  }
  return `Request failed with status ${status}.`;
}

async function jsonResponse(response: Response) {
  try { return await response.json() as unknown; } catch { return null; }
}

export function ProfileEditorialStudio() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [kind, setKind] = useState<Kind>("COMPANY");
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [summary, setSummary] = useState("");
  const [supplement, setSupplement] = useState("");
  const [website, setWebsite] = useState("");
  const [disclosureKind, setDisclosureKind] = useState<"NONE"|"SPONSORED"|"COMMISSIONED">("NONE");
  const [disclosureText, setDisclosureText] = useState("");
  const [sources, setSources] = useState("");
  const [reviewNotes, setReviewNotes] = useState<Record<string,string>>({});

  const reload = useCallback(async () => {
    try {
      const response = await fetch(api, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) {
        setAuthorized(false);
        setSubmissions([]);
        setNotice(displayError(response.status, await jsonResponse(response)));
        return;
      }
      const data = await jsonResponse(response);
      const value = data && typeof data === "object" && "result" in data ? data.result : null;
      setSubmissions(Array.isArray(value) ? value as Submission[] : []);
      setAuthorized(true);
      setNotice("");
    } catch {
      setAuthorized(false);
      setNotice("Could not reach the editorial service. No changes were made.");
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    const sourceItems = sources.split("\n").map((line) => line.trim()).filter(Boolean).map((line) => {
      const separator = line.indexOf("|");
      if (separator < 1) return null;
      return {
        label: line.slice(0, separator).trim(),
        url: line.slice(separator + 1).trim(),
        capturedAt: new Date().toISOString(),
      };
    });
    if (sourceItems.length < 1 || sourceItems.includes(null)) {
      setNotice("Add at least one source in the format: Source name | https://source.example/page");
      return;
    }
    const payload = {
      name: name.trim(), summary: summary.trim(),
      websiteUrl: website.trim() || null,
      disclosureKind, disclosureText: disclosureKind !== "NONE" ? disclosureText.trim() : null,
      sources: sourceItems,
      ...(kind === "COMPANY" ? { industry: supplement.trim() || null }
        : { headline: supplement.trim() || null, coverage: [] }),
    };
    setBusy(true);
    try {
      const response = await fetch(api, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "Idempotency-Key": newKey() },
        body: JSON.stringify({ kind, slug: slug.trim(), payload }),
      });
      const result = await jsonResponse(response);
      if (!response.ok) {
        setNotice(displayError(response.status, result));
        return;
      }
      setNotice("Submitted for independent editorial review. Publication requires a separate authorized editor.");
      setSlug(""); setName(""); setSummary(""); setSupplement(""); setWebsite("");
      setSources(""); setDisclosureKind("NONE"); setDisclosureText("");
      await reload();
      setNotice("Submission recorded. A different authorized editor must review it before publication.");
    } catch {
      setNotice("Submission could not be verified. Check the queue before retrying to avoid duplicates.");
    } finally {
      setBusy(false);
    }
  }

  async function act(item: Submission, action: "APPROVE"|"REJECT"|"PUBLISH"|"WITHDRAW") {
    setBusy(true);
    setNotice("");
    const note = (reviewNotes[item.submissionId] || "").trim();
    if (note.length < 8) {
      setNotice("Enter an editorial reason of at least 8 characters for this action.");
      setBusy(false);
      return;
    }
    const operation = action === "APPROVE" || action === "REJECT" ? "review" : "publication";
    try {
      const response = await fetch(`${api}/${item.submissionId}/${operation}`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", "Idempotency-Key": newKey() },
        body: JSON.stringify(operation === "review" ? { decision: action, reason: note } : { action, reason: note }),
      });
      const data = await jsonResponse(response);
      if (!response.ok) {
        setNotice(displayError(response.status, data));
        return;
      }
      await reload();
      setNotice(`${action} completed for ${item.slug}. Refresh the public profile to verify the result.`);
    } catch {
      setNotice("The action could not be verified. Review the queue before retrying.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="mx-auto max-w-6xl px-4 py-10 sm:px-8 sm:py-16">
    <div className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-accent">The Perspective / Editorial workspace</div>
    <h1 className="type-h1">Profile Network studio</h1>
    <p className="mt-5 max-w-3xl leading-relaxed text-muted">
      Source-backed company, professional and editor profiles. Submissions remain private until a different authorized editor
      approves the immutable snapshot and a publication-authorized staff member publishes it.
      CRM leads and client accounts are never imported automatically.
    </p>
    <nav className="my-7 flex flex-wrap gap-5 text-sm" aria-label="Public profile directories">
      <Link href="/companies" className="text-accent underline">Companies</Link>
      <Link href="/professionals" className="text-accent underline">Professionals</Link>
      <Link href="/editors" className="text-accent underline">Editors</Link>
    </nav>
    {notice ? <p role="status" className="mb-6 rounded-md border border-border bg-surface p-4">{notice}</p> : null}
    {authorized === null ? <p role="status">Checking Team editorial permissions…</p> : authorized === false
      ? <section className="rounded-lg border border-border bg-surface p-7">
        <h2 className="text-xl font-semibold">Editorial Team access required</h2>
        <p className="mt-4 text-muted">Select an authorized Team membership, complete MFA and sign in before using this workspace.</p>
      </section>
      : <div className="grid gap-10 xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <section aria-labelledby="pn-submit" className="min-w-0 rounded-lg border border-border bg-surface p-6">
          <h2 id="pn-submit" className="type-h3">Submit editorial research</h2>
          <p className="mt-3 text-sm text-muted">Do not include private contact, client or CRM information in these public-facing fields.</p>
          <form onSubmit={(event) => { void submit(event); }} className="mt-7 grid gap-4">
            <label className="grid gap-1 text-sm font-semibold">Profile type
              <select value={kind} onChange={(event) => setKind(event.target.value as Kind)} className="min-h-11 rounded-md border border-border bg-background p-2">
                <option value="COMPANY">Company</option><option value="PROFESSIONAL">Professional</option><option value="EDITOR">Editor</option>
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">Canonical slug
              <input required maxLength={100} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="company-or-person-name" className="min-h-11 rounded-md border border-border bg-background p-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">Public name
              <input required maxLength={180} value={name} onChange={(event) => setName(event.target.value)} className="min-h-11 rounded-md border border-border bg-background p-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">Editorial summary
              <textarea required minLength={12} maxLength={800} rows={4} value={summary} onChange={(event) => setSummary(event.target.value)} className="rounded-md border border-border bg-background p-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">{kind === "COMPANY" ? "Industry" : "Professional headline"}
              <input maxLength={kind === "COMPANY" ? 120 : 200} value={supplement} onChange={(event) => setSupplement(event.target.value)} className="min-h-11 rounded-md border border-border bg-background p-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">Public website (optional HTTPS)
              <input type="url" value={website} onChange={(event) => setWebsite(event.target.value)} placeholder="https://" className="min-h-11 rounded-md border border-border bg-background p-3" />
            </label>
            <label className="grid gap-1 text-sm font-semibold">Source references
              <textarea required rows={4} value={sources} onChange={(event) => setSources(event.target.value)} placeholder={"Source name | https://example.org/source\nSecond source | https://example.org/second"} className="rounded-md border border-border bg-background p-3" />
              <span className="text-xs font-normal text-muted">One reviewed public source per line. No private documents or contact information.</span>
            </label>
            <label className="grid gap-1 text-sm font-semibold">Commercial disclosure
              <select value={disclosureKind} onChange={(event) => setDisclosureKind(event.target.value as typeof disclosureKind)} className="min-h-11 rounded-md border border-border bg-background p-2">
                <option value="NONE">No commercial sponsorship</option>
                <option value="SPONSORED">Sponsored</option>
                <option value="COMMISSIONED">Commissioned</option>
              </select>
            </label>
            {disclosureKind !== "NONE" ? <label className="grid gap-1 text-sm font-semibold">Required disclosure details
              <textarea required minLength={10} maxLength={1000} value={disclosureText} onChange={(event) => setDisclosureText(event.target.value)} className="rounded-md border border-border bg-background p-3" />
            </label> : null}
            <button disabled={busy} type="submit" className="min-h-12 rounded-md bg-foreground px-6 font-semibold text-surface disabled:opacity-60">
              {busy ? "Processing…" : "Submit for review"}
            </button>
          </form>
        </section>
        <section aria-labelledby="pn-review" className="min-w-0">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <h2 id="pn-review" className="type-h3">Editorial review queue</h2>
            <button type="button" onClick={() => { void reload(); }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Refresh queue</button>
          </div>
          <p className="mb-5 text-sm text-muted">Approval must be performed by someone other than the original submitter. Publishing requires separate permission and an editorial reason.</p>
          {submissions.length === 0 ? <p className="rounded-lg border border-border bg-surface p-7">No profile submissions are available.</p>
            : <ul className="space-y-5">{submissions.map((item) => <li key={item.submissionId} className="rounded-lg border border-border bg-surface p-6">
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.08em] text-accent">
                <span>{item.kind}</span><span>{item.state}</span><span>{new Date(item.submittedAt).toLocaleDateString("en-IN")}</span>
              </div>
              <h3 className="text-xl font-semibold">{item.payload?.name || item.slug}</h3>
              <p className="mt-2 text-sm text-muted">{item.payload?.summary}</p>
              <p className="mt-4 break-all text-xs text-muted">Slug: {item.slug}</p>
              <div className="mt-4 text-sm">
                <p className="font-semibold">Submitted public sources</p>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {item.payload?.sources?.map((ref,i) => <li key={i}>
                    <a href={ref.url} rel="noopener noreferrer nofollow" target="_blank" className="text-accent underline">{ref.label}</a>
                  </li>)}
                </ul>
              </div>
              {item.payload?.disclosureKind && item.payload.disclosureKind !== "NONE" ? <p className="mt-4 text-sm font-semibold text-accent">Disclosure: {item.payload.disclosureKind} — {item.payload.disclosureText}</p> : null}
              {item.reviewReason ? <p className="mt-4 text-sm text-muted">Last review reason: {item.reviewReason}</p> : null}
              {item.state !== "REJECTED" ? <>
                <label className="mt-5 grid gap-1 text-sm font-semibold">Editorial reason (required)
                  <textarea value={reviewNotes[item.submissionId] || ""} onChange={(event) => setReviewNotes((notes) => ({...notes,[item.submissionId]:event.target.value}))} minLength={8} maxLength={400} rows={2} className="rounded-md border border-border bg-background p-3" />
                </label>
                <div className="mt-4 flex flex-wrap gap-3">
                  {item.state === "SUBMITTED" ? <>
                    <button disabled={busy} onClick={() => { void act(item,"APPROVE"); }} className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-surface">Approve</button>
                    <button disabled={busy} onClick={() => { void act(item,"REJECT"); }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Reject</button>
                  </> : <>
                    <button disabled={busy} onClick={() => { void act(item,"PUBLISH"); }} className="rounded-md bg-foreground px-4 py-2 text-sm font-semibold text-surface">Publish</button>
                    <button disabled={busy} onClick={() => { void act(item,"WITHDRAW"); }} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Withdraw</button>
                  </>}
                </div>
              </> : null}
            </li>)}</ul>}
        </section>
      </div>}
    {authorized ? <ProfileRequestInbox /> : null}
  </main>;
}
