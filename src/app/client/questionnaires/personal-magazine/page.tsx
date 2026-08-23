import type { Metadata } from "next";
import { ClientQuestionnaireScreen } from "@/components/workspace/client-portal-screens";

export const metadata: Metadata = { title: "Personal Magazine Questionnaire — Client Portal" };
export default function Page() { return <ClientQuestionnaireScreen />; }
