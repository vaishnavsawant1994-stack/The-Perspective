import type { Metadata } from "next";
import { ClientDistributionDetail } from "@/components/workspace/client-portal-route-variants";
export const metadata: Metadata = { title: "Global Distribution — Client Portal" };
export default function Page() { return <ClientDistributionDetail/>; }
