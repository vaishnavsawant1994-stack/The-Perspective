# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 056 — Client Reports & Downloads

Its frozen identity is locked.

Design 056 should become the **canonical Client Portal report-delivery and report-download workspace** for finalized Client-facing Reports that the authenticated Portal member is authorized to access.

It must reuse the Reporting foundation established by **Design 033** and the Metric/Analytics foundation established by **Design 038**, while preserving this boundary:

> **Operational Data ≠ Report ≠ ReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ Generated Report Artifact ≠ Client Download ≠ Analytics Dashboard.**

The most important rule is:

> **A historical Client Report must continue to represent the exact reporting period, metric definitions, dataset snapshot, provenance, narrative and artifact that were finalized for that ReportVersion—even if live operational data changes later.**

---

# 1. Classification

| Audit field                            | Classification                                                                                                                                                       |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                          | **056**                                                                                                                                                              |
| **Canonical name**                     | **Client Reports & Downloads**                                                                                                                                       |
| **Product area**                       | Client Portal / Reporting / Performance / Deliverables                                                                                                               |
| **User surface**                       | **Client Portal**                                                                                                                                                    |
| **Screen class**                       | Client-Safe Report Library + Finalized Report Delivery Workspace                                                                                                     |
| **Classification**                     | **Portal Workspace Variant — Client Reporting & Performance Delivery Family**                                                                                        |
| **Primary purpose**                    | Let authorized Clients discover, inspect and download finalized/approved Reports and clearly understand their reporting period, version, provenance and availability |
| **Primary canonical entity**           | **Report**                                                                                                                                                           |
| **Version entity**                     | **ReportVersion**                                                                                                                                                    |
| **Frozen data entity**                 | **ReportDatasetSnapshot**                                                                                                                                            |
| **Metric entity**                      | **ReportMetric / MetricSnapshot**                                                                                                                                    |
| **Metric definition foundation**       | Design 038 — Analytics / Metric Registry                                                                                                                             |
| **Generated file**                     | **ReportArtifact → Asset/FileVersion**                                                                                                                               |
| **Canonical Reporting foundation**     | Design 033                                                                                                                                                           |
| **Publishing/Distribution dependency** | Designs 031–032 / 055                                                                                                                                                |
| **Approval dependency**                | Designs 029 / 052 where reports require approval                                                                                                                     |
| **Asset dependency**                   | Designs 030 / 051                                                                                                                                                    |
| **Future distribution-report overlap** | Design 130                                                                                                                                                           |
| **Future report-center overlap**       | Designs 131–134                                                                                                                                                      |
| **Analytics distinction**              | Designs 038 / 135                                                                                                                                                    |
| **Parent shell**                       | `ClientPortalShell` — Design 002                                                                                                                                     |
| **Primary read model**                 | `ClientReportsView`                                                                                                                                                  |
| **Template family**                    | `ClientReportLibraryWorkspaceTemplate`                                                                                                                               |
| **Auth**                               | Required                                                                                                                                                             |
| **Authorization**                      | Portal membership + Client/Project/report entitlement + artifact access                                                                                              |
| **Implementation priority**            | **Critical Client Proof-of-Value / Delivery**                                                                                                                        |
| **Reuse level**                        | **Extremely High with Designs 033/038**                                                                                                                              |

Design 056 should answer:

> **“Which finalized Reports are available to me, what exact period does each Report cover, what version am I viewing, what data/provenance supports it, is it final and approved, and which exact artifact can I safely download?”**

Canonical architecture:

```text
Operational Systems
      │
      ├── Publishing
      ├── Distribution
      ├── Finance
      ├── Sales
      ├── Projects
      └── Other approved sources
              ↓
        Metric Definitions
              ↓
      Reporting Data Query
              ↓
    ReportDatasetSnapshot
              ↓
          ReportVersion
       ┌──────┼─────────┐
       ↓      ↓         ↓
    Metrics Narrative Sections
       │
       ↓
  Finalization / Approval
       │
       ↓
Generated Report Artifact
       │
       ↓
Asset / exact FileVersion
       │
       ↓
Client-safe Report Access
       │
       ↓
Design 056
```

---

# 2. Reuse

## Design 033 remains canonical

Design 033 already established the platform-wide Reporting model:

* Report,
* ReportVersion,
* ReportSection,
* ReportMetric,
* ReportDatasetSnapshot,
* reporting period,
* metric provenance,
* generated artifacts,
* recipient/delivery concepts,
* finalized/versioned reporting.

Design 056 must consume those records.

Do **not** create:

```text
ClientReport
PortalReport
DownloadedReport
ClientPerformancePDF
```

as competing reporting truth.

Correct:

