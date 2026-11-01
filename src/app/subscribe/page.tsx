import type { Metadata } from "next";
import MagazineSubscriptionRoute from "../magazine/subscribe/page";

export const metadata: Metadata = {
  title: { absolute: "Subscribe | The Perspective Magazine" },
  description: "Compare The Perspective Magazine subscription options for digital editions, archive access and Premium editorial experiences.",
  alternates: { canonical: "/subscribe" },
};

export default MagazineSubscriptionRoute;
