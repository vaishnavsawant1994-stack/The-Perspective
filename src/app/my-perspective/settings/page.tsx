import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Profile & Account Settings", description: "Manage your member profile and account security." };
export default function Page(){ return <MemberExperience page="settings" />; }
