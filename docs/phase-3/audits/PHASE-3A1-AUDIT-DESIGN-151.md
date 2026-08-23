# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 151 — Responsive Mobile Team Workspace System

Design 151 should become the **canonical mobile-responsive presentation and interaction system for the authenticated Team Workspace**.

Its boundary must remain strictly presentation/responsiveness:

> **Mobile Team Workspace ≠ separate Workspace entity ≠ separate mobile database ≠ separate permission model ≠ separate workflow engine ≠ separate business lifecycle ≠ separate source of truth.**

Design 151 adapts the canonical Team Workspace established in Designs 001–150 to constrained/mobile environments.

It must **not create a second mobile product architecture**.

The same:

* tenant;
* user/session;
* roles/permissions;
* leads;
* campaigns;
* messages;
* conversations;
* clients;
* deals;
* contracts;
* invoices;
* projects;
* publishing;
* distribution;
* reporting;
* automation;
* notifications;
* audit history;
* integrations;

remain canonical.

Only their **presentation, navigation density, interaction model, information hierarchy, and touch behavior** change.

---

# 1. Classification

| Audit field                   | Classification                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Design ID**                 | **151**                                                                                                     |
| **Canonical name**            | **Responsive Mobile Team Workspace System**                                                                 |
| **Product area**              | Team Workspace / Responsive UX                                                                              |
| **Surface**                   | Authenticated internal Team Workspace                                                                       |
| **Screen class**              | Cross-Platform Responsive Presentation System                                                               |
| **Classification**            | **Canonical Mobile Team Workspace Presentation & Interaction Anchor**                                       |
| **Business entity ownership** | **None**                                                                                                    |
| **Database ownership**        | **None**                                                                                                    |
| **Permission ownership**      | **None — Design 144 remains authoritative**                                                                 |
| **State ownership**           | **None — Design 150 remains authoritative**                                                                 |
| **Navigation ownership**      | Presentation only; canonical routes remain authoritative                                                    |
| **Primary purpose**           | Adapt Team Workspace functionality to mobile/touch constraints without creating parallel business semantics |
| **Primary dependencies**      | Designs 001–150                                                                                             |
| **Responsive dependency**     | Design 152 + Design 153                                                                                     |
| **Auth requirement**          | Same canonical authentication/session system                                                                |
| **Tenant requirement**        | Same canonical workspace/organization context                                                               |
| **Backend requirement**       | No separate mobile backend                                                                                  |
| **Reuse level**               | **Universal for authenticated Team Workspace screens**                                                      |

The core architecture must remain:

```text id="5v9m3r"
Canonical Web / Application Route
            │
            ↓
     Same Domain Services
            │
            ↓
       Same Data Model
            │
            ↓
       Same Permissions
            │
            ↓
       Same UI State Model
            │
            ↓
   ┌────────┴─────────┐
   ↓                  ↓
Desktop/Tablet      Mobile
presentation       presentation
```

Not:

```text id="5b4f1e"
Desktop Backend
       │
       ├── Desktop UX
       │
       └── Mobile Backend
              └── Mobile UX
```

The second architecture is explicitly rejected.

---

# 2. Reuse

## One Workspace, multiple responsive presentations

A mobile viewport does not create a new Workspace.

The same user must see the same authorized canonical information regardless of whether they access:

* desktop;
* tablet;
* mobile browser;
* supported responsive embedded surface.

Differences may exist in:

* density;
* ordering;
* navigation;
* control placement;
* interaction;
* information prioritization.

Differences must not exist in:

* authorization;
* business meaning;
* lifecycle;
* ownership;
* source of truth.

---

## Mobile route ≠ separate entity

Avoid architectures such as:

```text
/team/leads
/mobile/leads
```

where both become independent application models.

A mobile route can exist technically where routing requires it, but it must resolve to the same canonical domain resources and commands.

---

## Responsive layout ≠ mobile-only feature fork

A mobile adaptation may:

* collapse sidebar;
* replace dense tables with cards;
* convert horizontal tabs to scrolling tabs;
* move actions into an overflow menu;
* convert a multi-column detail layout into stacked sections.

It must not silently remove important business capabilities merely because the screen is narrow.

If a capability genuinely cannot be performed safely on mobile, the UI should provide a clear alternative rather than pretending the capability does not exist.

---

## One command model

Example:

```text id="v5n8yy"
Desktop:
Send Message

Mobile:
Send Message
```

Both invoke the same canonical Message-generation/sending command.

Not:

```text id="7x0hsy"
desktopSendMessage()
mobileSendMessage()
```

with divergent business rules.

---

## Same entity identity

A Project opened on desktop and mobile remains the same Project.

Same:

* ID;
* tenant;
* revision;
* lifecycle;
* ownership;
* permissions;
* audit lineage.

---

## Same URL/resource semantics

Responsive presentation must not alter resource identity.

For example:

```text id="0v8g4y"
/projects/{projectId}
```

remains the same canonical resource whether rendered at:

```text id="2m6v1k"
1440px
```

or:

```text id="e1xj0p"
390px
```

---

## Same filters, adapted controls

Mobile may use:

