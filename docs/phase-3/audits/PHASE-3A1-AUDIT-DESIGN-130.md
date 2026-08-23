# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 130 — Final Distribution Report / Client Performance Report

Design 130 should become the **canonical Team Workspace finalized distribution-outcome report, frozen client-performance evidence, exact reporting-period snapshot, report-version, generated-artifact, release, and delivery surface** built on the Distribution foundation established by **Design 032** and the exact Campaign/Placement/Verification/Metric foundations established by **Designs 127–129**.

Design 130 must **not become another live analytics dashboard**. Design 129 owns current/live distribution verification and performance analysis. Design 130 must freeze a reproducible report version containing the exact CampaignVersion, included Placements, verification evidence, metric definitions/formula versions, reporting period, metric observations/aggregates, provenance, and generated report artifact that were actually approved/released to the Client.

It must also preserve strict boundaries with:

* Design 033 — Reporting / Client Reporting Workspace;
* Design 056 — Client Reports & Downloads;
* Design 073 — Client Distribution Detail;
* Designs 131–134 — general Reporting system;
* Design 038 — canonical Metric Registry;
* Design 129 — live Distribution Performance;
* Design 121 — Final Handover;
* canonical Approval engine Designs 029/115;
* Asset/FileVersion foundation Design 030.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **DistributionCampaign ≠ DistributionCampaignVersion ≠ Placement ≠ PlacementVerification ≠ MetricObservation ≠ MetricAggregate ≠ PerformanceSnapshot ≠ DistributionReport ≠ DistributionReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ GeneratedReportArtifact ≠ ReportApproval ≠ ReportRelease ≠ ClientDownload ≠ LiveAnalytics.**

The central implementation rule is:

> **A final client report is an immutable versioned evidence package, not a screenshot of today's analytics. Finalizing Report Version v3 must freeze the exact reporting period, exact CampaignVersion, exact included Placements, exact verification states/evidence, exact metric-definition/calculation versions, exact contributing observations or frozen aggregates, provenance, freshness treatment, and generated artifact. Later provider updates, Placement changes, metric corrections, new Publication versions, or new Distribution activity must never silently rewrite v3. If corrections are required, create v4 or a governed amendment while preserving v3 and its original Client release/download history.**

---

# 1. Classification

| Audit field                              | Classification                                                                                                                                                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                            | **130**                                                                                                                                                                                                                             |
| **Canonical name**                       | **Final Distribution Report / Client Performance Report**                                                                                                                                                                           |
| **Product area**                         | Team Workspace / Distribution / Client Reporting                                                                                                                                                                                    |
| **User surface**                         | **Authenticated Team Workspace**                                                                                                                                                                                                    |
| **Screen class**                         | Versioned Final Report Workspace / Client Performance Delivery                                                                                                                                                                      |
| **Classification**                       | **Canonical Frozen Distribution Outcome, Client Performance Report-Version & Release Anchor**                                                                                                                                       |
| **Primary purpose**                      | Convert authoritative Distribution Campaign, Placement verification, and performance evidence into a reproducible client-facing report version that can be reviewed, approved, released, downloaded, and historically reconstructed |
| **Canonical Distribution foundation**    | Design 032                                                                                                                                                                                                                          |
| **Campaign input**                       | Design 127                                                                                                                                                                                                                          |
| **Placement input**                      | Design 128                                                                                                                                                                                                                          |
| **Performance/verification input**       | Design 129                                                                                                                                                                                                                          |
| **Metric semantics**                     | Design 038                                                                                                                                                                                                                          |
| **Primary report identity**              | `DistributionReport`                                                                                                                                                                                                                |
| **Immutable report identity**            | `DistributionReportVersion` / canonical `ReportVersion` specialization                                                                                                                                                              |
| **Frozen dataset**                       | `ReportDatasetSnapshot` / `PerformanceSnapshot`                                                                                                                                                                                     |
| **Report metrics**                       | `ReportMetric` / snapshot metric entries                                                                                                                                                                                            |
| **Generated artifact**                   | exact Asset/FileVersion via Design 030                                                                                                                                                                                              |
| **Approval dependency**                  | Designs 029 / 115 where required                                                                                                                                                                                                    |
| **Client report projection**             | Design 056                                                                                                                                                                                                                          |
| **Client distribution projection**       | Design 073                                                                                                                                                                                                                          |
| **General reporting foundation**         | Design 033                                                                                                                                                                                                                          |
| **Reporting library/builder dependency** | Designs 131–134                                                                                                                                                                                                                     |
| **Final Handover boundary**              | Design 121                                                                                                                                                                                                                          |
| **Activity dependency**                  | Design 119                                                                                                                                                                                                                          |
| **Audit dependency**                     | Design 039                                                                                                                                                                                                                          |
| **Primary query service**                | `DistributionReportQueryService`                                                                                                                                                                                                    |
| **Snapshot service**                     | `DistributionReportSnapshotService`                                                                                                                                                                                                 |
| **Report-version service**               | `DistributionReportVersionService`                                                                                                                                                                                                  |
| **Rendering service**                    | `ReportRenderingService`                                                                                                                                                                                                            |
| **Approval resolver**                    | canonical Approval engine                                                                                                                                                                                                           |
| **Release service**                      | `ReportReleaseService`                                                                                                                                                                                                              |
| **Client-access service**                | canonical Client report/file access infrastructure                                                                                                                                                                                  |
| **Parent shell**                         | `InternalAppShell` — Design 001                                                                                                                                                                                                     |
| **Auth**                                 | Required                                                                                                                                                                                                                            |
| **Authorization**                        | Active OrganizationMembership + report/view/version/approval/release permissions                                                                                                                                                    |
| **Implementation priority**              | **Critical Client Trust / Historical Reproducibility / Metric Integrity**                                                                                                                                                           |
| **Reuse level**                          | **Extremely High across Reporting Library, Scheduled Reports, Client Downloads, Analytics and Renewals**                                                                                                                            |

Design 130 should answer:

> **“What exact Distribution Campaign period is this report about, which Placements and verified outcomes are included, which performance figures were frozen, how were they calculated, what data was unavailable or stale, which report version was approved, what exact PDF/file was released to the Client, and can we reproduce today exactly what the Client received?”**

Canonical composition:

```text id="r130a1"
DistributionCampaign DC-100
        │
        ↓
CampaignVersion v2
        │
        ├── Placement P-10
        ├── Placement P-11
        └── Placement P-12
                │
                ├── Verification evidence
                └── Metric observations
                         │
                         ↓
              Distribution Performance
                   Design 129
                         │
                         ↓
            ReportDatasetSnapshot DS-3
                         │
                         ↓
              DistributionReport R-20
                         │
                         ↓
              ReportVersion RV-3
                         │
                ┌────────┼─────────┐
                ↓        ↓         ↓
            Metrics   Narrative   Visuals
                │
                ↓
      GeneratedReportArtifact
             FileVersion FV-8
                │
                ↓
         Approval / Release
                │
                ↓
          Client Access
```

---

# 2. Reuse

## Design 033 remains canonical Reporting foundation

Design 130 should be a **Distribution-specialized report composition**, not a second reporting platform.

Correct:

```text id="r130a2"
Report
ReportVersion
ReportDatasetSnapshot
GeneratedReportArtifact
ReportRelease
```

should reuse the canonical reporting semantics established by Design 033.

Avoid:

```text id="r130a3"
DistributionPDF
ClientPerformanceFile
CampaignReportBlob
```

