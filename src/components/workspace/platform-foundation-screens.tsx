import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Download,
  ExternalLink,
  Eye,
  FileCheck2,
  Filter,
  Gauge,
  Globe2,
  History,
  KeyRound,
  Link2,
  ListChecks,
  LockKeyhole,
  MoreHorizontal,
  Network,
  PencilLine,
  Plus,
  RefreshCw,
  Save,
  Search,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Upload,
  UserRound,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import styles from "./platform-foundation.module.css";

type Tone = "blue" | "green" | "orange" | "red" | "purple" | "slate";
type Cell = React.ReactNode;

function ActionButton({ children, href, primary = false }: { children: React.ReactNode; href?: string; primary?: boolean }) {
  const className = `${styles.button} ${primary ? styles.primaryButton : ""}`;
  return href ? <Link className={className} href={href}>{children}</Link> : <button className={className} type="button">{children}</button>;
}

function PageHeader({ eyebrow, title, subtitle, children }: { eyebrow: string; title: string; subtitle: string; children: React.ReactNode }) {
  return <header className={styles.pageHeader}>
    <div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.subtitle}>{subtitle}</p></div>
    <div className={styles.actions}>{children}</div>
  </header>;
}

function Status({ children, tone = "slate" }: { children: React.ReactNode; tone?: Tone }) {
  return <span className={styles.status} data-tone={tone}>{children}</span>;
}

function Panel({ title, action, children, className = "" }: { title: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <section className={`${styles.panel} ${className}`}>
    <header className={styles.panelHeader}><h2>{title}</h2>{action}</header>
    {children}
  </section>;
}

function Metrics({ items }: { items: { label: string; value: string; meta: string; icon: LucideIcon; tone?: Tone }[] }) {
  return <section className={styles.metrics}>{items.map(({ label, value, meta, icon: Icon, tone = "blue" }) => <article className={styles.metric} data-tone={tone} key={label}>
    <span><Icon size={18} /></span><div><small>{label}</small><strong>{value}</strong><p>{meta}</p></div>
  </article>)}</section>;
}

function Tabs({ items }: { items: string[] }) {
  return <nav className={styles.tabs} aria-label="Workspace sections">{items.map((item, index) => <button aria-current={index === 0 ? "page" : undefined} key={item} type="button">{item}</button>)}</nav>;
}

function FilterBar({ search = "Search records…", filters }: { search?: string; filters: string[] }) {
  return <section className={styles.filterBar}>
    <label className={styles.search}><Search size={15} /><input aria-label={search} placeholder={search} /></label>
    {filters.map((filter) => <button key={filter} type="button">{filter}<ChevronRight size={12} /></button>)}
    <button type="button"><Filter size={13} /> More filters</button>
  </section>;
}

function DataTable({ headers, rows, minWidth = 920 }: { headers: string[]; rows: Cell[][]; minWidth?: number }) {
  return <div className={styles.tableScroll}><table className={styles.table} style={{ minWidth }}><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}

function Progress({ value, tone = "blue" }: { value: number; tone?: Tone }) {
  return <span className={styles.progress} data-tone={tone}><i style={{ width: `${value}%` }} /></span>;
}

function List({ items }: { items: { title: string; meta: string; status?: string; tone?: Tone }[] }) {
  return <div className={styles.list}>{items.map((item) => <article key={item.title}><i /><div><b>{item.title}</b><small>{item.meta}</small></div>{item.status && <Status tone={item.tone}>{item.status}</Status>}</article>)}</div>;
}

function WorkflowStrip({ stages, current }: { stages: string[]; current: number }) {
  return <div className={styles.workflow}>{stages.map((stage, index) => <span className={index < current ? styles.done : index === current ? styles.current : ""} key={stage}><i>{index < current ? "✓" : index + 1}</i><b>{stage}</b></span>)}</div>;
}

function DemoDataNote({ children = "Metrics shown on this prototype are labeled demo data and include visible source and verification context." }: { children?: React.ReactNode }) {
  return <div className={styles.demoNote}><ShieldCheck size={17} /><p><b>Prototype data</b><span>{children}</span></p></div>;
}

const publicationRows: Cell[][] = [
  [<Record key="1" title="The Architects of Tomorrow" meta="Long-form article · PRJ-2026-0042" />, <Status key="2" tone="green">Ready to publish</Status>, <Readiness key="3" value={100} />, "Website + Digital Reader", "Aug 22 · 09:00 IST", "Maya Patel", <MoreHorizontal key="4" size={16} />],
  [<Record key="1" title="Arjun Mehta — Q3 Edition" meta="Personal magazine · v6 approved" />, <Status key="2" tone="purple">Scheduled</Status>, <Readiness key="3" value={96} />, "Web + Issuu + Magzter", "Aug 23 · 10:30 IST", "Sarah Johnson", <MoreHorizontal key="4" size={16} />],
  [<Record key="1" title="The Visionary Leader · Ep. 12" meta="Podcast · final master" />, <Status key="2" tone="orange">Technical ready</Status>, <Readiness key="3" value={84} />, "Spotify + Apple + YouTube", "Awaiting schedule", "Noah Williams", <MoreHorizontal key="4" size={16} />],
  [<Record key="1" title="Leadership Summit Highlights" meta="Video · captions missing" />, <Status key="2" tone="red">Blocked</Status>, <Readiness key="3" value={68} tone="red" />, "YouTube + Website", "Not scheduled", "Emma Davis", <MoreHorizontal key="4" size={16} />],
  [<Record key="1" title="AI Infrastructure Briefing" meta="Newsletter · correction v2" />, <Status key="2" tone="red">Correction pending</Status>, <Readiness key="3" value={91} tone="orange" />, "Newsletter + Web", "Published Aug 18", "Julian Cross", <MoreHorizontal key="4" size={16} />],
];

function Record({ title, meta }: { title: string; meta: string }) { return <div className={styles.record}><b>{title}</b><small>{meta}</small></div>; }
function Readiness({ value, tone = "green" }: { value: number; tone?: Tone }) { return <div className={styles.readiness}><Progress value={value} tone={tone} /><b>{value}%</b></div>; }

export function PublishingHubScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="PUBLISHING / PUBLICATION QUEUE" title="Publishing Hub" subtitle="Control readiness, scheduling, release, correction and live publication evidence across every target.">
      <ActionButton><Eye size={14} /> Preview</ActionButton><ActionButton><RefreshCw size={14} /> Run readiness check</ActionButton><ActionButton primary><CalendarDays size={14} /> Schedule publication</ActionButton>
    </PageHeader>
    <Metrics items={[
      { label: "Ready to publish", value: "18", meta: "+5 this week", icon: CheckCircle2, tone: "green" },
      { label: "Scheduled", value: "12", meta: "Next 14 days", icon: CalendarDays, tone: "purple" },
      { label: "Published", value: "146", meta: "This quarter", icon: Globe2, tone: "blue" },
      { label: "Blocked", value: "5", meta: "Needs intervention", icon: AlertTriangle, tone: "orange" },
      { label: "Failed", value: "2", meta: "Retry available", icon: Activity, tone: "red" },
      { label: "Corrections", value: "3", meta: "Awaiting approval", icon: PencilLine, tone: "orange" },
    ]} />
    <Tabs items={["Publication Queue · 38", "Schedule", "Published", "Failed", "Corrections", "Targets", "Activity"]} />
    <FilterBar search="Search title, project or publication…" filters={["All statuses", "All content types", "All targets", "All owners"]} />
    <div className={styles.mainRail}>
      <Panel title="Controlled publication queue" action={<ActionButton href="/app/publishing#publication-queue"><Plus size={13} /> Add to queue</ActionButton>}>
        <DataTable headers={["Publication", "Status", "Readiness", "Targets", "Schedule", "Publisher", ""]} rows={publicationRows} minWidth={1040} />
      </Panel>
      <aside className={styles.rail}>
        <Panel title="Next scheduled"><List items={[{ title: "Arjun Mehta — Q3 Edition", meta: "Tomorrow · 10:30 IST", status: "3 targets", tone: "purple" }, { title: "Inside Strategy · Ep. 09", meta: "Aug 24 · 08:00 IST", status: "4 targets", tone: "blue" }, { title: "Business Briefing", meta: "Aug 25 · 07:30 IST", status: "Newsletter", tone: "green" }]} /></Panel>
        <Panel title="Readiness blockers"><List items={[{ title: "Captions not approved", meta: "Leadership Summit Highlights", status: "High", tone: "red" }, { title: "Image rights expire soon", meta: "Global Growth Report", status: "2 days", tone: "orange" }, { title: "SEO description missing", meta: "Visionary Leader Ep. 12", status: "Required", tone: "orange" }]} /></Panel>
        <Panel title="Recent publishing activity"><List items={[{ title: "Publication completed", meta: "The Return of Industrial Strategy · 14:22" }, { title: "Live URL verified", meta: "Digital Reader · 13:08" }, { title: "Correction version created", meta: "AI Infrastructure Briefing · 11:45" }]} /></Panel>
      </aside>
    </div>
  </main>;
}

