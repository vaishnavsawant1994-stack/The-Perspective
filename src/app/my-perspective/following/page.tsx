import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Following", description: "Topics, authors and people you follow." };
export default function Page(){ return <MemberExperience page="following" />; }
