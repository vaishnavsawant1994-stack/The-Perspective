"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Activity, AlertTriangle, ArrowRight, AtSign as Linkedin, BarChart3, BookOpen, Bookmark,
  Briefcase, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight,
  CircleDollarSign, Clock3, Copy, CreditCard, Download, Eye, FileText,
  Filter, GitBranch, Inbox, Link2, ListChecks, Mail, MessageSquare,
  MoreHorizontal, Phone, Play, Plus, Rocket, Save,
  Search, Send, ShieldCheck, Sparkles, Target, TrendingUp, Upload, UserPlus,
  Users, WalletCards, XCircle,
} from "lucide-react";
import s from "./commercial.module.css";
import {
  type R6CampaignRow,
  type R6DealRow,
  type R6LeadRow,
  useR6Collection,
} from "./r6-live-data";

type Icon = React.ComponentType<{ size?: number }>;
type MetricData = { label: string; value: string; change?: string; icon: Icon };
const portraits = [
  "/images/articles/marcus-chen.png",
  "/images/articles/elena-rossi.png",
  "/images/articles/arjun-mehta.png",
  "/images/articles/daniel-kim.png",
];

const leads = [
  ["Michael Chen", "CEO & Co-Founder", "NovaAI", "92", "Personal Magazine", "LinkedIn", "John Smith", "Interested", "May 16 · 11:00 AM"],
  ["Sarah Johnson", "President", "HealthLytics", "88", "Podcast Guest", "Website", "Emma Davis", "Replied", "May 15 · 2:30 PM"],
  ["Arjun Mehta", "Founder & CEO", "NextPay", "85", "Personal Magazine", "Crunchbase", "John Smith", "Contacted", "May 17 · 10:30 AM"],
  ["David Wilson", "VP of Strategy", "Globex Corp", "82", "Article / Interview", "Press & News", "Liam Brown", "Outreach Ready", "May 14 · 9:00 AM"],
  ["Emily Park", "Co-Founder", "FutureLabs AI", "79", "Podcast Guest", "Events", "Emma Davis", "Qualified", "May 14 · 4:00 PM"],
  ["James Anderson", "Director of Innovation", "BluePeak Partners", "76", "Partnership", "LinkedIn", "John Smith", "Follow Up", "May 16 · 9:00 AM"],
  ["Lisa Rodriguez", "CEO", "QuantumX", "75", "Personal Magazine", "Podcast Guests", "Sophia Lee", "No Response", "May 20 · 10:00 AM"],
  ["Daniel Kim", "CTO", "CyberShield", "72", "Article / Interview", "Website", "Liam Brown", "Qualification", "May 15 · 11:30 AM"],
];

function Button({ children, primary = false, danger = false, success = false, href }: { children: React.ReactNode; primary?: boolean; danger?: boolean; success?: boolean; href?: string }) {
  const cls = `${s.button} ${primary ? s.primary : ""} ${danger ? s.danger : ""} ${success ? s.success : ""}`;
  return href ? <Link className={cls} href={href}>{children}</Link> : <button className={cls} type="button">{children}</button>;
}
function Header({ title, subtitle, children }: { title: string; subtitle: string; children?: React.ReactNode }) {
  return <header className={s.header}><div><h1>{title}</h1><p>{subtitle}</p></div><div className={s.actions}>{children}</div></header>;
}
function Metric({ data }: { data: MetricData }) { const I = data.icon; return <article className={s.metric}><span><I size={19} /></span><div><small>{data.label}</small><strong>{data.value}</strong>{data.change && <em>↑ {data.change}</em>}</div></article>; }
function Metrics({ items }: { items: MetricData[] }) { return <div className={s.metricGrid}>{items.map(x => <Metric data={x} key={x.label} />)}</div>; }
function Panel({ title, action, children, className = "" }: { title: string; action?: string; children: React.ReactNode; className?: string }) {
  return <section className={`${s.panel} ${className}`}><header><h2>{title}</h2>{action && <button type="button">{action} <ChevronRight size={12} /></button>}</header>{children}</section>;
}
function Tabs({ tabs }: { tabs: string[] }) { const [active, setActive] = useState(0); return <nav className={s.tabs}>{tabs.map((x, i) => <button className={i === active ? s.active : ""} onClick={() => setActive(i)} type="button" key={x}>{x}</button>)}</nav>; }
function Filters({ crm = false }: { crm?: boolean }) { return <div className={s.filterBar}><label className={s.search}><Search size={14} /><input placeholder={crm ? "Search by name, company, email or phone…" : "Search records…"} /></label>{["All statuses", "All owners", "All sources", "Best fit", "Lead score"].map(x => <button className={s.select} key={x} type="button">{x}<ChevronDown size={12} /></button>)}</div>; }
function Bulk({ outreach = false }: { outreach?: boolean }) { return <div className={s.bulk}><span><input type="checkbox" /> 0 selected</span><Button><UserPlus size={13} /> Assign owner</Button><Button>{outreach ? <Play size={13} /> : <Rocket size={13} />}{outreach ? "Resume" : "Add to campaign"}</Button><Button><ListChecks size={13} /> Create task</Button><Button><Bookmark size={13} /> Add to list</Button><Button><Download size={13} /> Export</Button></div>; }
function PersonCell({ row, index }: { row: string[]; index: number }) { return <span className={s.person}><Image alt={`${row[0]} portrait`} src={portraits[index % portraits.length]} width={32} height={32} /><b>{row[0]}</b><small>{row[1]}</small></span>; }
function Status({ value }: { value: string }) { const cls = /No|Failed|Lost/.test(value) ? s.bad : /Follow|Ready|Partial|Pending/.test(value) ? s.warn : /Contacted|Replied/.test(value) ? s.blue : ""; return <em className={`${s.pill} ${cls}`}>{value}</em>; }

