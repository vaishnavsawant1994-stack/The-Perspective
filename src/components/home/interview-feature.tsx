import type { PersonProfile } from "@/types";
import { PageContainer } from "@/components/layout/page-container";
import { PersonFeature } from "@/components/person/person-feature";
export function InterviewFeature({ person }: { person:PersonProfile }) { return <div className="bg-accent-strong"><PageContainer className="section-space-lg"><section aria-label="The Interview"><PersonFeature dark label="The Interview" person={person} /></section></PageContainer></div>; }