as independent one-off domains.

---

## DistributionReport ≠ DistributionCampaign

Absolute.

Campaign answers:

> What distribution activity happened?

Report answers:

> What finalized representation of that activity was created for a period/audience?

One Campaign may have:

* draft report;
* approved report version;
* revised report;
* later monthly/quarterly reports.

---

## DistributionReport ≠ ReportVersion

Critical.

### DistributionReport

Stable report identity.

### ReportVersion

One exact immutable finalized/draft report revision.

Example:

```text id="r130a4"
DistributionReport DR-20
├── v1 draft
├── v2 internally reviewed
├── v3 approved & released
└── v4 corrected later
```

---

## ReportVersion ≠ ReportDatasetSnapshot

Permanent.

ReportVersion contains:

* narrative;
* layout;
* selected metrics;
* visual configuration;
* generated artifact relationship.

DatasetSnapshot contains:

> the exact frozen evidence/data used.

---

## Dataset snapshot ≠ live Design-129 query

This is the strongest reuse boundary.

Design 129 can change tomorrow.

Design 130 v3 cannot.

Correct:

```text id="r130a5"
Design 129 live:
Impressions = 14,200 today

Report v3 snapshot:
Impressions = 12,940
for Aug 1–31
frozen Sep 1
```

Both remain valid.

---

## PerformanceSnapshot ≠ copied arbitrary dashboard JSON

A snapshot must preserve enough semantic information to reconstruct:

* metric definitions;
* metric calculation versions;
* included Placement set;
* observation periods;
* provenance;
* unavailable/partial treatment.

---

## Report Metric ≠ live MetricAggregate

Permanent.

A report may contain a frozen:

```text id="r130a6"
ReportMetric {
  metricDefinitionId,
  value,
  period,
  provenanceSummary,
  calculationVersion
}
```

derived from exact snapshot evidence.

It does not query a live aggregate on render.

---

## Metric semantics remain Design 038 authority

Report v3 must not redefine:

> engagement rate

differently from Design 129.

It pins:

```text id="r130a7"
metricDefinitionVersion
```

or equivalent formula version used at report generation/finalization.

---

## Design 129 remains live/current performance authority

Design 130 may provide a preview based on a draft snapshot.

It must not duplicate:

* metric ingestion;
* Placement verification polling;
* current performance aggregation.

---

## Design 128 remains Placement authority

The report includes exact canonical Placements.

It never creates:

```text id="r130a8"
ReportPlacement
```

as a duplicate business Placement.

A snapshot may store safe historical representation of included Placement evidence.

---

## Design 073 remains client live Distribution projection

Design 073 answers:

> What can the Client currently see about distribution?

Design 130 answers:

> What finalized performance report was delivered?

Live Client Distribution and frozen Client Report remain separate.

---

## Design 056 remains Client Reports & Downloads collection

When v3 is released:

Design 056 should list/reference the same canonical ReportVersion and generated FileVersion.

No duplicate client-report file database.

---

## Generated artifact ≠ ReportVersion

Critical.

The ReportVersion is the business/report identity.

The PDF or downloadable artifact is:

```text id="r130a9"
Asset / FileVersion
```

Example:

```text id="r130a10"
ReportVersion RV-3
        ↓
PDF FileVersion FV-8
```

---

## Regenerated artifact ≠ silent replacement

If finalized RV-3's exact artifact was delivered to the Client:

do not overwrite FV-8.

If regeneration changes bytes/content:

create a new FileVersion and preserve release lineage.

---

## Report release ≠ Client download

Permanent.

### Release

The organization makes approved ReportVersion available.

### Download

A specific Client user downloads its artifact.

---

## Download ≠ acknowledgement

Permanent.

---

## Report release ≠ Final Handover

Design 121 remains separate.

A performance report may be:

* included in a FinalHandover;
* released separately later;
* generated after Project completion.

These are independent entities/events.

---

# 3. Entities

## DistributionReport

Stable logical report identity.

Conceptually:

```text id="r130a11"
DistributionReport
├── id
├── organizationId
├── distributionCampaignId
├── clientRelationshipId?
├── reportType
├── lifecycle
├── currentDraftVersionId?
├── latestReleasedVersionId?
├── createdBy
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## DistributionReport can cover one Campaign or governed multi-campaign scope

Do not assume multi-campaign reports if frozen design is one Campaign.

For Design 130, the safe canonical base is:

> one final Distribution Campaign/client-performance report context.

Broader reporting belongs Designs 131–134.

---

## DistributionReportVersion

Conceptually:

```text id="r130a12"
DistributionReportVersion
├── id
├── reportId
├── versionNumber
├── reportingPeriodStart
├── reportingPeriodEnd
├── timezone
├── datasetSnapshotId
├── narrative/content snapshot
├── metric-selection snapshot
├── visualization-config snapshot
├── lifecycle
├── createdBy
├── createdAt
├── finalizedAt?
├── approvedAt?
├── releasedAt?
└── revision
```

---

## Reporting period must be explicit

Critical.

Every report must define:

```text id="r130a13"
periodStart
periodEnd
timezone
```

where period semantics matter.

Do not use:

> Last month

as stored business truth.

---

## Report period ≠ metric observation period automatically

Some metrics may have different provider windows.

Snapshot logic must normalize or explicitly qualify them.

---

## Draft version may be editable

Before finalization/approval:

* narrative;
* selected charts;
* selected report metrics;
* presentation configuration;

may change.

---

## Finalized/approved/released Version should be immutable

Absolute.

Material changes require a new ReportVersion.

---

## Report lifecycle ≠ Version lifecycle

Permanent.

Example:

```text id="r130a14"
Report DR-20 = ACTIVE
v2 = HISTORICAL
v3 = RELEASED
v4 = DRAFT
```

---

## ReportDatasetSnapshot

Strongly required.

Conceptually:

```text id="r130a15"
ReportDatasetSnapshot
├── id
├── organizationId
├── reportVersionId / snapshot intent
├── campaignVersionId
├── period
├── includedPlacementRefs[]
├── placementVerificationRefs/snapshots
├── metricDefinitionVersions[]
├── contributingObservationRefs[]
├── frozenAggregates[]
├── generatedAt
├── sourceRevisionManifest
└── snapshotSchemaVersion
```

---

## Snapshot source references should be exact

Examples:

```text id="r130a16"
Placement P-10
Verification V-22
MetricObservation MO-1001
MetricDefinition IMPRESSIONS v4
CampaignVersion DCV-2
```

---

## Source revision manifest

Useful for reproducibility.

It allows the system to prove:

> report v3 was built from these exact evidence revisions.

---

## Snapshot ≠ current Placement state

A Placement might be:

```text id="r130a17"
VERIFIED during reporting period
```

and later:

```text id="r130a18"
MISSING
```

The report snapshot can validly retain:

> verified during report period

while current Design 129 shows:

> missing today.

---

## Historical verification snapshot

Report should preserve:

* status relevant to period/finalization;
* verification method;
* verifiedAt;
* evidence reference.

Do not query today's current Verification and overwrite report semantics.

---

## ReportMetric

Conceptually:

```text id="r130a19"
ReportMetric
├── reportVersionId
├── metricDefinitionId
├── metricDefinitionVersion
├── scope
├── period
├── value?
├── availability
├── provenance summary
├── freshness-at-snapshot
├── aggregateCalculationVersion
└── source refs
```

---

## Availability is mandatory

ReportMetric must distinguish:

```text id="r130a20"
AVAILABLE(value=0)
UNAVAILABLE
PARTIAL
ESTIMATED
```

according to metric semantics.

---

## ReportMetric ≠ free-text number

A number shown in PDF must have semantic lineage.

---

## Narrative

Human-written/generated narrative may explain the report.

Narrative ≠ Metric truth.

Example:

> LinkedIn performed strongly.

This is interpretation.

The numeric metric evidence remains canonical separately.

---

## Narrative generation

If AI or templates later assist narrative generation:

generated text must reference authorized frozen snapshot data.

It must never invent missing metrics.

Do not introduce AI architecture here unless already part of platform services.

---

## GeneratedReportArtifact

Exact report binary.

Conceptually:

```text id="r130a21"
GeneratedReportArtifact
├── reportVersionId
├── assetId
├── fileVersionId
├── format
├── generatedAt
├── renderingEngineVersion
├── checksum
└── lifecycle
```

Physical binary remains Design-030 Asset/FileVersion.

---

## Rendering engine version

Useful for reproducibility if layout/rendering matters.

Not mandatory in visible UI.

---

## ReportVersion fingerprint/checksum

Strongly useful when reports are formally delivered.

Allows:

> prove the bytes the Client received.

Do not duplicate FileVersion checksum unnecessarily; reference it.

---

## ReportApproval

If formal approval required:

reuse canonical:

```text id="r130a22"
ApprovalRequest
subject = ReportVersion RV-3
```

Do not create:

```text id="r130a23"
report.approved = true
```

as separate truth.

---

## Review ≠ Approval

Permanent.

Comments/review can occur without formal release authorization.

---

## Approval exact Version

Absolute.

Approving RV-3 never approves later RV-4.

---

## ReportRelease

A first-class release relation/event may be useful.

Conceptually:

```text id="r130a24"
ReportRelease
├── id
├── reportVersionId
├── clientRelationshipId
├── releasedBy
├── releasedAt
├── releaseChannel
├── exactArtifactFileVersionId
└── revision
```

---

## ReportRelease ≠ File access broadly

Release may create Client access to exact ReportVersion artifact.

It should not grant access to all report drafts/source datasets.

---

## ClientReportAccess

Align with Design 056/051-style exact access controls.

---

## ClientDownloadEvent

If tracked:

```text id="r130a25"
ClientDownloadEvent
├── reportReleaseId
├── portalMembershipId
├── exactFileVersionId
├── downloadedAt
└── evidence
```

Download remains transport evidence only.

---

## Correction / revised report

If v3 contained a genuine error:

correct:

```text id="r130a26"
Report DR-20
v3 RELEASED
v4 CORRECTED / RELEASED
supersedes v3
```

Do not modify v3.

---

## Superseded ≠ deleted

Absolute.

---

## Report amendment reason

Strongly recommended when released reports are corrected.

---

# 4. Permissions

Design 130 should conceptually distinguish:

```text id="r130a27"
distributionReport.read
distributionReport.create
distributionReport.editDraft
distributionReport.finalize

