import { Skeleton } from "@/components/ui/skeleton";

export function LoadingPlaceholder({ label = "Loading content" }: { label?: string }) {
  return <div aria-label={label} aria-busy="true" className="space-y-4" role="status"><Skeleton className="h-72 w-full" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>;
}
