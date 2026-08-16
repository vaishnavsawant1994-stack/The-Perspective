# Phase 2E — Master Admin, Employee & Client UI Design Sequence

**Status:** Frozen design-planning source of truth  
**Authority:** Phase 2A routes + Phase 2B authorization + Phase 2C entities + Phase 2D workflows  
**Coverage:** 151/151 operational screens  
**Execution boundary:** This phase sequences visual design work. It does not authorize frontend implementation.

## 1. Outcome

Phase 2E converts the frozen operational architecture into a deterministic design program. It defines two application shells, 33 routed template families, the first anchor design for every family, and every route-specific variant.

| Measure | Frozen count |
|---|---:|
| Phase 2A routed screens | 151 |
| Team Workspace routes | 120 |
| Client Portal routes | 31 |
| Reusable design families | 35 |
| Shell designs | 2 |
| Routed anchor designs | 33 |
| **Unique anchor designs required** | **35** |
| **Route variants after anchors** | **118** |
| **Total sequenced design work items** | **153** |

The 153 items are Design 001–002 for the shared shells and Design 003–153 for the 151 frozen routes. A route variant is still individually designed and reviewed; “variant” means it inherits a proven template rather than inventing a new visual system.

## 2. Non-negotiable design rules

1. **Design anchors before variants.** A family’s first route establishes its structure, components, state language and responsive behavior.
2. **One Team Workspace.** Admin and employee screens share TeamShell; permissions alter visibility, scope and actions—not the product shell.
3. **A separate Client Portal.** Client screens use ClientShell, client-safe language and CLIENT_SHARED projections only.
4. **No state invented by the UI.** Status labels and actions come from Phase 2D machines and guarded transitions.
5. **No data invented by the UI.** Main data comes from Phase 2C reads; commands target the mapped aggregate roots.
6. **Permission reductions are designed states.** Hidden, disabled, read-only, assigned-record and organization-wide variants must be intentional.
7. **Every design includes six states.** Default, empty, loading, error, permission-reduced and narrow-screen.
8. **Desktop density may not leak to mobile.** Mobile prioritizes current context and primary action; secondary rails become drawers or stacked sections.
9. **Approvals preserve version identity.** Review designs always show artifact/version, decision history and separation of internal versus client review.
10. **Financial evidence is append-only.** UI actions never imply that settled financial history can be overwritten.

## 3. Foundation designs

| Design | Deliverable | Family | Users | Primary responsibility | Responsive behavior |
|---:|---|---|---|---|---|
| 001 | Team Workspace shell | F01 TeamShell | Admin + employees | Global navigation, organization context, permission-aware module rail, search, notifications, command surface and user menu | Desktop persistent rail; tablet compact rail; mobile bottom destinations plus drawer |
| 002 | Client Portal shell | F02 ClientShell | Client users | Client-safe navigation, organization/project switcher, action center, messages, help and identity | Desktop compact rail; tablet collapsible rail; mobile action-first navigation |

## 4. Responsive and state standard

### Breakpoints

- **Desktop:** ≥ 1280px. Full navigation, multi-pane workspaces, contextual right rails and dense data tables are allowed.
- **Tablet:** 768–1279px. Navigation collapses, secondary rails become drawers, tables preserve essential columns and inspectors overlay.
- **Mobile:** < 768px. One primary task per view, card/list substitutions for tables, sticky primary action, filters in sheets and safe horizontal overflow only for comparisons.

### Shared state anatomy

- **Empty:** explain why no record exists, show the eligible next command and preserve filters.
- **Loading:** shell remains stable; skeletons mirror final geometry; commands are unavailable until authority and data resolve.
- **Error:** preserve user input, identify the failed surface, offer retry, support route and correlation reference when available.
- **Permission variant:** omit forbidden data, explain read-only/assigned scope where useful, and never expose a disabled control that reveals sensitive authority.
- **Client-safe variant:** remove internal notes, costs/margins, employee performance, lead provenance and non-shared versions.

## 5. Reusable design-family registry

| ID | Design family | Purpose | Core reusable components | Desktop → Tablet → Mobile |
|---|---|---|---|---|
| F01 | TeamShell | Internal product frame | Org switcher, module rail, global search, command palette, notification tray, profile menu | Persistent rail → compact rail → drawer/bottom nav |
| F02 | ClientShell | Client-safe product frame | Client/project switcher, action center, portal nav, help, profile | Compact rail → collapsible rail → action-first nav |
| F03 | AuthShell | Staff identity journeys | Branded panel, secure form, SSO, recovery/status card | Split → balanced stack → single secure form |
| F04 | ClientAuthShell | Client portal identity | Client-safe brand panel, invite/access form, trust status | Split → stack → single form |
| F05 | DashboardTemplate | Role/scope overview | KPI cards, attention queue, trends, recent activity, quick actions | Multi-panel → 2-column → priority stack |
| F06 | MyWorkTemplate | Personal assignments | Work tabs, due/SLA grouping, agenda, bulk update | List + rail → list + drawer → grouped cards |
| F07 | UniversalSearch | Permission-filtered discovery | Search bar, facets, result groups, recent queries | Results + facets → drawer facets → grouped results |
| F08 | NotificationCenter | Staff/client notifications | Feed, filters, read state, delivery preferences | Feed + rail → drawer → single feed |
| F09 | ResearchWorkbench | Discovery/staging/enrichment | Query builder, source controls, preview grid, provenance inspector | 3-pane → 2-pane → guided steps |
| F10 | EntityList | Reusable operational index | Saved views, filter bar, table/cards, bulk actions, export | Table + filters → compact table → cards |
| F11 | Entity360 | Reusable record detail | Identity header, tabs, timeline, related records, action rail | Main + rail → rail drawer → stacked sections |
| F12 | PipelineBoard | Stage-driven portfolio | Kanban/list toggle, stage totals, cards, filters, move guard | Board → condensed board → stage lists |
| F13 | JobQueue | Asynchronous work | Job states, progress, retry/cancel, logs | Table + inspector → drawer → cards |
| F14 | ReviewQueue | Human review triage | Preview, differences, confidence/issues, accept/reject/assign | Split review → overlay inspector → sequential review |
| F15 | CampaignWorkspace | Campaign planning and performance | Campaign header, audience, channels, metrics, activity | Tabs + rail → rail drawer → stacked cards |
| F16 | SequenceEditor | Outreach automation builder | Step canvas, timing, templates, validation, preview | Canvas + inspector → overlay → ordered steps |
| F17 | Inbox | Multi-thread communication | Thread list, message pane, context rail, composer | 3-pane → 2-pane → route-per-pane |
| F18 | ConversationDetail | Single conversation/support thread | Header, chronology, composer, attachments, linked records | Thread + rail → drawer → thread-first |
| F19 | CalendarAgenda | Meetings/deadlines/events | Calendar, agenda, filters, detail drawer | Calendar + agenda → toggle → agenda-first |
| F20 | DocumentBuilder | Proposals/contracts/questionnaires | Structured outline, editor/form, variables, preview, version bar | Editor + preview → toggle → section steps |
| F21 | DocumentReview | Versioned review/sign/approve | Artifact preview, diff/comments, decision panel, history | Preview + decision rail → drawer → sequential review |
| F22 | FinanceWorkspace | Invoice/payment/refund operations | Summary, ledger, line items, evidence, guarded actions | Main + ledger rail → tabs → stacked ledger |
| F23 | ProjectWorkspace | Project 360 | Health header, milestones, team, workstreams, activity | Workspace + rail → tabs/drawer → action stack |
| F24 | WorkflowBoard | Configured lifecycle execution | Stage board, blockers, SLAs, assignments, transition drawer | Board + inspector → condensed → stage lists |
| F25 | EditorialEditor | Research/draft/revision authoring | Outline, editor, sources, comments, version history | Editor + context → drawers → focused editor |
| F26 | MagazineProductionWorkspace | Cover/page/proof production | Spread canvas, thumbnails, assets, comments, versions | Canvas + rails → overlay rails → page sequence |
| F27 | MediaProductionWorkspace | Podcast/video production | Player, timeline, script/transcript, markers, versions | Timeline + inspector → toggle → player-first |
| F28 | EventWorkspace | Event, speaker and agenda ops | Event header, schedule, speakers, registrations, deliverables | Multi-panel → tabs → schedule-first |
| F29 | ApprovalCenter | Cross-product decisions | Approval queue, artifact preview, diff, policy, decision record | Queue + preview → toggle → one approval |
| F30 | TaskBoard | Tasks/milestones | Board/list, owner, due/SLA, dependencies, detail drawer | Board → compact list → grouped cards |
| F31 | AssetLibrary | Files and versioned assets | Folder tree, search, grid/list, metadata, version inspector | 3-pane → 2-pane → grid + sheet |
| F32 | PublishingQueue | Publication control | Target readiness, schedule, validation, publish status, URL | Table + inspector → drawer → release cards |
| F33 | DistributionCampaign | Channel distribution | Channel plan, items, schedule, delivery metrics, failures | Workspace + rail → tabs → channel cards |
| F34 | ReportBuilder | Reporting and delivery | Metric library, canvas, filters, preview, exports | Builder + preview → toggle → guided sections |
| F35 | AdminSettings | Configuration and governance | Setting groups, forms, member/role tables, audit/risk panels | Nav + form → section nav → stacked settings |

## 6. Design waves

| Wave | Focus | Screens | Exit condition |
|---:|---|---:|---|
| 0 | Shells and tokens | 2 designs | TeamShell and ClientShell approved |
| 1 | Identity, dashboards and shared core | 11 | Auth, dashboard, search, notifications and portal entry anchors approved |
| 2 | Research, list/detail and pipeline foundations | 11 | Core CRM primitives reusable |
| 3 | Sales, outreach and communication | 42 | Lead-to-deal design flow complete |
| 4 | Commercial documents and finance | 5 | Proposal-to-payment surfaces complete |
| 5 | Client/project/workflow/editorial foundations | 15 | Client 360 and production primitives established |
| 6 | Magazine production | 13 | Cover-to-proof sequence complete |
| 7 | Podcast and video production | 15 | Media workflows complete |
| 8 | Events, approvals and publishing | 10 | Approval-to-publication path complete |
| 9 | Distribution and reporting | 7 | Delivery/reporting path complete |
| 10 | People, settings, audit and risk | 10 | Governance surfaces complete |
| 11 | Client portal collaboration | 14 | Client project/review flow complete |
| 12 | Client commercial, reporting and support | 4 | Portal commercial/support flow complete |

## 7. Sequence field legend

Every routed row below carries the required design contract:

- **Identity:** Design Number, Screen Number, Screen Name, Route, User Type and Design Family.
- **Context:** Opens From and Main Purpose.
- **Data/workflow:** Main Data, Workflow States and Permission Variants.
- **Interaction:** Primary Actions and Reused Components.
- **Responsive:** Desktop, Tablet and Mobile layout.
- **Resilience:** Empty, Loading and Error state.

Detailed values are sourced mechanically from the frozen Phase 2A, 2C and 2D maps. The family registry supplies reusable component and responsive baselines; each route row adds the route-specific content, workflow and permissions.

## 8. Exact one-by-one design order

<!-- ROUTE_SEQUENCE_START -->

### Wave 1
#### Design 003 — Screen 001: Staff Sign In

| Field | Frozen design contract |
|---|---|
| Design Number | 003 |
| Screen Number | 1 |
| Screen Name | Staff Sign In |
| Route | /app/login |
| User Type | All staff |
| Design Family | **Anchor** — F03 AuthShell |
| Opens From | Direct staff URL; session expiry |
| Main Purpose | Secure entry to internal workspace |
| Main Data | Reads: `UserAccount`, `UserIdentity`, `OrganizationMembership`. Command targets: `Session`, `AuditEvent`. |
| Workflow States | `identity.access` |
| Primary Actions | Sign in; use SSO; recover access. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Responsive; single secure form on mobile, branded split layout on desktop. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: staff.auth.signin. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 004 — Screen 002: Multi-Factor Authentication

| Field | Frozen design contract |
|---|---|
| Design Number | 004 |
| Screen Number | 2 |
| Screen Name | Multi-Factor Authentication |
| Route | /app/mfa |
| User Type | All staff with MFA |
| Design Family | **Variant** — F03 AuthShell |
| Opens From | 1 Staff Sign In; sensitive action challenge |
| Main Purpose | Verify second factor |
| Main Data | Reads: `Session`, `MfaMethod`. Command targets: `Session`, `AuditEvent`. |
| Workflow States | `identity.access` |
| Primary Actions | Verify code; resend; use recovery code. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Focused mobile-first verification; no operational sidebar. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: staff.auth.mfa. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 005 — Screen 003: Accept Staff Invite

| Field | Frozen design contract |
|---|---|
| Design Number | 005 |
| Screen Number | 3 |
| Screen Name | Accept Staff Invite |
| Route | /app/invite/[token] |
| User Type | Invited staff |
| Design Family | **Variant** — F03 AuthShell |
| Opens From | Invite email |
| Main Purpose | Activate employee account |
| Main Data | Reads: `Invitation`, `Organization`, `Role`. Command targets: `UserAccount`, `Person`, `OrganizationMembership`, `MembershipRole`, `Invitation`, `AuditEvent`. |
| Workflow States | `identity.access` |
| Primary Actions | Accept invite; set password; decline. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Single-column on mobile; role/organization summary visible. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: staff.invite.accept. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 006 — Screen 004: Staff Profile Setup

| Field | Frozen design contract |
|---|---|
| Design Number | 006 |
| Screen Number | 4 |
| Screen Name | Staff Profile Setup |
| Route | /app/onboarding/profile |
| User Type | New staff |
| Design Family | **Variant** — F03 AuthShell |
| Opens From | 3 Accept Invite; first sign-in |
| Main Purpose | Collect staff basics and working preferences |
| Main Data | Reads: `Person`, `OrganizationMembership`, `Department`, `NotificationPreference`. Command targets: `Person`, `EmployeeProfile`, `OrganizationMembership`, `Asset`, `NotificationPreference`. |
| Workflow States | `identity.access` |
| Primary Actions | Save profile; set timezone; upload photo. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Full-width form mobile; two-column desktop. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: profile.update.own. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 007 — Screen 005: Staff Access Recovery

| Field | Frozen design contract |
|---|---|
| Design Number | 007 |
| Screen Number | 5 |
| Screen Name | Staff Access Recovery |
| Route | /app/recover-access |
| User Type | All staff |
| Design Family | **Variant** — F03 AuthShell |
| Opens From | 1 Sign In |
| Main Purpose | Reset password or recover account |
| Main Data | Reads: `UserAccount`, recovery token projection. Command targets: `UserIdentity`, `Session`, `AuditEvent`. |
| Workflow States | `identity.access` |
| Primary Actions | Send reset; set new password. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Minimal secure layout; stacked actions. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: staff.auth.recover. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 008 — Screen 006: Access Denied / Permission Required

| Field | Frozen design contract |
|---|---|
| Design Number | 008 |
| Screen Number | 6 |
| Screen Name | Access Denied / Permission Required |
| Route | /app/access-denied |
| User Type | All staff |
| Design Family | **Variant** — F03 AuthShell |
| Opens From | Unauthorized deep link/action |
| Main Purpose | Explain denied access without leaking protected data |
| Main Data | Reads: `MembershipRole`, `RolePermission`, `RecordAssignment`, requested `Resource`. Command targets: Optional `SupportTicket` or access-request `Task`. |
| Workflow States | `identity.access` |
| Primary Actions | Return; request access. Guarded workflow surface: Authenticate, verify, activate, recover, or deny. |
| Reused Components | Team/Client shell as applicable; Branded panel, secure form, SSO, recovery/status card |
| Desktop Layout | Split secure layout. Route note: Simple resilient screen; identical desktop/mobile semantics. |
| Tablet Layout | Balanced stacked split; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single secure form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No account/session state with recovery CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: none beyond authenticated session. Phase 2D authorization: Public auth command or authenticated self; no domain mutation on denial. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 009 — Screen 009: Global Workspace Search

| Field | Frozen design contract |
|---|---|
| Design Number | 009 |
| Screen Number | 9 |
| Screen Name | Global Workspace Search |
| Route | /app/search?q={query} |
| User Type | All staff |
| Design Family | **Anchor** — F07 UniversalSearch |
| Opens From | Top search/command bar |
| Main Purpose | Find any authorized operational record |
| Main Data | Reads: permission-filtered projections of `Resource`, CRM, commercial, delivery, content, assets, reports. Command targets: Search history/preference only. |
| Workflow States | `all indexed lifecycle projections` |
| Primary Actions | Search; filter entity; open result. Guarded workflow surface: Search/open only; commands execute on destination screen. |
| Reused Components | Team/Client shell as applicable; Search bar, facets, grouped results, recent queries |
| Desktop Layout | Results plus facet rail. Route note: Mobile full-screen search; desktop command palette + results page. |
| Tablet Layout | Facet drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grouped result cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No matches; preserve query and suggest refinements. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: workspace.search. Phase 2D authorization: Permission-filtered results. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 010 — Screen 010: Staff Notifications

| Field | Frozen design contract |
|---|---|
| Design Number | 010 |
| Screen Number | 10 |
| Screen Name | Staff Notifications |
| Route | /app/notifications |
| User Type | All staff |
| Design Family | **Anchor** — F08 NotificationCenter |
| Opens From | Bell icon; 8 My Work |
| Main Purpose | Central alert stream for assignments, replies, deadlines, payments and approvals |
| Main Data | Reads: `Notification`, linked `Resource`. Command targets: `Notification` read/dismiss state, `NotificationPreference`. |
| Workflow States | `notification.delivery` |
| Primary Actions | Mark read; open item; configure preferences. Guarded workflow surface: Mark read/unread; open target; update own delivery preferences. |
| Reused Components | Team/Client shell as applicable; Notification feed, filters, read state, delivery settings |
| Desktop Layout | Feed plus preference rail. Route note: Mobile-native feed; desktop adds filters and side summary. |
| Tablet Layout | Preference drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single feed; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Inbox-zero message and preference shortcut. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: notification.read.own. Phase 2D authorization: Own notifications only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 011 — Screen 121: Client Sign In

| Field | Frozen design contract |
|---|---|
| Design Number | 011 |
| Screen Number | 121 |
| Screen Name | Client Sign In |
| Route | /client/login |
| User Type | Client Portal User |
| Design Family | **Anchor** — F04 ClientAuthShell |
| Opens From | Direct portal URL; client invite follow-up |
| Main Purpose | Secure client portal entry separate from reader/member account |
| Main Data | Reads: `UserAccount`, client `OrganizationMembership`. Command targets: `Session`, `AuditEvent`. |
| Workflow States | `identity.access, portal.invitation` |
| Primary Actions | Sign in; recover access. Guarded workflow surface: Client sign-in/activate/recover. |
| Reused Components | Team/Client shell as applicable; Client brand panel, secure form, invite/access status |
| Desktop Layout | Client-safe split layout. Route note: Mobile-first secure form; desktop branded split layout. |
| Tablet Layout | Stacked identity panels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single client form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No invite/session state with help CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.auth.signin. Phase 2D authorization: Own invitation/session only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 012 — Screen 122: Client Portal Activation

