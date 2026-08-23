Verified against the frozen project record. The exact approved identity is:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 033 — Reporting / Client Reporting Workspace

This is the first major **cross-domain reporting and client-delivery reporting workspace** after Publishing and Distribution.

Its job is to turn canonical business, production, publishing and distribution data into **traceable, permission-safe, reproducible reports** without creating a second database of invented KPI values.

| Audit field                 | Classification                                                                                                                                           |
| --------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **033**                                                                                                                                                  |
| **Canonical name**          | **Reporting / Client Reporting Workspace**                                                                                                               |
| **Product area**            | Reporting / Analytics Delivery / Client Reporting                                                                                                        |
| **User surface**            | Team Workspace                                                                                                                                           |
| **Screen class**            | Cross-Domain Report Operations + Client Reporting Workspace                                                                                              |
| **Classification**          | **Unique Anchor — Reporting Operations Family**                                                                                                          |
| **Primary purpose**         | Build, review, generate, verify and deliver internal/client-facing reports from canonical Project, Publishing, Distribution, Finance and production data |
| **Primary entity**          | **Report**                                                                                                                                               |
| **Core related entities**   | ReportVersion/Snapshot, ReportSection, ReportMetric, ReportDatasetSnapshot, ReportRecipient/Delivery                                                     |
| **Supporting entities**     | ReportTemplate, Project, Client, Publication, DistributionCampaign, Placement, Metric, AnalyticsSnapshot, File/Asset, User, ScheduledReport, Activity    |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                          |
| **Upstream domains**        | Project, Finance, Publishing, Distribution, Analytics                                                                                                    |
| **Downstream consumer**     | Client Portal / Client deliverables                                                                                                                      |
| **Template family**         | `ReportingWorkspaceTemplate`                                                                                                                             |
| **Composition**             | `ClientReportingComposition`                                                                                                                             |
| **Auth**                    | Required                                                                                                                                                 |
| **Permissions**             | Report read/create/edit/generate/approve/share/export + underlying data scope                                                                            |
| **Implementation priority** | **Core / Critical**                                                                                                                                      |
| **Reuse level**             | **Platform-wide / Extremely High**                                                                                                                       |

---

# 1. Functional responsibility

Design 033 answers:

> **“What happened for this Client/Project, which results can we actually prove, what period does this report cover, where did every KPI come from, which report version was approved/shared, and what exactly did the Client receive?”**

The canonical chain is now:

```text
PROJECT / PRODUCTION
        ↓
PUBLISHING
Design 031
        ↓
DISTRIBUTION
Design 032
        ↓
VERIFIED PLACEMENTS + METRICS
        ↓
REPORTING
Design 033
        │
        ├── Data scope
        ├── Metrics
        ├── Sections
        ├── Evidence
        ├── Snapshot
        ├── Review
        └── Client delivery
        ↓
CLIENT-SAFE REPORT
```

The central invariant is:

> **Operational data ≠ Report ≠ ReportVersion ≠ ReportMetric snapshot.**

---

# 2. Report must be a canonical record

Reporting cannot be implemented only as:

```text
generatePDF(currentDashboard)
```

A canonical `Report` entity should represent the logical report.

Conceptually:

```text
Report
├── report type
├── Client
├── Project
├── reporting period
├── owner
├── template/reference
├── lifecycle
└── Versions / Snapshots
```

Exact schema belongs to Phase 3D.

---

# 3. Report ≠ Report Version

This distinction is critical.

### Report

Logical ongoing report record.

### ReportVersion / ReportSnapshot

One exact frozen output.

```text
Report
│
├── Version 1
├── Version 2
└── Version 3
```

A Client receiving v2 must not later see its numbers silently turn into v3.

---

# 4. Live analytics ≠ historical report

Suppose:

```text
Campaign clicks today:
48,756
```

and next week:

```text
Campaign clicks:
56,340
```

A report generated today should preserve:

```text
48,756
```

if that is the value at its defined snapshot time.

Therefore:

> **Reports need immutable/reconstructable data snapshots.**

---

# 5. Report version must preserve reporting period

Every generated report should know:

```text
periodStart
periodEnd
snapshotAt
```