function LeadDrawer() { return <aside className={s.drawer}><header><b>Lead / Contact Context</b><button type="button">×</button></header><div className={s.drawerProfile}><Image src={portraits[0]} width={58} height={58} alt="Michael Chen" /><h3>Michael Chen</h3><p>CEO & Co-Founder at NovaAI</p><small>San Francisco, CA, USA</small></div><nav><button>Overview</button><button>Activity</button><button>Notes</button><button>Tasks</button></nav><h4>Contact information</h4><p className={s.detail}><span>Email</span><b>michael.chen@novaai.com</b></p><p className={s.detail}><span>Phone</span><b>+1 (415) 555-0123</b></p><p className={s.detail}><span>LinkedIn</span><b>Verified</b></p><h4>Company information</h4>{[["Company", "NovaAI"], ["Industry", "Artificial Intelligence"], ["Company size", "51–200 employees"], ["Revenue", "$10M–$50M"]].map(x => <p className={s.detail} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></p>)}<h4>Lead intelligence</h4><p className={s.detail}><span>Lead / Fit / Contact</span><b>92 · 96 · 95%</b></p><p className={s.detail}><span>Status</span><Status value="Interested" /></p><Button primary><Send size={14} /> Start Outreach</Button><div className={s.inlineActions}><Button><CalendarDays size={13} /> Meeting</Button><Button><Briefcase size={13} /> Convert</Button></div></aside>; }

export function LeadCRM() {
  const live = useR6Collection<R6LeadRow>("/api/v1/r6/leads?limit=50");
  const count = (state: string) =>
    live.items.filter((item) => item.lifecycleState === state).length;
  const metrics: MetricData[] = [
    { label: "Authorized leads", value: String(live.items.length), icon: Users },
    { label: "New leads", value: String(count("NEW")), icon: Sparkles },
    { label: "Qualified", value: String(count("QUALIFIED")), icon: ShieldCheck },
    { label: "Outreach ready", value: String(count("OUTREACH_READY")), icon: Rocket },
    { label: "Contacted", value: String(count("CONTACTED")), icon: Phone },
    { label: "Replied", value: String(count("REPLIED")), icon: Mail },
    { label: "Interested", value: String(count("INTERESTED")), icon: CheckCircle2 },
    { label: "Nurture", value: String(count("NURTURE")), icon: Clock3 },
    { label: "Converted", value: String(count("CONVERTED")), icon: TrendingUp },
  ];
  const first = live.items[0];

  return <div className={s.page}>
    <Header title="Lead CRM" subtitle="Live R6 CRM data filtered through the current authenticated tenant and authorization scope.">
      <Button><Save size={14} /> Save view</Button><Button><Filter size={14} /> Advanced filters</Button>
    </Header>
    <Metrics items={metrics} />
    <Tabs tabs={[`All authorized · ${live.items.length}`, `Qualified · ${count("QUALIFIED")}`, `Outreach ready · ${count("OUTREACH_READY")}`, `Interested · ${count("INTERESTED")}`, `Converted · ${count("CONVERTED")}`]} />
    <Filters crm /><Bulk />
    <div className={s.gridWithDrawer}>
      <section>
        <div className={s.table}>
          <div className={s.tableHead}><span /><span>Lead</span><span>Company</span><span>Contact</span><span>Fit score</span><span>Qualification</span><span>Source</span><span>Owner</span><span>Status</span><span>Last activity</span><span /></div>
          {live.items.map((item, i) => <div className={s.tableRow} key={item.id}>
            <input type="checkbox" />
            <PersonCell row={[`Lead ${item.id.slice(0, 8)}`, item.resourceId.slice(0, 8)]} index={i} />
            <b>{item.companyId ? item.companyId.slice(0, 8) : "—"}</b>
            <span>{item.contactId ? item.contactId.slice(0, 8) : "—"}</span>
            <span className={s.score}>{item.fitScore ?? "—"}</span>
            <span>{item.qualificationState ?? "—"}</span>
            <span>{item.leadSourceId ? item.leadSourceId.slice(0, 8) : "—"}</span>
            <span>{item.ownerMembershipId ? item.ownerMembershipId.slice(0, 8) : "Unassigned"}</span>
            <Status value={item.lifecycleState.replaceAll("_", " ")} />
            <span>{item.lastActivityAt ? new Date(item.lastActivityAt).toLocaleDateString() : "—"}</span>
            <MoreHorizontal size={15} />
          </div>)}
        </div>
        <div className={s.miniCharts}>
          <Panel title="Live data status"><p>{live.loading ? "Loading authorized CRM records…" : live.error ? "Live CRM data is unavailable for this session." : `${live.items.length} authorized records loaded.`}</p></Panel>
          <Panel title="Lifecycle coverage"><Ranked names={["NEW", "QUALIFIED", "OUTREACH_READY", "CONTACTED", "REPLIED", "INTERESTED"].filter((state) => count(state) > 0)} /></Panel>
        </div>
      </section>
      <aside className={s.drawer}>
        <header><b>Authorized Lead Context</b></header>
        {first ? <>
          <h3>Lead {first.id.slice(0, 8)}</h3>
          <Status value={first.lifecycleState.replaceAll("_", " ")} />
          <p className={s.detail}><span>Resource</span><b>{first.resourceId.slice(0, 8)}</b></p>
          <p className={s.detail}><span>Company</span><b>{first.companyId?.slice(0, 8) ?? "—"}</b></p>
          <p className={s.detail}><span>Contact</span><b>{first.contactId?.slice(0, 8) ?? "—"}</b></p>
          <p className={s.detail}><span>Fit score</span><b>{first.fitScore ?? "—"}</b></p>
          <p className={s.detail}><span>Qualification</span><b>{first.qualificationState ?? "—"}</b></p>
          <p className={s.detail}><span>Owner</span><b>{first.ownerMembershipId?.slice(0, 8) ?? "Unassigned"}</b></p>
        </> : <p>{live.loading ? "Loading…" : "No authorized leads are available."}</p>}
      </aside>
    </div>
  </div>;
}

function Ranked({ names }: { names: string[] }) { return <div>{names.map((x, i) => <div className={s.detail} key={x}><span>{x}</span><b>{428 - i * 72}</b></div>)}</div>; }

