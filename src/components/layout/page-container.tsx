import { cn } from "@/lib/utils";

export type ContainerWidth = "reading" | "article" | "standard" | "wide" | "media";
const widths: Record<ContainerWidth, string> = { reading: "max-w-[760px]", article: "max-w-[960px]", standard: "max-w-[1360px]", wide: "max-w-[1680px]", media: "max-w-[2200px]" };
export function PageContainer({ className, children, width = "wide" }: React.PropsWithChildren<{ className?: string; width?: ContainerWidth }>) {
  return <div className={cn("mx-auto w-full px-4 xs:px-5 sm:px-8 lg:px-10 xl:px-12", widths[width], className)}>{children}</div>;
}
