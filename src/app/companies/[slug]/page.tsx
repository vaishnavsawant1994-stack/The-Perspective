import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { siteConfig } from "@/config/site";
import { getPublicCompany } from "@/modules/profile-network/read";

export const dynamic = "force-dynamic";
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const company = await getPublicCompany(slug);
  if (!company) notFound();
  const title = `${company.name} | Company profile`;
  return {
    title,
    description: company.summary,
    alternates: { canonical: `/companies/${company.slug}` },
    openGraph: { title: `${title} | ${siteConfig.name}`, description: company.summary, type: "profile", siteName: siteConfig.name, url: `/companies/${company.slug}` },
  };
}

export default async function CompanyProfilePage({ params }: Props) {
  const { slug } = await params;
  const company = await getPublicCompany(slug);
  if (!company) notFound();
  const canonicalUrl = new URL(`/companies/${company.slug}`, siteConfig.url).href;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: `${company.name} company profile`,
    url: canonicalUrl,
    dateModified: company.approvedAt,
    mainEntity: {
      "@type": "Organization",
      name: company.name,
      description: company.summary,
      url: company.websiteUrl ?? canonicalUrl,
    },
  };

  return (
    <main className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
      <nav aria-label="Breadcrumb" className="mb-8 text-sm">
        <Link href="/companies" className="font-semibold text-accent underline">Company profiles</Link>
        <span aria-hidden="true"> / </span><span>{company.name}</span>
      </nav>
      <header className="border-b border-border pb-10">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.15em] text-accent">{company.industry || "Company profile"}</p>
        <h1 className="type-display-lg text-foreground">{company.name}</h1>
        <p className="mt-7 max-w-3xl text-xl leading-relaxed text-muted">{company.summary}</p>
        <div className="mt-6 flex flex-wrap gap-6 text-sm text-muted">
          {company.headquarters ? <span>Location: {company.headquarters}</span> : null}
          {company.websiteUrl ? <a className="font-semibold text-accent underline" href={company.websiteUrl} target="_blank" rel="noopener noreferrer nofollow">Official website (external)</a> : null}
        </div>
      </header>
      {company.disclosureKind !== "NONE" ? (
        <aside aria-label="Commercial disclosure" className="mt-9 rounded-lg border border-accent p-6">
          <h2 className="font-semibold">Commercial disclosure: {company.disclosureKind.toLowerCase()}</h2>
          <p className="mt-2 leading-relaxed">{company.disclosureText}</p>
        </aside>
      ) : null}
      {company.overview ? (
        <section aria-labelledby="company-overview" className="mt-12 max-w-3xl">
          <h2 id="company-overview" className="type-h2">Overview</h2>
          <p className="mt-6 whitespace-pre-line leading-relaxed">{company.overview}</p>
        </section>
      ) : null}
      <section aria-labelledby="profile-sources" className="mt-14 max-w-3xl border-t border-border pt-10">
        <h2 id="profile-sources" className="type-h2">Sources &amp; editorial notes</h2>
        <p className="mt-5 text-muted">This is an editorial profile, not a company verification badge or endorsement. Last reviewed: <time dateTime={company.approvedAt}>{new Date(company.approvedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</time>.</p>
        <ol className="mt-6 list-decimal space-y-3 pl-6">
          {company.sources.map((source, index) => (
            <li key={`${index}:${source.url}`}>
              <a className="font-semibold text-accent underline" href={source.url} target="_blank" rel="noopener noreferrer nofollow">{source.label}</a>
              <span className="ml-2 text-sm text-muted">Accessed <time dateTime={source.capturedAt}>{new Date(source.capturedAt).toLocaleDateString("en-IN")}</time></span>
            </li>
          ))}
        </ol>
        <p className="mt-8 text-sm text-muted">Found an error, outdated information or a privacy concern? <Link className="font-semibold text-accent underline" href={`/profile-requests?subjectKind=COMPANY&subjectSlug=${company.slug}`}>Request a correction or removal</Link>.</p>
      </section>
    </main>
  );
}