const campaigns = [
  ["Personal Magazine Q2", "Personal Magazine", "High Net Worth Executives", "John Smith", "428", "3,842", "9.3%", "98", "36", "Running"],
  ["Tech Leaders Podcast", "Podcast Feature", "Technology Leaders", "Emma Davis", "612", "5,621", "8.1%", "76", "28", "Running"],
  ["Executive Article Series", "Article / Interview", "C-Level Executives", "Liam Brown", "336", "2,145", "7.6%", "42", "18", "Paused"],
  ["Business Leadership Summit", "Event Invitation", "Founders & CEOs", "Sophia Lee", "780", "0", "0%", "0", "0", "Scheduled"],
  ["Investor & VC Outreach", "Partnership", "Investors & VCs", "Noah Williams", "276", "1,985", "6.2%", "28", "9", "Running"],
  ["Health Innovators Feature", "Content", "Healthcare Leaders", "Olivia Martinez", "189", "1,042", "5.8%", "15", "6", "Completed"],
];
export function OutreachHub() {
  const live = useR6Collection<R6CampaignRow>("/api/v1/r6/outreach/campaigns?limit=50");
  const sent = live.items.reduce((sum, item) => sum + item.sentCount, 0);
  const replies = live.items.reduce((sum, item) => sum + item.replyCount, 0);
  const positive = live.items.reduce((sum, item) => sum + item.positiveReplyCount, 0);
  const enrolled = live.items.reduce((sum, item) => sum + item.recipientCount, 0);
  const active = live.items.filter((item) => ["RUNNING", "SCHEDULED"].includes(item.status)).length;
  const metrics: MetricData[] = [
    { label: "Authorized campaigns", value: String(live.items.length), icon: Users },
    { label: "Active campaigns", value: String(active), icon: Play },
    { label: "Leads enrolled", value: String(enrolled), icon: UserPlus },
    { label: "Messages sent", value: String(sent), icon: Mail },
    { label: "Replies", value: String(replies), icon: MessageSquare },
    { label: "Positive replies", value: String(positive), icon: Sparkles },
    { label: "Reply rate", value: sent > 0 ? `${((replies / sent) * 100).toFixed(1)}%` : "0%", icon: Target },
  ];
  const first = live.items[0];

  return <div className={s.page}>
    <Header title="Outreach Campaigns / Outreach Hub" subtitle="Live R6 communications data; provider delivery truth is not inferred from browser actions.">
      <Button>Campaign settings</Button><Button primary href="/app/outreach/sequences/personal-magazine-q2"><Plus size={15} /> Create campaign</Button>
    </Header>
    <Metrics items={metrics} />
    <div className={s.gridWithDrawer}>
      <section>
        <Tabs tabs={[`All authorized · ${live.items.length}`, `Active · ${active}`, `Draft · ${live.items.filter((x) => x.status === "DRAFT").length}`, `Scheduled · ${live.items.filter((x) => x.status === "SCHEDULED").length}`, `Paused · ${live.items.filter((x) => x.status === "PAUSED").length}`]} />
        <Filters /><Bulk outreach />
        <div className={`${s.table} ${s.campaignTable}`}>
          <div className={s.tableHead}><span /><span>Campaign</span><span>Lead list</span><span>Sequence</span><span>Owner</span><span>Enrolled</span><span>Sent</span><span>Reply rate</span><span>Positive</span><span>Status</span><span /></div>
          {live.items.map((item) => {
            const rate = item.sentCount > 0 ? `${((item.replyCount / item.sentCount) * 100).toFixed(1)}%` : "0%";
            return <div className={s.tableRow} key={item.id}>
              <input type="checkbox" />
              <span><b>{item.name}</b><small>{item.id.slice(0, 8)}</small></span>
              <span>{item.leadListId.slice(0, 8)}</span>
              <span>{item.sequenceId.slice(0, 8)}</span>
              <span>{item.sendingAccountId.slice(0, 8)}</span>
              <b>{item.recipientCount}</b>
              <span>{item.sentCount}</span>
              <b>{rate}</b>
              <span>{item.positiveReplyCount}</span>
              <Status value={item.status} />
              <MoreHorizontal size={15} />
            </div>;
          })}
        </div>
        <div className={s.miniCharts}>
          <Panel title="Live data status"><p>{live.loading ? "Loading authorized campaign records…" : live.error ? "Live communications data is unavailable for this session." : `${live.items.length} authorized campaigns loaded.`}</p></Panel>
          <Panel title="Current outcomes"><p>{replies} replies · {positive} positive replies · {sent} sent events recorded</p></Panel>
        </div>
      </section>
      <aside className={s.drawer}>
        <header><b>Campaign Overview</b></header>
        {first ? <>
          <Status value={first.status} /><h3>{first.name}</h3>
          <p className={s.detail}><span>Recipients</span><b>{first.recipientCount}</b></p>
          <p className={s.detail}><span>Sent</span><b>{first.sentCount}</b></p>
          <p className={s.detail}><span>Replies</span><b>{first.replyCount}</b></p>
          <p className={s.detail}><span>Positive replies</span><b>{first.positiveReplyCount}</b></p>
          <p className={s.detail}><span>Row version</span><b>{first.rowVersion}</b></p>
        </> : <p>{live.loading ? "Loading…" : "No authorized campaigns are available."}</p>}
      </aside>
    </div>
  </div>;
}

function MiniBars() { return <div className={s.bars}>{[38, 52, 46, 65, 73, 69, 84, 91].map((x, i) => <i key={i} style={{ height: `${x}%` }} />)}</div>; }
function CompactList({ items }: { items: string[] }) { return <div className={s.list}>{items.map((x, i) => <div key={x}><span className={s.pill}>{i + 1}</span><p><b>{x}</b><small>{i * 18 + 2}m ago</small></p></div>)}</div>; }