```text
Canonical Reporting — Design 033
             │
       ┌─────┴─────┐
       ↓           ↓
Internal Report  Client-safe
Operations       Projection
033 / 130–134    Design 056
```

---

## Design 038 remains the Metric foundation

A Report should not redefine:

> Impressions

one way while Analytics defines it another way.

Designs 033, 038, 055, 056 and later 130–135 need one governed Metric Registry.

Conceptually:

```text
MetricDefinition
├── stable metric identity
├── definition/formula
├── unit
├── compatible dimensions
├── source expectations
├── provenance rules
└── effective/version semantics
```

Report-specific values then reference those definitions.

---

## Design 055 vs Design 056

This is an important separation.

### Design 055

Current operational Client delivery status:

* what is live,
* what is scheduled,
* which channels executed,
* verified links,
* current performance information.

### Design 056

Finalized Client reporting output:

* exact reporting period,
* frozen ReportVersion,
* validated metrics,
* narrative,
* downloadable Report artifact.

Correct:

```text
055
Live / operational delivery status
          ↓
canonical evidence + metrics
          ↓
056
Finalized Report delivery
```

They share data foundations without sharing screen purpose.

---

## Design 041 relationship

Client Dashboard may show:

> Latest Report available.

That should reference the same final/approved ReportVersion surfaced by Design 056.

---

## Design 043 relationship

Client Project Detail may show Project-specific Reports.

Design 056 provides broader Client report discovery.

One canonical Report identity.

---

## Design 044 relationship

Timeline may show:

> Final performance report available.

That event should derive from finalized/released Report state.

Timeline does not own Report delivery state.

---

## Design 051 relationship

Report artifacts are files.

Therefore:

```text
ReportVersion
      ↓
Generated ReportArtifact
      ↓
Asset / exact FileVersion
```

Design 051 may list a report file where appropriate, but Design 056 owns the **reporting semantics**.

---

## Design 052 relationship

If a Report requires formal approval before Client release:

```text
ReportVersion
      ↓
ApprovalRequest
      ↓
ApprovalDecision
      ↓
Client release eligibility
```

Approval must bind to the exact ReportVersion.

---

## Design 130 relationship

Later:

**Design 130 — Final Distribution Report / Client Performance Report**

This is a major overlap checkpoint.

Likely relationship:

```text
Canonical Reporting Domain
        │
        ├── Design 056
        │   Client report library/download
        │
        └── Design 130
            distribution/performance report composition
```

Design 130 may be a specialized Report type/composition.

It should not introduce another ReportVersion/MetricSnapshot backend.

No screen merge decision now.

---

## Designs 131–134 relationship

Later:

* 131 Reporting Library / Report Center
* 132 Report Detail / Interactive Report Workspace
* 133 Report Builder / Custom Report Configuration
* 134 Scheduled Reports / Report Delivery Management

All should consume Design 033's canonical Reporting engine.

Design 056 is the Client-safe delivery surface.

---

# 3. Entities

## Operational Data ≠ Report

Live operational systems continuously change.

Example:

```text
August 31:
LinkedIn impressions = 12,500

September 15:
LinkedIn lifetime impressions = 19,100
```

A Report covering August must not silently change from 12,500 to 19,100 because someone opens it later.

Therefore:

> **Report truth must be frozen/reconstructable for its reporting period.**

---

## Report ≠ ReportVersion

`Report` is the stable reporting identity.

Example:

```text
Report:
Monthly Distribution Performance Report
```

Versions might include:

```text
ReportVersion v1
ReportVersion v2
ReportVersion v3
```

Each version can capture corrections, narrative revisions or regenerated approved output while preserving history.

---

## ReportVersion should become immutable after finalization

Once a version is:

* finalized,
* approved,
* released,
* delivered,

its reporting contents should not be edited in place.

Any material change creates another ReportVersion.

---

## Draft ReportVersion ≠ final ReportVersion

Internal report preparation may have:

```text
DRAFT
UNDER_REVIEW
FINAL
```

or equivalent dimensions.

Design 056 should not expose internal Draft versions.

---

## Final ≠ Client released automatically

A Report can be internally finalized but not yet eligible for the Client.

Correct conceptual distinction:

```text
ReportVersion:
FINAL

Client release:
NOT_RELEASED
```

if approval/delivery gates remain.

---

## Approved ≠ delivered

If formal approval is required:

```text
Approved ReportVersion
≠
Report already delivered
```

A separate Client-access/release event may still be needed.

---

## Client-delivered version must be exact

If Report v3 was delivered and v4 later exists:

historical Client delivery/reference must remain attached to v3.

Never dynamically load:

> latest ReportVersion.

---

## ReportDatasetSnapshot

This is one of Design 056's most important architectural entities.

Conceptually:

