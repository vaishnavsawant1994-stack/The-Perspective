import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventDetailPage } from "@/components/event/event-detail-page";
import { EventsPage } from "@/components/event/events-page";
import { siteConfig } from "@/config/site";
import { events, getEventBySlug } from "@/data/mock/events";

type RouteProps={params:Promise<{slug:string}>};
export const dynamicParams=false;
export function generateStaticParams(){return events.map(({slug})=>({slug}))}
export async function generateMetadata({params}:RouteProps):Promise<Metadata>{const {slug}=await params;const event=getEventBySlug(slug);if(!event)return{};const description=event.description;const url=`/events/${slug}`;return{title:{absolute:`${event.title} | The Perspective Events`},description,alternates:{canonical:url},openGraph:{title:event.title,description,type:"website",url,siteName:siteConfig.name,images:[{url:event.heroImage,alt:event.title}]},twitter:{card:"summary_large_image",title:event.title,description,images:[event.heroImage]}}}
export default async function EventRoute({params}:RouteProps){const {slug}=await params;const event=getEventBySlug(slug);if(!event)notFound();return <><EventDetailPage event={event}/><section aria-labelledby="existing-events-content" style={{borderTop:"1px solid #e4ddd3",marginTop:"48px",paddingTop:"44px"}}><div style={{margin:"0 auto 30px",maxWidth:"1440px",padding:"0 clamp(20px,4vw,64px)"}}><p style={{color:"#a75c13",fontSize:"12px",fontWeight:800,letterSpacing:".1em",margin:"0 0 8px",textTransform:"uppercase"}}>Continue exploring</p><h2 id="existing-events-content" style={{fontFamily:"Georgia,serif",fontSize:"clamp(30px,4vw,52px)",margin:0}}>The complete Perspective events experience</h2></div><EventsPage includeBreaking={false}/></section></>}