| Field | Frozen design contract |
|---|---|
| Design Number | 012 |
| Screen Number | 122 |
| Screen Name | Client Portal Activation |
| Route | /client/activate/[token] |
| User Type | Invited Client User |
| Design Family | **Variant** — F04 ClientAuthShell |
| Opens From | Portal invite email from 44 Client Portal Access |
| Main Purpose | Activate client account and accept project access |
| Main Data | Reads: `Invitation`, client `Organization`, allowed `Project` summary. Command targets: `UserAccount`, `Person`, client `OrganizationMembership`, `Invitation`, terms consent, `AuditEvent`. |
| Workflow States | `identity.access, portal.invitation` |
| Primary Actions | Activate; set password; accept terms. Guarded workflow surface: Client sign-in/activate/recover. |
| Reused Components | Team/Client shell as applicable; Client brand panel, secure form, invite/access status |
| Desktop Layout | Client-safe split layout. Route note: Single-column mobile; concise project summary. |
| Tablet Layout | Stacked identity panels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single client form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No invite/session state with help CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.invite.accept. Phase 2D authorization: Own invitation/session only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 013 — Screen 123: Client Access Recovery

| Field | Frozen design contract |
|---|---|
| Design Number | 013 |
| Screen Number | 123 |
| Screen Name | Client Access Recovery |
| Route | /client/recover-access |
| User Type | Client Portal User |
| Design Family | **Variant** — F04 ClientAuthShell |
| Opens From | 121 Sign In |
| Main Purpose | Reset client portal credentials |
| Main Data | Reads: `UserAccount`, recovery state. Command targets: identity credential/reset event, `Session`, `AuditEvent`. |
| Workflow States | `identity.access, portal.invitation` |
| Primary Actions | Send reset; set password. Guarded workflow surface: Client sign-in/activate/recover. |
| Reused Components | Team/Client shell as applicable; Client brand panel, secure form, invite/access status |
| Desktop Layout | Client-safe split layout. Route note: Minimal responsive secure layout. |
| Tablet Layout | Stacked identity panels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single client form; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No invite/session state with help CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.auth.recover. Phase 2D authorization: Own invitation/session only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 2
#### Design 014 — Screen 007: Executive Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 014 |
| Screen Number | 7 |
| Screen Name | Executive Dashboard |
| Route | /app |
| User Type | Super Admin; Admin; Department Heads |
| Design Family | **Anchor** — F05 DashboardTemplate |
| Opens From | 1/2 Sign In; app logo |
| Main Purpose | Company-wide command center for revenue, pipeline, clients, production, finance and risk |
| Main Data | Reads: `Deal`, `Invoice`, `Payment`, `Project`, `Task`, `WorkflowInstance`, `EmployeeProfile`, `Report`, `MetricObservation`, `Notification`. Command targets: Dashboard preference only. |
| Workflow States | `portfolio projection: lead, deal, client onboarding, project, finance, approval, publishing, renewal` |
| Primary Actions | Open risk; drill into pipeline; assign owner; view report. Guarded workflow surface: Read projections; drill down; assign only through target aggregate command. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop-first multi-panel; tablet collapses; mobile shows KPI cards + urgent actions only. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: dashboard.executive.view. Phase 2D authorization: Executive scope; dashboard never owns state. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 015 — Screen 008: My Work

| Field | Frozen design contract |
|---|---|
| Design Number | 015 |
| Screen Number | 8 |
| Screen Name | My Work |
| Route | /app/my-work |
| User Type | All staff |
| Design Family | **Anchor** — F06 MyWorkTemplate |
| Opens From | Sign in; sidebar Home |
| Main Purpose | Personal operational home based on assignments |
| Main Data | Reads: `RecordAssignment`, `Task`, `ApprovalRequest`, `Meeting`, `Deal`, `Project`, `Conversation`, `Notification`. Command targets: `Task`, `Notification`, personal view preference. |
| Workflow States | `task.lifecycle, approval.lifecycle, meeting.lifecycle, deal, project.lifecycle` |
| Primary Actions | Open task; complete; reply; approve; join meeting. Guarded workflow surface: Start/complete/reopen assigned task; decide eligible approval; open linked work. |
| Reused Components | Team/Client shell as applicable; Work tabs, due/SLA groups, agenda, bulk controls |
| Desktop Layout | Assignment list plus agenda rail. Route note: Primary mobile staff screen; compact cards and quick actions. |
| Tablet Layout | List plus drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grouped work cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No assigned work; show next agenda and discovery. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: workspace.mywork.view. Phase 2D authorization: Assignment and scoped permissions. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 016 — Screen 023: Outreach Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 016 |
| Screen Number | 23 |
| Screen Name | Outreach Dashboard |
| Route | /app/outreach |
| User Type | Sales; Sales Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Outreach; 7 Dashboard |
| Main Purpose | Overview of sending health, active campaigns, replies and meetings |
| Main Data | Reads: `OutreachCampaign`, `CampaignRecipient`, `MessageDelivery`, `SendingAccount`, reply metrics. Command targets: Dashboard filter/preference only. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Open campaign; inspect replies; pause risk. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop KPI + charts; mobile KPI cards and urgent alerts. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: outreach.dashboard.view. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 017 — Screen 061: Editorial Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 017 |
| Screen Number | 61 |
| Screen Name | Editorial Dashboard |
| Route | /app/editorial |
| User Type | Editor-in-Chief; Editors; Account Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Editorial; 7 Dashboard |
| Main Purpose | Editorial workload, deadlines, blocked items and publication readiness |
| Main Data | Reads: editorial `Project`, `Deliverable`, `EditorialWork`, drafts/reviews, workflows, deadlines/approvals. Command targets: preference/filter only. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Assign; open overdue; review queue. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop editorial command center; mobile urgent work list. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: editorial.dashboard.view. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 018 — Screen 069: Magazine Studio Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 018 |
| Screen Number | 69 |
| Screen Name | Magazine Studio Dashboard |
| Route | /app/magazine |
| User Type | Magazine Editors; Designers; Account Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Magazine |
| Main Purpose | Production overview for standard and personal magazines |
| Main Data | Reads: `MagazineIssue`, project/workflow, covers, pages, proofs, reader builds, assets, approvals. Command targets: preference/filter only. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Open blocked issue; assign cover; review proof. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop visual dashboard; mobile urgent tasks. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: magazine.dashboard.view. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 019 — Screen 076: Podcast Studio Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 019 |
| Screen Number | 76 |
| Screen Name | Podcast Studio Dashboard |
| Route | /app/podcasts |
| User Type | Podcast Team; Account Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Podcasts |
| Main Purpose | Podcast production workload and schedule |
| Main Data | Reads: `PodcastEpisode`, guests, recording sessions, audio/transcript versions, approvals, schedule. Command targets: preference/filter only. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Open recording; assign producer; resolve blocker. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop dashboard; mobile recording agenda. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.dashboard.view. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 020 — Screen 082: Video Studio Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 020 |
| Screen Number | 82 |
| Screen Name | Video Studio Dashboard |
| Route | /app/videos |
| User Type | Video Team; Account Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Videos |
| Main Purpose | Video workload, shoots, edits, approvals and publish dates |
| Main Data | Reads: `VideoProject`, project/workflow, shoots, versions, assignees, blockers. Command targets: preference/filter only. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Open shoot; assign editor; resolve blocker. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop dashboard; mobile shoot agenda. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.dashboard.view. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 021 — Screen 088: Events Operations Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 021 |
| Screen Number | 88 |
| Screen Name | Events Operations Dashboard |
| Route | /app/events |
| User Type | Events Team; Sales; AM; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Events |
| Main Purpose | Commercial and editorial event operations overview |
| Main Data | Reads: `Event`, registrations, speakers, partners, tasks, invoices/payments, deadlines. Command targets: preference/filter only. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Open event; assign task; resolve risk. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop dashboard; mobile event-day essentials. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.dashboard.view. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 022 — Screen 094: Publishing Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 022 |
| Screen Number | 94 |
| Screen Name | Publishing Dashboard |
| Route | /app/publishing |
| User Type | Publishing; Editors; Marketing; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Publishing; studio ready states |
| Main Purpose | Overview of ready, scheduled, published, failed and correction items |
| Main Data | Reads: `Publication`, versions/jobs/targets/URLs, validation state. Command targets: preference/filter only. |
| Workflow States | `publication.lifecycle, publication.job, approval.lifecycle` |
| Primary Actions | Open ready item; inspect failure; schedule. Guarded workflow surface: Validate/approve/schedule/publish/retry/unpublish/correct. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop dashboard; mobile urgent queue. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: publish.dashboard.view. Phase 2D authorization: Publish R01/R02/R07/R14; approved manifest required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 023 — Screen 098: Distribution Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 023 |
| Screen Number | 98 |
| Screen Name | Distribution Dashboard |
| Route | /app/distribution |
| User Type | Marketing; Social; Account Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Published item; sidebar Distribution |
| Main Purpose | Overview of post-publication amplification |
| Main Data | Reads: campaigns/items/channels/URLs, verified metrics, client/project. Command targets: preference/filter only. |
| Workflow States | `distribution.campaign, distribution.item, report.metric` |
| Primary Actions | Create campaign; resolve failed channel; open report. Guarded workflow surface: Prepare/approve/schedule/run/retry channel item; inspect verified performance. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop dashboard; mobile scheduled/failed actions. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: distribution.dashboard.view. Phase 2D authorization: Launch R01/R02/R14; provider evidence retained. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 024 — Screen 102: Reports

| Field | Frozen design contract |
|---|---|
| Design Number | 024 |
| Screen Number | 102 |
| Screen Name | Reports |
| Route | /app/reports |
| User Type | Account Managers; Managers; Admin |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | Sidebar Reports; 101 Performance |
| Main Purpose | All internal/client reporting artifacts |
| Main Data | Reads: `Report`, versions, client/project/period, delivery state. Command targets: `Report`, assignment/archive. |
| Workflow States | `report.lifecycle, delivery.pack, report.metric` |
| Primary Actions | Create; open; schedule delivery. Guarded workflow surface: Collect/freeze/review/approve/deliver/supersede report. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Desktop table/cards; mobile list. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: report.view scoped. Phase 2D authorization: Verified cutoff/source; client-safe version only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 3
#### Design 025 — Screen 011: Lead Finder

| Field | Frozen design contract |
|---|---|
| Design Number | 025 |
| Screen Number | 11 |
| Screen Name | Lead Finder |
| Route | /app/sales/lead-finder |
| User Type | Researcher; Sales; Admin |
| Design Family | **Anchor** — F09 ResearchWorkbench |
| Opens From | Sidebar Sales; 7 Dashboard |
| Main Purpose | Discover potential executives/companies from approved sources |
| Main Data | Reads: `LeadSource`, `Company`, `Contact`, `Lead`, `SuppressionEntry`. Command targets: `ExtractionJob`, saved search/filter, `AuditEvent` for export. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Search sources; save prospects; create extraction job. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Query builder, source controls, data grid, provenance inspector |
| Desktop Layout | Three-pane workbench. Route note: Desktop research workspace; mobile read/save only. |
| Tablet Layout | Two-pane plus drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Guided steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No staged results; explain source/query next step. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.discover. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 026 — Screen 012: Data Sources

| Field | Frozen design contract |
|---|---|
| Design Number | 026 |
| Screen Number | 12 |
| Screen Name | Data Sources |
| Route | /app/sales/data-sources |
| User Type | Admin; Research Lead |
| Design Family | **Anchor** — F35 AdminSettings |
| Opens From | 11 Lead Finder; Settings |
| Main Purpose | Manage allowed acquisition sources and source health |
| Main Data | Reads: `LeadSource`, `IntegrationConnection`, `AuditEvent`. Command targets: `LeadSource`, `IntegrationConnection`. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Add source; enable/disable; test source. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop configuration table; mobile read-only/quick toggle. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: source.manage. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 027 — Screen 013: Extraction Jobs

| Field | Frozen design contract |
|---|---|
| Design Number | 027 |
| Screen Number | 13 |
| Screen Name | Extraction Jobs |
| Route | /app/sales/extractions |
| User Type | Researcher; Admin |
| Design Family | **Anchor** — F13 JobQueue |
| Opens From | 11/12 Lead tools |
| Main Purpose | Track scraping/import/extraction batches without mixing raw and approved CRM data |
| Main Data | Reads: `ExtractionJob`, `LeadSource`, `StagedRecord` counts. Command targets: `ExtractionJob`, `AutomationRun` retry/cancel. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Run; retry; cancel; inspect errors. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Job table, progress, status, retry/cancel, logs |
| Desktop Layout | Queue plus log inspector. Route note: Desktop queue table; mobile status cards. |
| Tablet Layout | Queue plus drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Job cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No jobs; launch action and system explanation. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.extract.run. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 028 — Screen 014: Extraction Review / Staging

| Field | Frozen design contract |
|---|---|
| Design Number | 028 |
| Screen Number | 14 |
| Screen Name | Extraction Review / Staging |
| Route | /app/sales/extractions/[jobId] |
| User Type | Researcher; Sales Ops |
| Design Family | **Variant** — F09 ResearchWorkbench |
| Opens From | 13 Extraction Jobs |
| Main Purpose | Validate, deduplicate and approve extracted records before CRM import |
| Main Data | Reads: `ExtractionJob`, `StagedRecord`, `DuplicateCandidate`, `Company`, `Contact`, `Lead`. Command targets: `StagedRecord`, `Company`, `Contact`, `Lead`, merge decision, `AuditEvent`. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Approve; merge duplicate; reject; enrich. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Query builder, source controls, data grid, provenance inspector |
| Desktop Layout | Three-pane workbench. Route note: Desktop dense review; mobile limited approve/reject. |
| Tablet Layout | Two-pane plus drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Guided steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No staged results; explain source/query next step. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.import.review. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 029 — Screen 015: Enrichment Queue

| Field | Frozen design contract |
|---|---|
| Design Number | 029 |
| Screen Number | 15 |
| Screen Name | Enrichment Queue |
| Route | /app/sales/enrichment |
| User Type | Researcher; Sales Ops |
| Design Family | **Variant** — F09 ResearchWorkbench |
| Opens From | 14 Extraction Review; 16 Leads |
| Main Purpose | Improve contact/company completeness and confidence |
| Main Data | Reads: `EnrichmentJob`, `EnrichmentFact`, target `Resource`. Command targets: `EnrichmentJob`, accepted `EnrichmentFact`, target `Company`/`Contact`/`Lead`. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Enrich; verify; accept/reject field. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Query builder, source controls, data grid, provenance inspector |
| Desktop Layout | Three-pane workbench. Route note: Desktop batch queue; mobile single-record review. |
| Tablet Layout | Two-pane plus drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Guided steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No staged results; explain source/query next step. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.enrich. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 030 — Screen 016: Leads

| Field | Frozen design contract |
|---|---|
| Design Number | 030 |
| Screen Number | 16 |
| Screen Name | Leads |
| Route | /app/sales/leads |
| User Type | Sales; Research; Admin |
| Design Family | **Anchor** — F10 EntityList |
| Opens From | 11 Finder; 14 Review; sidebar Sales |
| Main Purpose | Canonical prospect database before conversion to client |
| Main Data | Reads: `Lead`, `Company`, `Contact`, `LeadScore`, `ActivityEvent`, `RecordAssignment`. Command targets: `Lead`, `RecordAssignment`, `LeadListMember`. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Create/import; assign; qualify; add to campaign; convert to deal. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table/board toggle; mobile card list with filters. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.view; lead.edit scoped. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 031 — Screen 017: Lead Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 031 |
| Screen Number | 17 |
| Screen Name | Lead Detail |
| Route | /app/sales/leads/[leadId] |
| User Type | Sales; Research; Admin |
| Design Family | **Anchor** — F11 Entity360 |
| Opens From | 16 Leads; 9 Search |
| Main Purpose | Single prospect workspace with full pre-client history |
| Main Data | Reads: `Lead`, `Company`, `Contact`, `LeadScore`, `Qualification`, `Conversation`, `Meeting`, `Task`, `ActivityEvent`. Command targets: `Lead`, `Qualification`, `RecordAssignment`, `Task`, `Comment`, `Deal` conversion. |
| Workflow States | `lead.lifecycle, extraction.job, enrichment.job` |
| Primary Actions | Qualify; contact; add note; schedule follow-up; create deal. Guarded workflow surface: Discover/extract/retry/review/enrich/qualify/assign/convert according to screen. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop 3-column CRM detail; mobile tabbed cards. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.view; lead.edit scoped. Phase 2D authorization: Research/Sales scope; DNC and provenance gates. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 032 — Screen 018: Companies

| Field | Frozen design contract |
|---|---|
| Design Number | 032 |
| Screen Number | 18 |
| Screen Name | Companies |
| Route | /app/sales/companies |
| User Type | Sales; Research; Admin |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 16 Leads; 9 Search |
| Main Purpose | Company directory across prospects and clients |
| Main Data | Reads: `Company`, `Contact`, `Lead`, `Deal`, `ClientAccount`. Command targets: `Company`, merge/assignment records. |
| Workflow States | `lead.lifecycle, deal, client onboarding (linked projections)` |
| Primary Actions | Create; filter; open company. Guarded workflow surface: Maintain company/contact/list; add eligible leads to frozen audience. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: company.view. Phase 2D authorization: Scoped CRM commands; entity merge is audited. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 033 — Screen 019: Company Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 033 |
| Screen Number | 19 |
| Screen Name | Company Detail |
| Route | /app/sales/companies/[companyId] |
| User Type | Sales; Account Managers; Admin |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 18 Companies; 17 Lead; 42 Client 360 |
| Main Purpose | 360° organization view across contacts, leads, deals and projects |
| Main Data | Reads: `Company`, `Contact`, `Lead`, `Deal`, `ClientAccount`, `Project`, `ActivityEvent`. Command targets: `Company`, `Contact`, `Comment`, `RecordAssignment`, merge decision. |
| Workflow States | `lead.lifecycle, deal, client onboarding (linked projections)` |
| Primary Actions | Edit; add contact; create deal; open client. Guarded workflow surface: Maintain company/contact/list; add eligible leads to frozen audience. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop tabbed 360; mobile summary + tabs. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: company.view; company.edit scoped. Phase 2D authorization: Scoped CRM commands; entity merge is audited. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 034 — Screen 020: Contacts

| Field | Frozen design contract |
|---|---|
| Design Number | 034 |
| Screen Number | 20 |
| Screen Name | Contacts |
| Route | /app/sales/contacts |
| User Type | Sales; Research; Account Managers |
| Design Family | **Variant** — F10 EntityList |
| Opens From | Sidebar Sales; company/client screens |
| Main Purpose | People directory independent of lead/client lifecycle stage |
| Main Data | Reads: `Contact`, `Person`, `Company`, `Conversation`, `RecordAssignment`. Command targets: `Person`, `Contact`, `RecordAssignment`, merge decision. |
| Workflow States | `lead.lifecycle, deal, client onboarding (linked projections)` |
| Primary Actions | Create; import; merge; open. Guarded workflow surface: Maintain company/contact/list; add eligible leads to frozen audience. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: contact.view. Phase 2D authorization: Scoped CRM commands; entity merge is audited. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 035 — Screen 021: Contact Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 035 |
| Screen Number | 21 |
| Screen Name | Contact Detail |
| Route | /app/sales/contacts/[contactId] |
| User Type | Sales; Account Managers; Admin |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 20 Contacts; 17 Lead; 19 Company; 42 Client |
| Main Purpose | Relationship-level history for one person |
| Main Data | Reads: `Person`, `Contact`, `Company`, `Conversation`, `Message`, `Meeting`, `Deal`, `Project`, `ActivityEvent`. Command targets: `Contact`, `Person`, `Meeting`, `Task`, `Comment`, consent/suppression records. |
| Workflow States | `lead.lifecycle, deal, client onboarding (linked projections)` |
| Primary Actions | Email; call; schedule; add note; create deal. Guarded workflow surface: Maintain company/contact/list; add eligible leads to frozen audience. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop context rail; mobile actions anchored under identity. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: contact.view; contact.edit scoped. Phase 2D authorization: Scoped CRM commands; entity merge is audited. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 036 — Screen 022: Lead Lists & Segments

