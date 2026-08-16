import type { Metadata } from "next";
import { LegalPage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Terms of Use" };
export default function Page() { return <LegalPage kind="terms" />; }