```text
ReportDatasetSnapshot
├── reporting period
├── query/source references
├── metric inputs
├── snapshot timestamp
├── source freshness
├── provenance
└── reconstruction lineage
```

The exact storage strategy can be:

* materialized data,
* immutable snapshot,
* reproducible query inputs,
* or a governed combination.

But historical Report output must remain reproducible.

---

## Reporting period must be explicit

Every Report should identify its exact period.

Examples:

```text
August 1–31, 2026
Q3 2026
Campaign launch through September 15
```

Do not rely on vague:

> Last month

inside stored report semantics.

Relative periods must resolve into exact boundaries when the ReportVersion is generated.

---

## Report generation time ≠ reporting period

Example:

```text
Report generated:
September 3

Reporting period:
August 1–31
```

These are separate dates.

---

## Reporting period ≠ data retrieval timestamp

A metric may describe August while its source was queried on September 2.

Keep:

```text
period
retrievedAt
```

distinct.

---

## ReportDatasetSnapshot ≠ live Analytics query

A Client Report should not simply embed:

```text
GET current analytics
```

every time it opens.

That would make historical reports mutable.

---

## ReportMetric

Conceptually:

```text
ReportMetric
├── metricDefinitionId
├── value
├── unit
├── reporting period
├── dimensions
├── source
├── provenance
├── freshness / observedAt
└── snapshot reference
```

Exact schema Phase 3D.

---

## ReportMetric ≠ MetricDefinition

Definition:

> LinkedIn Impressions = provider-reported number of impressions in period.

ReportMetric:

> 12,402 LinkedIn Impressions, August 2026.

Keep concept and value separate.

---

## MetricDefinition changes need version semantics

If the formula for:

> Engagement Rate

changes later, historical ReportVersions should remain interpretable using the definition effective when they were produced.

Do not retrospectively recalculate every finalized Report without explicit revision.

---

## Zero ≠ unavailable

Permanent:

```text
0 clicks
```

means measured zero.

```text
click data unavailable
```

means unknown.

The report must never turn missing data into zero.

---

## VERIFIED ≠ ESTIMATED

Report metrics should preserve source/provenance such as:

```text
VERIFIED
ESTIMATED
MANUAL
UNAVAILABLE
```

where relevant.

A polished PDF must not erase the difference.

---

## Estimated ≠ false

Estimated data can be legitimate.

The problem is misrepresenting estimated data as verified.

---

## Manual ≠ provider verified

If an internal operator supplies a manually documented figure, the Report can show it where allowed but should preserve its origin.

---

## Metric freshness belongs to snapshot provenance

If the August Report contains provider data last synchronized August 31 23:45:

that should remain known internally even after future refreshes.

---

## ReportSection ≠ ReportMetric

Narrative sections and metrics are separate composition elements.

A section might explain:

> LinkedIn drove the highest verified reach this month.

but the underlying metric still remains structured data.

---

## Narrative ≠ metric truth

A narrative summary should never replace the structured metric values.

This is especially important if AI assists report writing.

---

## AI-generated narrative ≠ source data

If AI drafts a summary:

```text
Metric Snapshot
      ↓
AI-assisted narrative
```

the narrative remains derived content.

AI must not invent:

* missing values,
* trends,
* attribution.

---

## Final narrative should be versioned

Once a ReportVersion is finalized, its narrative should remain part of that exact version.

Regenerating text later creates a new ReportVersion if material.

---

## Report Artifact ≠ Report

A PDF is one rendering/output.

```text
ReportVersion
    ↓
Generated Report Artifact
```

The structured Report remains canonical.

---

## Multiple artifacts can represent one ReportVersion

Potentially:

```text
ReportVersion
├── PDF artifact
├── print artifact
└── other approved export
```

where product supports them.

These are outputs, not separate Reports.

---

## Artifact regeneration ≠ new ReportVersion automatically

If the underlying ReportVersion contents are unchanged and the platform regenerates a corrupted PDF:

that may be a technical artifact replacement/version, not a new business ReportVersion.

Keep:

```text
business content version
≠
render-processing revision
```

---

## Content change does require new ReportVersion

Changing:

* metrics,
* reporting period,
* narrative conclusions,
* charts,
* material sections,

after finalization should create a new business ReportVersion.

---

## Client Download ≠ Report

When a Client downloads a PDF:

the download event does not create another Report.

Correct:

```text
ReportVersion
      ↓
ReportArtifact / FileVersion
      ↓
Authorized Download
```

---

## Download ≠ delivery necessarily

A Report may be made available before the Client downloads it.

Therefore:

```text
Report released
≠
Report downloaded
```

---

## Downloaded ≠ viewed/read

A downloaded file does not prove the Client read the Report.

Avoid making business claims based purely on download.

---

## Report availability ≠ Download permission

A Client might view an interactive Report but lack file-export permission.

