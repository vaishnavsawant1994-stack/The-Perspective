import type { Metadata } from "next";
import { ErrorStatePage } from "@/components/utility/utility-pages";

export const metadata: Metadata = { title: "Something Went Wrong" };
export default function GeneralErrorPage() { return <ErrorStatePage kind="500" />; }
