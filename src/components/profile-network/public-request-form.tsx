"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

type Kind = "CORRECTION"|"REMOVAL"|"CLAIM";
type SubjectKind = "COMPANY"|"PROFESSIONAL"|"EDITOR";

export function PublicProfileRequestForm({ initialKind, initialSubjectKind, initialSlug }: {
  initialKind: Kind;
  initialSubjectKind: SubjectKind;
  initialSlug: string;
}) {
  const [kind,setKind] = useState<Kind>(initialKind);
  const [subjectKind,setSubjectKind] = useState<SubjectKind>(initialSubjectKind);
  const [slug,setSlug] = useState(initialSlug);
  const [description,setDescription] = useState("");
  const [sourceUrl,setSourceUrl] = useState("");
  const [contactEmail,setContactEmail] = useState("");
  const [website,setWebsite] = useState("");
  const [loading,setLoading] = useState(false);
  const [notice,setNotice] = useState("");
  const [submitted,setSubmitted] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice("");
    setLoading(true);
    try {
      const result = await fetch("/api/v1/profile-network/requests", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify({
          kind,subjectKind,subjectSlug:slug.trim(),
          description:description.trim(),sourceUrl:sourceUrl.trim() || null,
          contactEmail:contactEmail.trim() || null,website,
        }),
      });
      const body: unknown = await result.json().catch(() => null);
      if (!result.ok) {
        setNotice(`Unable to submit at this time (status ${result.status}). No request was confirmed.`);
        return;
      }
      if (body && typeof body === "object" && "message" in body && typeof body.message === "string") {
        setNotice(body.message);
      } else {
        setNotice("If eligible, your request has entered editorial review.");
      }
      setSubmitted(true);
    } catch {
      setNotice("The editorial request service is not available right now. Please use our contact page.");
    } finally {
      setLoading(false);
    }
  }

  return <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-20">
    <div className="mb-7 text-xs font-semibold uppercase tracking-[0.14em] text-accent">The Perspective / Editorial accountability</div>
    <h1 className="type-h1">Request a profile correction, removal or relationship review</h1>
    <p className="mt-6 leading-relaxed text-muted">
      We review requests independently. Submitting an identity or company claim does not verify the claimant,
      grant editing rights, or influence our editorial coverage.
      Please do not upload identity documents or share financial, medical, or other sensitive information here.
    </p>
    {notice ? <p role="status" className="mt-8 rounded-lg border border-border bg-surface p-5">{notice}</p> : null}
    {submitted ? <div className="mt-6"><Link className="font-semibold text-accent underline" href="/">Return to The Perspective</Link></div> :
      <form className="mt-9 grid gap-5 rounded-lg border border-border bg-surface p-6 sm:p-9" onSubmit={(event) => {void submit(event);}}>
        <label className="grid gap-1 text-sm font-semibold">Request type
          <select value={kind} onChange={(event) => setKind(event.target.value as Kind)} className="min-h-12 rounded-md border border-border bg-background p-3">
            <option value="CORRECTION">Correct factual information</option>
            <option value="REMOVAL">Request a privacy/removal review</option>
            <option value="CLAIM">Request review of my relationship to a profile</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Profile category
          <select value={subjectKind} onChange={(event) => setSubjectKind(event.target.value as SubjectKind)} className="min-h-12 rounded-md border border-border bg-background p-3">
            <option value="COMPANY">Company</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="EDITOR">Editor</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Profile identifier
          <input required value={slug} onChange={(event) => setSlug(event.target.value)} maxLength={100} minLength={2} pattern="[a-z0-9]+(-[a-z0-9]+)*" placeholder="profile-slug" className="min-h-12 rounded-md border border-border bg-background p-3" />
          <span className="text-xs font-normal text-muted">The final part of the published profile URL.</span>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Details of your request
          <textarea required value={description} onChange={(event) => setDescription(event.target.value)} minLength={30} maxLength={2000} rows={6} className="rounded-md border border-border bg-background p-3" placeholder="Explain the fact to correct or the reason for the relationship/privacy review; include public evidence if available."/>
        </label>
        <label className="grid gap-1 text-sm font-semibold">Supporting public source (optional HTTPS)
          <input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.org/source" className="min-h-12 rounded-md border border-border bg-background p-3" />
        </label>
        <label className="grid gap-1 text-sm font-semibold">Reply email {kind === "CLAIM" ? "(required for claim review)" : "(optional)"}
          <input type="email" required={kind === "CLAIM"} maxLength={254} value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} className="min-h-12 rounded-md border border-border bg-background p-3" />
          <span className="text-xs font-normal text-muted">Private to the editorial team. A submitted email does not prove identity or affiliation.</span>
        </label>
        <div className="sr-only" aria-hidden="true">
          <label>Website verification<input tabIndex={-1} name="website" value={website} onChange={(event) => setWebsite(event.target.value)} autoComplete="off" /></label>
        </div>
        <p className="text-sm leading-relaxed text-muted">
          Request information is privately reviewed, with an intended 90-day retention window pending operational deletion checks.
          Requests may be declined or require more evidence. For sensitive concerns, use our <Link href="/contact" className="text-accent underline">contact page</Link>.
        </p>
        <button type="submit" disabled={loading} className="min-h-12 rounded-md bg-foreground px-6 font-semibold text-surface disabled:opacity-60">
          {loading ? "Submitting…" : "Submit for editorial review"}
        </button>
      </form>}
  </main>;
}
