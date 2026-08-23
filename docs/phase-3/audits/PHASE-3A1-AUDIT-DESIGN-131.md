# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 131 — Reporting Library / Report Center

Design 131 should become the **canonical Team Workspace cross-domain report discovery, report-version summary, client/reporting-period filtering, approval/release visibility, generated-artifact status, and report-access surface** built directly on the Reporting foundation established by **Design 033 — Reporting / Client Reporting Workspace**.

Design 131 must **not create a second Reporting domain**. It should provide one consolidated Report Center over the canonical `Report`, `ReportVersion`, `ReportDatasetSnapshot`, generated artifact, Approval, release, scheduled-report, Client-access, and domain-specific report identities already established across the platform.

It must preserve strict boundaries with:

* Design 033 — canonical Reporting foundation;
* Design 056 — Client Reports & Downloads;
* Design 130 — Final Distribution Report;
* Design 132 — Report Detail / Interactive Report;
* Design 133 — Report Builder / Custom Report Configuration;
* Design 134 — Scheduled Reports / Report Delivery Management;
* Design 038 — Metric Registry / Analytics;
* Design 030 — generated Asset/FileVersion;
* Designs 029/115 — Approval;
* Design 079 — Global Search.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Report ≠ ReportVersion ≠ ReportType ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ GeneratedReportArtifact ≠ ReportRelease ≠ ScheduledReportDefinition ≠ ReportLibraryEntry ≠ SavedView/Filter ≠ LiveAnalytics ≠ ClientDownload.**

The central implementation rule is:

> **The Report Center is a discovery/read-projection surface, not a second report database. Each row/card must resolve one canonical Report and clearly distinguish its latest Draft, latest Finalized/Approved Version, latest Released Version, reporting period, artifact state, and Client-release state. “Latest created” must never be assumed to mean “latest approved” or “latest released.” Filtering, counts, search, pagination, and actions must remain permission-safe and operate on canonical Report identities; library metadata must never overwrite ReportVersion, snapshot, Approval, release, artifact, or scheduled-report truth.**

---

# 1. Classification

| Audit field                            | Classification                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                          | **131**                                                                                                                                                                                                       |
| **Canonical name**                     | **Reporting Library / Report Center**                                                                                                                                                                         |
| **Product area**                       | Team Workspace / Reporting / Report Discovery                                                                                                                                                                 |
| **User surface**                       | **Authenticated Team Workspace**                                                                                                                                                                              |
| **Screen class**                       | Canonical Reporting Collection / Library / Cross-Domain Discovery Workspace                                                                                                                                   |
| **Classification**                     | **Canonical Cross-Domain Report Discovery, Version-Summary & Release-Visibility Anchor**                                                                                                                      |
| **Primary purpose**                    | Give authorized Team users one searchable/filterable collection of canonical reports across report types, Clients, Projects, Campaigns and reporting periods without duplicating report data or version state |
| **Canonical Reporting foundation**     | **Design 033**                                                                                                                                                                                                |
| **Primary entity**                     | **Report**                                                                                                                                                                                                    |
| **Version identity**                   | **ReportVersion**                                                                                                                                                                                             |
| **Report classification**              | `ReportType` / typed report registry                                                                                                                                                                          |
| **Frozen data input**                  | `ReportDatasetSnapshot`                                                                                                                                                                                       |
| **Generated artifact**                 | Asset/FileVersion — Design 030                                                                                                                                                                                |
| **Approval dependency**                | Designs 029 / 115                                                                                                                                                                                             |
| **Release identity**                   | `ReportRelease`                                                                                                                                                                                               |
| **Client report projection**           | Design 056                                                                                                                                                                                                    |
| **Distribution report specialization** | Design 130                                                                                                                                                                                                    |
| **Report detail dependency**           | Design 132                                                                                                                                                                                                    |
| **Builder dependency**                 | Design 133                                                                                                                                                                                                    |
| **Scheduled report dependency**        | Design 134                                                                                                                                                                                                    |
| **Analytics/Metric dependency**        | Design 038                                                                                                                                                                                                    |
| **Search dependency**                  | Design 079                                                                                                                                                                                                    |
| **Library projection**                 | `ReportLibraryEntry`                                                                                                                                                                                          |
| **Saved filtering**                    | SavedView/filter semantics where frozen UI supports them                                                                                                                                                      |
| **Primary query service**              | `ReportLibraryQueryService`                                                                                                                                                                                   |
| **Report registry**                    | `ReportTypeRegistry`                                                                                                                                                                                          |
| **Version-summary resolver**           | `ReportVersionSummaryResolver`                                                                                                                                                                                |
| **Report access resolver**             | `ReportAccessResolver`                                                                                                                                                                                        |
| **Artifact summary resolver**          | `ReportArtifactSummaryResolver`                                                                                                                                                                               |
| **Release summary resolver**           | `ReportReleaseSummaryResolver`                                                                                                                                                                                |
| **Parent shell**                       | `InternalAppShell` — Design 001                                                                                                                                                                               |
| **Auth**                               | Required                                                                                                                                                                                                      |
| **Authorization**                      | Active OrganizationMembership + report/report-type/client/project scoped access                                                                                                                               |
| **Implementation priority**            | **Critical Reporting Discoverability / Version Integrity / Permission Safety**                                                                                                                                |
| **Reuse level**                        | **Extremely High across all reporting types and future scheduled/report-builder workflows**                                                                                                                   |

Design 131 should answer:

> **“Which reports exist that I am authorized to see, what type and period does each report cover, which Version is currently Draft/Finalized/Approved/Released, whether a downloadable artifact exists, whether it has been released to a Client, and where should I open it for detailed review or further governed work?”**

Canonical composition:

```text
Reports across the platform
        │
        ├── Distribution Report DR-20
        ├── Project Report PR-31
        ├── Executive Report ER-12
        ├── Client Performance Report CR-18
        └── other canonical report types
                   │
                   ↓
            ReportTypeRegistry
                   │
                   ↓
          ReportLibraryQueryService
                   │
                   ↓
          ReportLibraryEntry[]
                   │
          ┌────────┼────────┐
          ↓        ↓        ↓
       Version   Approval  Release
       summary   summary   summary
                   │
                   ↓
             Design 131
             Report Center
```

