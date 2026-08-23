export type AuditedSurface = "team" | "client";

export type AuditedRouteAccess =
  | "protected-team"
  | "protected-client"
  | "public-client-auth";

export type AuditedRouteKind = "shell" | "screen" | "reference";

export interface AuditedRouteDefinition {
  readonly designId: number;
  readonly name: string;
  readonly canonicalPath: string;
  readonly aliasPaths: readonly string[];
  readonly transitionalPaths: readonly string[];
  readonly surface: AuditedSurface;
  readonly access: AuditedRouteAccess;
  readonly kind: AuditedRouteKind;
}

const team = (
  designId: number,
  name: string,
  canonicalPath: string,
  transitionalPaths: readonly string[] = [],
  kind: AuditedRouteKind = "screen",
): AuditedRouteDefinition => ({
  designId,
  name,
  canonicalPath,
  aliasPaths: [],
  transitionalPaths,
  surface: "team",
  access: "protected-team",
  kind,
});

const client = (
  designId: number,
  name: string,
  canonicalPath: string,
  transitionalPaths: readonly string[] = [],
  kind: AuditedRouteKind = "screen",
): AuditedRouteDefinition => ({
  designId,
  name,
  canonicalPath,
  aliasPaths: [],
  transitionalPaths,
  surface: "client",
  access: "protected-client",
  kind,
});

const publicClientAuth = (
  designId: number,
  name: string,
  canonicalPath: string,
): AuditedRouteDefinition => ({
  designId,
  name,
  canonicalPath,
  aliasPaths: [],
  transitionalPaths: [],
  surface: "client",
  access: "public-client-auth",
  kind: "screen",
});

/**
 * Canonical route ownership for the frozen Designs 001-153 audit contract.
 *
 * Concrete prototype fixture URLs are retained as transitional paths where the
 * production route contract requires a dynamic segment. The five P4-R0 route
 * collisions are assigned distinct canonical paths and are intentionally not
 * represented as aliases of one another.
 */
