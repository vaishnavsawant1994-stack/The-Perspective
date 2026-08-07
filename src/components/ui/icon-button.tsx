import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function IconButton({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) { return <button type={type} className={cn("inline-flex size-11 items-center justify-center border border-border transition-colors hover:bg-surface-subtle [&_svg]:size-5", className)} {...props} />; }
