import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export function ResponsiveImage({ className, alt, sizes = "(max-width: 768px) 100vw, 50vw", ...props }: ImageProps) {
  return <Image alt={alt} className={cn("object-cover", className)} sizes={sizes} {...props} />;
}

export const editorialRatios = { hero: "aspect-[16/9]", article: "aspect-[3/2]", card: "aspect-[4/3]", portrait: "aspect-[4/5]", magazine: "aspect-[3/4]", square: "aspect-square" } as const;
