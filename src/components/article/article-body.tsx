import Image from "next/image";
import type { ArticleContentBlock } from "@/types";
import { articleHeadingId } from "@/lib/article-content";

export function ArticleBody({ content }: { content: readonly ArticleContentBlock[] }) {
  return <div className="min-w-0">{content.map((block,index) => {
    const key = `${block.type}-${index}`;
    switch (block.type) {
      case "paragraph": return <p className={index === 0 ? "mb-6 font-serif text-[1.3rem] leading-[1.62] sm:text-[1.45rem]" : "mb-6 text-[1.08rem] leading-[1.78] sm:text-[1.18rem]"} key={key}>{block.text}</p>;
      case "heading": { const id = articleHeadingId(block.text); return block.level === 2 ? <h2 className="mb-5 mt-12 scroll-mt-24 font-serif text-[clamp(1.85rem,4vw,2.7rem)] leading-[1.05] tracking-[-.035em]" id={id} key={key}>{block.text}</h2> : <h3 className="mb-4 mt-9 scroll-mt-24 font-serif text-[clamp(1.45rem,3vw,2rem)] leading-tight" id={id} key={key}>{block.text}</h3>; }
      case "pullQuote": return <figure className="my-10 border-y border-accent py-8 sm:my-12 sm:py-10" key={key}><blockquote className="font-serif text-[clamp(1.75rem,4vw,2.75rem)] leading-[1.08] tracking-[-.035em]">“{block.quote}”</blockquote>{block.attribution && <figcaption className="type-meta mt-5 text-muted">— {block.attribution}</figcaption>}</figure>;
      case "image": return <figure className="my-10 sm:my-12" key={key}><div className="relative aspect-[16/10] overflow-hidden bg-surface-subtle"><Image alt={block.image.alt} className="object-cover" fill sizes="(max-width: 768px) 100vw, 760px" src={block.image.src} /></div>{(block.caption || block.credit) && <figcaption className="mt-3 flex flex-col gap-1 text-xs leading-5 text-muted sm:flex-row sm:justify-between"><span>{block.caption}</span><span>{block.credit}</span></figcaption>}</figure>;
      case "bulletList": return <ul className="mb-8 ml-5 list-disc space-y-3 text-[1.08rem] leading-[1.7] marker:text-accent sm:text-[1.18rem]" key={key}>{block.items.map((item) => <li className="pl-2" key={item}>{item}</li>)}</ul>;
      case "numberedList": return <ol className="mb-8 ml-6 list-decimal space-y-3 text-[1.08rem] leading-[1.7] marker:font-bold marker:text-accent sm:text-[1.18rem]" key={key}>{block.items.map((item) => <li className="pl-2" key={item}>{item}</li>)}</ol>;
      case "callout": return <aside className="my-9 border-l-4 border-accent bg-surface-subtle px-5 py-6 sm:px-7" key={key}><p className="eyebrow text-accent">{block.label}</p><p className="mt-3 font-serif text-xl leading-relaxed sm:text-2xl">{block.text}</p></aside>;
      case "divider": return <hr className="my-11 border-0 border-t border-border" key={key} />;
    }
  })}</div>;
}
