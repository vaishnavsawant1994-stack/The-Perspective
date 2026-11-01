import type { Metadata } from "next";

import { ContactPerspectivePage } from "@/components/contact/contact-perspective-page";

export const metadata: Metadata = {
  title: "Advertise & Partner with The Perspective",
  description: "Explore advertising, brand partnership, media and collaboration opportunities with The Perspective.",
  alternates: { canonical: "/advertise" },
};

export default function AdvertiseRoute() {
  return <ContactPerspectivePage />;
}
