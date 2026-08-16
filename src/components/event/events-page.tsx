import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight, BarChart3, BriefcaseBusiness, CalendarDays, CircleDollarSign,
  Globe2, Handshake, HeartHandshake, Lightbulb, MapPin, Megaphone, Mic2, Network,
  Play, ShieldCheck, Sparkles, Ticket, UsersRound,
} from "lucide-react";
import { getPublicAuthors } from "@/data/mock/author-profiles";
import styles from "./events-page.module.css";

const authors = getPublicAuthors();
const speaker = (index: number) => authors[index % authors.length];
type EventCard = { month:string; day:string; title:string; description:string; location:string; image:string; href:string; featured?:boolean };
const upcoming: readonly EventCard[] = [
  { month:"May", day:"29–30", title:"The Perspective Leadership Summit 2026", description:"The flagship gathering of global leaders, policymakers and innovators.", location:"New Delhi, India", image:"/images/events/leadership-summit-hero.png", href:"/events/leadership-summit-2026", featured:true },
  { month:"Jun", day:"18", title:"Global Markets Outlook 2026", description:"Insights on capital allocation, markets and investment strategies.", location:"Mumbai, India", image:"/images/articles/global-growth.png", href:"/events/global-markets-outlook-2026" },
  { month:"Jul", day:"08", title:"AI & The Future Enterprise", description:"Exploring how AI is transforming businesses and institutions.", location:"Bengaluru, India", image:"/images/articles/ai-infrastructure.png", href:"/events/ai-future-enterprise" },
  { month:"Aug", day:"22", title:"Healthcare Innovation Summit", description:"Building the future of healthcare through innovation and collaboration.", location:"Hyderabad, India", image:"/images/articles/cybersecurity-operations.png", href:"/events/healthcare-innovation-summit" },
  { month:"Sep", day:"12", title:"Sustainability Leadership Roundtable", description:"Driving sustainable growth for business and society.", location:"Singapore", image:"/images/articles/global-leadership.png", href:"/events/sustainability-leadership-roundtable" },
];
const topics = [[BriefcaseBusiness,"All Events"],[UsersRound,"Leadership"],[BarChart3,"Business & Economy"],[Sparkles,"Technology & AI"],[CircleDollarSign,"Markets & Investing"],[ShieldCheck,"Policy & Governance"],[HeartHandshake,"Healthcare"],[Globe2,"Sustainability"],[Lightbulb,"Innovation"],[Network,"Culture & Society"]] as const;
const schedule = [
  ["09:00 AM","Registration & Networking","Welcome coffee and connections"],
  ["10:00 AM","Welcome Address","Ava Morgan, Editor-in-Chief, The Perspective"],
  ["10:30 AM","Opening Keynote","Naveen Malhotra, CEO, Asteria Systems"],
  ["11:30 AM","Leadership Panel","The Future of Global Leadership"],
  ["01:00 PM","Networking Lunch","Private roundtables and introductions"],
  ["02:30 PM","Fireside Chat","Noor Rahman in conversation"],
  ["04:00 PM","The Innovation Imperative","Building the next decade"],
] as const;

function Breaking(){return <section className={styles.breaking}><div className={styles.shell}><strong>Breaking</strong><div><Link href="/article/markets-optimism">Markets reassess the path for interest rates</Link><Link href="/article/industrial-investment-strategy">Industrial investment moves back to the center of strategy</Link><Link href="/article/global-computing-capacity">Computing capacity becomes a global priority</Link></div><span><i/>Live</span></div></section>}
function SectionHeader({title,href,action="View all"}:{title:string;href?:string;action?:string}){return <header className={styles.sectionHeader}><h2>{title}</h2>{href?<Link href={href}>{action}<ArrowRight/></Link>:null}</header>}
function Portrait({index,sizes="140px"}:{index:number;sizes?:string}){const person=speaker(index);return <>{person.avatar?<Image alt={`Portrait of ${person.name}`} fill sizes={sizes} src={person.avatar.src}/>:null}</>}

function Hero(){return <section className={styles.hero}>
  <div className={`${styles.shell} ${styles.heroGrid}`}>
    <div className={styles.heroVisual}><Image alt="A fictional executive leadership summit in a grand auditorium" fill priority sizes="(max-width:900px) 100vw, 65vw" src="/images/events/leadership-summit-hero.png"/><span/>
      <div className={styles.heroCopy}><p>The Perspective Events</p><h1>Where Ideas, Leaders &amp;<br/>Industries Meet.</h1><p>Join the world’s most influential leaders, innovators and thinkers for conversations that shape the future.</p><ul><li><CalendarDays/>May 29–30, 2026</li><li><MapPin/>Bharat Mandapam, New Delhi</li><li><UsersRound/>1000+ Attendees Expected</li></ul><div><Link href="#register">Register Now</Link><Link href="#agenda">View Agenda</Link><Link href="#partner">Become a Partner</Link></div></div>
    </div>
    <aside className={styles.glance}><h2>Event at a Glance</h2><ul><li><CalendarDays/>May 29–30, 2026</li><li><MapPin/>Bharat Mandapam, New Delhi</li><li><Mic2/>40+ Speakers</li><li><Ticket/>12+ Sessions</li><li><UsersRound/>1000+ Attendees</li><li><Network/>Leadership · Business · Technology · Markets</li></ul><hr/><h3>Featured Speakers</h3><div>{[0,2,5,6].map((index)=><Link href={`/author/${speaker(index).slug}`} key={speaker(index).id}><span><Portrait index={index} sizes="75px"/></span><b>{speaker(index).name}</b></Link>)}</div></aside>
  </div>
</section>}