where applicable.

Without these, metrics become impossible to interpret.

---

# 6. Metric ≠ ReportMetric

### Metric

Canonical metric definition/value source.

### ReportMetric

The metric value captured for a particular report/version.

Conceptually:

```text
Canonical Metric
      ↓
Snapshot
      ↓
ReportMetric
```

This ensures historical reports remain stable.

---

# 7. Metric definition must be centralized

For example:

```text
Engagement Rate
```

must not have different formulas in:

* Distribution Workspace,
* Analytics Dashboard,
* Client Report.

Design 033 should consume the canonical metric catalog/definitions.

---

# 8. Metric value must preserve provenance

A strong report metric record should conceptually know:

```text
metric definition
value
unit
source
source record
period
collectedAt
verification/provenance
```

This becomes one of the most important trust requirements in the platform.

---

# 9. Verified ≠ estimated

Design 032 established this distinction.

Reporting must preserve it.

Example:

```text
Reach:
1.24M
Provenance:
ESTIMATED
```

must never be rendered to the Client as:

> **Verified Reach: 1.24M**

unless it actually is verified.

---

# 10. Zero ≠ unavailable

Another global reporting rule:

```text
Clicks = 0
```

means verified zero.

```text
Clicks = unavailable
```

means no reliable data.

These cannot both render as `0`.

---

# 11. Report should never fabricate missing metrics

If Instagram analytics are unavailable:

correct:

> Data unavailable for this period.

Incorrect:

> 0 impressions.

This is especially important because reports can become contractual/client-delivery artifacts.

---

# 12. Report ≠ Analytics Dashboard

### Analytics Dashboard

Live/exploratory operational analysis.

### Report

Frozen, structured communication artifact.

```text
Analytics
→ changing/live

Report
→ versioned/snapshot
```

They can use the same underlying metric infrastructure.

They should not be the same entity.

---

# 13. Report ≠ Distribution Campaign

Design 032 owns campaign execution.

Design 033 consumes:

```text
DistributionCampaign
├── Placements
├── Verification
└── Metrics
```

to create report content.

Report should never mutate Campaign execution state.

---

# 14. Report ≠ Project

Design 023 remains the Project source of:

* timeline,
* progress,
* delivery dates,
* milestones.

A Report summarizes approved data from that Project.

It does not become another Project record.

---

# 15. Report ≠ Client

A Client can have:

```text
Client
├── Project Report A
├── Campaign Report B
├── Quarterly Report C
└── Annual Relationship Report D
```

Reports remain independent historical deliverables.

---

# 16. Report type

The architecture should support controlled types such as:

```text
Project Delivery Report
Distribution Performance Report
Publication Report
Client Performance Report
```

only as actually supported.

Avoid arbitrary `reportType` strings spread through frontend code.

---

# 17. Report Template ≠ Report

A reusable Template may define:

```text
Cover
Executive Summary
Distribution Overview
Channel Performance
Live Links
Recommendations
```

But:

```text
ReportTemplate
       ↓ instantiate
Report
```

An existing Report must not change because somebody edits the master Template tomorrow.

---

# 18. Template versioning / snapshot

As with workflow and magazine templates:

```text
ReportTemplate Version
        ↓
Report Version
```

must preserve the structure used historically.

Template edits should affect future report generation, not rewrite old Client reports.

---

# 19. Report sections should be structured

Avoid one giant:

```text
report.html
```

as the only truth.

Conceptually:

```text
Report
├── Executive Summary
├── Delivery Overview
├── Publishing
├── Distribution
├── Metrics
├── Placements
├── Evidence / Links
└── Recommendations
```

Sections can be structured enough for:

* rendering,
* permission filtering,
* versioning,
* export.

---

# 20. Narrative ≠ metric

A Report may contain:

### Metric

```text
LinkedIn Engagement: 6.21%
```

### Narrative

> LinkedIn produced the strongest verified engagement among measured social placements.

The narrative may be authored by a human or generated with assistance.

The underlying metric remains canonical.

---

# 21. AI-generated narrative boundary

If AI later helps generate summaries:

```text
Verified metrics
      ↓
AI drafting
      ↓
Report narrative draft
      ↓
Human review
```