---

# 2. Reuse

## Design 033 remains the canonical Reporting domain

This is the strongest rule for Design 131.

Design 131 must not create:

```text
LibraryReport
ReportCenterReport
ReportCard
ReportRecord
```

as independent writable business entities.

Correct:

```text
Report R-100

same Report ID used by:
Design 033
Design 131
Design 132
Design 133
Design 134
Design 056 client projection
```

---

## `ReportLibraryEntry` ≠ Report

Permanent.

`ReportLibraryEntry` is a permission-safe read projection containing only the summary needed for collection browsing.

Conceptually:

```text
ReportLibraryEntry
├── reportId
├── reportType
├── title
├── client/project/campaign context
├── reporting period
├── latest draft summary
├── latest finalized summary
├── latest released summary
├── approval summary
├── artifact summary
├── schedule summary
└── next allowed action
```

It is rebuildable.

---

## Report ≠ ReportVersion

Critical.

A library entry must not show one vague:

> Status: Released

without knowing which exact Version was released.

Example:

```text
Report R-20

v3 = Released
v4 = Draft
```

Correct library summary:

> Released v3 · Draft v4 exists.

Incorrect:

> Latest v4 · Released.

---

## Latest-created Version ≠ latest Draft ≠ latest Finalized ≠ latest Approved ≠ latest Released

This distinction must be canonical.

Example:

```text
v3 Released
v4 Rejected
v5 Draft
```

The library must not use:

```text
MAX(versionNumber) = v5
```

and imply that v5 is the Client's current report.

---

## Design 130 Distribution Report uses same Reporting identities

Design 130's:

```text
DistributionReport DR-20
ReportVersion v3
```

should appear in Design 131 without copying its data.

---

## Design 056 consumes released Report truth

Design 131 may show:

> Released to Client.

Design 056 shows the Client-facing collection of those exact released ReportVersions/artifacts.

Neither creates parallel Client-report records.

---

## Design 132 must open the same Report/Version

Clicking a Report Center entry should conceptually lead to the canonical Report detail context.

Do not serialize a copy of report data into a library-only detail route/backend.

---

## Design 133 Builder remains report-configuration authority

Design 131 may expose a create/configure action **if present in the frozen design**, but actual configuration belongs to Design 133.

---

## Design 134 Scheduled Reports remains scheduling authority

Report Center may show:

> Scheduled monthly

or a scheduled-report summary.

It must not store its own recurrence or next-run data.

---

## Report ≠ ScheduledReportDefinition

Critical.

A recurring report configuration may produce multiple Reports/ReportVersions over time.

Example:

```text
ScheduledReportDefinition SR-10
monthly
        │
        ├── January Report R-1
        ├── February Report R-2
        └── March Report R-3
```

Do not make the scheduled definition itself the Report.

---

## Report type ≠ Report

Permanent.

`DISTRIBUTION_PERFORMANCE` is classification.

`Report R-20` is one canonical report.

---

## Report type ≠ Template

A report type defines semantics/category.

A Report Template/Builder configuration defines reusable structure/layout.

Do not collapse them.

---

## Report ≠ Generated Artifact

Permanent.

A PDF, spreadsheet, generated document, or other file is an exact artifact of a ReportVersion.

---

## Report Artifact ≠ Client release

The artifact may exist internally before Client release.

---

## Report release ≠ Report approval

Permanent.

---

## Report approval ≠ Report finalization

Permanent.

---

## Report list ≠ analytics dashboard

Design 131 may show KPI-style counts if frozen.

Those counts summarize Reports.

They do not become Analytics metrics or report contents.

---

## Saved View ≠ Report list

If users can save filters:

```text
SavedView
```

stores query/filter configuration.

It does not own or duplicate the Reports matching that query.

---

## Search result ≠ Report Library Entry

Design 079 Universal Search can find canonical Reports.

Design 131 remains the specialized reporting collection.

They may share indexing/query adapters but not business identity.

---

# 3. Entities

## Report

Canonical Design-033 identity.

Conceptually:

```text
Report
├── id
├── organizationId
├── reportType
├── sourceContext
├── clientRelationshipId?
├── lifecycle
├── currentDraftVersionId?
├── latestFinalizedVersionId?
├── latestReleasedVersionId?
├── owner?
├── createdBy
├── createdAt
└── revision
```

Exact schema Phase 3D.

---

## Report pointers should be governed/derived carefully

Convenience pointers such as:

```text
currentDraftVersionId
latestReleasedVersionId
```

may be useful.

They must be updated by canonical ReportVersion lifecycle transitions—not arbitrary Library UI mutation.

---

## ReportType

A typed registry is preferable.

Conceptually:

```text
ReportTypeDefinition
├── key
├── name
├── owning domain
├── allowed source types
├── allowed report configuration
├── supported output formats
├── metric policies?
└── lifecycle
```

Examples may include:

* Distribution performance;
* Project completion;
* Client performance;
* Executive report;

only where actually supported by frozen designs.

Do not invent an uncontrolled user-created string type taxonomy here.

---

## ReportType ≠ source domain

A Distribution Report may belong to Reporting domain while referencing Distribution source data.

The source domain remains canonical.

---

## ReportVersion

Canonical versioned report identity.

Library should expose summaries such as:

```text
latestDraftVersion
latestApprovedVersion
latestReleasedVersion
```

without cloning version rows.

---

## ReportVersionSummary

A read-model concept.

Conceptually:

```text
ReportVersionSummary
├── versionId
├── versionNumber
├── lifecycle
├── reportingPeriod
├── createdAt
├── finalizedAt?
├── approvalState?
├── releaseState?
└── artifactState?
```

---

## Version summary ≠ Version authority

Permanent.

---

## Reporting period

Where report type uses periods:

preserve:

```text
start
end
timezone
```

The library may filter by reporting period.

---

## Reporting period ≠ created date

Critical.

A report created September 1 may cover August.

Filters must distinguish:

* Created date;
* Reporting period;
* Released date.

---

## Client / Project / Campaign context

The library may show context through typed references.

