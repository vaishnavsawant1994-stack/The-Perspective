import type { Metadata } from "next";
import { ClientQuestionnairesLibrary } from "@/components/workspace/client-portal-route-variants";
export const metadata: Metadata = { title: "Questionnaires Library — Client Portal" };
export default function Page() { return <ClientQuestionnairesLibrary/>; }