const channelRows: Cell[][] = [
  [<Record key="a" title="The Perspective Website" meta="Primary publication" />, <Status key="b" tone="green">Published</Status>, "Aug 20 · 09:00", "142,840", "18,420", <Link className={styles.inlineLink} href="/app/publishing#verified-website" key="c">Verified URL <ExternalLink size={11} /></Link>],
  [<Record key="a" title="LinkedIn" meta="The Perspective Global" />, <Status key="b" tone="green">Published</Status>, "Aug 20 · 10:00", "88,240", "7,912", <Link className={styles.inlineLink} href="/app/distribution#verified-linkedin" key="c">Verified URL <ExternalLink size={11} /></Link>],
  [<Record key="a" title="Instagram" meta="@theperspectiveglobal" />, <Status key="b" tone="purple">Scheduled</Status>, "Aug 21 · 18:30", "—", "—", "Creative v3 approved"],
  [<Record key="a" title="Newsletter" meta="Executive Briefing" />, <Status key="b" tone="purple">Scheduled</Status>, "Aug 22 · 07:30", "12,450", "—", "Audience validated"],
  [<Record key="a" title="Magzter" meta="External publication" />, <Status key="b" tone="red">Failed</Status>, "Retry required", "—", "—", "Authentication expired"],
  [<Record key="a" title="PR Distribution" meta="Global business wire" />, <Status key="b" tone="orange">Pending</Status>, "Awaiting approval", "—", "—", "Copy v2 in review"],
];

export function DistributionCampaignScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="DISTRIBUTION / CAMPAIGN / DIST-2026-0184" title="Arjun Mehta — Global Leadership Campaign" subtitle="NextPay Technologies · Personal Magazine Q3 · Aug 20–Sep 12, 2026">
      <ActionButton><Upload size={14} /> Upload creative</ActionButton><ActionButton><FileCheck2 size={14} /> Request approval</ActionButton><ActionButton primary><Send size={14} /> Schedule distribution</ActionButton>
    </PageHeader>
    <section className={styles.heroStrip}><div><Status tone="blue">Running</Status><h2>68% complete</h2><Progress value={68} /></div>{[["Campaign owner", "Aisha Kapoor"], ["Publication", "Arjun Mehta Q3"], ["Start / end", "Aug 20 — Sep 12"], ["Channels", "14 total"], ["Live links", "7 verified"]].map(([label, value]) => <p key={label}><small>{label}</small><b>{value}</b></p>)}</section>
    <Metrics items={[
      { label: "Published channels", value: "7", meta: "of 14 channels", icon: CheckCircle2, tone: "green" }, { label: "Scheduled", value: "4", meta: "Next 72 hours", icon: Clock3, tone: "purple" }, { label: "Failed", value: "1", meta: "Retry required", icon: AlertTriangle, tone: "red" }, { label: "Reach", value: "486K", meta: "+18.2% vs plan", icon: Globe2 }, { label: "Clicks", value: "28.4K", meta: "5.84% CTR", icon: Target, tone: "green" }, { label: "Engagement", value: "9.7%", meta: "+2.1 pts", icon: TrendingUp, tone: "purple" },
    ]} />
    <Tabs items={["Overview", "Channels · 14", "Schedule", "Social", "Newsletter", "PR", "External Platforms", "Assets · 18", "Approvals · 3", "Analytics", "Live Links · 7", "Reports", "Activity"]} />
    <div className={styles.mainRail}>
      <div className={styles.stack}>
        <Panel title="Channel execution" action={<ActionButton><Plus size={13} /> Add channel</ActionButton>}><DataTable headers={["Channel", "State", "Scheduled / published", "Reach", "Clicks", "Evidence"]} rows={channelRows} minWidth={940} /></Panel>
        <div className={styles.twoColumns}>
          <Panel title="Distribution checklist"><List items={[{ title: "Publication URLs verified", meta: "7 of 7 live URLs", status: "Complete", tone: "green" }, { title: "Channel copy approved", meta: "12 of 14 variants", status: "86%", tone: "orange" }, { title: "Tracking parameters", meta: "UTM and campaign IDs", status: "Complete", tone: "green" }, { title: "External rights check", meta: "Magzter license renewal", status: "Blocked", tone: "red" }]} /></Panel>
          <Panel title="Top-performing channels"><BarRows items={[["Website", 92, "142.8K"], ["LinkedIn", 76, "88.2K"], ["Newsletter", 61, "64.1K"], ["YouTube", 48, "39.6K"]]} /></Panel>
        </div>
      </div>
      <aside className={styles.rail}>
        <Panel title="Campaign readiness"><div className={styles.scoreRing}>92<small>% ready</small></div><List items={[{ title: "Content and creative", meta: "18 assets approved", status: "Ready", tone: "green" }, { title: "Channel approvals", meta: "12 of 14 complete", status: "2 pending", tone: "orange" }, { title: "Tracking", meta: "All links tagged", status: "Ready", tone: "green" }]} /></Panel>
        <Panel title="Immediate actions"><List items={[{ title: "Reconnect Magzter", meta: "Authentication expired", status: "Retry", tone: "red" }, { title: "Approve PR copy v2", meta: "Due today · 16:00", status: "Review", tone: "orange" }, { title: "Verify Instagram preview", meta: "Scheduled tomorrow", status: "Open", tone: "blue" }]} /></Panel>
        <Panel title="Recent activity"><List items={[{ title: "LinkedIn URL verified", meta: "Aisha Kapoor · 10:18" }, { title: "Newsletter scheduled", meta: "Noah Williams · 09:42" }, { title: "Magzter publish failed", meta: "Automation · 09:17" }]} /></Panel>
      </aside>
    </div>
  </main>;
}

