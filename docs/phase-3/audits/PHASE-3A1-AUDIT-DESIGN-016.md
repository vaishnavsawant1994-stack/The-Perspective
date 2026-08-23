Correct. I verified the next commercial workspace against the frozen Perspective architecture and the completed design asset: the next approved screen is **Deals Pipeline**. The architecture places the Deal Pipeline immediately after the Meetings/Communication layer and defines it as the Kanban opportunity workspace; the completed visual asset is likewise titled **“Deals Pipeline”** and contains the approved pipeline KPIs, stage columns, filters, deal cards, health indicators, and quick-detail drawer.  

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 016 — Deals Pipeline

| Audit field                 | Classification                                                                                                                                                          |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **016**                                                                                                                                                                 |
| **Canonical name**          | **Deals Pipeline**                                                                                                                                                      |
| **Product area**            | Sales / Deals / Commercial Pipeline                                                                                                                                     |
| **User surface**            | Team Workspace                                                                                                                                                          |
| **Screen class**            | Pipeline Board / Opportunity Management Workspace                                                                                                                       |
| **Classification**          | **Unique Anchor — Pipeline Board Family**                                                                                                                               |
| **Primary purpose**         | Manage active commercial opportunities from qualification through closure while preserving stage, value, probability, owner, health, next action and commercial lineage |
| **Primary entity**          | **Deal**                                                                                                                                                                |
| **Supporting entities**     | Lead, Contact, Company, User/Owner, Meeting, FollowUp, Activity, Proposal, Package, Campaign                                                                            |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                         |
| **Template family**         | `PipelineBoardTemplate`                                                                                                                                                 |
| **Auth**                    | Required                                                                                                                                                                |
| **Permissions**             | Deal read/create/edit/move + record/team/department scope                                                                                                               |
| **Implementation priority** | **Core / Critical**                                                                                                                                                     |
| **Reuse level**             | **Extremely High**                                                                                                                                                      |

The frozen architecture defines Deal Pipeline as a stage-based Kanban view of opportunities carrying stage, value, probability, owner, next action and expected-close information, while Deal Detail is the subsequent record-level workspace. 

---

## 1. Functional responsibility

Design 016 answers:

> **“Which commercial opportunities exist, where is each opportunity in the sales process, how valuable and healthy is it, and what needs to happen to close it?”**

The upstream relationship now becomes:

```text
Lead
Design 011
   ↓
Outreach / Conversation
012–014
   ↓
Meeting / Follow-up
Design 015
   ↓
Commercial intent confirmed
   ↓
DEAL
Design 016
```

The downstream flow becomes:

```text
Deal
 ↓
Proposal
 ↓
Negotiation
 ↓
Contract
 ↓
Invoice
 ↓
Payment
 ↓
Client / Project
```

The Deal Pipeline therefore becomes the commercial bridge between **sales engagement** and **formal commercial execution**.

---

# 2. Lead ≠ Deal

This distinction established during Design 011 becomes operational here.

### Lead

Represents:

> **A prospect being evaluated or pursued.**

### Deal

Represents:

> **A defined commercial opportunity with potential economic value.**

For example:

```text
Lead:
Arjun Mehta
TechNova Solutions
```

may produce:

```text
Deal:
TechNova Solutions — Premium Personal Magazine
Value: $150,000
```

The Lead should not be deleted when conversion occurs.

Instead:

```text
Lead
 └── convertedToDealId
          ↓
        Deal
```

or equivalent canonical linkage.

This preserves acquisition and conversion attribution.

---

# 3. Deal ≠ Company

A Company can have many Deals.

```text
TechNova Solutions
│
├── Deal A — Personal Magazine
├── Deal B — Podcast Partnership
└── Deal C — Annual Content Package
```

Therefore Company commercial totals should be aggregates over Deals—not properties stored directly as one company opportunity value.

---

# 4. Deal ≠ Proposal