Conceptually:

```text
report.read
≠
report.download
```

---

## Analytics Dashboard ≠ Report

This distinction is critical.

### Analytics

Live/exploratory:

```text
current filters
current operational data
drill-down
```

### Report

Frozen/versioned:

```text
defined period
defined metric snapshot
defined narrative
finalized output
```

Do not implement Design 056 as a saved Analytics dashboard.

---

## Saved Analytics View ≠ Report

A saved filter configuration may help generate Reports.

It is not itself a finalized Client Report.

---

## Interactive Report ≠ live Analytics automatically

Design 132 may support interactive exploration within a frozen/report-scoped dataset.

It must not accidentally turn a finalized Report into unrestricted live operational Analytics unless intentionally designed.

---

# 4. Permissions

Client Report access should evaluate:

```text
Portal membership
+
Client/account scope
+
Project/report entitlement
+
ReportVersion release state
+
underlying metric/report visibility
+
artifact/download capability
```

---

## Client account ≠ every Report

A Client organization may have:

* executive Reports,
* Project Reports,
* Finance Reports,
* distribution Reports.

Different Portal members may receive different access.

---

## Same Client ≠ same Report visibility

Example:

```text
CEO
→ executive + Project performance Reports

Marketing Director
→ distribution Reports

Finance Contact
→ financial Reports only where authorized
```

One Client organization can yield different Design 056 results.

---

## Project read ≠ Report read automatically

```text
portal.projects.read
≠
portal.reports.read
```

unless policy deliberately connects them.

---

## Report read ≠ Download

Permanent:

```text
report.read
≠
report.download
```

where download is separately governed.

---

## Download ≠ export-all

A user authorized to download one Report does not automatically gain bulk export of all Reports.

---

## Report read ≠ Analytics access

A Client can receive finalized Reports without having access to Design 038/135 operational analytics data.

---

## Report metric visibility

A Client Report should be generated from a **Client-safe dataset projection**.

Dangerous:

```text
build full internal Report
↓
hide internal sections in React
```

Correct:

```text
Client-safe reporting dataset / sections
↓
ReportVersion
```

No internal-only metric should enter the Client artifact accidentally.

---

## Internal metrics can be more sensitive

Internal Reports may include:

* margin,
* staff utilization,
* sales projections,
* provider failure rates,
* internal cost.

Client Reports should never receive those merely because they share MetricDefinition infrastructure.

---

## Client-safe dimensions

Even a safe metric may become sensitive when segmented by an internal dimension.

Example:

> Team Member Performance

might be valid internally but inappropriate in a Client report.

Metric authorization needs both metric and dimension context.

---

## Report approval authority ≠ Report view

If a Report requires Client formal approval:

```text
report.read
≠
approval.decide
```

Design 052 remains authoritative for decision permission.

---

## Asset permission must not bypass Report permission

Design 051's generic Asset access must not expose a Report PDF if the user lacks Report entitlement.

Authorization must honor both:

* Report context,
* Asset/FileVersion access.

---

## Direct FileVersion ID must not bypass Report security

Knowing the report artifact's storage/file ID must never allow unauthorized retrieval.

---

## Search authorization

Report title, period, Project, filename and metric snippets can all reveal sensitive information.

Apply authorization before search/index results.

---

## Client-safe download

Every download request should freshly authorize:

```text
actor
ReportVersion
release state
artifact
download capability
```

before generating a signed/controlled file access response.

---

# 5. States

Design 056 inherits Design 150, while Reporting needs several independent state dimensions.

### Report lifecycle

```text
Report Preparing
Report Draft
Report Under Review
Report Finalized
Report Approved where required
Report Released
Report Superseded
```

Internal Draft states should normally not be visible to Clients.

### Artifact state

```text
Artifact Generating
Artifact Ready
Artifact Generation Failed
Artifact Temporarily Unavailable
```

### Client delivery/access state

```text
Report Available
Download Available
Download Restricted
Access Revoked
```

### Data/provenance state

```text
Metrics Verified
Metrics Estimated
Metrics Mixed Provenance
Metrics Unavailable
Snapshot Complete
Snapshot Partial where explicitly allowed
```

These should **not** become one `report.status` enum.

---

## Finalized ≠ approved

If approval is required:

```text
FINALIZED
≠
APPROVED
```

---

## Approved ≠ released

A Report can await delivery/release after approval.

---

## Released ≠ downloaded

A Client can have a Report available without ever downloading it.

---

## Downloaded ≠ consumed

Do not treat download as proof of reading or acceptance.

---

## Artifact generation failure ≠ Report failure

Structured ReportVersion can remain valid even if PDF rendering fails.

Correct:

> Report is available, but the downloadable file is temporarily unavailable.

where interactive/read presentation exists.

