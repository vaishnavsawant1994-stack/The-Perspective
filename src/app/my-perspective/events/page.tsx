import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "My Events", description: "Manage registrations, tickets and event replays." };
export default function Page(){ return <MemberExperience page="events" />; }