> Filters → bottom sheet

instead of desktop:

> Filter sidebar.

The semantic filter set must remain identical.

---

## Same sorting semantics

A mobile card list must not silently use different ordering than the desktop table unless the product explicitly defines a different canonical presentation order.

---

## Same pagination semantics

Infinite scrolling or mobile pagination is a presentation decision.

It must not create a separate dataset or silently alter authorization boundaries.

---

## Same search semantics

Search remains Design 079/canonical search behavior.

Mobile search UI is only another presentation.

---

## Same state system

Design 150 remains authoritative.

Mobile must preserve:

* Loading;
* Empty;
* Filtered Empty;
* Search Empty;
* Partial;
* Stale;
* Unknown;
* Authentication Required;
* Permission Denied;
* Validation;
* Conflict;
* Rate Limited;
* Dependency Unavailable;
* Outcome Unknown.

No mobile-specific state meanings should be introduced.

---

# 3. Entities

Design 151 owns **zero persistent business entities**.

It may define responsive UI primitives and layout contracts.

---

## `MobileNavigationState`

If needed, this is presentation state only.

For example:

```text id="g5f9s6"
navigation:
  open
  closed
```

It is not a business entity.

---

## `ResponsiveLayoutMode`

Conceptually:

```text id="3k2p8g"
COMPACT
STANDARD
EXPANDED
```

This describes presentation constraints.

It must never control authorization or domain behavior.

---

## `ViewportState ≠ Domain State`

A 390px viewport cannot cause:

```text id="1w8dse"
Project → ARCHIVED
```

or:

```text id="o8h7h3"
Lead → QUALIFIED
```

Responsive logic only affects presentation.

---

## `MobileSession ≠ User`

Do not create a separate mobile user identity.

The canonical authenticated user remains the same.

---

## `MobileWorkspace ≠ Workspace`

No second organization/workspace record.

---

## `MobilePermissionSet ≠ Role`

No mobile-specific permissions.

---

## `MobileNotification`

Notifications remain canonical Design 080/143 entities.

Mobile only changes presentation.

---

## `MobileTask`

Tasks remain canonical work entities.

Mobile may provide touch-friendly task interaction.

---

## `MobileDraft`

If a local draft mechanism exists, it must be explicitly treated as a local/UI draft and reconciled with the canonical source.

Do not create a second server-side draft entity solely because the device is mobile.

---

## Local UI state

Allowed:

```text id="7u2r1k"
openDrawer
activeTab
expandedSection
temporaryFilterSelection
scrollPosition
```

Not allowed:

```text id="z9f3q0"
mobileLeadStatus
mobileDealStage
mobileInvoiceState
```

---

## Local cache

If caching exists, cached data is never automatically canonical.

It must respect:

* tenant;
* user;
* authorization;
* freshness;
* invalidation.

---

## Device state ≠ server state

Examples:

```text id="4n3xk9"
phone offline
```

does not mean:

```text
integration offline
```

and:

```text
browser lost connection
```

does not mean:

```text
provider unavailable
```

These are separate state domains.

---

# 4. Permissions

Design 151 must strictly preserve Design 144's authorization model.

---

## Mobile cannot weaken authorization

A hidden desktop action must not become accessible through mobile APIs.

Likewise, a button hidden on mobile must not be interpreted as security enforcement.

---

## Same RBAC

The same:

* Role;
* Permission;
* Workspace;
* Department;
* ownership;
* policy;

apply on mobile.

---

## Same resource-level authorization

If a user can access:

```text id="4v5j3k"
Project A
```

on desktop, they should have the same authorization context on mobile.

If they cannot access it, mobile cannot reveal it.

---

## Same action authorization

Example:

```text id="n0w7z4"
Desktop:
Approve Proposal → allowed

Mobile:
Approve Proposal → allowed
```

if the canonical permission and workflow state permit it.

If not:

```text
Mobile:
Approve → restricted
```

not:

```text
Mobile:
Approve → allowed because desktop permission was not checked
```

---

## Permission-denied state

Design 150 determines the semantic state.

Mobile determines presentation:

```text id="z1m5p7"
Access restricted
You don't have permission to approve this proposal.
Back
```

---

## Action-level permission

Do not turn the entire mobile page into a forbidden screen because one action is restricted.

---

## Sensitive content

Mobile often increases physical/privacy exposure.

Design 151 should therefore preserve existing security rules around:

* sensitive financial data;
* customer contact information;
* credentials;
* API keys;
* private notes;
* audit data;
* tokens.

It must not expose additional content merely because mobile layout is simpler.

---

## Clipboard/share behavior

Mobile systems make:

* copy;
* share;
* download;
* screenshot;
* external-app handoff;

more prominent.

These are not permission bypasses.

Existing authorization and data-loss policies must still apply.

---

## Deep links

A mobile deep link to a resource must go through the same:

```text id="v6g7s1"
authentication
→ tenant resolution
→ authorization
→ resource lookup
```

chain.

The existence of a URL must never imply access.

---

## Session expiration

Same Design-150 authentication recovery.

Do not create a separate mobile session authority.

---

# 5. States

Design 150 remains the semantic source of truth.