distributionReport.approve
distributionReport.release
distributionReport.supersede

distributionReport.viewSnapshot
distributionReport.export
distributionReport.downloadArtifact

distributionReport.readSensitiveMetrics
```

Exact permission identifiers belong to Phase 3D.

---

## Performance read ≠ Report draft edit

Permanent.

---

## Report edit ≠ finalize

Permanent.

---

## Finalize ≠ approve

Critical.

---

## Approve ≠ release

Permanent.

A manager may approve a report while another authorized user releases it to the Client.

---

## Release ≠ Client Portal administration

Permanent.

---

## Read Report ≠ view raw snapshot evidence

Potentially sensitive provider/source metrics can require stronger access.

---

## Report read ≠ raw provider data read

Permanent.

---

## Report release ≠ MetricDefinition administration

Absolute.

---

## Report creator ≠ metric authority

Critical.

A report author cannot redefine:

> engagement rate

inside the report.

---

## Manual narrative edit ≠ Metric correction

Permanent.

---

## Report correction ≠ source metric correction

Critical.

If report narrative is wrong, create new ReportVersion.

If source metric evidence is wrong, correct the metric evidence in Design 129/Metric domain first, then deliberately create/revise report.

---

## Client Portal membership ≠ access to every report

Client report access should be:

* organization-scoped;
* Project/Campaign/report-scoped;
* explicit where required.

---

## Client cannot open internal draft reports

Absolute.

---

## Client cannot view unreleased ReportVersion by direct ID

Absolute.

---

## Direct Report/Version/Artifact IDs reauthorize

Permanent.

---

## Cross-tenant report composition prohibited

Absolute.

Campaign, Placements, metrics, Client, ReportVersion, and artifact must belong to authorized tenant/context.

---

# 5. States

Design 130 must keep **Report lifecycle, ReportVersion lifecycle, dataset snapshot state, approval state, release state, artifact state, client access, download state, and current analytics state** independent.

### Report lifecycle

Conceptually:

```text id="r130a28"
Draft
In Preparation
Active
Completed / Historical
```

### ReportVersion

```text id="r130a29"
Draft
Ready for Review
Finalized
Approval Pending
Approved
Released
Superseded
Withdrawn
```

Exact taxonomy Phase 3D.

### Snapshot

```text id="r130a30"
Not Created
Building
Ready
Partial
Failed
Stale-to-Live-Data
```

### Approval

Owned by canonical Approval engine.

### Release

```text id="r130a31"
Not Released
Released
Superseded
Withdrawn
```

### Artifact

```text id="r130a32"
Not Generated
Generating
Generated
Failed
Superseded
```

These must never collapse into one generic `report.status`.

---

## Dataset snapshot ready ≠ Report finalized

Permanent.

---

## Report finalized ≠ Approved

Absolute.

---

## Approved ≠ Released

Absolute.

---

## Released ≠ Downloaded

Absolute.

---

## Downloaded ≠ Acknowledged

Permanent.

---

## New live metrics ≠ Report stale/error

Critical.

A finalized historical report does not become invalid merely because live analytics changed.

Correct:

> Report is frozen for Aug 1–31.

---

## Live data changed ≠ ReportVersion changes

Absolute.

---

## Source metric corrected later ≠ released Report silently corrected

Absolute.

---

## Released v3 ≠ latest draft v4

Permanent.

---

## Superseded v3 ≠ deleted v3

Absolute.

---

## Artifact generated ≠ report approved

Permanent.

---

## PDF creation failure ≠ Dataset invalid

Permanent.

A rendering failure is not a metric/report-data failure.

---

## Snapshot partial ≠ zero performance

Absolute.

---

## Missing metric ≠ zero

Absolute.

---

## Stale-at-snapshot ≠ unavailable necessarily

Permanent.

If policy allows stale data:

report should retain the value **and its freshness qualification**.

---

## Client access revoked ≠ Report deleted

Permanent.

---

## Report withdrawn ≠ source Distribution history deleted

Absolute.

---

## State Coverage

Design 130 inherits Design 150 plus:

```text id="r130a33"
Distribution Report Loading
Distribution Report Available
Distribution Report Restricted
Distribution Report Partial
Distribution Report Unavailable

Report Draft
Report In Preparation
Report Finalized
Report Approval Pending
Report Approved
Report Released
Report Superseded
Report Withdrawn

Snapshot Not Created
Snapshot Building
Snapshot Ready
Snapshot Partial
Snapshot Failed