AI should not be allowed to invent missing statistics.

Generated text must remain distinguishable from source metric truth.

---

# 22. Generated recommendation ≠ verified fact

Example:

> “LinkedIn appears to be the strongest channel for future executive campaigns.”

This is an interpretation/recommendation.

It should not be stored as though it were a measured KPI.

---

# 23. Report dataset snapshot

A canonical reporting engine should be able to create:

```text
ReportDatasetSnapshot
```

containing references/captured values used for the report.

This protects reproducibility.

The platform should be able to answer:

> Why did Report v2 show 48,756 clicks?

---

# 24. Snapshot should preserve source lineage

Conceptually:

```text
ReportMetric
     ↓
MetricSnapshot
     ↓
Distribution Placement / Provider Metric
```

or:

```text
ReportSection
     ↓
Project Milestone
```

Report data should remain traceable back to authoritative sources.

---

# 25. Source data change after report generation

If canonical data is corrected later:

```text
Campaign metric corrected
```

existing Report v1 should generally remain historically stable.

A corrected report should create:

```text
Report v2
```

or an explicit amended version.

Do not silently rewrite what the Client previously received.

---

# 26. Correction ≠ deletion

If a report contains an error:

preserve:

```text
Report v1 — Superseded
Report v2 — Corrected
```

rather than deleting v1 from history.

---

# 27. Draft ≠ finalized report

Conceptually:

```text
DRAFT
   ↓
IN_REVIEW
   ↓
FINAL
```

with delivery/shared states potentially separate.

Exact enum vocabulary comes in Phase 3D.

The important rule:

> Editing lifecycle and delivery lifecycle are separate.

---

# 28. Finalized ≠ delivered

A Report can be:

```text
Finalized:
YES

Client Delivery:
NOT_SENT
```

This is valid.

Do not mark a report “delivered” merely because export generation completed.

---

# 29. Delivered ≠ viewed

Likewise:

```text
Delivered
≠
Viewed / Downloaded
```

if client-access tracking is supported.

These are distinct events.

---

# 30. Export artifact ≠ Report record

PDF/DOCX/other output should use the canonical Asset/File infrastructure.

Correct:

```text
ReportVersion
      ↓
Generated Document Artifact
      ↓
Asset/FileVersion
```

Design 033 should not invent a report-only file storage system.

---

# 31. Exact report artifact should be preserved

If Client received:

```text
Distribution_Report_v2.pdf
```

the platform should preserve that exact generated artifact.

Do not regenerate it later from current data and assume it will be identical.

---

# 32. Client-safe reporting boundary

Reporting is especially sensitive because the internal system can contain:

* margin,
* cost,
* staff performance,
* internal risk,
* failed draft campaigns,
* private notes.

Client reports must use explicit whitelisted projections.

---

# 33. Internal report ≠ Client report

One canonical Reporting domain can support multiple visibility contexts.

But:

```text
Internal Operations Report
≠
Client Deliverable Report
```

The difference must be structural and permission-aware.

---

# 34. Do not hide internal data only in the UI

Dangerous:

```text
backend sends margin
frontend hides margin card
```

Correct:

```text
ClientReportQuery
→ never returns margin
```

Client-safe filtering occurs server-side.

---

# 35. Metric visibility

Some metrics may be legitimate internally but not approved for external reporting.

Conceptually:

```text
MetricDefinition
+
visibility/reporting policy
```

can govern external eligibility.

Do not automatically expose every Analytics metric to Clients.

---

# 36. Financial metrics require Finance permission

A report author may be able to see:

* project performance,
* Distribution metrics,

without Finance authority.

Financial sections need independent permission checks.

Report creation cannot bypass source-domain RBAC.

---

# 37. Underlying permissions matter during report creation

Being allowed to:

```text
report.create
```

should not automatically allow querying:

```text
all invoices
all payments
all contracts
```

The report query layer must enforce source permissions.

---

# 38. Finalized report access may differ

Once an approved Client-facing Report is finalized, some users may be allowed to access the report artifact even if they cannot access every underlying internal source record.

That is a deliberate report-delivery permission.