---

## Report unavailable ≠ no Report

A service failure should not produce:

> No Reports yet.

---

## No Reports ≠ no performance

A Client may have operational performance data but no finalized Report yet.

Do not treat absence of Report as absence of delivery/performance.

---

## Metrics unavailable ≠ zero

Permanent.

---

## Estimated ≠ unavailable

A legitimate estimated value should remain displayed as estimated rather than disappearing as if missing.

---

## Mixed provenance

A Report can legitimately contain:

```text
LinkedIn impressions → VERIFIED
PR estimated reach → ESTIMATED
Manual event attendance → MANUAL
```

The ReportVersion should preserve that mixed provenance.

---

## Report superseded ≠ deleted

If v4 corrects v3:

v3 can remain historical according to policy.

Do not erase the report the Client previously received.

---

## Current ≠ latest internal Draft

Client-visible “current” Report should resolve from the released/finalized version policy—not whichever DB row was edited most recently.

---

## Report period closed ≠ metrics can never change operationally

Live performance may continue after the Report period.

That does not alter the frozen report.

---

## Partial source failure during generation

If required dataset sources are unavailable:

the Report generator must follow explicit policy.

It must not silently replace missing values with zero.

Potential result:

```text
generation blocked
```

or:

```text
Report created with explicitly unavailable metrics
```

depending on product policy.

---

# 6. Responsive Behavior

## Desktop

Desktop should preserve a clear Client reporting library:

```text
Reports & Downloads
↓
Latest / Featured Report
↓
Search / Filters
↓
Report List
    ├── Report title
    ├── Project / Campaign context
    ├── reporting period
    ├── version
    ├── released date
    ├── provenance/status summary where relevant
    └── View / Download
↓
Historical Reports
```

If the frozen screen includes metrics/cards, they must represent the exact ReportVersion rather than live Analytics.

---

## Tablet

Following Design 152:

* report tables can reflow into cards,
* reporting period stays prominent,
* version and release status remain visible,
* download buttons remain touch-safe,
* metric summaries stack cleanly,
* longer metadata can move into a focused detail panel.

---

## Mobile

Priority:

```text
Reports
↓
Latest Report
    ├── Title
    ├── Project
    ├── Reporting period
    ├── Version
    ├── Released date
    └── View / Download
↓
Other Reports
↓
Historical Reports
```

Do not compress desktop metric tables horizontally.

---

## Mobile reporting-period clarity

The period must remain explicit.

Avoid a card that shows only:

> August Report

where the actual boundaries could be ambiguous.

---

## Mobile Download safety

If several ReportVersions exist:

the Client should clearly know which exact version is being downloaded.

No ambiguous:

> Download Latest

for historical records.

---

## Accessibility

Report cards need semantic labels for:

* title,
* Project,
* period,
* version,
* release/final state,
* download availability.

Provenance must not rely only on color/icon.

Use text such as:

> Verified provider data
> Includes estimated reach data
> Some metrics unavailable

where appropriate.

---

# 7. Backend Requirements

## Query architecture

```text
Design 056
    ↓
ClientPortalSessionContext
    ↓
Report Authorization
    ↓
ClientReportQueryService
    │
    ├── Report
    ├── released ReportVersion
    ├── ReportDatasetSnapshot
    ├── ReportMetric
    ├── MetricDefinition
    ├── Report sections/narrative
    ├── Approval state where required
    └── ReportArtifact / FileVersion
    ↓
ClientReportsView
```

---

## Report generation architecture

```text
Exact reporting period
       ↓
Authorized source queries
       ↓
MetricDefinition resolution
       ↓
Metric observations
       ↓
ReportDatasetSnapshot
       ↓
ReportVersion composition
       │
       ├── structured metrics
       ├── sections
       ├── charts
       └── narrative
       ↓
Review / Approval
       ↓
Finalized ReportVersion
       ↓
Artifact generation
       ↓
Asset / FileVersion
       ↓
Client release
```

---

## Dataset snapshot requirements

The backend needs enough lineage to answer later:

> Where did this number come from?

Potential lineage:

```text
ReportVersion RV-3
    ↓
ReportMetric RM-12
    ↓
MetricDefinition MD-5
    ↓
DatasetSnapshot DS-9
    ↓
Distribution placement metrics
    ↓
Provider/source observations
```

This traceability is essential.

---

## Metric-definition consistency

Design 056 should never contain hard-coded calculations such as:

```text
engagement = likes / impressions
```

inside the React page if the canonical MetricDefinition defines something else.

All derived metric calculations belong to governed analytical/reporting services.

---

## Reporting-period freezing

A relative Report schedule such as:

> monthly

must resolve each generated report into explicit period boundaries.

Example:

```text
August 2026 Report
periodStart = 2026-08-01
periodEnd   = 2026-08-31
```

