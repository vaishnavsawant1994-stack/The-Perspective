export type EventDetail = {
  slug: string;
  title: string;
  strapline: string;
  dates: string;
  venue: string;
  city: string;
  heroImage: string;
  attendees: string;
  speakers: string;
  sessions: string;
  description: string;
};

export const events: EventDetail[] = [
  { slug:"leadership-summit-2026", title:"Leadership Summit 2026", strapline:"Where Ideas, Leaders & Industries Meet", dates:"May 29–30, 2026", venue:"Bharat Mandapam, Pragati Maidan", city:"New Delhi, India", heroImage:"/images/events/leadership-summit-hero.png", attendees:"1,000+", speakers:"40+", sessions:"12+", description:"Two days of powerful conversations, future-focused insights and meaningful connections with the world’s leading minds and changemakers." },
  { slug:"global-markets-outlook-2026", title:"Global Markets Outlook 2026", strapline:"Capital, policy and the new investment cycle", dates:"June 18, 2026", venue:"Jio World Convention Centre", city:"Mumbai, India", heroImage:"/images/articles/global-growth.png", attendees:"650+", speakers:"24+", sessions:"8", description:"Investors, economists and business leaders examine the signals shaping capital allocation and global markets." },
  { slug:"ai-future-enterprise", title:"AI & The Future Enterprise", strapline:"Building intelligent institutions at scale", dates:"July 8, 2026", venue:"Bangalore International Centre", city:"Bengaluru, India", heroImage:"/images/articles/ai-infrastructure.png", attendees:"800+", speakers:"30+", sessions:"10", description:"Technology leaders and researchers explore the systems, talent and responsibility behind enterprise AI." },
  { slug:"healthcare-innovation-summit", title:"Healthcare Innovation Summit", strapline:"Science, systems and better outcomes", dates:"August 22, 2026", venue:"HITEX Exhibition Centre", city:"Hyderabad, India", heroImage:"/images/articles/cybersecurity-operations.png", attendees:"500+", speakers:"28+", sessions:"9", description:"Leaders across medicine, research and technology discuss the next era of accessible and intelligent care." },
  { slug:"sustainability-leadership-roundtable", title:"Sustainability Leadership Roundtable", strapline:"Growth built for a changing world", dates:"September 12, 2026", venue:"Marina Bay Conference Centre", city:"Singapore", heroImage:"/images/articles/global-leadership.png", attendees:"350+", speakers:"18+", sessions:"7", description:"Executives and policymakers turn climate ambition into resilient operating and investment decisions." },
];

export function getEventBySlug(slug:string){return events.find((event)=>event.slug===slug)}
