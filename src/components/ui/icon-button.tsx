import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const IconButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function IconButton({ className, type = "button", ...props }, ref) { return <button ref={ref} type={type} className={cn("inline-flex size-11 items-center justify-center border border-border transition-colors hover:bg-surface-subtle disabled:opacity-50 [&_svg]:size-5", className)} {...props} />; });
