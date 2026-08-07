import { cn } from "@/lib/utils";

export function PageContainer({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn("mx-auto w-full max-w-[1600px] px-4 xs:px-5 sm:px-8 lg:px-12 3xl:max-w-[1840px] 4xl:max-w-[2200px]", className)}>{children}</div>;
}
