"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity, Archive, BarChart3, Bell, BookOpen, BriefcaseBusiness, Building2,
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardCheck,
  Contact, CreditCard, FileCheck2, FileText, Files, FolderKanban, Headphones,
  Home, Inbox, Landmark, LayoutDashboard, Menu, MessageSquare, Mic2, PackageCheck,
  PanelLeftClose, PenLine, Plus, ReceiptText, Rocket, Search, Send, Settings,
  ShieldCheck, Sparkles, Upload, UserRound, Users, Video, WalletCards, X,
} from "lucide-react";
import styles from "./workspace.module.css";

type NavItem = { label: string; href: string; icon: React.ComponentType<{ size?: number }>; badge?: string; children?: NavItem[] };

const teamNavigation: NavItem[] = [
  { label: "Dashboard", href: "/app", icon: LayoutDashboard },
  { label: "Sales & CRM", href: "/app/sales", icon: BriefcaseBusiness, children: [
    { label: "Sales Dashboard", href: "/app/sales", icon: BarChart3 },
    { label: "Lead Finder", href: "/app/sales/lead-finder", icon: Search },
    { label: "Data Extraction", href: "/app/sales/extraction", icon: Files },
    { label: "Enrichment", href: "/app/sales/enrichment", icon: Sparkles },
    { label: "Lead CRM", href: "/app/sales/leads", icon: Users },
  ] },
  { label: "Outreach", href: "/app/outreach", icon: Rocket, children: [
    { label: "Outreach Campaigns", href: "/app/outreach", icon: Send },
    { label: "Sequence Builder", href: "/app/outreach/sequences/personal-magazine-q2", icon: Rocket },
  ] },
  { label: "Inbox", href: "/app/inbox", icon: Inbox, badge: "24" },
  { label: "Meetings & Follow-ups", href: "/app/meetings", icon: CalendarDays },
  { label: "Deals", href: "/app/deals", icon: WalletCards, children: [
    { label: "Deals Pipeline", href: "/app/deals", icon: WalletCards },
    { label: "NextPay Opportunity", href: "/app/deals/nextpay-personal-magazine-q2", icon: BriefcaseBusiness },
  ] },
  { label: "Proposals", href: "/app/proposals/prop-2024-0157", icon: FileText },
  { label: "Contracts", href: "/app/contracts/cont-2024-0087", icon: FileCheck2 },
  { label: "Invoices", href: "/app/invoices/inv-2024-0031", icon: ReceiptText },
  { label: "Clients", href: "/app/clients/nextpay-technologies", icon: Contact, children: [
    { label: "Client 360", href: "/app/clients/nextpay-technologies", icon: Contact },
    { label: "Client Onboarding", href: "/app/clients/nextpay-technologies/onboarding", icon: ClipboardCheck },
  ] },
  { label: "Commercial", href: "/app/commercial", icon: Landmark },
  { label: "Projects", href: "/app/projects/personal-magazine-arjun-mehta-q2", icon: FolderKanban },
  { label: "Editorial", href: "/app/editorial", icon: PenLine, children: [
    { label: "Editorial Dashboard", href: "/app/editorial", icon: BarChart3 },
    { label: "Editorial Workflow", href: "/app/editorial/projects/future-of-leadership", icon: PenLine },
    { label: "Articles", href: "/app/editorial/articles", icon: FileText },
    { label: "Questionnaires", href: "/app/editorial/questionnaires", icon: ClipboardCheck },
    { label: "Drafts", href: "/app/editorial/drafts", icon: Files },
    { label: "Reviews", href: "/app/editorial/reviews", icon: FileCheck2 },
  ] },
  { label: "Magazine", href: "/app/magazine/projects/personal-magazine-arjun-mehta-q2", icon: BookOpen },
  { label: "Podcast", href: "/app/podcasts/episodes/visionary-leader-episode-12", icon: Mic2 },
  { label: "Video", href: "/app/videos/projects/executive-insights-arjun-mehta", icon: Video },
  { label: "Events", href: "/app/events/global-leadership-summit-2024", icon: CalendarDays },
  { label: "Approvals", href: "/app/approvals", icon: ShieldCheck },
  { label: "Assets & Files", href: "/app/files", icon: Files },
  { label: "Publishing", href: "/app/publishing", icon: PackageCheck },
  { label: "Distribution", href: "/app/distribution", icon: Send },
  { label: "Finance", href: "/app/finance", icon: CreditCard },
  { label: "Operations", href: "/app/operations", icon: Activity, children: [
    { label: "Operations Dashboard", href: "/app/operations", icon: BarChart3 },
    { label: "Project Execution", href: "/app/operations/projects", icon: FolderKanban },
    { label: "Workload & Capacity", href: "/app/operations/workload", icon: Users },
    { label: "Risks & Issues", href: "/app/operations/risks", icon: ShieldCheck },
  ] },
  { label: "Reports & Analytics", href: "/app/reports", icon: BarChart3 },
  { label: "Team", href: "/app/team", icon: Users },
  { label: "System & Settings", href: "/app/settings", icon: Settings },
];

