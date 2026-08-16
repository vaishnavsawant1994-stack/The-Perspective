import type { Metadata } from "next";
import { MemberExperience } from "@/components/member/member-experience";
export const metadata: Metadata = { title: "Billing & Payment History", description: "Invoices, payment methods and billing details." };
export default function Page(){ return <MemberExperience page="billing" />; }