rather than retaining:

```text
period = "last month"
```

as historical truth.

---

## Timezone in period resolution

Month/day boundaries can differ by organization/reporting timezone.

Period generation must explicitly use the configured reporting timezone rather than server-local time.

---

## Snapshot reproducibility

If raw observations are retained, a Report may be reproducible from:

* query parameters,
* metric definition version,
* source snapshots.

If not, values themselves must be immutably snapshotted.

Either way:

> Historical report reconstruction cannot depend solely on mutable live tables.

---

## Artifact generation

Report PDF generation should be asynchronous/retryable if expensive.

Technical rendering retries must remain idempotent.

Do not generate multiple conflicting artifacts from the same finalized ReportVersion unless artifact versioning deliberately records replacements.

---

## Artifact integrity

The ReportArtifact should be linked to:

* exact ReportVersion,
* artifact type,
* generatedAt,
* exact FileVersion.

No “latest report.pdf” storage shortcut.

---

## Download architecture

```text
Client selects Download
        ↓
authenticate Portal membership
        ↓
authorize ReportVersion
        ↓
authorize ReportArtifact/FileVersion
        ↓
issue controlled download
        ↓
optional Download/Audit event
```

---

## Report Download Event

If downloads need tracking:

a DownloadEvent may record:

```text
actor
ReportVersion
artifact/FileVersion
downloadedAt
result
```

But:

> **DownloadEvent ≠ Report delivery ≠ ReportVersion.**

---

## Notifications

Events such as:

```text
ReportReleased
ReportUpdated/Superseded
ScheduledReportDelivered
```

may generate Client Notifications.

Notification read state does not alter Report state.

---

## Activity integration

Design 063 may later show:

> August Performance Report became available.

That is an Activity projection referencing the canonical ReportVersion.

---

## Audit integration

Material Reporting operations can emit Design 039 events:

```text
ReportFinalized
ReportApproved
ReportReleased
ReportVersionSuperseded
ReportDownloaded
```

where policy requires.

Audit is not the Report history itself.

---

## Client-safe caching

Cache keys must account for:

```text
Client/account
Portal membership
Report entitlement
Project/resource scope
version/release state
```

Do not cache a full Client Report library and reuse it for every member of the same organization without entitlement checks.

---

## Backend Requirement Matrix

| Requirement                                          | Status                        |
| ---------------------------------------------------- | ----------------------------- |
| Client Portal authentication                         | **Critical**                  |
| Active Portal membership                             | **Critical**                  |
| Client/account isolation                             | **Critical**                  |
| Report-level authorization                           | **Critical**                  |
| Canonical Report reuse                               | **Critical**                  |
| Immutable/finalized ReportVersion                    | **Critical**                  |
| ReportDatasetSnapshot                                | **Critical**                  |
| Explicit frozen reporting period                     | **Critical**                  |
| Reporting timezone semantics                         | **Critical**                  |
| MetricDefinition registry reuse                      | **Critical**                  |
| MetricDefinition version/effective semantics         | **Critical**                  |
| ReportMetric structured values                       | **Critical**                  |
| Provenance preservation                              | **Critical**                  |
| VERIFIED/ESTIMATED/MANUAL/UNAVAILABLE distinction    | **Critical**                  |
| Zero vs unavailable separation                       | **Critical**                  |
| Metric freshness lineage                             | **Critical**                  |
| Client-safe metric/dimension projection              | **Critical**                  |
| Draft/internal vs Client-released version separation | **Critical**                  |
| Finalized vs Approved separation                     | **Critical**                  |
| Approved vs Released separation                      | **Critical**                  |
| Exact released ReportVersion                         | **Critical**                  |
| Approval integration                                 | **Required where applicable** |
| Artifact generation pipeline                         | **Critical**                  |
| Design 030 Asset/FileVersion integration             | **Critical**                  |
| Exact artifact/version binding                       | **Critical**                  |
| Controlled authenticated downloads                   | **Critical**                  |
| Report-read/download permission separation           | **Critical**                  |
| Permission-safe search                               | **Critical**                  |
| Historical Report reproducibility                    | **Critical**                  |
| AI narrative provenance where used                   | **Critical if AI-assisted**   |
| Idempotent artifact generation                       | **Critical**                  |
| Notification integration                             | **Required**                  |
| Activity integration                                 | **Required**                  |
| Audit integration                                    | **Required**                  |
| Partial metric/source failure handling               | **Critical**                  |
| Design 033 backend reuse                             | **Critical**                  |
| Design 038 Metric Registry reuse                     | **Critical**                  |
| Designs 130–134 reuse                                | **Critical architecture**     |

---

# 8. Consolidation

Design 056 exposes several major implementation risks.

