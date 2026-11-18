import type { Metadata } from "next";
import { PublicPersonDetail, peopleProfileMetadata } from "@/components/profile-network/people-pages";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
type Props = { params: Promise<{slug: string}> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return peopleProfileMetadata("EDITOR", params);
}
export default function EditorProfileRoute({ params }: Props) {
  return <PublicPersonDetail kind="EDITOR" params={params} />;
}