| Field | Frozen design contract |
|---|---|
| Design Number | 036 |
| Screen Number | 22 |
| Screen Name | Lead Lists & Segments |
| Route | /app/sales/lists |
| User Type | Sales; Research; Marketing Ops |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 16 Leads; 11 Finder |
| Main Purpose | Reusable audiences for outreach and analysis |
| Main Data | Reads: `LeadList`, `LeadListMember`, `Lead`, `LeadScore`. Command targets: `LeadList`, `LeadListMember`. |
| Workflow States | `lead.lifecycle, deal, client onboarding (linked projections)` |
| Primary Actions | Create list; add/remove leads; export if permitted; launch campaign. Guarded workflow surface: Maintain company/contact/list; add eligible leads to frozen audience. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop builder; mobile view/filter only. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: lead.list.manage. Phase 2D authorization: Scoped CRM commands; entity merge is audited. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 037 — Screen 024: Campaigns

| Field | Frozen design contract |
|---|---|
| Design Number | 037 |
| Screen Number | 24 |
| Screen Name | Campaigns |
| Route | /app/outreach/campaigns |
| User Type | Sales; Managers |
| Design Family | **Anchor** — F15 CampaignWorkspace |
| Opens From | 23 Dashboard; 22 Lists |
| Main Purpose | Manage multi-step outbound campaigns |
| Main Data | Reads: `OutreachCampaign`, `LeadList`, `Sequence`, `SendingAccount`, metrics. Command targets: `OutreachCampaign` draft/archive, assignment. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Create; duplicate; launch; pause; archive. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; Campaign header, audience, channels, metrics, activity |
| Desktop Layout | Tabbed workspace plus rail. Route note: Desktop table/cards; mobile campaign cards. |
| Tablet Layout | Rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked campaign cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No campaign data; configure audience/channel CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: campaign.view; campaign.manage scoped. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 038 — Screen 025: Campaign Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 038 |
| Screen Number | 25 |
| Screen Name | Campaign Detail |
| Route | /app/outreach/campaigns/[campaignId] |
| User Type | Sales; Managers |
| Design Family | **Variant** — F15 CampaignWorkspace |
| Opens From | 24 Campaigns; 17 Lead |
| Main Purpose | Operational control room for one outreach campaign |
| Main Data | Reads: `OutreachCampaign`, `CampaignRecipient`, `SequenceStep`, `MessageDelivery`, `Conversation`, `SuppressionEntry`. Command targets: `OutreachCampaign`, `CampaignRecipient`, launch/pause `ActivityEvent`/`AuditEvent`. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Launch/pause; edit audience; inspect steps; view replies. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; Campaign header, audience, channels, metrics, activity |
| Desktop Layout | Tabbed workspace plus rail. Route note: Desktop tabbed detail; mobile read/status + pause only. |
| Tablet Layout | Rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked campaign cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No campaign data; configure audience/channel CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: campaign.manage scoped. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 039 — Screen 026: Sequence Builder

| Field | Frozen design contract |
|---|---|
| Design Number | 039 |
| Screen Number | 26 |
| Screen Name | Sequence Builder |
| Route | /app/outreach/sequences/[sequenceId] |
| User Type | Sales; Managers |
| Design Family | **Anchor** — F16 SequenceEditor |
| Opens From | 25 Campaign Detail |
| Main Purpose | Build outreach steps, waits, conditions and stop rules |
| Main Data | Reads: `Sequence`, `SequenceStep`, `MessageTemplateVersion`. Command targets: new `Sequence` version, `SequenceStep`. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Add step; edit wait; set stop rule; preview. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; Step canvas, timing, templates, validation, preview |
| Desktop Layout | Canvas plus inspector. Route note: Desktop visual builder; mobile view-only. |
| Tablet Layout | Overlay inspector; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Ordered step editor; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No steps; choose template or add first step. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: sequence.manage. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 040 — Screen 027: Email Templates

| Field | Frozen design contract |
|---|---|
| Design Number | 040 |
| Screen Number | 27 |
| Screen Name | Email Templates |
| Route | /app/outreach/templates |
| User Type | Sales; Managers; Admin |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | 26 Sequence Builder; Settings |
| Main Purpose | Central reusable outreach templates and variables |
| Main Data | Reads: `MessageTemplate`, `MessageTemplateVersion`, performance projection. Command targets: `MessageTemplate`, immutable `MessageTemplateVersion`. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Create; edit; test variables; archive. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop editor; mobile browse/copy only. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: template.manage scoped. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 041 — Screen 028: Sending Accounts

| Field | Frozen design contract |
|---|---|
| Design Number | 041 |
| Screen Number | 28 |
| Screen Name | Sending Accounts |
| Route | /app/outreach/sending-accounts |
| User Type | Admin; Sales Managers |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | 25 Campaign; Settings |
| Main Purpose | Manage authenticated outbound mailboxes and health |
| Main Data | Reads: `SendingAccount`, `IntegrationConnection`, health/sync state. Command targets: `SendingAccount`, `IntegrationConnection`, `AuditEvent`. |
| Workflow States | `outreach.campaign, outreach.recipient` |
| Primary Actions | Connect; disconnect; test; set limits. Guarded workflow surface: Create/edit/approve/schedule/run/pause/cancel campaign; version sequence/template. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop settings; mobile status only. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: emailaccount.manage. Phase 2D authorization: Launch restricted to R01/R02/R03. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 042 — Screen 029: Replies / Response Queue

| Field | Frozen design contract |
|---|---|
| Design Number | 042 |
| Screen Number | 29 |
| Screen Name | Replies / Response Queue |
| Route | /app/outreach/replies |
| User Type | Sales; Managers |
| Design Family | **Anchor** — F14 ReviewQueue |
| Opens From | 23 Dashboard; campaigns |
| Main Purpose | Triage campaign responses by intent and urgency |
| Main Data | Reads: `Message`, `Conversation`, `Lead`, `Company`, `OutreachCampaign`, assignment. Command targets: `Conversation`, `RecordAssignment`, classification, `Task`. |
| Workflow States | `outreach.recipient, lead.lifecycle, conversation.lifecycle, deal` |
| Primary Actions | Classify; assign; reply; create deal; mark do-not-contact. Guarded workflow surface: Classify reply; stop sequence; reply; create follow-up/deal. |
| Reused Components | Team/Client shell as applicable; Review queue, preview/diff, issues, accept/reject/assign |
| Desktop Layout | Queue plus review pane. Route note: Mobile optimized triage; desktop batch queue. |
| Tablet Layout | Preview overlay; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending reviews; completed/retry context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: reply.view; reply.assign. Phase 2D authorization: Assigned Sales; positive reply stops automation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 043 — Screen 030: Reply Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 043 |
| Screen Number | 30 |
| Screen Name | Reply Detail |
| Route | /app/outreach/replies/[replyId] |
| User Type | Sales |
| Design Family | **Anchor** — F18 ConversationDetail |
| Opens From | 29 Replies; notifications |
| Main Purpose | Resolve one outreach response with complete lead context |
| Main Data | Reads: `Conversation`, `Message`, `Lead`, `Company`, `CampaignRecipient`, `Task`, `Deal`. Command targets: `Message`, `Conversation`, `Task`, `Comment`, `Qualification`, `Deal`. |
| Workflow States | `outreach.recipient, lead.lifecycle, conversation.lifecycle, deal` |
| Primary Actions | Reply; schedule meeting; create deal; close lead. Guarded workflow surface: Classify reply; stop sequence; reply; create follow-up/deal. |
| Reused Components | Team/Client shell as applicable; Conversation header, chronology, composer, attachments, context |
| Desktop Layout | Thread plus context rail. Route note: Desktop conversation + CRM side panel; mobile stacked. |
| Tablet Layout | Context drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Thread-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No messages; first-message or closed-thread treatment. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: reply.handle scoped. Phase 2D authorization: Assigned Sales; positive reply stops automation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 044 — Screen 031: Inbox

| Field | Frozen design contract |
|---|---|
| Design Number | 044 |
| Screen Number | 31 |
| Screen Name | Inbox |
| Route | /app/inbox |
| User Type | Sales; Account Managers; Editorial client-facing roles |
| Design Family | **Anchor** — F17 Inbox |
| Opens From | Sidebar Inbox; 10 Notifications |
| Main Purpose | Unified business inbox across connected accounts |
| Main Data | Reads: `Conversation`, `ConversationParticipant`, latest `Message`, labels/assignments. Command targets: `Conversation`, `RecordAssignment`, read/archive state. |
| Workflow States | `conversation.lifecycle` |
| Primary Actions | Search; assign; archive; reply; link entity. Guarded workflow surface: Assign/reply/archive/resolve/reopen; link authorized entity. |
| Reused Components | Team/Client shell as applicable; Thread list, message pane, context rail, composer |
| Desktop Layout | Three-pane inbox. Route note: 3-pane desktop; mobile account → thread list → message navigation. |
| Tablet Layout | Two-pane inbox; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Route-per-pane chat; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No conversations; compose if authorized. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: inbox.view scoped. Phase 2D authorization: Mailbox and record scope. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 045 — Screen 032: Conversation Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 045 |
| Screen Number | 32 |
| Screen Name | Conversation Detail |
| Route | /app/inbox/thread/[threadId] |
| User Type | Assigned staff; Managers |
| Design Family | **Variant** — F18 ConversationDetail |
| Opens From | 31 Inbox; 29 Replies |
| Main Purpose | Read/reply with CRM and client/project context |
| Main Data | Reads: `Conversation`, `Message`, `ConversationParticipant`, `Asset`, linked lead/deal/client/project, `Task`. Command targets: `Message`, `Asset`, `Task`, `Comment`, `RecordAssignment`. |
| Workflow States | `conversation.lifecycle` |
| Primary Actions | Reply; forward; assign; add note/task; link client/deal/project. Guarded workflow surface: Assign/reply/archive/resolve/reopen; link authorized entity. |
| Reused Components | Team/Client shell as applicable; Conversation header, chronology, composer, attachments, context |
| Desktop Layout | Thread plus context rail. Route note: Desktop message + context rail; mobile context collapses into sheet. |
| Tablet Layout | Context drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Thread-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No messages; first-message or closed-thread treatment. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: message.read; message.send scoped. Phase 2D authorization: Mailbox and record scope. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 046 — Screen 033: Meetings & Calls

| Field | Frozen design contract |
|---|---|
| Design Number | 046 |
| Screen Number | 33 |
| Screen Name | Meetings & Calls |
| Route | /app/communications/meetings |
| User Type | Sales; Account Managers; Production leads |
| Design Family | **Anchor** — F19 CalendarAgenda |
| Opens From | Lead/Client/Project screens; calendar |
| Main Purpose | Central meeting/call record list |
| Main Data | Reads: `Meeting`, `Call`, participants, linked CRM/client/project records. Command targets: `Meeting`, participants, `CalendarItem`. |
| Workflow States | `meeting.lifecycle` |
| Primary Actions | Schedule; filter; join; log call. Guarded workflow surface: Propose/schedule/confirm/reschedule/complete/cancel/no-show. |
| Reused Components | Team/Client shell as applicable; Calendar, agenda, filters, event drawer |
| Desktop Layout | Calendar plus agenda. Route note: Desktop table/calendar; mobile agenda list. |
| Tablet Layout | Calendar/agenda toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Agenda-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No scheduled items; create/browse next action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: meeting.view scoped. Phase 2D authorization: Attendee/owner scope; immutable reschedule history. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 047 — Screen 034: Meeting Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 047 |
| Screen Number | 34 |
| Screen Name | Meeting Detail |
| Route | /app/communications/meetings/[meetingId] |
| User Type | Attendees; Managers |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 33 Meetings; Calendar; client/deal/project links |
| Main Purpose | Prepare, run and document one meeting |
| Main Data | Reads: `Meeting`, participants, `MeetingNote`, transcript/recording `Asset`, linked records, `Task`. Command targets: `Meeting`, `MeetingNote`, `Task`, `AssetLink`, `ActivityEvent`. |
| Workflow States | `meeting.lifecycle` |
| Primary Actions | Join; take notes; add outcome; create follow-up. Guarded workflow surface: Propose/schedule/confirm/reschedule/complete/cancel/no-show. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop meeting workspace; mobile note/follow-up optimized. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: meeting.view; meeting.edit scoped. Phase 2D authorization: Attendee/owner scope; immutable reschedule history. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 048 — Screen 035: Deal Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 048 |
| Screen Number | 35 |
| Screen Name | Deal Pipeline |
| Route | /app/deals/pipeline |
| User Type | Sales; Managers; Admin |
| Design Family | **Anchor** — F12 PipelineBoard |
| Opens From | 7 Dashboard; 17 Lead |
| Main Purpose | Kanban view of opportunities by sales stage |
| Main Data | Reads: `DealPipeline`, `DealStage`, `Deal`, `Company`, `Contact`, `ActivityEvent`. Command targets: `Deal`, `DealStageHistory`, `Task`. |
| Workflow States | `sales.deal` |
| Primary Actions | Drag/move stage; assign; create deal; filter. Guarded workflow surface: Advance/backtrack/hold/win/lose/disqualify; assign owner. |
| Reused Components | Team/Client shell as applicable; Kanban/list toggle, stage totals, cards, filters, move guard |
| Desktop Layout | Full stage board. Route note: Desktop kanban; mobile vertical stage groups + move action. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pipeline records; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: deal.view; deal.move scoped. Phase 2D authorization: Stage guards and commercial gate required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 049 — Screen 037: Deals List

| Field | Frozen design contract |
|---|---|
| Design Number | 049 |
| Screen Number | 37 |
| Screen Name | Deals List |
| Route | /app/deals |
| User Type | Sales; Managers; Admin |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 35 Pipeline; sidebar Deals |
| Main Purpose | Sortable/filterable deal inventory |
| Main Data | Reads: `Deal`, `DealStage`, `Company`, owner/assignment. Command targets: `Deal`, `RecordAssignment`. |
| Workflow States | `sales.deal` |
| Primary Actions | Create; filter; export if permitted; open. Guarded workflow surface: Advance/backtrack/hold/win/lose/disqualify; assign owner. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: deal.view. Phase 2D authorization: Stage guards and commercial gate required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 050 — Screen 036: Deal Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 050 |
| Screen Number | 36 |
| Screen Name | Deal Detail |
| Route | /app/deals/[dealId] |
| User Type | Sales; Managers; Finance read as permitted |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 35 Pipeline; 17 Lead; 32 Conversation |
| Main Purpose | Complete commercial workspace from opportunity to won/lost |
| Main Data | Reads: `Deal`, `DealProduct`, company/contact, meetings, conversations, proposal, contract, invoice, activity. Command targets: `Deal`, `DealProduct`, `DealStageHistory`, `Task`, `Comment`. |
| Workflow States | `sales.deal` |
| Primary Actions | Update stage; schedule; create proposal; send contract; mark won/lost. Guarded workflow surface: Advance/backtrack/hold/win/lose/disqualify; assign owner. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop 360 detail; mobile summary + tab navigation. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: deal.view; deal.edit scoped. Phase 2D authorization: Stage guards and commercial gate required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 051 — Screen 038: Proposals

| Field | Frozen design contract |
|---|---|
| Design Number | 051 |
| Screen Number | 38 |
| Screen Name | Proposals |
| Route | /app/deals/proposals |
| User Type | Sales; Managers |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 36 Deal; Commercial menu |
| Main Purpose | Track all proposals and their status |
| Main Data | Reads: `Proposal`, `ProposalVersion`, `Deal`, `ClientAccount`, approval state. Command targets: `Proposal`, archive/assignment. |
| Workflow States | `sales.proposal, approval.lifecycle` |
| Primary Actions | Create; duplicate; send; expire. Guarded workflow surface: Version proposal; request/decide review; send/view/accept/decline/expire. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: proposal.view. Phase 2D authorization: Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 052 — Screen 039: Proposal Detail / Builder

| Field | Frozen design contract |
|---|---|
| Design Number | 052 |
| Screen Number | 39 |
| Screen Name | Proposal Detail / Builder |
| Route | /app/deals/proposals/[proposalId] |
| User Type | Sales; Manager approvers |
| Design Family | **Anchor** — F20 DocumentBuilder |
| Opens From | 38 Proposals; 36 Deal |
| Main Purpose | Create package, deliverables, commercial terms and branded proposal |
| Main Data | Reads: `Proposal`, `ProposalVersion`, `Deal`, `DealProduct`, `Package`, `ClientAccount`, `ApprovalRequest`. Command targets: `Proposal`, immutable `ProposalVersion`, `Asset`, `ApprovalRequest`. |
| Workflow States | `sales.proposal, approval.lifecycle` |
| Primary Actions | Edit; add line item; request approval; send. Guarded workflow surface: Version proposal; request/decide review; send/view/accept/decline/expire. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop builder; mobile review/comment only. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: proposal.edit scoped. Phase 2D authorization: Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 053 — Screen 040: Proposal Preview & Approval

| Field | Frozen design contract |
|---|---|
| Design Number | 053 |
| Screen Number | 40 |
| Screen Name | Proposal Preview & Approval |
| Route | /app/deals/proposals/[proposalId]/review |
| User Type | Sales Manager; Admin; Sales owner |
| Design Family | **Anchor** — F21 DocumentReview |
| Opens From | 39 Proposal Builder |
| Main Purpose | Internal approval and client-ready preview before sending |
| Main Data | Reads: exact `ProposalVersion`, margin-restricted deal lines, `ApprovalRequest`, decisions. Command targets: `ApprovalDecision`, `ApprovalOverride`, proposal status, `AuditEvent`. |
| Workflow States | `sales.proposal, approval.lifecycle` |
| Primary Actions | Approve; request changes; send. Guarded workflow surface: Version proposal; request/decide review; send/view/accept/decline/expire. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Desktop document preview; mobile approve/comment. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: proposal.approve. Phase 2D authorization: Send R01/R02/R03/R04/R06; discounts R01/R02/R03/R15. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 054 — Screen 045: Contracts

| Field | Frozen design contract |
|---|---|
| Design Number | 054 |
| Screen Number | 45 |
| Screen Name | Contracts |
| Route | /app/commercial/contracts |
| User Type | Sales; Account Managers; Finance; Admin |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 36 Deal; 42 Client |
| Main Purpose | Manage agreement lifecycle |
| Main Data | Reads: `Contract`, `ContractVersion`, `ClientAccount`, `Deal`, signature status. Command targets: `Contract`, assignment/archive controls. |
| Workflow States | `commercial.contract, approval.lifecycle` |
| Primary Actions | Create; send; void; duplicate; filter. Guarded workflow surface: Version/review/approve/send/view/sign/activate/void/terminate. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: contract.view scoped. Phase 2D authorization: Create/send R01/R02/R03/R15; signed version immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 055 — Screen 046: Contract Detail / Editor

