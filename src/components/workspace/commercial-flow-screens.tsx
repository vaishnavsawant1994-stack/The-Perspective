"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  AlertTriangle,
  BadgeCheck,
  Bell,
  BookOpen,
  Boxes,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  FolderKanban,
  GitBranch,
  ListChecks,
  Mail,
  MoreHorizontal,
  PackageCheck,
  Pencil,
  Percent,
  Plus,
  ReceiptText,
  RefreshCcw,
  Save,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  Users,
  WalletCards,
  XCircle,
} from "lucide-react";
import s from "./commercial-flow.module.css";

type IconType = React.ComponentType<{ size?: number }>;
type Metric = { label: string; value: string; note?: string; icon: IconType };
type Row = Record<string, string>;

function makeMetrics(
  items: Array<[string, string, string, IconType]>,
): Metric[] {
  return items.map(([label, value, note, icon]) => ({
    label,
    value,
    note,
    icon,
  }));
}

const faces = [
  "/images/articles/arjun-mehta.png",
  "/images/articles/elena-rossi.png",
  "/images/articles/marcus-chen.png",
  "/images/articles/daniel-kim.png",
];

function Button({
  children,
  primary,
  success,
  danger,
  small,
  href,
}: {
  children: React.ReactNode;
  primary?: boolean;
  success?: boolean;
  danger?: boolean;
  small?: boolean;
  href?: string;
}) {
  const cls = `${s.button} ${primary ? s.primary : ""} ${success ? s.success : ""} ${danger ? s.danger : ""} ${small ? s.small : ""}`;
  return href ? (
    <Link className={cls} href={href}>
      {children}
    </Link>
  ) : (
    <button className={cls} type="button">
      {children}
    </button>
  );
}

function Header({
  trail,
  title,
  subtitle,
  children,
}: {
  trail: string;
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={s.header}>
      <div>
        <div className={s.eyebrow}>
          {trail.split("/").map((x, i) => (
            <span key={x}>
              {i > 0 && <ChevronRight size={10} />} {x}
            </span>
          ))}
        </div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className={s.actions}>{children}</div>
    </header>
  );
}

function Metrics({ items }: { items: Metric[] }) {
  return (
    <div className={s.metrics}>
      {items.map(({ label, value, note, icon: I }) => (
        <article className={s.metric} key={label}>
          <span className={s.metricIcon}>
            <I size={17} />
          </span>
          <div>
            <small>{label}</small>
            <strong>{value}</strong>
            {note && <em>{note}</em>}
          </div>
        </article>
      ))}
    </div>
  );
}