It should not grant reverse access to the source systems.

---

# 39. Client Portal relationship

Client Portal can consume:

```text
Client-visible ReportVersion
```

through safe access.

It should not query internal Reporting Workspace data directly.

Correct:

```text
Report Domain
    │
    ├── Team Reporting Workspace
    └── Client-safe Report Projection
```

---

# 40. Sharing ≠ making public

Just like Assets:

```text
Client-shared Report
≠
Public internet Report
```

Client reports should normally require authenticated/authorized access unless explicitly published publicly.

---

# 41. Report approval

High-value Client reports may require internal review before delivery.

Use Design 029:

```text
ReportVersion
      ↓
ApprovalRequest
      ↓
ApprovalDecision
```

No separate:

```text
report.managerApproved = true
```

parallel truth.

---

# 42. Approval binds to exact Report Version

If:

```text
Report v2
APPROVED
```

and author edits data/text into:

```text
Report v3
```

then:

```text
v3 ≠ automatically approved
```

The exact-version approval invariant remains universal.

---

# 43. Report comments/review

Draft Report review can reuse the common Review/Comment infrastructure.

Internal review comments remain distinct from text actually visible inside the Client Report.

---

# 44. Internal comment ≠ Report content

Example:

> “Double-check this number before sending.”

should remain an internal review comment.

It should not appear in exported/client-visible Report content.

---

# 45. Live links should use canonical Placement data

Design 032 established verified Placements.

Design 033 should consume:

```text
Placement
├── URL
├── verification status
└── verifiedAt
```

instead of accepting arbitrary links pasted into the report as authoritative results.

---

# 46. Verified placement ≠ currently live forever

If:

```text
May 20 — Verified
June 15 — Unavailable
```

the report should know which verification snapshot/date it communicates.

Avoid saying:

> “Currently live”

based solely on a month-old verification.

---

# 47. Reporting period matters for metrics

Metrics such as:

```text
views
clicks
reach
```

must always be interpreted against a period/snapshot.

A report containing:

> 85,000 impressions

without a measurement period is ambiguous.

---

# 48. Cross-channel metrics are not automatically comparable

Examples:

```text
Newsletter open rate
LinkedIn engagement rate
YouTube view rate
```

are different metric definitions.

Design 033 should not normalize them into a single ranking unless a legitimate canonical model exists.

---

# 49. “Top Performing Channel” needs explicit criteria

A Report can say:

```text
Top Channel by Verified Engagement Rate
```

or:

```text
Top Channel by Clicks
```

But a vague:

> Best Channel

needs a defined calculation.

No decorative ranking without methodology.

---

# 50. Performance deltas need comparable periods

If a report says:

```text
↑ 18%
```

it needs a known comparison baseline:

```text
vs previous campaign
vs previous month
vs previous reporting period
```

The comparison definition must travel with the metric.

---

# 51. Percentage ≠ absolute value

Client reporting should preserve both where needed.

Example:

```text
Engagement:
6.34%

Clicks:
48,756
```

Do not combine incomparable types in one metric field without unit metadata.

---

# 52. Currency metrics

Where Revenue/Value is included:

* amount,
* currency,
* reporting conversion

must follow the Finance architecture from Designs 007 and 020.

Never sum mixed currencies silently.

---

# 53. Report generation should be asynchronous

Complex report rendering may involve:

* querying snapshots,
* rendering charts,
* generating PDF,
* collecting images,
* assembling evidence.

Use:

```text
ReportGenerationJob
```

or shared job infrastructure.

Do not rely on a 60-second browser request.

---

# 54. Generation job ≠ Report lifecycle

Example:

```text
Report:
FINAL

PDF generation:
FAILED
```

The Report data can remain intact.

Only the output artifact generation failed.

---

# 55. Retry generation must be idempotent

Retrying a failed export should not create:

```text
Report Version 4
Report Version 5
Report Version 6
```

accidentally.

A retry of the same generation request should normally reproduce the same ReportVersion artifact.

---

# 56. Report generation failure should preserve source snapshot

If rendering fails after the data snapshot was taken:

keep the snapshot.

Retry should use the same frozen data if generating the same Report Version.

