import type { Metadata } from "next";
import NewsletterRoute from "../newsletter/page";

export const metadata: Metadata = {
  title: "Newsletters & Briefings",
  description: "Choose The Perspective briefings for business, technology, leadership, markets, events, podcasts and magazine intelligence.",
  alternates: { canonical: "/newsletters" },
};

export default NewsletterRoute;
