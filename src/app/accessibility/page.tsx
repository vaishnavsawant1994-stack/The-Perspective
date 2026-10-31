import type { Metadata } from "next";
import { LegalPage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Accessibility Statement", alternates: { canonical: "/accessibility" } };
export default function Page() { return <LegalPage kind="accessibility" />; }