const clientNavigation: NavItem[] = [
  { label: "Dashboard", href: "/client", icon: Home },
  { label: "My Projects", href: "/client/projects", icon: Archive },
  { label: "Messages", href: "/client/messages", icon: MessageSquare, badge: "3" },
  { label: "Meetings", href: "/client/meetings", icon: CalendarDays },
  { label: "Tasks / Requests", href: "/client/tasks", icon: ClipboardCheck, badge: "5" },
  { label: "Questionnaires", href: "/client/questionnaires", icon: FileText },
  { label: "Drafts", href: "/client/drafts", icon: Files },
  { label: "Designs", href: "/client/designs", icon: Sparkles },
  { label: "Assets", href: "/client/assets", icon: Upload },
  { label: "Approvals", href: "/client/approvals", icon: ShieldCheck, badge: "2" },
  { label: "Contracts", href: "/client/contracts", icon: FileCheck2 },
  { label: "Invoices", href: "/client/invoices", icon: ReceiptText },
  { label: "Payments", href: "/client/payments", icon: CreditCard },
  { label: "Publishing", href: "/client/publishing", icon: PackageCheck },
  { label: "Distribution", href: "/client/distribution", icon: Send },
  { label: "Reports", href: "/client/reports", icon: BarChart3 },
  { label: "Downloads", href: "/client/downloads", icon: Files },
  { label: "Support", href: "/client/support", icon: CircleHelp },
  { label: "Profile", href: "/client/profile", icon: UserRound },
];

function PerspectiveMark({ portal = false }: { portal?: boolean }) {
  return <Link className={styles.brand} href={portal ? "/client" : "/app"}>
    <span className={styles.brandMonogram}>P</span>
    <span><b>The</b><strong>Perspective</strong><small>{portal ? "Client Portal" : "Team Workspace"}</small></span>
  </Link>;
}

function SidebarNav({ items, onNavigate }: { items: NavItem[]; onNavigate?: () => void }) {
  const pathname = usePathname();
  return <nav className={styles.sideNav} aria-label="Workspace navigation">{items.map((item) => {
    const active = item.href === "/app" || item.href === "/client" ? pathname === item.href : pathname.startsWith(item.href);
    const open = item.children && active;
    const Icon = item.icon;
    return <div key={item.label} className={styles.navGroup}>
      <Link className={`${styles.navLink} ${active ? styles.navActive : ""}`} href={item.href} onClick={onNavigate}>
        <Icon size={18} /><span>{item.label}</span>{item.badge && <em>{item.badge}</em>}{item.children && <ChevronRight className={open ? styles.chevronOpen : ""} size={15} />}
      </Link>
      {open && <div className={styles.subNav}>{item.children?.map((child) => <Link className={pathname === child.href ? styles.subActive : ""} href={child.href} key={child.label} onClick={onNavigate}>{child.label}<ChevronRight size={13} /></Link>)}</div>}
    </div>;
  })}</nav>;
}

