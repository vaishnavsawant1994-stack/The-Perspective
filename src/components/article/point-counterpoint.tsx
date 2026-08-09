import Link from "next/link";
import type { PerspectiveArgument } from "@/types";

function Argument({ argument }: { argument: PerspectiveArgument }) {
  const author = argument.article.authors[0];
  return <article className="py-8 lg:px-10 lg:py-10">
    <p className="eyebrow text-accent">{argument.label}</p>
    {author && <div className="mt-5"><p className="font-serif text-xl"><Link className="hover:text-accent" href={`/author/${author.slug}`}>{author.name}</Link></p>{author.role && <p className="mt-1 text-xs font-semibold text-muted">{author.role}</p>}</div>}
    <h3 className="type-h3 mt-7"><Link className="hover:text-accent" href={`/article/${argument.article.slug}`}>{argument.article.title}</Link></h3>
    <p className="mt-6 text-base leading-7 text-muted">{argument.summary}</p>
    <Link className="mt-7 inline-flex min-h-11 items-center border-b border-foreground text-sm font-bold hover:text-accent" href={`/article/${argument.article.slug}`}>Read {author?.name.split(" ").at(-1) ?? "the"}’s View →</Link>
  </article>;
}

export function PointCounterpoint({ topic, point, counterpoint }: { topic: string; point: PerspectiveArgument; counterpoint: PerspectiveArgument }) {
  return <section aria-labelledby="point-counterpoint-heading" className="border-y-2 border-foreground py-8 sm:py-10">
    <p className="eyebrow text-accent">Point / Counterpoint</p><h2 className="type-h2 mt-4 max-w-5xl" id="point-counterpoint-heading">{topic}</h2>
    <div className="mt-8 divide-y divide-foreground lg:grid lg:grid-cols-2 lg:divide-x lg:divide-y-0"><Argument argument={point} /><Argument argument={counterpoint} /></div>
  </section>;
}
