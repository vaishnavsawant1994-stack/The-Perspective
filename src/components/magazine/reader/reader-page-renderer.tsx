import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatMagazineIssueDate } from "@/lib/magazine-issue-date";
import type { MagazineIssue, MagazineReaderContentEntry, ResolvedMagazinePage } from "@/types";

type ReaderPageRendererProps = {
  page: ResolvedMagazinePage;
  issue: MagazineIssue;
  pageCount: number;
  contents: readonly MagazineReaderContentEntry[];
};

function pageLabel(page: ResolvedMagazinePage, total: number) {
  return `Page ${page.pageNumber} of ${total} — ${page.label}`;
}

function ArticleLink({ page }: { page: ResolvedMagazinePage }) {
  if (!page.article) return null;
  return <Link className="reader-story-link" href={`/article/${page.article.slug}`}>Read Full Story <ArrowRight aria-hidden="true" className="size-4" /></Link>;
}

export function ReaderPageRenderer({ page, issue, pageCount, contents }: ReaderPageRendererProps) {
  const ariaLabel = pageLabel(page, pageCount);
  const issueDate = formatMagazineIssueDate(issue.publicationDate);

  switch (page.type) {
    case "cover":
      return <article aria-label={ariaLabel} className="reader-page reader-cover-page">
        {issue.coverImage ? <Image alt={issue.coverImage.alt} className="object-cover" fill priority sizes="(max-width: 767px) 100vw, 720px" src={issue.coverImage.src} /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/10 to-black/85" />
        <div className="reader-cover-top"><p className="font-serif text-[clamp(1.75rem,5vw,3.8rem)] leading-none">THE PERSPECTIVE</p><p className="mt-3 text-xs font-bold uppercase tracking-[.2em]">{issueDate} · Issue {String(issue.issueNumber).padStart(2, "0")}</p></div>
        <div className="reader-cover-bottom"><p className="text-xs font-bold uppercase tracking-[.18em] text-[#f1ce87]">{issue.coverKicker}</p><h2 className="mt-4 max-w-xl font-serif text-[clamp(3rem,8vw,6.5rem)] leading-[.82] tracking-[-.055em]">{issue.coverHeadline}</h2><ul className="mt-8 space-y-2 border-t border-white/45 pt-5 text-sm text-white/85">{page.supportingLines.map((line) => <li key={line}>{line}</li>)}</ul></div>
      </article>;

    case "contents": {
      const midpoint = Math.ceil(contents.length / 2);
      const entries = page.part === 1 ? contents.slice(0, midpoint) : contents.slice(midpoint);
      return <article aria-label={ariaLabel} className="reader-page reader-paper-page reader-page-padding">
        <div className="reader-folio"><span>The Perspective</span><span>{page.pageNumber}</span></div>
        <p className="reader-eyebrow">Inside the Issue · {page.part} of 2</p>
        <h2 className="reader-display-heading">Contents</h2>
        <ol className="mt-8 border-t-2 border-foreground sm:mt-12">{entries.map((entry) => <li className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-4 border-b border-border py-4 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:py-6" key={entry.id}><span className="font-serif text-2xl text-accent sm:text-3xl">{String(entry.pageNumber).padStart(2, "0")}</span><div><p className="reader-eyebrow text-muted">{entry.sectionId ?? "Issue"}</p><p className="mt-1 font-serif text-xl leading-tight sm:text-3xl">{entry.label}</p></div></li>)}</ol>
      </article>;
    }

    case "editorial":
      return <article aria-label={ariaLabel} className="reader-page reader-paper-page reader-page-padding">
        <div className="reader-folio"><span>The Perspective</span><span>{page.pageNumber}</span></div>
        <p className="reader-eyebrow text-accent">{page.eyebrow}</p><h2 className="reader-display-heading mt-5 max-w-xl">{page.title}</h2>
        <div className="reader-copy mt-8 max-w-2xl space-y-5 sm:mt-12 sm:columns-2 sm:gap-10">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        <p className="mt-10 border-t border-foreground pt-5 font-serif text-xl italic">{page.signoff}</p>
      </article>;

    case "section":
      return <article aria-label={ariaLabel} className="reader-page reader-section-page">
        {page.image ? <Image alt={page.image.alt} className="object-cover" fill priority sizes="(max-width: 767px) 100vw, 720px" src={page.image.src} /> : null}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/35 to-black/90" />
        <div className="relative z-10 flex min-h-full flex-col justify-end p-7 text-white sm:p-12 lg:p-16"><p className="reader-eyebrow text-[#f1ce87]">Section · {String(page.pageNumber).padStart(2, "0")}</p><h2 className="mt-4 font-serif text-[clamp(3.5rem,10vw,7.5rem)] leading-[.82] tracking-[-.06em]">{page.title}</h2><p className="mt-7 max-w-lg border-t border-white/50 pt-5 font-serif text-xl leading-snug text-white/85 sm:text-3xl">{page.description}</p></div>
      </article>;

    case "feature":
      return <article aria-label={ariaLabel} className="reader-page reader-paper-page overflow-hidden">
        <div className="grid min-h-full md:grid-rows-[.55fr_.45fr]">
          <div className="relative min-h-72 md:min-h-0">{page.image ? <Image alt={page.image.alt} className="object-cover" fill priority sizes="(max-width: 767px) 100vw, 720px" src={page.image.src} /> : null}<div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" /></div>
          <div className="p-7 sm:p-10 lg:p-12"><div className="reader-folio"><span>{page.kicker ?? page.article?.category.name}</span><span>{page.pageNumber}</span></div><h2 className="mt-6 font-serif text-[clamp(2.6rem,7vw,5.5rem)] leading-[.86] tracking-[-.055em]">{page.article?.title ?? page.label}</h2><p className="mt-6 max-w-2xl font-serif text-xl leading-snug text-muted sm:text-2xl">{page.introduction ?? page.article?.dek ?? page.article?.excerpt}</p>{page.article?.authors[0] ? <p className="reader-eyebrow mt-7">By {page.article.authors[0].name}</p> : null}</div>
        </div>
      </article>;

    case "article":
      return <article aria-label={ariaLabel} className="reader-page reader-paper-page reader-page-padding">
        <div className="reader-folio"><span>{page.article?.category.name ?? page.label}</span><span>{page.pageNumber}</span></div>
        {page.heading ? <h2 className="reader-article-heading">{page.heading}</h2> : <h2 className="sr-only">{page.label}</h2>}
        <div className="reader-copy mt-7 max-w-2xl space-y-5 sm:mt-10">{page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        {page.pullQuote ? <blockquote className="mt-8 border-y border-accent py-6 font-serif text-2xl leading-tight text-accent sm:mt-12 sm:py-8 sm:text-4xl">“{page.pullQuote}”</blockquote> : null}
        {page.showArticleLink ? <div className="mt-8"><ArticleLink page={page} /></div> : null}
      </article>;

    case "quote":
      return <article aria-label={ariaLabel} className="reader-page flex flex-col justify-between bg-accent p-8 text-white sm:p-14 lg:p-16"><div className="reader-folio border-white/45 text-white/75"><span>Interlude</span><span>{page.pageNumber}</span></div><div className="my-auto"><span className="font-serif text-7xl leading-none text-white/35">“</span><h2 className="max-w-2xl font-serif text-[clamp(2.75rem,7vw,5.75rem)] leading-[.92] tracking-[-.045em]">{page.quote}</h2><p className="reader-eyebrow mt-9 text-white/75">{page.attribution}</p></div></article>;

    case "image":
      return <article aria-label={ariaLabel} className="reader-page reader-paper-page overflow-hidden"><div className="grid min-h-full md:grid-rows-[.68fr_.32fr]"><figure className="relative min-h-80 md:min-h-0">{page.image ? <Image alt={page.image.alt} className="object-cover" fill priority sizes="(max-width: 767px) 100vw, 720px" src={page.image.src} /> : null}<figcaption className="absolute inset-x-0 bottom-0 bg-black/70 p-4 text-xs leading-5 text-white sm:px-7">{page.caption}</figcaption></figure><div className="p-7 sm:p-10"><div className="reader-folio"><span>{page.article?.category.name}</span><span>{page.pageNumber}</span></div><h2 className="mt-5 font-serif text-3xl leading-none sm:text-5xl">{page.title}</h2><p className="reader-copy mt-5 max-w-2xl">{page.context}</p></div></div></article>;

    case "end":
      return <article aria-label={ariaLabel} className="reader-page flex flex-col justify-between bg-[#181713] p-8 text-white sm:p-14 lg:p-16"><div className="reader-folio border-white/30 text-white/65"><span>{issueDate}</span><span>{page.pageNumber}</span></div><div className="my-auto"><p className="reader-eyebrow text-[#f1ce87]">The Perspective Magazine</p><h2 className="mt-5 max-w-2xl font-serif text-[clamp(3.2rem,9vw,7rem)] leading-[.84] tracking-[-.06em]">{page.title}</h2><p className="mt-7 max-w-xl font-serif text-xl leading-relaxed text-white/75 sm:text-3xl">{page.body}</p><div className="mt-10 flex flex-wrap gap-4"><Link className="inline-flex min-h-12 items-center bg-[#f1ce87] px-5 text-sm font-bold text-foreground" href="/magazine">Return to Magazine</Link><Link className="inline-flex min-h-12 items-center border border-white/55 px-5 text-sm font-bold" href={`/magazine/read/${issue.slug}?view=text&page=${page.pageNumber}`}>Read Accessible View</Link></div></div><p className="font-serif text-2xl">THE PERSPECTIVE</p></article>;

    default: {
      const exhaustive: never = page;
      return exhaustive;
    }
  }
}