function WorkspaceTopbar({ portal, onMenu }: { portal?: boolean; onMenu: () => void }) {
  const pathname = usePathname();
  const context = portal
    ? { name: "Arjun Mehta", role: "Marketing Director", initials: "AM", search: "Search projects, documents, messages..." }
    : pathname.startsWith("/app/finance")
      ? { name: "David Wilson", role: "Finance Manager", initials: "DW", search: "Search invoices, clients, payments, contracts..." }
      : pathname.startsWith("/app/operations")
        ? { name: "Rohit Sharma", role: "Operations Manager", initials: "RS", search: "Search projects, tasks, clients, documents..." }
        : pathname.startsWith("/app/editorial") || pathname.startsWith("/app/magazine") || pathname.startsWith("/app/podcasts") || pathname.startsWith("/app/videos") || pathname.startsWith("/app/events") || pathname.startsWith("/app/approvals") || pathname.startsWith("/app/files")
          ? { name: "Sarah Johnson", role: "Creative Director", initials: "SJ", search: "Search projects, assets, approvals, people..." }
          : pathname.startsWith("/app/sales") || pathname.startsWith("/app/outreach") || pathname.startsWith("/app/inbox") || pathname.startsWith("/app/meetings") || pathname.startsWith("/app/deals") || pathname.startsWith("/app/proposals") || pathname.startsWith("/app/contracts") || pathname.startsWith("/app/invoices")
            ? { name: "John Smith", role: "Sales Manager", initials: "JS", search: "Search leads, contacts, companies, emails..." }
            : { name: "John Admin", role: "Super Admin", initials: "JA", search: "Search anything — projects, clients, people, files..." };
  return <header className={styles.topbar}>
    <button className={styles.mobileMenu} onClick={onMenu} type="button" aria-label="Open navigation"><Menu size={21} /></button>
    <button className={styles.orgSwitcher} type="button"><Building2 size={17} /><span>{portal ? "Acme Corporation" : "The Perspective Global"}</span><ChevronDown size={15} /></button>
    <label className={styles.globalSearch}><Search size={18} /><input aria-label="Search workspace" placeholder={context.search} /><kbd>Ctrl K</kbd></label>
    {!portal && <button className={styles.createButton} type="button"><Plus size={19} />Create<ChevronDown size={14} /></button>}
    <button className={styles.topIcon} type="button" aria-label="Help"><CircleHelp size={20} /></button>
    {portal && <button className={styles.topIcon} type="button" aria-label="Messages"><MessageSquare size={20} /><i>3</i></button>}
    <button className={styles.topIcon} type="button" aria-label="Notifications"><Bell size={20} /><i>{portal ? "7" : "12"}</i></button>
    <button className={styles.profileButton} type="button"><span className={styles.avatar}>{context.initials}</span><span><b>{context.name}</b><small>{context.role}</small></span><ChevronDown size={15} /></button>
  </header>;
}

export function TeamShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  return <div className={`${styles.workspace} ${collapsed ? styles.collapsed : ""}`} data-workspace="team">
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarHead}><PerspectiveMark /><button onClick={() => setMobileOpen(false)} type="button" aria-label="Close navigation"><X size={20} /></button></div>
      <div className={styles.workspaceLabel}><span>TeamWorkspace</span><small>Admin & Employee</small><em>v1.0</em></div>
      <SidebarNav items={teamNavigation} onNavigate={() => setMobileOpen(false)} />
      <div className={styles.recent}><p>Recently viewed <ChevronDown size={13} /></p>{["Acme Corp Project", "Q2 Magazine Issue", "Deal: Acme Retainer", "Invoice INV-2024-1087"].map((x) => <span key={x}><FileText size={13} />{x}</span>)}</div>
      <button className={styles.collapseButton} onClick={() => setCollapsed((v) => !v)} type="button"><PanelLeftClose size={18} /><span>Collapse</span></button>
    </aside>
    {mobileOpen && <button aria-label="Close navigation overlay" className={styles.scrim} onClick={() => setMobileOpen(false)} type="button" />}
    <div className={styles.workspaceBody}><WorkspaceTopbar onMenu={() => setMobileOpen(true)} /><div className={styles.workspaceMain}>{children}</div><WorkspaceFooter /></div>
  </div>;
}

export function ClientShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  return <div className={`${styles.workspace} ${styles.clientWorkspace}`} data-workspace="client">
    <aside className={`${styles.sidebar} ${mobileOpen ? styles.sidebarOpen : ""}`}>
      <div className={styles.sidebarHead}><PerspectiveMark portal /><button onClick={() => setMobileOpen(false)} type="button" aria-label="Close navigation"><X size={20} /></button></div>
      <SidebarNav items={clientNavigation} onNavigate={() => setMobileOpen(false)} />
      <div className={styles.helpCard}><Headphones size={24} /><b>Need help?</b><span>Our team is here to assist you.</span><Link href="/client/support">Contact support</Link></div>
      <button className={styles.collapseButton} type="button"><ChevronLeft size={18} /><span>Collapse menu</span></button>
    </aside>
    {mobileOpen && <button aria-label="Close navigation overlay" className={styles.scrim} onClick={() => setMobileOpen(false)} type="button" />}
    <div className={styles.workspaceBody}><WorkspaceTopbar portal onMenu={() => setMobileOpen(true)} /><div className={styles.workspaceMain}>{children}</div><WorkspaceFooter portal /></div>
  </div>;
}

function WorkspaceFooter({ portal = false }: { portal?: boolean }) {
  return <footer className={styles.workspaceFooter}><span>© 2026 The Perspective Global. All rights reserved.</span><nav><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link><Link href={portal ? "/client/support" : "/help"}>Support</Link></nav></footer>;
}
