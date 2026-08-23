# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 132 — Report Detail / Interactive Report Workspace

Design 132 should become the **canonical Team Workspace single-Report 360, exact-ReportVersion inspection, frozen-dataset exploration, interactive filtering, visualization, drill-down, evidence inspection, artifact, Approval, release, and version-history surface** built directly on the Reporting foundation established by **Design 033** and the Report Library/version semantics established by **Designs 130–131**.

Design 132 must **not create a separate `InteractiveReport` business domain** and must not turn finalized reports back into live analytics dashboards. The interactive experience should allow an authorized user to explore the **exact dataset frozen for the selected ReportVersion**—changing charts, filters, breakdowns, table views, or drill-down context without rewriting the ReportVersion or querying today's live source data as if it were part of the finalized report.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Report ≠ ReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ ReportSection/VisualizationDefinition ≠ InteractiveReportViewState ≠ ReportDrilldownResult ≠ GeneratedReportArtifact ≠ ApprovalRequest ≠ ReportRelease ≠ LiveAnalytics ≠ SourceDomainRecord.**

The central implementation rule is:

> **The selected ReportVersion is always explicit. A finalized/released ReportVersion must render and interact only against its pinned frozen ReportDatasetSnapshot and pinned metric/calculation semantics. Interactive filters are temporary view state, not report mutations. Drill-down reveals evidence already represented by that snapshot or permission-safe references to canonical source records; it never recalculates the finalized report from current production data. If a user needs different permanent metrics, sections, formulas, sources, or layout, that belongs to a new Draft ReportVersion through Design 133—not an invisible edit inside Design 132.**

---

# 1. Classification

| Audit field                                  | Classification                                                                                                                                                                                                                                                                 |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                                | **132**                                                                                                                                                                                                                                                                        |
| **Canonical name**                           | **Report Detail / Interactive Report Workspace**                                                                                                                                                                                                                               |
| **Product area**                             | Team Workspace / Reporting / Report Detail & Exploration                                                                                                                                                                                                                       |
| **User surface**                             | **Authenticated Team Workspace**                                                                                                                                                                                                                                               |
| **Screen class**                             | Entity Detail Variant / Versioned Report 360 / Interactive Frozen-Dataset Workspace                                                                                                                                                                                            |
| **Classification**                           | **Canonical Report-Version Detail, Frozen-Dataset Exploration & Evidence Drill-Down Anchor**                                                                                                                                                                                   |
| **Primary purpose**                          | Inspect one canonical Report and one exact selected ReportVersion, interactively explore its frozen dataset, understand metrics/evidence, inspect Approval/release/artifact state, compare historical Versions where frozen UX permits, and navigate to source evidence safely |
| **Canonical Reporting foundation**           | **Design 033**                                                                                                                                                                                                                                                                 |
| **Report Library dependency**                | Design 131                                                                                                                                                                                                                                                                     |
| **Final Distribution Report specialization** | Design 130                                                                                                                                                                                                                                                                     |
| **Primary entity**                           | **Report**                                                                                                                                                                                                                                                                     |
| **Selected version identity**                | **ReportVersion**                                                                                                                                                                                                                                                              |
| **Frozen analytical input**                  | **ReportDatasetSnapshot**                                                                                                                                                                                                                                                      |
| **Frozen metric result**                     | `ReportMetric`                                                                                                                                                                                                                                                                 |
| **Metric semantics**                         | Design 038 `MetricDefinition` / Metric Registry                                                                                                                                                                                                                                |
| **Report presentation configuration**        | version-pinned section/visualization configuration                                                                                                                                                                                                                             |
| **Interactive state**                        | `InteractiveReportViewState` — transient/read-session state, not Report truth                                                                                                                                                                                                  |
| **Drill-down result**                        | `ReportDrilldownResult` — query projection                                                                                                                                                                                                                                     |
| **Generated artifact**                       | Design 030 Asset/FileVersion                                                                                                                                                                                                                                                   |
| **Approval dependency**                      | Designs 029 / 115                                                                                                                                                                                                                                                              |
| **Release dependency**                       | canonical `ReportRelease`                                                                                                                                                                                                                                                      |
| **Client report boundary**                   | Design 056                                                                                                                                                                                                                                                                     |
| **Builder dependency**                       | Design 133                                                                                                                                                                                                                                                                     |
| **Scheduled-report dependency**              | Design 134                                                                                                                                                                                                                                                                     |
| **Live analytics boundary**                  | Designs 038 / 129 / 135                                                                                                                                                                                                                                                        |
| **Source-domain dependencies**               | typed canonical Project, Distribution, Finance, Publishing, etc. according to ReportType                                                                                                                                                                                       |
| **Search dependency**                        | Design 079                                                                                                                                                                                                                                                                     |
| **Primary query service**                    | `ReportDetailQueryService`                                                                                                                                                                                                                                                     |
| **Version resolver**                         | `ReportVersionResolver`                                                                                                                                                                                                                                                        |
| **Snapshot query engine**                    | `ReportSnapshotQueryService`                                                                                                                                                                                                                                                   |
| **Interactive query service**                | `InteractiveReportQueryService`                                                                                                                                                                                                                                                |
| **Drill-down service**                       | `ReportDrilldownService`                                                                                                                                                                                                                                                       |
| **Artifact service**                         | canonical Reporting + Design-030 artifact infrastructure                                                                                                                                                                                                                       |
| **Version comparison service**               | `ReportVersionComparisonService` if frozen UI includes comparison                                                                                                                                                                                                              |
| **Parent shell**                             | `InternalAppShell` — Design 001                                                                                                                                                                                                                                                |
| **Auth**                                     | Required                                                                                                                                                                                                                                                                       |
| **Authorization**                            | Active OrganizationMembership + Report/Version/snapshot/source permissions                                                                                                                                                                                                     |
| **Implementation priority**                  | **Critical Report Reproducibility / Interactive Data Integrity / Evidence Safety**                                                                                                                                                                                             |
| **Reuse level**                              | **Extremely High across all report types, Builder, Scheduled Reporting, Client delivery and executive reporting**                                                                                                                                                              |

Design 132 should answer:

> **“Which exact ReportVersion am I viewing, what reporting period and frozen dataset does it represent, what do its KPIs/charts/tables mean, how can I safely explore that exact historical dataset, what source evidence supports the figures, what is Approved/Released, which exact artifact was generated, and how does this Version differ from other Versions without allowing live data or UI interactions to rewrite historical report truth?”**

Canonical composition:

```text
Report R-20
   │
   ├── v1 Historical
   ├── v2 Historical
   ├── v3 Released
   └── v4 Draft
          │
          ↓
     Selected Version
          │
          ↓
 ReportDatasetSnapshot DS-9
          │
      ┌───┼──────────┐
      ↓   ↓          ↓
   Metrics Charts   Tables
      │   │          │
      └───┼──────────┘
          ↓
 InteractiveReportViewState
 filters / sort / dimensions
          │
          ↓
 ReportSnapshotQueryService
          │
          ↓
 Drill-down / visual exploration
          │
          ↓
 typed source references
    with reauthorization
```

---

# 2. Reuse

## Design 033 remains canonical Reporting authority

Design 132 must not introduce:

