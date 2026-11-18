import type { Metadata } from "next";
import { PublicPeopleDirectory, peopleDirectoryMetadata } from "@/components/profile-network/people-pages";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{q?: string | string[]}> };

export function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return peopleDirectoryMetadata("PROFESSIONAL", searchParams);
}
export default function ProfessionalsRoute({ searchParams }: Props) {
  return <PublicPeopleDirectory kind="PROFESSIONAL" searchParams={searchParams} />;
}
