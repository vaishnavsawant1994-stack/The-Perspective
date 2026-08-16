import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "My Perspective", description: "Your personalized Perspective member dashboard." };
export default function Page(){ return <MemberExperience page="dashboard" />; }