export function SequenceBuilder() { return <div className={s.page}><Header title="Personal Magazine Q2 — Outreach Sequence" subtitle="Build communication steps, conditions, delays and automated stop rules."><Button><Save size={14} /> Save draft</Button><Button><Send size={14} /> Test sequence</Button><Button primary>Prepare for review <ChevronDown size={13} /></Button></Header><section className={s.surface}><div className={s.summaryStrip}>{[["Audience / List", "High Net Worth Executives"], ["Leads", "428"], ["Sending Account", "john.smith@perspective.com"], ["Goal", "Book a meeting"], ["Owner", "John Smith"], ["Status", "Draft"], ["Updated", "10:24 AM"]].map(x => <div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div></section><Tabs tabs={["Sequence Builder", "Step Analytics", "Lead Rules", "Sending Settings", "Approvals", "Version History"]} /><div className={s.sequenceLayout}><Panel title="Add Step"><div className={s.toolbox}>{[[Mail, "Email"], [Linkedin, "LinkedIn Message"], [Phone, "Call Task"], [MessageSquare, "SMS Message"], [ListChecks, "Manual Task"], [Clock3, "Wait"], [GitBranch, "If / Else"], [Eye, "Email Opened"]].map(([I, x]) => { const C = I as Icon; return <button key={x as string}><C size={13} /> {x as string}</button>; })}</div></Panel><section className={`${s.panel} ${s.canvas}`}><FlowStep n="1" title="Initial Email" detail="Personalized introduction & value" /><div className={s.connector} /><div className={s.condition}>Wait · 2 Days</div><div className={s.connector} /><div className={s.condition}>Did lead reply?</div><div className={s.connector} /><FlowStep n="2" title="Follow-up Email 1" detail="Share social proof & case study" /><div className={s.connector} /><div className={s.condition}>Wait · 3 Days</div><div className={s.connector} /><div className={s.condition}>Meeting booked?</div><div className={s.connector} /><FlowStep n="3" title="Follow-up Email 2" detail="Address objections & final nudge" /><div className={s.connector} /><FlowStep n="4" title="Final Follow-up Email" detail="Last attempt · break up or value" /></section><Panel title="Edit Step" className={s.editor}><Tabs tabs={["Edit Step", "Preview"]} /><label>Send from</label><input defaultValue="John Smith <john.smith@perspective.com>" /><label>Subject Line</label><input defaultValue="{{first_name}}, a quick idea for {{company_name}}" /><label>Email Body</label><textarea defaultValue={`Hi {{first_name}},\n\nI came across {{company_name}} and was impressed by what you're building in {{industry}}.\n\nWe create premium personal magazines that help leaders build authority, global visibility and credibility.\n\nWould you be open to a quick 15-minute call next week?\n\nBest regards,\n{{sender_name}}`} /><h4>Personalization</h4><div className={s.inlineActions}>{["{{first_name}}", "{{last_name}}", "{{company_name}}", "{{job_title}}"].map(x => <Status key={x} value={x} />)}</div></Panel></div><section className={`${s.surface} ${s.workflow}`}>{[[Mail, "Sequence steps", "7 steps"], [Clock3, "Estimated duration", "9 days"], [ShieldCheck, "Automated stops", "5 rules active"], [Activity, "A/B tests", "3 steps"], [Users, "Enrollment", "428 leads"], [CheckCircle2, "Approval", "Not submitted"]].map(([I, a, b]) => { const C = I as Icon; return <article key={a as string}><span><C size={16} /></span><p><b>{a as string}</b><small>{b as string}</small></p></article>; })}</section></div>; }
function FlowStep({ n, title, detail }: { n: string; title: string; detail: string }) { return <div className={s.step}><span className={s.pill}>{n}</span><Mail size={17} /><p><strong>{title}</strong><small>{detail}</small></p><Status value="A/B" /></div>; }

const threads = ["Michael Chen", "Sarah Johnson", "Arjun Mehta", "David Wilson", "Emily Park", "James Anderson", "Lisa Rodriguez", "Daniel Kim", "Priya Patel"];
export function UnifiedInbox() { return <div className={s.page}><Header title="Unified Inbox / Replies" subtitle="Manage prospect and client conversations with complete CRM context."><Button>Connect Account</Button><Button>Email Settings</Button><Button primary><Send size={14} /> Compose</Button></Header><Metrics items={[["Total conversations", "1,284", "14.6%", Inbox], ["Unread", "186", "8.3%", Mail], ["Positive replies", "48", undefined, CheckCircle2], ["Needs response", "72", undefined, MessageSquare], ["Follow-ups due", "29", undefined, Clock3], ["Meetings booked", "14", "27.3%", CalendarDays], ["Opportunities created", "11", "22.2%", Briefcase]].map(([label, value, change, icon]) => ({ label: label as string, value: value as string, change: change as string | undefined, icon: icon as Icon }))} /><div className={s.inboxLayout}><aside className={s.mailNav}><h3>Email Accounts</h3>{["john.smith@perspective.com", "sales@perspective.com", "outreach@perspective.com"].map((x, i) => <button key={x}>{x}<b>{486 - i * 160}</b></button>)}<h3>Smart Views</h3>{["All Mail", "Unread", "Assigned to Me", "Positive Replies", "Needs Response", "Follow-up Required", "Leads", "Opportunities", "Clients", "Sent", "Snoozed", "Archived"].map((x, i) => <button key={x}>{x}<b>{[1284, 186, 42, 48, 72, 29, 342, 86, 124, 4892, 12, 1120][i]}</b></button>)}</aside><section className={s.threadList}><label className={s.search}><Search size={14} /><input placeholder="Search in mail…" /></label><Tabs tabs={["All", "Unread", "Positive", "Needs Response"]} />{threads.map((x, i) => <article className={s.thread} key={x}><Image src={portraits[i % 4]} width={36} height={36} alt="" /><p><b>{x}</b><small>{i % 2 ? "Re: Leadership Feature Interview" : "Re: Personal Magazine Opportunity"}</small><small>Thank you for reaching out. I’d love to discuss this further…</small></p><time>{i ? `May ${16 - i}` : "10:24"}</time></article>)}</section><section className={s.conversation}><div className={s.messageHead}><Image src={portraits[0]} width={44} height={44} alt="" /><div><h2>Re: Personal Magazine Opportunity</h2><b>Michael Chen</b><small> · CEO & Co-Founder, NovaAI</small></div><Status value="Positive Reply" /></div><div className={s.messageBody}><p>Hi John,</p><p>Thank you for sharing the details about The Perspective and the personal magazine opportunity. This looks very interesting and aligned with what we’re building at NovaAI.</p><p>I’d love to schedule a call to discuss the editorial process, distribution, previous executive features and package options.</p><p>Best regards,<br /><b>Michael Chen</b><br />CEO & Co-Founder, NovaAI</p></div><div className={s.inlineActions}><Button>Reply</Button><Button>Reply All</Button><Button>Forward</Button></div><div className={s.reply}><Tabs tabs={["Reply", "Internal Note"]} /><textarea defaultValue="Hi Michael,\n\nThank you for your positive response. I'd be happy to schedule a call next week to discuss this further.\n\nBest regards,\nJohn Smith" /><footer><Button>Save Draft</Button><Button primary><Send size={13} /> Send Reply</Button></footer></div></section><aside className={s.context}><LeadDrawer /></aside></div></div>; }

export function MeetingsFollowups() { return <div className={s.page}><Header title="Meetings & Follow-ups" subtitle="Manage meetings, calls, outcomes and controlled next actions."><Button>Meeting Settings</Button><Button primary><Plus size={14} /> Schedule Meeting</Button></Header><Metrics items={[["Upcoming meetings", "14", "16%", CalendarDays], ["Completed this week", "9", "12%", CheckCircle2], ["Follow-ups due today", "7", "40%", Clock3], ["Overdue follow-ups", "5", undefined, AlertTriangle], ["No shows", "2", undefined, XCircle], ["Cancelled", "3", undefined, XCircle]].map(([label, value, change, icon]) => ({ label: label as string, value: value as string, change: change as string | undefined, icon: icon as Icon }))} /><div className={s.calendarLayout}><Panel title="May 2026"><div className={s.miniCalendar}>{["M", "T", "W", "T", "F", "S", "S", ...Array.from({ length: 31 }, (_, i) => `${i + 1}`)].map((x, i) => <b key={`${x}${i}`}>{x}</b>)}</div><h2>My Calendars</h2>{["My Meetings", "Team Meetings", "Editorial Meetings", "Client Meetings", "Personal"].map(x => <p key={x}><input type="checkbox" defaultChecked /> {x}</p>)}</Panel><section><Tabs tabs={["Calendar", "Agenda", "Day", "Week", "Month", "Timeline"]} /><div className={s.week}><div className={s.weekGrid}>{Array.from({ length: 80 }, (_, i) => <span key={i}>{i < 8 ? ["", "Mon 13", "Tue 14", "Wed 15", "Thu 16", "Fri 17", "Sat 18", "Sun 19"][i] : i % 8 === 0 ? `${Math.floor(i / 8) + 7}:00` : ""}</span>)}{[["Discovery Call", 18, ""], ["Intro Call", 27, ""], ["Product Demo", 36, "green"], ["Proposal Discussion", 45, "orange"], ["Client Meeting", 54, "green"], ["Partnership Call", 63, "orange"]].map(([x, p, c]) => <div className={`${s.event} ${c ? s[c] : ""}`} style={{ gridColumn: (Number(p) % 7) + 2, gridRow: Math.floor(Number(p) / 8) + 2 }} key={x}>{x}<small>10:00 AM</small></div>)}</div></div><Panel title="Follow-ups" action="Add follow-up" className={s.followTable}><div className={s.table}><div className={s.tableHead}><span /><span>Follow-up</span><span>Related To</span><span>Owner</span><span>Due</span><span>Status</span><span /></div>{["Follow up on proposal feedback", "Send pricing & packages", "Check availability for next call", "Share editorial calendar", "Prepare case study"].map((x, i) => <div className={s.tableRow} key={x}><input type="checkbox" /><b>{x}</b><span>{leads[i][0]}<small>{leads[i][2]}</small></span><span>John Smith</span><span>May {16 + i}, 2026</span><Status value={i < 4 ? "Due Today" : "Upcoming"} /><MoreHorizontal size={14} /></div>)}</div></Panel></section><aside><Panel title="Meeting Detail"><Status value="Upcoming" /><h3>Discovery Call with Arjun Mehta</h3><CompactList items={["Thursday, May 16, 2026", "9:00 AM – 10:00 AM (PDT)", "Google Meet", "2 attendees"]} /><h2>Preparation Notes</h2><p>Focus on brand visibility, thought leadership and reach. Discuss the timeline for the Q3 edition.</p><h2>Agenda</h2>{["Introduction & rapport", "Company background", "Business goals", "How The Perspective can help", "Next steps"].map(x => <p key={x}><input type="checkbox" defaultChecked /> {x}</p>)}<Button>Reschedule</Button><Button danger>Cancel Meeting</Button><Button primary>Mark as Completed</Button></Panel></aside></div></div>; }

const stages = ["Qualified", "Interested", "Discovery Scheduled", "Discovery Completed", "Proposal Preparation", "Proposal Sent"];
export function DealsPipeline() {
  const live = useR6Collection<R6DealRow>("/api/v1/r6/deals?limit=50");
  const totalMinor = live.items.reduce((sum, item) => sum + Number(item.amountMinor ?? 0), 0);
  const weightedMinor = live.items.reduce((sum, item) => sum + Number(item.amountMinor ?? 0) * Number(item.probability ?? 0), 0);
  const currency = live.items.find((item) => item.currency)?.currency ?? "USD";
  const money = (minor: number) => new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
  const groups = new Map<string, R6DealRow[]>();
  for (const item of live.items) {
    const group = groups.get(item.stageId) ?? [];
    group.push(item);
    groups.set(item.stageId, group);
  }
  const first = live.items[0];
  const metrics: MetricData[] = [
    { label: "Authorized deals", value: String(live.items.length), icon: Briefcase },
    { label: "Pipeline value", value: money(totalMinor), icon: WalletCards },
    { label: "Weighted pipeline", value: money(weightedMinor), icon: TrendingUp },
    { label: "With expected close", value: String(live.items.filter((x) => Boolean(x.expectedCloseDate)).length), icon: CalendarDays },
  ];

  return <div className={s.page}>
    <Header title="Deals Pipeline" subtitle="Live R6 commercial data capped at the accepted PROPOSAL_PREPARATION boundary.">
      <Button>Pipeline Settings</Button><Button primary href="/app/deals/nextpay-personal-magazine-q2"><Plus size={14} /> Create Deal</Button>
    </Header>
    <Metrics items={metrics} />
    <div className={s.surface}><div className={s.filters}><Button>Authorized pipeline</Button><Button>Kanban / List</Button><Button><Filter size={13} /> Filters</Button></div></div>
    <div className={s.gridWithDrawer}>
      <section>
        <div className={s.kanban}>
          {[...groups.entries()].map(([stageId, deals]) => <section className={s.column} key={stageId}>
            <header><b>Stage {stageId.slice(0, 8)}</b><span>{deals.length}</span></header>
            <small>{money(deals.reduce((sum, deal) => sum + Number(deal.amountMinor ?? 0), 0))}</small>
            {deals.map((deal) => <article className={s.dealCard} key={deal.id}>
              <h3>Deal {deal.id.slice(0, 8)}</h3>
              <p>Company {deal.companyId?.slice(0, 8) ?? "—"}</p>
              <strong>{money(Number(deal.amountMinor ?? 0))}</strong>
              <footer><span>{deal.expectedCloseDate ?? "No close date"}</span><Status value={deal.probability ? `${Number(deal.probability) * 100}%` : "No probability"} /></footer>
            </article>)}
          </section>)}
        </div>
        <div className={s.dashboardGrid}>
          <Panel title="Live data status"><p>{live.loading ? "Loading authorized deals…" : live.error ? "Live commercial data is unavailable for this session." : `${live.items.length} authorized deals loaded.`}</p></Panel>
          <Panel title="R6 ceiling"><p>Commercial execution remains capped at PROPOSAL_PREPARATION. Proposal production, contracts, invoices and payments are not activated.</p></Panel>
        </div>
      </section>
      <aside className={s.drawer}>
        <header><b>Deal Overview</b></header>
        {first ? <>
          <div className={s.drawerProfile}><span className={s.score}>D</span><h3>Deal {first.id.slice(0, 8)}</h3><p>Stage {first.stageId.slice(0, 8)}</p></div>
          <p className={s.detail}><span>Value</span><b>{money(Number(first.amountMinor ?? 0))}</b></p>
          <p className={s.detail}><span>Probability</span><b>{first.probability ? `${Number(first.probability) * 100}%` : "—"}</b></p>
          <p className={s.detail}><span>Expected close</span><b>{first.expectedCloseDate ?? "—"}</b></p>
          <p className={s.detail}><span>Owner</span><b>{first.ownerMembershipId?.slice(0, 8) ?? "Unassigned"}</b></p>
          <p className={s.detail}><span>Row version</span><b>{first.rowVersion}</b></p>
        </> : <p>{live.loading ? "Loading…" : "No authorized deals are available."}</p>}
      </aside>
    </div>
  </div>;
}

export function DealWorkspace() { return <div className={s.page}><Header title="NextPay Technologies — Personal Magazine Q2" subtitle="360° opportunity workspace · Interested · On track"><Button><Mail size={14} /> Send Email</Button><Button><CalendarDays size={14} /> Schedule Meeting</Button><Button primary href="/app/proposals/prop-2024-0157"><FileText size={14} /> Create Proposal</Button></Header><section className={s.surface}><div className={s.summaryStrip}>{[["Deal Value", "$150,000"], ["Probability", "50%"], ["Expected Close", "May 30, 2026"], ["Owner", "John Smith"], ["Source", "Outbound"], ["Lead Score", "85 High"], ["Deal Health", "On Track"]].map(x => <div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div><div className={s.stageBar}>{["Qualified", "Interested", "Discovery Scheduled", "Discovery Completed", "Proposal Prep", "Proposal Sent", "Negotiation", "Contract Sent", "Contract Signed", "Payment Pending", "Won"].map((x, i) => <span className={i < 5 ? s.done : i === 5 ? s.current : ""} key={x}>{x}</span>)}</div></section><Tabs tabs={["Overview", "Communication · 18", "Meetings · 6", "Proposal · 1", "Contract · 0", "Invoice · 0", "Tasks · 7", "Files · 12", "Activity"]} /><div className={s.dealOverview}><Panel title="Deal Progress"><div className={s.donut} /><p className={s.detail}><span>Weighted value</span><b>$75,000</b></p><p className={s.detail}><span>Total value</span><b>$150,000</b></p></Panel><Panel title="Next Action"><h3>Proposal Discussion Call</h3><p>May 20, 2026 · 11:00 AM (PDT)</p><p>With Arjun Mehta, Founder & CEO</p><Button primary>Join Meeting</Button><h2>Preparation</h2>{["Review proposal", "Share case studies", "Confirm requirements", "Prepare pricing discussion"].map(x => <p key={x}><input type="checkbox" defaultChecked={x.length < 16} /> {x}</p>)}</Panel><Panel title="Upcoming Meeting"><CompactList items={["Proposal Discussion Call", "Google Meet", "3 attendees"]} /><Button>View all</Button></Panel><Panel title="Deal Owner & Team"><CompactList items={["John Smith · Sales Manager", "Sarah Johnson · Sales Executive", "Emma Davis · Account Manager", "Daniel Kim · Finance Manager"]} /></Panel></div><div className={s.dealBottom}><Panel title="Contact & Company"><PersonCell row={["Arjun Mehta", "Founder & CEO"]} index={2} /><h3>NextPay Technologies Inc.</h3><p>FinTech / Payments · San Francisco, USA</p></Panel><Panel title="Deal Summary">{[["Package", "Premium Package"], ["Value", "$150,000"], ["Terms", "50% upfront, 50% delivery"], ["Contract", "12 months"], ["Campaign", "Personal Magazine Q2"]].map(x => <p className={s.detail} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></p>)}</Panel><Panel title="Status Overview"><CompactList items={["Proposal · Sent", "Contract · Not Sent", "Invoice · Not Created", "Payment · Not Received", "Deal · Open"]} /></Panel><Panel title="Quick Actions"><div className={s.inlineActions}><Button>Task</Button><Button>Note</Button><Button>File</Button><Button>Call</Button><Button href="/app/proposals/prop-2024-0157">Proposal</Button><Button href="/app/contracts/cont-2024-0087">Contract</Button><Button href="/app/invoices/inv-2024-0031">Invoice</Button></div></Panel></div></div>; }

function SectionNavigation({ contract = false }: { contract?: boolean }) { const items = contract ? ["Cover Page", "Parties", "Scope of Work", "Deliverables", "Payment Terms", "Timeline & Milestones", "Intellectual Property", "Confidentiality", "Term & Termination", "Governing Law", "Signature Block"] : ["Cover Page", "Executive Summary", "About The Perspective", "Proposed Solution", "Deliverables", "Timeline & Milestones", "Investment & Pricing", "Terms & Conditions", "Next Steps"]; return <div className={s.sectionNav}>{items.map((x, i) => <button className={i === 3 || contract && i === 10 ? s.active : ""} type="button" key={x}><span>{i < 3 ? "✓" : `${i + 1}.`}</span>{x}<small>{i < 3 ? "Completed" : i === 3 ? "In Progress" : "Not Started"}</small></button>)}</div>; }
function ProposalPaper() { return <><div className={s.paperHeader}><b>The Perspective</b><strong>PROPOSAL<br /><small>PROP-2024-0157</small></strong></div><article className={s.paper}><small>PROPOSED SOLUTION</small><h3>A Premium Magazine that Amplifies Authority</h3><p>The Perspective will design, produce and distribute a world-class personal magazine that showcases <b>NextPay Technologies Inc.</b>, your leadership, your journey and your impact.</p><h3>What’s Included</h3><div className={s.paperGrid}>{[[BookOpen, "Exclusive Interview", "In-depth story profiling your vision and leadership"], [Sparkles, "Premium Design", "Custom magazine design and layout"], [Eye, "Professional Photoshoot", "Photography and image curation"], [FileText, "Print Production", "High quality premium print"], [CreditCard, "Digital Edition", "Interactive magazine for every device"], [Send, "Global Distribution", "Distribution across 50+ platforms"], [TrendingUp, "PR & Media Exposure", "Feature across our media network"], [Users, "Social Promotion", "Integrated campaign across platforms"]].map(([I, a, b]) => { const C = I as Icon; return <article key={a as string}><span><C size={16} /></span><h4>{a as string}</h4><p>{b as string}</p></article>; })}</div><section className={s.surface}><b>Expected Outcome</b><p>Position NextPay Technologies and its leadership as a trusted authority in the fintech industry.</p></section></article></>; }
function ContractPaper() { return <article className={s.paper}><div className={s.invoiceBrand}><b>The Perspective</b><span>CONTRACT AGREEMENT<br />CONT-2024-0087</span></div><h2>Client Services Agreement</h2><p>This Client Services Agreement (“Agreement”) is made on May 20, 2026 between:</p><div className={s.twoCol}><p><b>The Perspective Global</b><br />123 Media House, 4th Floor<br />Mumbai, Maharashtra 400051, India</p><p><b>NextPay Technologies Inc.</b><br />500 California Street, Suite 600<br />San Francisco, CA 94104, USA</p></div><h3>1. Scope of Work</h3><p>The Company agrees to provide the services and deliverables defined in approved proposal PROP-2024-0157.</p><h3>2. Deliverables</h3><ul><li>Premium magazine — digital and print edition</li><li>Professional photoshoot and interviews</li><li>Design, editorial and production</li><li>Distribution across selected platforms</li><li>PR and media exposure</li></ul><h3>3. Payment Terms</h3><p>50% of the contract value is due upon signature. The remaining balance is due on delivery.</p></article>; }

function DocumentScreen({ contract = false }: { contract?: boolean }) { const title = contract ? "Contract Workspace / Detail" : "Proposal Builder / Detail"; return <div className={s.page}><Header title={title} subtitle={`${contract ? "Signature Pending" : "Proposal Sent"} · Last updated May 15, 2026 by Sarah Johnson`}><Button><Eye size={14} /> Preview</Button><Button><Download size={14} /> Download PDF</Button><Button primary href={contract ? "/app/invoices/inv-2024-0031" : "/app/contracts/cont-2024-0087"}><Send size={14} /> {contract ? "Send / Resend" : "Send to Client"}</Button><Button>More Actions</Button></Header><section className={s.surface}><div className={s.summaryStrip}>{(contract ? [["Contract Number", "CONT-2024-0087"], ["Client", "NextPay Technologies"], ["Deal", "Personal Magazine Q2"], ["Proposal", "PROP-2024-0157"], ["Package", "Premium Package"], ["Value", "$150,000"], ["Status", "Signature Pending"]] : [["Proposal Number", "PROP-2024-0157"], ["Client", "NextPay Technologies"], ["Deal", "Personal Magazine Q2"], ["Owner", "John Smith"], ["Status", "Proposal Sent"], ["Expiry", "May 30, 2026"], ["Total Value", "$150,000"]]).map(x => <div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div></section><div className={s.docLayout}><aside><Panel title={`${contract ? "Contract" : "Proposal"} Sections`}><SectionNavigation contract={contract} /></Panel><Panel title="Template"><p><b>{contract ? "Client Services Agreement v2.1" : "Premium Magazine Proposal v2.3"}</b></p><Button>Change Template</Button></Panel><Panel title="Internal Approval"><Status value={contract ? "Approved" : "Pending Review"} /><p>Requested by Sarah Johnson</p><p>Approver: David Wilson</p><Button>View Approval Details</Button></Panel></aside><section className={s.document}><div className={s.toolbar}><Button>Normal</Button><b>B</b><i>I</i><u>U</u><span>☷</span><Link2 size={15} /><Upload size={15} /></div>{contract ? <ContractPaper /> : <ProposalPaper />}</section><aside><Panel title="Details"><Tabs tabs={["Details", contract ? "Client Info" : "Send & Track", "Activity"]} />{contract ? [["Client", "Arjun Mehta"], ["Deal", "Personal Magazine Q2"], ["Proposal", "PROP-2024-0157"], ["Package", "Premium Package"], ["Contract Value", "$150,000"], ["Payment Terms", "50% upfront, 50% delivery"], ["Contract Term", "12 months"]].map(x => <p className={s.detail} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></p>) : <div className={s.pricing}>{[["Premium Package", "$140,000"], ["Cover Feature & Interview", "Included"], ["Professional Photoshoot", "Included"], ["Global Distribution", "Included"], ["Discount (5%)", "−$7,000"], ["Tax", "$17,000"], ["Total", "$150,000"]].map((x, i) => <div className={i === 6 ? s.total : ""} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></div>)}</div>}</Panel><Panel title={contract ? "Signature Status" : "Proposal Version"}>{contract ? <div className={s.statusTrack}>{["Approved", "Sent", "Viewed", "Signature", "Executed"].map((x, i) => <span className={i < 3 ? s.done : i === 3 ? s.current : ""} key={x}><i />{x}</span>)}</div> : <><Status value="Version 2.0 Current" /><p>Version 1.0 · May 15, 2026</p></>}</Panel><Panel title="Quick Actions"><div className={s.inlineActions}>{["Edit", "Send", "Create Revision", "Add Note", "Upload File", "Download PDF"].map(x => <Button key={x}>{x}</Button>)}</div>{contract && <Button success href="/app/invoices/inv-2024-0031">Generate Invoice After Signature <ArrowRight size={13} /></Button>}</Panel></aside></div></div>; }
export function ProposalBuilder() { return <DocumentScreen />; }
export function ContractWorkspace() { return <DocumentScreen contract />; }

export function InvoiceWorkspace() { return <div className={s.page}><Header title="Invoice / Payment Workspace" subtitle="Open · Last updated May 15, 2026 by Emma Davis"><Button><Eye size={14} /> Preview PDF</Button><Button><Download size={14} /> Download PDF</Button><Button primary><Send size={14} /> Send Invoice</Button><Button>More Actions</Button></Header><section className={s.surface}><div className={s.summaryStrip}>{[["Invoice Number", "INV-2024-0031"], ["Client", "NextPay Technologies"], ["Deal", "Personal Magazine Q2"], ["Contract", "CONT-2024-0087"], ["Contract Value", "$150,000"], ["Owner", "Emma Davis"], ["Status", "Open"]].map(x => <div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div><div className={s.summaryStrip}>{[["Created", "May 15, 2026"], ["Sent", "May 15, 2026"], ["Due", "May 30, 2026"], ["Method", "Bank Transfer"], ["Subtotal", "$140,000"], ["Paid", "$46,200"], ["Balance", "$107,800"]].map(x => <div key={x[0]}><small>{x[0]}</small><strong>{x[1]}</strong></div>)}</div></section><Tabs tabs={["Invoice", "Payments · 2", "Activity Timeline · 9", "Reminders · 2", "Attachments · 3", "Notes · 1"]} /><div className={s.invoiceLayout}><section className={s.invoicePaper}><div className={s.invoiceBrand}><b>The Perspective</b><h2>INVOICE<br /><small>INV-2024-0031</small></h2><Status value="OPEN" /></div><div className={s.invoiceMeta}><div><h3>Bill To</h3><p><b>NextPay Technologies Inc.</b><br />Arjun Mehta<br />500 California Street, Suite 600<br />San Francisco, CA 94104, USA<br />arjun.mehta@nextpay.com</p></div><div className={s.surface}>{[["Deal", "Personal Magazine Q2"], ["Contract", "CONT-2024-0087"], ["Invoice Date", "May 15, 2026"], ["Due Date", "May 30, 2026"], ["Payment Terms", "50% Upfront, 50% Delivery"], ["Currency", "USD"]].map(x => <p className={s.detail} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></p>)}</div></div><table className={s.lineItems}><thead><tr><th>#</th><th>Item / Description</th><th>Deliverable</th><th>Qty</th><th>Amount</th></tr></thead><tbody>{[["Premium Magazine — Digital & Print Edition", "Digital & Print", "$60,000"], ["Professional Photoshoot & Interviews", "Photoshoot", "$25,000"], ["Global Distribution", "Distribution", "$30,000"], ["PR & Media Exposure", "PR & Media", "$15,000"], ["Social Media Promotion", "Social Promotion", "$10,000"]].map((x, i) => <tr key={x[0]}><td>{i + 1}</td><td><b>{x[0]}</b></td><td>{x[1]}</td><td>1</td><td>{x[2]}</td></tr>)}</tbody></table><div className={s.totals}><p><span>Subtotal</span><b>$140,000</b></p><p><span>Tax (10%)</span><b>$14,000</b></p><p><span>Total Amount</span><b>$154,000</b></p></div><h3>Notes to Client</h3><p>Thank you for your business. We appreciate the opportunity to work with you.</p></section><aside><Panel title="Invoice Summary"><div className={s.donut} /><p className={s.detail}><span>Paid</span><b>$46,200 (30%)</b></p><p className={s.detail}><span>Balance Due</span><b>$107,800 (70%)</b></p><p className={s.detail}><span>Tax</span><b>$14,000</b></p></Panel><Panel title="Billing Information">{[["Bank Name", "Wells Fargo Bank"], ["Account Name", "The Perspective Global LLC"], ["Account Number", "1234 5678 9012"], ["SWIFT", "WFBIUS6S"], ["Reference", "INV-2024-0031"]].map(x => <p className={s.detail} key={x[0]}><span>{x[0]}</span><b>{x[1]}</b></p>)}<Button>Copy Bank Details</Button></Panel><Panel title="Payment Link"><p>Share this secure payment link with your client.</p><label className={s.search}><input readOnly value="https://pay.theperspective.com/inv/0031" /><Copy size={14} /></label><Button primary>Copy Link</Button></Panel></aside><aside><Panel title="Payment Status"><div className={s.statusTrack}>{["Draft", "Approved", "Sent", "Open", "Paid"].map((x, i) => <span className={i < 3 ? s.done : i === 3 ? s.current : ""} key={x}><i />{x}</span>)}</div><section className={s.surface}><b>Due on May 30, 2026</b><p>15 days remaining to due date</p></section><h2>Payment History</h2><CompactList items={["PAY-2024-0012 · Succeeded · $46,200", "PAY-2024-0011 · Processing · $46,200"]} /></Panel><Panel title="Quick Actions"><div className={s.inlineActions}>{["Send Invoice", "Send Reminder", "Record Payment", "Download PDF", "Issue Credit", "Refund Payment", "Download Receipt", "More Actions"].map(x => <Button key={x}>{x}</Button>)}</div></Panel><Panel title="Recent Activities"><CompactList items={["Invoice sent to client", "Invoice created", "Contract signed", "Reminder scheduled"]} /></Panel></aside></div></div>; }
