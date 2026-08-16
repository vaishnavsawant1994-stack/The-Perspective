import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Clock3,
  FileText,
  Handshake,
  Headphones,
  Mail,
  MapPin,
  Mic2,
  Newspaper,
  PenLine,
  Phone,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ContactEnquiryForm } from "./contact-enquiry-form";
import styles from "./contact-perspective-page.module.css";

const enquiryTypes = [
  { icon: PenLine, title: "Editorial Enquiries", copy: "Story ideas, feedback, corrections and general editorial questions.", action: "Contact Editorial", href: "#send-message" },
  { icon: UserRound, title: "Submit a Story / Pitch", copy: "Have an exclusive story or argument to share with our editorial team?", action: "Submit a Pitch", href: "#send-message" },
  { icon: BookOpen, title: "Personal Magazine", copy: "Enquire about publishing your own magazine with The Perspective.", action: "Enquire Now", href: "/personal-magazines/create" },
  { icon: Handshake, title: "Advertising & Partnerships", copy: "Brand partnerships, advertising opportunities and custom collaborations.", action: "Partner With Us", href: "#send-message" },
  { icon: CalendarDays, title: "Events & Speaker Enquiries", copy: "Speaking opportunities, event participation and sponsorship enquiries.", action: "Enquire Now", href: "#send-message" },
  { icon: Mic2, title: "Press / Media Enquiries", copy: "Media kits, interviews, press releases and journalist requests.", action: "Contact Press Office", href: "#send-message" },
  { icon: BriefcaseBusiness, title: "Careers", copy: "Explore opportunities to join our mission-driven editorial team.", action: "View Openings", href: "/search?q=careers" },
  { icon: Headphones, title: "Support & Subscriptions", copy: "Subscription help, account support and delivery assistance.", action: "Get Support", href: "#send-message" },
  { icon: Sparkles, title: "Other Enquiries", copy: "Have something else in mind? We are here to help.", action: "Contact Us", href: "#send-message" },
] as const;

const faqs = ["How do I submit a story idea or pitch?", "What topics does The Perspective cover?", "How do I publish my Personal Magazine?", "How can I advertise or partner with The Perspective?", "How do I update my subscription details?"] as const;

function Hero(){return <section className={styles.hero}><div className={styles.shell}><nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Home</Link><span>/</span><b>Contact The Perspective</b></nav><div className={styles.heroCard}><Image alt="The Perspective reception and editorial office" fill priority sizes="100vw" src="/images/contact/editorial-reception.png"/><div className={styles.heroCopy}><p>Contact The Perspective</p><h1>Start a Conversation<br/>With Us</h1><span>Whether you want to share a story, collaborate, advertise, publish a Personal Magazine, speak at an event, or simply get in touch, we will route your enquiry to the right team.</span><div><a href="#send-message">Contact Editorial</a><Link href="/personal-magazines/create">Personal Magazine Enquiry</Link><a href="#partnerships">Partner With Us</a></div></div><div className={styles.heroWordmark}><small>The</small><strong>Perspective.</strong></div></div></div></section>}

function EnquiryPaths(){return <section aria-labelledby="enquiry-title" className={styles.section}><div className={styles.shell}><header className={styles.sectionHeader}><h2 id="enquiry-title">Choose Your Enquiry Type</h2></header><div className={styles.enquiryGrid}>{enquiryTypes.map(({icon:Icon,title,copy,action,href})=><Link href={href} key={title}><Icon/><h3>{title}</h3><p>{copy}</p><b>{action}<ArrowRight/></b></Link>)}</div></div></section>}

function ContactPanel(){return <section className={styles.section} id="send-message"><div className={`${styles.shell} ${styles.contactGrid}`}><section aria-labelledby="form-title" className={styles.panel}><header className={styles.panelHeader}><h2 id="form-title">Send Us a Message</h2><p>Complete the form and our routing desk will place your enquiry with the appropriate team.</p></header><ContactEnquiryForm/></section><aside className={styles.sideRail}><section><h2>Get in Touch</h2><ul><li><Mail/><div><b>Email Us</b><a href="mailto:hello@theperspective.com">hello@theperspective.com</a></div></li><li><Phone/><div><b>Call Us</b><a href="tel:+911145678900">+91 11 4567 8900</a><span>Mon–Fri, 9:30 AM–6:30 PM (IST)</span></div></li><li><MapPin/><div><b>Our Office</b><span>The Perspective Media Pvt. Ltd.<br/>5th Floor, DLF One Midtown,<br/>New Delhi – 110001, India</span></div></li><li><Clock3/><div><b>Response Time</b><span>We aim to respond within 1–2 business days.</span></div></li></ul></section><section className={styles.guidelines}><FileText/><div><h2>Editorial Guidelines</h2><p>Before you pitch, review our focus, standards and the stories we prioritize.</p><Link href="/search?q=editorial+guidelines">View Editorial Guidelines <ArrowRight/></Link></div></section></aside></div></section>}

function Support(){return <section className={styles.section}><div className={`${styles.shell} ${styles.supportGrid}`}><section className={styles.faq}><header className={styles.sectionHeader}><h2>Frequently Asked Questions</h2></header>{faqs.map((faq,index)=><details key={faq}><summary>{faq}<span>+</span></summary><p>{index===0?"Send a concise outline through the form above. Include the central argument, why it matters now and any original access or evidence you can provide.":index===1?"We cover business, leadership, technology, markets, policy, culture and the people building consequential institutions.":index===2?"Our Personal Magazine team will guide you through discovery, interviews, writing, design and digital publication.":index===3?"Choose Advertising & Partnerships in the form and tell us your goals, audience and preferred collaboration format.":"Select Support & Subscriptions and include the email address associated with your account."}</p></details>)}<Link href="/search?q=contact+faq">View All FAQs <ArrowRight/></Link></section><section className={styles.stay}><Mail/><div><h2>Stay Informed</h2><p>Get the latest news, stories, events and special announcements from The Perspective.</p><form action="/search" method="get"><input aria-label="Email address" name="q" placeholder="Enter your email address" type="email"/><button>Subscribe</button></form><span>No spam. Unsubscribe anytime.</span></div></section></div></section>}

function Closing(){return <section className={styles.closing} id="partnerships"><div className={styles.shell}><article><Newspaper/><div><h2>Want to share a story that matters?</h2><p>We are always looking for bold perspectives, exclusive insights and stories that shape our world.</p></div><a href="#send-message">Submit a Story</a></article><article><Handshake/><div><h2>Partner with a trusted media brand</h2><p>From custom content to integrated campaigns, let us create impact together.</p></div><a href="#send-message">Partner With Us</a></article></div></section>}

export function ContactPerspectivePage(){return <div className={styles.page} data-contact-page><Hero/><EnquiryPaths/><ContactPanel/><Support/><Closing/><section className={styles.archiveBridge}><div className={styles.shell}><p>Continue exploring</p><h2>The current contact discovery experience remains below.</h2><span>Browse matching support, editorial and company information from across The Perspective.</span></div></section></div>}
