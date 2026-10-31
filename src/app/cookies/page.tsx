import type { Metadata } from "next";
import { LegalPage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Cookie Policy", alternates: { canonical: "/cookies" } };
export default function Page() { return <LegalPage kind="cookies" />; }