Design 151 adapts the presentation.

---

## Loading

### Full-page loading

Use only when no meaningful content is available.

### Section loading

Keep already-loaded content visible.

### Action loading

Example:

> Sending…

on a mobile CTA.

### Background refresh

Existing content stays visible.

### Pull-to-refresh

If supported, it is only another refresh interaction.

It does not create new data semantics.

---

## Empty

Mobile must preserve the distinction between:

### First-use

> No projects yet.

### Filtered

> No projects match these filters.

### Search

> No results for “Acme”.

### Related data

> No files have been added to this project.

The CTA must remain contextually correct.

---

## Error

A mobile error should not become:

> Something went wrong.

for every failure.

It should retain the Design-150 semantic category.

---

## Partial failure

Example:

```text id="m9x5v3"
Project overview      ✓
Tasks                 ✓
Files                 ✓
Financial summary     unavailable
```

Mobile should keep the usable sections.

Do not replace the entire screen with an error just because one lower section failed.

---

## Stale data

Example:

> Updated 12 min ago · Refresh

if supported by canonical freshness data.

Never fabricate timestamps.

---

## Unknown

Unknown remains unknown.

Example:

> Delivery outcome could not be confirmed.

must not become:

> Failed.

---

## Permission

Mobile preserves Design-150 authorization semantics.

---

## Offline/network state

If the product does not officially support offline operation, Design 151 must **not imply offline editing or queued mutation**.

A lost network connection is not permission denial and not automatically a domain failure.

---

## Mutation outcome unknown

Particularly important on mobile networks.

Example:

```text id="e4g7p2"
User taps Send.
Network drops.
```

The UI must not assume:

> Send failed.

It may be:

> Send outcome could not be confirmed.

The canonical Message/Delivery system determines actual outcome.

This preserves the Design-090–093 boundaries.

---

# 6. Responsive Behavior

## Mobile breakpoint is presentation logic

Breakpoints must never control business rules.

Incorrect:

```text id="x5y3r1"
if mobile:
   cannot approve
```

Correct:

```text id="h3z9x8"
if not authorized:
   cannot approve
```

Mobile layout may change how the action is presented, not whether the business command is valid.

---

## Information hierarchy

Mobile requires stronger prioritization.

A typical detail page:

```text id="p4k7m2"
Header
↓
Primary status
↓
Primary identity
↓
Primary CTA
↓
Critical summary
↓
Key actions
↓
Secondary information
↓
Activity/history
↓
Related data
```

Desktop may place these side-by-side.

Mobile should stack them intentionally.

---

## Primary CTA

The highest-value action should remain easy to reach.

Do not allow a mobile overflow menu to bury the primary workflow action without reason.

---

## Sticky actions

Sticky bottom actions may be used where appropriate.

But:

* they must not cover content;
* they must respect safe-area insets;
* they must not duplicate contradictory actions;
* they must not bypass permission rules.

---

## Bottom navigation

If used, it must represent the same canonical top-level Workspace areas.

It must not create an alternate application hierarchy.

---

## Sidebar collapse

Desktop:

```text
Persistent Sidebar
```

Mobile:

```text
Drawer / sheet / compact navigation
```

Same destinations.

---

## Header

Mobile header should prioritize:

* current context;
* back/navigation;
* essential actions;
* search when relevant.

Avoid cramming every desktop control into a small header.

---

## Search

Search should remain discoverable for global or page-specific search.

Mobile can use:

* dedicated search screen;
* expandable search;
* modal search;
* command/search sheet.

The underlying search service remains unchanged.

---

## Tabs

Horizontal desktop tabs may become:

* horizontally scrollable tabs;
* segmented control;
* dropdown;
* stacked section navigation.

But semantic sections remain the same.

---

## Tables

Dense desktop tables require special treatment.

Possible mobile presentation:

```text id="q7t2s9"
Table row
→ summary card
→ key fields
→ overflow details
```

or:

```text
horizontal scrolling table
```

depending on information density.

Do not simply shrink unreadable desktop tables.

---

## Table actions

Desktop:

```text
Edit | View | Archive | More
```

Mobile may become:

```text
More
```

but authorization and action availability remain identical.

---

## Multi-column detail pages

Desktop:

```text
Main content | Sidebar
```

Mobile:

```text
Main content
↓
Secondary information
```

or contextual expandable sections.

---

## Forms

Mobile forms must:

* use appropriate input types;
* provide large touch targets;
* preserve field labels;
* avoid tiny controls;
* keep validation adjacent to fields;
* avoid unnecessary multi-column forms.

---

## Form state preservation

When validation fails, mobile should preserve entered values where safe.

Do not reset the entire form simply because the viewport is mobile.

---

## Long forms

Use progressive grouping.

Do not create unnecessary multi-page wizard flows merely because the device is small unless the workflow explicitly requires it.

---

## Modal behavior

Desktop dialogs may become:

* full-height sheets;
* bottom sheets;
* full-screen mobile panels.

But the semantic action remains identical.

---

## Confirmation dialogs

Critical destructive actions must remain explicit.

Do not replace:

> Delete Project?