function Tabs({ items }: { items: string[] }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <nav className={s.tabs}>
      {items.map((x, index) => (
        <button
          className={index === activeTab ? s.active : undefined}
          onClick={() => setActiveTab(index)}
          type="button"
          key={x}
        >
          {x}
        </button>
      ))}
    </nav>
  );
}
function Filters({
  search = "Search records...",
  items = ["All Owners", "All Companies", "All Statuses", "All Time"],
}: {
  search?: string;
  items?: string[];
}) {
  return (
    <div className={s.filters}>
      <label>
        <Search size={13} />
        <input placeholder={search} />
      </label>
      {items.map((x) => (
        <button type="button" key={x}>
          {x}
          <ChevronDown size={12} />
        </button>
      ))}
      <Button small>
        <Filter size={12} /> Filters
      </Button>
    </div>
  );
}
function Card({
  title,
  action,
  children,
  className = "",
}: {
  title?: string;
  action?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={`${s.card} ${s.cardPad} ${className}`}>
      {title && (
        <header className={s.cardHeader}>
          <h2>{title}</h2>
          {action && (
            <Link href="#">
              {action} <ChevronRight size={10} />
            </Link>
          )}
        </header>
      )}
      {children}
    </section>
  );
}
function Pill({ value }: { value: string }) {
  const c = /Overdue|Declined|Failed|Lost|Void|Rejected/.test(value)
    ? s.bad
    : /Pending|Review|Draft|Due|Partial|Expir|Nurture/.test(value)
      ? s.warn
      : /Sent|Viewed|Open|Progress|Ready/.test(value)
        ? s.blue
        : /Current|Qualified/.test(value)
          ? s.violet
          : "";
  return <em className={`${s.pill} ${c}`}>{value}</em>;
}
function Avatar({
  index = 0,
  name = "Michael Chen",
  image = false,
}: {
  index?: number;
  name?: string;
  image?: boolean;
}) {
  return image ? (
    <Image
      className={s.avatar}
      src={faces[index % faces.length]}
      alt={name}
      width={30}
      height={30}
    />
  ) : (
    <span className={s.avatar}>
      {name
        .split(" ")
        .map((x) => x[0])
        .join("")
        .slice(0, 2)}
    </span>
  );
}
function Person({
  name,
  role,
  index = 0,
}: {
  name: string;
  role?: string;
  index?: number;
}) {
  return (
    <span className={s.mainCell}>
      <Avatar image index={index} name={name} />
      <span>
        <b>{name}</b>
        {role && <small>{role}</small>}
      </span>
    </span>
  );
}
function Details({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <div className={s.detailList}>
      {items.map(([k, v]) => (
        <div className={s.detail} key={k}>
          <span>{k}</span>
          <b>{v}</b>
        </div>
      ))}
    </div>
  );
}
function Summary({ items }: { items: [string, React.ReactNode][] }) {
  return (
    <section className={`${s.card} ${s.summaryStrip}`}>
      {items.map(([k, v]) => (
        <div className={s.summaryItem} key={k}>
          <small>{k}</small>
          <strong>{v}</strong>
        </div>
      ))}
    </section>
  );
}
function List({
  items,
}: {
  items: { title: string; note: string; status?: string; icon?: IconType }[];
}) {
  return (
    <div className={s.list}>
      {items.map(({ title, note, status, icon: I = FileText }) => (
        <div className={s.listItem} key={title}>
          <span className={s.metricIcon}>
            <I size={14} />
          </span>
          <span>
            <b>{title}</b>
            <small>{note}</small>
          </span>
          {status && <Pill value={status} />}
        </div>
      ))}
    </div>
  );
}
function Timeline({ items }: { items: [string, string, string][] }) {
  return (
    <div className={s.timeline}>
      {items.map(([date, title, note]) => (
        <div className={s.timeItem} key={`${date}-${title}`}>
          <small>{date}</small>
          <i />
          <span>
            <b>{title}</b>
            <small>{note}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
function StageFlow({
  current = 2,
  labels = [
    "Qualification",
    "Discovery",
    "Solution Fit",
    "Proposal",
    "Negotiation",
    "Contract Review",
    "Closed Won",
  ],
}: {
  current?: number;
  labels?: string[];
}) {
  return (
    <div className={s.stageFlow}>
      {labels.map((x, i) => (
        <div
          className={`${s.stage} ${i < current ? s.done : ""} ${i === current ? s.current : ""}`}
          key={x}
        >
          <i>{i < current ? <Check size={13} /> : i + 1}</i>
          <b>{x}</b>
          <small>
            {i === current
              ? "Current stage"
              : i < current
                ? "Completed"
                : "Upcoming"}
          </small>
        </div>
      ))}
    </div>
  );
}
function Pagination({ total = "128" }: { total?: string }) {
  return (
    <footer className={s.pageFooter}>
      <span>Showing 1 to 10 of {total} records</span>
      <div className={s.pagination}>
        <button>‹</button>
        <button>1</button>
        <button>2</button>
        <button>3</button>
        <button>›</button>
      </div>
      <span>Rows per page &nbsp; 10⌄</span>
    </footer>
  );
}
function QuickActions({ items }: { items: string[] }) {
  return (
    <div className={s.quickGrid}>
      {items.map((x, i) => (
        <Button key={x}>
          {i % 3 === 0 ? (
            <Plus size={13} />
          ) : i % 3 === 1 ? (
            <Mail size={13} />
          ) : (
            <FileText size={13} />
          )}
          {x}
        </Button>
      ))}
    </div>
  );
}

const proposalRows: Row[] = [
  {
    name: "TechNova Magazine Proposal",
    id: "PRP-2024-0056",
    company: "TechNova Solutions · Arjun Mehta",
    deal: "TechNova Solutions – Magazine",
    pkg: "Premium Magazine + Podcast",
    value: "$18,000",
    owner: "Michael Chen",
    version: "v2.1",
    created: "May 24, 2024",
    expiry: "Jun 30, 2024",
    status: "Sent",
    activity: "Viewed · May 26",
  },
  {
    name: "GreenLeaf Media Proposal",
    id: "PRP-2024-0055",
    company: "GreenLeaf Energy · Priya Patel",
    deal: "GreenLeaf – Feature",
    pkg: "Executive Feature",
    value: "$12,500",
    owner: "Priya Patel",
    version: "v1.0",
    created: "May 23, 2024",
    expiry: "Jun 15, 2024",
    status: "Internal Review",
    activity: "Viewed by team",
  },
  {
    name: "BrightMind AI Proposal",
    id: "PRP-2024-0054",
    company: "BrightMind AI · Sarah Johnson",
    deal: "BrightMind AI – Partnership",
    pkg: "Partnership Package",
    value: "$25,000",
    owner: "Sarah Johnson",
    version: "v3.0",
    created: "May 22, 2024",
    expiry: "Jun 10, 2024",
    status: "Approval Required",
    activity: "Pending approval",
  },
  {
    name: "DataCore Systems Proposal",
    id: "PRP-2024-0053",
    company: "DataCore Systems · Kyle Anderson",
    deal: "DataCore – Magazine",
    pkg: "Premium Magazine + Digital Boost",
    value: "$15,000",
    owner: "Michael Chen",
    version: "v1.2",
    created: "May 21, 2024",
    expiry: "Jun 28, 2024",
    status: "Approved",
    activity: "Approved · May 22",
  },
  {
    name: "CloudScale Partnership",
    id: "PRP-2024-0052",
    company: "CloudScale · Vikram Singh",
    deal: "CloudScale – Partnership",
    pkg: "Strategic Partnership",
    value: "$50,000",
    owner: "Vikram Singh",
    version: "v2.0",
    created: "May 20, 2024",
    expiry: "Jun 12, 2024",
    status: "Sent",
    activity: "Opened · May 24",
  },
  {
    name: "NeuroGen Labs Proposal",
    id: "PRP-2024-0051",
    company: "NeuroGen Labs · Anita Desai",
    deal: "NeuroGen – Podcast",
    pkg: "Podcast Sponsorship",
    value: "$8,500",
    owner: "Emily Davis",
    version: "v1.0",
    created: "May 19, 2024",
    expiry: "Jun 8, 2024",
    status: "Changes Requested",
    activity: "Changes requested",
  },
  {
    name: "Summit Advisors Proposal",
    id: "PRP-2024-0050",
    company: "Summit Advisors · James Wilson",
    deal: "Summit – Magazine",
    pkg: "Executive Feature",
    value: "$11,000",
    owner: "James Wilson",
    version: "v1.0",
    created: "May 18, 2024",
    expiry: "Jun 5, 2024",
    status: "Draft",
    activity: "Draft saved",
  },
  {
    name: "GlobalTech Corp Proposal",
    id: "PRP-2024-0049",
    company: "GlobalTech Corp · Robert Williams",
    deal: "GlobalTech – Magazine",
    pkg: "Premium Magazine + Podcast",
    value: "$30,000",
    owner: "Michael Chen",
    version: "v2.3",
    created: "May 17, 2024",
    expiry: "May 31, 2024",
    status: "Expiring Soon",
    activity: "Viewed · May 24",
  },
];

function ProposalTable() {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Proposal</th>
            <th>Company / Contact</th>
            <th>Related Deal</th>
            <th>Package</th>
            <th>Value</th>
            <th>Owner</th>
            <th>Version</th>
            <th>Created</th>
            <th>Expiry</th>
            <th>Status</th>
            <th>Last Activity</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {proposalRows.map((r, i) => (
            <tr className={i === 0 ? s.selected : ""} key={r.id}>
              <td>
                <span className={s.mainCell}>
                  <span className={`${s.avatar} ${s.logo}`}>
                    <FileText size={14} />
                  </span>
                  <span>
                    <b>{r.name}</b>
                    <small>{r.id}</small>
                  </span>
                </span>
              </td>
              <td>{r.company}</td>
              <td>
                {r.deal}
                <small>Qualification</small>
              </td>
              <td>{r.pkg}</td>
              <td>
                <b>{r.value}</b>
                <small>USD</small>
              </td>
              <td>
                <Person name={r.owner} index={i} />
              </td>
              <td>{r.version}</td>
              <td>{r.created}</td>
              <td>{r.expiry}</td>
              <td>
                <Pill value={r.status} />
              </td>
              <td>{r.activity}</td>
              <td>
                <MoreHorizontal size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total="128" />
    </div>
  );
}

export function DealQualificationScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Deals / TechNova Solutions – Magazine"
        title="TechNova Solutions – Magazine"
        subtitle="Active opportunity · Qualification stage"
      >
        <Button primary>
          <GitBranch size={14} /> Move Stage <ChevronDown size={12} />
        </Button>
        <Button href="/app/deals/proposals">
          <FileText size={14} /> Create Proposal
        </Button>
        <Button>
          <MoreHorizontal size={14} /> More Actions
        </Button>
      </Header>
      <Summary
        items={[
          ["Company", "TechNova Solutions"],
          [
            "Primary Contact",
            <Person
              key="p"
              name="Arjun Mehta"
              role="Chief Marketing Officer"
            />,
          ],
          [
            "Deal Owner",
            <Person
              key="o"
              name="Michael Chen"
              role="Publishing Manager"
              index={2}
            />,
          ],
          ["Deal Value", "$18,000 USD"],
          ["Probability", "60% · Medium"],
          ["Expected Close", "Jun 30, 2024"],
          ["Deal Source", "Tech Leaders – Q2 2024"],
          ["Linked Lead", <Pill key="l" value="Lead 360" />],
        ]}
      />
      <StageFlow current={0} />
      <Tabs
        items={[
          "Overview",
          "Qualification · 1",
          "Stakeholders",
          "Activities",
          "Meetings · 3",
          "Files · 4",
          "Tasks · 5",
          "Notes",
          "Timeline",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Deal Summary">
              <Details
                items={[
                  ["Deal Type", "New Business"],
                  ["Interest", "Magazine Feature + Podcast"],
                  ["Package", "Premium Magazine + Podcast"],
                  ["Budget Range", "$15,000 – $25,000"],
                  ["Decision Timeline", "2 – 3 weeks"],
                  ["Payment Terms", "50% upfront, 50% on publication"],
                  [
                    "Lead Score",
                    <span key="x" className={s.green}>
                      92 · Excellent
                    </span>,
                  ],
                ]}
              />
            </Card>
            <Card title="Need & Business Problem">
              <p>
                TechNova wants to increase brand visibility among C-level
                executives and technology decision makers.
              </p>
              <p>
                They are launching a new AI platform and want authority
                positioning through a premium magazine feature and executive
                podcast.
              </p>
              <Link className={s.link} href="#">
                View full discovery notes →
              </Link>
            </Card>
            <Card title="Next Action">
              <List
                items={[
                  {
                    title: "Follow-up call with Arjun",
                    note: "Confirm stakeholders and package scope",
                    status: "Due Today",
                    icon: CalendarDays,
                  },
                ]}
              />
              <Details
                items={[
                  ["Due Date", "May 27, 2024"],
                  ["Owner", <Person key="m" name="Michael Chen" index={2} />],
                ]}
              />
              <Button primary>
                <CalendarDays size={13} /> Schedule Meeting
              </Button>
            </Card>
          </div>
          <div className={s.grid3} style={{ marginTop: 10 }}>
            <Card title="Qualification Score">
              <div className={s.donutWrap}>
                <div className={s.donut}>
                  <span>
                    <b>78</b>
                    <small>Good</small>
                  </span>
                </div>
                <Details
                  items={[
                    ["Need", "20 / 20"],
                    ["Budget", "15 / 20"],
                    ["Authority", "18 / 20"],
                    ["Timeline", "15 / 20"],
                    ["Fit", "10 / 10"],
                    ["Risk", "7 / 10"],
                  ]}
                />
              </div>
            </Card>
            <Card title="Qualification Details">
              <List
                items={[
                  {
                    title: "Need",
                    note: "High – strong business need",
                    status: "Excellent",
                    icon: Target,
                  },
                  {
                    title: "Budget",
                    note: "Confirmed – $18,000 allocated",
                    status: "Confirmed",
                    icon: CircleDollarSign,
                  },
                  {
                    title: "Authority",
                    note: "Arjun is decision influencer",
                    status: "High",
                    icon: Users,
                  },
                  {
                    title: "Timeline",
                    note: "2–3 weeks to finalize",
                    status: "Good",
                    icon: Clock3,
                  },
                  {
                    title: "Commercial Readiness",
                    note: "Scope discussion in progress",
                    status: "Ready",
                    icon: BriefcaseBusiness,
                  },
                ]}
              />
            </Card>
            <Card title="Key Information">
              <Details
                items={[
                  ["Competitors", "Forbes, Entrepreneur, Business Today"],
                  ["Buying Signals", "Requested pricing · podcast interest"],
                  ["Potential Risks", "Internal approval pending"],
                  ["Objections", "Needs internal approval"],
                  ["Deal Note", "Waiting for final approval from CEO"],
                ]}
              />
            </Card>
          </div>
          <Card
            title="Recent Meetings & Interactions"
            action="View all interactions"
            className=""
          >
            <table className={s.compactTable}>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Title / Summary</th>
                  <th>Date / Time</th>
                  <th>Outcome</th>
                  <th>Owner</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Intro Call",
                    "Intro call with Arjun Mehta",
                    "May 24 · 10:00 AM",
                    "Positive",
                    "Michael Chen",
                  ],
                  [
                    "Discovery Call",
                    "Discussed needs and package interest",
                    "May 24 · 11:30 AM",
                    "Very Positive",
                    "Emily Davis",
                  ],
                  [
                    "Follow-up Email",
                    "Sent pricing and package details",
                    "May 24 · 12:45 PM",
                    "Opened",
                    "Michael Chen",
                  ],
                ].map((r, i) => (
                  <tr key={r[0]}>
                    <td>
                      <Pill value={r[0]} />
                    </td>
                    <td>{r[1]}</td>
                    <td>{r[2]}</td>
                    <td>
                      <Pill value={r[3]} />
                    </td>
                    <td>
                      <Person name={r[4]} index={i} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </main>
        <aside className={s.rail}>
          <Card title="Stakeholders (3)" action="Add Stakeholder">
            <List
              items={[
                {
                  title: "Arjun Mehta",
                  note: "CMO · Decision Maker",
                  status: "Decision Maker",
                },
                {
                  title: "Vikram Singh",
                  note: "CEO · Final approver",
                  status: "Approver",
                },
                {
                  title: "Neha Kapoor",
                  note: "Marketing Director",
                  status: "Influencer",
                },
              ]}
            />
          </Card>
          <Card title="Deal Stage History" action="View all">
            <Timeline
              items={[
                ["May 24", "Stage: Qualification", "By Michael Chen"],
                ["May 20", "Stage: Lead", "By System"],
                ["May 18", "Stage: New Lead", "By System"],
              ]}
            />
          </Card>
          <Card title="Attached Files (4)" action="View all files">
            <List
              items={[
                { title: "TechNova_Brief.pdf", note: "PDF · 1.2 MB" },
                { title: "Pricing_Options_2024.pdf", note: "PDF · 1.4 MB" },
                { title: "Podcast_Overview.pptx", note: "PPTX · 2.1 MB" },
                { title: "Case_Studies_Tech.pdf", note: "PDF · 1.8 MB" },
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Add Note",
                "Add Task",
                "Log Call",
                "Send Email",
                "Create Proposal",
                "Change Value",
                "Clone Deal",
                "Convert to Client",
                "Mark Lost",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ProposalLibraryScreen() {
  const metrics = makeMetrics([
    ["Total Proposals", "128", "View all", FileText],
    ["Total Value", "$1,245,800", "All proposals", CircleDollarSign],
    ["Draft Value", "$245,300", "19 proposals", Pencil],
    ["Sent Value", "$678,500", "42 proposals", Send],
    ["Accepted Value", "$322,000", "19 won", BadgeCheck],
    ["Acceptance Rate", "28.1%", "↑ 8.3%", Percent],
    ["Awaiting Approval", "14", "Requires action", ClipboardCheck],
    ["Expiring Soon", "9", "Next 14 days", Clock3],
    ["Avg. Time to Decision", "18.6 days", "↓ 2.4d", TrendingUp],
  ]);
  return (
    <div className={s.page}>
      <Header
        trail="Deals / Proposals"
        title="Proposal Library"
        subtitle="Create, manage and track all proposals across your deals."
      >
        <Button primary>
          <Plus size={14} /> Create Proposal
        </Button>
        <Button>
          <Sparkles size={14} /> Quick Actions
        </Button>
      </Header>
      <Metrics items={metrics} />
      <Tabs
        items={[
          "All · 128",
          "Draft · 19",
          "Internal Review · 11",
          "Approval Required · 14",
          "Approved · 9",
          "Sent · 42",
          "Viewed · 17",
          "Changes Requested · 6",
          "Accepted · 18",
          "Declined · 5",
          "Expired · 3",
          "Archived · 7",
        ]}
      />
      <div className={s.layoutWide}>
        <main>
          <Filters
            search="Search proposals by name, company, deal, or contact..."
            items={[
              "All Owners",
              "All Companies",
              "All Deal Stages",
              "All Packages",
              "All Statuses",
              "Value: All",
              "Created: All Time",
            ]}
          />
          <ProposalTable />
        </main>
        <aside className={`${s.rail} ${s.rightSummary}`}>
          <Card title="TechNova Magazine Proposal" action="1 of 128">
            <Pill value="Sent" />
            <p>
              <b>Proposal ID:</b> PRP-2024-0056 · Version 2.1
            </p>
            <div className={s.inline}>
              <Button primary href="/app/deals/proposals/prp-2024-0056/review">
                Open Proposal
              </Button>
              <Button>
                <Download size={13} /> PDF
              </Button>
            </div>
          </Card>
          <Card title="Overview">
            <Details
              items={[
                ["Company", "TechNova Solutions"],
                ["Contact", "Arjun Mehta · CMO"],
                ["Related Deal", "TechNova Solutions – Magazine"],
                ["Proposal Value", "$18,000 USD"],
                ["Expiry Date", "Jun 30, 2024 (37 days left)"],
                ["Owner", <Person key="o" name="Michael Chen" index={2} />],
                ["Package", "Premium Magazine + Podcast"],
              ]}
            />
          </Card>
          <Card title="Commercial Summary" action="View details">
            <Details
              items={[
                ["Payment Terms", "50% upfront, 50% on publication"],
                ["Validity", "37 days"],
                ["Inclusions", "Feature · Ad · Podcast · Newsletter"],
              ]}
            />
          </Card>
          <Card title="Client Engagement">
            <List
              items={[
                {
                  title: "Sent",
                  note: "May 24 · 10:00 AM",
                  status: "Completed",
                },
                {
                  title: "Opened",
                  note: "May 24 · 11:15 AM",
                  status: "Completed",
                },
                {
                  title: "Viewed",
                  note: "May 26 · 10:24 AM",
                  status: "Completed",
                },
              ]}
            />
          </Card>
          <Card title="Next Step">
            <p>
              Follow-up call with Arjun to confirm decision makers and content
              scope.
            </p>
            <Button>Schedule Follow-up</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ProposalReviewScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Deals / Proposals / TechNova Magazine Proposal v2.1 / Review & Approval"
        title="TechNova Magazine Proposal – Version 2.1"
        subtitle="Review pricing, scope, terms and the exact client-facing version before delivery."
      >
        <Button success>
          <Check size={14} /> Approve Proposal
        </Button>
        <Button>
          <RefreshCcw size={14} /> Request Changes
        </Button>
        <Button danger>
          <XCircle size={14} /> Reject Proposal
        </Button>
      </Header>
      <Summary
        items={[
          ["Company", "TechNova Solutions"],
          [
            "Contact",
            <Person
              key="p"
              name="Arjun Mehta"
              role="Chief Marketing Officer"
            />,
          ],
          ["Related Deal", "TechNova Solutions – Magazine"],
          ["Package", "Premium Magazine + Podcast"],
          ["Proposal Value", "$18,000 USD"],
          ["Created By", <Person key="c" name="Michael Chen" index={2} />],
          ["Status", <Pill key="s" value="Approval Required" />],
        ]}
      />
      <Tabs
        items={[
          "Overview",
          "Proposal Preview",
          "Commercials",
          "Approvals",
          "Comments · 3",
          "Versions · 2",
          "Files · 5",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Proposal Summary" action="Edit">
              <Details
                items={[
                  ["Proposal ID", "PRP-2024-0056"],
                  ["Version", "2.1 (Latest)"],
                  ["Deal Stage", "Qualification"],
                  ["Prepared For", "TechNova Solutions"],
                  ["Valid Until", "Jun 30, 2024"],
                  ["Payment Terms", "50% upfront, 50% publication"],
                  ["Currency", "USD"],
                ]}
              />
            </Card>
            <Card title="Proposal Description" action="Edit">
              <p>
                This proposal includes a premium magazine feature in The
                Perspective, a full-page advertisement, and a podcast episode
                collaboration to elevate TechNova Solutions’ brand visibility.
              </p>
              <List
                items={[
                  {
                    title: "Increase brand visibility",
                    note: "Reach executives and decision makers",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Showcase innovation",
                    note: "Premium editorial positioning",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Generate qualified opportunities",
                    note: "Multi-channel reach",
                    icon: CheckCircle2,
                  },
                ]}
              />
            </Card>
            <Card title="Commercial Snapshot" action="Edit">
              <Details
                items={[
                  ["Subtotal", "$20,000.00"],
                  [
                    "Discount (10%)",
                    <span key="d" className={s.red}>
                      – $2,000.00
                    </span>,
                  ],
                  ["Total Value", "$18,000.00"],
                  ["50% Upfront", "$9,000.00"],
                  ["50% on Publication", "$9,000.00"],
                ]}
              />
              <div className={s.successBox}>
                <b>Estimated Margin 35%</b>
                <p>Estimated Profit $6,300.00</p>
              </div>
            </Card>
          </div>
          <div className={s.grid3} style={{ marginTop: 10 }}>
            <Card title="What’s Included" action="Edit">
              <List
                items={[
                  {
                    title: "Editorial & Content",
                    note: "6–8 pages · interview · writing",
                  },
                  { title: "Advertising", note: "Full-page advertisement" },
                  { title: "Podcast", note: "30–45 min episode" },
                  { title: "Add-ons", note: "Social promotion · newsletter" },
                ]}
              />
            </Card>
            <Card title="Commercial Details" action="Edit">
              <Details
                items={[
                  ["Package", "Premium Magazine + Podcast"],
                  ["Inclusions", "Feature, Ad, Podcast Episode"],
                  ["Exclusions", "Travel, additional photography"],
                  ["Delivery Timeline", "4–6 weeks"],
                  ["Cancellation", "50% refund within 7 days"],
                  ["Taxes", "Applicable per local regulations"],
                ]}
              />
            </Card>
            <Card title="Client Preview" action="View full preview">
              <div className={s.coverCard}>
                <Image
                  className={s.cover}
                  src="/images/personal-magazines/arjun-mehta-hero-v2.png"
                  alt="Proposal cover"
                  width={78}
                  height={98}
                />
                <div>
                  <h3>TECHNOVA SOLUTIONS</h3>
                  <p>Premium Magazine Feature + Podcast Collaboration</p>
                  <small>Prepared May 24, 2024</small>
                </div>
              </div>
              <div className={s.inline}>
                <Button small>
                  <Eye size={12} /> Preview
                </Button>
                <Button small>
                  <Download size={12} /> PDF
                </Button>
              </div>
            </Card>
          </div>
          <div className={s.grid2} style={{ marginTop: 10 }}>
            <Card title="Comments & Internal Notes" action="Add Comment">
              <List
                items={[
                  {
                    title: "Emily Davis",
                    note: "Confirm podcast episode date availability.",
                    status: "Internal",
                  },
                  {
                    title: "Priya Patel",
                    note: "Finance review completed; pricing looks good.",
                    status: "Approved",
                  },
                  {
                    title: "Michael Chen",
                    note: "Review scope and confirm additional requirements.",
                    status: "Internal",
                  },
                ]}
              />
            </Card>
            <Card title="Version History" action="View all versions">
              <Timeline
                items={[
                  [
                    "May 24",
                    "v2.1 · Current",
                    "Submitted for Review by Michael Chen",
                  ],
                  ["May 24", "v2.0", "Draft by Michael Chen"],
                  ["May 24", "v1.0", "Original draft"],
                ]}
              />
            </Card>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Approval Workflow" action="View full workflow">
            <Timeline
              items={[
                ["May 24", "Draft", "4:15 PM"],
                ["May 24", "Submitted for Review", "4:16 PM"],
                ["May 25", "Finance Review", "Approved by Priya Patel"],
                ["Current", "Partnerships Review", "Approval Required"],
                ["Next", "Final Approval", "Michael Chen"],
                ["Next", "Sent to Client", "Pending"],
              ]}
            />
          </Card>
          <Card title="Approval Chain">
            <List
              items={[
                {
                  title: "Finance Review",
                  note: "Priya Patel · May 25",
                  status: "Approved",
                },
                {
                  title: "Partnerships Review",
                  note: "Emily Davis · Current",
                  status: "Pending",
                },
                {
                  title: "Final Approval",
                  note: "Michael Chen · Waiting",
                  status: "Pending",
                },
              ]}
            />
          </Card>
          <Card title="Related Items">
            <QuickActions
              items={[
                "Open Deal",
                "Company 360",
                "Contact 360",
                "Meeting · 2",
                "Follow-ups · 3",
                "Files · 5",
                "Tasks · 4",
                "Notes · 1",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

const contractRows: Row[] = [
  {
    name: "TechNova Solutions Contract",
    id: "CTR-2024-0102",
    company: "TechNova Solutions · Arjun Mehta",
    deal: "TechNova – Magazine",
    proposal: "PRP-2024-0056",
    pkg: "Premium Magazine + Podcast",
    value: "$18,000",
    owner: "Michael Chen",
    version: "v1.0",
    start: "May 27, 2024",
    end: "May 26, 2025",
    signature: "Fully Signed",
    status: "Active",
    activity: "Signed · May 27",
  },
  {
    name: "GreenLeaf Energy Contract",
    id: "CTR-2024-0098",
    company: "GreenLeaf Energy · Priya Patel",
    deal: "GreenLeaf – Feature",
    proposal: "PRP-2024-0055",
    pkg: "Executive Feature",
    value: "$12,500",
    owner: "Priya Patel",
    version: "v1.0",
    start: "May 25, 2024",
    end: "May 24, 2025",
    signature: "Signature Pending",
    status: "Sent",
    activity: "Awaiting signature",
  },
  {
    name: "BrightMind AI Contract",
    id: "CTR-2024-0095",
    company: "BrightMind AI · Sarah Johnson",
    deal: "BrightMind – Partnership",
    proposal: "PRP-2024-0054",
    pkg: "Partnership Package",
    value: "$25,000",
    owner: "Sarah Johnson",
    version: "v1.1",
    start: "May 22, 2024",
    end: "May 21, 2025",
    signature: "Partially Signed",
    status: "Partially Signed",
    activity: "1 of 2 signed",
  },
  {
    name: "DataCore Systems Contract",
    id: "CTR-2024-0091",
    company: "DataCore Systems · Kyle Anderson",
    deal: "DataCore – Magazine",
    proposal: "PRP-2024-0053",
    pkg: "Premium Magazine + Digital Boost",
    value: "$15,000",
    owner: "Michael Chen",
    version: "v1.0",
    start: "May 21, 2024",
    end: "May 20, 2025",
    signature: "Fully Signed",
    status: "Active",
    activity: "Activated",
  },
  {
    name: "CloudScale Partnership",
    id: "CTR-2024-0087",
    company: "CloudScale · Vikram Singh",
    deal: "CloudScale – Partnership",
    proposal: "PRP-2024-0052",
    pkg: "Strategic Partnership",
    value: "$50,000",
    owner: "Vikram Singh",
    version: "v1.0",
    start: "May 20, 2024",
    end: "May 19, 2025",
    signature: "Fully Signed",
    status: "Active",
    activity: "Signed",
  },
  {
    name: "NeuroGen Labs Contract",
    id: "CTR-2024-0081",
    company: "NeuroGen Labs · Anita Desai",
    deal: "NeuroGen – Podcast",
    proposal: "PRP-2024-0051",
    pkg: "Podcast Sponsorship",
    value: "$8,500",
    owner: "Emily Davis",
    version: "v1.0",
    start: "May 19, 2024",
    end: "May 18, 2025",
    signature: "Signature Pending",
    status: "Sent",
    activity: "Awaiting signature",
  },
  {
    name: "Summit Advisors Contract",
    id: "CTR-2024-0075",
    company: "Summit Advisors · James Wilson",
    deal: "Summit – Magazine",
    proposal: "PRP-2024-0050",
    pkg: "Executive Feature",
    value: "$11,000",
    owner: "James Wilson",
    version: "v1.0",
    start: "May 18, 2024",
    end: "May 17, 2025",
    signature: "Fully Signed",
    status: "Active",
    activity: "Signed",
  },
  {
    name: "GlobalTech Corp Contract",
    id: "CTR-2024-0072",
    company: "GlobalTech Corp · Robert Williams",
    deal: "GlobalTech – Magazine",
    proposal: "PRP-2024-0049",
    pkg: "Premium Magazine + Podcast",
    value: "$30,000",
    owner: "Michael Chen",
    version: "v1.2",
    start: "May 17, 2024",
    end: "May 16, 2025",
    signature: "Fully Signed",
    status: "Expiring Soon",
    activity: "Renewal in 22 days",
  },
];

function ContractTable() {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Contract</th>
            <th>Company / Contact</th>
            <th>Related Deal</th>
            <th>Proposal</th>
            <th>Package</th>
            <th>Value</th>
            <th>Owner</th>
            <th>Version</th>
            <th>Start</th>
            <th>End</th>
            <th>Signature</th>
            <th>Status</th>
            <th>Activity</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {contractRows.map((r, i) => (
            <tr className={i === 0 ? s.selected : ""} key={r.id}>
              <td>
                <span className={s.mainCell}>
                  <span className={`${s.avatar} ${s.logo}`}>
                    <FileCheck2 size={14} />
                  </span>
                  <span>
                    <b>{r.name}</b>
                    <small>{r.id}</small>
                  </span>
                </span>
              </td>
              <td>{r.company}</td>
              <td>{r.deal}</td>
              <td>{r.proposal}</td>
              <td>{r.pkg}</td>
              <td>
                <b>{r.value}</b>
                <small>USD</small>
              </td>
              <td>
                <Person name={r.owner} index={i} />
              </td>
              <td>{r.version}</td>
              <td>{r.start}</td>
              <td>{r.end}</td>
              <td>
                <Pill value={r.signature} />
              </td>
              <td>
                <Pill value={r.status} />
              </td>
              <td>{r.activity}</td>
              <td>
                <MoreHorizontal size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total="242" />
    </div>
  );
}

export function ContractLibraryScreen() {
  const metrics = makeMetrics([
    ["Total Contracts", "242", "View all", FileCheck2],
    ["Active Value", "$2,485,000", "Across 126 contracts", CircleDollarSign],
    ["Pending Signature", "$684,200", "22 contracts", Pencil],
    ["Signed This Month", "18", "$421,000", BadgeCheck],
    ["Expiring Soon", "16", "Next 30 days", Clock3],
    ["Expired", "7", "$128,000", AlertTriangle],
    ["Avg. Signing Time", "12.4 days", "↓ 1.2 days", TrendingUp],
    ["Renewal Value", "$731,500", "31 renewals", RefreshCcw],
  ]);
  return (
    <div className={s.page}>
      <Header
        trail="Deals / Contracts"
        title="Contract Library"
        subtitle="Manage, track and secure all client contracts in one place."
      >
        <Button primary>
          <Plus size={14} /> Create Contract
        </Button>
        <Button>
          <Sparkles size={14} /> Quick Actions
        </Button>
      </Header>
      <Metrics items={metrics} />
      <Tabs
        items={[
          "All · 242",
          "Draft · 24",
          "Internal Review · 18",
          "Approval Required · 12",
          "Ready to Send · 16",
          "Sent · 28",
          "Viewed · 20",
          "Signature Pending · 22",
          "Partially Signed · 14",
          "Fully Signed · 14",
          "Active · 126",
          "Expiring Soon · 16",
          "Expired · 7",
          "Cancelled · 4",
          "Archived · 9",
        ]}
      />
      <div className={s.layoutWide}>
        <main>
          <Filters
            search="Search contracts by name, company, deal, or contact..."
            items={[
              "All Owners",
              "All Companies",
              "All Contract Types",
              "All Status",
              "Signature Status",
              "Value: All",
              "Start Date",
              "Expiry Date",
            ]}
          />
          <ContractTable />
        </main>
        <aside className={`${s.rail} ${s.rightSummary}`}>
          <Card title="TechNova Solutions Contract" action="1 of 242">
            <Pill value="Active" />
            <p>Contract ID: CTR-2024-0102 · Version v1.0</p>
            <div className={s.inline}>
              <Button primary href="/app/commercial/contracts/ctr-2024-0102">
                Open Contract
              </Button>
              <Button>
                <Download size={13} /> PDF
              </Button>
            </div>
          </Card>
          <Card title="Contract Summary">
            <Details
              items={[
                ["Company", "TechNova Solutions"],
                ["Contact", "Arjun Mehta · CMO"],
                ["Related Deal", "TechNova Solutions – Magazine"],
                ["Contract Value", "$18,000 USD"],
                ["Start Date", "May 27, 2024"],
                ["End Date", "May 26, 2025"],
                ["Payment Terms", "50% upfront, 50% publication"],
                ["Owner", <Person key="o" name="Michael Chen" index={2} />],
              ]}
            />
          </Card>
          <Card title="Signature & Status">
            <StageFlow
              labels={["Draft", "Sent", "Viewed", "Signed"]}
              current={4}
            />
            <Details
              items={[
                ["Signature Status", <Pill key="s" value="Fully Signed" />],
                ["Contract Status", <Pill key="a" value="Active" />],
                ["Signed On", "May 27, 2024"],
                ["Renewal Date", "May 26, 2025"],
              ]}
            />
          </Card>
          <Card title="Value & Commercials">
            <Details
              items={[
                ["Contract Value", "$18,000"],
                ["Discount", "$2,000 (10%)"],
                ["Signed Value", "$16,000"],
                ["Inclusions", "Feature · Podcast · Social · Newsletter"],
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Send to Client",
                "Request Signature",
                "Create Amendment",
                "Duplicate Contract",
                "Renew Contract",
                "Cancel Contract",
                "Add Note",
                "Add Task",
                "View Deal",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

function ContractPaper() {
  return (
    <article className={s.paper}>
      <small>THE PERSPECTIVE MEDIA GROUP</small>
      <h2>MEDIA PARTNERSHIP AGREEMENT</h2>
      <p>
        <b>Contract ID: CTR-2024-0102 · Version 1.0</b>
      </p>
      <p>
        This Media Partnership Agreement is made between{" "}
        <b>The Perspective Media Group</b> (the “Publisher”) and{" "}
        <b>TechNova Solutions</b> (the “Client”).
      </p>
      <h3>1. OBJECTIVE</h3>
      <p>
        The Publisher will feature the Client in a premium digital magazine,
        publish a podcast episode, and promote the content across approved
        digital channels.
      </p>
      <h3>2. SCOPE OF SERVICES</h3>
      <ul>
        <li>Premium magazine feature, 6–8 pages</li>
        <li>Executive interview and editorial development</li>
        <li>Podcast episode collaboration</li>
        <li>Global digital distribution</li>
        <li>Social media and newsletter promotion</li>
      </ul>
      <h3>3. COMMERCIAL TERMS</h3>
      <p>
        Total contract value is $18,000 USD. Payment is due 50% upfront and 50%
        upon publication.
      </p>
      <h3>4. TERM AND EXECUTION</h3>
      <p>
        This agreement becomes effective May 27, 2024 and remains active through
        May 26, 2025.
      </p>
    </article>
  );
}

export function ContractDetailScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Deals / Contracts / TechNova Solutions Contract"
        title="TechNova Solutions Contract"
        subtitle="CTR-2024-0102 · v1.0 · Fully signed and active"
      >
        <Button>
          <Send size={13} /> Send to Client
        </Button>
        <Button>
          <Pencil size={13} /> Request Signature
        </Button>
        <Button>
          <Download size={13} /> Download PDF
        </Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <Summary
        items={[
          ["Company", "TechNova Solutions"],
          ["Primary Contact", <Person key="p" name="Arjun Mehta" role="CMO" />],
          ["Related Deal", "TechNova Solutions – Magazine"],
          ["Related Proposal", "TechNova Magazine Proposal v2.1"],
          ["Package", "Premium Magazine + Podcast"],
          ["Contract Value", "$18,000 USD"],
          ["Payment Terms", "50% upfront, 50% publication"],
        ]}
      />
      <Tabs
        items={[
          "Overview",
          "Contract Document",
          "Commercials",
          "Signatories",
          "Signatures",
          "Amendments",
          "Invoices · 2",
          "Files · 6",
          "Notes · 3",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Contract Details" action="Edit">
              <Details
                items={[
                  ["Contract Type", "Media Partnership Agreement"],
                  ["Contract ID", "CTR-2024-0102"],
                  ["Version", "v1.0 (Current)"],
                  ["Status", <Pill key="a" value="Active" />],
                  ["Execution Status", <Pill key="f" value="Fully Signed" />],
                  ["Effective Date", "May 27, 2024"],
                  ["End Date", "May 26, 2025"],
                  ["Renewal Type", "Automatic (30 days notice)"],
                  ["Governing Law", "California, USA"],
                ]}
              />
            </Card>
            <section className={`${s.card}`} style={{ gridColumn: "span 2" }}>
              <div className={s.cardPad}>
                <div className={s.cardHeader}>
                  <h2>
                    Contract Document <Pill value="Fully Signed" />
                  </h2>
                  <div className={s.inline}>
                    <Button small>
                      <Eye size={12} /> Original
                    </Button>
                    <Button small>
                      <Download size={12} />
                    </Button>
                  </div>
                </div>
              </div>
              <div className={s.docViewer}>
                <div className={s.thumbnails}>
                  {[1, 2, 3, 4].map((x) => (
                    <div className={s.thumb} key={x}>
                      PAGE {x}
                      <br />
                      <br />
                      Agreement preview
                    </div>
                  ))}
                </div>
                <ContractPaper />
              </div>
            </section>
          </div>
          <div className={s.grid3} style={{ marginTop: 10 }}>
            <Card title="Related Items">
              <Details
                items={[
                  ["Deal", "TechNova Solutions – Magazine"],
                  ["Proposal", "TechNova Magazine Proposal v2.1"],
                  ["Company", "TechNova Solutions"],
                  ["Contact", "Arjun Mehta"],
                ]}
              />
            </Card>
            <Card title="Payment Schedule" action="Edit">
              <table className={s.compactTable}>
                <tbody>
                  <tr>
                    <td>Upfront (50%)</td>
                    <td>$9,000</td>
                    <td>
                      <Pill value="Paid" />
                    </td>
                  </tr>
                  <tr>
                    <td>On Publication</td>
                    <td>$9,000</td>
                    <td>
                      <Pill value="Pending" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </Card>
            <Card title="Important Dates" action="Edit">
              <Details
                items={[
                  ["Start Date", "May 27, 2024"],
                  ["End Date", "May 26, 2025"],
                  ["Renewal Date", "May 26, 2025"],
                  ["Notice Period", "30 days"],
                  ["Next Invoice", "On Publication"],
                ]}
              />
            </Card>
          </div>
          <div className={s.grid2} style={{ marginTop: 10 }}>
            <Card title="Amendments" action="View all">
              <div className={s.empty}>
                <div>
                  <FileText size={28} />
                  <p>No amendments yet.</p>
                  <Button>Create Amendment</Button>
                </div>
              </div>
            </Card>
            <Card title="Contract Timeline" action="View full timeline">
              <Timeline
                items={[
                  [
                    "May 27",
                    "Contract fully signed",
                    "Arjun Mehta + Michael Chen",
                  ],
                  ["May 27", "Client viewed agreement", "10:31 AM"],
                  ["May 27", "Signature request sent", "10:30 AM"],
                  ["May 25", "Finance approval", "Emily Davis"],
                  ["May 24", "Contract created", "Michael Chen"],
                ]}
              />
            </Card>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Signature Progress">
            <StageFlow
              labels={["Sent", "Viewed", "Client", "Publisher"]}
              current={4}
            />
          </Card>
          <Card title="Signatories (2)" action="Edit">
            <List
              items={[
                {
                  title: "Arjun Mehta",
                  note: "CMO, TechNova · eSignature",
                  status: "Signed",
                },
                {
                  title: "Michael Chen",
                  note: "Publishing Manager · eSignature",
                  status: "Signed",
                },
              ]}
            />
          </Card>
          <Card title="Contract Status">
            <Details
              items={[
                ["Lifecycle Stage", "Active"],
                ["Execution Status", "Fully Signed"],
                ["Document Status", "Executed"],
                ["Auto Renewal", "Yes"],
                ["Days Until Renewal", "364 days"],
              ]}
            />
          </Card>
          <Card title="Activity Feed" action="View all">
            <List
              items={[
                {
                  title: "Emily Davis added a note",
                  note: "May 27 · 10:46 AM",
                },
                {
                  title: "Michael Chen uploaded contract",
                  note: "May 24 · 2:30 PM",
                },
                {
                  title: "Arjun Mehta added as signatory",
                  note: "May 24 · 2:28 PM",
                },
              ]}
            />
            <div className={s.inline}>
              <input placeholder="Add a note..." />
              <Button small>Add</Button>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

const invoiceRows: Row[] = [
  {
    id: "INV-2024-0456",
    status: "Sent",
    company: "TechNova Solutions",
    contract: "CTR-2024-0102",
    project: "Premium Magazine · May 2024",
    pkg: "Premium Magazine + Podcast",
    total: "$18,000",
    paid: "$9,000",
    balance: "$9,000",
    issue: "May 27, 2024",
    due: "Jun 10, 2024",
    owner: "Michael Chen",
    payment: "Partially Paid",
    invoice: "Open",
    activity: "Payment received",
  },
  {
    id: "INV-2024-0455",
    status: "Paid",
    company: "GreenLeaf Energy",
    contract: "CTR-2024-0098",
    project: "Executive Feature · May",
    pkg: "Executive Feature",
    total: "$12,500",
    paid: "$12,500",
    balance: "$0",
    issue: "May 25, 2024",
    due: "May 25, 2024",
    owner: "Priya Patel",
    payment: "Paid",
    invoice: "Paid",
    activity: "Payment received",
  },
  {
    id: "INV-2024-0454",
    status: "Sent",
    company: "BrightMind AI",
    contract: "CTR-2024-0095",
    project: "Podcast Episode Collaboration",
    pkg: "Podcast Collaboration",
    total: "$6,500",
    paid: "$0",
    balance: "$6,500",
    issue: "May 24, 2024",
    due: "Jun 7, 2024",
    owner: "Emily Davis",
    payment: "Open",
    invoice: "Sent",
    activity: "Invoice sent",
  },
  {
    id: "INV-2024-0453",
    status: "Overdue",
    company: "DataCore Systems",
    contract: "CTR-2024-0091",
    project: "Digital Boost Campaign",
    pkg: "Digital Boost Package",
    total: "$15,000",
    paid: "$5,000",
    balance: "$10,000",
    issue: "May 21, 2024",
    due: "May 13, 2024",
    owner: "Michael Chen",
    payment: "Partially Paid",
    invoice: "Overdue",
    activity: "Reminder sent",
  },
  {
    id: "INV-2024-0452",
    status: "Paid",
    company: "CloudScale Partnership",
    contract: "CTR-2024-0087",
    project: "Strategic Partnership · May",
    pkg: "Strategic Partnership",
    total: "$50,000",
    paid: "$50,000",
    balance: "$0",
    issue: "May 20, 2024",
    due: "May 30, 2024",
    owner: "Vikram Singh",
    payment: "Paid",
    invoice: "Paid",
    activity: "Payment received",
  },
  {
    id: "INV-2024-0451",
    status: "Viewed",
    company: "NeuroGen Labs",
    contract: "CTR-2024-0081",
    project: "Podcast Sponsorship · June",
    pkg: "Podcast Sponsorship",
    total: "$8,500",
    paid: "$0",
    balance: "$8,500",
    issue: "May 19, 2024",
    due: "Jun 18, 2024",
    owner: "Anita Desai",
    payment: "Open",
    invoice: "Viewed",
    activity: "Invoice viewed",
  },
  {
    id: "INV-2024-0450",
    status: "Paid",
    company: "Summit Advisors",
    contract: "CTR-2024-0075",
    project: "Executive Interview Series",
    pkg: "Executive Feature",
    total: "$11,000",
    paid: "$11,000",
    balance: "$0",
    issue: "May 18, 2024",
    due: "May 28, 2024",
    owner: "James Wilson",
    payment: "Paid",
    invoice: "Paid",
    activity: "Payment received",
  },
  {
    id: "INV-2024-0449",
    status: "Overdue",
    company: "GlobalTech Corp",
    contract: "CTR-2024-0072",
    project: "Magazine + Podcast Bundle",
    pkg: "Premium Magazine + Podcast",
    total: "$30,000",
    paid: "$0",
    balance: "$30,000",
    issue: "May 17, 2024",
    due: "May 27, 2024",
    owner: "Michael Chen",
    payment: "Open",
    invoice: "Overdue",
    activity: "Reminder sent",
  },
];
function InvoiceTable() {
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client / Company</th>
            <th>Contract</th>
            <th>Project</th>
            <th>Package</th>
            <th>Total</th>
            <th>Paid</th>
            <th>Balance</th>
            <th>Issue</th>
            <th>Due</th>
            <th>Owner</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Activity</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {invoiceRows.map((r, i) => (
            <tr className={i === 0 ? s.selected : ""} key={r.id}>
              <td>
                <b>{r.id}</b>
                <small>{r.status}</small>
              </td>
              <td>{r.company}</td>
              <td>{r.contract}</td>
              <td>{r.project}</td>
              <td>{r.pkg}</td>
              <td>
                <b>{r.total}</b>
              </td>
              <td className={s.green}>{r.paid}</td>
              <td className={r.balance === "$0" ? s.green : s.red}>
                {r.balance}
              </td>
              <td>{r.issue}</td>
              <td>{r.due}</td>
              <td>
                <Person name={r.owner} index={i} />
              </td>
              <td>
                <Pill value={r.payment} />
              </td>
              <td>
                <Pill value={r.invoice} />
              </td>
              <td>{r.activity}</td>
              <td>
                <MoreHorizontal size={14} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination total="242" />
    </div>
  );
}

export function InvoiceLibraryScreen() {
  const metrics = makeMetrics([
    ["Total Invoiced", "$2,485,790", "Across 242 invoices", ReceiptText],
    ["Collected", "$1,623,450", "65.3% of invoiced", BadgeCheck],
    ["Outstanding", "$862,340", "34.7% of invoiced", WalletCards],
    ["Overdue", "$218,760", "22 invoices", AlertTriangle],
    ["Due This Week", "$95,540", "8 invoices", CalendarDays],
    ["Partially Paid", "$143,230", "16 invoices", CreditCard],
    ["Avg. Collection Time", "28.6 days", "↓ 4.2 days", Clock3],
    ["Collection Rate", "92.1%", "↑ 3.6%", TrendingUp],
  ]);
  return (
    <div className={s.page}>
      <Header
        trail="Finance / Invoices"
        title="Invoice Library"
        subtitle="Create, send and manage all client invoices in one place."
      >
        <Button primary>
          <Plus size={14} /> Create Invoice
        </Button>
        <Button>
          <Sparkles size={14} /> Quick Actions
        </Button>
      </Header>
      <Metrics items={metrics} />
      <Tabs
        items={[
          "All · 242",
          "Draft · 14",
          "Ready to Send · 18",
          "Sent · 46",
          "Viewed · 35",
          "Open · 52",
          "Partially Paid · 16",
          "Paid · 94",
          "Due Soon · 20",
          "Overdue · 22",
          "Refunded · 3",
          "Void · 2",
          "Archived · 9",
        ]}
      />
      <div className={s.layout}>
        <main>
          <Filters
            search="Search invoices by number, company, contract, or contact..."
            items={[
              "All Clients",
              "All Projects",
              "All Contracts",
              "All Owners",
              "Invoice Status",
              "Payment Status",
              "Date Range",
              "Due Date",
              "Amount Range",
            ]}
          />
          <InvoiceTable />
        </main>
        <aside className={`${s.rail} ${s.rightSummary}`}>
          <Card title="Invoice Summary" action="View full details">
            <Details
              items={[
                ["Invoice Number", "INV-2024-0456"],
                ["Status", <Pill key="o" value="Open" />],
                ["Payment Status", <Pill key="p" value="Partially Paid" />],
                ["Client", "TechNova Solutions"],
                ["Contract", "CTR-2024-0102"],
                ["Project", "Premium Magazine – May 2024"],
                ["Issue Date", "May 27, 2024"],
                [
                  "Due Date",
                  <span key="d" className={s.orange}>
                    Jun 10, 2024
                  </span>,
                ],
                ["Total Amount", "$18,000 USD"],
                ["Paid Amount", "$9,000 USD"],
                ["Balance", "$9,000 USD"],
                ["Owner", <Person key="m" name="Michael Chen" index={2} />],
              ]}
            />
          </Card>
          <Card title="Outstanding by Age">
            <div className={s.donutWrap}>
              <div className={s.donut}>
                <span>
                  <b>$862K</b>
                  <small>Outstanding</small>
                </span>
              </div>
              <Details
                items={[
                  ["0–30 days", "$452,760"],
                  ["31–60 days", "$218,760"],
                  ["61–90 days", "$108,660"],
                  ["90+ days", "$82,160"],
                ]}
              />
            </div>
          </Card>
          <Card title="Recent Activity" action="View all">
            <List
              items={[
                {
                  title: "Payment received",
                  note: "$9,000 · TechNova · May 26",
                },
                { title: "Invoice sent", note: "TechNova · May 26" },
                { title: "Invoice viewed", note: "May 25 · 3:20 PM" },
                { title: "Reminder sent", note: "May 20 · 9:15 AM" },
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Send Invoice",
                "Record Payment",
                "Send Reminder",
                "Download PDF",
                "Duplicate Invoice",
                "Void Invoice",
                "Refund",
                "Open Contract",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function InvoiceDetailScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Finance / Invoices / INV-2024-0456"
        title="TechNova Solutions Invoice INV-2024-0456"
        subtitle="Payment tracking and invoice details for TechNova Solutions."
      >
        <Button primary>
          <CreditCard size={13} /> Record Payment
        </Button>
        <Button>
          <Bell size={13} /> Send Reminder
        </Button>
        <Button>
          <Download size={13} /> Download PDF
        </Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <Metrics
        items={makeMetrics([
          ["Invoice Total", "$18,000", "", CircleDollarSign],
          ["Amount Paid", "$9,000", "50% of total", BadgeCheck],
          ["Outstanding", "$9,000", "", AlertTriangle],
          ["Due Date", "May 27, 2024", "In 6 days", CalendarDays],
          ["Collection Status", "Partially Paid", "", WalletCards],
          ["Next Action", "Send Reminder", "", Mail],
        ])}
      />
      <div className={s.invoiceFlow}>
        {[
          "Draft",
          "Ready to Send",
          "Sent",
          "Viewed",
          "Open",
          "Partially Paid",
          "Paid",
        ].map((x) => (
          <span className={x === "Partially Paid" ? s.current : ""} key={x}>
            {x}
          </span>
        ))}
      </div>
      <Tabs
        items={[
          "Overview",
          "Line Items",
          "Payment Schedule",
          "Transactions",
          "Receipts",
          "Reminders",
          "Files",
          "Notes",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Invoice Details" action="Edit">
              <Details
                items={[
                  ["Invoice Number", "INV-2024-0456"],
                  ["Version", "v1.0"],
                  ["Client", "TechNova Solutions"],
                  ["Contract", "CTR-2024-0102"],
                  ["Project", "TechNova Magazine Proposal"],
                  ["Package", "Premium Magazine + Podcast"],
                  ["Owner", "Michael Chen"],
                  ["Issue Date", "May 27, 2024"],
                  ["Due Date", "May 27, 2024"],
                  ["Currency", "USD"],
                  ["Payment Terms", "Net 30 Days"],
                ]}
              />
            </Card>
            <Card title="Payment Tracking">
              <div className={s.donutWrap}>
                <div className={s.donut}>
                  <span>
                    <b>50%</b>
                    <small>Collected</small>
                  </span>
                </div>
                <Details
                  items={[
                    ["Paid", "$9,000 (50%)"],
                    [
                      "Outstanding",
                      <span key="r" className={s.red}>
                        $9,000 (50%)
                      </span>,
                    ],
                    ["Payment Received", "May 28, 2024"],
                    [
                      "Collection Status",
                      <Pill key="p" value="Partially Paid" />,
                    ],
                  ]}
                />
              </div>
              <div className={s.progress}>
                <i style={{ width: "50%" }} />
              </div>
              <List
                items={[
                  {
                    title: "Initial Payment",
                    note: "$9,000 · Paid",
                    status: "Paid",
                  },
                  {
                    title: "Final Payment",
                    note: "$9,000 · Jun 27",
                    status: "Pending",
                  },
                ]}
              />
            </Card>
            <Card title="Invoice Summary" action="View all">
              <Details
                items={[
                  ["Subtotal", "$18,000"],
                  ["Discount", "$0"],
                  ["Tax", "$0"],
                  ["Total", "$18,000"],
                  ["Amount Paid", "$9,000"],
                  [
                    "Balance Due",
                    <span key="r" className={s.red}>
                      $9,000
                    </span>,
                  ],
                ]}
              />
            </Card>
          </div>
          <Card title="Invoice Line Items">
            <table className={s.compactTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Discount</th>
                  <th>Tax</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {[
                  [
                    "Premium Magazine Publishing",
                    "Full brand magazine creation & publishing",
                    "$12,000",
                  ],
                  [
                    "Podcast Production",
                    "Executive interview & editing",
                    "$4,000",
                  ],
                  [
                    "Digital Distribution",
                    "Multi-platform promotion",
                    "$2,000",
                  ],
                ].map((r, i) => (
                  <tr key={r[0]}>
                    <td>{i + 1}</td>
                    <td>
                      <b>{r[0]}</b>
                      <small>{r[1]}</small>
                    </td>
                    <td>1</td>
                    <td>{r[2]}</td>
                    <td>$0</td>
                    <td>$0</td>
                    <td>
                      <b>{r[2]}</b>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
          <div className={s.grid3} style={{ marginTop: 10 }}>
            <Card title="Transaction History" action="View all">
              <List
                items={[
                  {
                    title: "Payment Received",
                    note: "$9,000 · May 28",
                    status: "Completed",
                  },
                  {
                    title: "Invoice Sent",
                    note: "$18,000 · May 27",
                    status: "Completed",
                  },
                  {
                    title: "Reminder Sent",
                    note: "May 30 · 10:12 AM",
                    status: "Pending",
                  },
                ]}
              />
            </Card>
            <Card title="Activity Timeline" action="View all">
              <Timeline
                items={[
                  ["May 28", "Payment received", "$9,000"],
                  ["May 27", "Invoice sent", "TechNova Solutions"],
                  ["May 27", "Invoice created", "Michael Chen"],
                ]}
              />
            </Card>
            <Card title="Client Communication" action="View all">
              <List
                items={[
                  {
                    title: "Arjun Mehta",
                    note: "Thanks for the quick response.",
                  },
                  {
                    title: "Michael Chen",
                    note: "Invoice sent. Please pay by May 27.",
                  },
                ]}
              />
            </Card>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Client Information" action="View Profile">
            <h3>TechNova Solutions</h3>
            <Person name="Arjun Mehta" role="Chief Marketing Officer" />
            <Details
              items={[
                ["Email", "arjun.mehta@technova.com"],
                ["Phone", "+1 (415) 872-9047"],
                ["Relationship", <Pill key="p" value="Premium Client" />],
              ]}
            />
          </Card>
          <Card title="Invoice Notes" action="View all">
            <div className={s.note}>
              <Person name="Michael Chen" index={2} />
              <p>
                Client requested final payment by June 27. Keep reminder active.
              </p>
            </div>
          </Card>
          <Card title="Related Files" action="View all">
            <List
              items={[
                { title: "Invoice_INV-2024-0456.pdf", note: "2.4 MB · May 27" },
                { title: "Payment_Terms.pdf", note: "1.1 MB · May 27" },
                {
                  title: "Contract_CTR-2024-0102.pdf",
                  note: "3.6 MB · May 26",
                },
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <div className={s.rail}>
              {[
                "Send Invoice",
                "Record Payment",
                "Send Reminder",
                "Add Payment",
                "Download PDF",
                "Generate Receipt",
              ].map((x) => (
                <Button key={x}>{x}</Button>
              ))}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

const transactionRows: Row[] = [
  {
    id: "PAY-2024-10345",
    client: "TechNova Solutions",
    invoice: "INV-2024-0456",
    context: "CTR-2024-0102 · Premium Magazine",
    type: "Payment",
    amount: "$9,000",
    method: "VISA ···· 4242",
    processor: "Stripe · pi_3M9...8d2",
    date: "May 26 · 10:45 AM",
    status: "Unreconciled",
  },
  {
    id: "PAY-2024-10344",
    client: "GreenLeaf Energy",
    invoice: "INV-2024-0455",
    context: "CTR-2024-0098 · Executive Feature",
    type: "Payment",
    amount: "$12,500",
    method: "ACH ···· 7890",
    processor: "Wise · tr_1K2...7a1",
    date: "May 25 · 2:15 PM",
    status: "Reconciled",
  },
  {
    id: "REF-2024-0021",
    client: "DataCore Systems",
    invoice: "INV-2024-0435",
    context: "CTR-2024-0091 · Digital Boost",
    type: "Refund",
    amount: "–$5,000",
    method: "ACH ···· 0004",
    processor: "Stripe · re_1L3...9f2",
    date: "May 25 · 11:30 AM",
    status: "Reconciled",
  },
  {
    id: "PAY-2024-10343",
    client: "BrightMind AI",
    invoice: "INV-2024-0454",
    context: "CTR-2024-0095 · Podcast",
    type: "Payment",
    amount: "$3,250",
    method: "Mastercard ···· 8881",
    processor: "Stripe · pi_3M8...2b7",
    date: "May 24 · 10:14 AM",
    status: "Unreconciled",
  },
  {
    id: "PAY-2024-10342",
    client: "CloudScale Partnership",
    invoice: "INV-2024-0452",
    context: "CTR-2024-0087 · Partnership",
    type: "Payment",
    amount: "$50,000",
    method: "Wire",
    processor: "Bank of America",
    date: "May 23 · 9:22 AM",
    status: "Reconciled",
  },
  {
    id: "CHB-2024-0008",
    client: "GlobalTech Corp",
    invoice: "INV-2024-0449",
    context: "CTR-2024-0072 · Bundle",
    type: "Chargeback",
    amount: "–$4,200",
    method: "VISA ···· 2211",
    processor: "Stripe · cb_1M1...3c9",
    date: "May 22 · 4:05 PM",
    status: "Needs Review",
  },
  {
    id: "MAN-2024-0012",
    client: "Visionary Ventures",
    invoice: "—",
    context: "Manual Entry · Consulting",
    type: "Manual",
    amount: "$2,500",
    method: "Manual",
    processor: "ME-0012",
    date: "May 22 · 2:30 PM",
    status: "Reconciled",
  },
  {
    id: "ADJ-2024-0007",
    client: "NeuroGen Labs",
    invoice: "INV-2024-0447",
    context: "CTR-2024-0081 · Sponsorship",
    type: "Adjustment",
    amount: "$250",
    method: "—",
    processor: "ADJ-0007",
    date: "May 21 · 11:12 AM",
    status: "Reconciled",
  },
];
export function PaymentTransactionsScreen() {
  const metrics = makeMetrics([
    ["Total Transactions", "1,842", "All time", ReceiptText],
    ["Payments Received", "$2,615,780", "1,822 transactions", BadgeCheck],
    ["Refunds Issued", "$165,240", "43 transactions", RefreshCcw],
    ["Unreconciled", "$86,540", "32 transactions", AlertTriangle],
    ["Needs Review", "$24,780", "14 transactions", Eye],
    ["Chargebacks", "$12,760", "8 transactions", XCircle],
    ["Success Rate", "98.7%", "↑ 1.8%", TrendingUp],
    ["Avg. Settlement Time", "2.4 days", "↑ 0.4", Clock3],
  ]);
  return (
    <div className={s.page}>
      <Header
        trail="Finance / Payments / Transactions"
        title="Payment Transactions"
        subtitle="Track, match, reconcile and manage every payment event."
      >
        <Button primary>
          <Plus size={14} /> Record Payment
        </Button>
        <Button>
          <Sparkles size={14} /> Quick Actions
        </Button>
      </Header>
      <Metrics items={metrics} />
      <Tabs
        items={[
          "All Transactions · 1,842",
          "Unreconciled · 32",
          "Reconciled · 1,596",
          "Payments Received · 1,592",
          "Pending · 28",
          "Failed · 16",
          "Refunds · 43",
          "Credits · 21",
          "Chargebacks · 8",
          "Manual Entries · 12",
          "Needs Review · 14",
        ]}
      />
      <div className={s.layoutWide}>
        <main>
          <Filters
            search="Search transaction ID, reference, client, invoice, or contract..."
            items={[
              "All Clients",
              "All Contracts",
              "All Projects",
              "All Methods",
              "All Types",
              "All Status",
              "May 1 – May 31",
            ]}
          />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Client / Company</th>
                  <th>Invoice</th>
                  <th>Contract / Project</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Currency</th>
                  <th>Method</th>
                  <th>Processor / Reference</th>
                  <th>Received</th>
                  <th>Reconciliation</th>
                  <th>Owner</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {transactionRows.map((r, i) => (
                  <tr className={i === 0 ? s.selected : ""} key={r.id}>
                    <td>
                      <b>{r.id}</b>
                    </td>
                    <td>{r.client}</td>
                    <td>{r.invoice}</td>
                    <td>{r.context}</td>
                    <td>
                      <Pill value={r.type} />
                    </td>
                    <td className={r.amount.includes("–") ? s.red : ""}>
                      <b>{r.amount}</b>
                    </td>
                    <td>USD</td>
                    <td>{r.method}</td>
                    <td>{r.processor}</td>
                    <td>{r.date}</td>
                    <td>
                      <Pill value={r.status} />
                    </td>
                    <td>
                      <Person name="Michael Chen" index={i} />
                    </td>
                    <td>
                      <MoreHorizontal size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total="1,842" />
          </div>
        </main>
        <aside className={`${s.rail} ${s.rightSummary}`}>
          <Card title="Transaction Details" action="Unreconciled">
            <h3>PAY-2024-10345</h3>
            <Pill value="Payment Received" />
            <div className={s.inline}>
              <Button primary>Match to Invoice</Button>
              <Button>More Actions</Button>
            </div>
          </Card>
          <Card>
            <div className={s.grid3}>
              <div className={s.miniStat}>
                <small>Amount Received</small>
                <strong className={s.green}>$9,000</strong>
              </div>
              <div className={s.miniStat}>
                <small>Fees</small>
                <strong className={s.red}>–$270</strong>
              </div>
              <div className={s.miniStat}>
                <small>Net</small>
                <strong>$8,730</strong>
              </div>
            </div>
            <Details
              items={[
                ["Client", "TechNova Solutions"],
                ["Invoice", "INV-2024-0456"],
                ["Contract", "CTR-2024-0102"],
                ["Project", "Premium Magazine – May"],
                ["Processor", "Stripe"],
                ["Payment Method", "Visa ···· 4242"],
                ["Received", "May 26, 2024 · 10:45 AM"],
                ["Settlement", "May 27, 2024"],
                ["Transaction Type", "Payment"],
                ["Status", <Pill key="s" value="Succeeded" />],
              ]}
            />
          </Card>
          <Card title="Reconciliation Section" action="Edit">
            <Details
              items={[
                ["Match Status", <Pill key="u" value="Unmatched" />],
                ["Suggested Match", "INV-2024-0456 · $9,000"],
                ["Match Difference", "$0.00"],
                ["Owner", "Michael Chen"],
                ["Last Attempt", "May 26 · 11:02 AM"],
              ]}
            />
          </Card>
          <Card title="Receipt" action="View / Download">
            <div className={s.note}>
              <b>THE PERSPECTIVE · RECEIPT</b>
              <p>Payment from TechNova Solutions</p>
              <Details
                items={[
                  ["Amount", "$9,000"],
                  ["Method", "Visa ···· 4242"],
                  ["Date", "May 26, 2024"],
                ]}
              />
            </div>
          </Card>
          <Card title="Activity Timeline" action="View all">
            <Timeline
              items={[
                ["10:45", "Payment received", "via Stripe"],
                ["10:46", "Payment succeeded", "Processor confirmed"],
                ["11:02", "Marked unreconciled", "Michael Chen"],
                ["11:02", "Match attempted", "INV-2024-0456"],
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

const packages: Row[] = [
  {
    name: "Premium Magazine",
    sku: "PKG-MAG-001",
    category: "Magazine",
    price: "$15,000",
    billing: "One-Time",
    duration: "Per Issue",
    deliverables: "12+ deliverables",
    margin: "68%",
    deals: "24",
    contracts: "36",
    status: "Active",
    owner: "Michael Chen",
    updated: "May 24",
  },
  {
    name: "Executive Spotlight",
    sku: "PKG-MAG-002",
    category: "Personal Magazine",
    price: "$25,000",
    billing: "One-Time",
    duration: "Per Issue",
    deliverables: "14+ deliverables",
    margin: "72%",
    deals: "18",
    contracts: "28",
    status: "Active",
    owner: "Arjun Mehta",
    updated: "May 22",
  },
  {
    name: "Podcast Package",
    sku: "PKG-POD-001",
    category: "Podcast",
    price: "$5,000",
    billing: "One-Time",
    duration: "Per Episode",
    deliverables: "8+ deliverables",
    margin: "60%",
    deals: "31",
    contracts: "57",
    status: "Active",
    owner: "Priya Patel",
    updated: "May 20",
  },
  {
    name: "Video Interview",
    sku: "PKG-VID-001",
    category: "Video",
    price: "$4,000",
    billing: "One-Time",
    duration: "Per Video",
    deliverables: "7+ deliverables",
    margin: "58%",
    deals: "22",
    contracts: "41",
    status: "Active",
    owner: "David Thompson",
    updated: "May 19",
  },
  {
    name: "Leadership Summit",
    sku: "PKG-EVT-001",
    category: "Events",
    price: "$50,000",
    billing: "One-Time",
    duration: "Per Event",
    deliverables: "15+ deliverables",
    margin: "70%",
    deals: "7",
    contracts: "11",
    status: "Active",
    owner: "Emily Davis",
    updated: "May 18",
  },
  {
    name: "Article & Interview",
    sku: "PKG-EDI-001",
    category: "Editorial / Interview",
    price: "$2,500",
    billing: "One-Time",
    duration: "Per Article",
    deliverables: "6+ deliverables",
    margin: "55%",
    deals: "29",
    contracts: "64",
    status: "Active",
    owner: "Michael Chen",
    updated: "May 17",
  },
  {
    name: "PR Distribution",
    sku: "PKG-PR-001",
    category: "PR / Distribution",
    price: "$3,500",
    billing: "One-Time",
    duration: "Per Campaign",
    deliverables: "9+ deliverables",
    margin: "62%",
    deals: "16",
    contracts: "23",
    status: "Active",
    owner: "Sarah Johnson",
    updated: "May 16",
  },
  {
    name: "Authority Blueprint",
    sku: "PKG-AUT-001",
    category: "Branding / Authority",
    price: "$8,000",
    billing: "Monthly",
    duration: "6 Months",
    deliverables: "10+ deliverables",
    margin: "65%",
    deals: "14",
    contracts: "20",
    status: "Active",
    owner: "Arjun Mehta",
    updated: "May 15",
  },
  {
    name: "Social Media Boost",
    sku: "ADD-001",
    category: "Add-on",
    price: "$1,000",
    billing: "One-Time",
    duration: "Per Month",
    deliverables: "3+ deliverables",
    margin: "50%",
    deals: "43",
    contracts: "87",
    status: "Active",
    owner: "Priya Patel",
    updated: "May 14",
  },
  {
    name: "Annual Retainer",
    sku: "RET-001",
    category: "Retainers",
    price: "$10,000",
    billing: "Annual",
    duration: "12 Months",
    deliverables: "11+ deliverables",
    margin: "66%",
    deals: "12",
    contracts: "29",
    status: "Active",
    owner: "Michael Chen",
    updated: "May 12",
  },
];
export function ProductsPackagesScreen() {
  const metrics = makeMetrics([
    ["Total Packages", "86", "All time", Boxes],
    ["Active Packages", "63", "73.5% of total", BadgeCheck],
    ["Draft Packages", "12", "13.9% of total", FileText],
    ["Archived Packages", "11", "12.8% of total", FolderKanban],
    ["Used in Proposals", "148", "This month", Send],
    ["Active Contracts", "212", "Across all packages", FileCheck2],
    ["Revenue Impact", "$8,240,750", "Active contracts", TrendingUp],
  ]);
  return (
    <div className={s.page}>
      <Header
        trail="Products & Packages / Library"
        title="Products & Packages Library"
        subtitle="Manage the catalog and pricing used across proposals, contracts and invoices."
      >
        <Button primary>
          <Plus size={14} /> Create Package
        </Button>
        <Button>
          <Sparkles size={14} /> Quick Actions
        </Button>
      </Header>
      <Metrics items={metrics} />
      <Tabs
        items={[
          "All Packages · 86",
          "Magazine · 18",
          "Personal Magazine · 8",
          "Podcast · 9",
          "Video · 7",
          "Events · 6",
          "Editorial · 7",
          "PR / Distribution · 10",
          "Add-ons · 11",
          "Bundles · 5",
          "Retainers · 4",
          "Custom · 1",
        ]}
      />
      <div className={s.layout}>
        <main>
          <Filters
            search="Search packages by name, category, or keyword..."
            items={[
              "Status: All",
              "Category: All",
              "Billing Type: All",
              "Currency: All",
              "Owner: All",
              "Tax: All",
            ]}
          />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Package / SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Billing Model</th>
                  <th>Duration</th>
                  <th>Deliverables</th>
                  <th>Margin</th>
                  <th>Deals</th>
                  <th>Contracts</th>
                  <th>Status</th>
                  <th>Owner</th>
                  <th>Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {packages.map((r, i) => (
                  <tr className={i === 0 ? s.selected : ""} key={r.sku}>
                    <td>
                      <span className={s.mainCell}>
                        <span className={`${s.avatar} ${s.logo}`}>
                          <PackageCheck size={14} />
                        </span>
                        <span>
                          <b>{r.name}</b>
                          <small>{r.sku}</small>
                        </span>
                      </span>
                    </td>
                    <td>
                      <Pill value={r.category} />
                    </td>
                    <td>
                      <b>{r.price}</b>
                      <small>USD</small>
                    </td>
                    <td>
                      <Pill value={r.billing} />
                    </td>
                    <td>{r.duration}</td>
                    <td>{r.deliverables}</td>
                    <td className={s.green}>
                      <b>{r.margin}</b>
                    </td>
                    <td>{r.deals}</td>
                    <td>{r.contracts}</td>
                    <td>
                      <Pill value={r.status} />
                    </td>
                    <td>
                      <Person name={r.owner} index={i} />
                    </td>
                    <td>{r.updated}</td>
                    <td>
                      <MoreHorizontal size={14} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total="86" />
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Package Performance" action="View report">
            <div className={s.grid2}>
              {[
                ["Revenue", "$1,245,600"],
                ["Packages Sold", "48"],
                ["Avg. Deal Size", "$25,950"],
                ["Win Rate", "38.7%"],
              ].map((x) => (
                <div className={s.miniStat} key={x[0]}>
                  <small>{x[0]}</small>
                  <strong>{x[1]}</strong>
                  <em className={s.green}>↑ 12.8%</em>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Top Performing Packages" action="View all">
            <List
              items={packages.slice(0, 5).map((x, i) => ({
                title: `${i + 1}. ${x.name}`,
                note: `${x.contracts} contracts`,
                status: x.price,
              }))}
            />
          </Card>
          <Card title="Package Status Distribution">
            <div className={s.donutWrap}>
              <div className={s.donut}>
                <span>
                  <b>86</b>
                  <small>Total</small>
                </span>
              </div>
              <Details
                items={[
                  ["Active", "63 (73.3%)"],
                  ["Draft", "12 (13.9%)"],
                  ["Archived", "11 (12.8%)"],
                ]}
              />
            </div>
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Create Package",
                "Create Add-on",
                "Create Bundle",
                "Create Retainer",
                "Import Packages",
                "Manage Categories",
                "Tax Rules",
                "Discount Rules",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function PackageDetailScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Products & Packages / Library / Premium Magazine"
        title="Premium Magazine"
        subtitle="Flagship personal magazine package with full publishing and distribution."
      >
        <Pill value="Active" />
        <Pill value="v3.2 · Current" />
        <Button primary>
          <Pencil size={13} /> Edit Package
        </Button>
        <Button>
          Quick Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <div className={s.layout}>
        <main>
          <Summary
            items={[
              ["SKU", "PKG-MAG-001"],
              ["Category", "Magazine"],
              ["Type", "Personal Magazine"],
              ["Owner", <Person key="o" name="Michael Chen" index={2} />],
              ["Status", <Pill key="s" value="Active" />],
              ["Base Price", "$15,000 USD"],
              ["Billing Model", "One-Time · Per Issue"],
              ["Duration", "Per Issue"],
              ["Currency", "USD"],
              ["Tax Treatment", "Taxable"],
            ]}
          />
          <Tabs
            items={[
              "Overview",
              "Pricing",
              "Deliverables",
              "Add-ons",
              "Commercial Rules",
              "Usage",
              "Performance",
              "Versions",
              "Activity",
            ]}
          />
          <div className={s.grid2}>
            <Card title="Package Summary">
              <p>
                The Premium Magazine package transforms a client’s story into a
                world-class magazine and distributes it across premium channels
                to maximize visibility, credibility and authority.
              </p>
              <div className={s.grid4}>
                {[
                  ["Timeline", "6–8 weeks"],
                  ["Team", "8–12 members"],
                  ["Deliverables", "12+ outputs"],
                  ["Revisions", "2 rounds"],
                ].map((x) => (
                  <div className={s.miniStat} key={x[0]}>
                    <small>{x[0]}</small>
                    <strong>{x[1]}</strong>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Key Value Proposition">
              <List
                items={[
                  {
                    title: "Professionally written cover story",
                    note: "Full editorial feature",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Premium magazine design",
                    note: "World-class production",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Global digital publishing",
                    note: "ISSN and archive",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Multi-channel distribution",
                    note: "Media amplification",
                    icon: CheckCircle2,
                  },
                  {
                    title: "Authority positioning",
                    note: "Credibility and impact",
                    icon: CheckCircle2,
                  },
                ]}
              />
            </Card>
            <Card title="What’s Included (Core Deliverables)">
              <div className={s.grid2}>
                <List
                  items={[
                    {
                      title: "Editorial & Writing",
                      note: "Interview, research and story",
                    },
                    {
                      title: "Design & Production",
                      note: "60–80 pages, custom design",
                    },
                    { title: "Publishing", note: "ISSN, flipbook and archive" },
                  ]}
                />
                <List
                  items={[
                    { title: "Photography", note: "Curated feature imagery" },
                    { title: "Distribution", note: "Premium global platforms" },
                    {
                      title: "Marketing Amplification",
                      note: "Social and newsletter",
                    },
                  ]}
                />
              </div>
            </Card>
            <Card title="Optional Add-ons">
              <table className={s.compactTable}>
                <thead>
                  <tr>
                    <th>Add-on</th>
                    <th>Description</th>
                    <th>Price</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      "Podcast Episode",
                      "Audio podcast across platforms",
                      "$2,000",
                    ],
                    [
                      "Video Interview",
                      "Video production and YouTube",
                      "$2,500",
                    ],
                    ["Extra Pages", "Additional 8-page spread", "$1,500"],
                    [
                      "LinkedIn Amplification",
                      "Sponsored LinkedIn post",
                      "$1,000",
                    ],
                    ["Press Release Distribution", "Media outreach", "$900"],
                  ].map((x) => (
                    <tr key={x[0]}>
                      <td>
                        <b>{x[0]}</b>
                      </td>
                      <td>{x[1]}</td>
                      <td>
                        <b>{x[2]}</b>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
          <div className={s.grid2} style={{ marginTop: 10 }}>
            <Card title="Pricing Overview">
              <div className={s.grid3}>
                <Details
                  items={[
                    ["Base Price", "$15,000 USD"],
                    ["Payment", "50% upfront, 50% publication"],
                    ["Cancellation", "50% refund before work"],
                  ]}
                />
                <List
                  items={[
                    { title: "Included", note: "All core deliverables" },
                    {
                      title: "Standard distribution",
                      note: "2 revision rounds",
                    },
                    { title: "Support", note: "30 days post publication" },
                  ]}
                />
                <List
                  items={[
                    { title: "Not Included", note: "Travel and accommodation" },
                    {
                      title: "Third-party promotions",
                      note: "Available as add-on",
                    },
                    { title: "Extra revisions", note: "Beyond two rounds" },
                  ]}
                />
              </div>
            </Card>
            <Card title="Margin & Cost (Internal)">
              <div className={s.donutWrap}>
                <div className={s.donut}>
                  <span>
                    <b>58.7%</b>
                    <small>Gross Margin</small>
                  </span>
                </div>
                <Details
                  items={[
                    ["Internal Cost", "$6,200"],
                    ["Gross Margin", "58.7%"],
                    ["Target Margin", "55%"],
                  ]}
                />
              </div>
            </Card>
          </div>
          <div className={s.bottomBar}>
            <b>Related Actions</b>
            <div className={s.actions}>
              <Button>Create Proposal</Button>
              <Button>Create Custom Package</Button>
              <Button>View Active Deals</Button>
              <Button>View Contracts</Button>
              <Button>Duplicate Package</Button>
              <Button danger>Archive Package</Button>
            </div>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Package Snapshot" action="Current Version">
            <Details
              items={[
                ["Version", "v3.2 (Current)"],
                ["Created", "Jan 15, 2024"],
                ["Last Updated", "May 18, 2024"],
                ["Effective Date", "May 18, 2024"],
                ["Next Review", "Aug 18, 2024"],
                ["Package Age", "4 months"],
              ]}
            />
            <Button>View Version History</Button>
          </Card>
          <Card title="Commercial Snapshot">
            <div className={s.grid3}>
              {[
                ["Active Deals", "24"],
                ["Contracts", "36"],
                ["Revenue", "$540K"],
                ["Avg. Deal", "$22.5K"],
                ["Conversion", "38.7%"],
                ["Win Rate", "41.3%"],
              ].map((x) => (
                <div className={s.miniStat} key={x[0]}>
                  <small>{x[0]}</small>
                  <strong>{x[1]}</strong>
                </div>
              ))}
            </div>
          </Card>
          <Card title="Used In">
            <Details
              items={[
                ["Proposals", "148"],
                ["Contracts", "112"],
                ["Invoices", "96"],
                ["Projects", "76"],
              ]}
            />
          </Card>
          <Card title="Recent Activity" action="View all">
            <List
              items={[
                { title: "Arjun Mehta", note: "Updated pricing for v3.2" },
                { title: "Sarah Johnson", note: "Added Podcast Episode" },
                { title: "Michael Chen", note: "Created version v3.2" },
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

const handoffStages = [
  "Closed Won",
  "Verify Contract",
  "Verify Payment Terms",
  "Confirm Package/Scope",
  "Assign Account Manager",
  "Create Client & Project",
  "Invite & Onboard",
  "Kickoff Meeting",
  "Delivery Begins",
];
export function ClientHandoffScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Deals / TechNova Solutions – Premium Magazine / Handoff to Client"
        title="Client Conversion / Won Deal Handoff"
        subtitle="Convert the Closed Won deal into an active client, project and delivery workflow."
      >
        <Pill value="Ready to Handoff" />
        <Button primary>
          <Check size={14} /> Complete Handoff
        </Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <StageFlow labels={handoffStages} current={5} />
      <Summary
        items={[
          ["Won Deal", "TechNova Solutions – Premium Magazine"],
          ["Deal Value", "$54,000 USD"],
          ["Package", "Premium Magazine · v3.2 Locked"],
          ["Account Manager", <Person key="a" name="Arjun Mehta" />],
          ["Project Owner", <Person key="p" name="Priya Patel" index={1} />],
          ["Contract Status", <Pill key="c" value="Signed" />],
          ["Payment / Invoice", <Pill key="i" value="Partially Paid" />],
          ["Client Portal Access", <Pill key="n" value="Not Invited" />],
          ["Target Start Date", "May 27, 2024"],
        ]}
      />
      <Tabs
        items={[
          "Overview",
          "Commercial Handoff",
          "Client Setup",
          "Project Setup",
          "Team Assignment",
          "Onboarding",
          "Files",
          "Notes",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Client / Company Information" action="Edit">
              <div className={s.coverCard}>
                <span
                  className={`${s.avatar} ${s.logo}`}
                  style={{ width: 78, height: 78, borderRadius: 8 }}
                >
                  TN
                </span>
                <div>
                  <h3>TechNova Solutions</h3>
                  <p>San Francisco, CA, USA</p>
                  <Person name="Sarah Johnson" role="CEO & Founder" index={1} />
                  <Person name="Arjun Mehta" role="COO" />
                </div>
              </div>
            </Card>
            <Card title="Package & Scope Summary" action="Edit">
              <Details
                items={[
                  ["Package", "Premium Magazine (v3.2)"],
                  [
                    "Scope",
                    "Full magazine publication with feature story, interviews, design, print and digital distribution.",
                  ],
                ]}
              />
              <div className={s.grid4}>
                {[
                  ["12+", "Editorial Pieces"],
                  ["1", "Magazine Issue"],
                  ["Global", "Distribution"],
                  ["Digital", "Flipbook"],
                ].map((x) => (
                  <div className={s.miniStat} key={x[1]}>
                    <strong>{x[0]}</strong>
                    <small>{x[1]}</small>
                  </div>
                ))}
              </div>
            </Card>
            <Card title="Handoff Ownership" action="Edit">
              <List
                items={[
                  {
                    title: "Arjun Mehta",
                    note: "Account Manager · Client Success",
                  },
                  { title: "Priya Patel", note: "Project Owner · Production" },
                  { title: "Daniel Kim", note: "Finance Owner" },
                  { title: "Michael Chen", note: "Sales Owner" },
                ]}
              />
            </Card>
          </div>
          <div className={s.grid2} style={{ marginTop: 10 }}>
            <Card title="Next Actions to Complete Handoff">
              <List
                items={[
                  {
                    title: "Create Client in CRM",
                    note: "Convert company and contacts",
                    status: "Create Client",
                  },
                  {
                    title: "Create Project",
                    note: "Set scope, dates and template",
                    status: "Create Project",
                  },
                  {
                    title: "Generate Onboarding Checklist",
                    note: "Based on locked scope",
                    status: "Generate",
                  },
                  {
                    title: "Invite Client Portal Users",
                    note: "Send invitations",
                    status: "Invite Users",
                  },
                  {
                    title: "Schedule Kickoff Meeting",
                    note: "Book internal + client kickoff",
                    status: "Schedule",
                  },
                  {
                    title: "Transfer Sales Context",
                    note: "Share notes, meetings and files",
                    status: "Transfer",
                  },
                ]}
              />
            </Card>
            <Card title="Handoff Notes">
              <textarea
                className={s.field}
                style={{
                  width: "100%",
                  minHeight: 225,
                  border: "1px solid #dce2eb",
                  padding: 12,
                }}
                placeholder="Add handoff notes, special instructions, and key highlights for the delivery team..."
              />
              <div
                className={s.inline}
                style={{ justifyContent: "flex-end", marginTop: 8 }}
              >
                <Button primary>Save Note</Button>
              </div>
            </Card>
          </div>
          <div className={s.banner}>
            <span>
              <ShieldCheck size={17} /> After handoff, the project will remain
              linked to the original lead, contact, company, outreach, meeting,
              deal, proposal and contract history.
            </span>
            <Link className={s.link} href="#">
              Learn about the handoff process →
            </Link>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Handoff Checklist" action="8 of 9 completed">
            <List
              items={[
                "Contract signed",
                "Commercial terms confirmed",
                "Primary client contact confirmed",
                "Package snapshot locked",
                "Project scope confirmed",
                "Account Manager assigned",
                "Production owner assigned",
                "Client portal access prepared",
              ]
                .map((x) => ({
                  title: x,
                  note: "May 18, 2024",
                  status: "Completed",
                  icon: CheckCircle2,
                }))
                .concat([
                  {
                    title: "Kickoff meeting scheduled",
                    note: "Required before delivery",
                    status: "Pending",
                    icon: CalendarDays,
                  },
                ])}
            />
          </Card>
          <Card title="Important Commitments" action="Edit">
            <List
              items={[
                { title: "Magazine Publication", note: "May 27, 2024" },
                { title: "Cover Design & Photoshoot", note: "Jun 3, 2024" },
                {
                  title: "Interview & Content Finalization",
                  note: "Jun 17, 2024",
                },
                { title: "Magazine Finalization", note: "Jul 8, 2024" },
                { title: "Publication & Distribution", note: "Jul 15, 2024" },
              ]}
            />
          </Card>
          <Card title="Sales Context Summary" action="View all">
            <Details
              items={[
                ["Lead Source", "LinkedIn Outreach"],
                ["First Contact", "Apr 2, 2024"],
                ["Total Meetings", "4"],
                ["Proposals Sent", "2"],
                ["Deal Cycle", "46 days"],
                [
                  "Why They Chose Us",
                  "Editorial quality and global distribution",
                ],
              ]}
            />
          </Card>
          <Card title="Related Files" action="View all">
            <List
              items={[
                { title: "Signed Contract.pdf", note: "1.2 MB" },
                { title: "Proposal.pdf", note: "2.4 MB" },
                { title: "Scope of Work.pdf", note: "1.8 MB" },
                { title: "Invoice.pdf", note: "980 KB" },
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

const onboardingTasks = [
  [
    "Verify contract is signed",
    "Michael Chen",
    "Client",
    "Required",
    "May 18",
    "—",
    "Completed",
    "CTR-2024-0102",
  ],
  [
    "Confirm payment terms",
    "Priya Patel",
    "Internal",
    "Required",
    "May 19",
    "1",
    "Completed",
    "INV-2024-0456",
  ],
  [
    "Confirm package & scope",
    "Daniel Kim",
    "Internal",
    "Required",
    "May 20",
    "1",
    "Completed",
    "Premium Magazine",
  ],
  [
    "Send questionnaire to client",
    "Emily Davis",
    "Client",
    "Required",
    "May 21",
    "3",
    "Completed",
    "Questionnaire",
  ],
  [
    "Receive questionnaire",
    "Sarah Johnson",
    "Client",
    "Required",
    "May 22",
    "4",
    "Completed",
    "Questionnaire",
  ],
  [
    "Request brand assets",
    "Emily Davis",
    "Client",
    "Required",
    "May 23",
    "3",
    "Completed",
    "Assets Folder",
  ],
  [
    "Receive brand assets",
    "Daniel Kim",
    "Internal",
    "Required",
    "May 24",
    "6",
    "In Progress",
    "Assets Folder",
  ],
  [
    "Schedule kickoff meeting",
    "Priya Patel",
    "Client",
    "Required",
    "May 27",
    "7",
    "Completed",
    "Calendar Invite",
  ],
  [
    "Confirm project scope",
    "Michael Chen",
    "Client",
    "Required",
    "May 28",
    "8",
    "Completed",
    "Scope Document",
  ],
  [
    "Set up project & assign team",
    "Daniel Kim",
    "Internal",
    "Required",
    "May 29",
    "9",
    "Pending",
    "Project PRJ-2024-012",
  ],
  [
    "Mark onboarding complete",
    "Michael Chen",
    "Internal",
    "Required",
    "May 31",
    "10",
    "Pending",
    "Onboarding Record",
  ],
];
export function ClientOnboardingChecklistScreen() {
  const stages = [
    "Client Created",
    "Contacts Confirmed",
    "Portal Invited",
    "Questionnaire Sent",
    "Questionnaire Received",
    "Assets Requested",
    "Assets Received",
    "Kickoff Scheduled",
    "Kickoff Completed",
    "Project Ready",
  ];
  return (
    <div className={s.page}>
      <Header
        trail="Clients / TechNova Solutions / Onboarding / Checklist"
        title="Client Onboarding Checklist"
        subtitle="Complete all onboarding gates before project delivery begins."
      >
        <Button primary>
          <CheckCircle2 size={14} /> Complete Onboarding
        </Button>
        <Button>
          <Bell size={13} /> Send Reminder
        </Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <Summary
        items={[
          ["Client", "TechNova Solutions · Active Client"],
          ["Linked Deal", "Premium Magazine · $54,000"],
          ["Linked Contract", "CTR-2024-0102 · Signed"],
          ["Package", "Premium Magazine · One-Time"],
          [
            "Primary Contact",
            <Person
              key="s"
              name="Sarah Johnson"
              role="CEO & Founder"
              index={1}
            />,
          ],
        ]}
      />
      <StageFlow labels={stages} current={8} />
      <Tabs
        items={[
          "Overview",
          "Checklist · 3",
          "Client Actions · 2",
          "Internal Actions · 1",
          "Questionnaire",
          "Assets · 1",
          "Kickoff",
          "Team",
          "Files",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.grid3}>
            <Card title="Onboarding Progress">
              <div className={s.donutWrap}>
                <div className={s.donut}>
                  <span>
                    <b>82%</b>
                    <small>Completed</small>
                  </span>
                </div>
                <Details
                  items={[
                    ["Progress", "9 of 11 tasks"],
                    ["Target", "May 31, 2024"],
                    ["Status", <Pill key="o" value="On Track" />],
                    [
                      "Blockers",
                      <span key="b" className={s.red}>
                        1 item needs attention
                      </span>,
                    ],
                  ]}
                />
              </div>
            </Card>
            <Card title="Required Client Actions">
              <List
                items={[
                  {
                    title: "Sign final agreement",
                    note: "Contract",
                    status: "Completed",
                  },
                  {
                    title: "Provide brand assets",
                    note: "Due May 24",
                    status: "Send Reminder",
                  },
                  {
                    title: "Complete onboarding questionnaire",
                    note: "Due May 25",
                    status: "Send Reminder",
                  },
                ]}
              />
            </Card>
            <Card title="Internal Actions">
              <List
                items={[
                  {
                    title: "Prepare project setup",
                    note: "Due May 24",
                    status: "In Progress",
                  },
                  {
                    title: "Assign production team",
                    note: "Due May 26",
                    status: "Pending",
                  },
                  {
                    title: "Create project workspace",
                    note: "Due May 27",
                    status: "Pending",
                  },
                ]}
              />
            </Card>
          </div>
          <Card title="Onboarding Checklist" action="Filter" className="">
            <div className={s.checklist}>
              {onboardingTasks.map((r, i) => (
                <div className={s.checkRow} key={r[0]}>
                  <span>{i + 1}</span>
                  <b>{r[0]}</b>
                  <Person name={r[1]} index={i} />
                  <span>{r[2]}</span>
                  <Pill value={r[3]} />
                  <span>{r[4]}</span>
                  <span>{r[5]}</span>
                  <Pill value={r[6]} />
                  <span>{r[7]}</span>
                  <Button small>View</Button>
                </div>
              ))}
            </div>
            <div className={s.bottomBar}>
              <b>Quick Actions</b>
              <div className={s.actions}>
                <Button primary>Complete Onboarding</Button>
                <Button>Create Client</Button>
                <Button href="/app/projects/new">Create Project</Button>
                <Button>Assign Team</Button>
                <Button>Generate Onboarding</Button>
                <Button>Invite Client</Button>
                <Button>Schedule Kickoff</Button>
              </div>
            </div>
          </Card>
        </main>
        <aside className={s.rail}>
          <Card title="Onboarding Summary" action="View all">
            <Details
              items={[
                ["Total Tasks", "11"],
                [
                  "Completed",
                  <span key="a" className={s.green}>
                    9 · 82%
                  </span>,
                ],
                ["In Progress", "1 · 9%"],
                ["Pending", "1 · 9%"],
                ["Overdue", "0"],
              ]}
            />
          </Card>
          <Card title="Key Client Information" action="Edit">
            <Details
              items={[
                ["Company", "TechNova Solutions"],
                ["Primary Contact", "Sarah Johnson"],
                ["Email", "sarah.johnson@technova.com"],
                ["Phone", "+1 (415) 555-0198"],
                ["Account Manager", "Priya Patel"],
                ["Project Owner", "Daniel Kim"],
                ["Client Portal", <Pill key="p" value="Access Granted" />],
              ]}
            />
          </Card>
          <Card title="Upcoming Milestones" action="View all">
            <List
              items={[
                { title: "Kickoff Meeting", note: "May 27 · 10:00 AM" },
                { title: "Project Setup Complete", note: "May 30, 2024" },
                { title: "First Draft Delivery", note: "Jun 10, 2024" },
              ]}
            />
          </Card>
          <Card title="Recent Activity" action="View all">
            <List
              items={[
                {
                  title: "Kickoff meeting held",
                  note: "Michael Chen · May 28",
                },
                {
                  title: "Brand Guidelines uploaded",
                  note: "Sarah Johnson · May 24",
                },
                {
                  title: "Onboarding status updated",
                  note: "Priya Patel · May 22",
                },
                {
                  title: "Project scope note added",
                  note: "Daniel Kim · May 21",
                },
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

export function ProjectIntakeScreen() {
  return (
    <div className={s.page}>
      <Header
        trail="Projects / Create Project"
        title="Project Intake / Create New Project"
        subtitle="Configure a delivery project from the approved commercial scope and onboarding data."
      >
        <Button>
          <Save size={13} /> Save Draft
        </Button>
        <Button primary>
          <FolderKanban size={13} /> Create Project
        </Button>
      </Header>
      <div className={s.stepper}>
        {[
          "Select Client & Package",
          "Project Details",
          "Scope & Deliverables",
          "Team & Workflow",
          "Review & Create",
        ].map((x, i) => (
          <div key={x}>
            <i>{i + 1}</i>
            <b>{x}</b>
            <small>
              {i === 0 ? "Choose client and package" : "Configure details"}
            </small>
          </div>
        ))}
      </div>
      <div className={s.layout}>
        <main>
          <Summary
            items={[
              ["Client", "TechNova Solutions"],
              ["Won Deal", "DEAL-2024-0248 · $54,000"],
              ["Contract", "CTR-2024-0102 · Signed"],
              ["Package Snapshot", "Premium Magazine v3.2 · Locked"],
              ["Account Manager", <Person key="a" name="Arjun Mehta" />],
              [
                "Project Owner",
                <Person key="p" name="Priya Patel" index={1} />,
              ],
            ]}
          />
          <div className={s.grid2}>
            <Card title="1. Project Details">
              <div className={s.grid2}>
                {[
                  ["Project Name", "TechNova Solutions – Premium Magazine"],
                  ["Project Type", "Personal Magazine"],
                  ["Project Code", "PRJ-2024-0546"],
                  ["Priority", "High"],
                  ["Status on Create", "Planning"],
                  ["Target Start Date", "Jun 03, 2024"],
                  ["Target Delivery Date", "Aug 30, 2024"],
                  ["Estimated Duration", "89 days"],
                ].map(([a, b]) => (
                  <label className={s.field} key={a}>
                    <span>{a}</span>
                    <input defaultValue={b} />
                  </label>
                ))}
              </div>
              <label className={s.field}>
                <span>Project Description</span>
                <textarea defaultValue="Full personal magazine featuring cover story, interviews, photography, design, publishing and multi-channel distribution." />
              </label>
            </Card>
            <div>
              <Card title="2. Workflow & Template">
                <label className={s.field}>
                  <span>Workflow Template</span>
                  <select defaultValue="Personal Magazine – Full Workflow">
                    <option>Personal Magazine – Full Workflow</option>
                  </select>
                </label>
                <div className={s.banner}>
                  <span>
                    This template includes 12 stages, 48 tasks and 8 approval
                    gates.
                  </span>
                  <Button small>Preview</Button>
                </div>
                <div className={s.grid2}>
                  <label className={s.field}>
                    <span>Client Portal Visibility</span>
                    <select>
                      <option>Visible to Client</option>
                    </select>
                  </label>
                  <label className={s.field}>
                    <span>Portal Project Name</span>
                    <input defaultValue="My Magazine – The Perspective" />
                  </label>
                </div>
              </Card>
              <Card title="3. Team Assignment" className="">
                <div className={s.inline}>
                  {faces.map((x) => (
                    <Image
                      className={s.avatar}
                      src={x}
                      alt="Team member"
                      width={30}
                      height={30}
                      key={x}
                    />
                  ))}
                  <Button small>Manage Team</Button>
                </div>
                <p>
                  Departments: Editorial · Design · Production · Distribution ·
                  Finance
                </p>
              </Card>
            </div>
            <Card title="4. Scope & Deliverables (From Package Snapshot)">
              <div className={s.successBox}>
                <b>Scope imported from Premium Magazine v3.2 (Locked)</b>
              </div>
              <div className={s.grid2}>
                <List
                  items={[
                    "Editorial & Writing",
                    "Cover Story & Feature Articles",
                    "Professional Photography",
                    "Magazine Design & Layout",
                    "Proofreading & Quality Check",
                    "Print-Ready & Digital Format",
                  ].map((x) => ({
                    title: x,
                    note: "Included in package",
                    status: "Included",
                  }))}
                />
                <List
                  items={[
                    "Digital Magazine",
                    "Publishing on Website",
                    "Premium Distribution",
                    "Social Media Promotion",
                    "Press Release Distribution",
                    "Archive & SEO Landing Page",
                  ].map((x) => ({
                    title: x,
                    note: "Included in package",
                    status: "Included",
                  }))}
                />
              </div>
            </Card>
            <Card title="5. Key Milestones">
              <Timeline
                items={[
                  ["Jun 03", "Project Kickoff", "Start"],
                  ["Jun 07", "Questionnaire Received", "Content intake"],
                  ["Jun 20", "Content Draft Submitted", "Review"],
                  ["Jun 28", "Content Approved", "Approval"],
                  ["Jul 12", "Design Draft Submitted", "Design"],
                  ["Jul 22", "Design Approved", "Approval"],
                  ["Aug 20", "Publication Ready", "Final QA"],
                  ["Aug 30", "Final Delivery / Publication", "Complete"],
                ]}
              />
            </Card>
            <Card title="6. Additional Configuration">
              <div className={s.grid4}>
                {[
                  ["Currency", "USD – US Dollar"],
                  ["Budget (Internal)", "$15,000"],
                  ["Billing Model", "One-Time"],
                  ["Payment Terms", "50% upfront, 50% before publication"],
                  ["Required Approvals", "2 Levels"],
                  ["Pending Assets", "8 items"],
                  ["Questionnaire", "Received May 22"],
                  ["Readiness Score", "82%"],
                ].map(([a, b]) => (
                  <label className={s.field} key={a}>
                    <span>{a}</span>
                    <input defaultValue={b} />
                  </label>
                ))}
              </div>
            </Card>
          </div>
        </main>
        <aside className={`${s.rail} ${s.rightSummary}`}>
          <Card title="Project Summary (Preview)" action="Ready to Create">
            <Details
              items={[
                ["Client", "TechNova Solutions"],
                ["Project Name", "TechNova Solutions – Premium Magazine"],
                ["Project Type", "Personal Magazine"],
                ["Package", "Premium Magazine v3.2 (Locked)"],
                ["Deal Value", "$54,000 USD"],
                ["Contract", "CTR-2024-0102 (Signed)"],
                ["Account Manager", "Arjun Mehta"],
                ["Project Owner", "Priya Patel"],
                ["Target Start", "Jun 03, 2024"],
                ["Target Delivery", "Aug 30, 2024"],
                ["Workflow", "Personal Magazine – Full Workflow"],
                ["Team Members", "11"],
                ["Visibility", "Visible to Client"],
                ["Priority", "High"],
              ]}
            />
          </Card>
          <Card title="Project Readiness Checklist" action="8 of 9 completed">
            <List
              items={[
                "Contract Signed",
                "Payment Terms Confirmed",
                "Package Snapshot Locked",
                "Primary Contact Confirmed",
                "Onboarding Completed",
                "Assets Collection In Progress",
                "Scope Confirmed",
                "Team Assigned",
                "Kickoff Scheduled",
              ].map((x, i) => ({
                title: x,
                note: i === 5 ? "In Progress" : "May 18, 2024",
                status: i === 5 ? "In Progress" : "Completed",
              }))}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Open Client",
                "Open Deal",
                "Open Contract",
                "View Onboarding",
                "Preview Workflow",
                "Import Data",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}

const templateRows: Row[] = [
  {
    name: "Personal Magazine – Full Workflow",
    type: "Personal Magazine",
    version: "v3.2",
    stages: "12",
    tasks: "58",
    milestones: "8",
    gates: "5",
    duration: "90 days",
    usage: "68",
    owner: "Priya Patel",
    status: "Active",
    updated: "May 18, 2024",
  },
  {
    name: "Magazine Feature – Standard",
    type: "Magazine Feature",
    version: "v2.1",
    stages: "10",
    tasks: "42",
    milestones: "6",
    gates: "4",
    duration: "60 days",
    usage: "24",
    owner: "Arjun Mehta",
    status: "Active",
    updated: "May 16, 2024",
  },
  {
    name: "Article / Interview – Standard",
    type: "Article / Interview",
    version: "v2.3",
    stages: "9",
    tasks: "36",
    milestones: "5",
    gates: "3",
    duration: "45 days",
    usage: "19",
    owner: "Sarah Johnson",
    status: "Active",
    updated: "May 14, 2024",
  },
  {
    name: "Podcast Production Workflow",
    type: "Podcast",
    version: "v1.4",
    stages: "11",
    tasks: "41",
    milestones: "4",
    gates: "3",
    duration: "30 days",
    usage: "12",
    owner: "Daniel Kim",
    status: "Active",
    updated: "May 12, 2024",
  },
  {
    name: "Video Production Workflow",
    type: "Video",
    version: "v1.6",
    stages: "12",
    tasks: "52",
    milestones: "6",
    gates: "4",
    duration: "45 days",
    usage: "8",
    owner: "Priya Patel",
    status: "Active",
    updated: "May 11, 2024",
  },
  {
    name: "Event Management Workflow",
    type: "Event",
    version: "v1.2",
    stages: "10",
    tasks: "39",
    milestones: "5",
    gates: "3",
    duration: "40 days",
    usage: "6",
    owner: "Arjun Mehta",
    status: "Active",
    updated: "May 10, 2024",
  },
  {
    name: "PR & Distribution Workflow",
    type: "PR / Distribution",
    version: "v1.5",
    stages: "8",
    tasks: "27",
    milestones: "4",
    gates: "2",
    duration: "30 days",
    usage: "7",
    owner: "Michael Chen",
    status: "Active",
    updated: "May 08, 2024",
  },
  {
    name: "Authority Services – Standard",
    type: "Authority Services",
    version: "v1.1",
    stages: "9",
    tasks: "34",
    milestones: "4",
    gates: "3",
    duration: "60 days",
    usage: "14",
    owner: "Sarah Johnson",
    status: "Active",
    updated: "May 07, 2024",
  },
  {
    name: "Retainer / Monthly Support",
    type: "Retainer / Ongoing",
    version: "v1.3",
    stages: "6",
    tasks: "18",
    milestones: "2",
    gates: "1",
    duration: "30 days",
    usage: "6",
    owner: "Daniel Kim",
    status: "Active",
    updated: "May 05, 2024",
  },
  {
    name: "Custom Project – Blank",
    type: "Custom Project",
    version: "v1.0",
    stages: "5",
    tasks: "10",
    milestones: "0",
    gates: "0",
    duration: "—",
    usage: "2",
    owner: "Michael Chen",
    status: "Draft",
    updated: "May 01, 2024",
  },
  {
    name: "Personal Magazine – Compact",
    type: "Personal Magazine",
    version: "v2.0",
    stages: "9",
    tasks: "32",
    milestones: "5",
    gates: "3",
    duration: "60 days",
    usage: "22",
    owner: "Priya Patel",
    status: "Needs Review",
    updated: "Apr 28, 2024",
  },
];
export function WorkflowTemplateLibraryScreen() {
  const metrics = makeMetrics([
    ["Total Templates", "32", "↑ 12%", BookOpen],
    ["Active Templates", "22", "69% of total", BadgeCheck],
    ["Projects Using Templates", "146", "↑ 18%", FolderKanban],
    ["Avg. Stages", "11.2", "Across templates", GitBranch],
    ["Avg. Tasks", "48.6", "Across templates", ListChecks],
    ["Approval Gates", "87", "Across all templates", ShieldCheck],
    ["Last Updated", "Today", "May 18, 2024", CalendarDays],
  ]);
  const families = [
    "Personal Magazine",
    "Magazine Feature",
    "Article / Interview",
    "Podcast",
    "Video",
    "Event",
    "PR / Distribution",
    "Authority Services",
    "Retainer / Ongoing",
    "Custom Project",
  ];
  return (
    <div className={s.page}>
      <Header
        trail="Projects / Templates & Workflows / Library"
        title="Project Template / Workflow Template Library"
        subtitle="Build, manage and apply standardized workflows for every project type."
      >
        <Button primary>
          <Plus size={14} /> Create Template
        </Button>
        <Button>
          <Upload size={13} /> Import Template
        </Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <Tabs
        items={[
          "All Templates · 32",
          "Active · 22",
          "Draft · 4",
          "Needs Review · 3",
          "Archived · 3",
          "Most Used",
          "Recently Updated",
        ]}
      />
      <div className={s.layout}>
        <main>
          <Metrics items={metrics} />
          <Card title="Template Families (Project Types)">
            <div className={s.familyGrid}>
              {families.map((x, i) => (
                <article className={s.family} key={x}>
                  <i>
                    {i % 3 === 0 ? (
                      <BookOpen size={18} />
                    ) : i % 3 === 1 ? (
                      <Pencil size={18} />
                    ) : (
                      <GitBranch size={18} />
                    )}
                  </i>
                  <b>{x}</b>
                  <small>{Math.max(1, 7 - i)} Templates</small>
                  <small>Used in {68 - i * 6} Projects</small>
                  <Link className={s.link} href="#">
                    View Templates →
                  </Link>
                </article>
              ))}
            </div>
          </Card>
          <Filters
            search="Search templates..."
            items={[
              "All Project Types",
              "All Owners",
              "All Statuses",
              "Most Used",
            ]}
          />
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>Template Name</th>
                  <th>Project Type</th>
                  <th>Version</th>
                  <th>Stages</th>
                  <th>Tasks</th>
                  <th>Milestones</th>
                  <th>Approval Gates</th>
                  <th>Duration</th>
                  <th>Usage</th>
                  <th>Owner</th>
                  <th>Status</th>
                  <th>Last Updated</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {templateRows.map((r, i) => (
                  <tr className={i === 0 ? s.selected : ""} key={r.name}>
                    <td>
                      <span className={s.mainCell}>
                        <span className={`${s.avatar} ${s.logo}`}>
                          <GitBranch size={14} />
                        </span>
                        <span>
                          <b>{r.name}</b>
                        </span>
                      </span>
                    </td>
                    <td>{r.type}</td>
                    <td>{r.version}</td>
                    <td>{r.stages}</td>
                    <td>{r.tasks}</td>
                    <td>{r.milestones}</td>
                    <td>{r.gates}</td>
                    <td>
                      <b>{r.duration}</b>
                    </td>
                    <td>{r.usage}</td>
                    <td>
                      <Person name={r.owner} index={i} />
                    </td>
                    <td>
                      <Pill value={r.status} />
                    </td>
                    <td>{r.updated}</td>
                    <td>
                      <div className={s.inline}>
                        <Link
                          className={s.link}
                          href={
                            i === 0
                              ? "/app/workflows/personal-magazine-full-workflow"
                              : "#"
                          }
                        >
                          <Eye size={13} />
                        </Link>
                        <MoreHorizontal size={13} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination total="32" />
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Template Analytics" action="View full report">
            <List
              items={templateRows.slice(0, 5).map((x, i) => ({
                title: `${i + 1}. ${x.name}`,
                note: `Used in ${x.usage} projects`,
                status: x.version,
              }))}
            />
          </Card>
          <Card title="Templates by Status">
            <div className={s.donutWrap}>
              <div className={s.donut}>
                <span>
                  <b>32</b>
                  <small>Total</small>
                </span>
              </div>
              <Details
                items={[
                  ["Active", "22 (69%)"],
                  ["Draft", "4 (12%)"],
                  ["Needs Review", "3 (9%)"],
                  ["Archived", "3 (10%)"],
                ]}
              />
            </div>
          </Card>
          <Card title="Recent Activity" action="View all">
            <List
              items={[
                {
                  title: "Personal Magazine v3.2",
                  note: "Updated by Priya Patel",
                },
                {
                  title: "Custom Project – Blank v1.0",
                  note: "Created by Michael Chen",
                },
                {
                  title: "Article / Interview v2.3",
                  note: "Updated by Sarah Johnson",
                },
                {
                  title: "Video Production v1.6",
                  note: "Updated by Priya Patel",
                },
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Create Template",
                "Duplicate Template",
                "Template Categories",
                "Approval Gate Library",
                "Role Library",
                "Import Template",
              ]}
            />
          </Card>
          <Card title="Need Help?">
            <p>
              Learn how to build effective workflows and reusable project
              templates.
            </p>
            <Button>View Template Guide</Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

const workflowStages = [
  [
    "Project Created",
    "Project setup and initial planning",
    "2 days",
    "3 tasks",
    "Project Setup",
    "0",
    "Internal Only",
  ],
  [
    "Kickoff & Onboarding",
    "Internal kickoff and client alignment",
    "5 days",
    "4 tasks",
    "Kickoff Meeting",
    "1",
    "Client & Internal",
  ],
  [
    "Questionnaire & Discovery",
    "Send and collect client questionnaire",
    "7 days",
    "5 tasks",
    "Questionnaire Received",
    "0",
    "Client & Internal",
  ],
  [
    "Content Collection",
    "Collect content, data and assets",
    "10 days",
    "6 tasks",
    "Content Complete",
    "0",
    "Client & Internal",
  ],
  [
    "Content Review",
    "Internal review and fact check",
    "7 days",
    "5 tasks",
    "Content Approved",
    "1",
    "Internal Only",
  ],
  [
    "Design & Layout",
    "Magazine design and layout",
    "15 days",
    "6 tasks",
    "Design Draft",
    "1",
    "Internal Only",
  ],
  [
    "Client Review & Feedback",
    "Client review and feedback",
    "7 days",
    "4 tasks",
    "Client Feedback",
    "0",
    "Client & Internal",
  ],
  [
    "Design Finalization",
    "Incorporate feedback and finalize",
    "7 days",
    "4 tasks",
    "Design Approved",
    "1",
    "Internal Only",
  ],
  [
    "Publication Ready",
    "Final checks and readiness",
    "3 days",
    "3 tasks",
    "Ready for Publication",
    "0",
    "Internal Only",
  ],
  [
    "Publication",
    "Publish magazine digital and print",
    "2 days",
    "2 tasks",
    "Magazine Published",
    "0",
    "Client & Internal",
  ],
  [
    "Distribution",
    "Distribute across channels",
    "7 days",
    "4 tasks",
    "Distribution Complete",
    "0",
    "Client & Internal",
  ],
  [
    "Project Completed",
    "Project closure and handover",
    "2 days",
    "2 tasks",
    "Project Closed",
    "0",
    "Internal Only",
  ],
];
export function WorkflowTemplateDetailScreen() {
  const [selected, setSelected] = useState(1);
  return (
    <div className={s.page}>
      <Header
        trail="Templates & Workflows / Personal Magazine – Full Workflow v3.2"
        title="Personal Magazine – Full Workflow v3.2"
        subtitle="Standard end-to-end workflow from onboarding to publication and distribution."
      >
        <Pill value="Active" />
        <Pill value="Default" />
        <Button>
          <Eye size={13} /> Preview Workflow
        </Button>
        <Button primary>Publish New Version</Button>
        <Button>
          More Actions <ChevronDown size={12} />
        </Button>
      </Header>
      <Summary
        items={[
          ["Project Type", "Personal Magazine"],
          ["Current Version", "v3.2"],
          ["Status", "Active"],
          ["Default Duration", "90 days"],
          ["Stages", "12"],
          ["Tasks", "58"],
          ["Milestones", "8"],
          ["Approval Gates", "5"],
          ["Usage", "68 projects"],
          ["Template Owner", <Person key="p" name="Priya Patel" index={1} />],
          ["Last Updated", "May 18, 2024"],
        ]}
      />
      <Tabs
        items={[
          "Overview",
          "Stages",
          "Tasks",
          "Milestones",
          "Approvals",
          "Roles",
          "Automations",
          "Client Visibility",
          "Versions",
          "Activity",
        ]}
      />
      <div className={s.layout}>
        <main>
          <div className={s.builder}>
            <Card
              title="Workflow Stages (12)"
              action="Expand All · Collapse All"
            >
              <div className={s.stageList}>
                {workflowStages.map((r, i) => (
                  <button
                    className={`${s.stageRow} ${selected === i ? s.selected : ""}`}
                    type="button"
                    onClick={() => setSelected(i)}
                    key={r[0]}
                  >
                    <span>{i + 1}</span>
                    <span>
                      <b>{r[0]}</b>
                      <small>{r[1]}</small>
                    </span>
                    <span>{r[2]}</span>
                    <span>{r[3]}</span>
                    <span>{r[4]}</span>
                    <span>{r[5]} gate</span>
                    <Pill value={r[6]} />
                    <MoreHorizontal size={13} />
                  </button>
                ))}
              </div>
              <Button>
                <Plus size={13} /> Add Stage
              </Button>
            </Card>
            <Card
              title={`Stage Details · ${selected + 1} of 12`}
              action="Duplicate Stage"
              className={s.stageEditor}
            >
              <h3>{workflowStages[selected][0]}</h3>
              <label className={s.field}>
                <span>Estimated Duration</span>
                <input defaultValue={workflowStages[selected][2]} />
              </label>
              <label className={s.field}>
                <span>Color</span>
                <input defaultValue="#7C3AED" />
              </label>
              <label className={s.field}>
                <span>Description</span>
                <textarea defaultValue={workflowStages[selected][1]} />
              </label>
              <label className={s.field}>
                <span>Entry Criteria</span>
                <textarea defaultValue="Project created\nContract signed" />
              </label>
              <label className={s.field}>
                <span>Exit Criteria</span>
                <textarea defaultValue="Required tasks completed\nMilestone achieved" />
              </label>
              <label className={s.field}>
                <span>Default Owner</span>
                <select>
                  <option>Priya Patel · Operations Manager</option>
                </select>
              </label>
              <div className={s.grid2}>
                <label className={s.field}>
                  <span>Client Visibility</span>
                  <select>
                    <option>{workflowStages[selected][6]}</option>
                  </select>
                </label>
                <label className={s.field}>
                  <span>Stage Type</span>
                  <select>
                    <option>Standard</option>
                  </select>
                </label>
              </div>
              <label className={s.field}>
                <span>SLA</span>
                <input defaultValue="5 days" />
              </label>
              {[
                "Required stage",
                "Allow stage to be skipped",
                "Lock tasks on completion",
                "Auto-advance when all tasks complete",
              ].map((x, i) => (
                <label className={s.check} key={x}>
                  <input type="checkbox" defaultChecked={i !== 1} />
                  {x}
                </label>
              ))}
              <Button danger>Delete Stage</Button>
            </Card>
          </div>
          <Card title="Key Milestones (8)" action="Manage Milestones">
            <div className={s.stageFlow}>
              {[
                "Project Setup",
                "Kickoff Meeting",
                "Questionnaire Received",
                "Content Complete",
                "Content Approved",
                "Design Approved",
                "Magazine Published",
                "Project Closed",
              ].map((x, i) => (
                <div className={`${s.stage} ${i < 1 ? s.done : ""}`} key={x}>
                  <i>{i + 1}</i>
                  <b>{x}</b>
                  <small>Stage {i + 1}</small>
                </div>
              ))}
            </div>
          </Card>
          <div className={s.banner}>
            <b>Version History</b>
            <Pill value="v3.2 · Current" />
            <span>Published by Priya Patel on May 18, 2024 10:30 AM</span>
            <Link className={s.link} href="#">
              Compare Versions →
            </Link>
          </div>
        </main>
        <aside className={s.rail}>
          <Card title="Template Settings" action="Edit">
            <Details
              items={[
                ["Template Name", "Personal Magazine – Full Workflow"],
                ["Template Code", "PMAG-FULL-WF"],
                ["Project Type", "Personal Magazine"],
                ["Default Duration", "90 days"],
                ["Status", "Active"],
                ["Created By", "Priya Patel"],
                ["Created On", "Jan 15, 2024"],
                ["Last Updated", "May 18, 2024"],
                ["Total Projects", "68"],
                ["Last Project Created", "May 17, 2024"],
              ]}
            />
          </Card>
          <Card title="Workflow Summary">
            <div className={s.donutWrap}>
              <div className={s.donut}>
                <span>
                  <b>58</b>
                  <small>Total Tasks</small>
                </span>
              </div>
              <Details
                items={[
                  ["To Do", "14 (24%)"],
                  ["Manual", "28 (48%)"],
                  ["Approval", "8 (14%)"],
                  ["Automation", "8 (14%)"],
                ]}
              />
            </div>
          </Card>
          <Card title="Approvals Overview" action="View all">
            <Details
              items={[
                ["Total Approval Gates", "5"],
                ["Manual Approval", "4"],
                ["Auto Approval", "1"],
                ["Multi-level Approval", "2"],
              ]}
            />
          </Card>
          <Card title="Quick Actions">
            <QuickActions
              items={[
                "Preview Workflow",
                "View Tasks · 58",
                "View Milestones · 8",
                "Approval Gates · 5",
                "Role Assignments",
                "Workflow Report",
                "Duplicate Template",
              ]}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
