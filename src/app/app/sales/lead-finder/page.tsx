import type { Metadata } from "next";
import { LeadFinder } from "@/components/workspace/operational-screens";

export const metadata: Metadata = { title: "Lead Finder — Team Workspace" };

export default function LeadFinderPage() { return <LeadFinder />; }