Conceptually:

```text
ReportContextReference
├── sourceType
└── sourceId
```

Do not create duplicated Client/Project/Campaign fields that drift from canonical source identities.

---

## Multi-context Report

If a report legitimately spans several source entities, model typed ReportSourceReferences rather than stuffing IDs into a generic string.

Do not force this if frozen reports are single-source.

---

## GeneratedArtifactSummary

Read projection over canonical Asset/FileVersion.

Example:

```text
GeneratedArtifactSummary
├── format
├── fileVersionId
├── generatedAt
├── availability
└── security/processing state
```

---

## Artifact exists ≠ released

Permanent.

---

## Artifact available ≠ user can download

Authorization remains separate.

---

## Approval summary

Read projection over canonical ApprovalRequest.

Conceptually:

```text
ReportApprovalSummary
├── approvalRequestId
├── reportVersionId
├── aggregateState
└── updatedAt
```

No duplicate approval status.

---

## Release summary

Read projection over `ReportRelease`.

Conceptually:

```text
ReportReleaseSummary
├── reportVersionId
├── client/context
├── releasedAt
├── exactFileVersionId
└── lifecycle
```

---

## Client download summary

If frozen Report Center shows Client interaction:

it may show:

> Downloaded by Client

from exact ClientDownloadEvents.

But download state is not release state.

---

## Scheduled report summary

If applicable:

```text
ScheduledReportSummary
├── scheduledReportDefinitionId
├── cadence
├── nextRunAt
├── lifecycle
└── lastRunResult
```

read from Design 134 domain.

---

## `ReportLibraryEntry`

Should be materialized/read-model friendly but disposable.

It must not own:

* lifecycle;
* approval;
* release;
* artifact;
* schedule.

---

## Library grouping

If UI groups:

* Recent;
* Draft;
* Approved;
* Released;
* Scheduled;

those are query views over canonical states.

They are not folders/business states.

---

## Folder/category ≠ security scope

If Design 131 visually has folders/categories, never use folder membership as permission boundary unless explicitly designed as such.

---

## Favorite/pinned Report

If present in frozen design:

this belongs to user preference metadata.

It does not change Report lifecycle or importance for other users.

---

# 4. Permissions

Design 131 should conceptually distinguish:

```text
reportLibrary.read

report.read
reportVersion.read
reportDraft.read

report.create
report.editDraft
report.finalize

reportApproval.read
reportRelease.read
reportArtifact.download

reportSchedule.read

report.export
report.deleteDraft / archive
```

Exact permission identifiers belong to Phase 3D.

---

## Library access ≠ every Report access

Critical.

A user who can open the Report Center must only see Reports they are individually authorized to discover.

---

## Permission filtering must happen before counts

Absolute.

If the Report Center says:

> 124 Reports

that count must represent Reports this user can know exist.

Do not calculate organization-wide counts and hide rows afterward.

---

## Permission filtering before facets

Filter counts such as:

> Distribution (24)
> Finance (9)

must be permission-safe.

---

## Report summary read ≠ Report detail read universally

If sensitive report types exist, even list-level metadata may need restrictions.

---

## Report read ≠ source evidence access

Critical.

A user may be authorized to read a released performance Report but not inspect:

* raw provider observations;
* detailed Contract data;
* internal source documents.

---

## Source deep links reauthorize

Permanent.

---

## Report read ≠ Draft read

Released reports may be broader than internal Draft versions.

---

## Report read ≠ artifact download

Permanent.

Bulk/file access can have separate permission.

---

## Report download ≠ source-data export

Absolute.

Downloading the generated PDF does not authorize exporting underlying metric/raw data.

---

## Report create ≠ ReportType administration

Permanent.

---

## Report edit ≠ Approval

Permanent.

---

## Report approve ≠ release

Permanent.

---

## Report Library actions must reauthorize server-side

No action can rely on buttons hidden/shown by the frontend.

---

## Client membership ≠ Team Report Center access

Design 131 remains internal Team Workspace.

Clients use Design 056.

---

## Cross-tenant list isolation

Absolute.

Pagination, totals, sorting, search, and facets all require tenant isolation before result computation.

---

# 5. States

Design 131 must keep **Report lifecycle, Version lifecycle, Approval state, Release state, Artifact state, scheduled-report state, and access state** separate.

### Report summary lifecycle

Conceptually:

```text
Active
Historical
Archived
```

### Version lifecycle

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

### Artifact

```text
Not Generated
Generating
Generated
Failed
Unavailable
```

### Release

```text
Not Released
Released
Superseded
Withdrawn
```

### Schedule

Owned by Design 134.

These must never collapse into one generic library status.

---

## Latest Version Draft ≠ Report Draft universally

Critical.

A Report can have:

```text
v3 Released
v4 Draft
```

The Report Center needs both facts.

---

## Report Released ≠ latest Version Released

Same distinction.

---

## Approved ≠ Released

Absolute.

---

## Artifact Generated ≠ Approved

Permanent.

---

## Artifact Generated ≠ Released

Permanent.

---

## Released ≠ Client downloaded

Absolute.

---

## Scheduled ≠ generated

Permanent.

A scheduled ReportDefinition may not yet have produced a ReportVersion.

---

## Scheduled run failed ≠ existing released Report failed

Critical.

Historical reports remain valid.

---

## Report type unavailable ≠ Report deleted

Permanent.

---

## Artifact service unavailable ≠ Report unavailable

A Report may still be discoverable even if download artifact metadata is temporarily unavailable.

---

## Approval service unavailable ≠ Report rejected

Absolute.

---

## Client release service unavailable ≠ Not Released

Could be unknown.

---

## State Coverage

Design 131 inherits Design 150 plus:

```text
Report Library Loading
Report Library Available
Report Library Empty
Report Library Restricted
Report Library Partial
Report Library Unavailable

Report Available
Report Restricted
Report Historical
Report Archived

Latest Draft Available
No Draft Version
Latest Finalized Available
Latest Approved Available
Latest Released Available

Version Draft
Version Finalized
Version Approval Pending
Version Approved
Version Rejected
Version Released
Version Superseded
Version Withdrawn

Artifact Not Generated
Artifact Generating
Artifact Generated
Artifact Failed
Artifact Unavailable

Approval Not Required
Approval Pending
Approval Approved
Approval Rejected
Approval State Unknown

Report Not Released
Report Released
Report Superseded
Report Withdrawn
Release State Unknown

Client Not Downloaded
Client Downloaded
Download State Unknown

Scheduled Report Active
Scheduled Report Paused
Scheduled Report Failed
Scheduled Report State Unknown

Report Updated Elsewhere
New Report Version Available
Approval Updated Elsewhere
Artifact Updated Elsewhere
Release Updated Elsewhere
Scheduled Definition Updated Elsewhere
Library Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **finding the right canonical Report and understanding its current version/release context without opening it**.

Conceptually:

```text
Report Center
↓
Search / filters / report type
↓
Report list

Client Performance Report
Client: Acme
Period: Aug 1–31

Released v3
Draft v4 exists
Artifact: PDF available
Approval: v3 approved
```

Only frozen Design 131 controls/columns should render.

---

## Version summary must not collapse

Avoid one:

> Status: Draft

when a previous Version is already released.

Prefer an equivalent of:

> Released v3 · Draft v4.

---

## Reporting period and created date should be distinguishable

Correct:

> Period: Aug 1–31
> Created: Sep 1

not one vague date.

---

## Report type should be visible

Especially because the Center aggregates reports across domains.

---

## Client/source context should remain concise

Example:

> Client: Acme
> Campaign: Executive Leadership Distribution

without duplicating entire source details.

---

## Artifact state should not imply report lifecycle

Correct:

> v4 Draft · PDF preview generated

not:

> v4 released.

---

## Approval and release should remain separate

Correct:

> Approved · Not yet released.

---

## Search/filter state

If Design 131 has:

* Report type;
* Client;
* owner;
* period;
* approval;
* release state;

filters should map to canonical query dimensions.

Do not filter a partially loaded page entirely client-side.

---

## Sorting

If present, sort using unambiguous dimensions such as:

* createdAt;
* reportingPeriodEnd;
* releasedAt;
* title.

Avoid generic "date" with unclear semantics.

---

## Pagination

Use cursor/server pagination for scale.

Filters/sort must remain stable across pages.

---

## Tablet

Following Design 152:

* report identity/type remains primary;
* metadata becomes two-line/stacked;
* Version/release state remains visible;
* less-important columns collapse into row detail;
* filter controls can become a drawer/sheet if already compatible with frozen design.

---

## Mobile

Priority:

```text
Report title
↓
Report type
↓
Client/source
↓
Reporting period
↓
Released Version
↓
Draft/newer Version
↓
Artifact / release state
↓
Primary allowed action
```

Do not shrink a wide report table horizontally.

---

## Mobile state example

> Client Performance Report
> Aug 1–31
> Released v3
> Draft v4 exists
> PDF available

This is significantly safer than:

> Draft.

---

## Accessibility

A Report Library entry could communicate:

> Client Performance Report R-20 covers August 1 through August 31. Report version 3 is approved and released to the Client. Report version 4 exists as an internal draft and has not been approved or released. The released PDF artifact for version 3 is available.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Report Center architecture

```text
Design 131
    ↓
Authenticated Workspace Context
    ↓
ReportLibraryQueryService
    │
    ├── ReportAdapter
    ├── ReportTypeRegistry
    ├── ReportVersionSummaryResolver
    ├── ApprovalSummaryAdapter
    ├── ArtifactSummaryAdapter
    ├── ReleaseSummaryAdapter
    ├── ScheduledReportSummaryAdapter
    ├── Client/Project/Source adapters
    └── Permission/Scope Resolver
    ↓
