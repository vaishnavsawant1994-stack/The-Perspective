import Image from "next/image";
import Link from "next/link";
import type { ArticleSearchResult, ContributorSearchResult, MagazineSearchResult, PersonSearchResult, SearchResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { formatEditorialDate } from "@/lib/editorial-date";

const initialsFor = (name: string) => name.split(" ").map((part) => part[0]).join("").slice(0, 2);

function ArticleResult({ result }: { result: ArticleSearchResult }) {
  return <article className="grid gap-5 border-t border-border py-7 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-7">
    {result.image && <Link aria-label={`Read ${result.title}`} className="relative hidden aspect-[4/3] overflow-hidden bg-surface-subtle sm:block" href={result.href}><Image alt="" className="object-cover" fill sizes="144px" src={result.image.src} /></Link>}
    <div className="min-w-0">
      <div className="flex flex-wrap items-center gap-2"><p className="type-meta text-accent">Article / {result.subcategory ?? result.category}</p>{result.premium && <Badge className="border-[#76551f] text-[#76551f]">Premium</Badge>}{result.breaking && <Badge className="border-accent text-accent">Breaking</Badge>}</div>
      <h3 className="mt-3 font-serif text-[clamp(1.4rem,2.5vw,2rem)] leading-tight"><Link className="hover:text-accent" href={result.href}>{result.title}</Link></h3>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{result.description}</p>
      <p className="type-meta mt-5 text-muted"><Link className="font-semibold text-foreground hover:text-accent" href={`/author/${result.authorSlug}`}>{result.authorName}</Link> <span aria-hidden="true">·</span> <time dateTime={result.publishedAt}>{formatEditorialDate(result.publishedAt)}</time> <span aria-hidden="true">·</span> {result.readingMinutes} min read</p>
    </div>
  </article>;
}

function ContributorResult({ result }: { result: ContributorSearchResult }) {
  return <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-5 border-t border-border py-7 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-7">
    <Avatar alt={`Portrait of ${result.title}`} className="size-18 rounded-none bg-foreground font-serif text-xl text-white sm:size-24 sm:text-2xl" decorative={!result.image} initials={initialsFor(result.title)} sizes="(max-width: 640px) 72px, 96px" src={result.image?.src} />
    <div className="min-w-0"><p className="type-meta text-accent">Contributor</p><h3 className="mt-2 font-serif text-2xl sm:text-3xl"><Link className="hover:text-accent" href={result.href}>{result.title}</Link></h3>{result.role && <p className="mt-2 text-sm font-semibold text-muted">{result.role}</p>}<p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{result.description}</p>{result.expertise.length > 0 && <p className="type-meta mt-4 text-muted">{result.expertise.join(" · ")}</p>}<Link className="mt-5 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={result.href}>View Contributor →</Link></div>
  </article>;
}

function PersonResult({ result }: { result: PersonSearchResult }) {
  return <article className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-5 border-t border-border py-7 sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-7">
    <Avatar alt={`Portrait of ${result.title}`} className="size-18 rounded-none bg-surface-subtle font-serif text-xl sm:size-24 sm:text-2xl" decorative={!result.image} initials={initialsFor(result.title)} sizes="(max-width: 640px) 72px, 96px" src={result.image?.src} />
    <div className="min-w-0"><p className="type-meta text-accent">Person</p><h3 className="mt-2 font-serif text-2xl sm:text-3xl">{result.href ? <Link className="hover:text-accent" href={result.href}>{result.title}</Link> : result.title}</h3>{(result.role || result.company) && <p className="mt-2 text-sm font-semibold text-muted">{[result.role, result.company].filter(Boolean).join(", ")}</p>}<p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{result.description}</p>{result.href && result.actionLabel ? <Link className="mt-5 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={result.href}>{result.actionLabel} →</Link> : <p className="type-meta mt-5 text-muted">Featured in The Perspective’s people-led coverage.</p>}</div>
  </article>;
}

function MagazineResult({ result }: { result: MagazineSearchResult }) {
  return <article className="grid grid-cols-[6rem_minmax(0,1fr)] gap-6 border-t border-border py-7 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8">
    <Link aria-label={`Explore ${result.title} in The Perspective Magazine`} className="relative aspect-[3/4] overflow-hidden bg-[#cec4b2] shadow-[0_10px_25px_rgb(0_0_0/15%)]" href={result.href}>{result.image && <Image alt={result.image.alt} className="object-cover" fill sizes="(max-width: 640px) 96px, 128px" src={result.image.src} />}<div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/55" /><span className="absolute inset-x-2 bottom-3 font-serif text-sm leading-tight text-white">THE PERSPECTIVE</span></Link>
    <div className="min-w-0"><p className="type-meta text-premium">Magazine / {result.issueLabel}{result.premium ? " / Premium" : ""}</p><h3 className="mt-3 font-serif text-2xl sm:text-3xl"><Link className="hover:text-accent" href={result.href}>{result.title}</Link></h3><p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{result.description}</p><p className="mt-4 font-serif text-lg">Featured: {result.featuredStory}</p><Link className="mt-5 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={result.href}>{result.premium ? "Explore Premium Magazine" : "Explore Magazine"} →</Link></div>
  </article>;
}

export function SearchResultItem({ result }: { result: SearchResult }) {
  if (result.type === "article") return <ArticleResult result={result} />;
  if (result.type === "contributor") return <ContributorResult result={result} />;
  if (result.type === "person") return <PersonResult result={result} />;
  return <MagazineResult result={result} />;
}