function BarRows({ items }: { items: [string, number, string][] }) {
  return <div className={styles.barRows}>{items.map(([label, value, display]) => <div key={label}><p><b>{label}</b><span>{display}</span></p><Progress value={value} /></div>)}</div>;
}

export function ReportingWorkspaceScreen() {
  const metricRows: Cell[][] = [
    ["Article views", "Google Analytics 4", "Perspective web", "Aug 1–20", "Aug 21 · 08:05", <Status key="1" tone="green">Verified</Status>, "184,620"],
    ["Magazine reads", "Digital Reader", "Arjun Mehta Q3", "Aug 1–20", "Aug 21 · 08:03", <Status key="2" tone="green">Verified</Status>, "48,310"],
    ["Podcast plays", "Spotify for Creators", "Visionary Leader", "Aug 1–20", "Aug 21 · 07:56", <Status key="3" tone="green">Verified</Status>, "32,840"],
    ["Social reach", "LinkedIn", "Perspective Global", "Aug 1–20", "Aug 21 · 07:48", <Status key="4" tone="orange">Review</Status>, "486,200"],
    ["PR placements", "Manual evidence", "Global business wire", "Aug 1–20", "Aug 20 · 18:12", <Status key="5" tone="purple">Documented</Status>, "18"],
  ];
  return <main className={styles.page}>
    <PageHeader eyebrow="REPORTS / CLIENT REPORT / RPT-2026-0088" title="Q3 Executive Visibility Performance Report" subtitle="NextPay Technologies · Aug 1–20, 2026 · Owner: Priya Nair">
      <ActionButton><RefreshCw size={14} /> Refresh metrics</ActionButton><ActionButton><Eye size={14} /> Preview as client</ActionButton><ActionButton><Download size={14} /> Export PDF</ActionButton><ActionButton primary><Send size={14} /> Send to client</ActionButton>
    </PageHeader>
    <DemoDataNote />
    <section className={styles.heroStrip}><div><Status tone="orange">Internal review</Status><h2>Report readiness</h2><Progress value={82} tone="orange" /></div>{[["Reporting period", "Aug 1–20"], ["Data freshness", "13 min ago"], ["Verification", "9 / 10 sources"], ["Approval", "1 pending"], ["Version", "v3 draft"]].map(([label, value]) => <p key={label}><small>{label}</small><b>{value}</b></p>)}</section>
    <WorkflowStrip stages={["Collecting data", "Draft", "Internal review", "Approved", "Client ready", "Delivered"]} current={2} />
    <Tabs items={["Overview", "Metrics · 24", "Publications · 8", "Distribution · 14", "Deliverables · 12", "Insights", "Files · 6", "Approvals · 2", "Versions · 3", "Client Preview", "Activity"]} />
    <Metrics items={[
      { label: "Total reach", value: "486.2K", meta: "+18.2% vs target", icon: Globe2 }, { label: "Content views", value: "184.6K", meta: "8 verified publications", icon: Eye, tone: "green" }, { label: "Engagement", value: "9.7%", meta: "+2.1 pts", icon: TrendingUp, tone: "purple" }, { label: "Clicks", value: "28.4K", meta: "5.84% CTR", icon: Target, tone: "green" }, { label: "Media placements", value: "18", meta: "14 verified live", icon: Link2, tone: "orange" }, { label: "Deliverables", value: "11/12", meta: "One report pending", icon: FileCheck2, tone: "blue" },
    ]} />
    <div className={styles.mainRail}>
      <div className={styles.stack}>
        <Panel title="Metric provenance and verification" action={<ActionButton><Plus size={13} /> Add metric</ActionButton>}><DataTable headers={["Metric", "Source", "Account / property", "Period", "Collected", "Verification", "Value"]} rows={metricRows} minWidth={1020} /></Panel>
        <div className={styles.twoColumns}><Panel title="Performance by channel"><BarRows items={[["Website & reader", 94, "232.9K"], ["LinkedIn", 81, "148.2K"], ["Newsletter", 64, "78.4K"], ["Podcast platforms", 52, "32.8K"], ["PR & backlinks", 38, "18 placements"]]} /></Panel><Panel title="Executive summary"><div className={styles.prose}><p>Executive visibility exceeded the planned reach benchmark, led by the magazine launch and LinkedIn distribution.</p><p>Long-form article completion and newsletter click-through both improved versus the previous reporting period.</p><p className={styles.callout}>Next recommendation: extend the highest-performing leadership clips and prepare the renewal package before September 5.</p></div></Panel></div>
      </div>
      <aside className={styles.rail}><Panel title="Report controls"><List items={[{ title: "Internal approval", meta: "Maya Patel · due today", status: "Pending", tone: "orange" }, { title: "Client-visible notes", meta: "4 notes included", status: "Ready", tone: "green" }, { title: "Internal-only notes", meta: "2 notes hidden", status: "Protected", tone: "purple" }, { title: "Final PDF", meta: "Generated from v3", status: "Draft", tone: "blue" }]} /></Panel><Panel title="Top outcomes"><List items={[{ title: "Magazine launch", meta: "48.3K verified reads", status: "+24%", tone: "green" }, { title: "Executive interview", meta: "11:42 avg. reading time", status: "+18%", tone: "green" }, { title: "LinkedIn series", meta: "9.7% engagement", status: "Best channel", tone: "purple" }]} /></Panel><Panel title="Version history"><List items={[{ title: "Version 3", meta: "Current · Priya Nair · 10:28", status: "Draft", tone: "blue" }, { title: "Version 2", meta: "Internal review · Aug 20", status: "Superseded", tone: "slate" }, { title: "Version 1", meta: "Generated · Aug 18", status: "Superseded", tone: "slate" }]} /></Panel></aside>
    </div>
  </main>;
}