| Field | Frozen design contract |
|---|---|
| Design Number | 055 |
| Screen Number | 46 |
| Screen Name | Contract Detail / Editor |
| Route | /app/commercial/contracts/[contractId] |
| User Type | Sales; Finance; authorized managers |
| Design Family | **Variant** — F20 DocumentBuilder |
| Opens From | 45 Contracts; 36 Deal |
| Main Purpose | Draft, review, send and manage one contract |
| Main Data | Reads: `Contract`, versions, signers, signature events, assets, activity. Command targets: `Contract`, immutable `ContractVersion`, `ContractSigner`, `Asset`, `ApprovalRequest`, `AuditEvent`. |
| Workflow States | `commercial.contract, approval.lifecycle` |
| Primary Actions | Edit; request approval; send; resend; cancel. Guarded workflow surface: Version/review/approve/send/view/sign/activate/void/terminate. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop document editor; mobile review/signature status. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: contract.edit; contract.send. Phase 2D authorization: Create/send R01/R02/R03/R15; signed version immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 056 — Screen 047: Signature Tracking

| Field | Frozen design contract |
|---|---|
| Design Number | 056 |
| Screen Number | 47 |
| Screen Name | Signature Tracking |
| Route | /app/commercial/contracts/[contractId]/signatures |
| User Type | Sales; Finance; Account Manager |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 46 Contract Detail |
| Main Purpose | Track signers, reminders and completion |
| Main Data | Reads: `ContractVersion`, `ContractSigner`, `SignatureEvent`, webhook status. Command targets: resend/void command, `Notification`, `AuditEvent`; provider events write `SignatureEvent`. |
| Workflow States | `commercial.contract, approval.lifecycle` |
| Primary Actions | Remind; resend; download signed copy. Guarded workflow surface: Version/review/approve/send/view/sign/activate/void/terminate. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Desktop timeline; mobile status cards. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: contract.view. Phase 2D authorization: Create/send R01/R02/R03/R15; signed version immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 057 — Screen 048: Invoices

| Field | Frozen design contract |
|---|---|
| Design Number | 057 |
| Screen Number | 48 |
| Screen Name | Invoices |
| Route | /app/commercial/invoices |
| User Type | Finance; Admin; Account Managers read |
| Design Family | **Anchor** — F22 FinanceWorkspace |
| Opens From | 36 Deal; 42 Client; 46 Contract |
| Main Purpose | Manage receivables across clients |
| Main Data | Reads: `Invoice`, derived balance, `ClientAccount`, `PaymentAllocation`. Command targets: `Invoice` draft/archive before issue. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Create; send; mark adjustment; filter overdue. Guarded workflow surface: Approve/send/open invoice; record/verify payment; retry/refund/void through finance command. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Desktop finance table; mobile cards. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: invoice.view scoped. Phase 2D authorization: Finance mutation R01/R02/R15; provider evidence append-only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 058 — Screen 049: Invoice Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 058 |
| Screen Number | 49 |
| Screen Name | Invoice Detail |
| Route | /app/commercial/invoices/[invoiceId] |
| User Type | Finance; Account Manager scoped |
| Design Family | **Variant** — F22 FinanceWorkspace |
| Opens From | 48 Invoices; 42 Client |
| Main Purpose | Manage one invoice and its lifecycle |
| Main Data | Reads: `Invoice`, `InvoiceLine`, `PaymentAllocation`, `Payment`, delivery events/assets. Command targets: `Invoice`, `InvoiceLine` before issue; issue/send commands, `LedgerTransaction`, `AuditEvent`. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Edit draft; send; record credit; resend link. Guarded workflow surface: Approve/send/open invoice; record/verify payment; retry/refund/void through finance command. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Desktop invoice + timeline; mobile summary/actions. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: invoice.edit; invoice.send. Phase 2D authorization: Finance mutation R01/R02/R15; provider evidence append-only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 059 — Screen 050: Payments

| Field | Frozen design contract |
|---|---|
| Design Number | 059 |
| Screen Number | 50 |
| Screen Name | Payments |
| Route | /app/commercial/payments |
| User Type | Finance; Admin |
| Design Family | **Variant** — F22 FinanceWorkspace |
| Opens From | 48/49 Invoices; Dashboard |
| Main Purpose | Track successful, partial, failed and refunded payments |
| Main Data | Reads: `Payment`, allocations, client/invoice, ledger projection. Command targets: controlled manual `Payment`/allocation under Finance authority. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Reconcile; filter; refund if permitted; open. Guarded workflow surface: Approve/send/open invoice; record/verify payment; retry/refund/void through finance command. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Desktop table; mobile transaction cards. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: payment.view. Phase 2D authorization: Finance mutation R01/R02/R15; provider evidence append-only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 060 — Screen 051: Payment Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 060 |
| Screen Number | 51 |
| Screen Name | Payment Detail |
| Route | /app/commercial/payments/[paymentId] |
| User Type | Finance; Admin |
| Design Family | **Variant** — F22 FinanceWorkspace |
| Opens From | 50 Payments; 49 Invoice |
| Main Purpose | Inspect payment evidence and reconciliation |
| Main Data | Reads: `Payment`, `PaymentAllocation`, `Refund`, `LedgerEntry`, `WebhookEvent`, invoice/client. Command targets: `Refund`, `PaymentAllocation`, `LedgerTransaction`, `AuditEvent`. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Refund; reconcile; download receipt. Guarded workflow surface: Approve/send/open invoice; record/verify payment; retry/refund/void through finance command. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Desktop details; mobile safe read/refund with confirmation. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: payment.view; payment.refund restricted. Phase 2D authorization: Finance mutation R01/R02/R15; provider evidence append-only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 4
#### Design 061 — Screen 041: Clients

| Field | Frozen design contract |
|---|---|
| Design Number | 061 |
| Screen Number | 41 |
| Screen Name | Clients |
| Route | /app/clients |
| User Type | Account Managers; Sales; Admin; Finance/Editorial scoped |
| Design Family | **Variant** — F10 EntityList |
| Opens From | Deal won; sidebar Clients |
| Main Purpose | Canonical client directory after deal conversion |
| Main Data | Reads: `ClientAccount`, `Organization`, relationships, projects, invoices/payments, health/renewal aggregates. Command targets: `ClientAccount`, assignment/health. |
| Workflow States | `client.onboarding, portal.invitation, project.lifecycle (summary)` |
| Primary Actions | Create/convert; assign AM; filter; open. Guarded workflow surface: Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table/cards; mobile client cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.view scoped. Phase 2D authorization: Own/assigned clients; portal provisioning R01/R02/R06/R16. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 062 — Screen 042: Client 360

| Field | Frozen design contract |
|---|---|
| Design Number | 062 |
| Screen Number | 42 |
| Screen Name | Client 360 |
| Route | /app/clients/[clientId] |
| User Type | Account Manager; Admin; scoped departments |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 41 Clients; 19 Company; 36 Won Deal |
| Main Purpose | Single source of truth for everything between the client and The Perspective |
| Main Data | Reads: `Organization`, `ClientAccount`, `ClientRelationship`, `Deal`, `Contract`, `Invoice`, `Payment`, `Project`, `Conversation`, `Meeting`, `Asset`, `ApprovalRequest`, `Report`, `RenewalOpportunity`, `ActivityEvent`. Command targets: `ClientAccount`, `ClientRelationship`, `Comment`, `Task`, `RecordAssignment`. |
| Workflow States | `client.onboarding, portal.invitation, project.lifecycle (summary)` |
| Primary Actions | Message; add project; invoice; view activity; assign team. Guarded workflow surface: Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop multi-tab 360; mobile summary/actions + tab drill-down. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.view scoped. Phase 2D authorization: Own/assigned clients; portal provisioning R01/R02/R06/R16. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 063 — Screen 043: Client Contacts

| Field | Frozen design contract |
|---|---|
| Design Number | 063 |
| Screen Number | 43 |
| Screen Name | Client Contacts |
| Route | /app/clients/[clientId]/contacts |
| User Type | Account Manager; Sales; Admin |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 42 Client 360 |
| Main Purpose | Manage all stakeholder contacts for one client |
| Main Data | Reads: `ClientRelationship`, `Person`, `Contact`, portal membership/preferences. Command targets: `Person`, `Contact`, `ClientRelationship`, communication preference. |
| Workflow States | `client.onboarding, portal.invitation, project.lifecycle (summary)` |
| Primary Actions | Add; set primary; invite to portal; remove access. Guarded workflow surface: Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop table; mobile list. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.contact.manage scoped. Phase 2D authorization: Own/assigned clients; portal provisioning R01/R02/R06/R16. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 064 — Screen 044: Client Portal Access

| Field | Frozen design contract |
|---|---|
| Design Number | 064 |
| Screen Number | 44 |
| Screen Name | Client Portal Access |
| Route | /app/clients/[clientId]/portal-access |
| User Type | Account Manager; Admin |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 42 Client 360; 43 Contacts |
| Main Purpose | Control which client users can access which projects and actions |
| Main Data | Reads: `OrganizationMembership`, `Invitation`, `ProjectMember`, `MembershipRole`, last session. Command targets: `Invitation`, `OrganizationMembership`, `MembershipRole`, `ProjectMember`, revoke `Session`, `AuditEvent`. |
| Workflow States | `client.onboarding, portal.invitation, project.lifecycle (summary)` |
| Primary Actions | Invite; revoke; resend; scope project access. Guarded workflow surface: Convert/link client; assign AM; invite/revoke portal; advance onboarding dependencies. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Desktop admin form; mobile safe status/quick revoke. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.portal.manage. Phase 2D authorization: Own/assigned clients; portal provisioning R01/R02/R06/R16. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 065 — Screen 052: Products & Packages

| Field | Frozen design contract |
|---|---|
| Design Number | 065 |
| Screen Number | 52 |
| Screen Name | Products & Packages |
| Route | /app/commercial/packages |
| User Type | Admin; Sales Managers; Finance |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Settings; proposal builder |
| Main Purpose | Central catalogue for Personal Magazine, article, podcast, video, event and bundles |
| Main Data | Reads: `Product`, `Package` versions. Command targets: `Product`, immutable/new `Package` version, archive status. |
| Workflow States | `package policy configuration` |
| Primary Actions | Create; edit; activate; archive; duplicate. Guarded workflow surface: Create/version/archive package and commercial/production gates. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop editor; mobile read-only/quick status. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: package.manage. Phase 2D authorization: Authorized Admin/Finance/Ops; no lifecycle status invented. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 5
#### Design 066 — Screen 053: Projects

| Field | Frozen design contract |
|---|---|
| Design Number | 066 |
| Screen Number | 53 |
| Screen Name | Projects |
| Route | /app/projects |
| User Type | Account Managers; Production teams; Admin |
| Design Family | **Anchor** — F23 ProjectWorkspace |
| Opens From | Client 360; deal won; sidebar Projects |
| Main Purpose | All delivery projects across products |
| Main Data | Reads: `Project`, `ClientAccount`, `WorkflowInstance`, `WorkflowStageRun`, `ProjectMember`, `Task`, health. Command targets: `Project`, assignment/archive. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Create; assign; filter; open; change health. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Desktop table/board; mobile cards. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: project.view scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 067 — Screen 054: Project Creation / Setup

| Field | Frozen design contract |
|---|---|
| Design Number | 067 |
| Screen Number | 54 |
| Screen Name | Project Creation / Setup |
| Route | /app/projects/new |
| User Type | Account Manager; Admin; authorized Ops |
| Design Family | **Variant** — F23 ProjectWorkspace |
| Opens From | Deal won; Client 360; Projects |
| Main Purpose | Create delivery project from sold package or custom scope |
| Main Data | Reads: `ClientAccount`, `Deal`, `Contract`, `Package`, `WorkflowTemplate`, staff capacity. Command targets: `Project`, `ProjectMember`, `WorkflowInstance`, initial stages/tasks/milestones, `ActivityEvent`. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Create project; choose workflow; assign team. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Desktop guided wizard; mobile not preferred, basic fallback. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: project.create. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 068 — Screen 055: Project Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 068 |
| Screen Number | 55 |
| Screen Name | Project Detail |
| Route | /app/projects/[projectId] |
| User Type | Assigned team; Account Manager; Admin |
| Design Family | **Variant** — F23 ProjectWorkspace |
| Opens From | 53 Projects; 42 Client |
| Main Purpose | Shared operational workspace for one client deliverable |
| Main Data | Reads: `Project`, client, members, workflow, milestones, deliverables, tasks, assets, approvals, activity. Command targets: `Project`, `ProjectMember`, `Milestone`, `Task`, `Comment`. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Advance stage; assign; message client; request asset/approval. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Desktop tabbed workspace; mobile summary + tasks/approvals. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: project.view scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 069 — Screen 056: Project Workflow Board

| Field | Frozen design contract |
|---|---|
| Design Number | 069 |
| Screen Number | 56 |
| Screen Name | Project Workflow Board |
| Route | /app/projects/[projectId]/workflow |
| User Type | Assigned team; managers |
| Design Family | **Anchor** — F24 WorkflowBoard |
| Opens From | 55 Project Detail |
| Main Purpose | Visual state machine for project delivery |
| Main Data | Reads: `WorkflowInstance`, stage templates/runs, transition rules, tasks, blockers, automations. Command targets: `StageTransition`, `WorkflowStageRun`, generated `Task`, `AutomationRun`, `AuditEvent` when override. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Move stage; block/unblock; reassign; set due date. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop board/timeline; mobile vertical stage list. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: workflow.move scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 070 — Screen 057: Project Timeline / Activity

| Field | Frozen design contract |
|---|---|
| Design Number | 070 |
| Screen Number | 57 |
| Screen Name | Project Timeline / Activity |
| Route | /app/projects/[projectId]/activity |
| User Type | Assigned team; Account Manager; Admin |
| Design Family | **Variant** — F23 ProjectWorkspace |
| Opens From | 55 Project Detail |
| Main Purpose | Chronological truth of every client/internal action |
| Main Data | Reads: `ActivityEvent` and linked `Resource`. Command targets: visibility correction only under authority; no event overwrite. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Filter; add note; open source record. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Responsive activity feed. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: project.activity.view scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 071 — Screen 058: Project Tasks

| Field | Frozen design contract |
|---|---|
| Design Number | 071 |
| Screen Number | 58 |
| Screen Name | Project Tasks |
| Route | /app/projects/[projectId]/tasks |
| User Type | Assigned team; managers |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 55 Project Detail |
| Main Purpose | Project-scoped work management |
| Main Data | Reads: `Task`, dependency/checklist, assignee, stage/project. Command targets: `Task`, `TaskDependency`, checklist item, comment. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Create; assign; complete; block. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop table/board; mobile checklist/cards. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: task.view scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 072 — Screen 059: Project Files

| Field | Frozen design contract |
|---|---|
| Design Number | 072 |
| Screen Number | 59 |
| Screen Name | Project Files |
| Route | /app/projects/[projectId]/files |
| User Type | Assigned team; Account Manager; client-facing roles |
| Design Family | **Anchor** — F31 AssetLibrary |
| Opens From | 55 Project Detail |
| Main Purpose | Central project file library with versions |
| Main Data | Reads: `Folder`, `Asset`, `AssetVersion`, rights, links/usages, approvals. Command targets: `Folder`, `Asset`, immutable `AssetVersion`, `AssetRights`, `AssetLink`. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Upload; version; share with client; request approval. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Folder tree, search, grid/list, metadata, versions |
| Desktop Layout | Three-pane library. Route note: Desktop file grid/list; mobile upload/view. |
| Tablet Layout | Two-pane library; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grid plus metadata sheet; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No assets; upload/request CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: file.view scoped. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 073 — Screen 060: Workflow Template Library

| Field | Frozen design contract |
|---|---|
| Design Number | 073 |
| Screen Number | 60 |
| Screen Name | Workflow Template Library |
| Route | /app/workflows |
| User Type | Admin; Ops; Department Heads |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | Settings; project creation |
| Main Purpose | Configure reusable workflows for each product type |
| Main Data | Reads: `WorkflowTemplate`, stage templates, transition rules, automation rules. Command targets: new template version, stages/rules/automations; archive prior version. |
| Workflow States | `project.lifecycle, workflow.instance, stage.run, task.lifecycle` |
| Primary Actions | Create; clone; edit; publish template. Guarded workflow surface: Create/plan/activate; advance/reopen/block/skip stage; assign/complete task. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop builder; mobile view-only. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: workflow.template.manage. Phase 2D authorization: Project/team scope; skips and reopen require policy/reason. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 074 — Screen 107: Approval Center

| Field | Frozen design contract |
|---|---|
| Design Number | 074 |
| Screen Number | 107 |
| Screen Name | Approval Center |
| Route | /app/approvals |
| User Type | All approvers; requesters read |
| Design Family | **Anchor** — F29 ApprovalCenter |
| Opens From | My Work; project/studio screens |
| Main Purpose | Central queue for proposal, contract, editorial, cover, design, audio, video and publication decisions |
| Main Data | Reads: `ApprovalRequest`, step, exact target resource/version, project/client/requester/assignee. Command targets: assignment/reminder only. |
| Workflow States | `approval.lifecycle` |
| Primary Actions | Approve; request changes; delegate if allowed. Guarded workflow surface: Request/open/approve/request changes/reject/cancel/supersede. |
| Reused Components | Team/Client shell as applicable; Approval queue, artifact preview, diff, policy, decision record |
| Desktop Layout | Queue plus decision preview. Route note: Excellent mobile quick-approval feed; desktop adds preview/context. |
| Tablet Layout | Queue/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | One approval; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending approvals; history and policy context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: approval.view scoped. Phase 2D authorization: Assigned approver + scope + SoD; immutable decision. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 075 — Screen 108: Approval Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 075 |
| Screen Number | 108 |
| Screen Name | Approval Detail |
| Route | /app/approvals/[approvalId] |
| User Type | Assigned approver; requester; managers |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 107 Approval Center |
| Main Purpose | Decision workspace with immutable decision history |
| Main Data | Reads: request/policy/steps/decisions, exact target/version, comments/prior versions. Command targets: immutable `ApprovalDecision`/`ApprovalOverride`, `Comment`, `AuditEvent`. |
| Workflow States | `approval.lifecycle` |
| Primary Actions | Approve; approve with changes; reject; comment. Guarded workflow surface: Request/open/approve/request changes/reject/cancel/supersede. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Responsive preview; mobile approve/comment. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: approval.decide scoped. Phase 2D authorization: Assigned approver + scope + SoD; immutable decision. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 076 — Screen 109: Tasks

