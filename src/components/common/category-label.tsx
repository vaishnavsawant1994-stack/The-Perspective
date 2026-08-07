import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function CategoryLabel({ className, ...props }: HTMLAttributes<HTMLSpanElement>) { return <span className={cn("eyebrow inline-flex items-center text-accent", className)} {...props} />; }