This is critical because Proposal follows the opportunity.

### Deal

The commercial opportunity.

### Proposal

A particular commercial offer/document issued during that opportunity.

Conceptually:

```text
Deal
│
├── Proposal v1
├── Proposal v2
└── Proposal v3
```

Depending on the final business rules, multiple proposals or proposal versions may relate to one Deal.

Therefore:

```text
Deal status
≠
Proposal status
```

A Deal can remain:

**NEGOTIATION**

while the latest Proposal is:

**SENT**

or:

**VIEWED**

or:

**EXPIRED**.

---

# 5. Deal ≠ Contract

Likewise:

```text
Deal
 ↓
Accepted commercial intent
 ↓
Contract
```

The Deal may become Closed Won based on the canonical business rule, but Contract execution remains a different legal lifecycle.

We should not make:

```text
Deal stage = SIGNED
```

the only way to represent contract signature.

The Contract has its own lifecycle and source record.

---

# 6. Canonical Deal Pipeline regions

The completed visual design confirms that Design 016 contains headline metrics such as **Total Pipeline Value, Open Deals, Weighted Pipeline, Expected Revenue, Deals Won, Win Rate, Average Deal Size, Average Sales Cycle and Closing This Month**, followed by pipeline filters and Kanban stages. 

Implementation should normalize those into:

### Commercial KPI strip

Canonical metrics may include:

**Total Pipeline Value**
**Weighted Pipeline**
**Expected Revenue**
**Open Deals**
**Won Deals**
**Win Rate**
**Average Deal Size**
**Average Sales Cycle**
**Closing This Period**

### Pipeline controls

The approved design includes controls around:

**pipeline selection**
**Kanban/List view**
**owner**
**product/package**
**source**
**close date**
**probability**
**deal health**
**saved views**
**filters**. 

### Stage board

Each stage contains:

**deal cards**
**stage count**
**stage value**
**probability/default stage context**

### Secondary intelligence

The approved visual also includes summaries such as **Pipeline by Owner, Deals Closing This Month, Pipeline Health, Stalled Opportunities**, plus a Deal quick-detail panel. 

---

# 7. Pipeline architecture

A Deal belongs to a Pipeline and one Pipeline Stage.

Conceptually:

```text
DealPipeline
│
├── Qualified
├── Interested
├── Discovery Scheduled
├── Discovery Completed
├── Proposal Preparation
├── Proposal Sent
├── Negotiation
├── Contract Review
├── Closed Won
└── Closed Lost
```

The exact stage set must come from the frozen business configuration, not hard-coded assumptions in the React page.

The visual design itself already demonstrates multiple business stages including **Qualified, Interested, Discovery Scheduled, Discovery Completed, Proposal Preparation and Proposal Sent**. 

---

# 8. Pipeline stage should be configurable

A dangerous implementation would be:

```ts
if (stage === "Proposal Sent") { ... }
```

spread across dozens of components.

Instead:

```text
DealPipeline
      ↓
PipelineStage definitions
      ↓
Deal.stageId
```

The stage can carry canonical configuration such as:

```text
name
position
defaultProbability
allowedTransitions
won/lost semantics
```

This allows the pipeline to evolve without rewriting every screen.

---

# 9. Stage vs Deal status

We should distinguish pipeline position from terminal/commercial lifecycle where needed.

For example:

```text
Pipeline Stage:
NEGOTIATION

Deal Lifecycle:
OPEN
```

Then:

```text
Pipeline Stage:
CLOSED_WON

Deal Lifecycle:
WON
```

Exact schema comes later.

The key rule is:

> **Do not create five separate fields that all attempt to describe the same sales position, but also do not overload one field with unrelated health, probability, and closure reason.**

---

# 10. Deal health is separate

The approved design explicitly includes Deal Health / Pipeline Health concepts such as **On Track, At Risk, Stalled and No Activity**. 