with a tiny swipe action that can be triggered accidentally.

---

## Swipe gestures

If used:

* must have accessible alternatives;
* must not hide essential actions;
* must not cause destructive actions without confirmation where required.

---

## Touch targets

Interactive controls should meet appropriate touch-accessibility sizing.

Avoid tiny icon-only buttons.

---

## Hover dependence

Mobile cannot rely on:

* hover tooltips;
* hover-only menus;
* hover-revealed actions.

All essential functions require touch/keyboard-accessible alternatives.

---

## Drag and drop

Desktop drag/drop workflows must have mobile alternatives.

For example:

```text
Desktop:
Drag task to stage

Mobile:
Move → Select stage
```

Same underlying command.

---

## Gantt / timeline

Dense timelines may need:

* horizontal scrolling;
* focused detail;
* time-scale controls;
* simplified row representation.

Do not remove canonical milestone data merely for layout convenience.

---

## Kanban

Mobile may use:

* horizontal stage scrolling;
* stage selector;
* focused stage view.

Do not create a separate mobile pipeline model.

---

## Charts

Charts should adapt:

* labels;
* tooltips;
* legends;
* zoom;
* scrolling.

Do not omit important metrics without clear context.

---

## Reporting

Mobile reports should preserve:

* metric definitions;
* date range;
* filters;
* freshness;
* permission constraints.

A visually simplified chart must not change its calculation.

---

## Notifications

Notification center remains canonical.

Mobile can use:

* drawer;
* full-screen list;
* bottom navigation badge.

It must not create a separate notification store.

---

## Activity timeline

Long desktop timelines should become readable mobile event cards.

Ordering and event identity remain canonical.

---

## Audit logs

Mobile audit views must preserve:

* actor;
* action;
* timestamp;
* affected resource;
* available safe context.

Do not remove critical audit metadata simply to save space.

---

## Accessibility

Mobile accessibility is not optional.

Must support:

* VoiceOver/TalkBack;
* keyboard where applicable;
* focus order;
* semantic headings;
* button names;
* accessible forms;
* live regions;
* dynamic content;
* reduced motion.

---

## Safe-area handling

For mobile devices with system insets:

* bottom action bars;
* navigation;
* sheets;

must respect safe-area boundaries.

---

## Orientation

If both orientations are supported, business meaning must remain unchanged.

Do not require landscape solely to access a critical function unless explicitly documented.

---

## Zoom / text scaling

The layout must remain usable under browser/system text scaling.

Do not solve text overflow by disabling user zoom.

---

## Dynamic viewport

Mobile browser chrome changes available viewport height.

Full-height sheets and sticky controls must use robust viewport handling rather than assuming a fixed device height.

---

## Performance

Mobile networks and hardware are more constrained.

Design 151 should encourage:

* progressive loading;
* smaller payloads;
* image optimization;
* virtualized long lists where necessary;
* avoiding unnecessary client-side hydration;
* preserving server-rendering where architecture permits.

But these are implementation optimizations, not separate mobile data services.

---

## Navigation preservation

If the user enters:

```text
Projects
→ Project A
→ Task 17
```

mobile back navigation should return predictably through the same logical hierarchy.

---

## Deep-link recovery

A mobile deep link should not require the user to manually navigate through the entire workspace before the target can load.

---

## State preservation

When opening/closing sheets or returning from detail:

* preserve filter state where appropriate;
* preserve scroll where appropriate;
* do not lose user input unnecessarily.

---

# 7. Backend Requirements

Design 151 requires **no mobile-specific domain backend**.

That is a core architectural requirement.

---

## Same APIs

Mobile and desktop should consume the same canonical domain contracts unless a specific performance-oriented transport layer is introduced without changing semantics.

---

## Same authorization

Every mobile request is independently authorized.

---

## Same tenant isolation

Tenant/workspace scope remains server-derived.

Never trust:

```text id="5x4m8z"
mobileWorkspaceId
```

from the client as authorization authority.

---

## Same resource IDs

Mobile uses canonical resource identifiers.

---

## Same mutations

Examples:

```text id="7j2r6p"
Create Lead
Update Deal
Approve Proposal
Send Message
Create Task
Upload File
Publish Article
```

all use the same canonical command semantics.

---

## Same validation

Mobile cannot bypass:

* Zod/server validation;
* domain invariants;
* state transition rules;
* authorization;
* required approvals.

---

## Same optimistic concurrency

Mobile's slower network conditions make stale state more likely.

Therefore revision/conflict handling must be particularly strong.

Example:

```text id="5n4q8d"
Mobile opens Deal at revision 12
Desktop changes Deal → revision 13
Mobile submits revision 12
```

Correct:

> Conflict — this Deal changed. Review current version.

Incorrect:

> Mobile update overwrites revision 13.

---

## Same idempotency

Mobile networks may duplicate requests because of:

* retries;
* connection transitions;
* user double taps;
* browser resubmission.

Server-side idempotency remains mandatory.

---

## Same delivery semantics

For outreach:

```text id="2z7k6q"
Message
≠
DeliveryAttempt
≠
ProviderEvent
```

Mobile must not create a mobile-specific send record.

---

