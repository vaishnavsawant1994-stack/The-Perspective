import type { Metadata } from "next";
import { ClientDraftsLibrary } from "@/components/workspace/client-portal-route-variants";
export const metadata: Metadata = { title: "Drafts Library — Client Portal" };
export default function Page() { return <ClientDraftsLibrary/>; }
