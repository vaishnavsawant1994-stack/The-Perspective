import type { Metadata } from "next";

import { MemberLibrary } from "@/components/member/member-library";

export const metadata: Metadata = { title: "Member library", robots: { index: false, follow: false } };

export default function MemberLibraryPage() {
  return <MemberLibrary />;
}
