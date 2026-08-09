import type { ResolvedMagazinePage } from "@/types";

const pageTone: Record<ResolvedMagazinePage["type"], string> = {
  cover: "bg-[#3b352c] text-white",
  contents: "bg-[#f6f1e7] text-foreground",
  editorial: "bg-[#fffefa] text-foreground",
  section: "bg-[#4b4740] text-white",
  feature: "bg-[#d4c9b7] text-foreground",
  article: "bg-[#fffefa] text-foreground",
  quote: "bg-accent text-white",
  image: "bg-[#c2b8a8] text-foreground",
  end: "bg-[#181713] text-white",
};

export function ReaderPageThumbnail({ page }: { page: ResolvedMagazinePage }) {
  return <div aria-hidden="true" className={`relative aspect-[3/4] overflow-hidden border border-black/15 p-3 shadow-sm ${pageTone[page.type]}`}>
    <div className="h-px w-full bg-current opacity-35" />
    <p className="mt-3 font-serif text-sm leading-tight">{page.label}</p>
    <div className="absolute inset-x-3 bottom-3 space-y-1 opacity-35"><span className="block h-px bg-current" /><span className="block h-px w-4/5 bg-current" /><span className="block h-px w-3/5 bg-current" /></div>
  </div>;
}
