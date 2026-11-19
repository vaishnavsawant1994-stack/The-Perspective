import type { Metadata } from "next";
import { PublicPersonDetail, peopleProfileMetadata } from "@/components/profile-network/people-pages";

export const dynamic = "force-dynamic";
export const dynamicParams = true;
type Props = { params: Promise<{slug: string}> };

export function generateMetadata({ params }: Props): Promise<Metadata> {
  return peopleProfileMetadata("PROFESSIONAL", params);
}
export default function ProfessionalProfileRoute({ params }: Props) {
  return <PublicPersonDetail kind="PROFESSIONAL" params={params} />;
}
