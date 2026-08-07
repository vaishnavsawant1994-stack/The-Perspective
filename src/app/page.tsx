import { ArrowRight } from "lucide-react";
import { CategoryLabel } from "@/components/common/category-label";
import { PageContainer } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";

export default function Home() {
  return <>
    <PageContainer className="section-space-lg"><section aria-labelledby="foundation-title" className="grid items-end gap-12 lg:grid-cols-[1.35fr_.65fr]"><div><CategoryLabel>Project Foundation</CategoryLabel><h1 id="foundation-title" className="type-display-xl mt-5 max-w-6xl">A wider point of view.</h1></div><div className="pb-2"><p className="type-deck max-w-md text-muted">Global shell and master design system preview. The editorial homepage begins in Stage 3.</p><div className="mt-7 flex flex-wrap gap-3"><Button>Primary action</Button><Button variant="outline">Secondary</Button></div></div></section></PageContainer>
    <PageContainer><Divider tone="accent" /></PageContainer>
    <PageContainer className="section-space"><section aria-labelledby="type-preview" className="grid gap-10 lg:grid-cols-[.6fr_1.4fr]"><div><p className="eyebrow text-accent">System preview</p><h2 className="type-h3 mt-3" id="type-preview">Typography, rhythm, and restraint.</h2></div><div className="grid gap-8 sm:grid-cols-2"><div className="border-t border-border pt-5"><p className="type-meta text-muted">Editorial serif</p><p className="type-h3 mt-6">Clarity rewards the curious.</p></div><div className="border-t border-border pt-5"><p className="type-meta text-muted">Interface sans</p><p className="type-body-lg mt-6 text-muted">Designed for long-form reading, confident navigation, and a considered sense of place across every screen.</p></div></div></section></PageContainer>
    <div className="bg-surface-subtle"><PageContainer className="section-space"><section className="grid gap-8 md:grid-cols-3"><div className="md:col-span-2"><div className="editorial-placeholder aspect-[16/8]" aria-label="Editorial image placeholder" role="img" /></div><div className="flex flex-col justify-between border-t border-foreground pt-5"><div><CategoryLabel>Magazine</CategoryLabel><h2 className="type-h3 mt-4">Permanent systems, ready for the stories.</h2><p className="mt-5 text-sm leading-6 text-muted">This remains a design-system preview, not the final homepage.</p></div><a className="mt-8 flex items-center gap-2 text-sm font-bold" href="#foundation-title">Return to preview <ArrowRight className="size-4" /></a></div></section></PageContainer></div>
  </>;
}
