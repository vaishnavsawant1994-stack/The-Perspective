import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Help & Support Requests", description: "Create and track Perspective support requests." };
export default function Page(){ return <MemberExperience page="support" />; }
