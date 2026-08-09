import type { ResolvedPersonalMagazineProfile } from "@/types";
import { PersonalMagazineDiscovery } from "@/components/personal-magazine/personal-magazine-discovery";
import { PersonalMagazineEditorial } from "@/components/personal-magazine/personal-magazine-editorial";
import { PersonalMagazineHero } from "@/components/personal-magazine/personal-magazine-hero";

export function PersonalMagazineProfilePage({ profile }: { profile: ResolvedPersonalMagazineProfile }) {
  return <>
    <PersonalMagazineHero profile={profile} />
    <PersonalMagazineEditorial profile={profile} />
    <PersonalMagazineDiscovery profile={profile} />
  </>;
}
