import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "My Magazine Library", description: "Your Perspective digital issues and reading progress." };
export default function Page(){ return <MemberExperience page="magazines" />; }
