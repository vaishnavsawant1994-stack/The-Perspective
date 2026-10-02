import { MediaDesk } from "@/components/workspace/media-desk";

export const metadata = { title: "Podcast desk", robots: { index: false, follow: false } };

export default function PodcastDeskPage() {
  return (
    <MediaDesk
      kicker="Podcasts"
      title="Podcast desk"
      endpoint="/api/v1/r10/shows"
      field="title"
      fieldLabel="Show title"
      empty="No show is visible to this membership."
    />
  );
}
