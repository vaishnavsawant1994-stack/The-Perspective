import type { Metadata } from "next";
import { LegalPage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Community Guidelines", alternates: { canonical: "/community-guidelines" } };
export default function Page() { return <LegalPage kind="community" />; }
