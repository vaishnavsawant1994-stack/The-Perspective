import type { Metadata } from "next";
import { ClientBillingWorkspace } from "@/components/workspace/client-portal-management-screens";
export const metadata: Metadata = { title: "Invoices & Payments — Client Portal" };
export default function Page(){return <ClientBillingWorkspace/>}