Reporting Period Valid
Reporting Period Incomplete
Reporting Period Locked
Reporting Period Conflict

Placement Evidence Complete
Placement Evidence Partial
Placement Evidence Unavailable

Verification Evidence Complete
Verification Evidence Partial
Verification Evidence Unavailable

Metric Available
Metric Zero
Metric Partial
Metric Unavailable
Metric Stale
Metric Estimated
Metric Manual

Artifact Not Generated
Artifact Generating
Artifact Generated
Artifact Generation Failed
Artifact Superseded

Approval Not Required
Approval Pending
Approval Approved
Approval Rejected
Approval State Unavailable

Report Not Released
Report Released
Report Release Failed
Report Release Outcome Unknown
Report Superseded

Client Access Active
Client Access Restricted
Client Access Revoked
Client Access State Unknown

Client Not Downloaded
Client Downloaded
Download State Unknown

New Live Performance Available
Source Metric Corrected After Snapshot
New Report Version Available

Report Updated Elsewhere
Snapshot Updated Elsewhere
Approval Updated Elsewhere
Artifact Updated Elsewhere
Release Updated Elsewhere
Report Conflict
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **report version, reporting period, frozen evidence status, major client metrics, approval/release state, and exact generated artifact**.

Conceptually:

```text id="r130a34"
Final Distribution Report
↓
Client / Campaign / Reporting Period
↓
Report Version
↓
Snapshot status
↓
Performance summary
↓
Placements / verification
↓
Narrative / insights
↓
Approval
↓
Generated artifact
↓
Release / client delivery
↓
Version history
```

Only sections actually present in frozen Design 130 should render.

---

## Version identity must remain obvious

Correct:

> Report v3 · Released

and:

> v4 Draft available

not one generic:

> Latest Report.

---

## Reporting period should remain prominent

Example:

> Aug 1–Aug 31, 2026 · Europe/Berlin

without ambiguity.

---

## Live metrics and frozen report metrics must look distinct

Where live data is shown as context:

> Report value: 12,940
> Current live value: 14,200

This can be useful.

But the distinction must be explicit.

---

## Unavailable metrics must remain honest

Correct:

> Newsletter click data unavailable for 2 of 4 Placements.

Not:

> 0 clicks.

---

## Partial data should be visually qualified

Example:

> Impressions: 42,300
> Data completeness: 87% of included required Placements

only if a canonical completeness measure exists.

Do not invent percentages ad hoc.

---

## Provenance/freshness should remain inspectable

Especially for:

* Estimated;
* Manual;
* Stale;
* Partial values.

---

## Approval and release states must look separate

Correct:

> Approved Aug 2
> Released Aug 3

not one:

> Completed.

---

## Released artifact identity

Where useful:

> Client Performance Report v3.pdf
> FileVersion FV-8

The exact artifact should remain traceable.

---

## Corrected versions

Where v4 supersedes v3:

show clear lineage:

> v4 supersedes v3

without removing v3 from history.

---

## Tablet

Following Design 152:

* Report/version/period summary remains first;
* KPI/report sections stack;
* Placement evidence collapses;
* approval/release state remains visible;
* download/artifact details become compact.

---

## Mobile

Priority:

```text id="r130a35"
Report title
↓
Version
↓
Reporting period
↓
Released / Approval state
↓
Key frozen metrics
↓
Data quality / unavailable metrics
↓
Placements / verification summary
↓
Artifact / download
↓
Version history
```

Do not compress a desktop reporting grid into tiny columns.

---

## Mobile data-quality semantics

Example:

> Impressions
> 42,300
> Provider reported
> Frozen Sep 1

or:

> Clicks
> Partial
> Data unavailable from 1 channel

---

## Accessibility

A report summary could communicate:

> Distribution Report DR-20, version 3, covers August 1 through August 31. It was finalized on September 1 and approved on September 2. The report includes three verified Placements. Total provider-reported impressions were 42,300. Newsletter click data was unavailable and is not represented as zero. Report version 3 was released to the Client as PDF FileVersion FV-8 on September 3.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Distribution Report architecture

```text id="r130a36"
Design 130
    ↓
Authenticated Workspace Context
    ↓
DistributionReportQueryService
    │
    ├── ReportAdapter
    ├── ReportVersionAdapter
    ├── CampaignVersionAdapter
    ├── PlacementAdapter
    ├── VerificationAdapter
    ├── MetricRegistryAdapter
    ├── ReportSnapshotAdapter
    ├── ApprovalAdapter
    ├── ArtifactAdapter
    └── Release/ClientAccessAdapter
    ↓
DistributionReportView
```

All report semantics must reuse the general Reporting foundation.

---

## Report creation

Conceptually:

```text id="r130a37"
createDistributionReport(
    distributionCampaignId,
    clientRelationshipId?,
    reportingPeriod,
    timezone,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. validate Campaign;
3. validate Client context;
4. validate period;
5. create stable DistributionReport;
6. create initial Draft ReportVersion;
7. emit Audit/outbox.

---

## Creation idempotency

Critical.

Repeated requests cannot create duplicate report identities for one explicit creation intent.

Do not over-dedupe legitimately different reports/periods.

---

## Reporting-period validation

Must validate:

* start < end;
* timezone;
* campaign/time relationship where applicable;
* allowed future/incomplete period policy.

---

## Period semantics

Store exact inclusive/exclusive conventions centrally.

Example:

```text id="r130a38"
[startInstant, endInstant)
```

or equivalent.

Do not let each metric adapter interpret end dates differently.

---

## Snapshot build

Conceptually:

```text id="r130a39"
buildDistributionReportSnapshot(
    reportVersionId,
    expectedReportVersionRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. lock/pin reporting period;
3. resolve exact CampaignVersion;
4. resolve included Placements;
5. resolve period-relevant verification evidence;
6. resolve metric-definition versions;
7. query exact observations/aggregates;
8. preserve zero/unavailable/partial/provenance;
9. capture source revision manifest;
10. create immutable/rebuildable snapshot;
11. emit status/Audit where appropriate.

---

## Snapshot building must be deterministic

Given:

* same CampaignVersion;
* same source evidence set;
* same metric definitions/calculation versions;
* same reporting period;

the snapshot should be reproducible.

---

## Snapshot ≠ live query cache

Absolute.

It is an explicit historical report input.

---

## Snapshot versioning

If source evidence changes before report finalization:

draft report may rebuild into a **new snapshot revision/version**.

Once finalized/released:

do not mutate the snapshot behind the ReportVersion.

---

## Freeze on finalization

Strong pattern:

```text id="r130a40"
Draft RV-3
    ↓
Snapshot DS-8
    ↓
finalize
    ↓
RV-3 permanently pins DS-8
```

---

## Finalization command

Conceptually:

```text id="r130a41"
finalizeDistributionReportVersion(
    reportVersionId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate snapshot complete/allowed partial policy;
3. validate required narrative/sections if any;
4. pin exact DatasetSnapshot;
5. freeze content/configuration;
6. change ReportVersion lifecycle;
7. emit Audit/outbox.

---

## Finalization ≠ approval

Absolute.

---

## Approval

Where required:

```text id="r130a42"
ApprovalRequest
subject = ReportVersion RV-3
```

using Design 029/115.

Approval exact version only.

---

## Approval stale-version protection

If RV-4 is created while RV-3 approval is pending:

approval remains about RV-3.

Do not move Approval automatically to v4.

---

## Rejected report version

Rejection does not delete it.

A new draft/revised version can be created.

---

## Artifact generation

Conceptually:

```text id="r130a43"
renderReportArtifact(
    reportVersionId,
    format,
    idempotencyKey
)
```

must use:

* immutable ReportVersion;
* frozen DatasetSnapshot;
* pinned layout/template version;
* canonical metric formatting.

---

## Rendering does not query live metrics

Absolute.

This is a critical implementation safeguard.

---

## Report template version

If report layout/template is versioned:

pin exact TemplateVersion used to render.

Do not let a redesigned template silently change an already finalized artifact.

---

## Generated artifact

Store through Design 030:

```text id="r130a44"
Asset
  ↓
FileVersion
```

with checksum/integrity evidence.

---

## Rendering idempotency

Repeated render request for same ReportVersion/render configuration should not create uncontrolled duplicates.

But if a new renderer/template legitimately creates different output bytes, preserve a new FileVersion.

---

## Artifact verification

Before release:

ensure generated file:

* exists;
* passes file-processing/security;
* corresponds to exact ReportVersion;
* is not quarantined.

---

## Approval-after-artifact vs artifact-after-approval

Phase 3D should define policy.

Possible patterns:

### A

Finalize data/content → approve ReportVersion → render exact approved artifact.

### B

Render exact artifact → approve exact ReportVersion/artifact.

The invariant:

> approval and release must refer to the exact version/artifact that the Client receives.

---

## Release command

Conceptually:

```text id="r130a45"
releaseDistributionReport(
    reportVersionId,
    exactArtifactFileVersionId,
    clientRelationshipId,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. verify ReportVersion released-eligible;
3. verify required Approval;
4. verify exact artifact belongs to that Version;
5. create exact Client report access;
6. create immutable ReportRelease;
7. emit notification/outbox;
8. invalidate Client report projections.

---

## Release idempotency

Critical.

Repeated network calls must not create multiple releases/access rows/notifications for the same release intent.

---

## Release outcome unknown

If release transaction may have committed but response is lost:

reconcile by idempotency key.

Do not release a second time blindly.

---

## Client access

Design 056 should query exact:

```text id="r130a46"
ReportRelease
→ ReportVersion
→ FileVersion
```

No "current latest report" pointer for historical downloads unless explicitly resolved by safe projection.

---

## Client download security

On download:

```text id="r130a47"
authenticate Portal user
↓
authorize ClientOrganization
↓
authorize ReportRelease
↓
authorize exact FileVersion
↓
generate short-lived URL
```

---

## Signed URL ≠ ReportRelease

Permanent.

---

## Download event

Record after valid access/download according to platform evidence policy.

Do not treat signed URL generation as completed download.

---

## Corrected report workflow

If released RV-3 is corrected:

```text id="r130a48"
createReportVersion RV-4
        ↓
new snapshot DS-9
        ↓
finalize
        ↓
approve
        ↓
render FV-10
        ↓
release
        ↓
supersedes RV-3
```

RV-3 remains accessible/historical according to policy.

---

## Supersession should be explicit

Store:

```text id="r130a49"
RV-4.supersedesVersionId = RV-3
```

or equivalent relation.

---

## Supersession does not delete old ClientDownload history

Absolute.

---

## Withdrawal

If an erroneous report must be withdrawn:

withdrawal should be explicit.

It must not delete:

* RV-3;
* prior downloads;
* Audit evidence.

---

## Withdrawal ≠ source Campaign deletion

Absolute.

---

## Source metric correction after release

Correct sequence:

```text id="r130a50"
MetricObservation correction
      ↓
Design 129 live values update
      ↓
Report v3 remains frozen
      ↓
if needed:
create v4 corrected report
```

---

## Report snapshot data quality

The snapshot should carry at least:

* completeness;
* unavailable sources;
* stale sources;
* provenance mix;

where material.

Do not hide missing data.

---

## Partial snapshot policy

Some reports may permit release with partial metrics.

If so:

* requirement must be explicit;
* unavailable fields stay unavailable;
* narrative/footnote can explain.

Do not backfill zeros.

---

## Verification-period semantics

If Placement was:

```text id="r130a51"
VERIFIED Aug 10
MISSING Sep 5
```

for August report:

the snapshot can preserve the August relevant verified state.

Current missing state should not retroactively invalidate August report automatically.

---

## Placement inclusion rules

Centralize:

```text id="r130a52"
DistributionReportPlacementEligibilityResolver
```

or reporting query policy.

Avoid manually selecting arbitrary unverified Placements unless report semantics explicitly allow them.

---

## Metric inclusion rules

Report Builder/Version configuration should select metrics through canonical MetricDefinition IDs.

Do not store labels only.

---

## Narrative metrics interpolation

If report narrative says:

> 42,300 impressions

that number should be resolved from frozen ReportMetric/Snapshot data, not copied manually without linkage where possible.

---

## Generated visuals/charts

If report artifact includes charts:

they should use the frozen dataset.

Do not call live Analytics APIs during PDF rendering.

---

## Chart labels/formats

Use MetricDefinition unit/formatting.

Do not hand-format percentages/currency inconsistently.

---

## Design 131 integration

Reporting Library should list this same DistributionReport/ReportVersion.

---

## Design 132 integration

Report Detail / Interactive Report should use same ReportVersion/Snapshot backend.

---

## Design 133 integration

Report Builder config creates/revises ReportVersion configuration rather than bypassing snapshot semantics.

---

## Design 134 integration

Scheduled Reports create future report-generation intents, not mutate Design 130 released reports.

---

## Design 056 integration

Client Reports & Downloads consumes released Versions/artifacts.

---

## Design 121 Final Handover integration

If a final report is included in Handover:

HandoverItem pins the exact released/report artifact FileVersion.

Do not use "latest Report".

---

## Renewal integration

Design 057 may use:

* final report;
* performance outcomes;

as commercial context.

It never modifies the report.

---

## Activity

Design 119 may project:

```text id="r130a53"
DistributionReportCreated
ReportVersionFinalized
ReportApproved
ReportReleased
ReportSuperseded
ReportWithdrawn
```

Activity remains projection.

---

## Audit

Strong Audit for:

* report creation;
* snapshot build/freeze;
* finalization;
* approval;
* manual metrics included;
* release;
* supersession;
* withdrawal;
* sensitive exports/download administration.

---

## Notification

Design 080 may notify:

> Final Distribution Report available.

Notification delivery/read state never changes ReportRelease.

---

## Search

Design 079 may index:

* Report title;
* Client;
* Campaign;
* period;
* released Version.

Do not index:

* raw provider evidence;
* sensitive metrics beyond permission policy.

---

## Idempotency

Required for:

* report creation;
* Version creation;
* snapshot build;
* finalization;
* artifact rendering;
* release;
* supersession/withdrawal commands.

---

## Optimistic concurrency

Critical races:

### Two users edit same draft Version

Use expected Version revision.

### Snapshot rebuild while another user finalizes

Finalization pins one exact completed snapshot revision.

### Approval completes while v4 is created

Approval remains on v3.

### Release occurs while artifact regenerates

Release command pins exact FileVersion.

---

## Caching

Report caches should vary by:

```text id="r130a54"
organizationMembershipId
authorizationRevision
reportId
reportVersionId
reportVersionRevision
datasetSnapshotId/revision
approvalRevision
artifactFileVersionId
releaseRevision
clientAccessRevision
```

Released immutable versions can be cached strongly.

---

## Permission cache invalidation

Client downloads still require fresh authorization.

Strong artifact/report caching must not bypass revoked Portal access.

---

## Performance

Use:

* frozen snapshots;
* precomputed report metrics;
* pre-rendered artifacts;
* lazy source-evidence drill-in;
* immutable Version caching.

Avoid rebuilding metric aggregates every time a finalized report opens.

---

## Large report snapshot

Store structured source references/aggregates efficiently.

Do not duplicate every raw provider payload into the snapshot.

---

## Reproducibility

The system should be able to answer:

```text id="r130a55"
Which CampaignVersion?
Which Placements?
Which Verification evidence?
Which MetricDefinition versions?
Which metric observations/aggregates?
Which period?
Which report template?
Which generated FileVersion?
Which Approval?
Which Release?
```

for any released ReportVersion.

---

## Partial failure contract

Example:

```text id="r130a56"
Report Version        ✓
Snapshot              ✓
Metrics               ✓
Artifact              ✓
Approval service      ✕
```

Correct:

> Report content is finalized; current Approval state cannot be verified, so release remains unavailable/unknown.

Incorrect:

> Approved.

Another:

```text id="r130a57"
Released Report v3    ✓
Live metrics service  ✕
```

Correct:

> Released Report v3 remains fully available from its frozen snapshot.

Not:

> Report unavailable.

Another:

```text id="r130a58"
Snapshot:
LinkedIn metrics      ✓
Newsletter metrics    ✕
Partner metrics       ✓
```

Correct:

> Snapshot is partial; Newsletter metrics were unavailable for this report period.

Not:

> Newsletter = 0.

Another:

```text id="r130a59"
ReportVersion v3      ✓
Artifact render       ✕
```

Correct:

> Report data/version is finalized, but the downloadable artifact has not been generated successfully.

Not:

> Report data failed.

---

## Backend Requirement Matrix

| Requirement                                            | Status                             |
| ------------------------------------------------------ | ---------------------------------- |
| Design 032 canonical Distribution reuse                | **Critical**                       |
| Designs 127–129 exact Campaign/Placement/Metric reuse  | **Critical**                       |
| Design 033 canonical Reporting semantics reuse         | **Critical**                       |
| No live-dashboard-as-final-report implementation       | **Critical**                       |
| DistributionReport/DistributionCampaign separation     | **Critical**                       |
| Report/ReportVersion separation                        | **Critical**                       |
| ReportVersion/DatasetSnapshot separation               | **Critical**                       |
| Snapshot/live analytics separation                     | **Critical**                       |
| ReportMetric/MetricAggregate separation                | **Critical**                       |
| Design 038 Metric Registry reuse                       | **Critical**                       |
| Metric-definition/calculation version pinning          | **Critical**                       |
| Reporting period explicit + timezone-safe              | **Critical**                       |
| Exact CampaignVersion pinning                          | **Critical**                       |
| Exact Placement inclusion                              | **Critical**                       |
| Historical Verification evidence pinning               | **Critical**                       |
| Exact contributing observations/aggregates             | **Critical**                       |
| Zero/unavailable/partial distinction                   | **Critical**                       |
| Provenance/freshness retained in snapshot              | **Critical**                       |
| Snapshot reproducibility                               | **Critical**                       |
| Draft snapshot rebuild/finalized snapshot immutability | **Critical**                       |
| Finalized ReportVersion immutability                   | **Critical**                       |
| Approval exact ReportVersion                           | **Critical where Approval exists** |
| Review/Approval separation                             | **Critical**                       |
| Finalize/Approve/Release separation                    | **Critical**                       |
| Generated artifact/ReportVersion separation            | **Critical**                       |
| Design 030 Asset/FileVersion reuse                     | **Critical**                       |
| Rendering from frozen snapshot only                    | **Critical**                       |
| Report template/layout version pinning                 | **Critical where templated**       |
| Exact artifact release                                 | **Critical**                       |
| ReportRelease/ClientDownload separation                | **Critical**                       |
| Client access exact Version/FileVersion                | **Critical**                       |
| Signed URL/access-policy separation                    | **Critical**                       |
| Superseding report preserves older Version             | **Critical**                       |
| Metric correction does not rewrite released report     | **Critical**                       |
| Withdrawal does not delete history                     | **Critical if withdrawal exists**  |
| Design 056 client report reuse                         | **Critical**                       |
| Design 073 client Distribution separation              | **Critical**                       |
| Design 121 Handover exact artifact reuse               | **Critical architecture**          |
| Designs 131–134 reporting reuse                        | **Critical architecture**          |
| Cross-tenant snapshot/report composition prohibited    | **Critical**                       |
| Report export/release separate permissions             | **Critical**                       |
| Idempotency                                            | **Critical**                       |
| Optimistic concurrency                                 | **Critical**                       |
| Audit/outbox integration                               | **Required**                       |
| Partial dependency failure handling                    | **Critical**                       |

---

# 8. Consolidation

Design 130 creates a major implementation risk if “Final Report” is implemented as **“render the current analytics page to PDF.”**

That would destroy historical reproducibility.

**DistributionReport / DistributionCampaign conflation**
Campaign lifecycle becomes reporting lifecycle.

**Report / ReportVersion conflation**
Corrections overwrite previously released Client reports.

**ReportVersion / DatasetSnapshot conflation**
Content/layout and frozen evidence become one opaque blob.

**DatasetSnapshot / live Design-129 query conflation**
Old reports change whenever provider metrics update.

**Current aggregate / frozen ReportMetric conflation**
Released numbers drift.

**MetricObservation / ReportMetric conflation**
Raw evidence and client-facing value merge.

**MetricDefinition / Report label conflation**
Changing display text changes metric meaning.

**MetricDefinition current version / historical calculation version conflation**
Old report is recalculated with new formula.

**Reporting period / generated date conflation**
Report generated Sep 1 is incorrectly treated as Sep 1 performance.

**Reporting period / provider observation time conflation**
Delayed provider data enters wrong period.

**Current Placement verification / period-relevant verification conflation**
Placement missing today invalidates valid past report.

**Historical Placement / current Placement conflation**
Corrective placements rewrite earlier reporting.

**New PublicationVersion / report source conflation**
Source update changes old Distribution report.

**New CampaignVersion / report campaign scope conflation**
Draft campaign plan modifies historical report.

**Current live metric / report snapshot conflation**
Client sees different number every time PDF reopens.

**Current dashboard chart / final report chart conflation**
Visuals change after release.

**ReportSnapshot / arbitrary JSON export conflation**
No semantic provenance/reproducibility.

**ReportMetric `0` / unavailable conflation**
Missing provider data looks like failure.

**Stale / current conflation**
Old data appears fresh in report.

**Estimated / provider-reported conflation**
Evidence quality is hidden.

**Manual / provider metric conflation**
Human-entered numbers look external.

**Partial data / complete report conflation**
Missing channels are hidden.

**Report narrative / metric truth conflation**
Free text becomes number authority.

**AI/generated narrative / evidence conflation**
Generated prose invents unsupported claims.

**Finalized / Approved conflation**
Author can bypass Approval.

**Approved / Released conflation**
Internal approval automatically exposes report externally.

**Released / Downloaded conflation**
Client receipt is inferred incorrectly.

**Download / Acknowledgement conflation**
Transport event becomes acceptance.

**ReportRelease / FinalHandover conflation**
Performance report and final-delivery package merge.

**Generated artifact / ReportVersion conflation**
PDF becomes report business identity.

**Regenerate PDF / overwrite artifact conflation**
Original bytes delivered to Client disappear.

**Report artifact / source snapshot conflation**
Cannot inspect/rebuild calculations.

**Report approval / artifact approval conflation**
Approval may apply to wrong rendered bytes/version.

**Approval v3 / v4 conflation**
New draft inherits old approval.

**Superseded / deleted conflation**
Client history disappears.

**Correction / edit released v3 conflation**
Cannot prove what Client originally received.

**Metric correction / report correction conflation**
Underlying data fix silently rewrites released PDF.

**Withdrawal / delete conflation**
Evidence/history disappears.

**Client access revoked / Report deleted conflation**
Business report history is lost.

**Client Reports / Team Report duplication**
Design 056 and 130 show different versions/files.

**Report Library / Distribution Report duplication**
Design 131 gets separate identity.

**Report Detail / Distribution Report duplication**
Design 132 recalculates data independently.

**Report Builder / Report Version conflation**
Design 133 configuration changes released reports.

**Scheduled Reports / released report conflation**
Design 134 overwrites prior version each cycle.

**Live Analytics / Final Report conflation**
Design 129 and 130 become same screen/backend.

**Final Report / Client Distribution live page conflation**
Design 073 current metrics are treated as formal report.

**Report metric formula / analytics metric formula conflation failure**
Two different formulas produce different client numbers.

**PDF generation failure / report data failure conflation**
Good report data is discarded.

**Approval service unavailable / approval rejected conflation**
Infrastructure issue appears as business rejection.

**Live analytics unavailable / released report unavailable conflation**
Historical artifact wrongly disappears.

**Signed URL / Report access conflation**
Expired URL looks like revoked Client entitlement.

**Signed URL / report identity conflation**
Temporary token becomes historical reference.

**Generic `final_report_url` field**
No ReportVersion, snapshot, artifact, approval, or release lineage.

**Generic `report_data JSON`**
No metric definitions/period/provenance/source evidence.

**Generic `isFinal=true`**
No immutable version semantics.

**Generic report mega-PATCH**
Snapshot, narrative, approval, release, artifact and Client access mutate together.

**130/033 duplicate Reporting backend**
General Reporting and Distribution Reporting diverge.

**130/038 duplicate Metric definitions**
Report formulas differ from analytics.

**130/056 duplicate Client Report library**
Client and internal versions diverge.

**130/073 duplicate Client performance truth**
Live client data and frozen report become indistinguishable.

**130/121 duplicate Final Handover**
Report release becomes handover state.

**130/129 duplicate performance store**
Report copies live metrics as new truth.

**130/131 duplicate Report identity**
Reporting Library cannot manage same report.

**130/132 duplicate Report detail**
Two version histories appear.

**130/133 duplicate report configuration**
Builder edits released report.

**130/134 duplicate report-generation lifecycle**
Scheduled reports bypass version/snapshot semantics.

No additional screen is required.

These are **frozen-report identity, versioning, dataset snapshotting, reporting-period semantics, exact MetricDefinition/Placement/Verification provenance, approval/release separation, exact generated artifacts, Client access, supersession, and live-vs-final-report boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL FROZEN DISTRIBUTION OUTCOME, CLIENT PERFORMANCE REPORT-VERSION & RELEASE ANCHOR**

**Domain directive:**
**DistributionCampaign ≠ DistributionCampaignVersion ≠ Placement ≠ PlacementVerification ≠ MetricObservation ≠ MetricAggregate ≠ PerformanceSnapshot ≠ DistributionReport ≠ DistributionReportVersion ≠ ReportDatasetSnapshot ≠ ReportMetric ≠ GeneratedReportArtifact ≠ ReportApproval ≠ ReportRelease ≠ ClientDownload ≠ LiveAnalytics.**

**Foundation directive:**
Design 032 remains canonical Distribution foundation, Designs 127–129 remain Campaign/Placement/Verification/Performance authority, and Design 033 remains canonical Reporting foundation. Design 130 composes those domains rather than duplicating them.

**Report directive:**
`DistributionReport` is a stable logical client-report identity. `DistributionReportVersion` is one exact version of that report.

**Version directive:**
draft, finalized, approved, released, superseded and newer ReportVersions remain independently addressable. Released v3 is never overwritten because v4 exists.

**Snapshot directive:**
every finalized ReportVersion pins an exact immutable `ReportDatasetSnapshot` containing the evidence necessary to reproduce its figures.

**Live-analytics directive:**
Design 129 remains current/live performance authority. Design 130 never renders released reports directly from current Design-129 queries.

**Period directive:**
every report pins an explicit reporting period and timezone with centrally defined interval semantics.

**Campaign directive:**
ReportVersion pins the exact DistributionCampaignVersion represented in the report. Later campaign-plan changes do not alter historical reports.

**Placement directive:**
the report snapshot identifies the exact Placements included during the reporting period. Later Placement replacement/disappearance does not silently rewrite that inclusion history.

**Verification directive:**
period-relevant Placement verification evidence is frozen/referenced explicitly. Current Verification state may differ later without invalidating historical report evidence automatically.

**Metric-registry directive:**
Design 038's Metric Registry remains the sole authority for metric definitions, units, compatibility and calculation semantics.

**Metric-version directive:**
report snapshots preserve the exact MetricDefinition/calculation versions used so formula changes cannot retroactively alter released figures.

**Observation directive:**
reportable metrics remain traceable to exact MetricObservations and/or canonical frozen aggregates with source/provenance/period lineage.

**Availability directive:**
`0`, `Unavailable`, `Partial`, `Stale`, `Estimated`, and `Manual` remain distinct in report data as well as live analytics.

**No-zero-fill directive:**
missing provider data is never converted into zero for visual cleanliness or report completion.

**Provenance directive:**
provider-reported, verified, estimated, derived and manual values retain evidence-quality provenance through snapshot and report rendering.

**Completeness directive:**
partial report data is explicitly represented according to policy rather than silently presented as complete campaign performance.

**Narrative directive:**
human or generated narrative is interpretation over frozen report evidence. It can never substitute for or invent numeric metric truth.

**Freeze directive:**
after finalization, the ReportVersion's dataset, narrative/configuration, metric-selection semantics and snapshot linkage become immutable.

**Approval directive:**
formal report approval uses the canonical Approval engine against the exact ReportVersion and never a generic `approved=true` flag.

**Version-approval directive:**
Approval for RV-3 never transfers automatically to RV-4.

**Finalize/approve/release directive:**
Finalized, Approved, and Released remain three different governed facts.

**Artifact directive:**
the downloadable PDF/document is an exact Design-030 Asset/FileVersion generated from the frozen ReportVersion/Snapshot. The binary artifact never becomes the report's sole business identity.

**Rendering directive:**
report rendering uses only the frozen ReportVersion/DatasetSnapshot and pinned report-template/layout version. It never pulls today's live metrics during PDF generation.

**Artifact-integrity directive:**
released report artifacts preserve exact FileVersion/checksum lineage so the platform can prove which bytes the Client received.

**Release directive:**
`ReportRelease` explicitly records which exact ReportVersion/FileVersion was released to which Client context, by whom, and when.

**Client-access directive:**
Design 056 consumes released ReportVersion/Artifact access through the same canonical report/file access infrastructure. Internal Draft versions remain inaccessible to Client users.

**Download directive:**
Client download is transport evidence only and remains distinct from ReportRelease or acknowledgement.

**Signed-URL directive:**
short-lived signed download URLs are transport credentials, never durable ReportRelease or artifact identity.

**Correction directive:**
if a released report is wrong, source evidence is corrected in its canonical domain and a new ReportVersion/Snapshot is created deliberately. Released v3 is never silently rewritten.

**Supersession directive:**
v4 may supersede v3 while preserving v3, its Approval, artifact, Client releases and download history.

**Withdrawal directive:**
if report withdrawal exists, it is a governed release-state action and never destroys historical ReportVersion/source evidence.

**Source-correction directive:**
later metric/Placement/verification corrections update live Design-129 truth but do not automatically mutate finalized report snapshots.

**Handover directive:**
Design 121 may include an exact Report FileVersion as a HandoverItem, but ReportRelease and FinalHandover remain separate domains.

**Library directive:**
Design 131 must list these exact canonical Reports/ReportVersions; it cannot create another report library identity.

**Detail directive:**
Design 132 must open these exact ReportVersion/Snapshot records and never recompute a different report from live data.

**Builder directive:**
Design 133 must configure Draft ReportVersions/templates/metric selections while preserving frozen finalized versions.

**Scheduled-report directive:**
Design 134 creates recurring/future report-generation intents that produce new ReportVersions; it never overwrites a previously released report.

**Client-distribution directive:**
Design 073 remains a live/current Client Distribution projection and cannot be treated as the authoritative frozen Final Report.

**Renewal directive:**
final report outcomes can be used as commercial context for Design 057 without altering the report or automatically creating renewal records.

**Authorization directive:**
report read, Draft edit, finalization, Approval, release, snapshot evidence, sensitive metrics, export and Client access remain independently server-authorized.

**Tenant directive:**
Campaign, Placements, MetricObservations, Snapshot, ReportVersion, ClientRelationship and generated artifacts remain strictly tenant-scoped.

**Idempotency directive:**
Report creation, Version creation, snapshot build, finalization, rendering, release, supersession and withdrawal are replay-safe.

**Concurrency directive:**
draft editing, snapshot rebuild, finalization, Approval and release use explicit revisions so a ReportVersion cannot be finalized against one dataset while another user changes it concurrently.

**Caching directive:**
released immutable ReportVersions, Snapshots and artifacts may be strongly cached; authorization and Client access remain freshly enforced.

**Partial-failure directive:**
live analytics, Approval, artifact rendering, Client access and reporting services can fail independently. A finalized snapshot/report never becomes invalid merely because Design 129 live metrics are temporarily unavailable.

**Performance directive:**
released reports should render/open from frozen precomputed snapshots and artifacts rather than repeatedly recomputing raw Distribution metrics.

**Reproducibility directive:**
for every released ReportVersion the system must be able to reconstruct: exact CampaignVersion → exact Placement set → exact verification evidence → exact metric definitions/calculations → exact reporting period → exact snapshot → exact approved ReportVersion → exact generated FileVersion → exact Client release.

**Future-reuse directive:**
Design **131 — Reporting Library / Report Center** must become the canonical cross-domain report discovery/list surface over these same `Report`, `ReportVersion`, report-type, owner/client, period, approval, release, artifact and schedule identities. It must not create a separate library-only report entity or flatten every report type into one generic unversioned file row.

**Overlap directive:**
Designs **030, 033, 038, 056, 073, 121, 127–134** must preserve one continuous **canonical DistributionCampaignVersion → exact Placements/Verification → MetricObservations + MetricDefinition versions → frozen ReportDatasetSnapshot → immutable ReportVersion → canonical Approval → exact generated Asset/FileVersion → ReportRelease → client-safe access/download** lineage.

**Consolidation directive:**
**STANDARDIZE ONE FINAL DISTRIBUTION REPORT FOUNDATION — DESIGN-033 CANONICAL REPORT/REPORTVERSION SEMANTICS + DESIGN-127–129 EXACT CAMPAIGN/PLACEMENT/VERIFICATION INPUTS + DESIGN-038 METRIC-DEFINITION VERSIONING + EXPLICIT PERIOD/TIMEZONE + IMMUTABLE REPORT DATASET SNAPSHOTS + ZERO/UNAVAILABLE/PARTIAL/PROVENANCE/FRESHNESS PRESERVATION + FROZEN NARRATIVE/VISUAL CONFIG + EXACT DESIGN-030 GENERATED FILEVERSION + CANONICAL APPROVAL + EXPLICIT CLIENT REPORT RELEASE + VERSION SUPERSESSION WITHOUT HISTORY LOSS + DESIGN-056/131–134 SHARED REPORT IDENTITIES — AND NEVER ALLOW LIVE DASHBOARD QUERIES, GENERIC REPORT JSON, CURRENT METRICS, PDF URLS, `FINAL=true`, `APPROVED=true`, CLIENT DOWNLOADS, ZERO-FILLING OR REGENERATED “LATEST” FILES TO SUBSTITUTE FOR OR REWRITE CANONICAL SNAPSHOT, REPORTVERSION, ARTIFACT, APPROVAL OR CLIENT-RELEASE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **130 / 153** |
| **PASS**                                   |                        **130** |
| **STANDARDIZE decisions**                  |                        **128** |
| **Potential implementation-overlap flags** |                        **121** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**130 / 153 = 85.0% audited.**

### Canonical Final Distribution Report architecture after Design 130

```text id="r130a60"
Distribution Campaign DC-100
Campaign Version v2
        │
        ↓
Placements
P-10 / P-11 / P-12
        │
        ↓
Verification + Metric Observations
        │
        ↓
Design 129 Live Performance
        │
        ↓
Report Dataset Snapshot DS-8
        │
        ↓
Distribution Report DR-20
Report Version v3
        │
        ↓
Approval
        │
        ↓
Generated PDF FileVersion FV-8
        │
        ↓
Report Release RR-3
        │
        ↓
Client Reports & Downloads
```

The strongest reporting rule is now explicit:

```text id="r130a61"
September 1

Report v3 freezes:
Aug 1–Aug 31
Impressions = 42,300

September 5

Provider updates live analytics:
Impressions = 45,100

RESULT:

Design 129 live:
45,100

Report v3:
42,300

Both are correct.

v3 is NEVER rewritten.
```

Zero and unavailable semantics remain intact inside final client reports:

```text id="r130a62"
Clicks = 0
means:
provider measured zero.

        ≠

Clicks = Unavailable
means:
no trustworthy value available.

A final report must never
convert the second into the first.
```

Report approval and release remain separate:

```text id="r130a63"
Report v3 finalized
        ↓
Approved
        ↓
PDF generated
        ↓
Released to Client
        ↓
Client downloaded

These are five distinct facts.
```

Corrections preserve Client history:

```text id="r130a64"
Report v3
Released to Client

Later:
Metric correction discovered

Correct:
create Report v4
new Snapshot
new Approval
new Artifact
new Release

v3 remains preserved.

Incorrect:
edit v3 and replace its PDF.
```

And Design 130 now gives the platform a fully reproducible chain:

```text id="r130a65"
Campaign Version
      ↓
Placements
      ↓
Verification
      ↓
Metric Observations
      ↓
Metric Definitions
      ↓
Frozen Dataset Snapshot
      ↓
Report Version
      ↓
Approval
      ↓
Exact FileVersion
      ↓
Client Release
```

## Next Sequential Audit Target

### **Design 131 — Reporting Library / Report Center**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