Therefore:

```text
Deal Stage:
PROPOSAL_SENT

Deal Health:
AT_RISK
```

is valid.

And:

```text
Deal Stage:
DISCOVERY_COMPLETED

Deal Health:
ON_TRACK
```

is also valid.

Health should be a derived operational condition based on signals such as:

**time in stage**
**next action**
**activity recency**
**close date proximity**
**missing commercial actions**

The frontend should consume the canonical health calculation.

---

# 11. Deal probability is independent

The approved UI shows probability on Deal cards/detail. 

Probability should not necessarily be identical to Stage.

For example:

```text
Stage default probability: 50%
Deal probability override: 70%
```

if the product allows manual/derived overrides.

The architecture should define:

```text
stageDefaultProbability
dealProbability
probabilitySource
```

or equivalent.

---

# 12. Weighted pipeline

A canonical formula might conceptually be:

```text
Weighted Value =
Deal Value × Probability
```

but the exact handling of:

* closed deals,
* multiple currencies,
* null probabilities,
* custom forecast categories,

must be centralized.

Design 016 must not calculate Weighted Pipeline with its own frontend-only formula if Design 004 or Design 135 uses another.

---

# 13. Forecast vs Pipeline

These concepts should not be collapsed.

### Pipeline

All active commercial opportunity value.

### Weighted Pipeline

Opportunity value adjusted by probability.

### Forecast / Commit

A separate sales prediction/forecast classification if supported.

Example:

```text
Pipeline Value: $3.2M
Weighted Pipeline: $1.8M
Forecast Commit: $950K
```

All three can differ legitimately.

---

# 14. Deal amount / commercial currency

A Deal should preserve:

```text
amount
currency
```

and, where consolidated reporting needs it:

```text
reportingAmount
reportingCurrency
fxContext
```

The pipeline must not add USD, EUR, GBP, etc. as though they were one currency.

This aligns with the financial integrity requirements already identified in Design 007.

---

# 15. Deal card model

A reusable Deal card can conceptually contain:

```text
DealCard
├── company/contact
├── deal title
├── product/package
├── amount
├── probability
├── owner
├── expected close
├── health
├── last activity
└── next action
```

The approved mockup shows this combination across its Kanban cards and detail drawer. 

This card should become a reusable component rather than each Pipeline column manually rendering its own markup.

---

# 16. Drag-and-drop is a business command

Dragging a Deal from:

```text
Discovery Completed
          ↓
Proposal Preparation
```

is not merely visual reordering.

It means:

> **Request a canonical stage transition.**

Correct:

```text
Drag
 ↓
request stage transition
 ↓
permission check
 ↓
transition validation
 ↓
business side effects
 ↓
persist
 ↓
activity/audit
 ↓
UI confirms
```

Not:

```text
setState(newColumn)
```

---

# 17. Transition rules must be authoritative server-side

Potential rules may include:

**required fields**
**required meeting outcome**
**required proposal**
**permission**
**mandatory loss reason**

For example:

```text
Move to Proposal Sent
      ↓
Proposal exists?
      ↓
YES → transition allowed
NO  → reject / require action
```

if that is part of the final workflow policy.

The frontend can explain the rule but must not be the only enforcement.

---

# 18. Won transition

Moving to **Closed Won** is a major business event.

Potential controlled sequence:

```text
Deal
 ↓
Validate required commercial state
 ↓
Mark Won
 ↓
Create conversion event
 ↓
Trigger client/onboarding handoff
 ↓
Preserve activity + audit
```

Whether Contract signature/payment is required *before* Won depends on the final business state machine.

The audit does not invent that rule.

It establishes that Won is a canonical domain transition.

---

# 19. Lost transition

Closed Lost must preserve context.

Conceptually:

```text
Deal
├── lifecycle = LOST
├── lossReason
├── lossNotes
├── closedAt
└── closedBy
```

Possible reasons should eventually be structured.