export const auditedRouteRegistry = [
  team(1, "TeamShell", "/app/*", [], "shell"),
  client(2, "ClientShell", "/client/*", [], "shell"),
  team(3, "Executive / Admin Dashboard", "/app"),
  team(4, "Sales Dashboard", "/app/sales"),
  team(5, "Editorial Dashboard", "/app/editorial"),
  team(6, "Operations Dashboard", "/app/operations/dashboard"),
  team(7, "Finance Dashboard", "/app/finance"),
  team(8, "Lead Finder", "/app/sales/lead-finder"),
  team(9, "Data Extraction", "/app/sales/extraction"),
  team(10, "Contact / Data Enrichment", "/app/sales/enrichment"),
  team(11, "Leads / Lead CRM", "/app/sales/leads"),
  team(12, "Outreach Campaigns / Outreach Hub", "/app/outreach"),
  team(13, "Outreach Sequence Builder", "/app/outreach/sequences/[sequenceId]", ["/app/outreach/sequences/personal-magazine-q2"]),
  team(14, "Unified Inbox / Replies", "/app/inbox"),
  team(15, "Meetings & Follow-ups", "/app/meetings"),
  team(16, "Deals Pipeline", "/app/deals"),
  team(17, "Deal Detail / Opportunity Workspace", "/app/deals/[dealId]", ["/app/deals/nextpay-personal-magazine-q2"]),
  team(18, "Proposal Builder / Proposal Detail", "/app/proposals/[proposalId]", ["/app/proposals/prop-2024-0157"]),
  team(19, "Contract Workspace", "/app/contracts/[contractId]", ["/app/contracts/cont-2024-0087"]),
  team(20, "Invoice / Payment Workspace", "/app/invoices/[invoiceId]", ["/app/invoices/inv-2024-0031"]),
  team(21, "Client 360 / Client Detail Workspace", "/app/clients/[clientId]", ["/app/clients/nextpay-technologies"]),
  team(22, "Client Onboarding Workspace", "/app/clients/[clientId]/onboarding", ["/app/clients/nextpay-technologies/onboarding"]),
  team(23, "Project Workspace / Project 360", "/app/projects/[projectId]", ["/app/projects/personal-magazine-arjun-mehta-q2"]),
  team(24, "Editorial Project / Editorial Workflow Workspace", "/app/editorial/projects/[projectId]", ["/app/editorial/projects/future-of-leadership"]),
  team(25, "Personal Magazine Production Workspace", "/app/magazine/projects/[projectId]", ["/app/magazine/projects/personal-magazine-arjun-mehta-q2"]),
  team(26, "Podcast Production Workspace", "/app/podcasts/episodes/[episodeId]", ["/app/podcasts/episodes/visionary-leader-episode-12"]),
  team(27, "Video Production Workspace", "/app/videos/projects/[videoId]", ["/app/videos/projects/executive-insights-arjun-mehta"]),
  team(28, "Event Production / Event Operations Workspace", "/app/events/[eventId]", ["/app/events/global-leadership-summit-2024"]),
  team(29, "Approval Center / Approval Workspace", "/app/approvals"),
  team(30, "Asset & File Library", "/app/files"),
  team(31, "Publishing Hub / Publication Queue", "/app/publishing"),
  team(32, "Distribution Campaign Workspace", "/app/distribution"),
  team(33, "Reporting / Client Reporting Workspace", "/app/reports/client-reporting"),
  team(34, "Tasks & Work Management Workspace", "/app/tasks"),
  team(35, "Calendar / Scheduling Workspace", "/app/calendar"),
  team(36, "Team / Employee Management", "/app/team"),
  team(37, "Roles & Permissions Management", "/app/settings/access-control"),
  team(38, "Analytics Workspace", "/app/analytics/explorer"),
  team(39, "Audit Logs", "/app/admin/audit-logs"),
  team(40, "System / Organization Settings", "/app/settings/system-organization"),
  client(41, "Client Portal Dashboard", "/client"),
  client(42, "My Projects", "/client/projects"),
  client(43, "Client Project Detail", "/client/projects/[projectId]", ["/client/projects/visionary-leader-magazine"]),
  client(44, "Project Timeline / Progress", "/client/projects/[projectId]/timeline", ["/client/projects/visionary-leader-magazine/timeline"]),
  client(45, "Client Messages", "/client/messages"),
  client(46, "Meetings", "/client/meetings"),
  client(47, "Tasks / Requests", "/client/tasks"),
  client(48, "Client Questionnaires", "/client/questionnaires/[questionnaireId]", ["/client/questionnaires/personal-magazine"]),
  client(49, "Client Draft Review", "/client/drafts/[draftId]", ["/client/drafts/visionary-leader"]),
  client(50, "Client Design Review", "/client/designs/[designId]", ["/client/designs/magazine-cover-concepts"]),
  client(51, "Client Files & Assets", "/client/assets"),
  client(52, "Client Approvals", "/client/approvals"),
  client(53, "Client Contracts", "/client/contracts"),
  client(54, "Client Invoices & Payments", "/client/billing"),
  client(55, "Client Publishing & Distribution", "/client/publishing"),
  client(56, "Client Reports & Downloads", "/client/reports"),
  client(57, "Client Renewal / Continuation Workspace", "/client/renewals"),
  client(58, "Client Support / Support Requests", "/client/support"),
  client(59, "Client Profile & Account Settings", "/client/settings"),
  client(60, "Client Organization / Company Settings", "/client/settings/organization"),
  client(61, "Client Notifications / Notification Preferences", "/client/settings/notifications"),
  client(62, "Client Portal Users / Team Access", "/client/settings/users"),
  client(63, "Client Activity / Account History", "/client/activity"),
  client(64, "Client Notifications Center", "/client/notifications"),
  client(65, "Client Media Projects / Media Center", "/client/media"),
  client(66, "Client Media Project Detail", "/client/media/[projectId]"),
  client(67, "Client Questionnaires Library", "/client/questionnaires"),
  client(68, "Client Drafts Library", "/client/drafts"),
  client(69, "Client Designs / Proofs Library", "/client/designs"),
  client(70, "Client Contract Detail & Digital Signing", "/client/contracts/[contractId]"),
  client(71, "Client Invoice / Payment Detail", "/client/billing/[invoiceId]"),
  client(72, "Client Publishing / Live Links Detail", "/client/publishing/[publicationId]"),
  client(73, "Client Distribution Detail", "/client/distribution"),
  client(74, "Client Message Thread Detail", "/client/messages/[threadId]"),
  publicClientAuth(75, "Client Sign In", "/client/login"),
  publicClientAuth(76, "Client Portal Activation / Accept Invite", "/client/activate/[token]"),
  publicClientAuth(77, "Client Access Recovery", "/client/recover-access"),
  team(78, "My Work / Personal Work Queue", "/app/my-work"),
  team(79, "Global Search / Universal Search Workspace", "/app/search"),
  team(80, "Team Notifications Center", "/app/notifications"),
  team(81, "Lead Sources / Source Management", "/app/sales/data-sources"),
  team(82, "Data Extraction Jobs / Extraction Runs", "/app/sales/extractions"),
  team(83, "Extraction Review / Imported Records", "/app/sales/extractions/[extractionRunId]", ["/app/sales/extractions/ext-2024-0523-019"]),
  team(84, "Company CRM / Company Directory", "/app/sales/companies"),
  team(85, "Company Detail / Company 360", "/app/sales/companies/[companyId]", ["/app/sales/companies/technova-solutions"]),
  team(86, "Contact CRM / Contact Directory", "/app/sales/contacts"),
  team(87, "Contact Detail / Contact 360", "/app/sales/contacts/[contactId]", ["/app/sales/contacts/sarah-johnson"]),
  team(88, "Lead Lists / Segmentation Workspace", "/app/sales/lists"),
  team(89, "Lead Detail / Lead 360", "/app/sales/leads/[leadId]", ["/app/sales/leads/sarah-johnson"]),
  team(90, "Outreach Campaign Detail / Campaign 360", "/app/outreach/campaigns/[campaignId]", ["/app/outreach/campaigns/tech-leaders-q2"]),
  team(91, "Outreach Templates Library", "/app/outreach/templates"),
  team(92, "Sending Accounts / Email Connections", "/app/outreach/sending-accounts"),
  team(93, "Reply Queue / Outreach Response Review", "/app/outreach/replies"),
  team(94, "Meeting Detail / Meeting Outcome Workspace", "/app/communications/meetings/[meetingId]", ["/app/communications/meetings/intro-call-arjun-mehta"]),
  team(95, "Follow-up Queue / Follow-up Detail Workspace", "/app/outreach/follow-ups"),
  team(96, "Deal Qualification / Deal Stage Detail", "/app/deals/[dealId]/qualification", ["/app/deals/technova-magazine"]),
  team(97, "Proposal Library / Proposal List", "/app/deals/proposals"),
  team(98, "Proposal Review / Approval Detail", "/app/deals/proposals/[proposalId]/review", ["/app/deals/proposals/prp-2024-0056/review"]),
  team(99, "Contract Library / Contract List", "/app/commercial/contracts"),
  team(100, "Contract Detail / Signing & Execution Detail", "/app/commercial/contracts/[contractId]", ["/app/commercial/contracts/ctr-2024-0102"]),
  team(101, "Invoice Library / Invoice List", "/app/commercial/invoices"),
  team(102, "Invoice Detail / Payment Tracking", "/app/commercial/invoices/[invoiceId]", ["/app/commercial/invoices/inv-2024-0456"]),
  team(103, "Payment Transactions / Reconciliation Workspace", "/app/commercial/payments"),
  team(104, "Products & Packages Library", "/app/commercial/packages"),
  team(105, "Product / Package Detail", "/app/commercial/packages/[packageId]", ["/app/commercial/packages/premium-magazine"]),
  team(106, "Client Conversion / Won Deal Handoff", "/app/deals/[dealId]/handoff", ["/app/deals/technova-premium-magazine/handoff"]),
  team(107, "Client Onboarding Checklist Detail", "/app/clients/[clientId]/onboarding/checklist", ["/app/clients/technova-solutions/onboarding"]),
  team(108, "Project Intake / Project Creation Workspace", "/app/projects/new"),
  team(109, "Project Template / Workflow Template Library", "/app/workflows"),
  team(110, "Workflow Template Detail / Stage Configuration", "/app/workflows/[workflowTemplateId]", ["/app/workflows/personal-magazine-full-workflow"]),
  team(111, "Project Tasks / Milestones Detail", "/app/projects/[projectId]/tasks", ["/app/projects/technova-premium-magazine/tasks"]),
  team(112, "Project Team / Resource Assignment", "/app/projects/[projectId]/team", ["/app/projects/technova-premium-magazine/team"]),
  team(113, "Project Risks / Blockers Workspace", "/app/projects/[projectId]/risks", ["/app/projects/technova-premium-magazine/risks"]),
  team(114, "Project Files / Deliverables Detail", "/app/projects/[projectId]/files", ["/app/projects/technova-premium-magazine/files"]),
  team(115, "Project Approval Gates / Approval History", "/app/projects/[projectId]/approvals", ["/app/projects/technova-premium-magazine/approvals"]),
  team(116, "Project Client Requests / Dependency Tracker", "/app/projects/[projectId]/client-requests", ["/app/projects/technova-premium-magazine/client-requests"]),
  team(117, "Project Change Requests / Scope Change Workspace", "/app/projects/[projectId]/change-requests", ["/app/projects/technova-premium-magazine/change-requests"]),
  team(118, "Project Timeline / Gantt Detail", "/app/projects/[projectId]/timeline", ["/app/projects/technova-premium-magazine/timeline"]),
  team(119, "Project Activity / Project Audit Timeline", "/app/projects/[projectId]/activity", ["/app/projects/technova-premium-magazine/activity"]),
  team(120, "Project Completion / Closeout Workspace", "/app/projects/[projectId]/closeout", ["/app/projects/technova-premium-magazine/closeout"]),
  team(121, "Client Deliverables / Final Handover Workspace", "/app/projects/[projectId]/handover", ["/app/projects/technova-premium-magazine/handover"]),
  team(122, "Project Retrospective / Lessons Learned", "/app/projects/[projectId]/retrospective", ["/app/projects/technova-premium-magazine/retrospective"]),
  team(123, "Project Archive / Completed Project Detail", "/app/projects/[projectId]/archive", ["/app/projects/technova-premium-magazine/archive"]),
  team(124, "Publishing Queue / Publication Management Workspace", "/app/publishing/queue"),
  team(125, "Publication Detail / Release Management", "/app/publishing/[publicationId]", ["/app/publishing/technova-innovation-may-2024"]),
  team(126, "Publishing Calendar / Release Schedule", "/app/publishing/schedule"),
  team(127, "Distribution Campaign Management", "/app/distribution/campaigns"),
  team(128, "Distribution Channel / Placement Detail", "/app/distribution/campaigns/[campaignId]/placements/[placementId]", ["/app/distribution/campaigns/technova-innovation-launch/linkedin-post"]),
  team(129, "Distribution Performance & Verification", "/app/distribution/campaigns/[campaignId]/performance", ["/app/distribution/campaigns/technova-innovation-launch/performance"]),
  team(130, "Final Distribution Report / Client Performance Report", "/app/reports/final/[campaignId]", ["/app/reports/final/technova-innovation-launch"]),
  team(131, "Reporting Library / Report Center", "/app/reports"),
  team(132, "Report Detail / Interactive Report Workspace", "/app/reports/[reportId]", ["/app/reports/may-2024-distribution-performance"]),
  team(133, "Report Builder / Custom Report Configuration", "/app/reports/new"),
  team(134, "Scheduled Reports / Report Delivery Management", "/app/reports/scheduled"),
  team(135, "Analytics Executive Dashboard", "/app/analytics"),
  team(136, "Operations Command Center", "/app/operations"),
  team(137, "Team Performance / Workload Analytics", "/app/team/performance"),
  team(138, "System Audit Logs / Compliance Activity", "/app/audit-logs"),
  team(139, "Integration Center / Connected Services", "/app/integrations"),
  team(140, "Integration Detail / Connection Health", "/app/integrations/[connectionId]", ["/app/integrations/microsoft-365"]),
  team(141, "Automation / Workflow Runs Monitor", "/app/automations"),
  team(142, "Automation Run Detail / Failure Investigation", "/app/automations/runs/[runId]", ["/app/automations/runs/run-2024-006242"]),
  team(143, "System Notifications / Alert Rules Management", "/app/notifications/alert-rules"),
  team(144, "Role & Permission Administration", "/app/settings/roles"),
  team(145, "Workspace / Organization Administration", "/app/settings/organization"),
  team(146, "API Keys / Webhooks / Developer Access", "/app/settings/developer"),
  team(147, "System Health / Status & Incident Management", "/app/system-health"),
  team(148, "Data Import / Export Administration", "/app/data-transfer"),
  team(149, "Global Settings / Platform Configuration", "/app/settings"),
  team(150, "Empty / Loading / Error / Permission States System", "/app/system-states", [], "reference"),
  team(151, "Responsive Mobile Team Workspace System", "/app/responsive/mobile", [], "reference"),
  team(152, "Responsive Tablet Team Workspace System", "/app/responsive/tablet", [], "reference"),
  team(153, "Final Component System / Cross-Surface UI Certification", "/app/design-system", [], "reference"),
] as const satisfies readonly AuditedRouteDefinition[];

export const auditedRoutesByDesignId = new Map(
  auditedRouteRegistry.map((route) => [route.designId, route] as const),
);

export function getAuditedRouteByDesignId(designId: number) {
  return auditedRoutesByDesignId.get(designId);
}

export const resolvedRouteCollisions = [
  { designIds: [6, 136], canonicalPaths: ["/app/operations/dashboard", "/app/operations"] },
  { designIds: [33, 131], canonicalPaths: ["/app/reports/client-reporting", "/app/reports"] },
  { designIds: [37, 144], canonicalPaths: ["/app/settings/access-control", "/app/settings/roles"] },
  { designIds: [38, 135], canonicalPaths: ["/app/analytics/explorer", "/app/analytics"] },
  { designIds: [40, 145], canonicalPaths: ["/app/settings/system-organization", "/app/settings/organization"] },
] as const;