| Field | Frozen design contract |
|---|---|
| Design Number | 076 |
| Screen Number | 109 |
| Screen Name | Tasks |
| Route | /app/tasks |
| User Type | All staff |
| Design Family | **Anchor** — F30 TaskBoard |
| Opens From | Sidebar Tasks; My Work; projects |
| Main Purpose | Cross-project personal/team task inventory |
| Main Data | Reads: `Task`, dependency/checklist, project/client/stage, assignment. Command targets: `Task`, `TaskDependency`, bulk assignment/status. |
| Workflow States | `task.lifecycle` |
| Primary Actions | Create; assign; complete; filter. Guarded workflow surface: Create/assign/start/block/review/complete/reopen/cancel. |
| Reused Components | Team/Client shell as applicable; Board/list, owner, due/SLA, dependencies, detail drawer |
| Desktop Layout | Task board plus drawer. Route note: Desktop list/board; mobile checklist/cards. |
| Tablet Layout | Compact list; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grouped task cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No tasks; create/import if eligible. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: task.view scoped. Phase 2D authorization: Assignment/manager scope. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 077 — Screen 110: Task Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 077 |
| Screen Number | 110 |
| Screen Name | Task Detail |
| Route | /app/tasks/[taskId] |
| User Type | Assignee; manager; collaborators |
| Design Family | **Variant** — F30 TaskBoard |
| Opens From | 109 Tasks; 58 Project Tasks |
| Main Purpose | Complete one task with context, subtasks and activity |
| Main Data | Reads: task/checklist/dependencies, comments/files, linked resources, history. Command targets: `Task`, checklist, dependency, `Comment`, `AssetLink`. |
| Workflow States | `task.lifecycle` |
| Primary Actions | Complete; reassign; change due; comment. Guarded workflow surface: Create/assign/start/block/review/complete/reopen/cancel. |
| Reused Components | Team/Client shell as applicable; Board/list, owner, due/SLA, dependencies, detail drawer |
| Desktop Layout | Task board plus drawer. Route note: Mobile-first task detail works fully. |
| Tablet Layout | Compact list; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grouped task cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No tasks; create/import if eligible. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: task.edit scoped. Phase 2D authorization: Assignment/manager scope. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 078 — Screen 111: Calendar

| Field | Frozen design contract |
|---|---|
| Design Number | 078 |
| Screen Number | 111 |
| Screen Name | Calendar |
| Route | /app/calendar |
| User Type | All staff |
| Design Family | **Variant** — F19 CalendarAgenda |
| Opens From | Sidebar Calendar; My Work |
| Main Purpose | Unified dates for sales, production, editorial, payments and renewals |
| Main Data | Reads: `CalendarItem`, `Meeting`, recording/shoot, task deadlines, publications, events, renewals. Command targets: `CalendarItem`, linked `Meeting`/schedule under source authority. |
| Workflow States | `meeting, task, project, event, recording, shoot, publication schedule projections` |
| Primary Actions | Create event; filter; open item. Guarded workflow surface: Create/open/reschedule through owning aggregate. |
| Reused Components | Team/Client shell as applicable; Calendar, agenda, filters, event drawer |
| Desktop Layout | Calendar plus agenda. Route note: Desktop month/week; mobile agenda/day. |
| Tablet Layout | Calendar/agenda toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Agenda-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No scheduled items; create/browse next action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: calendar.view scoped. Phase 2D authorization: Calendar is projection, not state authority. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 079 — Screen 112: Files & Assets

| Field | Frozen design contract |
|---|---|
| Design Number | 079 |
| Screen Number | 112 |
| Screen Name | Files & Assets |
| Route | /app/files |
| User Type | All staff scoped |
| Design Family | **Variant** — F31 AssetLibrary |
| Opens From | Sidebar Files; projects/clients |
| Main Purpose | Searchable cross-project asset library |
| Main Data | Reads: `Folder`, `Asset`, versions/rights/links/usages, client/project/uploader. Command targets: `Folder`, `Asset`, `AssetVersion`, `AssetRights`, archive/export audit. |
| Workflow States | `asset.lifecycle, asset.rights, approval.lifecycle` |
| Primary Actions | Upload; filter; move; share internally/client. Guarded workflow surface: Upload/process/review/approve/reject/replace/archive; request approval. |
| Reused Components | Team/Client shell as applicable; Folder tree, search, grid/list, metadata, versions |
| Desktop Layout | Three-pane library. Route note: Desktop grid/list; mobile upload/search. |
| Tablet Layout | Two-pane library; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grid plus metadata sheet; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No assets; upload/request CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: file.view scoped. Phase 2D authorization: Version and rights history immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 080 — Screen 113: File Detail / Versions

| Field | Frozen design contract |
|---|---|
| Design Number | 080 |
| Screen Number | 113 |
| Screen Name | File Detail / Versions |
| Route | /app/files/[fileId] |
| User Type | Authorized staff |
| Design Family | **Variant** — F31 AssetLibrary |
| Opens From | 112 Files; project files |
| Main Purpose | Version, rights and usage control for one asset |
| Main Data | Reads: asset metadata, versions/renditions/rights/usages/comments/approvals. Command targets: new `AssetVersion`, rights, rendition request, comment, archive. |
| Workflow States | `asset.lifecycle, asset.rights, approval.lifecycle` |
| Primary Actions | Upload version; download; change metadata; request approval. Guarded workflow surface: Upload/process/review/approve/reject/replace/archive; request approval. |
| Reused Components | Team/Client shell as applicable; Folder tree, search, grid/list, metadata, versions |
| Desktop Layout | Three-pane library. Route note: Responsive preview; mobile metadata/actions. |
| Tablet Layout | Two-pane library; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grid plus metadata sheet; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No assets; upload/request CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: file.view; file.version scoped. Phase 2D authorization: Version and rights history immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 6
#### Design 081 — Screen 062: Editorial Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 081 |
| Screen Number | 62 |
| Screen Name | Editorial Pipeline |
| Route | /app/editorial/pipeline |
| User Type | Editors; Writers; Account Managers |
| Design Family | **Variant** — F12 PipelineBoard |
| Opens From | 61 Dashboard |
| Main Purpose | Cross-project kanban from brief to published |
| Main Data | Reads: `EditorialWork`, `Deliverable`, `WorkflowStageRun`, owner, client, task/blocker. Command targets: `RecordAssignment`, valid workflow transition. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Move allowed stage; assign; filter. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Kanban/list toggle, stage totals, cards, filters, move guard |
| Desktop Layout | Full stage board. Route note: Desktop kanban; mobile stage groups. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pipeline records; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: editorial.view scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 082 — Screen 063: Questionnaires

| Field | Frozen design contract |
|---|---|
| Design Number | 082 |
| Screen Number | 63 |
| Screen Name | Questionnaires |
| Route | /app/editorial/questionnaires |
| User Type | Editors; Account Managers; Writers read |
| Design Family | **Anchor** — F25 EditorialEditor |
| Opens From | 61 Dashboard; project workflow |
| Main Purpose | Manage interview questionnaires and response status |
| Main Data | Reads: `QuestionnaireInstance`, template, project/client, submission state. Command targets: `QuestionnaireInstance`, send/remind/cancel, `Notification`. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Create; send; remind; open responses. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Outline, editor, sources, comments, versions |
| Desktop Layout | Editor plus context rails. Route note: Desktop table; mobile cards. |
| Tablet Layout | Context drawers; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Focused editor; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No draft/research; create from approved source. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: questionnaire.view scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 083 — Screen 064: Questionnaire Builder & Responses

| Field | Frozen design contract |
|---|---|
| Design Number | 083 |
| Screen Number | 64 |
| Screen Name | Questionnaire Builder & Responses |
| Route | /app/editorial/questionnaires/[questionnaireId] |
| User Type | Editors; Account Managers; assigned Writer |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 63 Questionnaires; Project Detail |
| Main Purpose | Build questions and consume client answers without altering originals |
| Main Data | Reads: template/schema, instance, draft response, submissions, attachments. Command targets: new `QuestionnaireTemplate` version, instance, response; never overwrite submission. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Edit questions; send; lock; export to draft brief. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop split builder/responses; mobile response review. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: questionnaire.edit scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 084 — Screen 065: Drafts

| Field | Frozen design contract |
|---|---|
| Design Number | 084 |
| Screen Number | 65 |
| Screen Name | Drafts |
| Route | /app/editorial/drafts |
| User Type | Writers; Editors; Account Managers read |
| Design Family | **Variant** — F25 EditorialEditor |
| Opens From | 61 Dashboard; project |
| Main Purpose | Inventory of article/blog/interview drafts |
| Main Data | Reads: `Draft`, current version, `EditorialWork`, project, owner, review state. Command targets: `Draft`, assignment/archive. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Create/open; filter; assign reviewer. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Outline, editor, sources, comments, versions |
| Desktop Layout | Editor plus context rails. Route note: Desktop table; mobile cards. |
| Tablet Layout | Context drawers; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Focused editor; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No draft/research; create from approved source. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: draft.view scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 085 — Screen 066: Draft Workspace

| Field | Frozen design contract |
|---|---|
| Design Number | 085 |
| Screen Number | 66 |
| Screen Name | Draft Workspace |
| Route | /app/editorial/drafts/[draftId] |
| User Type | Assigned Writer; Editors |
| Design Family | **Variant** — F20 DocumentBuilder |
| Opens From | 65 Drafts; 64 Questionnaire |
| Main Purpose | Write and version editorial copy using source questionnaire/research |
| Main Data | Reads: `Draft`, versions, research, citations, comments, assets, reviews. Command targets: immutable `DraftVersion`, `ResearchItem`, `Citation`, `Comment`, current draft pointer. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Write; save version; submit review; compare versions. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop writing workspace; mobile read/comment only. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: draft.edit scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 086 — Screen 067: Internal Editorial Review

| Field | Frozen design contract |
|---|---|
| Design Number | 086 |
| Screen Number | 67 |
| Screen Name | Internal Editorial Review |
| Route | /app/editorial/reviews/[reviewId] |
| User Type | Editors; Editor-in-Chief |
| Design Family | **Variant** — F14 ReviewQueue |
| Opens From | 66 Draft Workspace; 68 Approval Queue |
| Main Purpose | Quality gate before anything is shown to client |
| Main Data | Reads: exact `DraftVersion`, citations, checklist, comments, prior review. Command targets: `EditorialReview`, `Comment`, `ApprovalDecision`, revision request, `AuditEvent`. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Approve internally; request changes; assign fact-check. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Review queue, preview/diff, issues, accept/reject/assign |
| Desktop Layout | Queue plus review pane. Route note: Desktop compare/comment layout; mobile approve/comment. |
| Tablet Layout | Preview overlay; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending reviews; completed/retry context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: editorial.review. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 087 — Screen 068: Editorial Approval Queue

| Field | Frozen design contract |
|---|---|
| Design Number | 087 |
| Screen Number | 68 |
| Screen Name | Editorial Approval Queue |
| Route | /app/editorial/approvals |
| User Type | Editors; Account Managers; Managers |
| Design Family | **Variant** — F29 ApprovalCenter |
| Opens From | 61 Dashboard; workflow |
| Main Purpose | All editorial items waiting for internal/client decision |
| Main Data | Reads: `ApprovalRequest`, steps, exact target versions, project/client/due state. Command targets: `ApprovalDecision`, assignment, reminder; override only authorized. |
| Workflow States | `editorial.production, questionnaire.lifecycle, draft.review, approval.lifecycle` |
| Primary Actions | Approve; request changes; remind client. Guarded workflow surface: Advance editorial stages; send questionnaire; version/revise draft; request/decide review. |
| Reused Components | Team/Client shell as applicable; Approval queue, artifact preview, diff, policy, decision record |
| Desktop Layout | Queue plus decision preview. Route note: Desktop queue; mobile action cards. |
| Tablet Layout | Queue/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | One approval; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending approvals; history and policy context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: approval.view scoped. Phase 2D authorization: Writer cannot self-publish; Editor/EIC approval separation. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 088 — Screen 070: Magazine Projects / Issues

| Field | Frozen design contract |
|---|---|
| Design Number | 088 |
| Screen Number | 70 |
| Screen Name | Magazine Projects / Issues |
| Route | /app/magazine/projects |
| User Type | Magazine team; Account Managers |
| Design Family | **Anchor** — F26 MagazineProductionWorkspace |
| Opens From | 69 Dashboard; Projects |
| Main Purpose | List of all magazine/personal magazine production projects |
| Main Data | Reads: `MagazinePublication`, `MagazineIssue`, `Project`, page/cover/proof state. Command targets: `MagazineIssue`, assignment/archive. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Create/open; filter; assign. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Spread canvas, thumbnails, assets, comments, versions |
| Desktop Layout | Canvas plus dual rails. Route note: Desktop cover/table hybrid; mobile cards. |
| Tablet Layout | Overlay rails; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Page sequence; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pages/concepts; create/import first artifact. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: magazine.view scoped. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 089 — Screen 071: Cover Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 089 |
| Screen Number | 71 |
| Screen Name | Cover Pipeline |
| Route | /app/magazine/covers |
| User Type | Designers; Editors; Account Managers |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 69 Dashboard; 70 Projects |
| Main Purpose | Track cover concept/request/review/approval states |
| Main Data | Reads: `CoverConcept`, `DesignVersion`, issue/project, designer, approvals/comments. Command targets: `CoverConcept`, assignment/status. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Assign; open concept; request approval. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop kanban/gallery; mobile cards. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: design.cover.view scoped. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 090 — Screen 072: Cover Workspace

| Field | Frozen design contract |
|---|---|
| Design Number | 090 |
| Screen Number | 72 |
| Screen Name | Cover Workspace |
| Route | /app/magazine/covers/[coverId] |
| User Type | Designer; Editor; Account Manager |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 71 Cover Pipeline |
| Main Purpose | Versioned cover review with client/internal comments |
| Main Data | Reads: concept, immutable design versions, source assets/rights, comments, approvals. Command targets: `DesignVersion`, `AssetLink`, `Comment`, `ApprovalRequest`. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Upload version; compare; comment; request approval. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Desktop visual compare; mobile review/comment. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: design.cover.edit scoped. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 091 — Screen 073: Magazine Page Design Workspace

| Field | Frozen design contract |
|---|---|
| Design Number | 091 |
| Screen Number | 73 |
| Screen Name | Magazine Page Design Workspace |
| Route | /app/magazine/projects/[projectId]/layout |
| User Type | Designers; Editors |
| Design Family | **Variant** — F20 DocumentBuilder |
| Opens From | 70 Project; approved editorial |
| Main Purpose | Manage page/section design production and status |
| Main Data | Reads: `MagazineIssue`, pages, issue stories, design versions, assets/rights, assignments. Command targets: `MagazinePage`, immutable `DesignVersion`, `IssueStory`, `AssetLink`. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Assign pages; mark ready; upload proof; lock section. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop production board; mobile status only. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: design.layout.manage. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 092 — Screen 074: Magazine Proofing & Final Review

| Field | Frozen design contract |
|---|---|
| Design Number | 092 |
| Screen Number | 74 |
| Screen Name | Magazine Proofing & Final Review |
| Route | /app/magazine/projects/[projectId]/proof |
| User Type | Editors; Designers; Account Manager |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 73 Layout; workflow |
| Main Purpose | Final proof, corrections, sign-off and export readiness |
| Main Data | Reads: exact `Proof`, included design/content versions, annotations/comments, approvals. Command targets: immutable `Proof`, `Comment`, `ApprovalRequest`, decisions. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Annotate; resolve; approve final proof. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Desktop proof viewer; mobile comment/approve. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: magazine.proof.review. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 093 — Screen 075: Digital Reader Build & Preview

| Field | Frozen design contract |
|---|---|
| Design Number | 093 |
| Screen Number | 75 |
| Screen Name | Digital Reader Build & Preview |
| Route | /app/magazine/projects/[projectId]/reader-build |
| User Type | Magazine Digital Team; Editors |
| Design Family | **Variant** — F20 DocumentBuilder |
| Opens From | 74 Proofing |
| Main Purpose | Prepare structured reader content and preview before publication |
| Main Data | Reads: issue/pages, approved versions, text views, assets/rights, navigation, validation. Command targets: immutable `ReaderBuild`, publication candidate/validation job. |
| Workflow States | `magazine.production, approval.lifecycle, asset.lifecycle, publication.lifecycle` |
| Primary Actions | Validate; preview; fix links; mark ready. Guarded workflow surface: Advance cover/layout/proof/reader stages; version/approve assets and designs; prepare publication. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop build/preview; mobile preview validation. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: magazine.reader.publish. Phase 2D authorization: Designer cannot self-approve; client review explicit. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 7
#### Design 094 — Screen 077: Podcast Guest Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 094 |
| Screen Number | 77 |
| Screen Name | Podcast Guest Pipeline |
| Route | /app/podcasts/guests |
| User Type | Podcast Producer; Sales/AM scoped |
| Design Family | **Variant** — F12 PipelineBoard |
| Opens From | 76 Dashboard; Client/Lead |
| Main Purpose | Track invited, interested, confirmed and completed guests |
| Main Data | Reads: `PodcastGuest`, `Person`, `Contact`, `Company`, episode/project, conversations/meetings. Command targets: `PodcastGuest`, invitation `Message`, `Meeting`, task/assignment. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Invite; confirm; request bio; schedule. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; Kanban/list toggle, stage totals, cards, filters, move guard |
| Desktop Layout | Full stage board. Route note: Desktop kanban; mobile cards. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pipeline records; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.guest.manage. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 095 — Screen 078: Podcast Episodes

| Field | Frozen design contract |
|---|---|
| Design Number | 095 |
| Screen Number | 78 |
| Screen Name | Podcast Episodes |
| Route | /app/podcasts/episodes |
| User Type | Podcast Team; Editors |
| Design Family | **Anchor** — F27 MediaProductionWorkspace |
| Opens From | 76 Dashboard |
| Main Purpose | All episodes regardless of production stage |
| Main Data | Reads: `PodcastShow`, `PodcastEpisode`, guest/producer, workflow and dates. Command targets: `PodcastEpisode`, assignment/archive. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Create; open; filter; schedule. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Desktop table/cards; mobile list. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.episode.view scoped. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 096 — Screen 079: Podcast Episode Production

| Field | Frozen design contract |
|---|---|
| Design Number | 096 |
| Screen Number | 79 |
| Screen Name | Podcast Episode Production |
| Route | /app/podcasts/episodes/[episodeId] |
| User Type | Assigned Podcast Team; AM |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | 78 Episodes; 77 Guest |
| Main Purpose | One episode workspace from brief through publication |
| Main Data | Reads: episode/show, guest, project/workflow, brief, assets, recording, audio/transcript/artwork, approvals/publication. Command targets: `PodcastEpisode`, `Task`, `AssetLink`, `RecordingSession`, approval/publication request. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Request assets; schedule; upload edit; request approval; publish-ready. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Desktop tabbed production workspace; mobile tasks/approvals. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.episode.edit scoped. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 097 — Screen 080: Podcast Recording Schedule

| Field | Frozen design contract |
|---|---|
| Design Number | 097 |
| Screen Number | 80 |
| Screen Name | Podcast Recording Schedule |
| Route | /app/podcasts/recordings |
| User Type | Podcast Team; AM read |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | 76/79 Podcast |
| Main Purpose | Recording calendar and technical readiness |
| Main Data | Reads: `RecordingSession`, episode/guest/producer, calendar/meeting, checklist. Command targets: `RecordingSession`, `Meeting`, `CalendarItem`, `Task`. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Schedule; reschedule; join; mark recorded. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Desktop calendar; mobile agenda. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.schedule.manage. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 098 — Screen 081: Podcast Audio Review

