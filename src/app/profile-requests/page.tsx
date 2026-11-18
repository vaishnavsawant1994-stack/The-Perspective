import type { Metadata } from "next";
import { PublicProfileRequestForm } from "@/components/profile-network/public-request-form";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Profile corrections and review requests",
  description: "Request an independently reviewed profile correction, removal or relationship check.",
  robots: { index: false, follow: false },
};

type Search = { kind?: string | string[]; subjectKind?: string | string[]; subjectSlug?: string | string[] };
type Props = { searchParams: Promise<Search> };

export default async function ProfileRequestsPage({searchParams}: Props) {
  const params=await searchParams;
  const kind=params.kind === "REMOVAL" || params.kind === "CLAIM" ? params.kind : "CORRECTION";
  const subjectKind=params.subjectKind === "EDITOR" || params.subjectKind === "PROFESSIONAL" ? params.subjectKind : "COMPANY";
  const slug=typeof params.subjectSlug === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(params.subjectSlug)
    ? params.subjectSlug.slice(0,100) : "";
  return <PublicProfileRequestForm initialKind={kind} initialSubjectKind={subjectKind} initialSlug={slug} />;
}