ReportLibraryEntry[]
```

The Report Center should be query-heavy and mutation-light.

---

## Report Library query

Conceptually:

```text
listReports(
    filters,
    sort,
    cursor,
    pageSize,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. resolve Report access scope;
4. apply permissions before search/count/facets;
5. query canonical Reports;
6. resolve version summaries;
7. resolve approval/release/artifact summaries;
8. resolve typed context labels;
9. return stable cursor and freshness/revision information.

---

## Permission before query aggregation

Critical.

Do not:

```text
SELECT all reports
COUNT / GROUP
then filter unauthorized rows
```

Correct:

> authorization constraints participate in the query before totals/facets.

---

## ReportType Registry

One central registry should provide:

```text
report type
owning source domain
display metadata
detail capabilities
builder capabilities
schedule capabilities
client visibility rules
```

where needed.

---

## Registry ≠ report content

Permanent.

---

## Version Summary Resolver

Central:

```text
ReportVersionSummaryResolver.resolve(reportId)
```

should return independently:

```text
latestDraft
latestFinalized
latestApproved
latestReleased
```

where they exist.

Never derive all from one "latest" pointer.

---

## Version-summary query efficiency

Avoid N+1:

```text
for report in reports:
    query versions
    query approval
    query artifact
    query release
```

Use batched joins/read models/window functions/materialized summaries as appropriate.

---

## Current pointers

For performance, canonical Report may maintain validated pointers such as:

```text
latestDraftVersionId
latestReleasedVersionId
```

but transitions must update them transactionally.

---

## Pointer corruption safeguard

The system should be able to rebuild/reconcile pointers from canonical ReportVersions.

Pointers are optimization—not sole historical truth.

---

## Reporting period filter

Filtering:

> reports for August

should use ReportVersion/report's canonical reporting period semantics.

Do not use file-created date.

---

## Which Version supplies list period?

Phase 3D should define deterministic rule, likely:

* report's canonical period if report is one-period identity;
* released/current selected Version period otherwise.

Do not infer inconsistently per row.

---

## Search

Report Center search may cover:

* title;
* Client;
* Project;
* Campaign;
* Report ID;
* report type.

It should not blindly index restricted Report content.

---

## Universal Search integration

Design 079 indexes canonical Report identity.

Report Center may use its own specialized DB/search query.

Both must point to the same Report IDs.

---

## Client/source labels

Resolve canonical source records permission-safely.

If source is restricted/unavailable:

return:

> Restricted / Unavailable context

rather than leaking metadata.

---

## List caching

Cache by:

```text
organizationMembershipId
authorizationRevision
filters
sort
cursor
reportRevision
versionSummaryRevision
approvalRevision
releaseRevision
artifactRevision
scheduledReportRevision
```

---

## Query projection

A materialized:

```text
ReportLibraryProjection
```

may be useful for scale.

It must be fully rebuildable from canonical sources.

---

## Projection lag

If report v3 is released but projection still says Approved:

source truth remains released.

UI can revalidate on detail/action.

Never repeat a release because list projection is stale.

---

## Mutations from library

If frozen Design 131 includes quick actions such as:

* open;
* duplicate Draft;
* archive;
* download;
* release;

each must call canonical source service.

Do not create generic:

```text
PATCH /report-library/:id
```

---

## Download action

Must resolve:

```text
Report
→ exact allowed ReportVersion
→ exact Artifact FileVersion
→ user permission
```

Never download "latest file" blindly.

---

## Library "Download latest"

If such UI exists, its semantic resolver must be explicit.

Likely:

> latest released Version artifact

rather than latest generated Draft artifact.

Exact UX must match frozen design.

---

## Create Report

If Design 131 contains a "New Report" action:

it should route/hand off to Design 133 or canonical creation service.

Do not create a report with an untyped empty JSON blob.

---

## Duplicate Report

If present:

duplicate as a **new Report/Draft Version configuration** with lineage where appropriate.

Never clone:

* Approval;
* Release;
* ClientDownload;
* finalized dataset snapshot;

as if already valid.

---

## Archive Report

If frozen UI includes archival:

archive the Report/library discoverability state.

Do not delete:

* released Versions;
* Client access;
* Audit;
* generated artifacts required for retention.

Exact archive semantics belong to Reporting domain.

---

## Delete Draft

If permitted:

only unreferenced/unreleased Draft data under policy.

Never delete released/report-history evidence casually.

---

## Scheduled Reports summary

Design 131 should query Design 134.

Example:

```text
Monthly Executive Report
Scheduled monthly
Next run Sep 30
```

But the schedule remains owned by `ScheduledReportDefinition`.

---

## Scheduled run failure

Report Center may display an attention state.

It must not mark prior generated/released reports as failed.

---

## Approval summary

Canonical Approval query should be exact-version aware.

Example:

```text
latestReleased = v3
v3 Approved
v4 Approval Pending
```

Report Center should not collapse to:

> Approval Pending

without context.

---

## Artifact summary

Same exact-version requirement.

Example:

```text
v3 PDF Generated
v4 Artifact Not Generated
```

---

## Release summary

Same exact-version requirement.

---

## Client release lookup

Never infer release because a generated file exists in Client-facing storage.

Use explicit `ReportRelease`/ClientAccess evidence.

---

## Count/facet semantics

Potential library summaries:

```text
Draft
Awaiting Approval
Released
Scheduled
```

should be based on deterministic canonical queries.

Because one Report can simultaneously have:

* released v3;
* draft v4;

categories may overlap.

Do not force all Report entities into mutually exclusive buckets unless the UX explicitly defines a selected-version state.

---

## This overlap is important

Example:

```text
R-20:
Released v3
Draft v4
```

It can legitimately appear under:

* Released;
* Has Draft;

depending on filter semantics.

---

## Filter semantics must be documented in Phase 3D

Avoid surprising "status" logic.

---

## Export list

If frozen Report Center includes export:

export only authorized rows and clearly distinguish list metadata from report-source data.

---

## Bulk actions

If frozen UI supports them:

every Report must be individually authorized and eligible.

Partial outcomes must be supported.

Example:

```text
10 selected
7 archived
2 restricted
1 already archived
```

Never all-or-nothing silently unless business operation requires transactionality.

---

## Audit

Material library-originating actions still produce canonical source Audit events:

* Report archive;
* Draft deletion;
* duplicate/create;
* release;
* sensitive export.

Merely browsing/filtering usually does not require business Audit unless governance policy says so.

---

## Activity

Report creation/finalization/release can be projected into Activity where relevant.

Library browsing is not Activity.

---

## Notifications

Notification Center may deep-link into Report Center/Detail.

Deep links must reauthorize Report ID.

---

## Client Portal integration

Design 056 gets released Reports through explicit client-safe projection.

Report Center does not drive Client visibility by simply toggling a library badge.

---

## Design 132 integration

Opening a Report should carry stable:

```text
reportId
```

and, when user selected a historical Version:

```text
reportVersionId
```

Do not rely on array index/latest implicit version.

---

## Design 133 integration

Builder uses same Report/ReportVersion identity.

---

## Design 134 integration

Scheduled report definitions create new reports/versions through canonical generation workflow and appear back in Design 131.

---

## Index strategy

Useful indexes likely include:

```text
organizationId
reportType
clientRelationshipId
sourceContext
createdAt
reportingPeriodStart/end
owner
latestReleasedVersionId
lifecycle
```

Exact DB design Phase 3D.

---

## Pagination

Cursor pagination should use stable sort keys:

```text
releasedAt + reportId
createdAt + reportId
periodEnd + reportId
```

to avoid duplicates/skips.

---

## Filter/search concurrency

A report changing Version/release state during pagination may move between result positions.

Stable cursors and projection freshness metadata should prevent broken navigation as much as practical.

---

## Partial failure contract

Example:

```text
Report core          ✓
Versions             ✓
Approvals            ✕
Artifacts            ✓
Releases             ✓
```

Correct:

> Reports are available; current Approval summaries are unavailable.

Incorrect:

> Not approved.

Another:

```text
Report R-20          ✓
Released v3          ✓
Artifact service     ✕
```

Correct:

> v3 is released; current artifact/download availability cannot be verified.

Not:

> Report not released.

Another:

```text
Scheduled report service ✕
Existing Reports          ✓
```

Correct:

> Existing report library is available; scheduled-report status is temporarily unavailable.

Not:

> Scheduled reports disabled.

---

## Backend Requirement Matrix

| Requirement                                                            | Status                              |
| ---------------------------------------------------------------------- | ----------------------------------- |
| Design 033 canonical Report reuse                                      | **Critical**                        |
| No second Reporting domain                                             | **Critical**                        |
| ReportLibraryEntry/Report separation                                   | **Critical**                        |
| Report/ReportVersion separation                                        | **Critical**                        |
| Latest-created/latest-draft/latest-approved/latest-released separation | **Critical**                        |
| Exact Version summaries                                                | **Critical**                        |
| ReportType/Report separation                                           | **Critical**                        |
| ReportType/Template separation                                         | **Critical**                        |
| Reporting-period/created-date separation                               | **Critical**                        |
| ReportVersion/Artifact separation                                      | **Critical**                        |
| Artifact/Release separation                                            | **Critical**                        |
| Finalize/Approval/Release separation                                   | **Critical**                        |
| Release/Download separation                                            | **Critical**                        |
| Design 030 Asset/FileVersion reuse                                     | **Critical**                        |
| Designs 029/115 Approval reuse                                         | **Critical**                        |
| Design 056 Client Reports reuse                                        | **Critical**                        |
| Design 130 Distribution Report reuse                                   | **Critical**                        |
| Design 132 same Report backend                                         | **Critical architecture**           |
| Design 133 same Draft/Version backend                                  | **Critical architecture**           |
| Design 134 Scheduled Report separation/reuse                           | **Critical architecture**           |
| Design 038 Metric Registry reuse                                       | **Critical architecture**           |
| Design 079 canonical Search identity reuse                             | **Critical architecture**           |
| SavedView/Report separation                                            | **Critical if saved filters exist** |
| Permission before list/count/facets                                    | **Critical**                        |
| Permission-safe source labels                                          | **Critical**                        |
| Draft read/released read separation                                    | **Critical**                        |
| Report read/artifact download separation                               | **Critical**                        |
| Client/Team surfaces separated                                         | **Critical**                        |
| Cross-tenant pagination/count isolation                                | **Critical**                        |
| Server-side filter/search                                              | **Critical**                        |
| Stable pagination/cursors                                              | **Critical**                        |
| Projection rebuildability                                              | **Critical**                        |
| Projection lag cannot authorize actions                                | **Critical**                        |
| Batched Version/Approval/Artifact/Release summaries                    | **Critical performance**            |
| Bulk partial outcome support                                           | **Critical if bulk actions exist**  |
| Audit/outbox integration                                               | **Required for material actions**   |
| Partial dependency failure handling                                    | **Critical**                        |

---

# 8. Consolidation

Design 131 creates a high overlap risk because a Report Center can easily turn into a second report-management database.

**Design 033 / Design 131 Report duplication**
Library creates another Report identity.

**ReportLibraryEntry / Report conflation**
Read projection becomes source truth.

**Report / ReportVersion conflation**
Version history disappears.

**Latest created / current Draft conflation**
Rejected/superseded versions appear current.

**Latest created / latest released conflation**
Client-facing state becomes wrong.

**Latest Draft / latest Released conflation**
A new Draft makes released report look unreleased.

**Report status / Version status conflation**
One field cannot represent v3 Released + v4 Draft.

**ReportType / Report conflation**
Category becomes entity.

**ReportType / ReportTemplate conflation**
Semantic type and reusable layout/config merge.

**Reporting period / created date conflation**
August report appears as September report.

**Reporting period / released date conflation**
Period filtering becomes inaccurate.

**Client context / Client snapshot conflation**
Current Client metadata rewrites historical report context.

**Source context / copied source data conflation**
Library duplicates Project/Campaign information.

**ReportVersion / DatasetSnapshot conflation**
Report content and frozen evidence merge.

**ReportVersion / Generated artifact conflation**
PDF becomes business identity.

**Generated artifact / Released report conflation**
Internal preview appears client-visible.

**Approval / Finalization conflation**
Report author bypasses approval governance.

**Approval / Release conflation**
Approved report appears delivered.

**Release / Download conflation**
Availability appears as Client receipt.

**Client download / acknowledgement conflation**
Transport becomes acceptance.

**Latest artifact / released artifact conflation**
Draft PDF replaces released PDF.

**Report list / file library conflation**
Generated files become the report database.

**Report Center folder / security scope conflation**
Moving report changes permissions.

**Folder / report type conflation**
Visual organization changes semantics.

**Saved View / Report list conflation**
Filtered membership becomes persisted Report ownership.

**Favorite / report priority conflation**
Personal pinning changes organizational importance.

**Search result / Report authority conflation**
Index metadata controls lifecycle.

**Search index / current Version conflation**
Stale index reports wrong release state.

**Count before permission / count after permission conflation**
Users learn restricted Report quantities.

**Facet counts / authorization conflation**
Restricted Client/report-type information leaks.

**Library access / Report access conflation**
Opening Report Center exposes all Reports.

**Report read / Draft read conflation**
Internal unreleased content leaks.

**Report read / source evidence access conflation**
Raw metric/legal/client data leaks.

**Report download / source export conflation**
PDF access grants underlying raw data.

**Team Report Center / Client Reports conflation**
Internal Drafts appear in Client Portal.

**Design 056 / Design 131 duplicate Client report truth**
Released Versions differ across surfaces.

**Design 130 / Design 131 duplicate Distribution Report identity**
Same report appears twice.

**ScheduledReportDefinition / Report conflation**
Recurring rule becomes generated report.

**Scheduled run failure / existing Report failure conflation**
Historical released report appears broken.

**Scheduled Report / ReportVersion conflation**
Each recurrence overwrites prior report.

**Builder configuration / ReportVersion conflation**
Template edits change finalized reports.

**Library create / untyped generic Report conflation**
Reports lose domain semantics.

**Duplicate Report / clone Approval conflation**
Copied report inherits invalid Approval.

**Duplicate Report / clone Release conflation**
New report appears client-delivered.

**Duplicate Report / clone DatasetSnapshot conflation**
Copied report uses stale evidence.

**Archive / Delete conflation**
Historical Reports disappear.

**Delete Draft / Delete Report history conflation**
Released evidence is removed.

**Artifact service unavailable / Report unavailable conflation**
Report identity disappears because file storage is down.

**Approval service unavailable / Rejected conflation**
Infrastructure outage becomes business decision.

**Release service unavailable / Not Released conflation**
Unknown state becomes false negative.

**Projection stale / source stale conflation**
User repeats actions because list row is behind.

**Generic `report_status`**
Cannot represent multiple concurrent Version states.

**Generic `latest_report_file`**
Cannot distinguish Draft/final/released artifact.

**Generic `client_visible=true`**
No exact ReportVersion/Release/access evidence.

**Generic Report Center mega-PATCH**
Library edits Version, Approval, Release, Artifact and scheduling together.

**131/030 duplicate artifact metadata**
Report Center becomes file storage truth.

**131/033 duplicate Reporting backend**
Foundation forks.

**131/038 duplicate Metric semantics**
Report summaries invent metric definitions.

**131/056 duplicate Client report library**
Portal and Team Workspace disagree.

**131/079 duplicate report search identity**
Search and Report Center use separate IDs.

**131/130 duplicate report-version state**
Distribution Report status differs.

**131/132 duplicate Report detail data**
List and Detail disagree.

**131/133 duplicate report configuration**
Library becomes Builder.

**131/134 duplicate report scheduling**
Library stores recurrence itself.

No additional screen is required.

These are **canonical Report collection, cross-domain report typing, exact Version summaries, approval/release/artifact separation, permission-safe listing/counts/facets, scheduled-report separation, client/internal boundaries, search reuse, and scalable read-projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL CROSS-DOMAIN REPORT DISCOVERY, VERSION-SUMMARY & RELEASE-VISIBILITY ANCHOR**

**Domain directive:**
**Report ≠ ReportVersion ≠ ReportType ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ GeneratedReportArtifact ≠ ReportRelease ≠ ScheduledReportDefinition ≠ ReportLibraryEntry ≠ SavedView/Filter ≠ LiveAnalytics ≠ ClientDownload.**

**Foundation directive:**
Design 033 remains the single canonical Reporting domain. Design 131 is its cross-domain collection/discovery surface and cannot introduce a parallel report lifecycle, version model, artifact model, Approval model, or Client-release model.

**Library directive:**
`ReportLibraryEntry` is a permission-safe rebuildable read projection only. It never becomes a writable Report entity.

**Report directive:**
`Report` remains stable logical reporting identity while `ReportVersion` represents exact Draft/finalized/approved/released revisions.

**Version-summary directive:**
the library must independently resolve latest Draft, latest Finalized, latest Approved, and latest Released ReportVersions rather than using one ambiguous `latestVersion`.

**Concurrent-version directive:**
states such as **Released v3 + Draft v4** are first-class and must remain representable in one Report Center entry.

**No-max-version directive:**
`MAX(versionNumber)` is never sufficient to determine the Client's current released report.

**Report-type directive:**
one `ReportTypeRegistry` provides typed report classification/capabilities across domains while ReportType remains separate from Report, source domain and reusable report template.

**Context directive:**
Project, Client, Campaign and other source contexts remain canonical in their own domains and are referenced through typed report context relations rather than copied into Library truth.

**Period directive:**
reporting period, Report created date, finalized date and released date remain distinct and separately filterable where frozen UI exposes them.

**Distribution-report directive:**
Design 130's DistributionReport and ReportVersions appear in Design 131 through the same canonical Reporting identities with no specialized copy.

**Client-report directive:**
Design 056 consumes only explicitly released, client-authorized ReportVersions/artifacts from this same Reporting domain. Design 131 remains internal and may show Draft/internal Versions unavailable to Clients.

**Detail directive:**
Design 132 must open the exact same Report and selected ReportVersion IDs surfaced by Design 131 and cannot recompute or clone report data independently.

**Builder directive:**
Design 133 owns Draft report configuration/building; Report Center creation/edit actions, if present, delegate to canonical Report/Builder services.

**Scheduled-report directive:**
Design 134 owns `ScheduledReportDefinition`, recurrence, next-run and delivery scheduling. Report Center consumes summaries only.

**Scheduled-generation directive:**
a recurring ScheduledReportDefinition may produce multiple Report/ReportVersions over time; the definition is never itself a released report.

**Metric directive:**
Design 038 remains canonical Metric Registry. Report Center may summarize report metadata but cannot invent alternate metric definitions/formulas.

**Artifact directive:**
generated PDFs/documents remain Design-030 Asset/FileVersions tied to exact ReportVersions; generated-file existence never means Approved or Released.

**Approval directive:**
Designs 029/115 remain formal Approval authority. Report Center displays exact-version Approval summaries and never persists duplicate approval flags.

**Release directive:**
`ReportRelease` remains explicit exact ReportVersion/FileVersion/Client release evidence. It is not inferred from artifact existence, folder location or Client visibility flags.

**Download directive:**
Client download remains separate transport evidence and cannot be used as Report approval/release lifecycle.

**Search directive:**
Design 079 Universal Search and Design 131 must share canonical Report IDs. Search indexing can aid discovery but cannot become Report state authority.

**Saved-view directive:**
saved filters/views, if supported, store query preferences only and never copy or own Report membership.

**Permission-before-query directive:**
tenant/resource authorization is applied before Report retrieval, totals, facet counts, filters and aggregation so users cannot infer restricted Reports through metadata.

**List/detail permission directive:**
ability to access Report Center does not grant every Report; each Report and direct ReportVersion/artifact reference is reauthorized independently.

**Draft-visibility directive:**
permission to read a released Report does not automatically grant access to internal Draft Versions.

**Source-evidence directive:**
Report read access does not automatically grant raw source-evidence access. All deep links back to Placement, metrics, Contracts, Projects or other source domains reauthorize separately.

**Artifact-download directive:**
report read and exact artifact download remain separately enforceable where policy requires.

**Query directive:**
search, filtering, sorting and pagination are primarily server-side and operate against canonical permission-safe Report projections rather than partially loaded frontend arrays.

**Pagination directive:**
Report Center uses stable cursor/sort semantics so large libraries do not duplicate/skip Reports unpredictably.

**Projection directive:**
a materialized ReportLibraryProjection is acceptable for performance only if it is completely rebuildable from canonical Report/Version/Approval/Artifact/Release/Schedule sources.

**Projection-lag directive:**
stale list projections can never authorize finalization, Approval, release, download or destructive action; canonical source state is revalidated for every mutation.

**Summary-performance directive:**
Version, Approval, Artifact, Release and Scheduled Report summaries should be batched/materialized to avoid per-row N+1 reads.

**Action directive:**
quick actions from Design 131—if present in the frozen design—invoke source-specific commands rather than a generic `PATCH ReportLibraryEntry`.

**Download-resolution directive:**
any "download" action must identify the exact allowed ReportVersion/FileVersion. A generic "latest file" resolver is prohibited unless semantics explicitly resolve to a safe version such as latest released.

**Duplicate-report directive:**
if duplication is supported, only reusable Draft/configuration data is copied deliberately; Approval, Release, ClientDownload and finalized snapshot evidence never transfer automatically.

**Archive directive:**
if report archival exists, archive affects Report discoverability/lifecycle while preserving released Versions, snapshots, Client-release history and required artifacts. Archive never means destructive delete.

**Bulk directive:**
if frozen Design 131 supports bulk actions, each Report is individually authorized and eligibility-checked with partial outcomes preserved.

**Client-isolation directive:**
internal report metadata, Draft Versions, source evidence, raw metrics and unreleased artifacts must never leak to Design 056 simply because they exist in the Report Center.

**Authorization directive:**
Report Center read, Report read, Draft read/edit, finalization, Approval, release, artifact download, scheduling, export and archive/delete permissions remain independently server-authorized.

**Tenant directive:**
Reports, Versions, Clients, source contexts, artifacts, releases, schedules and list/facet counts remain strictly tenant-scoped.

**Caching directive:**
library cache keys vary by membership/authorization revision, filters, sort, cursor and relevant Report/Version/Approval/Artifact/Release/Schedule revisions.

**Partial-failure directive:**
Report core, Approval, artifact, release and scheduled-report services may fail independently. `Unavailable` can never become `Rejected`, `Not Released`, `No Artifact`, or `No Schedule` without evidence.

**Performance directive:**
Design 131 should rely on indexed Report metadata and batched summary projections rather than loading full DatasetSnapshots, report bodies or metric observations for list rendering.

**Future-reuse directive:**
Design **132 — Report Detail / Interactive Report Workspace** must use the exact same canonical `Report`, `ReportVersion`, `ReportDatasetSnapshot`, `ReportMetric`, Approval, artifact, and release identities surfaced by Design 131. It may provide interactive exploration of a selected ReportVersion where allowed, but must never create a separate `InteractiveReport` business entity or recalculate a finalized Version from current live source data.

**Overlap directive:**
Designs **030, 033, 038, 056, 079, 130–134** must preserve one continuous **canonical Report → exact ReportVersions → frozen DatasetSnapshots/Metric semantics → Approval → generated Asset/FileVersion → ReportRelease → Client access/download + ScheduledReportDefinition generation lineage** while keeping the Library itself a read-only discovery projection.

**Consolidation directive:**
**STANDARDIZE ONE REPORTING LIBRARY FOUNDATION — DESIGN-033 CANONICAL REPORT/REPORTVERSION IDENTITIES + ONE TYPED REPORT REGISTRY + INDEPENDENT LATEST-DRAFT/FINALIZED/APPROVED/RELEASED VERSION SUMMARIES + EXACT REPORTING-PERIOD/CLIENT/SOURCE CONTEXT + DESIGN-030 ARTIFACT SUMMARIES + CANONICAL APPROVAL/REPORTRELEASE STATE + DESIGN-134 SCHEDULED-REPORT SUMMARY + PERMISSION-BEFORE-SEARCH/COUNT/FACETS + STABLE SERVER-SIDE FILTER/PAGINATION + REBUILDABLE LIBRARY PROJECTIONS + DESIGN-056/130–134 SHARED REPORT IDENTITIES — AND NEVER ALLOW LIBRARY ROWS, `LATEST` VERSION ASSUMPTIONS, GENERIC STATUS BADGES, GENERATED FILES, FOLDER MEMBERSHIP, CLIENT-VISIBLE FLAGS, SEARCH INDEXES OR SCHEDULE LABELS TO SUBSTITUTE FOR OR REWRITE CANONICAL REPORT, REPORTVERSION, SNAPSHOT, APPROVAL, ARTIFACT, RELEASE OR SCHEDULING TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **131 / 153** |
| **PASS**                                   |                        **131** |
| **STANDARDIZE decisions**                  |                        **129** |
| **Potential implementation-overlap flags** |                        **122** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**131 / 153 = 85.6% audited.**

### Canonical Reporting Library architecture after Design 131

```text
REPORT R-20
    │
    ├── v1 Historical
    ├── v2 Historical
    ├── v3 Released
    └── v4 Draft
           │
           │
    ┌──────┼─────────────┐
    ↓      ↓             ↓
Report   Report        Report
Center   Detail        Builder
 131      132            133
    │
    └────────────┬────────────
                 ↓
        same canonical Report
```

The strongest Version-summary rule is now explicit:

```text
Report R-20

v3 = Approved + Released
v4 = Draft

Correct Report Center:

Released v3
Draft v4 available

Incorrect:

Status = Draft

and also incorrect:

Latest v4 = Released
```

Reporting dates remain semantically separated:

```text
Report covers:
August 1–31

Report created:
September 1

Approved:
September 2

Released:
September 3

These are four
different date semantics.
```

Client and internal surfaces also remain cleanly separated:

```text
TEAM REPORT CENTER

v3 Released
v4 Draft

        ↓

CLIENT REPORTS

v3 only

The Client never sees v4
until an explicit authorized
ReportRelease exists.
```

And Design 131 remains a true library projection:

```text
Report Center row
      ≠
Report

Status badge
      ≠
ReportVersion lifecycle

PDF available
      ≠
Released

Approved
      ≠
Released

Scheduled monthly
      ≠
Report generated
```

Each source domain remains independently canonical.

## Next Sequential Audit Target

### **Design 132 — Report Detail / Interactive Report Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
