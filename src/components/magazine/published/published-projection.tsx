import Link from "next/link";

import type { PublishedArticleCard, PublishedIssueCard, PublishedShelfCard } from "@/modules/r9/projection";
import { publicSlug } from "@/modules/r9/projection";

export function PublishedEditionBand({ issues, heading }: { issues: readonly PublishedIssueCard[]; heading: string }) {
  if (issues.length === 0) return null;
  return (
    <section aria-label={heading} className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="text-2xl font-semibold">{heading}</h2>
      <ul className="mt-4 grid gap-4">
        {issues.map((issue) => (
          <li className="rounded border p-4" key={issue.slug}>
            <p className="text-sm uppercase tracking-wide">{issue.availability === "PREMIUM" ? "Premium" : "Public"} · Edition {issue.editionNumber} · {issue.state === "ISSUE_ARCHIVED" ? "Archived" : "Published"}</p>
            <h3 className="mt-1 text-xl font-semibold"><Link href={`/magazine/read/${issue.slug}`}>{issue.title}</Link></h3>
            <p className="mt-2">{issue.cover.headline}</p>
            <p>{issue.cover.dek}</p>
            <p className="text-sm">{issue.cover.alt}</p>
            <ul className="mt-3 grid gap-1">
              {issue.articles.map((article) => (
                <li key={article.slug}><Link href={`/article/${article.slug}`}>{article.title}</Link> <span>— {article.author}</span></li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PublishedShelfView({ shelf }: { shelf: PublishedShelfCard }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm uppercase tracking-wide">Personal magazine</p>
      <h1 className="mt-2 text-4xl font-semibold">{shelf.name}</h1>
      {shelf.description ? <p className="mt-4">{shelf.description}</p> : null}
      {shelf.principles ? <p className="mt-2">{shelf.principles}</p> : null}
      <h2 className="mt-8 text-2xl font-semibold">Published stories</h2>
      {shelf.stories.length === 0 ? <p className="mt-3">No published story is on this shelf.</p> : (
        <ul className="mt-3 grid gap-2">
          {shelf.stories.map((story) => (
            <li key={story.slug}><Link href={`/article/${story.slug}`}>{story.title}</Link></li>
          ))}
        </ul>
      )}
    </article>
  );
}

export function PublishedAuthorView({ name, articles }: { name: string; articles: readonly PublishedArticleCard[] }) {
  const canonical = `/author/${publicSlug(name)}`;
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: canonical,
    mainEntity: { "@type": "Person", name },
  };
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} type="application/ld+json" />
      <p className="text-sm uppercase tracking-wide">Contributor</p>
      <h1 className="mt-2 text-4xl font-semibold">{name}</h1>
      <h2 className="mt-8 text-2xl font-semibold">Published stories</h2>
      <ul className="mt-3 grid gap-2">
        {articles.map((article) => (
          <li key={article.slug}><Link href={`/article/${article.slug}`}>{article.title}</Link><p>{article.summary}</p></li>
        ))}
      </ul>
    </article>
  );
}

export function PublishedPathList({ paths }: { paths: readonly string[] }) {
  if (paths.length === 0) return null;
  return (
    <section aria-label="Published paths" className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="text-2xl font-semibold">Published paths</h2>
      <ul className="mt-3 grid gap-1">
        {paths.map((path) => <li key={path}><Link href={path}>{path}</Link></li>)}
      </ul>
    </section>
  );
}

export function PublishedShelfIndex({ shelves }: { shelves: readonly { slug: string; name: string }[] }) {
  if (shelves.length === 0) return null;
  return (
    <section aria-label="Published personal magazines" className="mx-auto max-w-5xl px-4 py-8">
      <h2 className="text-2xl font-semibold">Published personal magazines</h2>
      <ul className="mt-3 grid gap-1">
        {shelves.map((shelf) => <li key={shelf.slug}><Link href={`/personal-magazines/${shelf.slug}`}>{shelf.name}</Link></li>)}
      </ul>
    </section>
  );
}
