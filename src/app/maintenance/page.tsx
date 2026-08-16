import type { Metadata } from "next";
import { MaintenancePage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Scheduled Maintenance" };
export default function Page() { return <MaintenancePage />; }
