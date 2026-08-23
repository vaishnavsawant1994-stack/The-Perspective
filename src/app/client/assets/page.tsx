import type { Metadata } from "next";
import { ClientAssetsWorkspace } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Files & Assets — Client Portal" };
export default function Page(){return <ClientAssetsWorkspace/>}
