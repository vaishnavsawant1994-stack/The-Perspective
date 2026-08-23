import type { Metadata } from "next";
import { ClientAccessRecovery } from "@/components/workspace/client-auth-screens";
export const metadata: Metadata = { title: "Client Portal Access Recovery — The Perspective" };
export default async function Page({searchParams}:{searchParams:Promise<{token?:string}>}) { const {token}=await searchParams; return <ClientAccessRecovery token={token}/>; }