The Deal should not simply disappear from the Pipeline.

Loss data is essential for analytics.

---

# 20. Reopening a Deal

If the business allows reopening:

```text
Closed Lost
     ↓
Reopened
```

the system should preserve:

**previous close event**
**previous reason**
**reopen actor/time**

rather than deleting the historical closure.

Exact rules belong to Phase 3D.

---

# 21. Expected close date

Expected close is not just a display date.

It drives:

* forecasting,
* reminders,
* closing-this-month metrics,
* stale opportunity detection,
* dashboard summaries.

Changes should therefore contribute to meaningful activity history.

---

# 22. Deal age vs stage age

These should be distinguishable.

### Deal age

Time since Deal creation.

### Stage age

Time since entering current Stage.

A Deal can be:

```text
Deal Age: 45 days
Stage Age: 4 days
```

This becomes useful for identifying stalled opportunities.

---

# 23. Stalled detection

The approved visual explicitly surfaces **Stalled Opportunities** and “No activity for X days.” 

Stalled should ideally be derived from canonical policy:

```text
stageAge
+
lastMeaningfulActivityAt
+
nextAction
+
dealStagePolicy
```

rather than stored as a manual red badge.

---

# 24. Next Action architecture

Design 015 already established the canonical Next Action resolver.

Design 016 should reuse it.

Correct:

```text
Deal
 ↓
Meetings / FollowUps / Tasks
 ↓
NextActionResolver
 ↓
"Discovery Call — May 20"
```

The Deal Pipeline should not maintain an independent conflicting `nextActionText`.

The approved visual itself shows a **Next Action** inside the deal drawer, reinforcing this cross-workspace requirement. 

---

# 25. Relationship to Meetings

Meeting outcomes can inform Deal progression.

But:

```text
Meeting completed
≠
automatically change Deal stage
```

unless a canonical workflow rule explicitly says so.

Safer architecture:

```text
Meeting outcome
      ↓
Deal context updated
      ↓
recommended/allowed transition
      ↓
Deal Service performs transition
```

---

# 26. Relationship to Proposal

The approved Deal Pipeline provides quick actions including **Create Proposal**, and the frozen route architecture places Proposal work after Deal Detail.  

Correct relationship:

```text
Deal
 ↓
Proposal
 ↓
Proposal Review / Approval
 ↓
Send
```

Proposal commercial amount may originate from the Deal/package context, but the Proposal retains its own versioned commercial terms.

---

# 27. Product/package relationship

Design 016 shows product/package filters and Deal cards with package labels. 

The Deal should reference a canonical Product/Package where applicable.

Potentially it also needs a **commercial snapshot** when the package changes later.

Example:

```text
Deal created using:
Premium Magazine Package v3
$150,000
```

If Package v4 becomes $175,000 next month, the old Deal should not silently change price.

This is a future snapshot/versioning requirement.

---

# 28. Relationship to Campaign/source

The Deal should retain acquisition/commercial lineage:

```text
Lead Source
 ↓
Lead
 ↓
Campaign
 ↓
Reply
 ↓
Meeting
 ↓
Deal
```

The approved Deal detail drawer includes **Source, Campaign and Lead** context. 

This allows meaningful attribution later.

---

# 29. Ownership architecture

A Deal requires a canonical owner.

Potential scope includes:

```text
ownerUserId
teamId
departmentId
```

where applicable.

Reassignment should preserve history:

```text
John
 ↓
Emma
 ↓
Michael
```

instead of replacing the old owner with no trace.

---

# 30. Deal team vs owner

Potential future Deal collaboration may involve more than one staff member.

The architecture should not make that impossible.

But primary **Deal Owner** remains separate from supporting participants.

The audit does not add a new Deal Team screen.

---

# 31. Pipeline by Owner

The approved design contains **Pipeline by Owner**. 

That metric should derive from the same canonical ownership + Deal query model.

