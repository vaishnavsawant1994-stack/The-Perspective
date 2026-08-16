import type { Metadata } from "next";
import { DataEnrichment } from "@/components/workspace/operational-screens";

export const metadata: Metadata = { title: "Contact & Data Enrichment — Team Workspace" };

export default function DataEnrichmentPage() { return <DataEnrichment />; }