Otherwise numbers can change between retries.

---

# 57. Report version creation should be deliberate

Meaningful changes that affect Client-visible truth should create a new version.

Examples:

* corrected metric,
* changed reporting period,
* changed conclusion,
* added verified placement.

Minor drafting/autosave may remain working state before final versioning.

Exact semantics belong to Phase 3D.

---

# 58. Report status ≠ Delivery status ≠ Generation status

Example:

```text
Report lifecycle:
FINAL

Generation:
SUCCESS

Client delivery:
PENDING
```

All three can coexist.

Do not overload one `reportStatus`.

---

# 59. Reporting ownership

Potential roles include:

```text
Report Owner
Prepared By
Reviewed By
Approved By
Delivered By
```

They may be different people.

Do not reduce the entire report history to one `ownerId`.

---

# 60. Report owner ≠ Account Manager

An Account Manager may own the Client relationship.

A Marketing/Analytics person may prepare the Distribution Report.

The system should preserve both relationships.

---

# 61. Delivery recipient ≠ Client Contact automatically

A canonical Contact can be designated as a recipient.

Conceptually:

```text
ReportRecipient
├── report/version
├── Contact / PortalMembership
├── delivery method
└── delivery state
```

This avoids copying recipient identity into arbitrary text fields.

---

# 62. Delivery history

The system should be able to record:

```text
shared in portal
email sent
downloaded/viewed if supported
```

without treating delivery tracking as the Report's analytical data.

---

# 63. Reporting workspace ≠ Report Builder

Later:

**Design 133 — Report Builder / Custom Report Configuration**

is the dedicated configuration/builder surface.

Design 033 should not become the entire future builder engine.

It can coordinate report creation/use while the later Builder provides deeper custom composition.

---

# 64. Relationship to Design 130

Later:

**Design 130 — Final Distribution Report / Client Performance Report**

is a very strong overlap checkpoint.

Expected:

```text
Canonical Reporting Domain
      │
      ├── 033 Reporting / Client Reporting Workspace
      └── 130 Final Distribution / Client Performance Report
```

One report/metric/snapshot backend.

**DO NOT MERGE YET.**

---

# 65. Relationship to Designs 131–134

Frozen later sequence:

**131 — Reporting Library / Report Center**
**132 — Report Detail / Interactive Report Workspace**
**133 — Report Builder / Custom Report Configuration**
**134 — Scheduled Reports / Report Delivery Management**

These should operate over one architecture:

```text
Report
├── Library
├── Detail
├── Builder
└── Schedule / Delivery
```

Design 033 must not create competing report records.

---

# 66. Major overlap checkpoint

We now formally record:

```text
Reporting Domain
│
├── 033 broad Client Reporting Workspace
├── 130 final distribution/client report
├── 131 reporting library
├── 132 interactive detail
├── 133 builder
└── 134 scheduled delivery
```

The later audits will determine screen-level consolidation.

Backend consolidation is already clear:

> **One Reporting domain.**

---

# 67. Relationship to Analytics

Later **Design 135 — Analytics Executive Dashboard** is about interactive analytics.

Expected:

```text
Metric / Analytics Infrastructure
      │
      ├── Analytics dashboards
      └── Reporting snapshots
```

Share metric definitions and query infrastructure.

Keep dashboard and report semantics separate.

---

# 68. Relationship to Client 360

Design 021 can show:

```text
Latest Report
Report status
Last delivered
```

but should not duplicate Report generation.

The Client 360 links into canonical Report records.

---

# 69. Relationship to Project 360

Design 023 can summarize/report:

```text
Project Report Ready
```

but report creation, versioning and Client delivery remain in Reporting.

---

# 70. Reusable Reporting components

Design 033 establishes or formalizes:

`ReportingWorkspaceHeader`
`ReportCard`
`ReportStatusBadge`
`ReportingPeriodSelector`
`MetricCard`
`MetricProvenanceIndicator`
`VerificationBadge`
`ReportSection`
`ReportChartCard`
`PlacementEvidenceTable`
`ReportVersionSelector`
`ReportPreview`
`ReportGenerationStatus`
`ClientVisibilityIndicator`
`ReportDeliveryStatus`
`ReportQuickViewDrawer`