```text
InteractiveReport
ReportDashboard
ReportDetailRecord
AnalyticsReport
```

as alternate business identities.

Correct:

```text
Report R-20
      │
      ├── Design 131 Report Center
      ├── Design 132 Report Detail
      ├── Design 133 Report Builder
      └── Design 134 Scheduled Reporting
```

All use the **same canonical Report and ReportVersion IDs**.

---

## Design 131 and Design 132 share one backend

### Design 131

Answers:

> Which Reports exist, and which Versions are Draft/Approved/Released?

### Design 132

Answers:

> What exactly is inside this ReportVersion?

Correct:

```text
Report Center
   ↓
Report R-20
   ↓
Version v3
   ↓
Report Detail
```

No copied list-to-detail report data.

---

## `ReportDetailView` ≠ Report

Permanent.

The detail response may compose:

* Report;
* selected ReportVersion;
* Snapshot;
* ReportMetrics;
* sections/charts/tables;
* Approval;
* generated artifact;
* release;
* version history.

It remains a read projection.

---

## Selected ReportVersion must be explicit

Critical.

If:

```text
v3 = Released
v4 = Draft
```

opening v3 must continue showing v3.

The application cannot silently switch to v4 because v4 is numerically newer.

---

## Default selected Version must use a deterministic resolver

A safe resolver can choose according to context, for example:

* explicitly requested Version;
* latest accessible released Version;
* latest accessible Draft for an editor working in Draft context.

Exact default behavior belongs to Phase 3B/3D and frozen UX.

The invariant is:

> **Never choose a Version ambiguously.**

---

## ReportVersion ≠ ReportDatasetSnapshot

Critical.

The Version owns report configuration/content.

The Snapshot owns frozen report data/evidence.

---

## Interactive report ≠ live analytics

This is Design 132's strongest semantic boundary.

Correct:

```text
Report v3
↓
Snapshot DS-9
↓
interactive filters
↓
different views of DS-9
```

Incorrect:

```text
Report v3
↓
query today's production data
↓
numbers changed
```

---

## Design 129 remains live Distribution analytics

For a Distribution report:

```text
Design 129
= current/live performance

Design 132
= selected ReportVersion's frozen performance dataset
```

Both may show visually similar charts.

They are not the same data contract.

---

## Interactive filters ≠ ReportVersion edits

Absolute.

Example:

```text
User filters:
Channel = LinkedIn
```

That changes the **current view**.

It does not permanently change:

* ReportVersion;
* snapshot;
* Client artifact;
* generated PDF;
* release.

---

## Interactive sorting ≠ Report configuration change

Permanent.

---

## Chart drill-down ≠ Report mutation

Permanent.

---

## Dimension toggle ≠ metric-definition change

Critical.

Switching:

> Channel → Placement breakdown

changes the query/view grouping.

It does not redefine the metric.

---

## Temporary date filter ≠ Reporting period change

Important.

If Report v3 covers:

> Aug 1–31

the user may interactively inspect:

> Aug 15–20

if the frozen dataset supports it.

But Report v3 still covers:

> Aug 1–31.

---

## Filter must remain within frozen dataset bounds

A finalized August report cannot interactively expand itself to September using live data.

Correct:

> Selected subrange is constrained to Snapshot DS-9.

---

## Saved report configuration ≠ interactive state

If a user wants to permanently change:

* included metrics;
* chart type;
* sections;
* source dimensions;
* report period;
* narrative;

that belongs to Design 133 / a Draft ReportVersion.

---

## Saved interactive view

If frozen Design 132 includes "Save view":

model it separately from ReportVersion, conceptually:

```text
SavedReportView
```

containing:

* ReportVersion reference;
* filter state;
* sorting;
* selected dimensions;
* owner/scope.

It does not alter the ReportVersion.

Do not invent SavedReportView if the frozen design does not expose it.

---

## Generated artifact ≠ interactive workspace

A released PDF may show one static presentation.

Design 132 can offer richer interactive exploration of the same frozen dataset.

The two can legitimately differ in interaction capability while remaining based on the same Version/Snapshot.

---

## Interactive workspace ≠ Client released artifact

Permanent.

---

## Design 056 remains Client report-access authority

Design 132 is internal Team Workspace.

Client access to ReportVersions/artifacts remains Design 056 unless later frozen client UX explicitly introduces interactive client reports.

---

## Report Metric remains snapshot-based

Report cards/charts should use exact frozen:

```text
ReportMetric
```

or deterministic queries over `ReportDatasetSnapshot`.

Do not retrieve today's MetricAggregate.

---

## Metric definitions remain Design 038 authority

Interactive chart labels and calculations must use canonical MetricDefinition semantics.

---

## Drill-down ≠ raw source access automatically

A user can have:

> Report read access

without having permission to open the canonical underlying source domain.

The Report can still display the frozen report data it is authorized to expose.

Deep source navigation reauthorizes separately.

---

## Report Version comparison ≠ live comparison

If frozen UI supports comparing:

```text
v3 vs v4
```

the comparison must use:

* v3 snapshot;
* v4 snapshot/draft snapshot;

not current live data.

---

# 3. Entities

## Report

Same canonical identity from Design 033.

No new report object.

---

## ReportVersion

Exact selected report revision.

Conceptually:

```text
ReportVersion
├── id
├── reportId
├── versionNumber
├── reportType
├── reportingPeriod
├── datasetSnapshotId
├── presentation configuration
├── narrative/content
├── lifecycle
├── createdBy
├── createdAt
├── finalizedAt?
└── revision
```

---

## Version selection is business identity, not UI index

Never:

```text
versions[2]
```

as a durable reference.

Use:

```text
reportVersionId
```

---

## ReportDatasetSnapshot

Frozen evidence/data.

For interactive reporting, Snapshot must contain sufficient dimensional/granular data to support the permitted interactions.

This is important.

A snapshot containing only:

```text
totalImpressions = 42,300
```

cannot later support:

> break down by Channel.

Therefore, snapshot design needs to preserve the report's allowed analytical dimensions.

---

## Snapshot should not contain unlimited raw source data unnecessarily

Balance:

* reproducibility;
* permitted drill-down;
* storage;
* sensitive-data minimization.

Snapshot schema should capture only the data required to reconstruct and interact with that Version.

---

## Snapshot schema version

Strongly recommended:

```text
snapshotSchemaVersion
```

so historical interactive reports remain readable after reporting-engine evolution.

---

## ReportMetric

Canonical frozen metric representation.

Conceptually:

```text
ReportMetric
├── reportVersionId
├── metricDefinitionId
├── metricDefinitionVersion
├── scope/dimensions
├── period
├── value?
├── availability
├── provenance
├── freshnessAtSnapshot
└── sourceEvidenceRefs
```

---

## ReportMetric ≠ chart

Permanent.

A single ReportMetric may appear in:

* KPI card;
* chart;
* table;
* narrative.

The presentation is separate.

---

## Report Section / Visualization Definition

Where the report contains structured visual sections, ReportVersion may pin a presentation configuration conceptually:

```text
ReportSectionDefinition
ReportVisualizationDefinition
```

This is versioned configuration, not live data.

---

## VisualizationDefinition ≠ MetricDefinition