function Upcoming(){return <section className={styles.section}><div className={styles.shell}><SectionHeader action="View All Events" href="/search?q=event" title="Upcoming Events"/><div className={styles.eventCards}>{upcoming.map((event)=><article key={event.title}><Link className={styles.eventImage} href={event.href}><Image alt="" fill sizes="270px" src={event.image}/>{event.featured?<b>Featured</b>:null}</Link><div><time><b>{event.month}</b><strong>{event.day}</strong></time><div><h3><Link href={event.href}>{event.title}</Link></h3><p>{event.description}</p><span><MapPin/>{event.location}</span></div></div></article>)}</div></div></section>}
function Categories(){return <section className={styles.categorySection}><div className={styles.shell}><SectionHeader title="Browse Events by Category"/><nav>{topics.map(([Icon,label])=><Link href={label==="All Events"?"/events":`/search?q=${encodeURIComponent(label)}`} key={label}><Icon/><span>{label}</span></Link>)}</nav></div></section>}
function Speakers(){return <section className={styles.section}><div className={styles.shell}><SectionHeader href="/authors" title="Featured Speakers"/><div className={styles.speakers}>{authors.slice(0,8).map((author,index)=><Link href={`/author/${author.slug}`} key={author.id}><span><Portrait index={index}/></span><h3>{author.name}</h3><p>{author.role}</p><b>{author.expertise?.slice(0,2).join(" & ")}</b></Link>)}</div></div></section>}
function Intelligence(){return <section className={styles.section}><div className={`${styles.shell} ${styles.intelligence}`}>
  <section className={styles.agenda} id="agenda"><SectionHeader action="View Full Agenda" href="/search?q=event+agenda" title="Event Schedule (May 29 — Day 1)"/><ol>{schedule.map(([time,title,detail])=><li key={time}><time>{time}</time><div><b>{title}</b><p>{detail}</p></div></li>)}</ol><Link href="/search?q=event+agenda">View Complete Agenda</Link></section>
  <section className={styles.highlights}><SectionHeader action="View All Highlights" href="/videos" title="Past Event Highlights"/><Link className={styles.highlightLead} href="/videos"><Image alt="Leadership Summit highlights" fill sizes="420px" src="/images/events/leadership-summit-hero.png"/><span><Play/></span><h3>Leadership Summit 2025<br/>Key Highlights</h3></Link><div>{[0,1,2].map((index)=><Link href="/videos" key={index}><Image alt="" fill sizes="120px" src={index===1?"/images/articles/board-governance.png":"/images/events/leadership-summit-hero.png"}/><Play/></Link>)}</div></section>
  <section className={styles.why}><SectionHeader title="Why Attend"/><ul><li><UsersRound/>Hear from world-class leaders and industry pioneers</li><li><Lightbulb/>Gain insights on trends shaping the future</li><li><Network/>Network with decision makers and change agents</li><li><Ticket/>Access exclusive reports and event content</li></ul><Link href="#register">Register Now</Link></section>
  <section className={styles.partner} id="partner"><SectionHeader title="Partner With Us"/><p>Showcase your brand to a global audience of leaders and innovators.</p><ul><li><Handshake/>Brand Visibility</li><li><Mic2/>Speaking Opportunities</li><li><Lightbulb/>Thought Leadership</li><li><Network/>Networking Access</li></ul><Link href="/search?q=events+partnership">Explore Partnership</Link></section>
</div></section>}
function Ctas(){return <section className={styles.section} id="register"><div className={`${styles.shell} ${styles.ctas}`}><article><Ticket/><div><h2>Never Miss an Important Conversation.</h2><p>Subscribe to our Events Briefing and get exclusive invitations, insights and early access.</p><form action="/search" method="get"><input aria-label="Email address" name="q" placeholder="Enter your email address" type="email"/><button>Subscribe</button></form></div></article><article><Megaphone/><div><h2>Share Your Expertise. Inspire Leaders.</h2><p>Apply to speak, moderate or contribute to our upcoming events and summits.</p><Link href="/search?q=apply+speaker">Apply as a Speaker</Link></div></article><article className={styles.darkCta}><Image alt="Audience at an executive summit" fill sizes="370px" src="/images/events/leadership-summit-hero.png"/><span/><div><h2>Ideas. Connections.<br/>Impact.</h2><p>Be part of conversations that create the future.</p><Link href="#register">Register Now</Link></div></article></div></section>}
export function EventsPage({includeBreaking=true}:{includeBreaking?:boolean}={}){return <div className={styles.page}>{includeBreaking&&<Breaking/>}<Hero/><Upcoming/><Categories/><Speakers/><Intelligence/><Ctas/><section className={styles.archive}><div className={styles.shell}><p>The complete events archive</p><h2>Continue exploring events, speakers and coverage.</h2><p>The original event-search experience remains available below with every matching story and discovery tool.</p></div></section></div>}
