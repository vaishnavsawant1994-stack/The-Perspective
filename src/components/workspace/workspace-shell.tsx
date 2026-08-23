"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  Archive,
  BarChart3,
  Bell,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Contact,
  CreditCard,
  FileCheck2,
  FileText,
  Files,
  FolderKanban,
  GitBranch,
  Globe2,
  Home,
  Inbox,
  Landmark,
  LayoutDashboard,
  Mail,
  Menu,
  MessageSquare,
  Mic2,
  Network,
  PackageCheck,
  PanelLeftClose,
  PenLine,
  Plus,
  ReceiptText,
  Rocket,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Upload,
  UserRound,
  Users,
  Video,
  WalletCards,
  X,
} from "lucide-react";
import styles from "./workspace.module.css";
import clientStyles from "./client-shell.module.css";
import portalShellStyles from "./client-shell-overrides.module.css";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: string;
  children?: NavItem[];
};

const teamNavigation: NavItem[] = [
  { label: "My Work", href: "/app/my-work", icon: ClipboardCheck, badge: "32" },
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Global Search", href: "/app/search", icon: Search },
  {
    label: "Notifications",
    href: "/app/notifications",
    icon: Bell,
    badge: "18",
  },
  {
    label: "Sales & CRM",
    href: "/app/sales",
    icon: BriefcaseBusiness,
    children: [
      { label: "Sales Dashboard", href: "/app/sales", icon: BarChart3 },
      { label: "Lead Finder", href: "/app/sales/lead-finder", icon: Search },
      { label: "Lead Sources", href: "/app/sales/data-sources", icon: Globe2 },
      { label: "Extraction Jobs", href: "/app/sales/extractions", icon: Files },
      {
        label: "Extraction Review",
        href: "/app/sales/extractions/ext-2024-0523-019",
        icon: FileCheck2,
      },
      { label: "Enrichment", href: "/app/sales/enrichment", icon: Sparkles },
      { label: "Lead CRM", href: "/app/sales/leads", icon: Users },
      { label: "Company CRM", href: "/app/sales/companies", icon: Building2 },
      { label: "Contact CRM", href: "/app/sales/contacts", icon: Contact },
      { label: "Lead Lists", href: "/app/sales/lists", icon: Files },
    ],
  },
  {
    label: "Outreach",
    href: "/app/outreach",
    icon: Rocket,
    children: [
      { label: "Outreach Campaigns", href: "/app/outreach", icon: Send },
      {
        label: "Campaign 360",
        href: "/app/outreach/campaigns/tech-leaders-q2",
        icon: BarChart3,
      },
      {
        label: "Sequence Builder",
        href: "/app/outreach/sequences/personal-magazine-q2",
        icon: Rocket,
      },
      { label: "Templates", href: "/app/outreach/templates", icon: FileText },
      {
        label: "Sending Accounts",
        href: "/app/outreach/sending-accounts",
        icon: Mail,
      },
      {
        label: "Reply Queue",
        href: "/app/outreach/replies",
        icon: Inbox,
        badge: "36",
      },
      {
        label: "Follow-up Queue",
        href: "/app/outreach/follow-ups",
        icon: CalendarDays,
        badge: "58",
      },
    ],
  },
  { label: "Inbox", href: "/app/inbox", icon: Inbox, badge: "24" },
  {
    label: "Meetings & Follow-ups",
    href: "/app/meetings",
    icon: CalendarDays,
    children: [
      { label: "Meetings", href: "/app/meetings", icon: CalendarDays },
      {
        label: "Meeting Detail",
        href: "/app/communications/meetings/intro-call-arjun-mehta",
        icon: MessageSquare,
      },
      {
        label: "Follow-up Queue",
        href: "/app/outreach/follow-ups",
        icon: ClipboardCheck,
      },
    ],
  },
  {
    label: "Deals",
    href: "/app/deals",
    icon: WalletCards,
    children: [
      { label: "Deals Pipeline", href: "/app/deals", icon: WalletCards },
      {
        label: "TechNova Qualification",
        href: "/app/deals/technova-magazine",
        icon: BriefcaseBusiness,
      },
      {
        label: "Proposal Library",
        href: "/app/deals/proposals",
        icon: FileText,
      },
    ],
  },
  { label: "Proposals", href: "/app/deals/proposals", icon: FileText },
  {
    label: "Contracts",
    href: "/app/commercial/contracts",
    icon: FileCheck2,
  },
  {
    label: "Invoices",
    href: "/app/commercial/invoices",
    icon: ReceiptText,
  },
  {
    label: "Payments",
    href: "/app/commercial/payments",
    icon: CreditCard,
  },
  {
    label: "Products & Packages",
    href: "/app/commercial/packages",
    icon: PackageCheck,
  },
  {
    label: "Clients",
    href: "/app/clients/nextpay-technologies",
    icon: Contact,
    children: [
      {
        label: "Client 360",
        href: "/app/clients/nextpay-technologies",
        icon: Contact,
      },
      {
        label: "Client Onboarding",
        href: "/app/clients/nextpay-technologies/onboarding",
        icon: ClipboardCheck,
      },
    ],
  },
  { label: "Commercial", href: "/app/deals", icon: Landmark },
  {
    label: "Projects",
    href: "/app/projects",
    icon: FolderKanban,
    children: [
      { label: "All Projects", href: "/app/projects", icon: FolderKanban },
      { label: "Create Project", href: "/app/projects/new", icon: Plus },
      { label: "Workflow Templates", href: "/app/workflows", icon: GitBranch },
      {
        label: "Tasks & Milestones",
        href: "/app/projects/technova-premium-magazine/tasks",
        icon: ClipboardCheck,
      },
      {
        label: "Team & Resources",
        href: "/app/projects/technova-premium-magazine/team",
        icon: Users,
      },
      {
        label: "Risks & Blockers",
        href: "/app/projects/technova-premium-magazine/risks",
        icon: ShieldCheck,
      },
      {
        label: "Files & Deliverables",
        href: "/app/projects/technova-premium-magazine/files",
        icon: Files,
      },
      {
        label: "Approval Gates",
        href: "/app/projects/technova-premium-magazine/approvals",
        icon: FileCheck2,
      },
      {
        label: "Client Requests",
        href: "/app/projects/technova-premium-magazine/client-requests",
        icon: Inbox,
      },
      {
        label: "Scope Changes",
        href: "/app/projects/technova-premium-magazine/change-requests",
        icon: GitBranch,
      },
      {
        label: "Timeline / Gantt",
        href: "/app/projects/technova-premium-magazine/timeline",
        icon: CalendarDays,
      },
      {
        label: "Activity / Audit",
        href: "/app/projects/technova-premium-magazine/activity",
        icon: Activity,
      },
      {
        label: "Project Closeout",
        href: "/app/projects/technova-premium-magazine/closeout",
        icon: ClipboardCheck,
      },
      {
        label: "Final Handover",
        href: "/app/projects/technova-premium-magazine/handover",
        icon: PackageCheck,
      },
      {
        label: "Retrospective",
        href: "/app/projects/technova-premium-magazine/retrospective",
        icon: BarChart3,
      },
      {
        label: "Project Archive",
        href: "/app/projects/technova-premium-magazine/archive",
        icon: Archive,
      },
    ],
  },
  {
    label: "Editorial",
    href: "/app/editorial",
    icon: PenLine,
    children: [
      { label: "Editorial Dashboard", href: "/app/editorial", icon: BarChart3 },
      {
        label: "Editorial Workflow",
        href: "/app/editorial/projects/future-of-leadership",
        icon: PenLine,
      },
      {
        label: "Articles",
        href: "/app/editorial/projects/future-of-leadership#articles",
        icon: FileText,
      },
      {
        label: "Questionnaires",
        href: "/app/editorial/projects/future-of-leadership#questionnaires",
        icon: ClipboardCheck,
      },
      {
        label: "Drafts",
        href: "/app/editorial/projects/future-of-leadership#drafts",
        icon: Files,
      },
      {
        label: "Reviews",
        href: "/app/editorial/projects/future-of-leadership#reviews",
        icon: FileCheck2,
      },
    ],
  },
  {
    label: "Magazine",
    href: "/app/magazine/projects/personal-magazine-arjun-mehta-q2",
    icon: BookOpen,
  },
  {
    label: "Podcast",
    href: "/app/podcasts/episodes/visionary-leader-episode-12",
    icon: Mic2,
  },
  {
    label: "Video",
    href: "/app/videos/projects/executive-insights-arjun-mehta",
    icon: Video,
  },
  {
    label: "Events",
    href: "/app/events/global-leadership-summit-2024",
    icon: CalendarDays,
  },
  { label: "Approvals", href: "/app/approvals", icon: ShieldCheck },
  { label: "Assets & Files", href: "/app/files", icon: Files },
  {
    label: "Publishing",
    href: "/app/publishing",
    icon: PackageCheck,
    children: [
      { label: "Publishing Overview", href: "/app/publishing", icon: BarChart3 },
      { label: "Publishing Queue", href: "/app/publishing/queue", icon: Inbox },
      {
        label: "Publication Detail",
        href: "/app/publishing/technova-innovation-may-2024",
        icon: FileCheck2,
      },
      {
        label: "Publishing Calendar",
        href: "/app/publishing/schedule",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Distribution",
    href: "/app/distribution/campaigns",
    icon: Send,
    children: [
      { label: "Campaigns", href: "/app/distribution/campaigns", icon: Send },
      {
        label: "Performance & Verification",
        href: "/app/distribution/performance",
        icon: BarChart3,
      },
    ],
  },
  { label: "Tasks & Work", href: "/app/tasks", icon: ClipboardCheck },
  { label: "Calendar", href: "/app/calendar", icon: CalendarDays },
  { label: "Finance", href: "/app/finance", icon: CreditCard },
  {
    label: "Operations",
    href: "/app/operations",
    icon: Activity,
    children: [
      {
        label: "Operations Dashboard",
        href: "/app/operations",
        icon: BarChart3,
      },
      {
        label: "Project Execution",
        href: "/app/projects/personal-magazine-arjun-mehta-q2",
        icon: FolderKanban,
      },
      { label: "Workload & Capacity", href: "/app/team/performance", icon: Users },
      {
        label: "Risks & Issues",
        href: "/app/operations#risks",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Reports & Analytics",
    href: "/app/reports",
    icon: BarChart3,
    children: [
      { label: "Report Center", href: "/app/reports", icon: FileText },
      { label: "Report Builder", href: "/app/reports/new", icon: FileText },
      { label: "Scheduled Reports", href: "/app/reports/scheduled", icon: CalendarDays },
      { label: "Executive Analytics", href: "/app/analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Team",
    href: "/app/team",
    icon: Users,
    children: [
      { label: "Team Directory", href: "/app/team", icon: Users },
      { label: "Performance & Workload", href: "/app/team/performance", icon: BarChart3 },
    ],
  },
  {
    label: "System & Settings",
    href: "/app/settings",
    icon: Settings,
    children: [
      { label: "Organization Settings", href: "/app/settings", icon: Settings },
      {
        label: "Roles & Permissions",
        href: "/app/settings/roles",
        icon: ShieldCheck,
      },
      { label: "Audit Logs", href: "/app/audit-logs", icon: Activity },
      { label: "Integration Center", href: "/app/integrations", icon: Network },
    ],
  },
];

const clientNavigation: NavItem[] = [
  { label: "Dashboard", href: "/client", icon: Home },
  { label: "My Projects", href: "/client/projects", icon: Archive },
  {
    label: "Messages",
    href: "/client/messages",
    icon: MessageSquare,
    badge: "6",
    children: [
      {
        label: "Editorial Draft Review",
        href: "/client/messages/editorial-draft-review",
        icon: MessageSquare,
      },
    ],
  },
  {
    label: "Approvals",
    href: "/client/approvals",
    icon: ShieldCheck,
    badge: "4",
  },
  { label: "Meetings", href: "/client/meetings", icon: CalendarDays },
  {
    label: "Tasks & Requests",
    href: "/client/tasks",
    icon: ClipboardCheck,
    badge: "3",
  },
  { label: "Questionnaires", href: "/client/questionnaires", icon: FileText },
  { label: "Drafts & Reviews", href: "/client/drafts", icon: FileText },
  { label: "Design Reviews", href: "/client/designs", icon: Sparkles },
  { label: "Files & Assets", href: "/client/assets", icon: Upload },
  {
    label: "Media Projects",
    href: "/client/media",
    icon: Video,
    children: [
      {
        label: "CEO Spotlight: Michael Chen",
        href: "/client/media/ceo-spotlight-michael-chen",
        icon: Video,
      },
    ],
  },
  {
    label: "Contracts",
    href: "/client/contracts",
    icon: FileCheck2,
    children: [
      {
        label: "Media Partnership Agreement",
        href: "/client/contracts/con-2024-0578",
        icon: FileCheck2,
      },
    ],
  },
  {
    label: "Invoices & Payments",
    href: "/client/billing",
    icon: ReceiptText,
    children: [
      {
        label: "Invoice INV-2024-0882",
        href: "/client/billing/inv-2024-0882",
        icon: ReceiptText,
      },
    ],
  },
  {
    label: "Publishing & Live Links",
    href: "/client/publishing",
    icon: PackageCheck,
    children: [
      {
        label: "CEO Spotlight May 2024",
        href: "/client/publishing/ceo-spotlight-may-2024",
        icon: Globe2,
      },
    ],
  },
  { label: "Distribution", href: "/client/distribution", icon: Send },
  { label: "Reports & Downloads", href: "/client/reports", icon: BarChart3 },
  { label: "Renewal / Continuation", href: "/client/renewals", icon: Rocket },
  { label: "Support", href: "/client/support", icon: CircleHelp },
  {
    label: "Profile & Settings",
    href: "/client/settings",
    icon: Settings,
    children: [
      { label: "My Profile", href: "/client/settings", icon: UserRound },
      {
        label: "Organization Settings",
        href: "/client/settings/organization",
        icon: Building2,
      },
      {
        label: "Notification Preferences",
        href: "/client/settings/notifications",
        icon: Bell,
      },
      { label: "Users & Access", href: "/client/settings/users", icon: Users },
      {
        label: "Notifications Center",
        href: "/client/notifications",
        icon: Bell,
      },
      { label: "Activity / History", href: "/client/activity", icon: Activity },
    ],
  },
];

function PerspectiveMark({ portal = false }: { portal?: boolean }) {
  return (
    <Link className={styles.brand} href={portal ? "/client" : "/app"}>
      <span className={styles.brandMonogram}>P</span>
      <span>
        <b>The</b>
        <strong>Perspective</strong>
        <small>{portal ? "Client Portal" : "Team Workspace"}</small>
      </span>
    </Link>
  );
}

function SidebarNav({
  items,
  onNavigate,
}: {
  items: NavItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <nav className={styles.sideNav} aria-label="Workspace navigation">
      {items.map((item) => {
        const childActive =
          item.children?.some(
            (child) =>
              pathname === child.href || pathname.startsWith(`${child.href}/`),
          ) ?? false;
        const active =
          (item.href === "/app" || item.href === "/client"
            ? pathname === item.href
            : pathname.startsWith(item.href)) || childActive;
        const open = item.children && active;
        const Icon = item.icon;
        return (
          <div key={item.label} className={styles.navGroup}>
            <Link
              className={`${styles.navLink} ${active ? styles.navActive : ""}`}
              href={item.href}
              onClick={onNavigate}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && <em>{item.badge}</em>}
              {item.children && (
                <ChevronRight
                  className={open ? styles.chevronOpen : ""}
                  size={15}
                />
              )}
            </Link>
            {open && (
              <div className={styles.subNav}>
                {item.children?.map((child) => (
                  <Link
                    className={pathname === child.href ? styles.subActive : ""}
                    href={child.href}
                    key={child.label}
                    onClick={onNavigate}
                  >
                    {child.label}
                    <ChevronRight size={13} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}

function WorkspaceTopbar({
  portal,
  onMenu,
}: {
  portal?: boolean;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const clientOrganization =
    pathname.startsWith("/client/settings") ||
    pathname.startsWith("/client/activity") ||
    pathname.startsWith("/client/notifications") ||
    pathname.startsWith("/client/reports") ||
    pathname.startsWith("/client/renewals") ||
    pathname.startsWith("/client/support") ||
    pathname.startsWith("/client/media")
      ? "Visionary Leadership Group"
      : "NextPay Technologies Inc.";
  const context = portal
    ? {
        name: clientOrganization,
        role: "Michael Chen",
        initials: clientOrganization.startsWith("Visionary") ? "MC" : "NP",
        search: "Search projects, files, messages, invoices...",
      }
    : pathname.startsWith("/app/finance")
      ? {
          name: "David Wilson",
          role: "Finance Manager",
          initials: "DW",
          search: "Search invoices, clients, payments, contracts...",
        }
      : pathname.startsWith("/app/operations")
        ? {
            name: "Rohit Sharma",
            role: "Operations Manager",
            initials: "RS",
            search: "Search projects, tasks, clients, documents...",
          }
        : pathname.startsWith("/app/editorial") ||
            pathname.startsWith("/app/magazine") ||
            pathname.startsWith("/app/podcasts") ||
            pathname.startsWith("/app/videos") ||
            pathname.startsWith("/app/events") ||
            pathname.startsWith("/app/approvals") ||
            pathname.startsWith("/app/files")
          ? {
              name: "Sarah Johnson",
              role: "Creative Director",
              initials: "SJ",
              search: "Search projects, assets, approvals, people...",
            }
          : pathname.startsWith("/app/sales") ||
              pathname.startsWith("/app/outreach") ||
              pathname.startsWith("/app/inbox") ||
              pathname.startsWith("/app/meetings") ||
              pathname.startsWith("/app/deals") ||
              pathname.startsWith("/app/proposals") ||
              pathname.startsWith("/app/contracts") ||
              pathname.startsWith("/app/invoices")
            ? {
                name: "John Smith",
                role: "Sales Manager",
                initials: "JS",
                search: "Search leads, contacts, companies, emails...",
              }
            : {
                name: "John Admin",
                role: "Super Admin",
                initials: "JA",
                search: "Search anything — projects, clients, people, files...",
              };
  return (
    <header className={styles.topbar}>
      <button
        className={styles.mobileMenu}
        onClick={onMenu}
        type="button"
        aria-label="Open navigation"
      >
        <Menu size={21} />
      </button>
      {!portal && (
        <button className={styles.orgSwitcher} type="button">
          <Building2 size={17} />
          <span>The Perspective Global</span>
          <ChevronDown size={15} />
        </button>
      )}
      <label className={styles.globalSearch}>
        <Search size={18} />
        <input aria-label="Search workspace" placeholder={context.search} />
        <kbd>Ctrl K</kbd>
      </label>
      {!portal && (
        <button className={styles.createButton} type="button">
          <Plus size={19} />
          Create
          <ChevronDown size={14} />
        </button>
      )}
      {portal && (
        <Link
          className={portalShellStyles.portalUtility}
          href="/client/messages"
        >
          <MessageSquare size={18} />
          <span>Messages</span>
          <i>6</i>
        </Link>
      )}
      {portal ? (
        <Link
          className={portalShellStyles.portalUtility}
          href="/client/notifications"
        >
          <Bell size={18} />
          <span>Notifications</span>
          <i>12</i>
        </Link>
      ) : (
        <Link
          className={styles.topIcon}
          href="/app/notifications"
          aria-label="Notifications"
        >
          <Bell size={20} />
          <i>12</i>
        </Link>
      )}
      {portal ? (
        <Link
          className={portalShellStyles.portalUtility}
          href="/client/support"
        >
          <CircleHelp size={18} />
          <span>Help</span>
        </Link>
      ) : (
        <button className={styles.topIcon} type="button" aria-label="Help">
          <CircleHelp size={20} />
        </button>
      )}
      <button className={styles.profileButton} type="button">
        <span className={styles.avatar}>{context.initials}</span>
        <span>
          <b>{context.name}</b>
          <small>{context.role}</small>
        </span>
        <ChevronDown size={15} />
      </button>
    </header>
  );
}

const systemReferenceRoutes = [
  "/app/automations",
  "/app/notifications/alert-rules",
  "/app/settings/roles",
  "/app/settings/organization",
  "/app/settings/developer",
  "/app/system-health",
  "/app/data-transfer",
  "/app/system-states",
  "/app/responsive",
  "/app/design-system",
];

const referenceMainNav: NavItem[] = [
  { label: "My Work", href: "/app/my-work", icon: ClipboardCheck },
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Leads & Outreach", href: "/app/sales/leads", icon: Users },
  { label: "Deals", href: "/app/deals", icon: WalletCards },
  { label: "Proposals", href: "/app/deals/proposals", icon: FileText },
  { label: "Contracts", href: "/app/commercial/contracts", icon: FileCheck2 },
  { label: "Projects", href: "/app/projects", icon: FolderKanban },
  { label: "Tasks", href: "/app/tasks", icon: ClipboardCheck },
  { label: "Editorial", href: "/app/editorial", icon: PenLine },
  { label: "Publishing", href: "/app/publishing", icon: PackageCheck },
  { label: "Distribution", href: "/app/distribution/campaigns", icon: Send },
  { label: "Reports", href: "/app/reports", icon: FileText },
  { label: "Analytics", href: "/app/analytics", icon: BarChart3 },
  { label: "Clients", href: "/app/clients/nextpay-technologies", icon: Contact },
  { label: "Companies", href: "/app/sales/companies", icon: Building2 },
  { label: "Invoices", href: "/app/commercial/invoices", icon: ReceiptText },
  { label: "Team", href: "/app/team", icon: Users },
  { label: "Settings", href: "/app/settings", icon: Settings },
];

const referenceOperationsNav: NavItem[] = [
  { label: "Command Center", href: "/app/operations", icon: Activity },
  { label: "Work Queue", href: "/app/my-work", icon: ClipboardCheck },
  { label: "Approvals", href: "/app/approvals", icon: ShieldCheck },
  { label: "SLA Monitor", href: "/app/operations#sla", icon: Activity },
  { label: "Automation Monitor", href: "/app/automations", icon: GitBranch },
  { label: "Incident Management", href: "/app/system-health", icon: ShieldCheck },
  { label: "Integration Center", href: "/app/integrations", icon: Network },
  { label: "Audit Logs", href: "/app/audit-logs", icon: Activity },
];

function ReferenceNavLinks({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return items.map((item) => {
    const exactSettings = item.href === "/app/settings";
    const active = exactSettings
      ? pathname === item.href
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
    const Icon = item.icon;
    return (
      <Link
        className={`${styles.referenceNavLink} ${active ? styles.referenceNavActive : ""}`}
        href={item.href}
        key={`${item.href}-${item.label}`}
      >
        <Icon size={13} />
        <span>{item.label}</span>
      </Link>
    );
  });
}

function SystemReferenceSidebar({ pathname }: { pathname: string }) {
  return (
    <>
      <Link className={styles.referenceBrand} href="/app">
        <span className={styles.referenceMark}>P</span>
        <span><b>The</b><strong>Perspective</strong><small>Media Group</small></span>
      </Link>
      <nav className={styles.referenceNav} aria-label="Team Workspace navigation">
        <ReferenceNavLinks items={referenceMainNav} pathname={pathname} />
        <p>Operations</p>
        <ReferenceNavLinks items={referenceOperationsNav} pathname={pathname} />
        <p>Administration</p>
        <ReferenceNavLinks
          pathname={pathname}
          items={[
            { label: "Notifications / Alerts", href: "/app/notifications/alert-rules", icon: Bell },
            { label: "Roles & Permissions", href: "/app/settings/roles", icon: ShieldCheck },
            { label: "Organization Admin", href: "/app/settings/organization", icon: Building2 },
            { label: "Developer Access", href: "/app/settings/developer", icon: Network },
            { label: "Import / Export", href: "/app/data-transfer", icon: Files },
            { label: "States & Patterns", href: "/app/system-states", icon: Sparkles },
            { label: "Design System", href: "/app/design-system", icon: Settings },
          ]}
        />
      </nav>
      <div className={styles.referenceProfile}>
        <span>MC</span><b>Michael Chen</b><small>Super Administrator</small>
      </div>
      <div className={styles.referenceCollapse}><PanelLeftClose size={13}/><span>Collapse</span></div>
    </>
  );
}

export function TeamShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const referenceShell =
    systemReferenceRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`)) ||
    pathname === "/app/settings";
  const standaloneReference =
    pathname === "/app/responsive/mobile" ||
    pathname === "/app/responsive/tablet" ||
    pathname === "/app/design-system";
  return (
    <div
      className={`${styles.workspace} ${collapsed ? styles.collapsed : ""} ${referenceShell ? styles.referenceWorkspace : ""} ${standaloneReference ? styles.standaloneReferenceWorkspace : ""}`}
      data-collapsed={collapsed ? "true" : "false"}
      data-workspace="team"
    >
      {!standaloneReference && <aside
        className={`${styles.sidebar} ${referenceShell ? styles.referenceSidebar : ""} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        {referenceShell ? <SystemReferenceSidebar pathname={pathname}/> : <><div className={styles.sidebarHead}>
          <PerspectiveMark />
          <button
            onClick={() => setMobileOpen(false)}
            type="button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <div className={styles.workspaceLabel}>
          <span>TeamWorkspace</span>
          <small>Admin & Employee</small>
          <em>v1.0</em>
        </div>
        <SidebarNav
          items={teamNavigation}
          onNavigate={() => setMobileOpen(false)}
        />
        <div className={styles.recent}>
          <p>
            Recently viewed <ChevronDown size={13} />
          </p>
          {[
            "Acme Corp Project",
            "Q2 Magazine Issue",
            "Deal: Acme Retainer",
            "Invoice INV-2024-1087",
          ].map((x) => (
            <span key={x}>
              <FileText size={13} />
              {x}
            </span>
          ))}
        </div>
        <button
          className={styles.collapseButton}
          onClick={() => setCollapsed((v) => !v)}
          type="button"
        >
          <PanelLeftClose size={18} />
          <span>Collapse</span>
        </button>
        </>}
      </aside>}
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className={styles.scrim}
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}
      <div className={styles.workspaceBody}>
        {!referenceShell && <WorkspaceTopbar onMenu={() => setMobileOpen(true)} />}
        <div className={`${styles.workspaceMain} ${referenceShell ? styles.referenceMain : ""}`}>{children}</div>
        {!referenceShell && <WorkspaceFooter />}
      </div>
    </div>
  );
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const authRoute =
    pathname === "/client/login" ||
    pathname === "/client/recover-access" ||
    pathname.startsWith("/client/activate/");
  const earlyPortal =
    pathname === "/client" ||
    pathname.startsWith("/client/projects") ||
    pathname.startsWith("/client/messages") ||
    pathname.startsWith("/client/meetings") ||
    pathname.startsWith("/client/tasks") ||
    pathname.startsWith("/client/questionnaires") ||
    pathname.startsWith("/client/drafts") ||
    pathname.startsWith("/client/designs");
  const manager = earlyPortal
    ? {
        name: "Arjun Mehta",
        email: "arjun.mehta@theperspective.com",
        photo: "/images/articles/arjun-mehta.png",
      }
    : {
        name: "Sarah Johnson",
        email: "sarah.johnson@theperspective.com",
        photo: "/images/articles/elena-rossi.png",
      };
  if (authRoute) return <>{children}</>;
  return (
    <div
      className={`${styles.workspace} ${styles.clientWorkspace} ${portalShellStyles.clientShell}`}
      data-workspace="client"
    >
      <aside
        className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}
      >
        <div className={styles.sidebarHead}>
          <PerspectiveMark portal />
          <button
            onClick={() => setMobileOpen(false)}
            type="button"
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <SidebarNav
          items={clientNavigation}
          onNavigate={() => setMobileOpen(false)}
        />
        <div className={clientStyles.clientManagerCard}>
          <small>Your Account Manager</small>
          <div>
            <Image
              alt={manager.name}
              height={34}
              src={manager.photo}
              width={34}
            />
            <p>
              <b>{manager.name}</b>
              <span>Account Manager</span>
            </p>
          </div>
          <p>+1 (415) 555-0198</p>
          <p>{manager.email}</p>
          <Link href="/client/messages">
            <MessageSquare size={13} /> Send Message
          </Link>
        </div>
        <div className={clientStyles.clientPromo}>
          <b>Create a magazine</b>
          <span>as distinctive as your leadership.</span>
          <Link href="/personal-magazines/create">
            Explore Services <ArrowRightIcon />
          </Link>
          <div>
            <Image
              alt="The Visionary Leader magazine"
              height={92}
              src="/images/personal-magazines/arjun-mehta-hero-v2.png"
              width={74}
            />
            <Image
              alt="Leadership magazine collection"
              height={82}
              src="/images/personal-magazines/sophia-reynolds-cover-v2.png"
              width={66}
            />
          </div>
        </div>
      </aside>
      {mobileOpen && (
        <button
          aria-label="Close navigation overlay"
          className={styles.scrim}
          onClick={() => setMobileOpen(false)}
          type="button"
        />
      )}
      <div className={styles.workspaceBody}>
        <WorkspaceTopbar portal onMenu={() => setMobileOpen(true)} />
        <div className={styles.workspaceMain}>{children}</div>
        <WorkspaceFooter portal />
      </div>
    </div>
  );
}

function ArrowRightIcon() {
  return <ChevronRight size={13} />;
}

function WorkspaceFooter({ portal = false }: { portal?: boolean }) {
  return (
    <footer className={styles.workspaceFooter}>
      <span>© 2026 The Perspective Global. All rights reserved.</span>
      <nav>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href={portal ? "/client/support" : "/help"}>Support</Link>
      </nav>
    </footer>
  );
}
