import type { Metadata } from "next";

import { OperationsDesk } from "@/components/workspace/operations-desk";

export const metadata: Metadata = { title: "Operations desk", robots: { index: false, follow: false } };

export default function OperationsDeskPage() {
  return <OperationsDesk />;
}
