import { MediaDesk } from "@/components/workspace/media-desk";

export const metadata = { title: "Video desk", robots: { index: false, follow: false } };

export default function VideoDeskPage() {
  return (
    <MediaDesk
      kicker="Videos"
      title="Video desk"
      endpoint="/api/v1/r10/videos"
      field="title"
      fieldLabel="Video title"
      empty="No video is visible to this membership."
    />
  );
}