## Same conversation semantics

Reply state remains canonical in Inbox/Messaging.

Mobile reply UI does not create a separate reply entity.

---

## Same campaign semantics

Mobile campaign UI does not own campaign state.

Design 090 remains canonical.

---

## Same template semantics

Mobile template picker references exact Template/TemplateVersion context.

It must not create a mobile template copy.

---

## Same project semantics

Mobile project management references canonical Project/Task/Milestone/etc.

---

## Same finance semantics

Mobile invoice/payment screens use canonical:

* Invoice;
* Payment;
* Transaction;
* Reconciliation;

records.

No simplified mobile financial ledger.

---

## Same reporting calculations

Mobile KPI cards must use the same aggregation definitions as desktop.

A mobile summary must not calculate a separate approximation.

---

## Same pagination/filter contract

Presentation can change how results are fetched/rendered but cannot alter authorization or business meaning.

---

## Mobile-specific API optimization

If a mobile-optimized endpoint is eventually introduced, it must remain a **projection/read optimization**, not a separate business backend.

For example:

```text id="1m8y6r"
GET /mobile/project-summary
```

would be acceptable only if it is a projection over canonical Project/Task/etc. truth and uses the same authorization and calculation rules.

It must not become:

```text mobile_project_status
mobile_project_tasks
mobile_project_owner
```

as parallel sources of truth.

---

## Offline writes

Do not introduce offline mutation queues unless the product explicitly supports offline-first behavior.

If eventually introduced, they require explicit:

* idempotency;
* conflict resolution;
* reconciliation;
* authorization;
* audit semantics.

They cannot be silently added as a mobile convenience.

---

## Push notifications

If push notifications are implemented, they remain a delivery channel for canonical Notifications/Events.

Push receipt does not become notification source truth.

---

## Background refresh

Mobile refresh must respect server rate limits.

Do not create aggressive polling because the user has the mobile app open.

---

## Mobile analytics

Device/mobile analytics must not become business metrics.

Example:

```text
mobile screen opened 500 times
```

does not become:

```text
Campaign had 500 engagements
```

---

## Error contracts

Design 150's canonical ProblemDetails contract remains unchanged.

---

## Partial responses

Mobile can request only required sections for performance, but missing sections must be distinguishable from:

* empty;
* unavailable;
* unauthorized.

---

## Cache isolation

Any mobile/browser cache must be tenant/user/session-safe.

Sensitive data must not leak between:

* users;
* workspaces;
* accounts.

---

## File uploads

Mobile upload behavior may differ technically:

* camera;
* photo library;
* document picker.

But uploaded assets remain canonical Design 114/121/etc. file entities.

---

## Image processing

Mobile may upload compressed media.

Server-side canonical asset processing remains authoritative.

---

## Authentication tokens

Mobile presentation cannot expose raw credentials/tokens.

Credential management remains canonical.

---

## API keys

Design 146 remains the authority.

Mobile must never display full API keys merely because screen size changes.

---

## Backend Requirement Matrix

| Requirement                                             | Status                |
| ------------------------------------------------------- | --------------------- |
| No separate mobile business backend                     | **Critical**          |
| Same canonical domain services                          | **Critical**          |
| Same authentication                                     | **Critical**          |
| Same authorization                                      | **Critical**          |
| Same tenant isolation                                   | **Critical**          |
| Same resource identity                                  | **Critical**          |
| Same command semantics                                  | **Critical**          |
| Same validation                                         | **Critical**          |
| Same lifecycle/state transitions                        | **Critical**          |
| Same idempotency                                        | **Critical**          |
| Same optimistic concurrency                             | **Critical**          |
| Same Message/Delivery boundaries                        | **Critical**          |
| Same Campaign/Enrollment boundaries                     | **Critical**          |
| Same Template/Version boundaries                        | **Critical**          |
| Same Project boundaries                                 | **Critical**          |
| Same Finance source truth                               | **Critical**          |
| Same reporting calculations                             | **Critical**          |
| Same ProblemDetails contract                            | **Critical**          |
| Same permission-safe empty/search behavior              | **Critical**          |
| No hidden-record leakage                                | **Critical security** |
| No credential/token exposure                            | **Critical security** |
| No mobile-only business state                           | **Critical**          |
| No unauthorized mobile mutation                         | **Critical security** |
| No blind mobile retries                                 | **Critical**          |
| No automatic offline writes unless explicitly supported | **Critical**          |
| Mobile cache isolation                                  | **Critical security** |
| Mobile upload → canonical asset flow                    | **Critical**          |
| Push → canonical notification flow                      | **High**              |
| Mobile analytics ≠ business metrics                     | **Critical**          |

---

# 8. Consolidation

Design 151's largest risk is **accidentally creating a second application architecture under the name "responsive design."**

The following boundaries must remain permanent.

**Mobile Workspace ≠ Workspace**
Responsive presentation does not create another organization/workspace entity.

**Mobile User ≠ User**
Same identity/session.

**Mobile Permission ≠ Permission**
Same authorization.

**Mobile Route ≠ Business Resource**
Same resource identity.

**Mobile API ≠ Mobile Backend**
Any optimization remains a projection over canonical services.