Do not manually maintain:

```text
john.pipelineValue
```

as a separate mutable counter.

---

# 32. Saved views

Design 016 should reuse the Saved View infrastructure discovered in Design 011.

Examples:

**My Deals**
**Closing This Month**
**At Risk**
**High Value**
**No Activity**
**Proposal Sent**

A Saved View remains:

```text
query + filters + presentation
```

not a duplicated dataset.

---

# 33. Kanban + List are two views over one query model

The approved design includes both **Kanban** and **List** view controls. 

These should consume one canonical Deal query model:

```text
DealQuery
  ↓
┌──────────────┬──────────────┐
Kanban View    List View
```

Not two separate Deal APIs with inconsistent filtering.

---

# 34. Pipeline quick-detail drawer

The completed Design 016 includes a right-side Deal Overview drawer with tabs/context and quick actions. 

This should use a reusable:

```text
RecordQuickViewDrawer
```

pattern.

Its purpose:

**inspect + perform lightweight actions**

not replace full Deal Detail.

Therefore:

```text
Pipeline card click
    ↓
Quick View
    ↓
Open Full Deal
    ↓
later Deal Detail workspace
```

---

# 35. Quick-detail vs Deal Detail

This separation matters because the next deeper screen will have much richer commercial context.

### Quick drawer

Optimized for:

* glance,
* stage move,
* meeting,
* task/follow-up,
* note,
* open full record.

### Deal Detail

Optimized for:

* complete opportunity history,
* contacts/company,
* meetings,
* proposals,
* contracts,
* invoices,
* activity,
* commercial operations.

Do not turn the drawer into an entire Deal 360 implementation.

---

# 36. Reusable component mapping

Design 016 establishes or reuses:

`PipelineBoard`
`PipelineColumn`
`PipelineColumnHeader`
`DealCard`
`DealValue`
`DealProbability`
`DealHealthBadge`
`ExpectedCloseIndicator`
`PipelineFilters`
`PipelineViewToggle`
`SavedViewSelector`
`StageMoveAction`
`RecordQuickViewDrawer`
`PipelineOwnerChart`
`ClosingDealsWidget`
`StalledOpportunityWidget`

Shared primitives come from Designs 011 and 153.

---

# 37. New page-family finding

We now formally add:

```text
Pipeline Board Family
        │
        └── 016 Deals Pipeline
```

Later screens such as:

**Renewal Pipeline**
certain workflow boards
editorial production boards

may share board primitives.

But domain transitions remain separate.

---

# 38. Pipeline Board vs Project Workflow Board

This is a future consolidation boundary.

They can share:

`BoardColumn`
`DraggableCard`
`BoardToolbar`
`FilterBar`

but:

```text
Deal Pipeline Engine
≠
Project Workflow Engine
```

Moving a Deal means commercial-stage transition.

Moving a Project means operational workflow transition.

Shared visual components must not force shared business semantics.

---

# 39. Permission architecture

Potential capability dimensions later include:

```text
deal.read
deal.create
deal.edit
deal.assign
deal.move
deal.close_won
deal.close_lost
deal.reopen
deal.export
```

Exact names belong to Phase 3D.

The key distinction is:

```text
VIEW DEAL
≠
EDIT DEAL
≠
MOVE STAGE
≠
MARK WON/LOST
```

A Finance user may need read access to a Deal supporting a Contract/Invoice without gaining authority to move the sales pipeline.

---

# 40. Scope architecture

The frozen route architecture identifies Sales, Managers and Admin as core users of the Deal Pipeline. 

Typical scope should support:

### Sales Executive

Own/assigned Deals.

### Sales Manager

Team/department Deals.

### Admin/Executive

Broader organization access.

### Account Manager

Relevant Deal visibility where required for converted clients/handoffs.

The backend must enforce this before returning cards or aggregate values.

---

# 41. Aggregate permission leakage