Shared primitives come from Dashboard, Asset, Approval and List families.

---

# 71. Reporting template family

We can now establish:

```text
ReportingWorkspaceTemplate
├── report context
├── period
├── metric summaries
├── charts
├── evidence
├── narrative
├── versions
├── review/approval
└── delivery
```

Later Designs 130–134 should reuse this foundation.

---

# 72. Permissions architecture

Potential Phase 3D capabilities:

```text
report.read
report.create
report.edit
report.generate
report.review
report.approve
report.share_client
report.export
report.archive
```

plus source-domain permissions.

Exact naming comes later.

Critical distinction:

> **READ ≠ EDIT ≠ GENERATE ≠ APPROVE ≠ SHARE WITH CLIENT ≠ EXPORT.**

---

# 73. Client-share permission is high impact

A user allowed to edit a Report should not automatically be able to expose it externally.

```text
report.edit
≠
report.share_client
```

Client delivery deserves explicit permission and audit.

---

# 74. Export permission

Being allowed to view a report does not automatically imply permission to export:

* raw data,
* full underlying metrics,
* CSVs,
* client information.

Report artifact export and raw-data export should remain distinguishable.

---

# 75. Report-source data access

A user generating a report must only use source data within their allowed:

```text
organization
team
Client
Project
finance/reporting scope
```

No cross-tenant metric aggregation unless explicitly administrative and authorized.

---

# 76. Responsive — Desktop

Desktop can preserve a rich analytical/reporting composition:

```text
Reporting Header
↓
Client / Project / Period
↓
Report status / version
↓
Key Metrics
↓
Charts / Performance
↓
Channel / Placement Evidence
↓
Narrative / Recommendations
↓
Preview / Approval / Delivery
```

This remains the strongest authoring/review surface.

---

# 77. Responsive — Tablet

Following Design 152:

* KPI cards reflow,
* charts stack,
* data tables reduce columns,
* report outline becomes a drawer,
* preview remains readable,
* approval/share actions remain touch-safe.

---

# 78. Responsive — Mobile

Following Design 151, prioritize:

```text
Report Identity
↓
Client / Project / Period
↓
Status / Version
↓
Key Verified Metrics
↓
Executive Summary
↓
Placements / Evidence
↓
Core Charts
↓
Approval / Delivery Status
↓
Download / Share where permitted
```

Heavy custom report composition can remain desktop-first.

---

# 79. Mobile client-report review

Mobile should be strong for:

* opening report,
* verifying core numbers,
* reviewing narrative,
* approving,
* sharing/delivering,
* downloading final artifact.

Do not force complex chart-builder editing onto mobile.

---

# 80. State coverage

Design 033 inherits Design 150 plus Reporting-specific states:

```text
Reporting Workspace Loading
No Reports Yet
No Results After Filters

Report Draft
Generating
Generation Failed
Generated
In Review
Changes Requested
Approved
Finalized
Delivery Pending
Delivered
Archived
Superseded

Metric Data Pending
Metric Data Unavailable
Estimated Metric
Verified Metric
Placement Verification Stale

Export Generating
Export Failed

Permission Restricted
Source Data Unavailable
Record Updated Elsewhere
Partial Service Failure
```

These should not become one giant `ReportStatus` enum.

---

# 81. Partial failure behavior

Example:

```text
Report core                ✓
Project metrics            ✓
Distribution metrics       ✓
Finance section            ✕
Placement verification     ✓
```

The Report workspace should remain usable.

Finance section should show unavailable/restricted state.

Do not collapse the entire Report.

---

# 82. Permission-restricted ≠ unavailable

If the user lacks Finance access:

show:

> Restricted

not:

> Finance service unavailable.

Likewise:

```text
no data
```

and:

```text
no permission
```

remain distinct.

---

# 83. Read model

A useful composed model:

```text
ReportingWorkspaceView
├── Report
├── Client / Project context
├── reporting period
├── current ReportVersion
├── lifecycle
├── metric snapshots
├── provenance
├── charts
├── placements / evidence
├── narrative sections
├── approval summary
├── output artifact
├── delivery state
└── activity
```

