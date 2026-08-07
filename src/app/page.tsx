import { CheckCircle2 } from "lucide-react";
import { PageContainer } from "@/components/layout/page-container";

export default function Home() {
  return (
    <PageContainer className="flex min-h-[70vh] items-center py-20 sm:py-28">
      <section aria-labelledby="foundation-title" className="max-w-5xl">
        <p className="eyebrow mb-6 text-accent">Project Foundation</p>
        <h1 id="foundation-title" className="editorial-display">The Perspective</h1>
        <div className="mt-10 flex items-center gap-3 border-t border-border pt-5 text-sm text-muted">
          <CheckCircle2 aria-hidden="true" className="size-5 text-accent" />
          <span>Foundation ready for design-system development.</span>
        </div>
      </section>
    </PageContainer>
  );
}
