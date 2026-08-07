import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) { return <input className={cn("h-11 w-full border border-border bg-surface px-3 text-sm placeholder:text-muted focus:border-foreground focus:outline-none", className)} {...props} />; }
