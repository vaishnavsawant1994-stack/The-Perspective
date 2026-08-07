import Link from "next/link";

export function PremiumArticleBanner() {
  return <aside className="border-y border-premium bg-[#eee4d2] px-5 py-5 sm:flex sm:items-center sm:justify-between sm:gap-6" aria-label="Premium article"><div><p className="eyebrow text-premium">The Perspective Premium</p><p className="mt-2 font-serif text-xl">This story is part of The Perspective Premium and remains readable in this demonstration edition.</p></div><Link className="mt-4 inline-block shrink-0 border-b border-foreground pb-1 text-sm font-bold sm:mt-0" href="/premium">Explore Premium →</Link></aside>;
}
