import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";

import { siteConfig } from "@/config/site";
import { searchPublicCompanies } from "@/modules/profile-network/read";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string | string[] }> };

function requestedQuery(params: { q?: string | string[] }) {
  return typeof params.q === "string" ? params.q.trim().slice(0, 81) : "";
}

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const query = requestedQuery(await searchParams);
  return {
    title: "Company profiles",
    description: "Source-backed company profiles independently reviewed by The Perspective.",
    alternates: { canonical: "/companies" },
    openGraph: { title: "Company profiles | The Perspective", url: "/companies", type: "website", siteName: siteConfig.name },
    robots: { index: query.length === 0, follow: true },
  };
}

function CompanyDirectoryFallback() {
  return <p role="status" aria-live="polite" className="max-w-2xl rounded-lg border border-border bg-surface p-8 text-muted">Loading approved company profiles...</p>;
}

async function CompanyDirectoryResults({ searchParams }: Props) {
  const query = requestedQuery(await searchParams);
  const companies = await searchPublicCompanies(query);
  return (
    <>
      <form action="/companies" method="get" role="search" className="mb-12 flex max-w-xl flex-col gap-3 sm:flex-row">
        <label htmlFor="company-search" className="sr-only">Search published company profiles</label>
        <input
          id="company-search"
          type="search"
          name="q"
          maxLength={80}
          defaultValue={query}
          placeholder="Search company or industry"
          className="min-h-12 flex-1 rounded-md border border-border bg-surface px-4 text-foreground"
        />
        <button type="submit" className="min-h-12 rounded-md bg-foreground px-6 font-semibold text-surface">Search</button>
      </form>
      {companies.length === 0 ? (
        <section aria-live="polite" className="max-w-2xl rounded-lg border border-border bg-surface p-8">
          <h2 className="text-xl font-semibold">No published profiles {query ? "match your search" : "yet"}</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {query
              ? "Try another company or industry. Only approved, source-backed profiles appear here."
              : "Profiles are added only after editorial review and source checking. We do not automatically publish CRM contacts or unverified company claims."}
          </p>
          {query ? <Link className="mt-5 inline-block font-semibold text-accent underline" href="/companies">Clear search</Link> : null}
        </section>
      ) : (
        <section aria-label="Published company profiles">
          <p className="mb-5 text-sm text-muted">Showing up to {companies.length} published profiles</p>
          <ul className="grid gap-5 md:grid-cols-2">
            {companies.map((company) => (
              <li key={company.slug} className="rounded-lg border border-border bg-surface p-7">
                <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{company.industry || "Company profile"}</div>
                <h2 className="type-h3"><Link href={`/companies/${company.slug}`} className="hover:underline">{company.name}</Link></h2>
                <p className="mt-3 leading-relaxed text-muted">{company.summary}</p>
                {company.headquarters ? <p className="mt-4 text-sm text-muted">Location: {company.headquarters}</p> : null}
                {company.disclosureKind !== "NONE" ? <p className="mt-4 font-semibold text-accent">Commercial disclosure: {company.disclosureKind.toLowerCase()}</p> : null}
                <Link className="mt-6 inline-block font-semibold text-accent underline" href={`/companies/${company.slug}`}>Read profile</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

export default function CompanyDirectory({ searchParams }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
      <div className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent">The Perspective / Profile Network</div>
      <header className="mb-10 max-w-3xl">
        <h1 className="type-display-lg text-foreground">Company profiles</h1>
        <p className="mt-6 text-lg leading-relaxed text-muted">
          Independently curated company backgrounds, source references and published perspectives.
          A listing is not an endorsement or a statement of commercial affiliation.
        </p>
      </header>
      <Suspense fallback={<CompanyDirectoryFallback />}>
        <CompanyDirectoryResults searchParams={searchParams} />
      </Suspense>
      <aside className="mt-14 max-w-3xl border-t border-border pt-7 text-sm leading-relaxed text-muted">
        About these profiles: every published profile has a reviewed snapshot and attributable citations.
        An identity or business relationship is not independently verified merely by appearing here.
        To request a correction or removal, use our <Link className="font-semibold text-accent underline" href="/contact">contact page</Link>.
      </aside>
    </div>
  );
}
