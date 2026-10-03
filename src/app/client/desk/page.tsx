import type { Metadata } from "next";

import { ClientDesk } from "@/components/workspace/client-desk";

export const metadata: Metadata = { title: "Client desk", robots: { index: false, follow: false } };

export default function ClientDeskPage() {
  return <ClientDesk />;
}
