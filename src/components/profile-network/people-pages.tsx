import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { getPublicPerson, getPublicPersonRelationships, searchPublicPeople } from "@/modules/profile-network/person-read";
import type { PublicPersonKind } from "@/modules/profile-network/person-schema";

const info = {
  PROFESSIONAL: {
    title: "Professional profiles",
    singular: "Professional profile",
    base: "/professionals",
    summary: "Independent profiles of founders, executives and other professionals, with editorial citations and disclosures.",
  },
  EDITOR: {
    title: "Editor profiles",
    singular: "Editor profile",
    base: "/editors",
    summary: "Meet editors and the work they are independently credited with, based on source-backed editorial records.",
  },
} as const;

type DirectoryParams = { q?: string | string[] };

function getQuery(params: DirectoryParams) {
  return typeof params.q === "string" ? params.q.slice(0, 81).trim() : "";
}

export async function peopleDirectoryMetadata(kind: PublicPersonKind, searchParams: Promise<DirectoryParams>): Promise<Metadata> {
  const config = info[kind];
  const q = getQuery(await searchParams);
  const published = await searchPublicPeople(kind, q);
  return {
    title: config.title,
    description: config.summary,
    alternates: { canonical: config.base },
    robots: { index: q.length === 0 && published.length > 0, follow: true },
    openGraph: { title: config.title, description: config.summary, url: config.base, siteName: siteConfig.name, type: "website" },
  };
}

export async function PublicPeopleDirectory({ kind, searchParams }: {
  kind: PublicPersonKind;
  searchParams: Promise<DirectoryParams>;
}) {
  const config = info[kind];
  const query = getQuery(await searchParams);
  const people = await searchPublicPeople(kind, query);
  return <main className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-20">
    <div className="mb-8 text-xs font-semibold uppercase tracking-[0.16em] text-accent">The Perspective / Profile Network</div>
    <header className="max-w-3xl">
      <h1 className="type-display-lg">{config.title}</h1>
      <p className="mt-6 text-lg leading-relaxed text-muted">{config.summary} A listing is not an identity verification or endorsement.</p>
    </header>
    <form method="get" action={config.base} role="search" className="my-10 flex max-w-xl flex-col gap-3 sm:flex-row">
      <label htmlFor="profile-search" className="sr-only">Search published {config.title.toLowerCase()}</label>
      <input name="q" id="profile-search" type="search" defaultValue={query} maxLength={80} placeholder="Search name or organization" className="min-h-12 flex-1 rounded-md border border-border bg-surface px-4" />
      <button type="submit" className="min-h-12 rounded-md bg-foreground px-6 font-semibold text-surface">Search</button>
    </form>
    {people.length === 0
      ? <section aria-live="polite" className="max-w-2xl rounded-lg border border-border bg-surface p-8">
        <h2 className="text-xl font-semibold">{query ? "No matching profiles" : "No published profiles yet"}</h2>
        <p className="mt-4 leading-relaxed text-muted">Only independently reviewed, source-backed profiles appear here. No account or CRM information is automatically published.</p>
        {query ? <Link href={config.base} className="mt-5 inline-block font-semibold text-accent underline">Clear search</Link> : null}
      </section>
      : <section aria-label={config.title}>
        <ul className="grid gap-5 md:grid-cols-2">
          {people.map((person) => <li key={person.slug} className="rounded-lg border border-border bg-surface p-7">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-accent">{person.headline || config.singular}</p>
            <h2 className="type-h3"><Link href={`${config.base}/${person.slug}`} className="hover:underline">{person.name}</Link></h2>
            <p className="mt-3 leading-relaxed text-muted">{person.summary}</p>
            {person.organizationName ? <p className="mt-4 text-sm text-muted">Organization: {person.organizationName}</p> : null}
            {person.disclosureKind !== "NONE" ? <p className="mt-4 font-semibold text-accent">Commercial disclosure: {person.disclosureKind.toLowerCase()}</p> : null}
            <Link href={`${config.base}/${person.slug}`} className="mt-5 inline-block font-semibold text-accent underline">Read profile</Link>
          </li>)}
        </ul>
      </section>}
    <p className="mt-14 max-w-3xl border-t border-border pt-7 text-sm leading-relaxed text-muted">
      These independently curated editorial profiles do not establish personal identity, employment or organizational endorsement.
      <Link href="/contact" className="ml-1 font-semibold text-accent underline">Request a correction or removal</Link>.
    </p>
  </main>;
}

