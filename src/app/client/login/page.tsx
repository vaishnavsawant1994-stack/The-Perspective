import type { Metadata } from "next";
import { ClientSignIn } from "@/components/workspace/client-auth-screens";
export const metadata: Metadata = { title: "Client Portal Sign In — The Perspective" };
export default function Page() { return <ClientSignIn/>; }