**Operational Data / Report conflation**
Historical Report dynamically changes with live operational data.

**Report / ReportVersion conflation**
Finalized Report is edited in place.

**ReportVersion / DatasetSnapshot conflation**
No reproducible source-data snapshot exists.

**Current/latest bug**
Client sees newest internal Draft instead of released ReportVersion.

**Draft/final conflation**
Internal Report versions become Client-visible.

**Final/approved conflation**
Finalization automatically becomes formal approval.

**Approved/released conflation**
Approved Report appears to Client before intended delivery.

**Released/downloaded conflation**
Making Report available is treated as proof Client downloaded it.

**Downloaded/viewed conflation**
File download is treated as proof of consumption.

**Report/Artifact conflation**
PDF becomes canonical Report truth.

**Artifact regeneration/ReportVersion conflation**
Technical PDF retry creates fake business Report revision.

**Content change/artifact retry conflation**
Material data changes are hidden as a technical regeneration.

**ReportMetric/MetricDefinition conflation**
Values and formulas become inseparable.

**Metric-definition drift**
Historical Report is retrospectively interpreted using current formula.

**Reporting period/generation date conflation**
Report generated September 3 appears to cover September.

**Relative-period bug**
“Last month” remains dynamic rather than resolving to exact dates.

**Timezone-period bug**
Month boundaries change according to server timezone.

**Live-query snapshot bug**
Opening August Report fetches September lifetime metrics.

**Verified/estimated conflation**
Estimated performance appears provider-verified.

**Manual/verified conflation**
Manual figures lose provenance.

**Unavailable/zero conflation**
Missing metrics appear as failed performance.

**Stale/current conflation**
Old data represented as freshly measured.

**Narrative/metric-truth conflation**
Written summary becomes only evidence for performance claims.

**AI narrative/source-data conflation**
AI invents or modifies KPI truth.

**Internal/client metric leakage**
Staff costs, margins or internal analytics enter Client report.

**Metric/dimension authorization bug**
Safe metric exposed with confidential internal dimension.

**Project/Report permission conflation**
Any Project viewer sees all Reports.

**Report/Analytics permission conflation**
Final Report access exposes live Analytics.

**Report/Asset permission bypass**
Generic file access exposes restricted Report artifact.

**Search leakage**
Unauthorized Report titles/periods/metric snippets appear in search.

**“Latest report.pdf” storage bug**
Historical download points to overwritten artifact.

**Download URL permanence**
Revoked user retains long-lived Report access.

**No reports/service outage conflation**
Backend failure becomes an empty-state success.

**Source failure/zero-metric conflation**
Report generation inserts zero when metric provider is unavailable.

**Report history/Audit conflation**
Audit is used as Report version history.

**055/056 metric duplication**
Operational delivery and finalized Reports calculate different figures.

**056/130 duplicate Client performance-report engines**
Final Distribution Report creates second Report/Snapshot model.

**056/131–134 duplicate Reporting domain**
Report Center/Builder/Scheduler each create their own Report representation.

**056/038 Analytics conflation**
Saved dashboard becomes Client Report without snapshot/version semantics.

No new design is required.

These are **report versioning, data snapshot, metric governance, provenance, artifact, authorization and historical-reproducibility requirements**.

---

# 9. Implementation Verdict

## **PASS — CLIENT FINALIZED REPORT, PERFORMANCE EVIDENCE & DOWNLOAD DELIVERY ANCHOR**

**Domain directive:**
**Operational Data ≠ Report ≠ ReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ ReportArtifact ≠ ClientDownload ≠ Analytics Dashboard.**

**Reuse directive:**
Design 033 remains the canonical Reporting engine, while Design 038 remains the canonical MetricDefinition/analytical foundation. Design 056 is a Client-safe report-delivery projection.

**Version directive:**
every finalized Client Report is represented by an immutable exact ReportVersion; material corrections create another version rather than rewriting delivered history.

**Snapshot directive:**
each ReportVersion binds to a frozen/reconstructable ReportDatasetSnapshot so future operational changes cannot rewrite historical Client reporting truth.

**Period directive:**
reporting periods resolve to exact start/end boundaries and remain separate from Report generation, retrieval and release timestamps.

**Metric directive:**
Report values reference governed MetricDefinitions rather than embedding page-specific formulas.

**Metric-definition directive:**
historical Reports remain interpretable using the metric semantics effective when they were generated.

**Provenance directive:**
`VERIFIED`, `ESTIMATED`, `MANUAL` and `UNAVAILABLE` remain explicit. Zero is valid data and never substitutes for unavailable information.

**Narrative directive:**
report narrative is derived/versioned content. AI or human prose never becomes the only source of metric truth and must never invent unavailable performance data.