const taskRows: Cell[][] = [
  [<input aria-label="Select task" key="a" type="checkbox" />, <Record key="b" title="Approve magazine cover v4" meta="Personal Magazine — Arjun Mehta" />, <Status key="c" tone="red">Critical</Status>, "Emma Davis", "Design review", "Today · 14:00", <Status key="d" tone="orange">In review</Status>, "Client approval"],
  [<input aria-label="Select task" key="a" type="checkbox" />, <Record key="b" title="Verify podcast transcript" meta="Visionary Leader · Episode 12" />, <Status key="c" tone="orange">High</Status>, "Noah Williams", "Internal review", "Today · 17:00", <Status key="d" tone="blue">In progress</Status>, "Audio edit v3"],
  [<input aria-label="Select task" key="a" type="checkbox" />, <Record key="b" title="Collect executive headshots" meta="NextPay onboarding" />, <Status key="c" tone="orange">High</Status>, "Michael Chen", "Assets", "Aug 22", <Status key="d" tone="purple">Waiting on client</Status>, "Questionnaire"],
  [<input aria-label="Select task" key="a" type="checkbox" />, <Record key="b" title="Resolve Magzter authentication" meta="Distribution campaign" />, <Status key="c" tone="red">Critical</Status>, "Aisha Kapoor", "Distribution", "Overdue 1d", <Status key="d" tone="red">Blocked</Status>, "Integration owner"],
  [<input aria-label="Select task" key="a" type="checkbox" />, <Record key="b" title="Prepare renewal recommendation" meta="NextPay Q3 performance report" />, <Status key="c" tone="blue">Medium</Status>, "Priya Nair", "Reporting", "Aug 25", <Status key="d" tone="slate">To do</Status>, "Verified metrics"],
];

export function TasksWorkspaceScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="WORK MANAGEMENT / SHARED EXECUTION" title="Tasks & Work Management" subtitle="One controlled queue for personal, team, client-dependent and cross-functional work.">
      <ActionButton><SlidersHorizontal size={14} /> Manage views</ActionButton><ActionButton><Upload size={14} /> Import tasks</ActionButton><ActionButton primary><Plus size={14} /> Create task</ActionButton>
    </PageHeader>
    <Metrics items={[
      { label: "My open tasks", value: "28", meta: "7 due today", icon: ListChecks }, { label: "Overdue", value: "9", meta: "3 critical", icon: AlertTriangle, tone: "red" }, { label: "In progress", value: "34", meta: "Across 12 projects", icon: Activity, tone: "blue" }, { label: "Blocked", value: "7", meta: "4 external dependencies", icon: LockKeyhole, tone: "orange" }, { label: "Waiting on client", value: "16", meta: "Avg. age 2.4 days", icon: UserRound, tone: "purple" }, { label: "Completed", value: "148", meta: "This month · 94% SLA", icon: CheckCircle2, tone: "green" },
    ]} />
    <Tabs items={["My Tasks · 28", "Team Tasks · 86", "All Tasks · 212", "Overdue · 9", "Due Today · 21", "Blocked · 7", "Waiting on Client · 16", "Completed"]} />
    <FilterBar search="Search task, project, client or owner…" filters={["List / Board / Calendar", "All departments", "All priorities", "All statuses"]} />
    <div className={styles.mainRail}>
      <div className={styles.stack}><Panel title="My active work" action={<div className={styles.actions}><ActionButton>Assign owner</ActionButton><ActionButton>Move status</ActionButton></div>}><DataTable headers={["", "Task", "Priority", "Owner", "Workflow stage", "Due", "Status", "Dependency"]} rows={taskRows} minWidth={1060} /></Panel><div className={styles.threeColumns}><TaskLane title="To do" tone="slate" count="18" items={["Prepare interview research", "Create distribution brief", "Confirm client billing contact"]} /><TaskLane title="In progress" tone="blue" count="34" items={["Podcast transcript review", "Magazine page layouts", "Executive report draft"]} /><TaskLane title="In review" tone="orange" count="12" items={["Cover concept v4", "Proposal pricing", "Newsletter copy"]} /></div></div>
      <aside className={styles.rail}><Panel title="Selected task"><Status tone="orange">In review</Status><h3 className={styles.sectionTitle}>Approve magazine cover v4</h3><List items={[{ title: "Owner", meta: "Emma Davis · Senior Designer" }, { title: "Project", meta: "Personal Magazine — Arjun Mehta" }, { title: "Due", meta: "Today · 14:00 IST", status: "2h left", tone: "red" }, { title: "Dependency", meta: "Client approval request APR-0442" }, { title: "SLA", meta: "12-hour review target", status: "At risk", tone: "orange" }]} /><div className={styles.actions}><ActionButton>Comment</ActionButton><ActionButton primary>Mark complete</ActionButton></div></Panel><Panel title="Workload signals"><List items={[{ title: "Emma Davis", meta: "112% capacity", status: "Overloaded", tone: "red" }, { title: "Noah Williams", meta: "91% capacity", status: "High", tone: "orange" }, { title: "Priya Nair", meta: "68% capacity", status: "Available", tone: "green" }]} /></Panel><Panel title="Upcoming dependencies"><List items={[{ title: "Client questionnaire", meta: "Blocks 4 editorial tasks" }, { title: "Signed contract", meta: "Blocks project kickoff" }, { title: "Publishing approval", meta: "Blocks 7 channel tasks" }]} /></Panel></aside>
    </div>
  </main>;
}

function TaskLane({ title, tone, count, items }: { title: string; tone: Tone; count: string; items: string[] }) {
  return <Panel title={title} action={<Status tone={tone}>{count}</Status>}>{items.map((item, index) => <article className={styles.taskCard} key={item}><b>{item}</b><small>{["NextPay Technologies", "Arjun Mehta Q3", "Executive operations"][index]}</small><footer><Status tone={index === 1 ? "orange" : "blue"}>{index === 1 ? "High" : "Medium"}</Status><span>Aug {22 + index}</span></footer></article>)}</Panel>;
}

const calendarEvents = [
  { title: "Editorial interview", meta: "Arjun Mehta · 09:30", tone: "purple", column: 2, row: 3, span: 2 },
  { title: "Proposal review", meta: "NextPay · 11:00", tone: "blue", column: 3, row: 4, span: 2 },
  { title: "Podcast recording", meta: "Visionary Leader · 14:00", tone: "green", column: 4, row: 6, span: 2 },
  { title: "Cover approval", meta: "Client review · 16:00", tone: "orange", column: 5, row: 7, span: 1 },
  { title: "Leadership video shoot", meta: "Studio A · 10:00", tone: "red", column: 6, row: 3, span: 4 },
];

