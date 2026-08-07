import Image, { type ImageProps } from "next/image";
import { cn } from "@/lib/utils";

export function ResponsiveImage({ className, alt, sizes = "(max-width: 768px) 100vw, 50vw", ...props }: ImageProps) {
  return <Image alt={alt} className={cn("object-cover", className)} sizes={sizes} {...props} />;
}
