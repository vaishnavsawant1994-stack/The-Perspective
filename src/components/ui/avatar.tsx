import Image from "next/image";
import { cn } from "@/lib/utils";
export function Avatar({ src, alt, initials, className }: { src?: string; alt: string; initials: string; className?: string }) { return <span aria-label={src ? undefined : alt} className={cn("relative inline-flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-subtle text-xs font-semibold", className)} role={src ? undefined : "img"}>{src ? <Image alt={alt} className="object-cover" fill sizes="40px" src={src} /> : <span aria-hidden="true">{initials}</span>}</span>; }