| Field | Frozen design contract |
|---|---|
| Design Number | 098 |
| Screen Number | 81 |
| Screen Name | Podcast Audio Review |
| Route | /app/podcasts/episodes/[episodeId]/review |
| User Type | Podcast Editor; Producer; AM; authorized client-review coordinator |
| Design Family | **Variant** — F14 ReviewQueue |
| Opens From | 79 Production |
| Main Purpose | Review edit versions, time-coded comments and approval status |
| Main Data | Reads: exact `AudioVersion`, waveform asset, transcript, comments, approval request. Command targets: immutable `AudioVersion`/`TranscriptVersion`, `Comment`, `ApprovalDecision`. |
| Workflow States | `podcast.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Play; comment at time; upload revision; approve. Guarded workflow surface: Invite/onboard/schedule/record/edit/review/approve guest episode. |
| Reused Components | Team/Client shell as applicable; Review queue, preview/diff, issues, accept/reject/assign |
| Desktop Layout | Queue plus review pane. Route note: Responsive audio review; mobile time-coded comments supported. |
| Tablet Layout | Preview overlay; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending reviews; completed/retry context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: podcast.review scoped. Phase 2D authorization: Producer assignment; guest/client sees shared versions only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 099 — Screen 083: Video Projects

| Field | Frozen design contract |
|---|---|
| Design Number | 099 |
| Screen Number | 83 |
| Screen Name | Video Projects |
| Route | /app/videos/projects |
| User Type | Video Team; AM |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | 82 Dashboard |
| Main Purpose | All video deliverables |
| Main Data | Reads: `VideoProject`, client/project, speaker, stage/owner/dates. Command targets: `VideoProject`, assignment/archive. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Create; open; filter; assign. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Desktop table/cards; mobile list. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.view scoped. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 100 — Screen 084: Video Production Workspace

| Field | Frozen design contract |
|---|---|
| Design Number | 100 |
| Screen Number | 84 |
| Screen Name | Video Production Workspace |
| Route | /app/videos/projects/[videoId] |
| User Type | Assigned Video Team; AM |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 83 Projects |
| Main Purpose | Manage brief, script, shoot, edit, client review and publish prep |
| Main Data | Reads: video project, script versions, speakers, shoots, footage/assets, video/thumbnail/caption versions, approvals. Command targets: `VideoProject`, `ScriptVersion`, `Shoot`, `AssetLink`, `Task`, approval request. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Edit brief; schedule; upload cut; request approval; mark ready. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop production tabs; mobile tasks/review. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.edit scoped. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 101 — Screen 085: Video Shoot Schedule

| Field | Frozen design contract |
|---|---|
| Design Number | 101 |
| Screen Number | 85 |
| Screen Name | Video Shoot Schedule |
| Route | /app/videos/shoots |
| User Type | Video Team; AM read |
| Design Family | **Variant** — F19 CalendarAgenda |
| Opens From | 82/84 Video |
| Main Purpose | Coordinate studio/remote shoots and logistics |
| Main Data | Reads: `Shoot`, video/speakers/crew, calendar/meeting, equipment tasks. Command targets: `Shoot`, `Meeting`, `CalendarItem`, `Task`. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Schedule; reschedule; assign crew; mark completed. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; Calendar, agenda, filters, event drawer |
| Desktop Layout | Calendar plus agenda. Route note: Desktop calendar; mobile agenda/checklist. |
| Tablet Layout | Calendar/agenda toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Agenda-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No scheduled items; create/browse next action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.schedule.manage. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 102 — Screen 086: Video Review

| Field | Frozen design contract |
|---|---|
| Design Number | 102 |
| Screen Number | 86 |
| Screen Name | Video Review |
| Route | /app/videos/projects/[videoId]/review |
| User Type | Video Editor; Producer; AM |
| Design Family | **Variant** — F14 ReviewQueue |
| Opens From | 84 Production |
| Main Purpose | Versioned video review with time-coded feedback |
| Main Data | Reads: exact `VideoVersion`, transcript/captions, comments, approval. Command targets: immutable `VideoVersion`/`Caption`, `Comment`, `ApprovalDecision`. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Play; annotate; upload revision; approve. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; Review queue, preview/diff, issues, accept/reject/assign |
| Desktop Layout | Queue plus review pane. Route note: Responsive 16:9 player; mobile review supported. |
| Tablet Layout | Preview overlay; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending reviews; completed/retry context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.review scoped. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 103 — Screen 087: Video Publish Prep

| Field | Frozen design contract |
|---|---|
| Design Number | 103 |
| Screen Number | 87 |
| Screen Name | Video Publish Prep |
| Route | /app/videos/projects/[videoId]/publish-prep |
| User Type | Video Team; Marketing/Publishing |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | 84/86 Video |
| Main Purpose | Finalize title, description, thumbnail, captions and destinations |
| Main Data | Reads: approved final video, thumbnail, captions, metadata, assets/rights, target validation. Command targets: `ThumbnailVersion`, `Caption`, `Publication`, immutable `PublicationVersion`, validation job. |
| Workflow States | `video.production, meeting.lifecycle, asset.lifecycle, approval.lifecycle` |
| Primary Actions | Validate; schedule; send to publishing. Guarded workflow surface: Brief/script/schedule shoot/edit/review/approve/prepare metadata. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Desktop checklist/editor; mobile review only. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: video.publish.prepare. Phase 2D authorization: Producer assignment; exact approved media version. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 104 — Screen 089: Events

| Field | Frozen design contract |
|---|---|
| Design Number | 104 |
| Screen Number | 89 |
| Screen Name | Events |
| Route | /app/events/list |
| User Type | Events Team; Sales/AM scoped |
| Design Family | **Anchor** — F28 EventWorkspace |
| Opens From | 88 Dashboard |
| Main Purpose | All planned/live/past events |
| Main Data | Reads: `Event`, venue, owner, registrations, partners, publication. Command targets: `Event`, assignment/archive. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Create; open; filter; duplicate. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; Event header, schedule, speakers, registrations, deliverables |
| Desktop Layout | Multi-panel event workspace. Route note: Desktop table/calendar; mobile list. |
| Tablet Layout | Tabbed event view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Schedule-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No agenda/participants; add first item. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.view scoped. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 105 — Screen 090: Event Operations Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 105 |
| Screen Number | 90 |
| Screen Name | Event Operations Detail |
| Route | /app/events/[eventId] |
| User Type | Events Team; assigned departments |
| Design Family | **Variant** — F28 EventWorkspace |
| Opens From | 89 Events |
| Main Purpose | One event command center across content, speakers, partners and delivery |
| Main Data | Reads: `Event`, days, venue, agenda, speakers, partners, registrations, tasks, assets, project. Command targets: `Event`, `Venue`, `EventDay`, `Task`, `AssetLink`, comment. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Update; assign; message speaker; publish agenda. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; Event header, schedule, speakers, registrations, deliverables |
| Desktop Layout | Multi-panel event workspace. Route note: Desktop multi-tab; mobile event-day summary. |
| Tablet Layout | Tabbed event view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Schedule-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No agenda/participants; add first item. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.manage scoped. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 106 — Screen 091: Speaker / Partner Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 106 |
| Screen Number | 91 |
| Screen Name | Speaker / Partner Pipeline |
| Route | /app/events/[eventId]/participants |
| User Type | Events; Sales; AM |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 90 Event Detail |
| Main Purpose | Track invited speakers, partners and sponsors through confirmation |
| Main Data | Reads: `Speaker`, `EventPartner`, people/companies, deals/packages, agreements/assets. Command targets: `Speaker`, `EventPartner`, message/meeting/task, agreement link. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Invite; confirm; request assets; assign session. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop kanban; mobile cards. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.participant.manage. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 107 — Screen 092: Agenda Builder

| Field | Frozen design contract |
|---|---|
| Design Number | 107 |
| Screen Number | 92 |
| Screen Name | Agenda Builder |
| Route | /app/events/[eventId]/agenda |
| User Type | Events; Editorial |
| Design Family | **Variant** — F19 CalendarAgenda |
| Opens From | 90 Event Detail |
| Main Purpose | Build sessions, timing, rooms and speakers |
| Main Data | Reads: `EventDay`, `AgendaItem`, participants, speakers, rooms, publication state. Command targets: `AgendaItem`, `AgendaParticipant`, schedule conflict override audit. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Add session; reorder; assign speaker; publish agenda. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; Calendar, agenda, filters, event drawer |
| Desktop Layout | Calendar plus agenda. Route note: Desktop drag builder; mobile view/edit basics. |
| Tablet Layout | Calendar/agenda toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Agenda-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No scheduled items; create/browse next action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.agenda.manage. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 108 — Screen 093: Event Registrations

| Field | Frozen design contract |
|---|---|
| Design Number | 108 |
| Screen Number | 93 |
| Screen Name | Event Registrations |
| Route | /app/events/[eventId]/registrations |
| User Type | Events; Support; Finance scoped |
| Design Family | **Variant** — F28 EventWorkspace |
| Opens From | 90 Event Detail |
| Main Purpose | Manage attendee registrations, ticket status and check-in |
| Main Data | Reads: `Registration`, `Ticket`, `CheckIn`, person/user, payment allocation, consent. Command targets: `Registration`, `Ticket`, `CheckIn`, refund/payment-link command, notification. |
| Workflow States | `event.lifecycle, event.speaker, event.registration, project.lifecycle` |
| Primary Actions | Search; resend ticket; check in; export if permitted. Guarded workflow surface: Plan event; progress speakers/agenda; open registration; check in/complete. |
| Reused Components | Team/Client shell as applicable; Event header, schedule, speakers, registrations, deliverables |
| Desktop Layout | Multi-panel event workspace. Route note: Desktop table; mobile check-in optimized. |
| Tablet Layout | Tabbed event view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Schedule-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No agenda/participants; add first item. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: event.registration.manage. Phase 2D authorization: Events scope; cancellations/refunds via governed commands. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 8
#### Design 109 — Screen 095: Publication Queue

| Field | Frozen design contract |
|---|---|
| Design Number | 109 |
| Screen Number | 95 |
| Screen Name | Publication Queue |
| Route | /app/publishing/queue |
| User Type | Publishing; Editors |
| Design Family | **Anchor** — F32 PublishingQueue |
| Opens From | 94 Dashboard; studios |
| Main Purpose | Central controlled queue before content reaches public channels |
| Main Data | Reads: publication candidate, approved deliverable version, target, blockers, schedule, approver. Command targets: `Publication`, `PublicationVersion`, `Schedule`, queue assignment. |
| Workflow States | `publication.lifecycle, publication.job, approval.lifecycle` |
| Primary Actions | Validate; schedule; publish; return for fixes. Guarded workflow surface: Validate/approve/schedule/publish/retry/unpublish/correct. |
| Reused Components | Team/Client shell as applicable; Target readiness, schedule, validation, status, published URL |
| Desktop Layout | Queue plus readiness inspector. Route note: Desktop queue; mobile action cards. |
| Tablet Layout | Readiness drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Release cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No publication candidates; show approval prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: publish.queue.view. Phase 2D authorization: Publish R01/R02/R07/R14; approved manifest required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 110 — Screen 096: Publication Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 110 |
| Screen Number | 96 |
| Screen Name | Publication Detail |
| Route | /app/publishing/[publicationId] |
| User Type | Publishing; Editors; authorized Producers |
| Design Family | **Variant** — F24 WorkflowBoard |
| Opens From | 95 Queue |
| Main Purpose | Final metadata, canonical URL and channel validation for one publication |
| Main Data | Reads: exact publication snapshot, metadata, assets/rights, SEO/route, target, job/history. Command targets: immutable `PublicationVersion`, `PublishedURL`, publish/unpublish job, `AuditEvent`. |
| Workflow States | `publication.lifecycle, publication.job, approval.lifecycle` |
| Primary Actions | Preview; validate; publish; unpublish/update with permission. Guarded workflow surface: Validate/approve/schedule/publish/retry/unpublish/correct. |
| Reused Components | Team/Client shell as applicable; Stage board, blockers, SLA, assignments, transition drawer |
| Desktop Layout | Board plus inspector. Route note: Desktop preview/checklist; mobile approve/status. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No workflow instance; configure/start prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: publish.execute restricted. Phase 2D authorization: Publish R01/R02/R07/R14; approved manifest required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 111 — Screen 097: Publishing Schedule

| Field | Frozen design contract |
|---|---|
| Design Number | 111 |
| Screen Number | 97 |
| Screen Name | Publishing Schedule |
| Route | /app/publishing/schedule |
| User Type | Publishing; Editorial Managers |
| Design Family | **Variant** — F19 CalendarAgenda |
| Opens From | 94/95 Publishing |
| Main Purpose | Calendar of scheduled releases across all content types |
| Main Data | Reads: `Schedule`, `Publication`, dependencies, owners, `CalendarItem`. Command targets: `Schedule`, `CalendarItem`. |
| Workflow States | `publication.lifecycle, publication.job, approval.lifecycle` |
| Primary Actions | Reschedule; detect collision; open item. Guarded workflow surface: Validate/approve/schedule/publish/retry/unpublish/correct. |
| Reused Components | Team/Client shell as applicable; Calendar, agenda, filters, event drawer |
| Desktop Layout | Calendar plus agenda. Route note: Desktop calendar; mobile agenda. |
| Tablet Layout | Calendar/agenda toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Agenda-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No scheduled items; create/browse next action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: publish.schedule. Phase 2D authorization: Publish R01/R02/R07/R14; approved manifest required. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 112 — Screen 099: Distribution Campaigns

| Field | Frozen design contract |
|---|---|
| Design Number | 112 |
| Screen Number | 99 |
| Screen Name | Distribution Campaigns |
| Route | /app/distribution/campaigns |
| User Type | Marketing; Social; AM |
| Design Family | **Anchor** — F33 DistributionCampaign |
| Opens From | 98 Dashboard; 96 Published item |
| Main Purpose | Manage multi-channel distribution packages |
| Main Data | Reads: `DistributionCampaign`, publication/project/client, channels, status/performance. Command targets: `DistributionCampaign`, assignment/archive. |
| Workflow States | `distribution.campaign, distribution.item, report.metric` |
| Primary Actions | Create; duplicate; schedule; pause. Guarded workflow surface: Prepare/approve/schedule/run/retry channel item; inspect verified performance. |
| Reused Components | Team/Client shell as applicable; Channel plan, distribution items, schedule, metrics, failures |
| Desktop Layout | Campaign workspace plus rail. Route note: Desktop table/cards; mobile list. |
| Tablet Layout | Tabbed channels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Channel cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No distribution items; choose publication/channel. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: distribution.campaign.view scoped. Phase 2D authorization: Launch R01/R02/R14; provider evidence retained. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 113 — Screen 100: Distribution Campaign Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 113 |
| Screen Number | 100 |
| Screen Name | Distribution Campaign Detail |
| Route | /app/distribution/campaigns/[campaignId] |
| User Type | Marketing; Social; AM |
| Design Family | **Variant** — F33 DistributionCampaign |
| Opens From | 99 Campaigns |
| Main Purpose | Plan copy/assets per channel and track execution |
| Main Data | Reads: campaign, items, copy/assets, schedules, approvals, URLs, metric observations. Command targets: `DistributionItem`, `AssetLink`, approval request, schedule/launch job. |
| Workflow States | `distribution.campaign, distribution.item, report.metric` |
| Primary Actions | Edit post; upload creative; schedule; publish; retry. Guarded workflow surface: Prepare/approve/schedule/run/retry channel item; inspect verified performance. |
| Reused Components | Team/Client shell as applicable; Channel plan, distribution items, schedule, metrics, failures |
| Desktop Layout | Campaign workspace plus rail. Route note: Desktop multi-channel board; mobile item actions. |
| Tablet Layout | Tabbed channels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Channel cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No distribution items; choose publication/channel. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: distribution.campaign.manage scoped. Phase 2D authorization: Launch R01/R02/R14; provider evidence retained. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 114 — Screen 101: Channel Performance

| Field | Frozen design contract |
|---|---|
| Design Number | 114 |
| Screen Number | 101 |
| Screen Name | Channel Performance |
| Route | /app/distribution/performance |
| User Type | Marketing; AM; Admin |
| Design Family | **Variant** — F33 DistributionCampaign |
| Opens From | 98/100 Distribution |
| Main Purpose | Cross-channel verified performance analysis |
| Main Data | Reads: `MetricDefinition`, `MetricSource`, verified `MetricObservation`, rollup/snapshot, distribution URL/item. Command targets: report/export request with audit; no raw metric edit. |
| Workflow States | `distribution.campaign, distribution.item, report.metric` |
| Primary Actions | Filter; compare; export/report. Guarded workflow surface: Prepare/approve/schedule/run/retry channel item; inspect verified performance. |
| Reused Components | Team/Client shell as applicable; Channel plan, distribution items, schedule, metrics, failures |
| Desktop Layout | Campaign workspace plus rail. Route note: Desktop charts; mobile KPI cards + simplified charts. |
| Tablet Layout | Tabbed channels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Channel cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No distribution items; choose publication/channel. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: analytics.distribution.view scoped. Phase 2D authorization: Launch R01/R02/R14; provider evidence retained. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 115 — Screen 103: Client Report Builder

| Field | Frozen design contract |
|---|---|
| Design Number | 115 |
| Screen Number | 103 |
| Screen Name | Client Report Builder |
| Route | /app/reports/new?client={id} |
| User Type | Account Manager; Analytics; Admin |
| Design Family | **Variant** — F20 DocumentBuilder |
| Opens From | 102 Reports; Client 360; Project |
| Main Purpose | Assemble verified deliverables and metrics into client-facing report |
| Main Data | Reads: client/project, publications/URLs, verified metrics/snapshots, deliverables/assets. Command targets: `Report`, immutable `ReportVersion`, `AnalyticsSnapshot`, `Asset`, approval request. |
| Workflow States | `report.lifecycle, delivery.pack, report.metric` |
| Primary Actions | Select metrics; add narrative; preview; publish to portal. Guarded workflow surface: Collect/freeze/review/approve/deliver/supersede report. |
| Reused Components | Team/Client shell as applicable; Outline, structured editor/form, variables, preview, versions |
| Desktop Layout | Editor plus preview. Route note: Desktop builder; mobile review only. |
| Tablet Layout | Editor/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Section steps; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Blank document/questionnaire with template CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: report.create scoped. Phase 2D authorization: Verified cutoff/source; client-safe version only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 116 — Screen 104: Client Report Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 116 |
| Screen Number | 104 |
| Screen Name | Client Report Detail |
| Route | /app/reports/[reportId] |
| User Type | Account Manager; Managers; Client-success roles |
| Design Family | **Anchor** — F34 ReportBuilder |
| Opens From | 102/103 Reports |
| Main Purpose | Review delivered report, engagement and follow-up |
| Main Data | Reads: report/version, provenance/snapshot, delivery/view/comment state. Command targets: new `ReportVersion`, `DeliveryPack`, share `ActivityEvent`, client-visible comment. |
| Workflow States | `report.lifecycle, delivery.pack, report.metric` |
| Primary Actions | Send/publish; download; create renewal opportunity. Guarded workflow surface: Collect/freeze/review/approve/deliver/supersede report. |
| Reused Components | Team/Client shell as applicable; Metric library, report canvas, filters, preview, export |
| Desktop Layout | Builder plus preview. Route note: Desktop report view; mobile readable report. |
| Tablet Layout | Builder/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Guided sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No metrics/report; select source/template. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: report.view scoped. Phase 2D authorization: Verified cutoff/source; client-safe version only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 117 — Screen 105: Renewal Pipeline

| Field | Frozen design contract |
|---|---|
| Design Number | 117 |
| Screen Number | 105 |
| Screen Name | Renewal Pipeline |
| Route | /app/renewals |
| User Type | Account Managers; Sales; Managers |
| Design Family | **Variant** — F12 PipelineBoard |
| Opens From | Project complete; Report Detail; Client 360 |
| Main Purpose | Track renewals and upsells after delivery |
| Main Data | Reads: `RenewalOpportunity`, client, completed projects, reports, health, package suggestions. Command targets: `RenewalOpportunity`, assignment/status/task. |
| Workflow States | `renewal.lifecycle, sales.deal` |
| Primary Actions | Create opportunity; assign; schedule follow-up. Guarded workflow surface: Review due renewal; create opportunity; outreach/propose/negotiate/renew/defer/lose. |
| Reused Components | Team/Client shell as applicable; Kanban/list toggle, stage totals, cards, filters, move guard |
| Desktop Layout | Full stage board. Route note: Desktop kanban/table; mobile stage groups. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pipeline records; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: renewal.view scoped. Phase 2D authorization: AM/Sales scope; renewal links successor deal/project. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 118 — Screen 106: Renewal Opportunity Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 118 |
| Screen Number | 106 |
| Screen Name | Renewal Opportunity Detail |
| Route | /app/renewals/[renewalId] |
| User Type | Account Manager; Sales |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 105 Renewal Pipeline |
| Main Purpose | Convert client success into repeat business without losing history |
| Main Data | Reads: renewal, client/prior projects/deliveries/reports, packages, notes, deal/proposal. Command targets: `RenewalOpportunity`, `Comment`, `Task`, new `Deal`/`Proposal`. |
| Workflow States | `renewal.lifecycle, sales.deal` |
| Primary Actions | Contact client; create proposal; convert to deal. Guarded workflow surface: Review due renewal; create opportunity; outreach/propose/negotiate/renew/defer/lose. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop detail; mobile actions/summary. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: renewal.edit scoped. Phase 2D authorization: AM/Sales scope; renewal links successor deal/project. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 9
#### Design 119 — Screen 114: Team Directory

| Field | Frozen design contract |
|---|---|
| Design Number | 119 |
| Screen Number | 114 |
| Screen Name | Team Directory |
| Route | /app/admin/team |
| User Type | Admin; Department Heads; managers limited |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Admin menu |
| Main Purpose | Manage organization people and status |
| Main Data | Reads: `OrganizationMembership`, `Person`, `EmployeeProfile`, departments/roles/workload. Command targets: `Invitation`, membership/profile status, assignment under authority. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Invite; deactivate; assign department/role. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop table; mobile directory cards. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: team.view; team.manage restricted. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 120 — Screen 115: Employee Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 120 |
| Screen Number | 115 |
| Screen Name | Employee Detail |
| Route | /app/admin/team/[userId] |
| User Type | Admin; Manager scoped; employee self subset elsewhere |
| Design Family | **Variant** — F11 Entity360 |
| Opens From | 114 Team Directory |
| Main Purpose | Employee access, workload and assignment view |
| Main Data | Reads: person/membership/profile, roles, department/manager, capacity, tasks/projects/activity. Command targets: `EmployeeProfile`, membership, `MembershipRole`, manager/department, `AuditEvent`. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Change role; reassign manager; deactivate; view workload. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Identity header, tabs, timeline, related records, action rail |
| Desktop Layout | Main detail plus rail. Route note: Desktop 360; mobile summary/actions. |
| Tablet Layout | Tabs plus rail drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Record missing/archived/inaccessible with recovery path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: team.view; team.manage restricted. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 121 — Screen 116: Departments & Capacity

| Field | Frozen design contract |
|---|---|
| Design Number | 121 |
| Screen Number | 116 |
| Screen Name | Departments & Capacity |
| Route | /app/admin/departments |
| User Type | Admin; Operations; Department Heads |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | 114 Team; Settings |
| Main Purpose | Organize teams and monitor production capacity |
| Main Data | Reads: `Department`, membership/profile, assignments/tasks/projects, capacity aggregates. Command targets: `Department`, manager/membership placement, capacity configuration. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Create dept; set manager; review capacity. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop management; mobile read/quick assign. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: department.manage. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 122 — Screen 117: Roles & Permission Matrix

| Field | Frozen design contract |
|---|---|
| Design Number | 122 |
| Screen Number | 117 |
| Screen Name | Roles & Permission Matrix |
| Route | /app/admin/roles |
| User Type | Super Admin; Admin |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | 114 Team; Settings |
| Main Purpose | Define RBAC without duplicating screens for admin vs employee |
| Main Data | Reads: `Role`, `Permission`, `RolePermission`, `MembershipRole`. Command targets: `Role`, `RolePermission`, `MembershipRole`, `AuditEvent`. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Create role; toggle permission; clone; assign. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop matrix; mobile read-only strongly preferred. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: role.manage highly restricted. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 123 — Screen 118: Audit Logs

| Field | Frozen design contract |
|---|---|
| Design Number | 123 |
| Screen Number | 118 |
| Screen Name | Audit Logs |
| Route | /app/admin/audit-logs |
| User Type | Super Admin; Admin; Security/Compliance |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Admin menu; sensitive entity links |
| Main Purpose | Immutable record of sensitive actions |
| Main Data | Reads: append-only `AuditEvent`, actor/resource/request metadata. Command targets: export request/audit only; no audit mutation. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Filter; inspect; export if permitted. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop forensic table; mobile search/read. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: audit.view restricted. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 124 — Screen 119: Integrations

| Field | Frozen design contract |
|---|---|
| Design Number | 124 |
| Screen Number | 119 |
| Screen Name | Integrations |
| Route | /app/admin/integrations |
| User Type | Super Admin; Admin; authorized technical ops |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Settings |
| Main Purpose | Connect and monitor external services |
| Main Data | Reads: `IntegrationConnection`, `WebhookEvent`, sync/health/error projection. Command targets: `IntegrationConnection`, rotate credential reference, sync command, `AuditEvent`. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Connect; reconnect; test; disable. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop settings; mobile health/status only. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: integration.manage. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 125 — Screen 120: Organization & System Settings

| Field | Frozen design contract |
|---|---|
| Design Number | 125 |
| Screen Number | 120 |
| Screen Name | Organization & System Settings |
| Route | /app/admin/settings |
| User Type | Super Admin; Admin |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Admin menu |
| Main Purpose | Central configuration for organization, regional, branding, defaults, security and automation |
| Main Data | Reads: `Organization`, workflow/approval/notification/security settings, integrations. Command targets: `Organization`, versioned policy/settings, `AuditEvent`. |
| Workflow States | `identity.access, policy/configuration, audit projection` |
| Primary Actions | Save settings; configure defaults; manage security. Guarded workflow surface: Invite/deactivate/assign role or department; configure; inspect audit/integration health. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Desktop tabbed settings; mobile selected safe settings only. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: settings.manage. Phase 2D authorization: R01/R02/R16 as applicable; roles R01/R02; hard delete R01. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 10
#### Design 126 — Screen 124: Client Dashboard

| Field | Frozen design contract |
|---|---|
| Design Number | 126 |
| Screen Number | 124 |
| Screen Name | Client Dashboard |
| Route | /client |
| User Type | Client Portal User |
| Design Family | **Variant** — F05 DashboardTemplate |
| Opens From | 121/122 Authentication |
| Main Purpose | Simple client home showing progress and exactly what needs attention |
| Main Data | Reads: own `ClientAccount`, `Project`, milestones/workflow summaries, pending approvals/tasks, shared invoices/messages/meetings/reports/notifications. Command targets: dashboard preference, notification read state. |
| Workflow States | `client-safe project, task, approval, contract, invoice, publication, report projections` |
| Primary Actions | Open project; approve; upload; pay; message team. Guarded workflow surface: Open or execute eligible client action on destination aggregate. |
| Reused Components | Team/Client shell as applicable; KPI cards, attention queue, trend panels, activity, quick actions |
| Desktop Layout | Multi-panel dashboard. Route note: Fully responsive; cards stack; attention items first. |
| Tablet Layout | Two-column dashboard; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Priority card stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Zero metrics explain scope and offer setup/drill-down. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.dashboard.view scoped to own org/projects. Phase 2D authorization: R17 own client organization only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 127 — Screen 125: My Projects

| Field | Frozen design contract |
|---|---|
| Design Number | 127 |
| Screen Number | 125 |
| Screen Name | My Projects |
| Route | /client/projects |
| User Type | Client Portal User |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 124 Dashboard; client nav |
| Main Purpose | All projects visible to this client user |
| Main Data | Reads: own client-visible `Project`, workflow/milestone/progress/owner summaries. Command targets: project filter/preference only. |
| Workflow States | `project.lifecycle, stage.run, activity projection` |
| Primary Actions | Open project; filter active/completed. Guarded workflow surface: View client-safe progress; open/complete allowed action. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Responsive cards; no dense internal fields. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.project.view scoped. Phase 2D authorization: R17 own project + CLIENT_SHARED only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 128 — Screen 126: Client Project Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 128 |
| Screen Number | 126 |
| Screen Name | Client Project Detail |
| Route | /client/projects/[projectId] |
| User Type | Authorized Client User |
| Design Family | **Variant** — F23 ProjectWorkspace |
| Opens From | 125 Projects; dashboard |
| Main Purpose | Client-safe project workspace with progress, milestones and deliverables |
| Main Data | Reads: project/milestones, client-visible members/deliverables/tasks/approvals/assets/activity. Command targets: client task/comment/message commands only. |
| Workflow States | `project.lifecycle, stage.run, activity projection` |
| Primary Actions | Complete requested action; message team; open deliverable. Guarded workflow surface: View client-safe progress; open/complete allowed action. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Responsive tabs/accordion; no internal notes or hidden stages. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.project.view scoped. Phase 2D authorization: R17 own project + CLIENT_SHARED only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 129 — Screen 127: Project Timeline / Activity

| Field | Frozen design contract |
|---|---|
| Design Number | 129 |
| Screen Number | 127 |
| Screen Name | Project Timeline / Activity |
| Route | /client/projects/[projectId]/timeline |
| User Type | Authorized Client User |
| Design Family | **Variant** — F23 ProjectWorkspace |
| Opens From | 126 Project Detail |
| Main Purpose | Transparent client-facing history of important milestones |
| Main Data | Reads: `ActivityEvent` where same client/project and `CLIENT_SHARED`. Command targets: none. |
| Workflow States | `project.lifecycle, stage.run, activity projection` |
| Primary Actions | Filter timeline; open item. Guarded workflow surface: View client-safe progress; open/complete allowed action. |
| Reused Components | Team/Client shell as applicable; Health header, milestones, team, workstreams, activity |
| Desktop Layout | Project workspace plus rail. Route note: Simple responsive feed. |
| Tablet Layout | Tabs and drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Action stack; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No project/access; onboarding or return path. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.project.activity.view. Phase 2D authorization: R17 own project + CLIENT_SHARED only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 130 — Screen 128: Messages

| Field | Frozen design contract |
|---|---|
| Design Number | 130 |
| Screen Number | 128 |
| Screen Name | Messages |
| Route | /client/messages |
| User Type | Client Portal User |
| Design Family | **Variant** — F17 Inbox |
| Opens From | 124 Dashboard; client nav; project |
| Main Purpose | Direct client-team communication without exposing internal inbox |
| Main Data | Reads: own client-visible `Conversation`, participants, latest `Message`, assets/unread. Command targets: read/archive state, new `Conversation` when allowed. |
| Workflow States | `conversation.lifecycle` |
| Primary Actions | Start/reply; attach file. Guarded workflow surface: Start/reply/attach on shared thread. |
| Reused Components | Team/Client shell as applicable; Thread list, message pane, context rail, composer |
| Desktop Layout | Three-pane inbox. Route note: Mobile chat-like list/thread; desktop 2-pane. |
| Tablet Layout | Two-pane inbox; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Route-per-pane chat; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No conversations; compose if authorized. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.message.view. Phase 2D authorization: R17 own organization/thread; internal notes excluded. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 131 — Screen 129: Message Thread

| Field | Frozen design contract |
|---|---|
| Design Number | 131 |
| Screen Number | 129 |
| Screen Name | Message Thread |
| Route | /client/messages/[threadId] |
| User Type | Authorized Client User |
| Design Family | **Variant** — F18 ConversationDetail |
| Opens From | 128 Messages; notifications |
| Main Purpose | One conversation with project context |
| Main Data | Reads: authorized conversation/messages/participants/shared attachments/project. Command targets: `Message`, `AssetVersion`, `AssetLink`, notification state. |
| Workflow States | `conversation.lifecycle` |
| Primary Actions | Reply; attach; reference deliverable. Guarded workflow surface: Start/reply/attach on shared thread. |
| Reused Components | Team/Client shell as applicable; Conversation header, chronology, composer, attachments, context |
| Desktop Layout | Thread plus context rail. Route note: Fully mobile-capable; desktop context rail. |
| Tablet Layout | Context drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Thread-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No messages; first-message or closed-thread treatment. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.message.send scoped. Phase 2D authorization: R17 own organization/thread; internal notes excluded. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 132 — Screen 130: Tasks & Requests

| Field | Frozen design contract |
|---|---|
| Design Number | 132 |
| Screen Number | 130 |
| Screen Name | Tasks & Requests |
| Route | /client/tasks |
| User Type | Client Portal User |
| Design Family | **Variant** — F30 TaskBoard |
| Opens From | 124 Dashboard; project |
| Main Purpose | Show only tasks the client needs to complete |
| Main Data | Reads: client-shared assigned `Task`, checklist, project/resource. Command targets: `Task` completion/status within allowed transitions, comment/asset response. |
| Workflow States | `task.lifecycle` |
| Primary Actions | Complete; upload; ask question. Guarded workflow surface: Start/complete/reopen permitted client task; upload requested item. |
| Reused Components | Team/Client shell as applicable; Board/list, owner, due/SLA, dependencies, detail drawer |
| Desktop Layout | Task board plus drawer. Route note: Mobile-first action list. |
| Tablet Layout | Compact list; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grouped task cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No tasks; create/import if eligible. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.task.view/complete. Phase 2D authorization: Client assignee + CLIENT_SHARED. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 133 — Screen 149: Client Notifications

| Field | Frozen design contract |
|---|---|
| Design Number | 133 |
| Screen Number | 149 |
| Screen Name | Client Notifications |
| Route | /client/notifications |
| User Type | Client Portal User |
| Design Family | **Variant** — F08 NotificationCenter |
| Opens From | Bell; email deep links |
| Main Purpose | Central client alert history |
| Main Data | Reads: own `Notification`, linked client-safe resource. Command targets: read/dismiss state, limited preferences. |
| Workflow States | `notification.delivery` |
| Primary Actions | Mark read; open item; preferences subset. Guarded workflow surface: Mark read/open/update own subset. |
| Reused Components | Team/Client shell as applicable; Notification feed, filters, read state, delivery settings |
| Desktop Layout | Feed plus preference rail. Route note: Mobile feed; desktop filters. |
| Tablet Layout | Preference drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Single feed; one primary task, stacked content, filters/actions in sheets. |
| Empty State | Inbox-zero message and preference shortcut. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.notification.view own. Phase 2D authorization: Own notifications only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 134 — Screen 150: Support Requests

| Field | Frozen design contract |
|---|---|
| Design Number | 134 |
| Screen Number | 150 |
| Screen Name | Support Requests |
| Route | /client/support |
| User Type | Client Portal User |
| Design Family | **Variant** — F18 ConversationDetail |
| Opens From | Client nav; billing/project help |
| Main Purpose | Private support cases for the client organization |
| Main Data | Reads: own-org `SupportTicket`, shared `SupportMessage`, attachments, linked project/invoice. Command targets: `SupportTicket`, `SupportMessage`, `AssetVersion`, close/reopen under policy. |
| Workflow States | `support.ticket` |
| Primary Actions | Create ticket; reply; attach; close/reopen rules. Guarded workflow surface: Create/triage-by-system/reply/resolve/reopen/close own ticket. |
| Reused Components | Team/Client shell as applicable; Conversation header, chronology, composer, attachments, context |
| Desktop Layout | Thread plus context rail. Route note: Mobile-friendly ticket cards and thread. |
| Tablet Layout | Context drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Thread-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No messages; first-message or closed-thread treatment. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.support.manage own org. Phase 2D authorization: Own client organization; internal notes excluded. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 135 — Screen 151: Profile & Organization Settings

| Field | Frozen design contract |
|---|---|
| Design Number | 135 |
| Screen Number | 151 |
| Screen Name | Profile & Organization Settings |
| Route | /client/settings |
| User Type | Client Portal User; client admin subset |
| Design Family | **Variant** — F35 AdminSettings |
| Opens From | Profile menu |
| Main Purpose | Manage own identity and permitted organization preferences |
| Main Data | Reads: own `Person`, `UserAccount`, client membership/organization subset, notification preferences, sessions. Command targets: `Person`, `NotificationPreference`, credential/session command; limited invite/membership writes for client admin. |
| Workflow States | `identity.access, portal membership/preferences` |
| Primary Actions | Update profile; change password; manage notifications; invite/revoke if client admin. Guarded workflow surface: Update own profile/password/preferences; limited org membership action. |
| Reused Components | Team/Client shell as applicable; Settings navigation, forms, member/role tables, audit/risk panels |
| Desktop Layout | Section nav plus form. Route note: Responsive settings sections; sensitive actions separated. |
| Tablet Layout | Compact section nav; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked settings; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No configurable items or insufficient authority. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.profile.edit; client.org.manage limited. Phase 2D authorization: Own identity; client admin subset only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 11
#### Design 136 — Screen 131: Questionnaires

| Field | Frozen design contract |
|---|---|
| Design Number | 136 |
| Screen Number | 131 |
| Screen Name | Questionnaires |
| Route | /client/questionnaires |
| User Type | Client Portal User |
| Design Family | **Variant** — F10 EntityList |
| Opens From | 130 Tasks; project |
| Main Purpose | All interview/editorial questionnaires assigned to client |
| Main Data | Reads: own `QuestionnaireInstance`, template summary, draft/submission progress. Command targets: response draft initialization/status. |
| Workflow States | `questionnaire.lifecycle` |
| Primary Actions | Open; continue; submit. Guarded workflow surface: Save draft; submit; resubmit after requested changes. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Responsive progress cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.questionnaire.view. Phase 2D authorization: Exact submission snapshots preserved. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 137 — Screen 132: Questionnaire Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 137 |
| Screen Number | 132 |
| Screen Name | Questionnaire Detail |
| Route | /client/questionnaires/[questionnaireId] |
| User Type | Authorized Client User |
| Design Family | **Variant** — F25 EditorialEditor |
| Opens From | 131 Questionnaires |
| Main Purpose | Capture original client answers exactly, with attachments and autosave |
| Main Data | Reads: authorized questions, own response draft, submissions, shared attachments. Command targets: `QuestionnaireResponse`, immutable `QuestionnaireSubmission`, `AssetVersion`. |
| Workflow States | `questionnaire.lifecycle` |
| Primary Actions | Save draft; upload; submit. Guarded workflow surface: Save draft; submit; resubmit after requested changes. |
| Reused Components | Team/Client shell as applicable; Outline, editor, sources, comments, versions |
| Desktop Layout | Editor plus context rails. Route note: Mobile-friendly long form; autosave; clear section progress. |
| Tablet Layout | Context drawers; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Focused editor; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No draft/research; create from approved source. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.questionnaire.edit until submitted. Phase 2D authorization: Exact submission snapshots preserved. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 138 — Screen 133: Drafts

| Field | Frozen design contract |
|---|---|
| Design Number | 138 |
| Screen Number | 133 |
| Screen Name | Drafts |
| Route | /client/drafts |
| User Type | Client Portal User |
| Design Family | **Variant** — F10 EntityList |
| Opens From | Project; tasks; notifications |
| Main Purpose | Client-visible editorial drafts awaiting/recently completed review |
| Main Data | Reads: client-shared `Draft` review packages and decisions, never internal working versions/comments. Command targets: none/filter only. |
| Workflow States | `draft.review, approval.lifecycle` |
| Primary Actions | Open review; view approved version. Guarded workflow surface: Comment; request changes; approve exact shared draft version. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Responsive cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.draft.view. Phase 2D authorization: Authorized client approver; no internal comments. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 139 — Screen 134: Draft Review

| Field | Frozen design contract |
|---|---|
| Design Number | 139 |
| Screen Number | 134 |
| Screen Name | Draft Review |
| Route | /client/drafts/[draftId] |
| User Type | Authorized Client Approver |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 133 Drafts; approval request |
| Main Purpose | Review editorial copy, comment and approve/request changes |
| Main Data | Reads: exact shared `DraftVersion`/deliverable version, client comments, approval request/decision. Command targets: `Comment` as `CLIENT_SHARED`, immutable `ApprovalDecision`. |
| Workflow States | `draft.review, approval.lifecycle` |
| Primary Actions | Comment; request changes; approve. Guarded workflow surface: Comment; request changes; approve exact shared draft version. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Readable article width on mobile; comment drawer. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.draft.review. Phase 2D authorization: Authorized client approver; no internal comments. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 140 — Screen 135: Designs

| Field | Frozen design contract |
|---|---|
| Design Number | 140 |
| Screen Number | 135 |
| Screen Name | Designs |
| Route | /client/designs |
| User Type | Client Portal User |
| Design Family | **Variant** — F26 MagazineProductionWorkspace |
| Opens From | Project; tasks |
| Main Purpose | Client-visible cover/layout/design proofs |
| Main Data | Reads: client-shared cover/layout/proof design resources and approval state. Command targets: none/filter only. |
| Workflow States | `asset/design version, approval.lifecycle` |
| Primary Actions | Open proof; compare versions. Guarded workflow surface: Compare/comment; request changes; approve exact proof. |
| Reused Components | Team/Client shell as applicable; Spread canvas, thumbnails, assets, comments, versions |
| Desktop Layout | Canvas plus dual rails. Route note: Responsive visual cards. |
| Tablet Layout | Overlay rails; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Page sequence; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pages/concepts; create/import first artifact. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.design.view. Phase 2D authorization: Authorized client approver; superseded version blocked. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 141 — Screen 136: Design Review

| Field | Frozen design contract |
|---|---|
| Design Number | 141 |
| Screen Number | 136 |
| Screen Name | Design Review |
| Route | /client/designs/[designId] |
| User Type | Authorized Client Approver |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 135 Designs; approval request |
| Main Purpose | Review magazine cover/layout or other creative with version control |
| Main Data | Reads: exact shared `DesignVersion`/`Proof`, approved preview assets, client comments/approval. Command targets: `Comment`, annotation asset if any, immutable `ApprovalDecision`. |
| Workflow States | `asset/design version, approval.lifecycle` |
| Primary Actions | Annotate/comment; request change; approve. Guarded workflow surface: Compare/comment; request changes; approve exact proof. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Pinch/zoom preview mobile; desktop side-by-side compare. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.design.review. Phase 2D authorization: Authorized client approver; superseded version blocked. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 142 — Screen 137: Assets

| Field | Frozen design contract |
|---|---|
| Design Number | 142 |
| Screen Number | 137 |
| Screen Name | Assets |
| Route | /client/assets |
| User Type | Client Portal User |
| Design Family | **Variant** — F31 AssetLibrary |
| Opens From | Project; tasks |
| Main Purpose | Upload and manage client-provided photos, logos and documents |
| Main Data | Reads: own client/project assets/versions/rights/usages allowed for client. Command targets: `Folder`, `Asset`, immutable `AssetVersion`, client rights confirmation. |
| Workflow States | `asset.lifecycle, asset.rights` |
| Primary Actions | Upload; replace; label; confirm rights. Guarded workflow surface: Upload/replace/label/confirm rights. |
| Reused Components | Team/Client shell as applicable; Folder tree, search, grid/list, metadata, versions |
| Desktop Layout | Three-pane library. Route note: Mobile photo/file upload fully supported. |
| Tablet Layout | Two-pane library; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Grid plus metadata sheet; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No assets; upload/request CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.asset.upload/view scoped. Phase 2D authorization: Own project + CLIENT_SHARED; prior versions retained. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 143 — Screen 138: Approvals

| Field | Frozen design contract |
|---|---|
| Design Number | 143 |
| Screen Number | 138 |
| Screen Name | Approvals |
| Route | /client/approvals |
| User Type | Client Approver; Portal User read |
| Design Family | **Variant** — F29 ApprovalCenter |
| Opens From | Dashboard; tasks; draft/design/media |
| Main Purpose | Single place for everything waiting on client decision |
| Main Data | Reads: own client pending/history `ApprovalRequest`, exact shared target, decisions. Command targets: immutable `ApprovalDecision` for own org. |
| Workflow States | `approval.lifecycle` |
| Primary Actions | Approve; request changes; comment. Guarded workflow surface: Approve/request changes/comment on active request. |
| Reused Components | Team/Client shell as applicable; Approval queue, artifact preview, diff, policy, decision record |
| Desktop Layout | Queue plus decision preview. Route note: Mobile-first approval cards; desktop richer previews. |
| Tablet Layout | Queue/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | One approval; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pending approvals; history and policy context. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.approval.view/decide scoped. Phase 2D authorization: R17 own client/project; exact version and active request. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 144 — Screen 139: Media Projects

| Field | Frozen design contract |
|---|---|
| Design Number | 144 |
| Screen Number | 139 |
| Screen Name | Media Projects |
| Route | /client/media |
| User Type | Client Portal User |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | Client nav; project |
| Main Purpose | Client-safe overview for podcast, video and event participation |
| Main Data | Reads: client-visible podcast/video/event project summaries, schedules/actions/assets. Command targets: filter only. |
| Workflow States | `podcast/video/event production, approval.lifecycle, meeting.lifecycle` |
| Primary Actions | Open; upload requested asset; confirm schedule. Guarded workflow surface: Confirm details/schedule; upload; review/approve shared media. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Responsive cards grouped by type. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.media.view scoped. Phase 2D authorization: Client-safe stages only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 145 — Screen 140: Media Project Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 145 |
| Screen Number | 140 |
| Screen Name | Media Project Detail |
| Route | /client/media/[projectId] |
| User Type | Authorized Client User |
| Design Family | **Variant** — F27 MediaProductionWorkspace |
| Opens From | 139 Media Projects |
| Main Purpose | Unified client-facing podcast/video/event workspace |
| Main Data | Reads: project, brief/talking points/script/agenda shared version, schedule, uploads, preview, approvals/publication. Command targets: client `Comment`, `AssetVersion`, `ApprovalDecision`, task response. |
| Workflow States | `podcast/video/event production, approval.lifecycle, meeting.lifecycle` |
| Primary Actions | Confirm details; review media; approve; message team. Guarded workflow surface: Confirm details/schedule; upload; review/approve shared media. |
| Reused Components | Team/Client shell as applicable; Media player, timeline, script/transcript, markers, versions |
| Desktop Layout | Timeline plus inspector. Route note: Responsive timeline + media preview. |
| Tablet Layout | Player/timeline toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Player-first; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No recording/media; upload/schedule prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.media.view/review scoped. Phase 2D authorization: Client-safe stages only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 146 — Screen 141: Contracts

| Field | Frozen design contract |
|---|---|
| Design Number | 146 |
| Screen Number | 141 |
| Screen Name | Contracts |
| Route | /client/contracts |
| User Type | Client Portal User |
| Design Family | **Variant** — F10 EntityList |
| Opens From | Dashboard; project; nav |
| Main Purpose | View all contracts available to the client |
| Main Data | Reads: own client-shared `Contract`, exact sent/signed versions and signature state. Command targets: none/filter only. |
| Workflow States | `commercial.contract` |
| Primary Actions | Open; download signed copy. Guarded workflow surface: View/sign/decline/download exact contract version. |
| Reused Components | Team/Client shell as applicable; Saved views, filters, data table/cards, bulk actions, export |
| Desktop Layout | Table with filter/action bar. Route note: Responsive contract cards. |
| Tablet Layout | Compact table; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Entity cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No records for scope/filter; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.contract.view scoped. Phase 2D authorization: Authorized signer only; provider evidence immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 147 — Screen 142: Contract Detail & Sign

| Field | Frozen design contract |
|---|---|
| Design Number | 147 |
| Screen Number | 142 |
| Screen Name | Contract Detail & Sign |
| Route | /client/contracts/[contractId] |
| User Type | Authorized Client Signer |
| Design Family | **Variant** — F21 DocumentReview |
| Opens From | 141 Contracts; email link |
| Main Purpose | Review and execute agreement |
| Main Data | Reads: authorized exact `ContractVersion`, signer/evidence status, shared attachments. Command targets: provider signing command; webhook creates immutable `SignatureEvent`. |
| Workflow States | `commercial.contract` |
| Primary Actions | Review; sign; decline with reason; download. Guarded workflow surface: View/sign/decline/download exact contract version. |
| Reused Components | Team/Client shell as applicable; Artifact preview, version diff, comments, decision panel, history |
| Desktop Layout | Preview plus decision rail. Route note: Mobile signing supported; document view optimized. |
| Tablet Layout | Decision drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Sequential review; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No reviewable version; show prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.contract.sign if signer. Phase 2D authorization: Authorized signer only; provider evidence immutable. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 148 — Screen 143: Invoices & Payments

| Field | Frozen design contract |
|---|---|
| Design Number | 148 |
| Screen Number | 143 |
| Screen Name | Invoices & Payments |
| Route | /client/billing |
| User Type | Authorized Client Billing User |
| Design Family | **Variant** — F22 FinanceWorkspace |
| Opens From | Dashboard; contract/project |
| Main Purpose | Commercial self-service for invoices, balances, receipts and payment status |
| Main Data | Reads: own `Invoice`, lines/totals/balance, `Payment`/allocation/receipt projection. Command targets: payment-intent command only. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Pay due invoice; download receipt/invoice. Guarded workflow surface: View/pay/retry/download receipt; open support. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Responsive billing cards; totals prominent. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.billing.view scoped. Phase 2D authorization: Authorized billing user; no internal margin/ledger fields. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 149 — Screen 144: Invoice / Payment Detail

| Field | Frozen design contract |
|---|---|
| Design Number | 149 |
| Screen Number | 144 |
| Screen Name | Invoice / Payment Detail |
| Route | /client/billing/[invoiceId] |
| User Type | Authorized Client Billing User |
| Design Family | **Variant** — F22 FinanceWorkspace |
| Opens From | 143 Billing; email payment link |
| Main Purpose | Inspect invoice and complete supported payment |
| Main Data | Reads: authorized invoice/lines/payment history/receipts. Command targets: payment-intent command, receipt download activity. |
| Workflow States | `finance.invoice, finance.payment` |
| Primary Actions | Pay; retry; download; contact support. Guarded workflow surface: View/pay/retry/download receipt; open support. |
| Reused Components | Team/Client shell as applicable; Financial summary, ledger, line items, evidence, guarded actions |
| Desktop Layout | Main ledger plus summary rail. Route note: Mobile payment flow optimized; no internal finance data. |
| Tablet Layout | Tabbed finance view; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stacked ledger cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No financial records; eligible create/request action. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.billing.pay scoped. Phase 2D authorization: Authorized billing user; no internal margin/ledger fields. Hide protected data/actions; render read-only or assigned-scope state explicitly. |


### Wave 12
#### Design 150 — Screen 145: Publishing & Live Links

| Field | Frozen design contract |
|---|---|
| Design Number | 150 |
| Screen Number | 145 |
| Screen Name | Publishing & Live Links |
| Route | /client/publishing |
| User Type | Client Portal User |
| Design Family | **Variant** — F32 PublishingQueue |
| Opens From | Dashboard; completed project |
| Main Purpose | See exactly what has been published and where |
| Main Data | Reads: own `Publication`, versions summary, verified `PublishedURL`, thumbnail/assets. Command targets: none. |
| Workflow States | `publication.lifecycle` |
| Primary Actions | Open live link; copy/share. Guarded workflow surface: View/open/copy verified published URL. |
| Reused Components | Team/Client shell as applicable; Target readiness, schedule, validation, status, published URL |
| Desktop Layout | Queue plus readiness inspector. Route note: Responsive live-link cards. |
| Tablet Layout | Readiness drawer; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Release cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No publication candidates; show approval prerequisite. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.publication.view scoped. Phase 2D authorization: Client-safe published records only. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 151 — Screen 146: Distribution

| Field | Frozen design contract |
|---|---|
| Design Number | 151 |
| Screen Number | 146 |
| Screen Name | Distribution |
| Route | /client/distribution |
| User Type | Client Portal User |
| Design Family | **Variant** — F33 DistributionCampaign |
| Opens From | 145 Publishing; project |
| Main Purpose | Client-safe distribution status across approved channels |
| Main Data | Reads: own campaigns/items, verified URLs/basic verified metric observations. Command targets: none. |
| Workflow States | `distribution.campaign, distribution.item` |
| Primary Actions | Open channel; view campaign status. Guarded workflow surface: View verified client-safe channel status and URLs. |
| Reused Components | Team/Client shell as applicable; Channel plan, distribution items, schedule, metrics, failures |
| Desktop Layout | Campaign workspace plus rail. Route note: Responsive channel cards. |
| Tablet Layout | Tabbed channels; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Channel cards; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No distribution items; choose publication/channel. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.distribution.view scoped. Phase 2D authorization: No internal campaign configuration. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 152 — Screen 147: Reports & Downloads

| Field | Frozen design contract |
|---|---|
| Design Number | 152 |
| Screen Number | 147 |
| Screen Name | Reports & Downloads |
| Route | /client/reports |
| User Type | Client Portal User |
| Design Family | **Variant** — F34 ReportBuilder |
| Opens From | Dashboard; distribution; project complete |
| Main Purpose | View verified reports, deliverables and final downloadable files |
| Main Data | Reads: own shared `ReportVersion`, snapshot/provenance summary, `DeliveryPack`, assets/links. Command targets: `DeliveryReceipt`, report comment when enabled. |
| Workflow States | `report.lifecycle, delivery.pack` |
| Primary Actions | Open report; download PDF/files; share link if allowed. Guarded workflow surface: View/acknowledge/download delivered artifacts. |
| Reused Components | Team/Client shell as applicable; Metric library, report canvas, filters, preview, export |
| Desktop Layout | Builder plus preview. Route note: Mobile-readable reports; downloads clearly labeled. |
| Tablet Layout | Builder/preview toggle; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Guided sections; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No metrics/report; select source/template. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.report.view scoped. Phase 2D authorization: Exact client-ready/delivered versions. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

#### Design 153 — Screen 148: Renewals & New Opportunities

| Field | Frozen design contract |
|---|---|
| Design Number | 153 |
| Screen Number | 148 |
| Screen Name | Renewals & New Opportunities |
| Route | /client/renewals |
| User Type | Authorized Client Decision Maker |
| Design Family | **Variant** — F12 PipelineBoard |
| Opens From | Completed project; report; dashboard |
| Main Purpose | Present relevant renewals/next services without exposing internal scoring |
| Main Data | Reads: own `RenewalOpportunity`, eligible `Package`, prior delivery/report summary. Command targets: client interest/message command; internal deal creation remains staff-authorized. |
| Workflow States | `renewal.lifecycle` |
| Primary Actions | Request renewal; request proposal; book discussion. Guarded workflow surface: Request renewal/proposal/discussion. |
| Reused Components | Team/Client shell as applicable; Kanban/list toggle, stage totals, cards, filters, move guard |
| Desktop Layout | Full stage board. Route note: Responsive offer cards; no aggressive blocking upsell. |
| Tablet Layout | Condensed board; secondary context becomes a drawer and essential columns persist. |
| Mobile Layout | Stage lists; one primary task, stacked content, filters/actions in sheets. |
| Empty State | No pipeline records; eligible create/import CTA. Preserve active scope and show only an authorized next action. |
| Loading State | Stable shell plus geometry-matched skeletons; delay workflow commands until data and authority resolve. |
| Error State | Preserve user input and filters; identify failed region; retry safely; expose support/correlation reference when available. |
| Permission Variants | Phase 2A permission: client.renewal.view scoped. Phase 2D authorization: Client request emits event; staff owns commercial transition. Hide protected data/actions; render read-only or assigned-scope state explicitly. |

<!-- ROUTE_SEQUENCE_END -->

## 9. Anchor-before-variant gate

A family anchor is approved only when it includes:

1. desktop, tablet and mobile composition;
2. normal, empty, loading and error states;
3. full-authority, reduced-authority and read-only variants;
4. data density and truncation rules;
5. keyboard focus, validation and accessible naming;
6. a component inventory with tokens and behavior;
7. workflow-state and guarded-command mapping;
8. client visibility treatment where applicable.

Variants may change data, labels, columns, status sets, primary commands and permission scope. They may not silently fork shell behavior, typography, spacing, state semantics or core interaction patterns.

## 10. Per-design handoff packet

Each design handoff must contain:

- exact route and design/screen numbers;
- user/role/scope variants;
- source entities and authoritative projections;
- workflow states, transitions and blocked-action explanations;
- desktop/tablet/mobile frames;
- empty/loading/error/permission-reduced frames;
- component reuse map and any proposed extension;
- analytics events and accessibility notes;
- acceptance checklist tied to Phase 2A–2D.

## 11. Freeze validation

| Validation | Required result |
|---|---|
| Phase 2A screen numbers | Exactly 1–151, once each |
| Routes | Exact match to Phase 2A |
| Phase 2C data | Every screen has mapped reads/writes |
| Phase 2D workflow | Every screen has machines/commands/authorization |
| Routed family coverage | F03–F35 all used |
| Shell coverage | F01 and F02 designed first |
| Anchor count | 35 including shells |
| Variant count | 118 |
| UI implementation | Not started |

## 12. Phase transition

Phase 2E planning is frozen when this document passes the checks above. The next visual execution item is:

**Design 001 — TeamShell**, followed by **Design 002 — ClientShell**, then the routed designs in the exact sequence between the route markers.
