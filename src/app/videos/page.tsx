import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VideosPage } from "@/components/video/videos-page";
import { siteConfig } from "@/config/site";
import { getHomepageRedesignContent } from "@/lib/homepage-redesign";

const title = "Videos | The Perspective";
const description = "Watch The Perspective Videos: cinematic interviews, explainers and documentaries with leaders, founders and innovators shaping what comes next.";

export const metadata: Metadata = {
  title:{absolute:title}, description, alternates:{canonical:"/videos"},
  openGraph:{title,description,type:"website",url:"/videos",siteName:siteConfig.name,images:[{url:"/images/videos/naveen-malhotra-featured-interview.png",width:1536,height:1024,alt:"The Perspective Videos"}]},
  twitter:{card:"summary_large_image",title,description,images:["/images/videos/naveen-malhotra-featured-interview.png"]},
};

export default function VideosRoute() {
  const content=getHomepageRedesignContent();
  if(!content) notFound();
  return <VideosPage content={content}/>;
}