**Viewport ≠ Business Rule**
390px cannot change domain permissions or lifecycle.

**Breakpoint ≠ Capability Rule**
A feature may be visually reorganized, not silently redefined.

**Mobile State ≠ Domain State**
Design 150 remains state authority.

**Mobile Empty ≠ Separate Empty Entity**
Same semantic empty-state system.

**Mobile Error ≠ Mobile Error Backend**
Same ProblemDetails contract.

**Mobile Retry ≠ Mobile Idempotency**
Server-side idempotency remains mandatory.

**Mobile Offline ≠ Provider Offline**
Device connectivity must not be confused with integration health.

**Mobile Cache ≠ Source Truth**
Cache remains subordinate to canonical services.

**Mobile Notification ≠ Notification Entity**
Same notification system.

**Mobile Conversation ≠ Mobile Reply Entity**
Same Inbox/Messaging model.

**Mobile Campaign ≠ Mobile Campaign**
Same OutreachCampaign.

**Mobile Template ≠ Mobile Template**
Same Template/TemplateVersion.

**Mobile Project ≠ Mobile Project**
Same Project/Task/Milestone records.

**Mobile Invoice ≠ Mobile Invoice**
Same financial source truth.

**Mobile KPI ≠ Mobile Metric**
Same canonical aggregation.

**Mobile Approval ≠ Mobile Approval State**
Same approval workflow.

**Mobile File ≠ Mobile File Entity**
Same canonical asset/file system.

**Mobile Audit ≠ Mobile Audit Log**
Same compliance evidence.

**Mobile Incident ≠ Mobile Incident**
Same System Health/Incident authority.

**Mobile Integration ≠ Mobile Provider Connection**
Same Integration/Connection entities.

---

# 9. Critical Mobile UX Rules

## Never shrink desktop blindly

Desktop UI compressed to 390px is not a mobile design.

---

## Never remove meaning to save space

If secondary information is collapsed, it must remain discoverable.

---

## Never hide primary actions arbitrarily

The main workflow action should remain easy to reach.

---

## Never depend on hover

Every essential desktop hover interaction requires an accessible mobile equivalent.

---

## Never make destructive actions easier to trigger accidentally

Mobile gesture convenience must not override safety.

---

## Never use mobile layout as authorization

This is one of the most important rules:

```text id="w4j9y2"
UI hides action
        ≠
permission granted/denied
```

Backend remains authoritative.

---

## Never duplicate data models for mobile

If the same Project appears differently on mobile and desktop, it is still one Project.

---

## Never turn network uncertainty into failure

Especially for external side effects.

---

## Never turn unavailable data into empty

Preserve Design 150.

---

## Never turn zero into unavailable

Preserve valid analytics/financial truth.

---

## Never turn stale into current

Preserve freshness metadata.

---

## Never let mobile caching cross tenants/users

Security boundary remains absolute.

---

# 10. Mobile Interaction Model

The canonical mobile interaction hierarchy should generally be:

```text id="j4x8s7"
1. Context / navigation
        ↓
2. Primary identity
        ↓
3. Current domain status
        ↓
4. Primary CTA
        ↓
5. Critical information
        ↓
6. Secondary actions
        ↓
7. Related information
        ↓
8. Activity / history
        ↓
9. Secondary metadata
```

This is a **presentation hierarchy**, not a domain hierarchy.

---

# 11. Desktop → Mobile Transformation Rules

| Desktop                   | Mobile                                        |
| ------------------------- | --------------------------------------------- |
| Persistent sidebar        | Drawer / compact navigation                   |
| Multi-column layout       | Stacked sections                              |
| Dense table               | Cards / focused table / horizontal scroll     |
| Large toolbar             | Contextual action bar                         |
| Right detail panel        | Detail section / sheet                        |
| Modal dialog              | Full-screen or bottom sheet where appropriate |
| Hover menu                | Explicit touch menu                           |
| Drag/drop                 | Move action / selector                        |
| Multi-column form         | Single-column form                            |
| Persistent filter sidebar | Filter sheet                                  |
| Wide tabs                 | Scrollable tabs / selector                    |
| Dense chart               | Focused chart / scroll / simplified legend    |
| Gantt                     | Horizontal scroll / focused timeline          |
| Kanban columns            | Horizontal stage navigation                   |
| Desktop breadcrumbs       | Compact back/context navigation               |
| Large activity table      | Event cards                                   |
| Multi-action toolbar      | Primary CTA + overflow                        |
| Side-by-side summary      | Stacked summary                               |

These are presentation transformations only.

---

# 12. Accessibility Certification

Design 151 must pass:

### Navigation

* logical focus order;
* accessible back behavior;
* drawer focus management;
* modal focus trapping where appropriate.

### Touch

* sufficient target size;
* no accidental destructive gestures;
* accessible alternatives to gestures.

### Screen readers

* meaningful headings;
* button names;
* state announcements;
* accessible loading/error states.

### Forms

* labels;
* validation association;
* error announcements;
* keyboard navigation.

### Dynamic content

* new results announced appropriately;
* live updates not excessively interruptive.

