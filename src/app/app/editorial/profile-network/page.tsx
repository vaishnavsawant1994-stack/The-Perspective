import type { Metadata } from "next";

import { ProfileEditorialStudio } from "@/components/profile-network/editorial-studio";

export const metadata: Metadata = {
  title: "Profile Network Studio | Editorial",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";

export default function ProfileNetworkEditorialPage() {
  return <ProfileEditorialStudio />;
}
