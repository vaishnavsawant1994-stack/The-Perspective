import Image from "next/image";
import { cn } from "@/lib/utils";
export function Avatar({ src, alt, initials, className }: { src?: string; alt: string; initials: string; className?: string }) { return <span className={cn("relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-subtle text-xs font-semibold", className)}>{src ? <Image alt={alt} className="object-cover" fill sizes="40px" src={src} /> : <span aria-label={alt}>{initials}</span>}</span>; }
