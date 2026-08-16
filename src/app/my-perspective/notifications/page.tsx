import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Notifications", description: "Your editorial and account notifications." };
export default function Page(){ return <MemberExperience page="notifications" />; }