This is particularly important.

If a user may only view their own Deals, the KPI:

> Total Pipeline Value

must be calculated for **their authorized scope**.

The backend must not send organization-wide:

```text
$3.2M
```

and merely hide the other users' cards.

Aggregates themselves are permission-sensitive.

---

# 42. Export boundary

As with Leads:

```text
READ ≠ EXPORT
```

Export can expose:

* commercial values,
* client information,
* expected close dates,
* internal opportunity notes.

It requires explicit authorization and audit history.

---

# 43. Drag-and-drop accessibility

The visual Pipeline is naturally drag-oriented.

But stage movement must not require drag exclusively.

Accessible alternatives should include:

**Move Stage menu**
keyboard interaction
touch-safe move action.

The approved quick-detail design itself includes a **Move Stage** action, which is a good reusable non-drag pathway. 

---

# 44. Responsive contract — Desktop

Design 016's desktop experience should preserve the approved dense horizontal Kanban board, KPI layer, filters and quick-detail drawer. 

Desktop is the richest pipeline-management surface.

---

# 45. Responsive contract — Tablet

Following Design 152:

**Landscape**
can preserve a horizontally scrollable stage board with 2–3 visible columns.

**Portrait**
should prioritize:

```text
Stage selector
↓
Deals in selected/grouped stage
```

or compact vertical board grouping.

Drag must have touch-safe alternatives.

The quick-detail drawer may become a wider overlay/full-screen detail depending on width.

---

# 46. Responsive contract — Mobile

Following Design 151, do not shrink ten Kanban columns into a tiny horizontal board.

Recommended transformation:

```text
Pipeline summary
↓
Stage tabs / stage selector
↓
Deal cards
↓
Open / Move Stage / Follow-up
```

A mobile Deal card should prioritize:

**Deal / Company**
**Value**
**Stage**
**Health**
**Owner**
**Expected Close**
**Next Action**

---

# 47. Mobile urgent actions

Core Deal actions should remain available:

**Open Deal**
**Move Stage**
**Schedule Follow-up**
**Open Meeting**
**Create Proposal where appropriate**

while complex pipeline configuration remains desktop-oriented.

---

# 48. State coverage

Design 016 inherits Design 150 plus Deal-specific states:

**No Deals Yet**
**No Deals in Stage**
**No Results After Filters**
**Pipeline Loading**
**Pipeline Refreshing**
**Stage Transition Pending**
**Stage Transition Rejected**
**Record Updated Elsewhere**
**Deal Won**
**Deal Lost**
**Permission Restricted**
**Partial Analytics Failure**
**Pipeline Configuration Missing/Invalid**
**API Failure**

A column with zero Deals is a normal stage state—not an application error.

---

# 49. Optimistic stage movement

A Deal can appear to move immediately for responsiveness, but the UI needs rollback behavior if the canonical command fails.

Example:

```text
User moves Deal
      ↓
UI shows pending transition
      ↓
Server rejects:
"Proposal required"
      ↓
Card returns to original stage
      ↓
Actionable error shown
```

Do not permanently move local state before authoritative confirmation.

---

# 50. Concurrency

Two users can move the same Deal simultaneously.

Example:

```text
User A:
Proposal Sent → Negotiation

User B:
Proposal Sent → Closed Lost
```

The backend must reject stale transitions or force reconciliation.

A revision/version check is needed around meaningful Deal changes.

---

# 51. Transition audit history

Important events include:

**Deal created**
**Deal assigned/reassigned**
**Deal value changed**
**Probability changed**
**Expected close changed**
**Stage changed**
**Proposal created**
**Marked Won**
**Marked Lost**
**Reopened**

A stage-change event should preserve:

```text
fromStage
toStage
actor
timestamp
reason/context
```

where applicable.

---

# 52. Activity vs audit

As elsewhere:

### Activity

Human-readable business timeline.

