import type { Metadata } from "next";
import { ErrorStatePage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Page Not Found" };

export default function NotFound() {
  return <ErrorStatePage kind="404" />;
}
