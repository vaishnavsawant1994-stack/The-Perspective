import type { Metadata } from "next";
import { DataExtraction } from "@/components/workspace/operational-screens";

export const metadata: Metadata = { title: "Data Extraction — Team Workspace" };

export default function DataExtractionPage() { return <DataExtraction />; }
