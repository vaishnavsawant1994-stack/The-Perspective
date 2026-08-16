import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Saved Articles", description: "Your saved stories and reading list." };
export default function Page(){ return <MemberExperience page="saved" />; }
