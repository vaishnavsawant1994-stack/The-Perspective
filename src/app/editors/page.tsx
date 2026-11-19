import type { Metadata } from "next";
import { PublicPeopleDirectory, peopleDirectoryMetadata } from "@/components/profile-network/people-pages";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{q?: string | string[]}> };

export function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return peopleDirectoryMetadata("EDITOR", searchParams);
}
export default function EditorsRoute({ searchParams }: Props) {
  return <PublicPeopleDirectory kind="EDITOR" searchParams={searchParams} />;
}
