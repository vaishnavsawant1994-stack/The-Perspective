import type { Metadata } from "next";
import { ClientMessageThreadDetail } from "@/components/workspace/client-portal-route-variants";
export const metadata: Metadata = { title: "Editorial Draft Review — Messages" };
export default function Page() { return <ClientMessageThreadDetail/>; }