export function CalendarWorkspaceScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="CALENDAR / ORGANIZATION SCHEDULE" title="Calendar & Scheduling" subtitle="Meetings, production, deadlines, publishing, finance and renewals in one shared schedule.">
      <ActionButton>Today</ActionButton><ActionButton><CalendarDays size={14} /> Availability</ActionButton><ActionButton primary><Plus size={14} /> Add event</ActionButton>
    </PageHeader>
    <div className={styles.calendarToolbar}><div className={styles.segmented}>{["Day", "Week", "Month", "Agenda"].map((item, index) => <button className={index === 1 ? styles.active : ""} key={item} type="button">{item}</button>)}</div><h2>August 17–23, 2026</h2><div className={styles.actions}><ActionButton>‹</ActionButton><ActionButton>›</ActionButton></div></div>
    <FilterBar search="Search event, client, project or attendee…" filters={["My calendar", "All departments", "All event types", "Asia/Calcutta"]} />
    <div className={styles.calendarLayout}>
      <aside className={styles.rail}><Panel title="Calendars"><List items={[{ title: "My calendar", meta: "18 events", status: "Visible", tone: "blue" }, { title: "Sales & client success", meta: "26 events", status: "Visible", tone: "purple" }, { title: "Editorial & production", meta: "31 events", status: "Visible", tone: "green" }, { title: "Publishing & distribution", meta: "14 events", status: "Visible", tone: "orange" }, { title: "Finance & renewals", meta: "8 events", status: "Visible", tone: "red" }]} /></Panel><Panel title="Scheduling warnings"><List items={[{ title: "Studio conflict", meta: "Friday · 10:00–11:30", status: "Resolve", tone: "red" }, { title: "Client timezone", meta: "Proposal review · PDT", status: "Checked", tone: "green" }, { title: "Missing meeting link", meta: "Editorial interview", status: "Add", tone: "orange" }]} /></Panel></aside>
      <section className={styles.weekCalendar}><div className={styles.weekGrid}>{["", "Mon 17", "Tue 18", "Wed 19", "Thu 20", "Fri 21", "Sat 22"].map((day) => <b key={day}>{day}</b>)}{Array.from({ length: 8 }, (_, index) => <time key={index}>{`${index + 8}:00`}</time>)}{Array.from({ length: 48 }, (_, index) => <span key={index} />)}{calendarEvents.map((event) => <article className={styles.calendarEvent} data-tone={event.tone} key={event.title} style={{ gridColumn: event.column, gridRow: `${event.row} / span ${event.span}` }}><b>{event.title}</b><small>{event.meta}</small></article>)}</div></section>
      <aside className={styles.rail}><Panel title="Selected event"><Status tone="purple">Editorial interview</Status><h3 className={styles.sectionTitle}>Executive feature interview with Arjun Mehta</h3><List items={[{ title: "Date & time", meta: "Monday, Aug 17 · 09:30–10:30 IST" }, { title: "Timezone", meta: "Asia/Calcutta · client sees PDT" }, { title: "Location", meta: "Google Meet · link confirmed" }, { title: "Owner", meta: "Maya Patel · Senior Editor" }, { title: "Attendees", meta: "4 confirmed · 1 pending" }, { title: "Related project", meta: "Personal Magazine — Arjun Mehta Q3" }]} /><div className={styles.actions}><ActionButton>Reschedule</ActionButton><ActionButton primary>Open event</ActionButton></div></Panel><Panel title="Today’s agenda"><List items={[{ title: "09:30 · Editorial interview", meta: "Arjun Mehta" }, { title: "11:00 · Pipeline review", meta: "Sales team" }, { title: "14:00 · Podcast edit review", meta: "Episode 12" }, { title: "16:00 · Cover approval", meta: "Client portal" }]} /></Panel></aside>
    </div>
  </main>;
}

const employees = [
  ["Maya Patel", "Editor-in-Chief", "Editorial", 86, "6 projects", "18 / 2", "Available Aug 28", "Healthy"],
  ["Emma Davis", "Senior Designer", "Creative", 112, "8 projects", "24 / 5", "No leave", "Overloaded"],
  ["Noah Williams", "Podcast Producer", "Production", 91, "5 projects", "16 / 1", "Leave Sep 2–4", "High"],
  ["John Smith", "Sales Manager", "Sales", 78, "12 accounts", "14 / 3", "No leave", "Healthy"],
  ["Priya Nair", "Reporting Lead", "Client Success", 68, "4 clients", "11 / 0", "Available", "Available"],
];

export function TeamManagementScreen() {
  const rows: Cell[][] = employees.map(([name, role, department, capacity, assignments, tasks, availability, health]) => [<Record key="1" title={name as string} meta={role as string} />, department, <div className={styles.capacity} key="2"><Readiness value={capacity as number} tone={(capacity as number) > 100 ? "red" : (capacity as number) > 85 ? "orange" : "green"} /></div>, assignments, tasks, availability, <Status key="3" tone={health === "Overloaded" ? "red" : health === "High" ? "orange" : health === "Available" ? "green" : "blue"}>{health}</Status>, <MoreHorizontal key="4" size={16} />]);
  return <main className={styles.page}>
    <PageHeader eyebrow="TEAM / EMPLOYEE MANAGEMENT" title="Team & Employee Management" subtitle="Identity, placement, assignments, availability, capacity and performance context for authorized managers.">
      <ActionButton><Download size={14} /> Export directory</ActionButton><ActionButton><Workflow size={14} /> Manage departments</ActionButton><ActionButton primary><Plus size={14} /> Add employee</ActionButton>
    </PageHeader>
    <Metrics items={[
      { label: "Active employees", value: "84", meta: "+6 this quarter", icon: Users }, { label: "Departments", value: "9", meta: "14 active teams", icon: Building2, tone: "purple" }, { label: "Avg. utilization", value: "82%", meta: "Target 75–88%", icon: Gauge, tone: "green" }, { label: "Over capacity", value: "7", meta: "Needs rebalancing", icon: AlertTriangle, tone: "red" }, { label: "On leave", value: "5", meta: "Next 14 days", icon: CalendarDays, tone: "orange" }, { label: "SLA performance", value: "94.2%", meta: "+1.8 pts", icon: TrendingUp, tone: "green" },
    ]} />
    <Tabs items={["Employee Directory · 84", "Departments · 9", "Teams · 14", "Workload", "Capacity", "Skills", "Performance", "Availability"]} />
    <FilterBar search="Search employee, role, skill or client…" filters={["All departments", "All roles", "All managers", "Active employees"]} />
    <div className={styles.mainRail}>
      <div className={styles.stack}><Panel title="Employee directory" action={<ActionButton>Bulk actions</ActionButton>}><DataTable headers={["Employee", "Department", "Capacity", "Assignments", "Tasks open / overdue", "Availability", "Workload", ""]} rows={rows} minWidth={1040} /></Panel><div className={styles.twoColumns}><Panel title="Capacity by department"><BarRows items={[["Editorial", 86, "86%"], ["Creative", 97, "97%"], ["Production", 91, "91%"], ["Sales", 78, "78%"], ["Client success", 72, "72%"]]} /></Panel><Panel title="Workload alerts"><List items={[{ title: "Creative team above capacity", meta: "4 employees over 100%", status: "Rebalance", tone: "red" }, { title: "Podcast production peak", meta: "3 recordings this week", status: "High", tone: "orange" }, { title: "Reporting capacity available", meta: "32% unallocated", status: "Available", tone: "green" }]} /></Panel></div></div>
      <aside className={styles.rail}><Panel title="Employee overview"><div className={styles.profile}><span>ED</span><div><h3>Emma Davis</h3><p>Senior Designer · Creative</p></div></div><Tabs items={["Overview", "Work", "Access"]} /><List items={[{ title: "Manager", meta: "Olivia Martin · Creative Director" }, { title: "Capacity", meta: "112% · 45h allocated", status: "Overloaded", tone: "red" }, { title: "Active projects", meta: "8 projects · 3 clients" }, { title: "Open tasks", meta: "24 open · 5 overdue", status: "Needs action", tone: "orange" }, { title: "SLA performance", meta: "91.8% · last 30 days" }, { title: "Upcoming leave", meta: "No leave scheduled" }]} /><div className={styles.actions}><ActionButton>View workload</ActionButton><ActionButton primary>Open employee</ActionButton></div></Panel><Panel title="Skills & assignment fit"><div className={styles.tags}>{["Editorial design", "Magazine layout", "Art direction", "Client review", "Figma"].map((tag) => <span key={tag}>{tag}</span>)}</div></Panel></aside>
    </div>
  </main>;
}