> John moved Deal from Discovery to Proposal Preparation.

### Audit

Stronger compliance/system record.

May contain before/after values and system metadata.

They can be generated from the same command but serve different purposes.

---

# 53. Server-side query architecture

Recommended:

```text
DealsPipeline UI
      ↓
DealPipelineQueryService
      ↓
Tenant + Permission Scope
      ↓
Deal Query
      │
      ├── Stage groups
      ├── Aggregate values
      ├── Health
      ├── Owner
      ├── Next Action
      └── Forecast data
```

Commands:

```text
DealPipeline UI
      ↓
DealCommandService
      │
      ├── Create
      ├── Assign
      ├── Move Stage
      ├── Update Probability
      ├── Update Value
      ├── Close Won
      └── Close Lost
```

---

# 54. Canonical transition service

Stage changes must run through one service:

```text
moveDealStage()
```

or equivalent domain command.

Not:

```text
Deal.update({ stageId })
```

from arbitrary API endpoints.

Why?

Because transition logic may need:

**validation**
**permissions**
**required data**
**automations**
**activity**
**audit**
**notifications**
**handoff triggers**

---

# 55. Won Deal handoff

This will become extremely important later around Design 106 — Client Conversion / Won Deal Handoff.

Therefore Design 016 should not directly create an entire Client/Project ad hoc.

Conceptually:

```text
Deal Closed Won
       ↓
Commercial Conversion / Handoff Service
       ↓
Client relationship
       ↓
Contract / Billing / Onboarding / Project
```

Exact timing is defined later.

This keeps the Deal domain clean.

---

# 56. Backend requirements

| Requirement                  | Status                  |
| ---------------------------- | ----------------------- |
| Authentication               | **Required**            |
| Tenant isolation             | **Critical**            |
| Deal RBAC/scoping            | **Critical**            |
| Canonical Deal entity        | **Critical**            |
| Pipeline/Stage configuration | **Critical**            |
| Server-side board query      | **Required**            |
| Stage transition service     | **Critical**            |
| Transition validation        | **Critical**            |
| Owner/assignment history     | **Required**            |
| Probability/value model      | **Critical**            |
| Currency-safe amounts        | **Critical**            |
| Next Action resolver         | **Required**            |
| Health/stalled derivation    | **Required**            |
| Lead/Contact/Company links   | **Critical**            |
| Proposal relationship        | **Critical**            |
| Won/Lost history             | **Critical**            |
| Concurrency protection       | **Required**            |
| Bulk/mass stage actions      | Controlled if supported |
| Activity history             | **Required**            |
| Audit history                | **Required**            |
| Permission-scoped aggregates | **Critical**            |

---

# 57. Canonical metric contract

The following need centralized definitions:

**Pipeline Value**
**Weighted Pipeline**
**Expected Revenue**
**Open Deal**
**Won Deal**
**Lost Deal**
**Win Rate**
**Average Deal Size**
**Average Sales Cycle**
**Closing This Month**
**Stalled Deal**
**At-Risk Deal**

These appear across the approved Deals Pipeline visual and later analytics/reporting surfaces. 

They must be shared by:

**Design 003 — Executive Dashboard**
**Design 004 — Sales Dashboard**
**Design 016 — Deals Pipeline**
**later Deal Detail**
**Design 135 — Analytics Executive Dashboard**
**Reporting**

---

# 58. Main implementation risks

The Design 016 audit flags:

**Lead/Deal conflation**
Treating a qualified Lead and a Deal as the same row.

**Stage hard-coding**
Pipeline business stages embedded throughout frontend code.

**Drag-only business logic**
Kanban movement working visually but not canonically.

**Status overload**
Stage, health, lifecycle and probability collapsed into one field.

**Metric drift**
Different screens calculating pipeline value differently.

**Permission leakage through KPIs**
Restricted Deals hidden but their value still included in aggregate totals.

