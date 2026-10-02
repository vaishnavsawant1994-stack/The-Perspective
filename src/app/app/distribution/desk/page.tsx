import { MediaDesk } from "@/components/workspace/media-desk";

export const metadata = { title: "Distribution desk", robots: { index: false, follow: false } };

export default function DistributionDeskPage() {
  return (
    <MediaDesk
      kicker="Distribution"
      title="Distribution desk"
      endpoint="/api/v1/r10/campaigns"
      field="name"
      fieldLabel="Campaign name"
      empty="No campaign is visible to this membership."
    />
  );
}
