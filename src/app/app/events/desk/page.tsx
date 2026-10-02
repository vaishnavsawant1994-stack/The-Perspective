import { MediaDesk } from "@/components/workspace/media-desk";

export const metadata = { title: "Event desk", robots: { index: false, follow: false } };

export default function EventDeskPage() {
  return (
    <MediaDesk
      kicker="Events"
      title="Event desk"
      endpoint="/api/v1/r10/events"
      field="title"
      fieldLabel="Event title"
      empty="No event is visible to this membership."
      includeStart
    />
  );
}