const permissionRows: Cell[][] = [
  [<Record key="1" title="lead.view" meta="View CRM lead records" />, <Scope key="2" active="DEPT" />, "Allowed", "Allowed", "Read only", "None", <Status key="3" tone="green">Inherited</Status>],
  [<Record key="1" title="lead.export" meta="Export prospect data" />, <Scope key="2" active="DEPT" />, "Allowed", "None", "None", "None", <Status key="3" tone="orange">Sensitive</Status>],
  [<Record key="1" title="outreach.launch" meta="Launch approved campaigns" />, <Scope key="2" active="DEPT" />, "Allowed", "None", "None", "None", <Status key="3" tone="orange">Approval required</Status>],
  [<Record key="1" title="deal.approve_discount" meta="Approve commercial discounts" />, <Scope key="2" active="ASN" />, "Up to 10%", "None", "None", "None", <Status key="3" tone="purple">Guarded</Status>],
  [<Record key="1" title="payment.refund" meta="Issue payment refunds" />, <Scope key="2" active="NONE" />, "None", "None", "None", "None", <Status key="3" tone="red">Denied</Status>],
  [<Record key="1" title="audit.view" meta="View immutable audit events" />, <Scope key="2" active="READ" />, "Read only", "None", "None", "None", <Status key="3" tone="blue">Logged</Status>],
];

function Scope({ active }: { active: string }) { return <div className={styles.scope}><b>{active}</b></div>; }

export function RolesPermissionsScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="SETTINGS / ACCESS CONTROL" title="Roles & Permissions" subtitle="Define module access, record scope, sensitive actions and client-safe visibility with server-enforced policies.">
      <ActionButton><History size={14} /> Change history</ActionButton><ActionButton><Users size={14} /> Assign users</ActionButton><ActionButton primary><Plus size={14} /> Create role</ActionButton>
    </PageHeader>
    <div className={styles.securityNote}><LockKeyhole size={19} /><div><b>Server-enforced authorization</b><span>Navigation visibility is presentation only. Route, API/server action, record and field access must enforce the same policy.</span></div><Status tone="green">Policy synced</Status></div>
    <Tabs items={["Roles · 17", "Permission Matrix", "Scope Rules", "Sensitive Actions", "Client Visibility", "Users by Role", "Change History"]} />
    <div className={styles.permissionLayout}>
      <aside className={styles.roleList}><label className={styles.search}><Search size={14} /><input aria-label="Search roles" placeholder="Search roles…" /></label>{[["Super Admin", "2 users"], ["Admin", "4 users"], ["Sales Manager", "6 users"], ["Sales Executive", "14 users"], ["Editor-in-Chief", "2 users"], ["Editor", "8 users"], ["Writer", "12 users"], ["Finance Manager", "3 users"], ["Client User", "36 users"]].map(([role, count], index) => <button className={index === 2 ? styles.selected : ""} key={role} type="button"><span><b>{role}</b><small>{count}</small></span><ChevronRight size={14} /></button>)}</aside>
      <section className={styles.stack}><Panel title="Sales Manager permission matrix" action={<div className={styles.actions}><ActionButton>Duplicate role</ActionButton><ActionButton primary><Save size={13} /> Save role</ActionButton></div>}><FilterBar search="Search permission key…" filters={["All modules", "All scopes", "Changed only"]} /><DataTable headers={["Permission", "Scope", "Manager", "Executive", "Researcher", "Client", "Control"]} rows={permissionRows} minWidth={940} /></Panel><Panel title="Scope legend"><div className={styles.scopeLegend}>{[["ORG", "Organization-wide"], ["DEPT", "Department"], ["ASN", "Assigned records"], ["OWN", "Owned records"], ["CLIENT", "Client-safe scope"], ["READ", "Read only"], ["NONE", "Denied"]].map(([code, label]) => <span key={code}><b>{code}</b>{label}</span>)}</div></Panel></section>
      <aside className={styles.rail}><Panel title="Role details"><Status tone="blue">System role</Status><h3 className={styles.sectionTitle}>Sales Manager</h3><p className={styles.muted}>Department leadership access for pipeline, assignments, outreach approvals and commercial oversight.</p><List items={[{ title: "Assigned users", meta: "6 active employees" }, { title: "Default scope", meta: "DEPT · Sales" }, { title: "Allowed modules", meta: "Sales, outreach, inbox, meetings, deals" }, { title: "Sensitive actions", meta: "4 require approval", status: "Guarded", tone: "orange" }, { title: "Client visibility", meta: "No client portal access", status: "Internal", tone: "purple" }]} /></Panel><Panel title="Recent permission changes"><List items={[{ title: "lead.export changed", meta: "ORG → DEPT · John Admin" }, { title: "discount limit updated", meta: "5% → 10% · Aug 18" }, { title: "audit.view granted", meta: "READ scope · Aug 12" }]} /></Panel></aside>
    </div>
  </main>;
}

export function AnalyticsWorkspaceScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="ANALYTICS / PERFORMANCE INTELLIGENCE" title="Analytics Workspace" subtitle="Verified cross-functional performance, conversion, delivery, revenue and capacity intelligence.">
      <ActionButton>Aug 1–20, 2026</ActionButton><ActionButton><BarChart3 size={14} /> Compare periods</ActionButton><ActionButton><Save size={14} /> Save view</ActionButton><ActionButton primary><Download size={14} /> Export data</ActionButton>
    </PageHeader>
    <DemoDataNote>All prototype values are dummy data. Production analytics must retain source, period, collection time and verification state.</DemoDataNote>
    <Tabs items={["Overview", "Sales", "Outreach", "Clients", "Projects", "Editorial", "Production", "Publishing", "Distribution", "Finance", "Team", "Renewals"]} />
    <FilterBar search="Search metric, client, project or owner…" filters={["All departments", "All clients", "All products", "Verified data only"]} />
    <Metrics items={[
      { label: "Revenue", value: "$1.82M", meta: "+16.8% vs prior", icon: CircleDollarSign, tone: "green" }, { label: "Pipeline conversion", value: "31.4%", meta: "+4.2 pts", icon: TrendingUp }, { label: "Client health", value: "86/100", meta: "4 accounts at risk", icon: Gauge, tone: "purple" }, { label: "On-time delivery", value: "92.6%", meta: "+1.7 pts", icon: CheckCircle2, tone: "green" }, { label: "Approval turnaround", value: "18.4h", meta: "Target under 24h", icon: Clock3, tone: "blue" }, { label: "Team utilization", value: "82%", meta: "7 over capacity", icon: Users, tone: "orange" },
    ]} />
    <div className={styles.analyticsGrid}>
      <Panel title="Revenue and weighted pipeline" action={<Status tone="green">Verified · Finance ledger</Status>} className={styles.span2}><ChartBars values={[38, 44, 42, 55, 61, 58, 74, 69, 82, 88, 91, 96]} labels={["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"]} /></Panel>
      <Panel title="Conversion funnel"><FunnelRows items={[["Qualified leads", "1,284", 100], ["Positive replies", "326", 72], ["Meetings", "148", 52], ["Proposals", "86", 38], ["Won", "42", 24]]} /></Panel>
      <Panel title="Project delivery by stage"><BarRows items={[["Editorial", 84, "42 active"], ["Design", 68, "28 active"], ["Client review", 46, "19 active"], ["Publishing", 32, "13 active"], ["Distribution", 25, "10 active"]]} /></Panel>
      <Panel title="Client health distribution"><div className={styles.healthDonut}><strong>86</strong><small>Average health</small></div><div className={styles.legend}><span><i data-tone="green" />Healthy · 38</span><span><i data-tone="orange" />Watch · 9</span><span><i data-tone="red" />At risk · 4</span></div></Panel>
      <Panel title="Bottlenecks requiring action"><List items={[{ title: "Client design approvals", meta: "Median wait 3.8 days", status: "+1.2d", tone: "red" }, { title: "Podcast internal review", meta: "7 items over SLA", status: "High", tone: "orange" }, { title: "Distribution verification", meta: "12 URLs unverified", status: "Review", tone: "orange" }]} /></Panel>
      <Panel title="Team utilization"><BarRows items={[["Creative", 97, "97%"], ["Production", 91, "91%"], ["Editorial", 86, "86%"], ["Sales", 78, "78%"], ["Client success", 72, "72%"]]} /></Panel>
      <Panel title="Source health"><List items={[{ title: "Finance ledger", meta: "Synced 8 min ago", status: "Verified", tone: "green" }, { title: "Google Analytics 4", meta: "Synced 13 min ago", status: "Verified", tone: "green" }, { title: "LinkedIn Insights", meta: "One account needs review", status: "Partial", tone: "orange" }, { title: "Project workflow", meta: "Live event stream", status: "Verified", tone: "green" }]} /></Panel>
    </div>
  </main>;
}

function ChartBars({ values, labels }: { values: number[]; labels: string[] }) { return <div className={styles.chartBars}>{values.map((value, index) => <span key={labels[index]}><i style={{ height: `${value}%` }} /><small>{labels[index]}</small></span>)}</div>; }
function FunnelRows({ items }: { items: [string, string, number][] }) { return <div className={styles.funnel}>{items.map(([label, value, width]) => <div key={label}><p><b>{label}</b><span>{value}</span></p><i style={{ width: `${width}%` }} /></div>)}</div>; }

const auditRows: Cell[][] = [
  ["Aug 21 · 10:42:18", <Record key="1" title="John Admin" meta="Super Admin" />, <Status key="2" tone="red">Permission changed</Status>, <Record key="3" title="Sales Manager role" meta="permission.role · ROL-0004" />, "Scope: ORG → DEPT", "Web · 103.82.41.17", <Status key="4" tone="orange">High</Status>],
  ["Aug 21 · 10:18:04", <Record key="1" title="Aisha Kapoor" meta="Distribution Manager" />, <Status key="2" tone="blue">Publication verified</Status>, <Record key="3" title="LinkedIn distribution" meta="distribution.item · DST-184-LI" />, "liveUrl added", "Automation + web", <Status key="4" tone="blue">Normal</Status>],
  ["Aug 21 · 09:54:31", <Record key="1" title="David Wilson" meta="Finance Manager" />, <Status key="2" tone="orange">Invoice edited</Status>, <Record key="3" title="INV-2026-1087" meta="invoice · NextPay" />, "dueDate changed", "Web · managed device", <Status key="4" tone="orange">Sensitive</Status>],
  ["Aug 21 · 09:17:42", <Record key="1" title="Publishing worker" meta="Automation" />, <Status key="2" tone="red">Publish failed</Status>, <Record key="3" title="Magzter channel" meta="publication.target" />, "AUTH_EXPIRED", "Worker · eu-west", <Status key="4" tone="red">Failure</Status>],
  ["Aug 21 · 08:48:11", <Record key="1" title="Maya Patel" meta="Editor-in-Chief" />, <Status key="2" tone="green">Approval decided</Status>, <Record key="3" title="Magazine cover v4" meta="approval.decision · APR-0442" />, "Pending → Approved", "Web · 49.36.88.12", <Status key="4" tone="blue">Normal</Status>],
];

export function AuditLogsScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="SECURITY / SYSTEM ACTIVITY" title="Audit Logs" subtitle="Append-only evidence of sensitive user, automation, workflow, finance, access and publishing activity.">
      <ActionButton><Save size={14} /> Save audit view</ActionButton><ActionButton><Download size={14} /> Export audit report</ActionButton><ActionButton primary><ShieldCheck size={14} /> Flag for review</ActionButton>
    </PageHeader>
    <div className={styles.securityNote}><LockKeyhole size={19} /><div><b>Immutable evidence</b><span>Audit events cannot be edited or deleted through the application. Retention and legal-hold policies apply.</span></div><Status tone="green">Integrity verified</Status></div>
    <Metrics items={[
      { label: "Events today", value: "12,842", meta: "Across 28 modules", icon: Activity }, { label: "High-risk events", value: "18", meta: "6 need review", icon: AlertTriangle, tone: "red" }, { label: "Permission changes", value: "7", meta: "All authorized", icon: KeyRound, tone: "orange" }, { label: "Finance actions", value: "146", meta: "9 sensitive", icon: CircleDollarSign, tone: "purple" }, { label: "Failed actions", value: "23", meta: "0 unresolved security", icon: LockKeyhole, tone: "red" }, { label: "Data exports", value: "11", meta: "All logged", icon: Download, tone: "green" },
    ]} />
    <Tabs items={["All Activity", "Security", "Permissions", "Finance", "Clients", "Projects", "Editorial", "Publishing", "Data Exports", "System Events"]} />
    <FilterBar search="Search actor, action, entity, ID or IP…" filters={["Last 24 hours", "All users", "All modules", "All risk levels"]} />
    <div className={styles.mainRail}><Panel title="System activity stream" action={<Status tone="green">Live · 2s latency</Status>}><DataTable headers={["Timestamp", "Actor", "Action", "Entity", "Change / result", "Source", "Risk"]} rows={auditRows} minWidth={1120} /></Panel><aside className={styles.rail}><Panel title="Immutable event detail"><Status tone="red">High risk</Status><h3 className={styles.sectionTitle}>Role permission scope changed</h3><List items={[{ title: "Event ID", meta: "AUD-2026-8F42A91" }, { title: "Actor", meta: "John Admin · Super Admin" }, { title: "Entity", meta: "Sales Manager · ROL-0004" }, { title: "Timestamp", meta: "Aug 21, 2026 · 10:42:18.442 IST" }, { title: "Reason", meta: "Department isolation rollout" }, { title: "Source", meta: "Web · 103.82.41.17 · managed device" }]} /><div className={styles.diff}><div><small>Before</small><code>scope: &quot;ORG&quot;</code></div><div><small>After</small><code>scope: &quot;DEPT&quot;</code></div></div><div className={styles.actions}><ActionButton>Open record</ActionButton><ActionButton primary>Related events</ActionButton></div></Panel><Panel title="Saved audit views"><List items={[{ title: "Sensitive finance actions", meta: "Refunds, credits, invoice edits" }, { title: "Access and permissions", meta: "Roles, users, client access" }, { title: "Publishing corrections", meta: "Publish, unpublish, corrections" }]} /></Panel></aside></div>
  </main>;
}