**Finalization directive:**
Draft, finalized, approved and Client-released remain distinct stages. Design 056 exposes only versions eligible for Client delivery.

**Approval directive:**
where formal Report approval is required, Design 029/052 binds an ApprovalRequest to the exact ReportVersion.

**Artifact directive:**
generated PDFs/downloads use Design 030's exact Asset/FileVersion infrastructure; the PDF remains a rendering of the structured ReportVersion, not the Report itself.

**Regeneration directive:**
technical artifact regeneration does not create a new business ReportVersion unless Report content materially changes.

**Download directive:**
Report availability and Client download are separate states; every download reauthorizes the exact ReportVersion and FileVersion.

**Security directive:**
Report entitlement, Project entitlement, metric/dimension visibility, read access and download access remain independently enforceable.

**Analytics directive:**
live Analytics and finalized Reports share Metric definitions but remain separate products: Analytics is exploratory/current; Reporting is period-bound, snapshotted and versioned.

**Publishing/Distribution directive:**
Design 055 provides operational delivery state while Design 056 consumes the same verified Placement/Metric foundation for finalized reporting. No second performance truth system is permitted.

**Reliability directive:**
no Report, unavailable Report service, artifact-generation failure, unavailable metric, estimated data, stale source and access restriction all remain distinct states.

**Audit directive:**
finalization, approval, release, supersession and sensitive downloads can feed Design 039 while ReportVersion history remains the canonical business Reporting history.

**Responsive directive:**
desktop supports full report discovery/period/version scanning; mobile prioritizes Report identity → Project → exact reporting period → version → release status → authorized View/Download.

**Overlap directive:**
Designs **033, 038, 041, 043–044, 051–056 and 130–135** must ultimately consume one Report + ReportVersion + DatasetSnapshot + MetricDefinition + ReportMetric + Provenance + Artifact + Client-delivery foundation.

**Consolidation directive:**
**STANDARDIZE ONE PLATFORM-WIDE REPORTING ENGINE — REPORT + IMMUTABLE REPORTVERSION + EXACT REPORTING PERIOD + REPORTDATASETSNAPSHOT + METRICDEFINITION + REPORTMETRIC + PROVENANCE + FINALIZATION/APPROVAL + GENERATED ARTIFACT + CLIENT ACCESS/DOWNLOAD — WITH STRICT CLIENT/INTERNAL PROJECTIONS AND NO SECOND REPORTING, KPI OR PERFORMANCE-TRUTH SYSTEM IN THE CLIENT PORTAL.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **56 / 153** |
| **PASS**                                   |                         **56** |
| **STANDARDIZE decisions**                  |                         **54** |
| **Potential implementation-overlap flags** |                         **47** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**56 / 153 = 36.6% audited.**

### Canonical Reporting architecture after Design 056

```text
                OPERATIONAL SOURCE DATA
                         │
                         ↓
                 METRIC REGISTRY
                   Design 038
                         │
                         ↓
               Reporting Data Query
                         │
                         ↓
              REPORT DATASET SNAPSHOT
                         │
                         ↓
                       REPORT
                         │
                         ↓
                   REPORT VERSION
                         │
          ┌──────────────┼──────────────┐
          ↓              ↓              ↓
       Metrics         Sections       Narrative
          │
          └──────────────┼──────────────┘
                         ↓
                Finalize / Approve
                         │
                         ↓
                 Client Release
                         │
                         ↓
                Report Artifact
                         │
                         ↓
               Asset / FileVersion
                         │
                         ↓
              DESIGN 056 — CLIENT
               REPORTS & DOWNLOADS
```

The Client delivery chain across Designs 055–056 is now:

```text
Publication / Distribution
       Designs 031–032
              │
              ↓
Placement + Verification
              │
              ↓
Metric Observations
              │
       ┌──────┴────────┐
       ↓               ↓
Design 055        Design 056
Live delivery     Finalized
status            Reporting
                      │
                      ↓
               Frozen ReportVersion
                      │
                      ↓
               Client Report Artifact
```

# Next Sequential Audit Target

## **Design 057 — Client Renewal / Continuation Workspace**

Its frozen identity is already locked.

The next audit must preserve the commercial-continuation boundary:

> **Completed Project ≠ Client Relationship ≠ Renewal Opportunity ≠ Renewal Proposal ≠ New Deal ≠ Contract Renewal/Extension ≠ New ContractVersion ≠ Subscription/Continuation Term.**

It must also ensure that renewal/continuation **references historical Project, Contract, delivery and performance evidence without mutating the original completed engagement**.

After Design 057 we continue strictly:

**058 Client Support / Support Requests → 059 Client Profile & Account Settings → 060 Client Organization / Company Settings → 061 Client Notifications / Notification Preferences → … → 077 Client Access Recovery**

with exactly:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
