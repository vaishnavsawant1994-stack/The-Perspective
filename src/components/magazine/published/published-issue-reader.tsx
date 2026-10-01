"use client";

import { useEffect, useState } from "react";

export interface PublishedArticle {
  slug: string;
  title: string;
  author: string;
  summary: string;
  alt: string;
  body: string;
  digest: string;
  versionId: string;
}

export interface PublishedIssue {
  slug: string;
  title: string;
  season: string;
  theme: string;
  availability: string;
  state: string;
  editionNumber: number;
  cover: { headline: string; dek: string; alt: string };
  articles: PublishedArticle[];
}

export function PublishedIssueReader({ issue }: { issue: PublishedIssue }) {
  const pages = [
    { kind: "Cover", title: issue.cover.headline, body: issue.cover.dek, alt: issue.cover.alt },
    { kind: "Contents", title: issue.title, body: issue.articles.map((article) => article.title).join("\n"), alt: issue.title },
    ...issue.articles.map((article) => ({ kind: "Article", title: article.title, body: article.body, alt: article.alt })),
  ];
  const [page, setPage] = useState(0);
  const [typeSize, setTypeSize] = useState(18);
  const [fullscreen, setFullscreen] = useState(false);
  const current = pages[page] ?? pages[0];

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") setPage((value) => Math.min(pages.length - 1, value + 1));
      if (event.key === "ArrowLeft") setPage((value) => Math.max(0, value - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pages.length]);

  return (
    <article className={fullscreen ? "fixed inset-0 z-50 overflow-auto bg-white p-6 text-neutral-950" : "mx-auto max-w-3xl px-4 py-8 text-neutral-950"}>
      <header className="mb-6 flex flex-wrap items-center gap-2">
        <p className="mr-auto text-sm uppercase tracking-wide">{issue.season} · Edition {issue.editionNumber}</p>
        <button type="button" className="rounded border px-3 py-2" onClick={() => setTypeSize((size) => Math.max(14, size - 2))}>Smaller type</button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => setTypeSize((size) => Math.min(28, size + 2))}>Larger type</button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => setFullscreen((value) => !value)}>{fullscreen ? "Exit fullscreen" : "Fullscreen"}</button>
      </header>
      <h1 className="mb-2 text-3xl font-semibold">{issue.title}</h1>
      <p className="mb-6 text-neutral-700">{issue.theme}</p>
      <section aria-label={`Page ${page + 1} of ${pages.length}`} style={{ fontSize: typeSize }}>
        <p className="text-xs uppercase tracking-wide text-neutral-500">{current?.kind}</p>
        <h2 className="mt-2 text-2xl">{current?.title}</h2>
        <p className="mt-4 whitespace-pre-wrap leading-relaxed">{current?.body}</p>
      </section>
      <nav aria-label="Reader pages" className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="rounded border px-3 py-2" onClick={() => setPage((value) => Math.max(0, value - 1))}>Previous page</button>
        <button type="button" className="rounded border px-3 py-2" onClick={() => setPage((value) => Math.min(pages.length - 1, value + 1))}>Next page</button>
        {pages.map((item, index) => (
          <button type="button" key={`${item.kind}-${index}`} aria-label={`Thumbnail ${index + 1}: ${item.title}`} className="rounded border px-2 py-1 text-xs" onClick={() => setPage(index)}>
            {index + 1}. {item.title}
          </button>
        ))}
      </nav>
    </article>
  );
}