Critical.

### MetricDefinition

> What does "impressions" mean?

### VisualizationDefinition

> Display impressions as a line chart grouped by channel.

---

## Visualization definition should reference canonical metrics/dimensions by stable keys/IDs

Do not store:

```text
field = "whatever_column_5"
```

or arbitrary SQL.

---

## InteractiveReportViewState

Transient state.

Conceptually:

```text
InteractiveReportViewState
├── selectedReportVersionId
├── activeFilters
├── activeDimensions
├── sort
├── pagination
├── expandedSections
└── comparison context?
```

This is:

* browser/query/session state;
* optionally SavedView state;

not Report truth.

---

## Interactive view state ≠ Report configuration

Permanent.

---

## ReportDrilldownResult

Read projection produced by interactive query.

Conceptually:

```text
ReportDrilldownResult
├── snapshotId
├── metricDefinition
├── filters
├── dimensions
├── rows
├── totals
├── availability
├── provenance
└── queryFingerprint
```

No persistent business identity required unless exporting/saving.

---

## Drill-down row ≠ source entity

A drill-down row can represent:

* Placement;
* Project;
* channel;
* date bucket;
* invoice;
* other typed dimension.

Where it maps to a canonical entity, use typed source reference.

---

## Source reference

Conceptually:

```text
ReportSourceReference
├── sourceType
├── sourceId
├── versionId?
└── displaySnapshot?
```

Deep-linking reauthorizes.

---

## Snapshot display label ≠ current source label

Historical report can preserve:

> Company named Acme Media Ltd.

even if current Company is now:

> Acme Global.

Do not rewrite historical report labels blindly from current records.

---

## GeneratedReportArtifact

Same Design-030 FileVersion relation established by Design 130.

---

## Artifact preview ≠ interactive state

Permanent.

---

## Approval summary

Canonical ApprovalRequest subject = exact ReportVersion.

---

## Release summary

Canonical `ReportRelease` for exact Version/FileVersion.

---

## Report Version history

Should preserve:

```text
v1
v2
v3
v4
```

with meaningful lifecycle state.

Do not collapse historical Versions after supersession.

---

## Version comparison

If supported, comparison should identify what changed across:

* Snapshot;
* period;
* metrics;
* narrative;
* report configuration;
* Approval/release.

Do not compare just rendered text.

---

## Draft snapshot

A Draft Version may have:

```text
DraftSnapshotRevision
```

or equivalent temporary snapshot input.

It can be refreshed explicitly.

It is not yet immutable historical evidence until finalization.

---

## Draft interactive data ≠ finalized snapshot

Critical.

---

# 4. Permissions

Design 132 should conceptually distinguish:

```text
report.read
reportVersion.read
reportDraft.read

reportSnapshot.read
reportInteractive.query
reportDrilldown.read

reportSource.open
reportRawEvidence.read

reportArtifact.download
report.exportInteractiveView

report.editDraft
report.finalize
report.approve
report.release
```

Exact keys belong to Phase 3D.

---

## Report read ≠ every Version read

Critical.

An employee may have access to released Versions but not Draft versions.

---

## ReportVersion read ≠ raw snapshot evidence access universally

Some Snapshot rows may contain sensitive internal details.

---

## Report read ≠ source-domain read

Permanent.

---

## Drill-down within report ≠ source deep-link permission

The user can view report-safe data while still being prohibited from opening raw source records.

---

## Source deep links reauthorize

Absolute.

---

## Interactive filter permission does not grant data outside the ReportVersion's authorized snapshot

Critical.

A malicious user cannot manipulate filter parameters to query:

* another tenant;
* another ReportVersion;
* hidden metrics;
* hidden dimensions.

---

## Hidden dimensions must be server-restricted

Do not trust client-supplied:

```text
groupBy=salary
```

or arbitrary field names.

Use allowlisted report dimensions.

---

## ReportMetric read ≠ MetricDefinition administration

Permanent.

---

## Export interactive view ≠ Report artifact download

Potentially separate.

An interactive filtered export may contain more granular data than the official PDF.

---

## Export permission ≠ raw source export

Absolute.

---

## Report edit ≠ interactive explore

Permanent.

Viewing/filtering a report does not require edit rights.

---

## Finalize ≠ Approve

Permanent.

---

## Approve ≠ Release

Permanent.

---

## Client Portal user ≠ internal interactive-workspace user

Design 132 remains internal unless explicitly frozen otherwise.

---

## Direct ReportVersion IDs reauthorize

Permanent.

---

## Direct Snapshot IDs reauthorize

Permanent.

---

## Direct source-reference IDs reauthorize

Permanent.

---

## Cross-tenant filter/query manipulation prohibited

Absolute.

Authorization must be embedded in the snapshot/query context, not added after the query.

---

# 5. States

Design 132 must keep **Report lifecycle, selected Version lifecycle, Snapshot state, interactive query state, source-evidence state, Approval, release, artifact, and live-source-change state** independent.

### Selected Version

```text
Draft
Finalized
Approval Pending
Approved
Released
Rejected
Superseded
Withdrawn
```

### Snapshot

```text
Not Built
Building
Ready
Partial
Failed
Frozen
```

### Interactive query

```text
Idle
Loading
Ready
Empty
Partial
Restricted
Failed
```

### Source evidence

```text
Available
Restricted
Unavailable
Historical
Corrected After Snapshot
```

### Artifact

Canonical artifact state.

### Approval

Canonical Approval state.

### Release

Canonical release state.

These must never collapse into one generic `reportDetail.status`.

---

## Selected v3 Released ≠ Report has no Draft

Permanent.

v4 may exist simultaneously.

---

## Report has newer Draft ≠ selected v3 stale

Critical.

v3 is a valid historical released Version.

---

## New live data available ≠ finalized Report stale

Absolute.

---

## Source data changed ≠ ReportVersion mutated

Absolute.

---

## Source correction after snapshot ≠ historical snapshot automatically wrong

It may require:

> corrected source exists after report freeze

but the released report remains what was actually released.

---

## Snapshot Partial ≠ metric zero

Absolute.

---

## Interactive query Empty ≠ source data unavailable

Permanent.

It can legitimately mean the applied filters match zero frozen rows.

---

## Query Empty ≠ metric zero universally

Permanent.

---

## Query Failed ≠ ReportVersion failed

Critical.

The report may still be valid while one interactive drill-down cannot load.

---

## Drill-down Restricted ≠ zero rows

Absolute.

---

## Source deep-link unavailable ≠ snapshot evidence unavailable

Permanent.

The frozen report may remain fully readable.

---

## Artifact generation failed ≠ interactive report unavailable

Permanent.

---

## Approval service unavailable ≠ Version rejected

Absolute.

---

## Release service unavailable ≠ Not Released

Could be unknown.

---

## Interactive filter changed ≠ report edited

Absolute.

---

## Saved view changed ≠ ReportVersion changed

If SavedView exists.

---

## State Coverage

Design 132 inherits Design 150 plus:

```text
Report Detail Loading
Report Detail Available
Report Detail Restricted
Report Detail Partial
Report Detail Unavailable

Report Version Draft
Report Version Finalized
Report Version Approval Pending
Report Version Approved
Report Version Released
Report Version Rejected
Report Version Superseded
Report Version Withdrawn

Selected Version Historical
Selected Version Current Released
Selected Version Draft
Newer Draft Version Available
Newer Released Version Available

Snapshot Not Built
Snapshot Building
Snapshot Ready
Snapshot Partial
Snapshot Failed
Snapshot Frozen

Interactive View Ready
Interactive View Filtered
Interactive View Empty
Interactive View Partial
Interactive View Restricted

Drilldown Loading
Drilldown Available
Drilldown Empty
Drilldown Partial
Drilldown Restricted
Drilldown Unavailable
Drilldown Failed

Metric Available
Metric Zero
Metric Partial
Metric Unavailable
Metric Stale-at-Snapshot
Metric Estimated
Metric Manual

Source Evidence Available
Source Evidence Restricted
Source Evidence Unavailable
Source Evidence Corrected After Snapshot
Historical Source Label Retained

Artifact Not Generated
Artifact Generating
Artifact Generated
Artifact Failed
Artifact Unavailable

Approval Pending
Approval Approved
Approval Rejected
Approval State Unknown

Report Not Released
Report Released
Report Superseded
Report Withdrawn
Release State Unknown

Live Source Data Changed
Live Analytics Newer Than Report
Report Snapshot Still Frozen

Report Updated Elsewhere
Version Updated Elsewhere
Snapshot Updated Elsewhere
Approval Updated Elsewhere
Release Updated Elsewhere
Interactive Query Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the **exact Version and report context before the interactive data**.

A safe composition is:

```text
Report title
↓
Selected Version + lifecycle
↓
Reporting period
↓
Approval / Release / Artifact
↓
Interactive report filters
↓
KPI metrics
↓
Charts / tables
↓
Drill-down
↓
Evidence / provenance
↓
Version history
```

Only frozen Design 132 sections should render.

---

## Selected Version should remain persistently visible

The user should never lose track of whether they are exploring:

* Released v3;
* Draft v4;
* Historical v2.

This is especially important after scrolling deep into interactive charts.

---

## Historical and Draft states should look different

Correct:

> v3 — Released · frozen snapshot

> v4 — Draft · snapshot may refresh

not two visually identical "reports."

---

## Frozen-report indication

For finalized/released Versions, it should be clear conceptually that:

> Values are frozen to the report period/version.

This prevents users from expecting Design-129 live behavior.

---

## Interactive filters should show active scope

Example:

> Channel: LinkedIn
> Region: Europe
> Period within report: Aug 15–20

The report's canonical overall period remains:

> Aug 1–31.

---

## Reset interaction

Reset should restore the ReportVersion's default presentation/filter state.

It must not mutate the snapshot.

---

## Drill-down should preserve context

Example:

```text
Total Impressions
   ↓
Channel
   ↓
Placement
   ↓
Metric observation evidence
```

without silently switching to live analytics.

---

## Data availability should remain explicit

Correct:

> Newsletter clicks: Unavailable

not a blank chart or zero bar.

---

## Provenance should be inspectable

Especially for:

* Manual;
* Estimated;
* Partial;
* stale-at-snapshot values.

---

## Chart/table parity

Important accessibility and audit requirement.

Important charts should have:

* textual labels;
* accessible descriptions;
* table/data alternatives where feasible.

Do not make critical report values readable only through color/hover.

---

## Version switching

Switching v3 → v4 must reload:

* Version metadata;
* Snapshot;
* metrics;
* Approval;
* artifact;
* release state;

from v4.

Do not preserve incompatible v3 filter/dimension state blindly.

---

## Tablet

Following Design 152:

* Report/version/period header remains first;
* filters can collapse into compact controls;
* KPI cards stack;
* charts use full-width blocks;
* tables become horizontally managed/column-prioritized;
* Version selector stays accessible;
* evidence/provenance moves into expandable detail.

---

## Mobile

Priority:

```text
Report title
↓
Selected Version
↓
Reporting period
↓
Released / Approval state
↓
Key frozen KPIs
↓
Active filters
↓
Charts / summaries
↓
Detailed tables
↓
Evidence / drill-down
↓
Artifact / Version history
```

---

## Mobile filters

A compact filter sheet/drawer is preferable to a permanently dense toolbar, provided this stays consistent with the frozen responsive system.

---

## Mobile chart interaction

Do not require precision hover.

Provide:

* tap targets;
* accessible legends;
* summary values;
* table alternative.

---

## Accessibility

A report could communicate:

> Client Performance Report R-20, released version 3, covers August 1 through August 31. The current interactive view is filtered to LinkedIn Placements from August 15 through August 20, but the ReportVersion itself still covers the full August period. Total impressions for the current filtered view are 12,450, based on the frozen version 3 snapshot. A newer draft version 4 exists and is not released.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Report Detail architecture

```text
Design 132
    ↓
Authenticated Workspace Context
    ↓
ReportDetailQueryService
    │
    ├── ReportAdapter
    ├── ReportVersionAdapter
    ├── SnapshotAdapter
    ├── ReportMetricAdapter
    ├── VisualizationConfigAdapter
    ├── ApprovalAdapter
    ├── ArtifactAdapter
    ├── ReleaseAdapter
    └── VersionHistoryAdapter
    ↓
ReportDetailView
```

Interactive queries remain snapshot-bound:

```text
InteractiveReportQueryService
        │
        ↓
ReportDatasetSnapshot
        │
        ├── filter
        ├── group
        ├── sort
        └── drill-down