### Motion

* reduced-motion support.

### Text

* scalable typography;
* no critical information hidden because of text enlargement.

---

# 13. Performance Certification

Mobile should be treated as a constrained runtime.

The implementation should prioritize:

* fast initial rendering;
* minimal blocking JavaScript;
* server-rendered content where appropriate;
* progressive loading;
* optimized images;
* virtualized long lists;
* efficient caching;
* bounded polling;
* cancellation of obsolete requests;
* avoiding unnecessary duplicate requests.

But:

> **Performance optimization must never alter domain correctness.**

For example:

```text id="3n7k5p"
Do not fetch Finance
```

is acceptable as a lazy-loaded section.

But:

```text
Finance = 0
```

because it was not fetched is forbidden.

---

# 14. Backend/Frontend Failure Scenarios

### Scenario A — Mobile opens Project

```text
Project core       ✓
Tasks              ✓
Files              unavailable
```

Correct:

> Project loads.
> Files section unavailable.

---

### Scenario B — Mobile has permission to view but not edit

Correct:

> View Project

and:

> Edit unavailable

Incorrect:

> Project not found.

---

### Scenario C — Mobile sends outreach message

Network disconnects immediately.

Correct:

> Outcome could not be confirmed.

Then canonical Message/Delivery systems reconcile.

Incorrect:

> Message failed → Send again

without checking outcome.

---

### Scenario D — Mobile opens invoice

Invoice total is `€0`.

Correct:

> €0.00

If the invoice actually has zero total.

Incorrect:

> Amount unavailable.

---

### Scenario E — Report request fails

Correct:

> Report data unavailable
> Retry loading report

if retry is safe.

Incorrect:

> No reports found.

---

### Scenario F — User filters Projects

No results.

Correct:

> No projects match these filters.
> Clear filters.

Incorrect:

> No projects yet.
> Create project.

---

### Scenario G — Session expires

Correct:

> Session expired → authenticate → reauthorize → safely continue/recover.

Incorrect:

> You don't have permission.

---

### Scenario H — Mobile opens restricted entity

Correct:

> Safe unavailable/not-found state according to authorization disclosure policy.

Incorrect:

> Project ACME exists, but you lack `project.read.private`.

---

# 15. Implementation Verdict

## **PASS — CANONICAL RESPONSIVE MOBILE TEAM WORKSPACE PRESENTATION & INTERACTION ANCHOR**

**Core directive:**
**Mobile Workspace ≠ separate product architecture.**

**Entity directive:**
Design 151 owns no persistent business entities, resource identities, permissions, workflow states, metrics, notifications, audit events, or provider connections.

**Source-of-truth directive:**
Desktop and mobile resolve to the same canonical backend/domain truth.

**Responsive directive:**
Mobile changes presentation, density, hierarchy, navigation, touch interaction and control placement—not business meaning.

**Viewport directive:**
Viewport width/breakpoint must never determine authorization, lifecycle, ownership, workflow validity, financial calculations, delivery status, or other domain truth.

**Routing directive:**
Responsive routes, deep links and resource navigation continue to resolve against the same canonical resources.

**Authorization directive:**
Design 144 remains the sole permission authority. Mobile hiding, disabling, collapsing or relocating an action is never authorization.

**Authentication directive:**
The same authentication/session architecture applies across devices.

**Tenant directive:**
Tenant/workspace context is server-authoritative and cannot be inferred from mobile UI state.

**State directive:**
Design 150 remains the canonical state system. Mobile must preserve Loading, Empty, Partial, Stale, Unknown, Permission, Validation, Conflict, Rate Limit, Dependency Failure and Outcome-Unknown semantics.

**Empty directive:**
First-use, filtered, search and contextual empty states remain distinct.

**Failure directive:**
Mobile network failure cannot automatically become business-operation failure.

**Outcome directive:**
External side effects with uncertain outcomes must use canonical reconciliation semantics and cannot receive a blind mobile Retry action.

**Idempotency directive:**
Mobile double taps, network retries, browser retries and reconnection behavior must remain safe through backend idempotency, not button disabling alone.

**Concurrency directive:**
Mobile stale revisions must receive canonical conflict handling rather than overwrite newer state.

**Partial directive:**
A failed mobile section must not automatically destroy the usable remainder of the workspace.

**Data directive:**
Mobile cards, summaries, charts and simplified lists remain projections of canonical data, not alternate datasets.

**Metric directive:**
Mobile KPIs and reports use the same canonical aggregation definitions.

**Search directive:**
Mobile search uses the same authorization-safe search semantics and must not leak hidden results.

**Filter directive:**
Mobile filter sheets/selectors preserve canonical filter semantics.

**Campaign directive:**
Mobile Outreach UI continues to respect:

```text
Campaign
≠ CampaignVersion
≠ SequenceVersion
≠ AudienceSnapshot
≠ Enrollment
≠ Lead
≠ Message
≠ Conversation
≠ SendingAccount
≠ DeliveryAttempt
```

**Template directive:**
Mobile template selection references exact Template/TemplateVersion context and never creates mutable mobile copies.

**Inbox directive:**
Mobile replies remain canonical Messages within Conversations.

