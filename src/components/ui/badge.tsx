import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn("eyebrow inline-flex items-center border border-border px-2.5 py-1", className)} {...props} />; }