```

---

## Detail query

Conceptually:

```text
getReportDetail(
    reportId,
    selectedReportVersionId?,
    currentMembership
)
```

should:

1. authenticate;
2. authorize Report;
3. resolve requested/default ReportVersion deterministically;
4. authorize Version;
5. resolve exact Snapshot;
6. load report presentation configuration;
7. load frozen KPI/summary data;
8. load Approval/artifact/release summaries;
9. load Version history;
10. permission-filter sensitive source/evidence metadata;
11. return revisions/freshness.

---

## Version resolver

Central:

```text
ReportVersionResolver.resolve(...)
```

must never rely only on:

```text
MAX(versionNumber)
```

It must understand context such as:

* explicit selected Version;
* latest released;
* latest Draft;
* access scope.

---

## Deep links should be Version-specific where historical fidelity matters

A link to:

> Report v3

should continue opening v3 even after v4 exists.

---

## Snapshot query engine

Conceptually:

```text
queryReportSnapshot(
    reportVersionId,
    filters,
    dimensions,
    metrics,
    sort,
    pagination
)
```

must:

1. authorize ReportVersion;
2. resolve its exact Snapshot;
3. validate requested dimensions/metrics against allowlisted ReportVersion configuration;
4. enforce filter values/types;
5. constrain requested period to snapshot/report bounds;
6. query only frozen snapshot data;
7. preserve availability/provenance;
8. return deterministic results.

---

## Finalized report query cannot touch live source data for metrics

Absolute.

This should be an architectural invariant and test.

---

## Draft mode

A Draft ReportVersion may operate against:

* a draft Snapshot;
* explicitly refreshed preview snapshot.

If source data needs refreshing:

that is an explicit Draft refresh/rebuild operation.

Do not silently make every chart refresh mean:

> re-query live system and mutate Draft report state.

---

## Snapshot refresh ≠ filter refresh

Critical.

### Filter refresh

Re-query same Snapshot.

### Snapshot refresh

Create/update Draft snapshot evidence from current sources.

These are different commands.

---

## Finalized snapshot cannot refresh

Absolute.

A finalized/released ReportVersion's snapshot is immutable.

---

## Interactive query language

Use a typed allowlisted query representation.

Conceptually:

```text
metric = IMPRESSIONS
filters = [
  channelId IN [...]
]
groupBy = CHANNEL
```

Do not accept:

* arbitrary SQL;
* arbitrary JavaScript;
* raw database column names;
* user-supplied executable expressions.

---

## Dimension registry

Strongly recommended per report type/version.

Example:

```text
CHANNEL
PLACEMENT
DATE
CAMPAIGN
REGION
```

only where snapshot/config permits them.

---

## Metric registry

Use Design 038 stable IDs.

---

## Interactive filters cannot broaden authorization

Even if the Snapshot contains more data than the current view:

the service must enforce what this ReportVersion/user is permitted to query.

---

## Snapshot-level authorization

Where a ReportVersion itself intentionally exposes a frozen aggregated dataset, user permission may allow those aggregate rows without granting canonical source-domain access.

This policy must be explicit.

---

## Drill-down service

Conceptually:

```text
drillDownReportMetric(
    reportVersionId,
    metricDefinitionId,
    filters,
    dimensionPath
)
```

should operate against frozen Snapshot/evidence first.

---

## Drill-down path must be allowlisted

Do not let the browser invent:

```text
metric → employee salary → auth secret
```

because arbitrary fields exist somewhere in data.

---

## Source-domain deep link

Where drilldown row references canonical source entity:

```text
sourceType
sourceId
```

opening it reauthorizes that domain.

---

## Source currently unavailable

Report snapshot drill-down can remain available if the needed historical data is frozen.

Deep source link may show:

> current source unavailable.

These states are independent.

---

## Historical source correction

If canonical source is corrected later:

Report v3 continues showing its frozen Snapshot.

Design 132 may display, where appropriate:

> Source data was corrected after this ReportVersion was finalized.

But it never silently updates v3.

---

## Interactive aggregation semantics

Must reuse canonical MetricDefinition aggregation rules.

Examples:

* cumulative counters;
* period sums;
* ratios;
* averages;
* weighted measures.

Do not use generic frontend `sum()`.

---

## Derived metric recalculation

If a ReportMetric is derived:

interactive sub-scope recalculation must use the **same pinned formula version** as the ReportVersion.

---

## Cross-dimension total reconciliation

KPI totals and grouped chart/table totals should reconcile according to metric semantics.

If a metric is non-additive:

the UI/query result should not imply summability.

---

## Example: unique reach

If unique audience cannot be safely summed across Channels:

the report engine must not produce:

```text
LinkedIn unique reach
+ Newsletter unique reach
= Total unique reach
```

unless canonical deduplication exists.

---

## Null/unavailable semantics

Interactive query results should carry structured:

```text
availability
value
reason
```

not merely `null`.

---

## Empty filter result

If filter genuinely returns no records:

return:

```text
EMPTY
```

not:

```text
UNAVAILABLE
```

---

## Partial query result

If some snapshot partitions/data are unavailable/corrupt:

return Partial.

Do not silently drop them.

---

## Version comparison

If frozen Design 132 supports comparison:

```text
compareReportVersions(
    reportId,
    versionA,
    versionB
)
```

should compare exact:

* periods;
* Snapshot schemas;
* MetricDefinition versions;
* metrics;
* sections/config;
* narrative;
* release state.

---

## Comparison must account for semantic changes

If:

```text
Engagement Rate formula changed
v3 → v4
```

do not present numeric delta as fully comparable without qualification.

---

## Report artifacts

Design 132 may show:

* preview;
* download;
* generated artifact history.

All resolve exact FileVersion.

---

## Artifact preview ≠ interactive Snapshot query

Permanent.

---

## Export current interactive view

If frozen Design 132 includes export:

the export must capture:

```text
reportVersionId
snapshotId
interactive filter state
metric/dimension selection
generatedAt
```

This should create a derivative export artifact.

It must not automatically become the official released ReportVersion artifact.

---

## Interactive export ≠ ReportRelease artifact

Critical.

---

## Approval

Design 132 shows Approval for exact selected Version.

If selected v3:

do not show v4 Approval as if it belongs to v3.

---

## Release

Same exact-version rule.

---

## Artifact

Same exact-version rule.

---

## Version state header should come from source services

Do not derive:

> Released

because a PDF exists.

---

## Design 133 integration

If user invokes Edit on Draft:

hand off to canonical Builder using:

```text
reportId
reportVersionId
```

Builder changes Draft configuration.

Design 132 remains primarily report viewing/exploration.

---

## Design 134 integration

If Report came from scheduled generation:

Design 132 can display lineage to:

```text
ScheduledReportDefinition
ScheduledReportRun
```

if present in frozen data.

It does not own recurrence.

---

## Search

Design 079 deep links to the same Report/selected ReportVersion.

---

## Client report integration

Design 056 downloads exact released artifacts.

If future Client interactive viewing exists, it should consume a separately permission-filtered ReportVersion projection rather than exposing internal Design-132 source drilldown.

---

## Activity

Design 119 may project:

```text
ReportVersionFinalized
ReportApproved
ReportReleased
```

but ordinary interactive filter changes do not become Activity.

---

## Audit

Meaningful write actions from Design 132 can produce Audit:

* finalize;
* release;
* export sensitive evidence;
* manual correction actions.

Ordinary chart filtering/drilldown usually belongs to application telemetry, not business Audit, unless governance specifically requires it.

---

## Observability

Capture:

* query latency;
* snapshot query errors;
* drilldown failures;
* rendering errors.

Do not turn observability logs into report data.

---

## Idempotency

Required for write operations:

* Draft snapshot refresh;
* finalization;
* artifact generation/export;
* release.

Read-only interactive queries are naturally repeatable.

---

## Optimistic concurrency

Critical for:

### Draft v4 editing while someone finalizes it

Finalization checks current Version/Snapshot revision.

### Snapshot rebuild while Builder config changes

Snapshot build pins configuration revision.

### Artifact generation while ReportVersion changes

Artifact pins exact Version revision.

### Release while newer artifact is generated

Release pins exact approved FileVersion.

---

## Query cache

Interactive query cache should key on:

```text
organizationMembershipId
authorizationRevision
reportVersionId
snapshotId
snapshotRevision
metricDefinitionVersionSet
filters
dimensions
sort
page/cursor
```

---

## Finalized snapshot caching

Released/finalized Snapshot queries are highly cacheable because the data is immutable.

Authorization still applies.

---

## Draft snapshot caching

Draft cache invalidates on:

* snapshot refresh;
* Version configuration change;
* permissions.

---

## Performance

Use:

* precomputed snapshot partitions/aggregates;
* columnar/analytical-friendly structures where justified;
* indexed dimensions;
* bounded drilldowns;
* server pagination for large tables;
* progressive/lazy chart loading.

Avoid sending the entire Snapshot to the browser for local filtering when it may be large or sensitive.

---

## Browser-side filtering only for small already-authorized result sets

Never rely on browser filtering as the primary security/query model.

---

## Snapshot size

For large reports, snapshot data may be separated into:

* summary;
* chart aggregates;
* drilldown partitions.

All remain linked to the same Snapshot identity.

---

## Accessibility data

Chart data should be available through structured table/summary endpoints where the frozen UX requires accessible alternatives.

---

## Partial failure contract

Example:

```text
Report core         ✓
Selected v3         ✓
Snapshot            ✓
Interactive charts  ✓
Source service      ✕
```

Correct:

> Report v3 and its frozen data remain fully available; current source record links are temporarily unavailable.

Incorrect:

> Report data unavailable.

Another:

```text
Report v3           ✓
Snapshot            ✓
Artifact service    ✕
```

Correct:

> Interactive Report v3 is available; downloadable artifact availability cannot currently be verified.

Not:

> Report failed.

Another:

```text
Snapshot summary    ✓
One drilldown       ✕
```

Correct:

> Report summary is available; this drill-down could not be loaded.

Not:

> Report is partial universally.

Another:

```text
Released v3         ✓
Live analytics      unavailable
```

Correct:

> Released v3 remains fully available from its frozen Snapshot.

Not:

> Performance unavailable.

---

## Backend Requirement Matrix

| Requirement                                     | Status                            |
| ----------------------------------------------- | --------------------------------- |
| Design 033 canonical Report reuse               | **Critical**                      |
| Design 131 same Report/Version backend          | **Critical**                      |
| No InteractiveReport business entity            | **Critical**                      |
| ReportDetailView/Report separation              | **Critical**                      |
| Exact selected ReportVersion                    | **Critical**                      |
| Deterministic default Version resolver          | **Critical**                      |
| Historical deep-link Version stability          | **Critical**                      |
| ReportVersion/Snapshot separation               | **Critical**                      |
| Finalized Snapshot/live data separation         | **Critical**                      |
| Interactive view state/ReportVersion separation | **Critical**                      |
| Filter/Reporting-period separation              | **Critical**                      |
| Draft Snapshot/finalized Snapshot separation    | **Critical**                      |
| Finalized Snapshot immutability                 | **Critical**                      |
| Explicit Draft snapshot refresh                 | **Critical**                      |
| Snapshot sufficient for allowed drill-down      | **Critical architecture**         |
| Snapshot data minimization                      | **Critical architecture**         |
| Snapshot schema versioning                      | **Critical**                      |
| Metric Registry Design-038 reuse                | **Critical**                      |
| Metric/VisualizationDefinition separation       | **Critical**                      |
| Pinned calculation-version reuse                | **Critical**                      |
| Allowlisted dimensions/filters                  | **Critical**                      |
| No arbitrary SQL/JS query expressions           | **Critical**                      |
| Interactive filters cannot expand authorization | **Critical**                      |
| Permission before snapshot query                | **Critical**                      |
| Report read/source-domain read separation       | **Critical**                      |
| Source deep-link reauthorization                | **Critical**                      |
| Empty/Unavailable/Partial separation            | **Critical**                      |
| Zero/Unavailable separation                     | **Critical**                      |
| Provenance/freshness retained                   | **Critical**                      |
| Non-additive metric handling                    | **Critical**                      |
| Version comparison semantic compatibility       | **Critical if comparison exists** |
| Design 030 exact artifact reuse                 | **Critical**                      |
| Approval exact selected Version                 | **Critical**                      |
| Release exact selected Version                  | **Critical**                      |
| Interactive export/official artifact separation | **Critical if export exists**     |
| Design 133 Builder separation/reuse             | **Critical architecture**         |
| Design 134 Scheduled-report lineage reuse       | **Critical architecture**         |
| Design 056 client-surface separation            | **Critical**                      |
| Design 129 live-analytics separation            | **Critical**                      |
| Cross-tenant query isolation                    | **Critical**                      |
| Stable server-side drilldown pagination         | **Critical**                      |
| Immutable Snapshot caching                      | **Critical performance**          |
| Audit/observability separation                  | **Critical**                      |
| Optimistic concurrency for write transitions    | **Critical**                      |
| Partial dependency failure handling             | **Critical**                      |

---

# 8. Consolidation

Design 132 has a particularly high risk of blurring **frozen reporting** with **live BI**, because the visual interaction model may look similar to an analytics dashboard.

**Design 131 / Design 132 backend duplication**
Library and Detail resolve different ReportVersion state.

**ReportDetailView / Report conflation**
Read composition becomes report source truth.

**Report / ReportVersion conflation**
Historical Versions disappear.

**Selected Version / latest Version conflation**
v3 deep link silently opens v4.

**Latest created / latest released conflation**
Draft becomes Client-facing truth.

**ReportVersion / Snapshot conflation**
Presentation and frozen evidence become one opaque object.

**Snapshot / live query conflation**
Finalized numbers change over time.

**Interactive report / live analytics conflation**
Design 132 duplicates Design 129/038.

**Interactive filter / ReportVersion edit conflation**
Exploration silently changes report configuration.

**Interactive date subrange / report period conflation**
Aug 15–20 filter rewrites Aug 1–31 report scope.

**Filter reset / snapshot refresh conflation**
UI reset changes underlying data.

**Snapshot refresh / filter refresh conflation**
Draft data silently changes during exploration.

**Finalized Snapshot / refreshable dataset conflation**
Released report becomes mutable.

**Interactive view state / Builder configuration conflation**
Temporary user exploration modifies Design 133.

**Saved View / ReportVersion conflation**
Personal preference becomes report truth.

**MetricDefinition / VisualizationDefinition conflation**
Changing chart changes metric meaning.

**ReportMetric / chart series conflation**
Presentation becomes data authority.

**Visualization config / raw SQL conflation**
Unsafe arbitrary queries enter reporting.

**Dimension key / database column conflation**
Internal schema is exposed to users.

**Report filter / authorization filter conflation**
User manipulates UI filter to access restricted data.

**Report read / Snapshot raw evidence read conflation**
Granular internal data leaks.

**Snapshot read / source-domain read conflation**
Report access grants Contracts/Finance/etc.

**Drill-down / source deep-link access conflation**
Opening chart row bypasses source permissions.

**Source currently unavailable / Snapshot unavailable conflation**
Historical report disappears because production system is down.

**Historical label / current source label conflation**
Old report names change.

**Current source correction / frozen report correction conflation**
v3 silently updates.

**New live data / report stale conflation**
Historical report is incorrectly treated as invalid.

**Interactive Empty / metric zero conflation**
No rows under filter appears as zero performance.

**Interactive Empty / data unavailable conflation**
Valid empty result becomes system error.

**Partial drilldown / entire Report partial conflation**
One failed subsection marks whole report broken.

**Artifact unavailable / interactive Report unavailable conflation**
PDF storage outage hides report data.

**Interactive Report / generated artifact conflation**
PDF becomes the only report representation.

**Interactive export / official released artifact conflation**
Ad-hoc filtered export appears as Client-approved report.

**Export permission / raw source export conflation**
Report user can dump sensitive source data.

**Approval state / selected Version conflation**
v4 Approval shown while viewing v3.

**Release state / selected Version conflation**
v3 appears unreleased because v4 is Draft.

**Artifact / selected Version conflation**
latest PDF shown for historical v3.

**Version comparison / live comparison conflation**
v3/v4 delta uses today's source data.

**Version comparison / formula compatibility conflation**
Different metric formulas treated as directly comparable.

**Metric aggregation / generic SUM conflation**
Non-additive metrics become incorrect.

**Unique reach / summed reach conflation**
Cross-channel double counting.

**Zero / unavailable conflation**
Missing data becomes performance.

**Manual / provider metric conflation**
Evidence quality hidden.

**Stale-at-snapshot / current stale conflation**
Historical data-quality context becomes today's data status.

**Draft Snapshot / released Snapshot conflation**
Mutable preview becomes historical evidence.

**Report detail edit / Builder conflation**
Design 132 becomes Design 133.

**Scheduled lineage / ReportVersion conflation**
Scheduled definition becomes report content.

**Client interactive report / internal report conflation**
Source drilldowns leak to Client.

**Activity / interactive action conflation**
Every chart click floods Project Activity.

**Audit / view telemetry conflation**
Ordinary reading becomes governance noise.

**Observability logs / report data conflation**
Query failure logs become Report evidence.

**Browser filtering / server authorization conflation**
Sensitive Snapshot data is shipped to client then hidden.

**Browser-local totals / canonical ReportMetric conflation**
Frontend calculates different totals from report.

**Generic `interactive_report_data JSON`**
No Snapshot/version/metric semantic control.

**Generic `selectedVersion = latest`**
Historical links are unstable.

**Generic `filters` stored on ReportVersion**
Temporary user state mutates report.

**Generic arbitrary query builder**
Security and metric integrity collapse.

**132/033 duplicate Reporting backend**
Foundation forks.

**132/038 duplicate metric/query semantics**
Interactive calculations differ from Analytics.

**132/056 duplicate Client report experience**
Internal details leak externally.

**132/129 duplicate live analytics**
Frozen Report and current Distribution Performance merge.

**132/130 duplicate final-report snapshot semantics**
Report Detail recomputes released values.

**132/131 duplicate version resolver**
List and Detail disagree.

**132/133 duplicate Report Builder**
Interactive filters become permanent configuration.

**132/134 duplicate Scheduled-report behavior**
Detail starts owning recurrence.

No additional screen is required.

These are **exact selected-Version identity, frozen-snapshot interaction, live/frozen separation, safe interactive query semantics, Snapshot-aware drill-down, source reauthorization, non-additive metric integrity, Builder separation, artifact/release identity, and responsive interactive-report requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL REPORT-VERSION DETAIL, FROZEN-DATASET EXPLORATION & EVIDENCE DRILL-DOWN ANCHOR**

**Domain directive:**
**Report ≠ ReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ ReportSection/VisualizationDefinition ≠ InteractiveReportViewState ≠ ReportDrilldownResult ≠ GeneratedReportArtifact ≠ ApprovalRequest ≠ ReportRelease ≠ LiveAnalytics ≠ SourceDomainRecord.**

**Foundation directive:**
Design 033 remains the sole canonical Reporting domain, while Designs 131–134 share the same Report/ReportVersion/Snapshot identities.

**Detail directive:**
Design 132 is an exact-version interactive read/workspace over canonical Report data and never becomes a separate `InteractiveReport` business entity.

**Version directive:**
every Report Detail session resolves one explicit ReportVersion. Historical v3 deep links remain v3 even when v4/v5 later exist.

**Resolver directive:**
one `ReportVersionResolver` must understand explicit selection, latest Draft, latest Approved and latest Released semantics; `MAX(versionNumber)` is never sufficient.

**Concurrent-version directive:**
`v3 Released + v4 Draft` remains first-class. Viewing v3 must show v3's Approval, artifact, release, Snapshot and metrics—not v4 state.

**Snapshot directive:**
every finalized/released ReportVersion interacts exclusively against its pinned immutable `ReportDatasetSnapshot`.

**No-live-query directive:**
interactive filtering, charting and drill-down on a finalized ReportVersion must never query current production/live analytics as the source of report numbers.

**Interactive-state directive:**
filters, selected dimensions, sorting, pagination, expanded sections and temporary date subranges are `InteractiveReportViewState`, not ReportVersion mutation.

**Period directive:**
interactive sub-period filtering can narrow exploration inside the frozen report period but can never silently broaden/change the canonical ReportVersion period.

**Draft directive:**
Draft ReportVersions may use explicitly refreshable Draft snapshots, but Snapshot refresh remains a deliberate operation distinct from ordinary filter/query refresh.

**Finalized-immutability directive:**
once finalized, Snapshot refresh is prohibited. A different dataset requires a new ReportVersion.

**Snapshot-schema directive:**
ReportDatasetSnapshot must preserve sufficient approved dimensions/granularity to reproduce the Version and support its allowed interactive drill-down, while avoiding unnecessary raw-data duplication.

**Schema-version directive:**
snapshot schema/version metadata should allow historical interactive Reports to remain queryable after reporting-engine evolution.

**Metric directive:**
Design 038 remains canonical Metric Registry. All Report metrics, chart calculations and interactive aggregations reuse the Version-pinned MetricDefinition/calculation semantics.

**Visualization directive:**
VisualizationDefinition controls presentation only; it never redefines MetricDefinition semantics.

**Query-safety directive:**
interactive reporting uses typed, allowlisted metrics, dimensions, operators and filters—not arbitrary SQL, JavaScript, database columns or executable expressions.

**Authorization directive:**
authorization is applied before every snapshot query/drill-down; client-supplied filters or groupings can never expand access beyond the selected ReportVersion/user scope.

**Snapshot/source directive:**
ReportVersion/Snapshot read access and live source-domain access remain separate. The frozen report can remain readable even if the user cannot open the underlying canonical source record.

**Deep-link directive:**
every source-domain drill-down/deep link reauthorizes the canonical Project, Placement, Invoice, Contract, etc. independently.

**Historical-label directive:**
where historical report semantics require it, Snapshot-pinned display/context values remain stable even if current Company/Client/source labels later change.

**Correction directive:**
source-domain corrections after Report finalization never mutate the frozen Version. The UI may indicate that newer/corrected source data exists and allow creation of a newer ReportVersion.

**Empty-state directive:**
an interactive query returning no matching frozen rows is `EMPTY`, not `UNAVAILABLE`, `ERROR`, or necessarily metric zero.

**Partial-state directive:**
one failed drill-down or unavailable evidence source does not make the entire ReportVersion invalid; Report core and each interactive region degrade independently.

**Availability directive:**
`0`, `Unavailable`, `Partial`, `Estimated`, `Manual`, and stale-at-snapshot values retain their exact semantics throughout interactions.

**Non-additive directive:**
the query engine must respect non-additive metric behavior. It cannot generically sum unique reach, ratios, cumulative totals, or other non-additive metrics across dimensions.

**Derived-metric directive:**
interactive sub-scope recalculations use the exact formula/version pinned by the ReportVersion, including zero-denominator/precision policy.

**Version-comparison directive:**
if frozen Design 132 supports Version comparison, the comparison uses each Version's exact Snapshot and metric-definition versions and explicitly qualifies semantically incompatible calculations.

**Artifact directive:**
generated PDFs/files remain exact Design-030 FileVersions tied to the selected ReportVersion; artifact availability never determines whether the interactive Snapshot itself exists.

**Interactive-export directive:**
if exporting a filtered interactive view is supported, the export records exact ReportVersion/Snapshot/filter/dimension lineage and remains a derivative artifact—not the canonical released Client report unless separately governed.

**Approval directive:**
selected ReportVersion's ApprovalRequest is displayed/used exactly. Approval state from another Version can never bleed into the current detail.

**Release directive:**
ReportRelease is exact-Version/exact-FileVersion evidence and remains separate from selected interactive view state.

**Builder directive:**
permanent changes to metrics, report period, sections, visual configuration, source scope, formulas or narrative belong to Design 133 and a Draft ReportVersion, not Design-132 interactive filters.

**Scheduled-report directive:**
Design 134 may provide generation lineage for the ReportVersion but remains the sole owner of recurrence/run scheduling.

**Client directive:**
Design 056 remains Client-facing Report access. Internal Design-132 drill-down/source evidence and Draft Versions are never exposed merely because the Report has a Client.

**Search directive:**
Design 079 and Design 131/132 all share canonical Report/ReportVersion IDs; search results cannot choose or mutate report state independently.

**Read-only interaction directive:**
ordinary filtering, chart interaction, table sorting and drill-down do not produce business Activity/Audit events by default. They belong to normal product telemetry unless governance requires otherwise.

**Audit directive:**
material write actions—finalization, release, sensitive export, governed correction—produce canonical actor/version-aware Audit evidence.

**Observability directive:**
query latency, snapshot-query failures and rendering errors remain operational telemetry and never become report evidence.

**Idempotency directive:**
Draft snapshot rebuild, artifact/export generation, finalization and release are replay-safe.

**Concurrency directive:**
Draft snapshot/config updates, finalization, artifact generation and release use exact Version/Snapshot revisions so stale users cannot freeze or release the wrong dataset.

**Caching directive:**
finalized Snapshot query results can be strongly cached by exact Version/Snapshot/filter/query fingerprint while authorization remains part of cache scoping.

**Draft-caching directive:**
Draft interactive caches invalidate when the Draft Snapshot or ReportVersion configuration changes.

**Server-query directive:**
large/sensitive Snapshots are queried server-side with pagination/aggregation rather than sent wholesale to browsers for local filtering.

**Accessibility directive:**
report-critical charts expose accessible labels, textual summaries and table-equivalent data where appropriate; essential values never depend only on color or hover interactions.

**Partial-failure directive:**
Report core, Snapshot, individual drilldowns, source domains, artifact storage, Approval and release services may fail independently. `Unavailable` can never be silently interpreted as zero, rejected, unreleased, or missing report data.

**Performance directive:**
use immutable precomputed Snapshot summaries/partitions, indexed allowed dimensions, lazy drilldowns, server pagination and query-result caching rather than repeatedly recalculating full historical reports from source domains.

**Future-reuse directive:**
Design **133 — Report Builder / Custom Report Configuration** must create/edit Draft `ReportVersion` configuration using the same canonical Report, MetricDefinition, Snapshot and Version architecture. Its saved layout, sections, metric selections, dimensions, filters, source configuration and narrative rules must produce a new or updated Draft Version and must never mutate finalized/released Versions explored through Design 132.

**Overlap directive:**
Designs **030, 033, 038, 056, 079, 129–134** must preserve one continuous **canonical Report → explicit ReportVersion → frozen ReportDatasetSnapshot → pinned MetricDefinition/calculation semantics → presentation configuration → interactive snapshot-bound filtering/drill-down → exact Approval/artifact/release → Client access** lineage while keeping current live analytics and canonical source-domain records independently authoritative.

**Consolidation directive:**
**STANDARDIZE ONE REPORT DETAIL & INTERACTIVE EXPLORATION FOUNDATION — DESIGN-033 CANONICAL REPORT/REPORTVERSION IDENTITIES + EXPLICIT VERSION RESOLUTION + IMMUTABLE FINALIZED DATASET SNAPSHOTS + TYPED ALLOWLISTED SNAPSHOT QUERY ENGINE + DESIGN-038 PINNED METRIC SEMANTICS + TEMPORARY INTERACTIVEREPORTVIEWSTATE + PERIOD-BOUNDED FILTERING + SNAPSHOT-BASED DRILLDOWN + SOURCE REAUTHORIZATION + NON-ADDITIVE METRIC SAFETY + EXACT VERSION-SCOPED APPROVAL/ARTIFACT/RELEASE + DESIGN-133 DRAFT-CONFIGURATION SEPARATION + DESIGN-134 SCHEDULE LINEAGE — AND NEVER ALLOW LIVE DATA QUERIES, `LATEST` VERSION RESOLUTION, BROWSER-LOCAL TOTALS, ARBITRARY QUERY EXPRESSIONS, UI FILTERS, CURRENT SOURCE LABELS, GENERATED PDFS OR INTERACTIVE EXPORTS TO SUBSTITUTE FOR OR REWRITE CANONICAL REPORTVERSION, SNAPSHOT, METRIC, APPROVAL, ARTIFACT OR RELEASE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **132 / 153** |
| **PASS**                                   |                        **132** |
| **STANDARDIZE decisions**                  |                        **130** |
| **Potential implementation-overlap flags** |                        **123** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**132 / 153 = 86.3% audited.**

### Canonical interactive-report architecture after Design 132

```text
REPORT R-20
    │
    ├── v3 RELEASED
    │      │
    │      ↓
    │   Snapshot DS-8
    │      │
    │      ├── Metrics
    │      ├── Dimensions
    │      ├── Evidence
    │      └── frozen period
    │
    └── v4 DRAFT
           │
           ↓
       Draft Snapshot DS-9

User selects v3
        │
        ↓
Design 132
        │
        ↓
Filter / Group / Drill-down
        │
        ↓
ONLY Snapshot DS-8
```

The strongest interactive-report rule is now explicit:

```text
Report v3:
Aug 1–31
42,300 impressions

Today live analytics:
45,100 impressions

User filters Report v3
to Aug 15–20.

Design 132 queries:

v3 Snapshot only.

It does NOT query
today's live analytics.
```

Interactive view state remains non-destructive:

```text
User selects:
Channel = LinkedIn
Region = Europe
Sort = Highest Engagement

        ≠

Report edited

        ≠

Snapshot changed

        ≠

Client PDF changed

        ≠

Report period changed
```

Version identity also remains exact:

```text
Report R-20

v3 = Released
v4 = Draft

Opening v3:

Snapshot = v3
Approval = v3
Artifact = v3
Release = v3

Nothing from v4
silently enters the view.
```

And drill-down preserves authorization boundaries:

```text
Report metric
      ↓
Frozen snapshot rows
      ↓
Source reference

User may read the report
but still lack permission
to open the live source record.

Deep source access
reauthorizes separately.
```

## Next Sequential Audit Target

### **Design 133 — Report Builder / Custom Report Configuration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