This remains a read composition.

---

# 84. Never PATCH the complete report workspace

Avoid:

```text
PATCH /report-workspace
{
  reach: 1240000,
  clicks: 48756,
  verified: true,
  approved: true,
  delivered: true
}
```

Prefer domain commands:

```text
createReport()
setReportingPeriod()
createReportSnapshot()
updateReportNarrative()
createReportVersion()
requestReportApproval()
finalizeReportVersion()
generateReportArtifact()
shareReportWithClient()
archiveReport()
```

Metric values are consumed from canonical Metric/Snapshot services.

---

# 85. Backend architecture

```text
Reporting Workspace UI
        ↓
ReportingQueryService
        ↓
Tenant + Permission Scope
        ↓
Reporting Domain
        │
        ├── Report
        ├── ReportVersion
        ├── ReportSection
        ├── ReportMetric
        ├── ReportDatasetSnapshot
        ├── ReportRecipient
        └── ReportDelivery
        │
        ├── Metric / Analytics Service
        ├── Project Service
        ├── Publishing Service
        ├── Distribution Service
        ├── Finance Service
        ├── Asset/File Service
        ├── Approval Service
        ├── Rendering / Export Jobs
        └── Activity / Audit
```

---

# 86. Backend requirements

| Requirement                                | Status                     |
| ------------------------------------------ | -------------------------- |
| Authentication                             | **Required**               |
| Tenant isolation                           | **Critical**               |
| Reporting RBAC                             | **Critical**               |
| Canonical Report entity                    | **Critical**               |
| ReportVersion/Snapshot                     | **Critical**               |
| Client/Project lineage                     | **Critical**               |
| Reporting period                           | **Critical**               |
| Canonical Metric definitions               | **Critical**               |
| Metric provenance                          | **Critical**               |
| Verified/estimated/unavailable distinction | **Critical**               |
| ReportDatasetSnapshot                      | **Critical**               |
| Distribution metric integration            | **Critical**               |
| Publishing integration                     | **Required**               |
| Project integration                        | **Required**               |
| Finance integration where applicable       | **Permission-sensitive**   |
| Report Template/version semantics          | **Required**               |
| Approval integration                       | **Required**               |
| Asset/File artifact generation             | **Critical**               |
| Async rendering/export jobs                | **Critical**               |
| Idempotent generation retries              | **Critical**               |
| Immutable finalized versions               | **Critical**               |
| Client-safe projection                     | **Critical**               |
| Client delivery history                    | **Required**               |
| Scheduled delivery architecture            | **Required for later 134** |
| Concurrency protection                     | **Required**               |
| Partial source failure                     | **Critical**               |
| Activity history                           | **Required**               |
| Audit history                              | **Critical**               |

---

# 87. Canonical Reporting metrics

Design 033 does **not** invent its own calculations.

It consumes centralized definitions for metrics such as:

**Project Completion**
**On-Time Delivery**
**Published Content**
**Verified Placements**
**Reach / Estimated Reach**
**Impressions**
**Clicks**
**Engagement Rate**
**Publication Performance**
**Distribution Completion**
**Client Approval Time**
**Revenue / Collection metrics where authorized**

Every report should preserve:

> **value + unit + definition + period + source + provenance.**

---

# 88. Main implementation risks

Design 033 exposes several major risks:

**Live-data/report conflation** — historical reports changing whenever live metrics update.

**Report/version conflation** — Client-visible report edits overwriting previously delivered truth.

**Metric duplication** — every report recalculating KPIs independently.

**Verified/estimated conflation** — estimated numbers presented as verified results.

**Zero/unavailable conflation** — provider outage rendered as zero performance.

**Dashboard/report conflation** — interactive analytics treated as a finalized Client deliverable.

**Template/live-report conflation** — editing Report Template rewrites historical reports.

**Report/source permission leakage** — report creation exposing Finance or internal Client data without source authorization.

**Internal/client-report conflation** — margin, risks or employee information leaking into external reports.

**Approval/version drift** — approval of Report v2 implicitly transferred to v3.

**Generated-artifact drift** — PDF regenerated later from newer metrics and no longer matches what Client received.

