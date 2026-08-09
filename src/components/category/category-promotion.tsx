import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CategoryPromotion } from "@/types";
import { MagazineSpotlight } from "@/components/home/magazine-spotlight";
import { PersonalMagazineSection } from "@/components/home/personal-magazine-section";
import { PageContainer } from "@/components/layout/page-container";

export function CategoryPromotionSection({ promotion }: { promotion: CategoryPromotion }) {
  if (promotion.kind === "magazine") return <MagazineSpotlight issue={promotion.issue} />;
  if (promotion.kind === "personal-magazines") return <PersonalMagazineSection people={promotion.people} />;

  return <div className="overflow-hidden bg-foreground text-white">
    <PageContainer className="section-space-lg" width="standard">
      <section aria-labelledby="category-premium-heading" className="relative grid gap-10 border-y border-white/20 py-10 lg:grid-cols-[1.25fr_.75fr] lg:items-end lg:py-14">
        <div>
          <p className="eyebrow text-premium">{promotion.eyebrow}</p>
          <h2 className="type-display-lg mt-5 max-w-4xl" id="category-premium-heading">{promotion.title}</h2>
        </div>
        <div>
          <p className="type-deck text-white/75">{promotion.description}</p>
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 text-sm font-bold">
            <Link className="inline-flex min-h-11 items-center gap-2 border-b border-premium text-premium" href={promotion.primaryAction.href}>{promotion.primaryAction.label} <ArrowRight className="size-4" /></Link>
            <Link className="inline-flex min-h-11 items-center gap-2 border-b border-white/60" href={promotion.secondaryAction.href}>{promotion.secondaryAction.label} <ArrowRight className="size-4" /></Link>
          </div>
        </div>
      </section>
    </PageContainer>
  </div>;
}
