import type { Metadata } from "next";
import { LegalPage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Accessibility Statement" };
export default function Page() { return <LegalPage kind="accessibility" />; }
