import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Subscription Management", description: "Manage your Perspective membership." };
export default function Page(){ return <MemberExperience page="subscription" />; }
