import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { MagazineIssue, ResolvedMagazinePage, ResolvedMagazineReaderIssue } from "@/types";

function StoryLink({ page }: { page: ResolvedMagazinePage }) {
  return page.article ? <Link className="inline-flex min-h-11 items-center gap-2 border-b border-foreground text-sm font-bold hover:text-accent" href={`/article/${page.article.slug}`}>Read Full Story <ArrowRight aria-hidden="true" className="size-4" /></Link> : null;
}

function TextPage({ page, issue }: { page: ResolvedMagazinePage; issue: MagazineIssue }) {
  if (page.type === "contents") return null;

  const wrapper = "border-t border-border py-10 sm:py-14";
  const pageNumber = <p className="type-meta mb-5 text-muted">Page {page.pageNumber} · {page.label}</p>;

  switch (page.type) {
    case "cover":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<h2 className="type-h2" id={`text-page-${page.pageNumber}`}><span className="sr-only">Page 1: </span>{issue.coverHeadline}</h2><p className="type-deck mt-6 text-muted">{issue.description}</p><ul className="mt-7 list-disc space-y-2 pl-6">{page.supportingLines.map((line) => <li key={line}>{line}</li>)}</ul></section>;
    case "editorial":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<p className="eyebrow text-accent">{page.eyebrow}</p><h2 className="type-h2 mt-4" id={`text-page-${page.pageNumber}`}>{page.title}</h2><div className="mt-7 space-y-5 text-lg leading-8">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div><p className="mt-7 font-serif text-xl italic">{page.signoff}</p></section>;
    case "section":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={`${wrapper} py-16 sm:py-20`} id={`page-${page.pageNumber}`}>{pageNumber}<p className="eyebrow text-accent">Section</p><h2 className="type-display-lg mt-4" id={`text-page-${page.pageNumber}`}>{page.title}</h2><p className="type-deck mt-6 text-muted">{page.description}</p></section>;
    case "feature":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<p className="eyebrow text-accent">{page.kicker ?? page.article?.category.name}</p><h3 className="type-h2 mt-4" id={`text-page-${page.pageNumber}`}>{page.article?.title ?? page.label}</h3><p className="type-deck mt-6 text-muted">{page.introduction ?? page.article?.dek ?? page.article?.excerpt}</p>{page.article?.authors[0] ? <p className="type-meta mt-6">By <Link className="hover:text-accent" href={`/author/${page.article.authors[0].slug}`}>{page.article.authors[0].name}</Link></p> : null}</section>;
    case "article":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<h3 className="type-h3" id={`text-page-${page.pageNumber}`}>{page.heading ?? page.label}</h3><div className="mt-7 space-y-5 text-lg leading-8">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>{page.pullQuote ? <blockquote className="my-9 border-l-4 border-accent pl-6 font-serif text-3xl leading-tight text-accent">“{page.pullQuote}”</blockquote> : null}{page.showArticleLink ? <StoryLink page={page} /> : null}</section>;
    case "quote":
      return <section aria-label={`Page ${page.pageNumber}: editorial quote`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<blockquote className="font-serif text-4xl leading-tight sm:text-5xl">“{page.quote}”<footer className="mt-6 font-sans text-sm font-bold uppercase tracking-[.12em] text-muted">{page.attribution}</footer></blockquote></section>;
    case "image":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<h3 className="type-h3" id={`text-page-${page.pageNumber}`}>{page.title}</h3>{page.image ? <figure className="mt-7"><Image alt={page.image.alt} className="h-auto w-full" height={page.image.height} sizes="(max-width: 768px) 100vw, 760px" src={page.image.src} width={page.image.width} /><figcaption className="mt-3 text-sm leading-6 text-muted">{page.caption}</figcaption></figure> : null}<p className="mt-6 text-lg leading-8">{page.context}</p></section>;
    case "end":
      return <section aria-labelledby={`text-page-${page.pageNumber}`} className={wrapper} id={`page-${page.pageNumber}`}>{pageNumber}<h2 className="type-h2" id={`text-page-${page.pageNumber}`}>{page.title}</h2><p className="type-deck mt-6 text-muted">{page.body}</p><Link className="mt-7 inline-flex min-h-12 items-center gap-2 bg-foreground px-5 text-sm font-bold text-white" href="/magazine">Return to Magazine <ArrowRight aria-hidden="true" className="size-4" /></Link></section>;
    default: {
      const exhaustive: never = page;
      return exhaustive;
    }
  }
}

export function MagazineTextReader({ reader, initialPage }: { reader: ResolvedMagazineReaderIssue; initialPage: number }) {
  const readerHref = initialPage > 1 ? `/magazine/read/${reader.issue.slug}?page=${initialPage}` : `/magazine/read/${reader.issue.slug}`;
  const issueDate = formatMagazineIssueDate(reader.issue.publicationDate);
  return <article className="min-h-dvh bg-surface" data-reader-shell>
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 backdrop-blur"><div className="mx-auto flex min-h-16 max-w-5xl items-center justify-between gap-4 px-5 sm:px-8"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-bold" href="/magazine"><ArrowLeft aria-hidden="true" className="size-4" /> Magazine</Link><p className="hidden font-serif text-lg sm:block">Accessible Reading View</p><Link className="inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold" href={readerHref}>Visual Reader</Link></div></header>
    <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-18">
      <p className="eyebrow text-accent">The Perspective Magazine · {issueDate}</p><h1 className="type-h1 mt-5">{reader.issue.title}</h1><p className="type-deck mt-7 text-muted">{reader.issue.description}</p>
      <nav aria-label="Issue contents" className="mt-12 border-y border-foreground py-6"><h2 className="eyebrow">Contents</h2><ol className="mt-4 grid gap-x-8 sm:grid-cols-2">{reader.contents.map((entry) => <li className="border-t border-border" key={entry.id}><a className="grid min-h-14 grid-cols-[2.5rem_1fr] items-center gap-3 py-2 hover:text-accent" href={`#page-${entry.pageNumber}`}><span className="font-serif text-xl">{entry.pageNumber}</span><span className="font-serif text-lg leading-tight">{entry.label}</span></a></li>)}</ol></nav>
      <div>{reader.pages.map((page) => <TextPage issue={reader.issue} key={page.id} page={page} />)}</div>
    </div>
  </article>;
}
