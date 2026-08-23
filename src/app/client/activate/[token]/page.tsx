import type { Metadata } from "next";
import { ClientActivation } from "@/components/workspace/client-auth-screens";
export const metadata: Metadata = { title: "Activate Client Portal Account — The Perspective" };
export default async function Page({params}:{params:Promise<{token:string}>}) { const {token}=await params; return <ClientActivation token={token}/>; }