**Lost commercial history**
Closing/reopening Deals overwriting previous transitions.

**Next-action duplication**
Deal storing arbitrary next action separate from Follow-ups/Meetings.

**Client-side currency arithmetic**
Unsafe multi-currency pipeline totals.

**Quick-view overgrowth**
Drawer becoming a second Deal Detail implementation.

**Concurrency failure**
Two users moving the same opportunity with silent overwrite.

**Won-stage side effects scattered across UI code**
Client/project creation firing independently from multiple screens.

These are architectural concerns. **No new visual design is required.**

# Design 016 Audit Verdict

## **PASS — PIPELINE BOARD ANCHOR**

**Template directive:** Design 016 establishes the reusable `PipelineBoardTemplate` and canonical stage-board primitives.

**Domain directive:** **Lead ≠ Deal ≠ Proposal ≠ Contract.**

**Pipeline directive:** Deals reference configurable canonical Pipeline/Stage definitions rather than frontend-hard-coded stage strings.

**Transition directive:** Every stage movement—including drag-and-drop—is a server-authoritative domain command with permission, validation, activity and audit behavior.

**Health directive:** Deal Stage and Deal Health remain separate dimensions.

**Value directive:** Deal amount, probability, weighted value and forecast remain explicitly defined and currency-safe.

**Next-action directive:** Design 016 consumes the canonical Meeting/Follow-up Next Action system established by Design 015.

**Conversion directive:** Closed Won triggers a controlled downstream handoff rather than scattered page-specific client/project creation logic.

**Permission directive:** Deal records and pipeline aggregates must both respect effective scope.

**Responsive directive:** Desktop retains Kanban productivity; tablet/mobile transform to stage-grouped deal cards with accessible stage-move controls instead of miniature desktop boards.

**Reuse directive:** Future Pipeline/Board screens may share visual board primitives while maintaining their own domain transition engines.

**Consolidation directive:** **STANDARDIZE BOARD INFRASTRUCTURE — DO NOT MERGE DEAL PIPELINE WITH DEAL DETAIL, PROJECT WORKFLOW BOARDS, RENEWAL PIPELINES OR ANALYTICS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                           Count |
| ------------------------------------------ | ------------------------------: |
| **Audited**                                |                    **16 / 153** |
| **PASS**                                   |                          **16** |
| **STANDARDIZE decisions**                  |                          **14** |
| **Potential implementation-overlap flags** |                           **7** |
| **MERGE screen candidates**                | **0 pending later comparisons** |
| **FIX BEFORE CODE**                        |                           **0** |
| **New designs**                            |                           **0** |

### Reusable page families discovered so far

```text
InternalAppShell
│
├── Dashboard Family
│   └── 003–007
│
├── Data Acquisition Family
│   └── 008–009
│
├── Data Quality / Enrichment Family
│   └── 010
│
├── CRM List Workspace Family
│   └── 011
│
├── Campaign Operations Family
│   └── 012
│
├── Versioned Workflow Builder Family
│   └── 013
│
├── Unified Communication Workspace Family
│   └── 014
│
├── Action & Scheduling Workspace Family
│   └── 015
│
└── Pipeline Board Family
    └── 016 Deals Pipeline
```

The end-to-end sales chain has now reached the commercial opportunity layer:

```text
DISCOVER
008
 ↓
EXTRACT
009
 ↓
ENRICH
010
 ↓
LEAD CRM
011
 ↓
OUTREACH
012–013
 ↓
REPLY / INBOX
014
 ↓
MEETING / FOLLOW-UP
015
 ↓
DEAL PIPELINE
016
 ↓
DEAL DETAIL / COMMERCIAL EXECUTION
```

# Next Sequential Audit Target

## **Phase 3A.1 — Design 017 Audit**

We should again retrieve **Design 017's exact frozen identity from the approved 153-design inventory first**, then apply the same contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no extra screen and no sequence change.**