**Report/rendering conflation** — PDF generation failure incorrectly destroys the canonical report.

**AI narrative hallucination** — generated prose inventing unsupported performance claims.

**Live-link evidence weakness** — unverified URLs treated as verified placements.

**Metric comparison ambiguity** — incompatible channel metrics ranked without methodology.

**033/130–134 duplicate engines** — later Reporting screens implemented with separate report models.

None requires another visual design.

They require trustworthy Reporting architecture.

# Design 033 Audit Verdict

## **PASS — CROSS-DOMAIN REPORTING & CLIENT REPORTING ANCHOR**

**Domain directive:** **Live Analytics ≠ Report ≠ ReportVersion ≠ ReportMetric Snapshot.**

**Snapshot directive:** finalized reports preserve immutable/reconstructable metric and dataset snapshots so historical Client reports do not change with live data.

**Metric directive:** all KPIs consume centralized metric definitions; Design 033 must not invent page-local calculations.

**Provenance directive:** every reportable metric preserves source, period, unit and qualification such as **verified / estimated / unavailable**.

**Version directive:** Client-visible or approved Report changes create controlled new Report Versions instead of rewriting previously delivered truth.

**Template directive:** Report Templates are reusable definitions; instantiated reports preserve the template/version structure used at generation time.

**Evidence directive:** distribution links and placements come from canonical Placement/Verification records rather than arbitrary claimed URLs.

**Approval directive:** report review/approval reuses the Design 029 Approval infrastructure and always references the exact Report Version.

**Asset directive:** generated PDF/document outputs use Design 030's Asset/FileVersion infrastructure and preserve the exact artifact delivered.

**Client-safety directive:** Client reports are produced through server-side whitelisted projections; internal margins, notes, employee performance, restricted finance and other protected data never reach the Client payload.

**AI directive:** AI may assist report narrative generation but can never become the source of KPI truth or fabricate missing metrics.

**Generation directive:** heavy snapshot/render/export work executes asynchronously, preserving the same source snapshot across retries.

**Permission directive:** report read, edit, generate, approve, external share and export remain independently enforceable, with source-domain authorization respected.

**Reporting-family directive:** Designs **033 and 130–135** must share canonical Metric, Report, ReportVersion, Snapshot, Rendering and Delivery infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE REPORT + METRIC DEFINITION + PROVENANCE + SNAPSHOT + VERSION + CLIENT-SAFE DELIVERY INFRASTRUCTURE — DO NOT BUILD SEPARATE REPORTING ENGINES FOR PROJECTS, DISTRIBUTION, CLIENTS, FINANCE OR LATER REPORTING SCREENS.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **33 / 153** |
| **PASS**                                   |                         **33** |
| **STANDARDIZE decisions**                  |                         **31** |
| **Potential implementation-overlap flags** |                         **24** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**33 / 153 = 21.6% audited.**

### Canonical content-delivery architecture after Design 033

```text
PRODUCT EXECUTION
024–028
      ↓
APPROVAL
029
      ↓
ASSET / FILE
030
      ↓
PUBLISHING
031
      ↓
DISTRIBUTION
032
      ↓
REPORTING
033
      │
      ├── Metric definitions
      ├── Provenance
      ├── Dataset snapshot
      ├── Report
      ├── Report Version
      ├── Approval
      ├── Generated Artifact
      └── Client Delivery
      ↓
CLIENT-SAFE PERFORMANCE RECORD
```

We now have a complete and clean post-production chain:

```text
CREATE
  ↓
APPROVE
  ↓
VERSION / STORE
  ↓
PUBLISH
  ↓
DISTRIBUTE
  ↓
VERIFY
  ↓
SNAPSHOT
  ↓
REPORT
  ↓
DELIVER TO CLIENT
```

# Next Sequential Audit Target

## Phase 3A.1 — Design 034 Audit

For **Design 034**, we should again retrieve its **exact frozen identity from the approved 153-design inventory before auditing it**.

We should not infer it from Reporting or assume it is Report Detail, Analytics, Renewals, Tasks, Calendar, Team, or another operational workspace.

Once verified, we continue with the identical audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

