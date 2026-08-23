Phase 3A.1 begins now. From this point we are auditing, classifying, consolidating, and mapping the approved designs—not creating new screens.

Phase 3A.1 — Master 153-Design Inventory Audit

For this phase, each design gets a canonical audit record. We will intentionally not finalize exact routes here; exact route paths and navigation connections belong to Phase 3B — Master Route & Connection Map. That keeps this audit focused and prevents route assumptions from contaminating the inventory.

Design 001 — TeamShell
Audit field	Classification
Design ID	001
Canonical name	TeamShell
Product area	Global Internal Workspace
User surface	Team Workspace
Screen class	Application Shell
Classification	Unique Anchor / Global Reusable Shell
Primary purpose	Provides the permanent application frame for internal users across CRM, sales, projects, editorial, publishing, distribution, reports, operations and administration
Primary entity	None — global application/session context
Template family	InternalAppShell
Auth	Required
Permission model	Role/permission-aware navigation and actions
Implementation priority	Foundation / Critical
Reuse level	Extremely high — inherited by nearly every authenticated internal screen

Canonical reusable components: expanded/collapsed sidebar, workspace/company identity, module navigation, nested navigation, top application bar, global search entry, notifications trigger, help/system actions, user avatar/menu, quick-create system, breadcrumbs/page context area, main content container, contextual actions, responsive navigation behavior.

Required application context: authenticated user, active organization/workspace, role and effective permissions, navigation entitlements, notification count/state, user preferences, global search capability and feature/module availability.

Responsive contract: Desktop uses expanded or collapsible navigation; tablet moves toward compact/icon navigation and adaptive content density; mobile becomes a drawer/compact navigation system with mobile-safe global actions. Design 151 and Design 152 are the responsive references rather than separate shell implementations.

Audit result: PASS — CANONICAL FOUNDATION.

Important implementation decision: individual routes must not recreate TeamShell. Route pages render inside this shell. Sidebar, topbar, user menu, notifications and other global chrome should have one canonical implementation.

Design 002 — ClientShell
Audit field	Classification
Design ID	002
Canonical name	ClientShell
Product area	Client Experience
User surface	Client Portal
Screen class	Application Shell
Classification	Unique Anchor / Portal Shell
Primary purpose	Provides the permanent navigation and interaction frame for authenticated client-facing experiences
Primary entity	Client account / client organization context
Template family	ClientPortalShell
Auth	Required after portal activation/sign-in
Permission model	Client-access permissions + project/document visibility
Implementation priority	Foundation / Critical
Reuse level	Extremely high across all authenticated Client Portal screens

Canonical reusable components: client-facing navigation, portal header, brand identity, current client/project context, project switcher where appropriate, notifications, messages/access points, profile/account menu, breadcrumbs/page context, portal content area, client-safe status badges, client actions, support entry and responsive navigation.

Required application context: authenticated portal user, linked client/company, portal membership, permitted projects, permitted files/deliverables, permitted invoices/contracts, notification state and client-specific access rules.

Responsive contract: Desktop maintains the dedicated Client Portal shell; tablet uses compact/adaptive navigation; mobile transforms to the approved mobile portal patterns from Design 151 while preserving project, files, messages, approvals and financial access permitted to that client.

Audit result: PASS — CANONICAL PORTAL FOUNDATION.

Important implementation decision: ClientShell and TeamShell remain separate product shells, but they should share low-level design-system primitives such as buttons, badges, avatars, inputs, dialogs, typography, spacing tokens and responsive utilities.

They should not share privileged internal navigation or expose internal operational data.

First consolidation result

We already have our first important architectural reduction:

Design 001 TeamShell
→ InternalAppShell

Design 002 ClientShell
→ ClientPortalShell

These become the two major authenticated presentation roots. Hundreds of repeated sidebar/header/page-wrapper elements across later designs therefore become 2 shell implementations, not dozens of duplicated layouts.

The component hierarchy begins to look like:

Design Tokens
→ shared primitives
→ shared UI components
→ InternalAppShell / ClientPortalShell
→ reusable page templates
→ individual Design 003–153 screen compositions.

Phase 3A.1 running totals

Audited: 2 / 153
PASS: 2
STANDARDIZE: 0
MERGE candidates: 0
FIX BEFORE CODE: 0
New designs created: 0

The next audit target is therefore Design 003, continuing sequentially through the frozen inventory. We should keep this exact audit discipline all the way to Design 153.

