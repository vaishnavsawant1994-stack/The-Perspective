import { cn } from "@/lib/utils";
import { PageContainer } from "./page-container";

export function SectionContainer({ className, children, labelledBy }: React.PropsWithChildren<{ className?: string; labelledBy?: string }>) {
  return <section aria-labelledby={labelledBy} className={cn("py-12 sm:py-16 lg:py-24", className)}><PageContainer>{children}</PageContainer></section>;
}