const settingGroups = ["General", "Organization Profile", "Workspace & Navigation", "Departments & Teams", "Roles & Permissions", "Sales & CRM", "Outreach & Email", "Client Portal", "Projects & Workflows", "Editorial", "Magazine", "Podcast", "Video", "Events", "Publishing", "Distribution", "Finance & Billing", "Notifications", "Integrations", "Automations", "Security", "Data & Privacy", "Audit & Retention", "Advanced"];

export function OrganizationSettingsScreen() {
  return <main className={styles.page}>
    <PageHeader eyebrow="SYSTEM / ORGANIZATION SETTINGS" title="System & Organization Settings" subtitle="Configure organization-wide identity, defaults, workflows, integrations, security and operating policies.">
      <ActionButton><History size={14} /> Change history</ActionButton><ActionButton><Download size={14} /> Export settings</ActionButton><ActionButton primary><Save size={14} /> Save changes</ActionButton>
    </PageHeader>
    <div className={styles.settingsLayout}>
      <aside className={styles.settingsNav}><label className={styles.search}><Search size={14} /><input aria-label="Search settings" placeholder="Search settings…" /></label>{settingGroups.map((group, index) => <button className={index === 0 ? styles.selected : ""} key={group} type="button"><span>{group}</span><ChevronRight size={13} /></button>)}</aside>
      <section className={styles.settingsContent}>
        <Panel title="General organization settings" action={<Status tone="green">Last saved 8 min ago</Status>}>
          <div className={styles.formGrid}><Field label="Organization name" value="The Perspective Global" /><Field label="Legal name" value="The Perspective Global Private Limited" /><Field label="Workspace URL" value="app.theperspective.com" /><Field label="Default timezone" value="Asia/Calcutta (IST)" select /><Field label="Default currency" value="INR — Indian Rupee" select /><Field label="Default locale" value="English (India)" select /></div>
        </Panel>
        <Panel title="Organization identity"><div className={styles.identitySettings}><div className={styles.logoTile}>P</div><div><h3>The Perspective</h3><p className={styles.muted}>Primary workspace logo · PNG or SVG · recommended 512×512</p><div className={styles.actions}><ActionButton><Upload size={13} /> Replace logo</ActionButton><ActionButton>Remove</ActionButton></div></div></div><div className={styles.formGrid}><Field label="Workspace display name" value="The Perspective Team Workspace" /><Field label="Support email" value="support@theperspective.com" /><Field label="Primary brand color" value="#3425E8" /><Field label="Client portal name" value="The Perspective Client Portal" /></div></Panel>
        <Panel title="Workspace defaults"><div className={styles.toggleList}><Toggle title="Require an owner for every active record" meta="Applies to leads, deals, clients, projects and publication records." checked /><Toggle title="Enable client-safe visibility by default" meta="New client-facing records require explicit CLIENT_VISIBLE classification." checked /><Toggle title="Require versioned approval evidence" meta="Approvals always reference an immutable content or document version." checked /><Toggle title="Allow unrestricted data export" meta="Keep disabled; exports require role permission and audit evidence." /></div></Panel>
        <div className={styles.twoColumns}><Panel title="Connected systems"><List items={[{ title: "Google Workspace", meta: "Email and calendar · connected", status: "Healthy", tone: "green" }, { title: "Stripe", meta: "Payments · live mode", status: "Healthy", tone: "green" }, { title: "Magzter", meta: "Publishing · authentication expired", status: "Action", tone: "red" }, { title: "Google Analytics 4", meta: "Reporting · synced 13 min ago", status: "Healthy", tone: "green" }]} /><ActionButton><Network size={13} /> Manage integrations</ActionButton></Panel><Panel title="Security posture"><List items={[{ title: "Multi-factor authentication", meta: "Required for privileged roles", status: "Enforced", tone: "green" }, { title: "Session timeout", meta: "30 minutes for finance/admin", status: "Active", tone: "green" }, { title: "Data retention", meta: "7 years finance · configurable", status: "Policy", tone: "blue" }, { title: "Audit integrity", meta: "Append-only storage", status: "Verified", tone: "green" }]} /><ActionButton><ShieldCheck size={13} /> Open security settings</ActionButton></Panel></div>
      </section>
      <aside className={styles.rail}><Panel title="Configuration status"><div className={styles.scoreRing}>94<small>% complete</small></div><List items={[{ title: "Organization profile", meta: "All required fields", status: "Complete", tone: "green" }, { title: "Publishing integrations", meta: "One account needs action", status: "Review", tone: "red" }, { title: "Finance defaults", meta: "Tax and terms configured", status: "Complete", tone: "green" }, { title: "Retention policy", meta: "Review due Sep 1", status: "Upcoming", tone: "orange" }]} /></Panel><Panel title="Recent changes"><List items={[{ title: "Default timezone updated", meta: "John Admin · 8 min ago" }, { title: "Client portal logo replaced", meta: "Olivia Martin · Aug 20" }, { title: "Approval rule enabled", meta: "Maya Patel · Aug 19" }]} /></Panel><Panel title="Need help?"><p className={styles.muted}>Review configuration guidance before changing security, finance, retention or integration policies.</p><ActionButton href="/help">Open administrator guide</ActionButton></Panel></aside>
    </div>
  </main>;
}

function Field({ label, value, select = false }: { label: string; value: string; select?: boolean }) {
  return <label className={styles.field}><span>{label}</span>{select ? <select aria-label={label} defaultValue={value}><option>{value}</option></select> : <input aria-label={label} defaultValue={value} />}</label>;
}

function Toggle({ title, meta, checked = false }: { title: string; meta: string; checked?: boolean }) {
  return <label className={styles.toggle}><input defaultChecked={checked} type="checkbox" /><span /><p><b>{title}</b><small>{meta}</small></p></label>;
}
