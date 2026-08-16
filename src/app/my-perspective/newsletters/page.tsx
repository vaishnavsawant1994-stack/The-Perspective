import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Newsletter Preferences", description: "Manage newsletters, briefings and topic alerts." };
export default function Page(){ return <MemberExperience page="newsletters" />; }