**Project directive:**
Mobile Project screens remain presentations of the same Project/Task/Milestone/Approval/Request/Change/Timeline entities.

**Finance directive:**
Mobile Contract/Invoice/Payment views remain presentations of canonical financial records.

**Publishing directive:**
Mobile Publishing/Distribution views cannot create mobile-only publication or distribution states.

**Reporting directive:**
Mobile reports cannot silently use simplified calculations that disagree with desktop/canonical reporting.

**Notification directive:**
Mobile notification presentation remains downstream of the canonical Notification system.

**Audit directive:**
Mobile audit views remain read/presentation surfaces over canonical compliance evidence.

**Incident directive:**
Mobile does not create or infer Incidents from local network/server errors.

**Integration directive:**
Mobile integration screens preserve the separation:

```text
Integration
≠ ProviderConnection
≠ Credential
≠ ConnectionHealth
```

**Cache directive:**
Mobile/browser caches are never source truth and must remain isolated by tenant/user/security context.

**Offline directive:**
No implicit offline-write architecture is introduced. Offline mutation queues require a separately governed architecture if ever added.

**File directive:**
Camera/photo/document uploads still resolve into canonical asset/file entities.

**Security directive:**
Mobile cannot expose secrets, tokens, API keys, hidden resources, unauthorized counts, or privileged metadata.

**Interaction directive:**
Touch gestures, sheets, drawers, swipes and long-press interactions must always have safe and accessible alternatives for important functionality.

**Destructive-action directive:**
Mobile convenience must never reduce confirmation/safety requirements for destructive or irreversible commands.

**Accessibility directive:**
Mobile must support screen readers, dynamic state announcements, focus management, touch targets, text scaling, reduced motion and accessible validation/error presentation.

**Performance directive:**
Mobile optimizations may reduce payload and improve rendering but can never replace unavailable data with empty/zero values or bypass canonical domain processing.

**No-mobile-backend directive:**
There must be **no parallel mobile domain backend, mobile business database, mobile lifecycle engine, mobile authorization engine, mobile notification store, or mobile reporting calculation engine.**

**Projection directive:**
If mobile-specific API projections are introduced for performance, they remain read/projection optimizations over canonical entities and authorization rules—not new sources of truth.

**Responsive-design directive:**
Desktop, tablet and mobile are different presentations of the same product model.

**Design-150 dependency:**
All mobile state presentation must inherit Design 150 rather than defining independent loading/error/empty/permission primitives.

**Design-152 dependency:**
The next responsive-system design must preserve the same canonical domain, state, permission, accessibility and backend contracts.

**Design-153 dependency:**
Final component-system certification must consolidate mobile/desktop variants into reusable primitives rather than creating duplicate component families.

**Consolidation directive:**
**ONE TEAM WORKSPACE + ONE DOMAIN MODEL + ONE AUTHORIZATION MODEL + ONE STATE MODEL + ONE COMMAND MODEL + ONE SOURCE OF TRUTH, WITH RESPONSIVE MOBILE AS A PRESENTATION/INTERACTION VARIANT ONLY — NEVER A SECOND BACKEND, SECOND DATABASE, SECOND PERMISSION SYSTEM, SECOND BUSINESS STATE MACHINE, SECOND METRIC ENGINE, SECOND NOTIFICATION STORE, OR MOBILE-SPECIFIC SOURCE OF TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |         Count |
| ------------------------------------------ | ------------: |
| **Audited**                                | **151 / 153** |
| **PASS**                                   |       **151** |
| **STANDARDIZE decisions**                  |       **149** |
| **Potential implementation-overlap flags** |       **151** |
| **MERGE screen candidates**                |         **0** |
| **FIX BEFORE CODE**                        |         **0** |
| **New business entities introduced**       |         **0** |

**151 / 153 = 98.69% audited.**

### Canonical architecture after Design 151

```text
                  CANONICAL DOMAIN
                        │
                        ↓
              Authentication / Tenant
                        │
                        ↓
                 Authorization
                        │
                        ↓
                Domain Services
                        │
                        ↓
             Canonical Data / Commands
                        │
                        ↓
                 Design 150 State
                        │
              ┌─────────┴─────────┐
              ↓                   ↓
       Desktop/Tablet          Mobile
       Presentation           Presentation
              │                   │
              └─────────┬─────────┘
                        ↓
                Same Business Truth
```

The critical architectural conclusion is:

> **Design 151 does not create a “mobile version” of the Team Workspace at the domain level. It creates the mobile presentation of the same Team Workspace.**

That means a user can perform the following sequence without crossing architectural boundaries:

```text
Desktop
Lead → Campaign → Message → Reply
                 ↓
              Mobile
                 ↓
Conversation → Follow-up → Deal
                 ↓
              Desktop
                 ↓
Proposal → Contract → Invoice → Payment
                 ↓
              Mobile
                 ↓
Project → Tasks → Approval → Completion
```

Every step remains on the same canonical entity graph.

## Next Sequential Audit Target

### **Design 152 — next frozen design in sequence**

It should be audited only when explicitly requested, under the same unchanged audit contract.
