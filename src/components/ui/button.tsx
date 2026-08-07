import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva("inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold transition-colors active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50", { variants: { variant: { primary: "bg-accent text-white hover:bg-accent-strong", secondary: "bg-foreground text-white hover:bg-foreground/85", outline: "border border-foreground bg-transparent hover:bg-foreground hover:text-white", ghost: "hover:bg-surface-subtle", text: "min-h-0 border-b border-current px-0 py-1 hover:text-accent", dark: "bg-white text-foreground hover:bg-white/85", premium: "bg-premium text-white hover:bg-[#86622d]" }, size: { default: "h-11", small: "h-9 px-3 text-xs", large: "h-13 px-7" } }, defaultVariants: { variant: "primary", size: "default" } });

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;
export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) { return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />; }