export async function peopleProfileMetadata(kind: PublicPersonKind, params: Promise<{ slug: string }>): Promise<Metadata> {
  const { slug } = await params;
  const person = await getPublicPerson(kind, slug);
  if (!person) notFound();
  const url = `${info[kind].base}/${person.slug}`;
  const title = `${person.name} | ${info[kind].singular}`;
  return {
    title,
    description: person.summary,
    alternates: { canonical: url },
    openGraph: { title, description: person.summary, url, siteName: siteConfig.name, type: "profile" },
  };
}

export async function PublicPersonDetail({ kind, params }: { kind: PublicPersonKind; params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const person = await getPublicPerson(kind, slug);
  if (!person) notFound();
  const relationships = await getPublicPersonRelationships(kind, slug);
  const base = info[kind].base;
  const url = new URL(`${base}/${person.slug}`, siteConfig.url).href;
  const structured = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${person.name} ${info[kind].singular.toLowerCase()}`,
    url,
    dateModified: person.approvedAt,
    mainEntity: { "@type": "Person", name: person.name, description: person.summary, url: person.websiteUrl || url },
  };

  return <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structured).replace(/</g, "\\u003c") }} />
    <nav aria-label="Breadcrumb" className="mb-10 text-sm">
      <Link href={base} className="font-semibold text-accent underline">{info[kind].title}</Link>
      <span aria-hidden="true"> / </span><span>{person.name}</span>
    </nav>
    <header className="border-b border-border pb-10">
      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{person.headline || info[kind].singular}</p>
      <h1 className="type-display-lg">{person.name}</h1>
      <p className="mt-7 max-w-3xl text-xl leading-relaxed text-muted">{person.summary}</p>
      {person.organizationName ? <p className="mt-5 text-muted">Associated organization: {person.organizationName}</p> : null}
      {person.websiteUrl ? <a href={person.websiteUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block font-semibold text-accent underline">External website</a> : null}
    </header>
    {person.disclosureKind !== "NONE" ? <aside aria-label="Commercial disclosure" className="mt-10 rounded-lg border border-accent p-6">
      <h2 className="font-semibold">Commercial disclosure: {person.disclosureKind.toLowerCase()}</h2>
      <p className="mt-3">{person.disclosureText}</p>
    </aside> : null}
    {person.biography ? <section className="mt-12 max-w-3xl" aria-labelledby="profile-biography">
      <h2 id="profile-biography" className="type-h2">Biography</h2>
      <p className="mt-6 whitespace-pre-line leading-relaxed">{person.biography}</p>
    </section> : null}
    {relationships.length > 0 ? <section className="mt-12" aria-labelledby="profile-connections">
      <h2 id="profile-connections" className="type-h2">Reviewed company connections</h2>
      <ul className="mt-6 grid gap-4 md:grid-cols-2">
        {relationships.map((connection) => <li key={`${connection.companySlug}:${connection.role}`} className="rounded-lg border border-border bg-surface p-6">
          <h3 className="font-semibold"><Link href={`/companies/${connection.companySlug}`} className="text-accent underline">{connection.companyName}</Link></h3>
          <p className="mt-2 text-sm text-muted">{connection.role}</p>
          <a href={connection.sourceUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-4 inline-block text-sm font-semibold text-accent underline">View relationship source</a>
        </li>)}
      </ul>
    </section> : null}
    {person.coverage.length > 0 ? <section className="mt-12" aria-labelledby="profile-coverage">
      <h2 id="profile-coverage" className="type-h2">Published coverage</h2>
      <ul className="mt-5 space-y-4">
        {person.coverage.map((item) => <li key={item.href}>
          <span className="mr-3 text-xs uppercase tracking-[0.12em] text-muted">{item.kind}</span>
          <Link href={item.href} className="font-semibold text-accent underline">{item.title}</Link>
        </li>)}
      </ul>
    </section> : null}
    <section aria-labelledby="profile-sources" className="mt-14 max-w-3xl border-t border-border pt-10">
      <h2 id="profile-sources" className="type-h2">Sources &amp; editorial notes</h2>
      <p className="mt-5 leading-relaxed text-muted">Last reviewed <time dateTime={person.approvedAt}>{new Date(person.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>. This profile does not constitute an endorsement or independently verified identity claim.</p>
      <ol className="mt-5 list-decimal space-y-3 pl-6">
        {person.sources.map((source,index) => <li key={`${index}:${source.url}`}>
          <a href={source.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-accent underline">{source.label}</a>
          <span className="ml-2 text-sm text-muted">Accessed <time dateTime={source.capturedAt}>{new Date(source.capturedAt).toLocaleDateString("en-IN")}</time></span>
        </li>)}
      </ol>
      <p className="mt-7 text-sm text-muted">To request a correction, removal, or other privacy review, <Link href="/contact" className="font-semibold text-accent underline">contact the editorial team</Link>.</p>
    </section>
  </main>;
}
