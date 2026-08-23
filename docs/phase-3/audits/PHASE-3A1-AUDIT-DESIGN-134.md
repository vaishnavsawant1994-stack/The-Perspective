# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 134 — Scheduled Reports / Report Delivery Management

Design 134 should become the **canonical Team Workspace recurring report-definition, relative-period resolution, scheduled generation-run, ReportVersion production, approval/release policy, recipient/delivery configuration, delivery-attempt, retry, and execution-history surface** built directly on the Reporting foundation established by **Design 033** and the Report/Builder architecture established by **Designs 131–133**.

Design 134 must **not turn a recurring schedule into a Report, overwrite one ReportVersion every cycle, or deliver whatever happens to be “latest” in the Builder**. A schedule is a durable future-generation definition. Each execution creates a separately traceable `ScheduledReportRun`, resolves an exact reporting period and exact configuration/template revision, builds a new canonical Report/ReportVersion/Snapshot/artifact according to policy, and then performs delivery through explicit recipient and delivery-attempt records.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Report ≠ ReportVersion ≠ ScheduledReportDefinition ≠ ScheduledReportDefinitionVersion ≠ ScheduledReportRun ≠ ReportingPeriodResolution ≠ ReportDatasetSnapshot ≠ GeneratedReportArtifact ≠ ReportRelease ≠ ReportRecipient ≠ DeliveryDestination ≠ ReportDeliveryAttempt ≠ Notification ≠ ClientDownload.**

The central implementation rule is:

> **A ScheduledReportDefinition describes future intent; a ScheduledReportRun records one concrete execution of that intent. Every Run must pin the exact schedule-definition/configuration version, resolved reporting period, source scope, metric/report semantics, recipient set, and delivery policy used for that execution. Each successful cycle produces a new canonical ReportVersion or report instance according to the Reporting model—it never mutates last month's released report. Generation success, Approval, Release, delivery attempt, provider acceptance, delivery success, Client access, and Client download are separate facts. Unknown delivery outcomes must be reconciled before retry when duplicate external delivery is possible.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                                                                                                                      |
| ---------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **134**                                                                                                                                                                                                                                                                                             |
| **Canonical name**                 | **Scheduled Reports / Report Delivery Management**                                                                                                                                                                                                                                                  |
| **Product area**                   | Team Workspace / Reporting / Automation & Delivery                                                                                                                                                                                                                                                  |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                                                                                                                    |
| **Screen class**                   | Scheduled Reporting Operations / Recurrence & Delivery Management Workspace                                                                                                                                                                                                                         |
| **Classification**                 | **Canonical Scheduled Report Definition, Generation Run & Delivery-Orchestration Anchor**                                                                                                                                                                                                           |
| **Primary purpose**                | Configure and manage recurring/future report generation, resolve exact reporting periods, execute scheduled report runs, create canonical ReportVersions/artifacts, apply approval/release policies, deliver exact artifacts to authorized recipients, and investigate generation/delivery failures |
| **Canonical Reporting foundation** | **Design 033**                                                                                                                                                                                                                                                                                      |
| **Report Library dependency**      | Design 131                                                                                                                                                                                                                                                                                          |
| **Report Detail dependency**       | Design 132                                                                                                                                                                                                                                                                                          |
| **Builder/config dependency**      | Design 133                                                                                                                                                                                                                                                                                          |
| **Primary scheduling entity**      | `ScheduledReportDefinition`                                                                                                                                                                                                                                                                         |
| **Definition revision identity**   | `ScheduledReportDefinitionVersion` where materially versioned                                                                                                                                                                                                                                       |
| **Execution identity**             | `ScheduledReportRun`                                                                                                                                                                                                                                                                                |
| **Period identity/value**          | `ReportingPeriodResolution`                                                                                                                                                                                                                                                                         |
| **Generated business output**      | canonical `Report` / `ReportVersion`                                                                                                                                                                                                                                                                |
| **Frozen data output**             | `ReportDatasetSnapshot`                                                                                                                                                                                                                                                                             |
| **Generated artifact**             | Design-030 Asset/FileVersion                                                                                                                                                                                                                                                                        |
| **Approval dependency**            | Designs 029 / 115                                                                                                                                                                                                                                                                                   |
| **Release identity**               | `ReportRelease`                                                                                                                                                                                                                                                                                     |
| **Recipient relation**             | `ReportRecipient`                                                                                                                                                                                                                                                                                   |
| **Destination identity**           | `DeliveryDestination` / typed delivery channel                                                                                                                                                                                                                                                      |
| **External delivery attempt**      | `ReportDeliveryAttempt`                                                                                                                                                                                                                                                                             |
| **Provider evidence**              | `DeliveryProviderEvent` / normalized provider evidence where applicable                                                                                                                                                                                                                             |
| **Client access dependency**       | Design 056                                                                                                                                                                                                                                                                                          |
| **Notification boundary**          | Design 080                                                                                                                                                                                                                                                                                          |
| **Integration dependency**         | Designs 139–140                                                                                                                                                                                                                                                                                     |
| **Audit dependency**               | Design 039                                                                                                                                                                                                                                                                                          |
| **Primary query service**          | `ScheduledReportQueryService`                                                                                                                                                                                                                                                                       |
| **Definition service**             | `ScheduledReportDefinitionService`                                                                                                                                                                                                                                                                  |
| **Scheduler service**              | `ScheduledReportScheduler`                                                                                                                                                                                                                                                                          |
| **Run service**                    | `ScheduledReportRunService`                                                                                                                                                                                                                                                                         |
| **Period resolver**                | `ReportingPeriodResolver`                                                                                                                                                                                                                                                                           |
| **Generation orchestrator**        | `ScheduledReportGenerationService`                                                                                                                                                                                                                                                                  |
| **Delivery service**               | `ReportDeliveryService`                                                                                                                                                                                                                                                                             |
| **Recipient resolver**             | `ReportRecipientResolver`                                                                                                                                                                                                                                                                           |
| **Delivery adapter registry**      | `ReportDeliveryAdapterRegistry`                                                                                                                                                                                                                                                                     |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                                                                                                                     |
| **Auth**                           | Required                                                                                                                                                                                                                                                                                            |
| **Authorization**                  | Active OrganizationMembership + scheduled-report/config/source/delivery permissions                                                                                                                                                                                                                 |
| **Implementation priority**        | **Critical Recurring Automation / Client Delivery Integrity / Duplicate-Prevention**                                                                                                                                                                                                                |
| **Reuse level**                    | **Extremely High across Reporting, Client delivery, Integrations, Notifications and Automation monitoring**                                                                                                                                                                                         |

Design 134 should answer:

> **“Which reports are scheduled to generate, from which exact report configuration, on what cadence and timezone, what reporting period will each run resolve, who will receive the output, what happened during each generation run, which exact ReportVersion/artifact was produced, whether approval/release was required, whether delivery actually succeeded, and what failures or uncertain outcomes still need attention?”**

Canonical flow:

```text
ScheduledReportDefinition SRD-10
          │
          ├── cadence
          ├── timezone
          ├── report configuration/version policy
          ├── relative period policy
          ├── recipient policy
          └── delivery policy
                    │
                    ↓
              Scheduler due
                    │
                    ↓
          ScheduledReportRun RUN-25
                    │
          ┌─────────┼──────────┐
          ↓         ↓          ↓
   exact config   exact      exact recipient
     version      period       resolution
          │
          ↓
      ReportVersion
          │
          ↓
  ReportDatasetSnapshot
          │
          ↓
   Generated FileVersion
          │
          ↓
 Approval / Release policy
          │
          ↓
 ReportDeliveryAttempt(s)
          │
          ↓
     Delivered / Failed /
       Outcome Unknown
```

---

# 2. Reuse

## Design 033 remains canonical Reporting authority

Design 134 must not create a second scheduled-report document domain such as:

```text
ScheduledReportDocument
RecurringReportFile
AutomatedPerformanceReport
```

as parallel Report identities.

The scheduled system generates or references canonical Reports/ReportVersions.

---

## ScheduledReportDefinition ≠ Report

Critical.

### ScheduledReportDefinition

> Generate a report repeatedly/future according to this policy.

### Report

> One logical reporting result/business report identity.

Do not treat recurrence configuration as report content.

---

## ScheduledReportDefinition ≠ ReportVersion

Permanent.

One Definition may generate many Versions/reports over time.

Example:

```text
Monthly Report Definition SRD-10
        │
        ├── January → ReportVersion RV-1
        ├── February → ReportVersion RV-2
        └── March → ReportVersion RV-3
```

Exact choice of one Report with repeated Versions vs distinct Report identities by period belongs to Phase 3D/report-type policy.

The invariant is:

> every cycle gets its own immutable report output identity.

---

## ScheduledReportDefinition ≠ Builder UI state

Absolute.

The scheduler must never execute:

> whatever configuration is currently open or unsaved in Design 133.

It must pin an explicit stable configuration source.

---

## Definition must pin configuration policy

Possible canonical sources include:

* exact ReportTemplateVersion;
* exact report configuration revision;
* versioned reusable report definition.

Do not rely on a mutable `"latest"` pointer at execution without explicit governed policy.

---

## ScheduledReportDefinitionVersion

If cadence, recipients, source scope, delivery, or report configuration can materially change over time, use versioned definition semantics.

Example:

```text
SRD-10
├── Definition v1 Jan–Mar
└── Definition v2 Apr onward
```

Runs already executed under v1 remain v1.

---

## Definition edit ≠ historical Run edit

Absolute.

---

## ScheduledReportRun ≠ scheduler queue job

Critical.

`ScheduledReportRun` is the durable business execution identity.

Infrastructure queue messages/workers are implementation mechanics.

---

## ScheduledReportRun ≠ ReportVersion

A Run orchestrates generation.

The ReportVersion is one business output.

The Run may fail before creating any ReportVersion.

---

## Run retry ≠ new scheduled period automatically

Permanent.

Retrying failed March generation should normally remain March's Run intent, not generate April.

---

## New recurrence occurrence ≠ retry

Critical.

```text
March 1 scheduled occurrence
→ RUN-30

April 1 scheduled occurrence
→ RUN-31
```

Those are separate Runs.

---

## Design 133 remains report configuration authority

Design 134 references stable Builder configuration.

It does not allow editing all report sections/metrics itself.

---

## Design 132 remains Report output/detail authority

When a Run produces RV-12:

Design 132 opens RV-12.

Scheduled Reports screen should not create a second report-detail representation.

---

## Design 131 remains Report Library authority

Generated Reports/Versions appear in the same Report Center.

---

## ReportingPeriodResolution ≠ recurrence date

Important.

Example:

```text
Run executes:
September 1

Report period:
August 1–31
```

Execution date and reporting period are different.

---

## Recurrence timezone ≠ report period timezone automatically

They may be aligned by policy but remain explicit.

---

## Relative period policy ≠ resolved period

Critical.

### Definition

```text
PREVIOUS_CALENDAR_MONTH
```

### Run resolution

```text
2026-08-01T00:00
through
2026-09-01T00:00
Europe/Berlin
```

Historical Runs retain the resolved dates.

---

## Definition timezone changes do not rewrite past periods

Absolute.

---

## Generated artifact ≠ Run

Permanent.

---

## Run generated ≠ delivered

Critical.

A report can generate successfully while delivery fails.

---

## Approval ≠ generation

Permanent.

---

## Approval ≠ delivery

Permanent.

---

## Release ≠ delivery attempt

Permanent.

---

## Delivery attempt ≠ Client download

Absolute.

---

## Delivery attempt ≠ Notification

Critical.

Notification infrastructure may announce availability.

Formal report delivery has its own business evidence.

---

## Email delivery ≠ Client Portal release

Permanent.

A report may be:

* released to Portal;
* emailed;
* both.

These are separate destinations/actions.

---

## ReportRecipient ≠ User universally

Recipients may conceptually reference:

* internal user;
* Client Portal membership;
* approved contact/destination;

according to frozen business model.

Do not blindly use free-text email as recipient identity when canonical identities exist.

---

## Recipient ≠ DeliveryDestination

Example:

```text
Recipient:
Client Portal user A

Destinations:
Portal access
Email address
```

Identity and transport are different.

---

# 3. Entities

## ScheduledReportDefinition

Stable recurring/future-report intent.

Conceptually:

```text
ScheduledReportDefinition
├── id
├── organizationId
├── name
├── reportType
├── configurationSourceReference
├── recurrencePolicy
├── timezone
├── reportingPeriodPolicy
├── sourceScopePolicy
├── approvalPolicy
├── releasePolicy
├── recipientPolicy
├── deliveryPolicy
├── lifecycle
├── createdBy
├── createdAt
└── revision
```

Exact schema belongs to Phase 3D.

---

## Definition lifecycle ≠ Run state

Possible conceptual lifecycle:

```text
Active
Paused
Archived
Disabled
```

A Definition may be paused while previous Runs remain completed.

---

## Pause ≠ cancel historical Run

Absolute.

---

## Pause ≠ revoke released reports

Absolute.

---

## ScheduledReportDefinitionVersion

Conceptually:

```text
ScheduledReportDefinitionVersion
├── id
├── scheduledReportDefinitionId
├── version
├── exact report configuration reference
├── cadence
├── timezone
├── period policy
├── source policy
├── recipient policy
├── delivery policy
├── effectiveFrom
└── createdAt
```

Use where definition versioning is justified.

---

## DefinitionVersion should be immutable once Runs reference it

Critical.

---

## RecurrencePolicy

Use typed recurrence configuration.

Could map to:

* daily;
* weekly;
* monthly;
* quarterly;
* explicit cron-like governed policy;

depending on frozen requirements.

Do not allow arbitrary executable scheduling scripts.

---

## Recurrence policy ≠ resolved next-run instant

Permanent.

---

## Timezone

Use IANA timezone semantics.

Avoid ambiguous abbreviations.

---

## DST handling

Same safety requirement established in Design 126.

Recurring scheduled jobs must deterministically handle:

* nonexistent local time;
* duplicated local time.

---

## ReportingPeriodPolicy

Conceptually:

```text
PREVIOUS_DAY
PREVIOUS_WEEK
PREVIOUS_CALENDAR_MONTH
PREVIOUS_QUARTER
CUSTOM_RELATIVE_WINDOW
```

only where supported.

Use typed policies.

Do not store free-form date expressions.

---

## ReportingPeriodResolution

One exact Run-period result.

Conceptually:

```text
ReportingPeriodResolution
├── scheduledReportRunId
├── startInstant
├── endInstant
├── timezone
├── periodPolicyVersion
└── resolvedAt
```

---

## Period resolution must be immutable per Run

Once RUN-25 resolves:

> August 1–31

later schedule-definition changes never turn RUN-25 into September.

---

## ScheduledReportRun

Durable execution identity.

Conceptually:

```text
ScheduledReportRun
├── id
├── scheduledReportDefinitionId
├── definitionVersionId
├── scheduledFor
├── claimedAt?
├── startedAt?
├── reportingPeriodResolutionId
├── generationState
├── generatedReportId?
├── generatedReportVersionId?
├── artifactFileVersionId?
├── completedAt?
├── runPurpose
├── retryOfRunId?
└── revision
```

---

## Run purpose

Potentially:

```text
SCHEDULED
MANUAL_RUN
RETRY
BACKFILL
```

where frozen functionality requires it.

Do not invent UI actions if absent.

---

## Manual Run ≠ scheduled occurrence

If "Run now" exists, preserve that distinction.

---

## Backfill ≠ retry

Important.

Generating an intentionally missed historical period is a new explicit historical generation intent, not merely retrying another Run.

---

## Generation state

Conceptually:

```text
PENDING
CLAIMED
RUNNING
SNAPSHOT_BUILDING
REPORT_CREATED
ARTIFACT_GENERATING
AWAITING_APPROVAL
READY_FOR_RELEASE
COMPLETED
FAILED
CANCELLED
OUTCOME_UNKNOWN
```

Exact state machine Phase 3D.

Do not put all of these into one overloaded status if sub-state decomposition is cleaner.

---

## Generated ReportVersion

Must preserve lineage:

```text
ReportVersion.generatedByScheduledReportRunId = RUN-25
```

or equivalent.

---

## ReportDatasetSnapshot

Same canonical Reporting snapshot semantics.

Run generation must not invent a scheduled-only snapshot type.

---

## Generated artifact

Design 030 Asset/FileVersion.

---

## Approval policy

Policy ≠ ApprovalRequest.

Definition may state:

> require approval before release.

Each Run/ReportVersion creates or uses its own exact ApprovalRequest where policy requires it.

---

## Approval for one Run ≠ approval for future Runs

Absolute.

---

## Auto-approval ≠ no Approval semantics

If policy permits no human approval, represent:

> approval not required

rather than fabricating approved-by-user evidence.

---

## ReportRecipient

Conceptually:

```text
ReportRecipient
├── scheduledReportDefinition/Run context
├── recipientType
├── canonical recipient reference
├── delivery eligibility
└── revision
```

A Run should pin the exact resolved recipient set.

---

## Dynamic recipient policy ≠ resolved recipient set

Critical.

Definition might say:

> current Client administrators.

RUN-25 resolves actual recipients at execution/release time according to defined policy and stores who was targeted.

Later membership changes do not rewrite who RUN-25 targeted.

---

## Recipient deactivated before delivery

Must fail/skip according to policy.

Do not deliver solely because the Definition historically referenced them.

---

## DeliveryDestination

Typed transport endpoint, conceptually:

```text
PORTAL
EMAIL
```

or supported future types.

Destination ≠ recipient identity.

---

## Email address snapshot

For delivery audit, a Run may preserve the exact authorized address used at send time.

That does not rewrite canonical Contact/User email.

---

## ReportDeliveryAttempt

External delivery execution evidence.

Conceptually:

```text
ReportDeliveryAttempt
├── id
├── scheduledReportRunId
├── reportVersionId
├── artifactFileVersionId
├── recipientId
├── deliveryDestination
├── attemptNumber
├── initiatedAt
├── providerRequestId?
├── outcomeClass
├── completedAt?
└── revision
```

---

## DeliveryAttempt ≠ ReportRelease

Critical.

A Report may be released to Client Portal even if email delivery fails.

---

## DeliveryAttempt ≠ ProviderEvent

Permanent.

---

## Delivery outcome classes

Conceptually:

```text
SENT
PROVIDER_ACCEPTED
DELIVERED
BOUNCED
RETRYABLE_FAILURE
PERMANENT_FAILURE
OUTCOME_UNKNOWN
```

Exact provider capabilities vary.

---

## Provider accepted ≠ delivered

Absolute.

---

## Sent ≠ opened

Permanent.

---

## Delivered ≠ downloaded

Permanent.

---

## Opened ≠ acknowledged

Permanent.

---

## ClientDownload remains Design-056/File-access evidence

Do not overload delivery state.

---

# 4. Permissions

Design 134 should conceptually distinguish:

```text
scheduledReport.read
scheduledReport.create
scheduledReport.edit
scheduledReport.pause
scheduledReport.resume
scheduledReport.archive

scheduledReport.runNow
scheduledReport.retryRun
scheduledReport.backfill

scheduledReport.manageRecipients
scheduledReport.manageDelivery

reportDelivery.read
reportDelivery.retry

reportRelease.manage
reportApproval.read
```

Exact permission identifiers belong to Phase 3D.

---

## Scheduled-report read ≠ edit

Permanent.

---

## Edit cadence ≠ edit report configuration

Permanent.

Report configuration remains Design 133.

---

## Use Report configuration ≠ edit Report configuration

Critical.

A scheduler operator may schedule an approved configuration without being able to change its metrics.

---

## Schedule edit ≠ source-domain permission automatically

Source scope must still be valid and authorized.

---

## Run Now ≠ edit schedule

Potentially separate permission.

---

## Retry Run ≠ Run Now universally

Permanent.

---

## Backfill ≠ Retry

Separate higher-risk capability where supported.

---

## Manage recipients ≠ view all Contact data

Permanent.

Recipient picker must be permission-scoped.

---

## Delivery management ≠ Integration credential management

Absolute.

---

## Release permission ≠ delivery retry permission

Permanent.

---

## Approval permission ≠ ScheduledReport administration

Permanent.

---

## Client Portal membership ≠ internal schedule-management access

Absolute.

---

## Dynamic recipient resolver must honor current authorization/eligibility

A deactivated/unauthorized recipient cannot be delivered to simply because they once matched the policy.

---

## Direct Definition/Run/ReportVersion/Recipient IDs reauthorize

Absolute.

---

## Cross-tenant source or recipient binding prohibited

Absolute.

---

## Delivery destination must belong to canonical recipient/tenant context

Never accept arbitrary external recipient injection through request body without policy validation.

---

# 5. States

Design 134 must keep **Definition lifecycle, scheduler state, Run state, generation state, Approval, release, delivery, recipient eligibility, and Client access** separate.

### ScheduledReportDefinition

```text
Active
Paused
Archived
Disabled
```

### Run

```text
Pending
Claimed
Running
Completed
Failed
Cancelled
Outcome Unknown
```

### Generation

```text
Not Started
Snapshot Building
Report Generated
Artifact Generating
Artifact Ready
Generation Failed
```

### Approval

Canonical Approval states.

### Release

Canonical ReportRelease state.

### Delivery

```text
Not Started
Pending
Provider Accepted
Delivered
Retryable Failure
Permanent Failure
Bounced
Outcome Unknown
```

### Recipient

```text
Eligible
Ineligible
Restricted
Unavailable
Unknown
```

These must never collapse into one generic `scheduledReport.status`.

---

## Definition Active ≠ Run running

Permanent.

---

## Definition Paused ≠ previous Run failed

Permanent.

---

## Run completed ≠ delivery completed universally

Critical.

Generation may complete before delivery.

---

## Report generated ≠ artifact generated

Permanent.

---

## Artifact generated ≠ approved

Absolute.

---

## Approved ≠ released

Absolute.

---

## Released ≠ delivered by email

Absolute.

---

## Email delivered ≠ Portal access granted

Permanent.

---

## Portal released ≠ email delivered

Permanent.

---

## Delivery provider accepted ≠ delivered

Absolute.

---

## Delivered ≠ opened

Permanent.

---

## Opened ≠ downloaded

Permanent.

---

## Retryable delivery failure ≠ Run generation failure

Critical.

---

## One recipient failure ≠ whole report-generation failure

Permanent.

A multi-recipient Run can be partially delivered.

---

## Partial delivery ≠ no delivery

Permanent.

---

## Recipient ineligible ≠ provider failure

Permanent.

---

## Schedule due ≠ Run created/completed

Permanent.

---

## Scheduler claimed ≠ generation started

Permanent.

---

## Run failure ≠ Scheduled Definition disabled

Permanent.

---

## Run retry ≠ next recurrence

Absolute.

---

## Outcome Unknown ≠ failed

Critical for external delivery.

---

## State Coverage

Design 134 inherits Design 150 plus:

```text
Scheduled Reports Loading
Scheduled Reports Available
Scheduled Reports Empty
Scheduled Reports Restricted
Scheduled Reports Partial
Scheduled Reports Unavailable

Definition Active
Definition Paused
Definition Archived
Definition Disabled

Next Run Scheduled
Next Run Due
Next Run State Unknown

Run Pending
Run Claimed
Run Running
Run Completed
Run Failed
Run Cancelled
Run Outcome Unknown

Period Resolution Pending
Period Resolved
Period Resolution Failed
Period Resolution Conflict

Snapshot Not Started
Snapshot Building
Snapshot Ready
Snapshot Failed

Report Version Not Created
Report Version Created
Report Version Finalized
Report Generation Failed

Artifact Not Generated
Artifact Generating
Artifact Generated
Artifact Failed

Approval Not Required
Approval Pending
Approval Approved
Approval Rejected
Approval State Unknown

Report Not Released
Report Released
Report Release Failed
Report Release State Unknown

Recipient Eligible
Recipient Ineligible
Recipient Restricted
Recipient State Unknown

Delivery Not Started
Delivery Pending
Delivery Provider Accepted
Delivery Delivered
Delivery Bounced
Delivery Retryable Failure
Delivery Permanent Failure
Delivery Outcome Unknown
Delivery Partial

Definition Updated Elsewhere
Definition Version Changed
Run Updated Elsewhere
Recipient Changed
Configuration Source Changed
Delivery Updated Elsewhere
Scheduler State Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

1. scheduled report definition;
2. cadence/timezone;
3. report/config source;
4. next run;
5. recipient/delivery policy;
6. latest run result;
7. historical Runs.

Conceptually:

```text
Scheduled Reports
↓
Monthly Client Performance Report

Cadence:
Monthly · 1st day · 08:00

Timezone:
Europe/Berlin

Period policy:
Previous calendar month

Configuration:
Report Template/config v4

Recipients:
3

Next Run:
Sep 1

Latest Run:
Generated ✓
Released ✓
2 delivered
1 bounced
```

Only frozen Design 134 fields/actions should render.

---

## Definition state and last Run state must remain separate

Correct:

> Schedule: Active
> Last Run: Failed

not:

> Schedule: Failed.

---

## Next Run and reporting period must not be conflated

Correct:

> Next generation: Sep 1
> Report period: Aug 1–31

---

## Configuration identity should remain explicit

Where applicable:

> Uses Report configuration v4

not:

> Uses latest report.

---

## Recipient summary should distinguish delivery outcomes

Example:

> 3 recipients · 2 delivered · 1 bounced

rather than:

> Delivered.

---

## Run history should preserve exact output

A historical Run should expose:

* resolved period;
* ReportVersion;
* artifact;
* delivery state.

---

## Pausing

If pause control exists:

make clear conceptually:

> Pauses future Runs.

It does not revoke historical reports.

---

## Retry action

Where frozen UI includes retry:

distinguish:

* Retry generation;
* Retry specific delivery;

if both are possible.

Do not use one ambiguous Retry button for every failure type.

---

## Tablet

Following Design 152:

* definition/cadence summary first;
* next/latest Run cards stack;
* recipients/delivery collapse;
* run history becomes compact;
* key failure/unknown states remain prominent.

---

## Mobile

Priority:

```text
Scheduled Report name
↓
Active / Paused
↓
Cadence + timezone
↓
Next Run
↓
Resolved period policy
↓
Report configuration
↓
Latest Run
↓
Delivery summary
↓
Run history
```

Avoid squeezing a wide scheduler table horizontally.

---

## Mobile Run detail

Example:

> August Performance Report
> Run Aug 1
> Period Jul 1–31
> Report v8 generated
> Approved
> Released
> 2/3 deliveries successful

---

## Accessibility

A scheduled definition could communicate:

> Monthly Client Performance Report is active. It runs on the first day of each month at 8 AM Europe/Berlin and generates a report for the previous calendar month using report configuration version 4. The latest run generated report version 8 successfully. The report was released to the Client. Two email deliveries succeeded and one bounced. The next run is scheduled for September 1.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Scheduled Reporting architecture

```text
Design 134
    ↓
Authenticated Workspace Context
    ↓
ScheduledReportQueryService
    │
    ├── DefinitionAdapter
    ├── DefinitionVersionAdapter
    ├── ReportConfigurationAdapter
    ├── RunAdapter
    ├── PeriodResolutionAdapter
    ├── ReportVersionAdapter
    ├── ApprovalAdapter
    ├── ArtifactAdapter
    ├── ReleaseAdapter
    ├── RecipientAdapter
    └── DeliveryAdapter
    ↓
ScheduledReportView
```

Execution:

```text
Durable Scheduler
      ↓
ScheduledReportRun
      ↓
resolve exact definition version
      ↓
resolve exact period
      ↓
resolve source + recipient set
      ↓
generate canonical ReportVersion
      ↓
build immutable Snapshot
      ↓
generate exact artifact
      ↓
Approval / Release policy
      ↓
ReportDeliveryAttempt(s)
```

---

## Definition creation

Conceptually:

```text
createScheduledReportDefinition(
    configurationReference,
    recurrencePolicy,
    timezone,
    reportingPeriodPolicy,
    recipientPolicy,
    deliveryPolicy,
    idempotencyKey
)
```

must:

1. authenticate/authorize;
2. validate stable report configuration source;
3. validate cadence/timezone;
4. validate period policy;
5. validate source policy;
6. validate recipients/delivery policy;
7. create canonical Definition;
8. emit Audit/outbox.

---

## Definition edits

Use targeted commands:

```text
updateSchedule(...)
updatePeriodPolicy(...)
updateRecipientPolicy(...)
updateDeliveryPolicy(...)
pauseScheduledReport(...)
resumeScheduledReport(...)
```

Avoid a generic unrestricted mega-PATCH.

---

## Definition versioning

Material edits that affect future output semantics should preserve lineage.

Examples:

* report configuration changed;
* period policy changed;
* recipient policy changed;
* delivery policy changed.

Runs always pin the exact effective definition revision/version.

---

## Definition update does not affect already-created Runs

Absolute.

---

## Scheduler durability

Same durable scheduling requirements as Designs 124/126.

No:

* browser timers;
* in-memory-only timers;
* one server's process state.

Use durable due-state and worker claims.

---

## Scheduler claim

Atomically establish the Run/claim for one scheduled occurrence.

Prevent duplicate Runs for:

```text
Definition SRD-10
+
occurrence 2026-09-01T08:00 Europe/Berlin
```

---

## Occurrence uniqueness

Critical.

A stable occurrence key should prevent multiple Runs for the same scheduled occurrence unless an explicit retry/backfill semantics says otherwise.

---

## Run creation idempotency

Absolute.

---

## Scheduler recovery

After outage/restart:

reconcile missed due occurrences according to explicit policy.

Do not blindly generate every historical missed occurrence without limits/policy.

---

## Misfire policy

Phase 3D should define safe behavior such as:

* run immediately;
* skip;
* require manual backfill;

depending on report/business importance.

The policy must be explicit.

---

## Missed Run ≠ provider failure

Permanent.

---

## ReportingPeriodResolver

Central:

```text
ReportingPeriodResolver.resolve(
    periodPolicy,
    scheduledOccurrence,
    timezone
)
```

produces exact immutable period boundaries.

---

## Relative period semantics must be centralized

Do not let each ReportType calculate:

> previous month

differently.

---

## Month boundaries/timezone

Example:

Scheduled:

> Sep 1 08:00 Europe/Berlin

Period:

```text
Aug 1 00:00 Europe/Berlin
→
Sep 1 00:00 Europe/Berlin
```

converted to canonical instants.

---

## DST/calendar correctness

Period calculations should use calendar semantics, not fixed 30-day arithmetic for "previous month."

---

## Run pins exact DefinitionVersion/config reference

Critical.

Do not resolve latest Builder configuration after the Run starts.

---

## Source authorization at run time

Even if Definition was valid when created:

revalidate source scope at execution.

Possible changes:

* Project access;
* Client relationship;
* report configuration archived;
* source restricted;
* integration unavailable.

---

## Authorization actor

Scheduled runs execute as:

* explicit system/service actor;
* within organization-defined authority.

Never impersonate the creator indefinitely without clear policy.

---

## Creator deactivation

A schedule should not silently break or continue using stale personal authority without defined ownership policy.

Prefer Definition owned by Organization/context with explicit service execution policy.

---

## Scheduled configuration eligibility

The referenced report configuration/template version must remain valid for generation.

If unavailable:

Run fails/blocks explicitly.

Do not silently use latest replacement configuration.

---

## Generation orchestration

Conceptually:

```text
executeScheduledReportRun(runId)
```

should:

1. claim Run;
2. pin DefinitionVersion;
3. resolve period;
4. resolve source scope;
5. resolve recipient policy;
6. validate report configuration;
7. build canonical DatasetSnapshot;
8. create/finalize ReportVersion according to policy;
9. generate exact Artifact;
10. process Approval/Release policy;
11. initiate delivery;
12. preserve independent outcomes.

---

## Report generation must reuse Design 133/130 services

Do not build a scheduled-only reporting engine.

---

## Run → ReportVersion uniqueness

A successful generation intent should produce one canonical output Version according to idempotency policy.

Retrying a crashed worker must not create multiple equivalent ReportVersions.

---

## Report generation outcome unknown

If worker may have created the ReportVersion but acknowledgement was lost:

reconcile by Run ID/idempotency key.

---

## Snapshot semantics

Exact same ReportDatasetSnapshot foundation.

Scheduled reports never bypass frozen snapshots.

---

## Metric semantics

Exact Design-038 MetricDefinition/calculation versions pinned.

---

## Artifact generation

Same Design-030/report rendering infrastructure.

---

## Approval policy

Possible policy concepts:

```text
REQUIRE_APPROVAL
NO_APPROVAL_REQUIRED
```

Do not invent auto-approval by fabricated user.

---

## Awaiting Approval

If human approval is required:

Run may reach:

> Generated / Awaiting Approval

and delivery must wait.

---

## Rejected report

A rejected generated ReportVersion should not be delivered.

Definition remains active unless policy/operator changes it.

---

## Approval timeout

If frozen system has timeout/escalation, it belongs to Approval/automation policy.

Do not invent it here.

---

## Release policy

A generated/approved report can be explicitly released.

Do not infer Release because artifact exists.

---

## Recipient resolution

Conceptually:

```text
ReportRecipientResolver.resolve(
    scheduledReportRunId,
    recipientPolicy
)
```

returns exact eligible recipient set.

---

## Dynamic recipients need snapshotting

Example:

Definition:

> All active Client Portal administrators

RUN-25 resolves:

```text
Membership A
Membership B
Membership C
```

Those exact recipients become historical execution evidence.

---

## Recipient authorization before delivery

Re-check eligibility immediately before delivery where needed.

---

## Deactivated recipient

Do not send to a deactivated Portal membership merely because it appeared in an earlier planning preview.

---

## Email address changes

The DeliveryAttempt preserves the exact address used.

Canonical Contact/User remains current separately.

---

## Delivery adapters

Use:

```text
ReportDeliveryAdapterRegistry
```

for supported delivery destinations/providers.

Possible adapters:

* email;
* Portal release/access;

according to actual frozen product capabilities.

---

## Delivery adapter ≠ Notification adapter universally

Formal report delivery can reuse infrastructure but remains separately typed.

---

## Email provider credentials

Remain Designs 139/140 Integration/secure secrets.

Never stored in ScheduledReportDefinition.

---

## Portal delivery

Should create/reuse canonical ReportRelease/Client access.

Do not send a fake "delivery success" without access evidence.

---

## Email delivery

ReportDeliveryAttempt references exact:

* ReportVersion;
* artifact FileVersion;
* recipient;
* address/destination.

---

## Delivery idempotency

Critical.

External sends can duplicate.

Use:

```text
runId
+ reportVersionId
+ recipientId
+ destination
```

or equivalent stable delivery intent key.

---

## Provider idempotency

Use provider idempotency keys where supported.

---

## Delivery unknown outcome

If send request may have succeeded but response was lost:

```text
OUTCOME_UNKNOWN
```

must not be blindly retried if duplicate emails/messages matter.

---

## Reconciliation

Where provider supports lookup:

```text
reconcileReportDeliveryAttempt(attemptId)
```

before retrying uncertain sends.

---

## Retry delivery ≠ regenerate report

Critical.

If PDF/report is correct but one email bounced transiently:

retry the same exact ReportVersion/FileVersion delivery.

Do not regenerate the Report.

---

## Retry generation ≠ retry delivery

Permanent.

These need distinct actions/services.

---

## Bounced delivery

Bounce is a delivery result.

It does not make:

* ReportVersion failed;
* ReportRelease invalid;
* scheduled Definition failed universally.

---

## Partial delivery

First-class.

Example:

```text
Recipient A delivered
Recipient B delivered
Recipient C bounced
```

Run can be:

> generation successful, delivery partial.

---

## Aggregate Run state

Do not flatten all phases into one ambiguous status.

A useful read projection can summarize:

```text
Generation: Success
Approval: Approved
Release: Success
Delivery: Partial
```

---

## Client download tracking

Do not classify:

> delivered

based on download unless the delivery policy explicitly defines Portal availability plus download separately.

---

## Run history

Each Run should retain:

* occurrence;
* DefinitionVersion;
* period;
* source scope;
* recipient resolution;
* output ReportVersion;
* Artifact;
* Approval;
* Release;
* DeliveryAttempts.

---

## Design 141/142 future Automation monitoring

Scheduled reporting Runs may later project into generic Automation/Workflow Run monitoring.

But `ScheduledReportRun` remains canonical reporting execution identity.

Do not replace it with generic AutomationRun.

This will matter when auditing Designs 141–142.

---

## Notification integration

Design 080 can notify internal staff:

* scheduled report failed;
* approval needed;
* delivery bounced.

Notification read state never changes Run/Delivery.

---

## Integration health

Designs 139–140 remain connection health/credential authority.

Design 134 may consume health for:

* email provider;
* file service;
* other delivery integrations.

---

## Activity

Material report generation/release may be projected where relevant.

Do not add every scheduler heartbeat to Activity.

---

## Audit

Audit material human/system actions:

* Definition create/edit/pause/resume/archive;
* manual Run;
* backfill;
* delivery retry;
* recipient policy change;
* report release.

Routine worker internals belong operational logs.

---

## Observability

Track:

* schedule lag;
* run duration;
* snapshot generation duration;
* artifact generation duration;
* delivery latency;
* failures/retries;
* queue depth.

These are operational metrics, not report-performance metrics.

---

## Idempotency

Critical for:

* Definition creation;
* occurrence → Run creation;
* Run execution;
* ReportVersion generation;
* Snapshot generation;
* artifact generation;
* ReportRelease;
* recipient access;
* DeliveryAttempts;
* retries.

---

## Concurrency

Critical races:

### Definition edited while Run begins

Run pins one exact DefinitionVersion.

### Schedule paused while due occurrence is being claimed

Server resolves claim/pause atomically according to policy.

### Approval completes while delivery worker checks state

Delivery rechecks exact Approval/Release eligibility.

### Recipient deactivated during delivery

Delivery preflight rechecks eligibility.

### Delivery retry while provider reports first send succeeded

Retry preflight reconciles latest evidence.

---

## Caching

Scheduled-report list caches should vary by:

```text
organizationMembershipId
authorizationRevision
definitionRevision
definitionVersionRevision
nextRunRevision
runRevision
reportVersionRevision
approvalRevision
releaseRevision
recipientPolicyRevision
deliveryRevision
integrationHealthRevision
```

---

## Time-derived next-run caching

Cannot be indefinitely cached.

---

## Performance

Use:

* indexed next-run instants;
* definition/run summaries;
* lazy detailed Run histories;
* batched delivery summaries;
* durable asynchronous generation;
* background report rendering;
* cursor pagination.

Do not load every recipient DeliveryAttempt for every Definition row initially.

---

## Partial failure contract

Example:

```text
Definition           ✓
Scheduler            ✓
Report generation    ✓
Approval service     ✕
```

Correct:

> Report was generated; Approval state is currently unavailable, so release/delivery cannot safely continue.

Incorrect:

> Approved.

Another:

```text
Report generated     ✓
Portal release       ✓
Email delivery       ✕
```

Correct:

> Report is available in the Client Portal; email delivery failed.

Not:

> Report delivery failed universally.

Another:

```text
Run generated        ✓
2 recipients         delivered
1 recipient          bounced
```

Correct:

> Delivery partial.

Not:

> Run failed.

Another:

```text
Definition active    ✓
Scheduler health     unavailable
```

Correct:

> Scheduled definition remains active; current scheduler execution health is unavailable.

Not:

> Schedule paused.

---

## Backend Requirement Matrix

| Requirement                                                    | Status                    |
| -------------------------------------------------------------- | ------------------------- |
| Design 033 canonical Reporting reuse                           | **Critical**              |
| Designs 131–133 exact Report/config reuse                      | **Critical**              |
| ScheduledReportDefinition/Report separation                    | **Critical**              |
| ScheduledReportDefinition/ReportVersion separation             | **Critical**              |
| Definition/Run separation                                      | **Critical**              |
| DefinitionVersion/Run pinning                                  | **Critical**              |
| Definition edit/history preservation                           | **Critical**              |
| Scheduler job/Run separation                                   | **Critical**              |
| Occurrence uniqueness                                          | **Critical**              |
| Durable scheduler                                              | **Critical**              |
| Scheduler recovery/misfire policy                              | **Critical**              |
| Recurrence timezone safety                                     | **Critical**              |
| DST handling                                                   | **Critical**              |
| PeriodPolicy/resolved-period separation                        | **Critical**              |
| Calendar-relative period correctness                           | **Critical**              |
| Resolved period immutable per Run                              | **Critical**              |
| Exact report configuration pinning                             | **Critical**              |
| No mutable Builder UI state at execution                       | **Critical**              |
| No implicit latest config/template                             | **Critical**              |
| Runtime source authorization                                   | **Critical**              |
| Service/system actor policy                                    | **Critical**              |
| Creator deactivation safe handling                             | **Critical architecture** |
| Scheduled generation reuses canonical snapshot/report services | **Critical**              |
| Run/ReportVersion output lineage                               | **Critical**              |
| Run execution idempotency                                      | **Critical**              |
| Generation unknown-outcome reconciliation                      | **Critical**              |
| Approval policy/ApprovalRequest separation                     | **Critical**              |
| Approval exact generated ReportVersion                         | **Critical**              |
| Approval/Release separation                                    | **Critical**              |
| Recipient policy/resolved-recipient separation                 | **Critical**              |
| Recipient revalidation before delivery                         | **Critical**              |
| Recipient/DeliveryDestination separation                       | **Critical**              |
| DeliveryAttempt/ReportRelease separation                       | **Critical**              |
| DeliveryAttempt/Notification separation                        | **Critical**              |
| Provider accepted/delivered separation                         | **Critical**              |
| Delivery/download separation                                   | **Critical**              |
| Email delivery/Portal release separation                       | **Critical**              |
| Delivery idempotency                                           | **Critical**              |
| Delivery outcome-unknown reconciliation                        | **Critical**              |
| Retry generation/retry delivery separation                     | **Critical**              |
| Partial recipient outcomes                                     | **Critical**              |
| Integration credentials outside scheduled domain               | **Critical**              |
| Design 056 Client access reuse                                 | **Critical**              |
| Designs 139–140 Integration reuse                              | **Critical architecture** |
| Designs 141–142 Automation-monitor projection only             | **Critical architecture** |
| Cross-tenant recipient/source binding prohibited               | **Critical**              |
| Optimistic/transactional concurrency                           | **Critical**              |
| Audit/observability separation                                 | **Required**              |
| Partial dependency failure handling                            | **Critical**              |

---

# 8. Consolidation

Design 134 is a major cross-domain automation surface, so the main architectural risk is collapsing **schedule → execution → generated report → release → delivery** into one vague recurring job.

**ScheduledReportDefinition / Report conflation**
Recurring intent becomes report identity.

**ScheduledReportDefinition / ReportVersion conflation**
Each cycle overwrites the same report revision.

**Definition / Run conflation**
Historical execution evidence disappears.

**Run / infrastructure queue job conflation**
Worker retry creates duplicate business Runs.

**Definition latest config / pinned config conflation**
Builder edits change an already-due Run.

**Mutable Builder state / scheduled configuration conflation**
Unsaved/user-current UI state becomes automation input.

**Template latest / pinned TemplateVersion conflation**
Monthly report changes unexpectedly after template edit.

**Definition edit / historical Run edit conflation**
Past reports become unreproducible.

**Recurrence policy / next-run instant conflation**
Timezone/DST changes corrupt future schedule.

**Schedule date / report period conflation**
Sep 1 run is incorrectly treated as September report.

**Relative period policy / resolved historical period conflation**
Past Runs shift after timezone/policy changes.

**Previous month / fixed 30-day range conflation**
Calendar periods are wrong.

**Scheduler claimed / Run started conflation**
Execution state becomes ambiguous.

**Run started / ReportVersion created conflation**
Failed generation appears successful.

**Run completed / Report delivered conflation**
Generation success hides delivery failure.

**Snapshot generated / Report generated conflation**
Report lifecycle becomes unclear.

**Report generated / Artifact generated conflation**
PDF failure appears data failure.

**Artifact generated / Approved conflation**
Generated file bypasses governance.

**Approved / Released conflation**
Internal approval exposes report.

**Released / Email sent conflation**
Portal release becomes email delivery.

**Email provider accepted / Delivered conflation**
API acceptance becomes delivery truth.

**Delivered / Opened conflation**
Transport and engagement merge.

**Opened / Downloaded conflation**
Email analytics and Portal access merge.

**Downloaded / Acknowledged conflation**
Client receipt becomes acceptance.

**ReportRelease / DeliveryAttempt conflation**
Portal access and transport attempt become same record.

**Notification / Report delivery conflation**
Notification engine becomes formal report-delivery evidence.

**Recipient identity / email address conflation**
Contact changes rewrite historical delivery.

**Recipient policy / resolved recipient set conflation**
Later membership changes alter who an old Run supposedly targeted.

**Inactive recipient / provider failure conflation**
Eligibility issue appears integration failure.

**One recipient failure / whole Run failure conflation**
Partial delivery cannot be represented.

**Delivery retry / report regeneration conflation**
Same report is regenerated unnecessarily.

**Generation retry / next scheduled occurrence conflation**
March retry creates April report.

**Backfill / retry conflation**
Intentional historical generation loses semantics.

**Run Now / scheduled occurrence conflation**
Manual and automated history becomes ambiguous.

**Run outcome unknown / failure conflation**
Duplicate reports/notifications can be generated.

**Delivery outcome unknown / retryable failure conflation**
Client receives duplicate emails.

**Provider bounce / report invalid conflation**
Valid report appears broken.

**Definition paused / last Run failed conflation**
Schedule status is wrong.

**Definition archived / Reports deleted conflation**
Historical reports disappear.

**Schedule edit / existing Run mutation conflation**
In-flight job changes underneath execution.

**Schedule pause / claimed occurrence conflation**
Same occurrence may both run and appear skipped.

**Scheduler outage / Definition disabled conflation**
Infrastructure health alters business configuration.

**Creator deactivated / schedule ownership conflation**
Recurring automation silently impersonates inactive user or stops unpredictably.

**Source permission at creation / source permission forever conflation**
Future Runs access revoked data.

**Recipient permission at Definition creation / delivery authorization forever conflation**
Reports sent to no-longer-eligible users.

**Metric latest version / pinned report semantics conflation**
Recurring reports change formula without trace.

**Scheduled report / generic AutomationRun conflation**
Reporting-specific period/report/delivery semantics disappear.

**AutomationRun / ReportVersion conflation**
Generic job monitor becomes report authority.

**Integration health / Definition state conflation**
Email outage pauses report schedule permanently.

**Delivery logs / Audit conflation**
Provider debug logs become governance evidence.

**Scheduler heartbeat / Activity conflation**
Activity feed becomes noisy.

**Generic `scheduled_report` row with `last_file_url`**
No Run/Version/Snapshot/recipient history.

**Generic `last_run_status`**
Cannot represent Generation Success + Delivery Partial.

**Generic `recipients JSON`**
No canonical identity, eligibility, or historical resolution.

**Generic `next_run` only**
No timezone/recurrence semantics.

**Generic `email_sent=true`**
No provider/delivery/recipient evidence.

**134/033 duplicate Reporting engine**
Scheduled generation forks from canonical reports.

**134/056 duplicate Client delivery state**
Portal and scheduler disagree.

**134/080 duplicate Notification state**
Formal delivery becomes a notification.

**134/131 duplicate report identity**
Generated reports do not appear correctly in Report Center.

**134/132 duplicate report detail**
Run creates separate view data.

**134/133 duplicate report configuration**
Scheduler edits report structure.

**134/139–140 duplicate delivery integrations**
Schedule stores provider credentials.

**134/141–142 duplicate Automation execution identity**
Generic automation monitor replaces ScheduledReportRun.

No additional screen is required.

These are **scheduled-definition identity, immutable occurrence/run lineage, relative-period resolution, exact configuration pinning, canonical report generation, approval/release sequencing, recipient resolution, delivery-attempt evidence, duplicate prevention, retry semantics, integration isolation, and Automation-monitor projection requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL SCHEDULED REPORT DEFINITION, GENERATION RUN & DELIVERY-ORCHESTRATION ANCHOR**

**Domain directive:**
**Report ≠ ReportVersion ≠ ScheduledReportDefinition ≠ ScheduledReportDefinitionVersion ≠ ScheduledReportRun ≠ ReportingPeriodResolution ≠ ReportDatasetSnapshot ≠ GeneratedReportArtifact ≠ ReportRelease ≠ ReportRecipient ≠ DeliveryDestination ≠ ReportDeliveryAttempt ≠ Notification ≠ ClientDownload.**

**Foundation directive:**
Design 033 remains the canonical Reporting domain. Design 134 automates creation and delivery of those canonical Report/ReportVersion outputs rather than creating a parallel scheduled-report document model.

**Definition directive:**
`ScheduledReportDefinition` is stable future-generation intent containing recurrence, timezone, reporting-period policy, stable configuration reference, recipient policy and delivery policy.

**Definition-version directive:**
material scheduling/configuration/recipient/delivery-policy changes preserve version/revision lineage so every Run can identify exactly which definition semantics produced it.

**Run directive:**
`ScheduledReportRun` is one durable business execution occurrence. It remains distinct from the scheduler's infrastructure queue/job.

**Occurrence directive:**
each expected scheduled occurrence has a stable uniqueness identity so worker retries cannot create duplicate Runs.

**Historical directive:**
editing a Definition affects future eligible Runs only and never rewrites prior Run periods, outputs, recipients or delivery evidence.

**Builder directive:**
Design 133 remains canonical report configuration authority. Scheduled execution pins an explicit stable configuration/template revision and never runs unsaved or mutable Builder UI state.

**No-latest directive:**
a Run must never resolve `"latest report config"` or `"latest template"` implicitly after starting. Exact configuration semantics are pinned before generation.

**Period-policy directive:**
relative policies such as previous calendar month remain typed policies, while each Run persists one exact immutable `ReportingPeriodResolution`.

**Period directive:**
run execution timestamp and report data period remain separate. A September 1 run can correctly produce an August report.

**Timezone directive:**
recurrence and reporting-period calculations use explicit IANA timezones and calendar/DST-safe semantics rather than server-local time or fixed-day approximations.

**Scheduler directive:**
recurrence is implemented with durable scheduler state, atomic claiming and crash recovery—not browser timers or volatile application memory.

**Misfire directive:**
scheduler outage/missed occurrences follow explicit misfire policy such as run/skip/manual backfill; they are never silently ignored or duplicated.

**Run-configuration directive:**
once claimed/executing, a Run pins one exact DefinitionVersion/configuration revision and cannot mutate because the Definition is subsequently edited.

**Source-authorization directive:**
source/report configuration eligibility and permissions are revalidated at execution time. Historical schedule creation does not grant perpetual access to future data.

**Service-actor directive:**
scheduled execution uses an explicit system/service authority model in organizational scope and does not silently impersonate an indefinitely deactivated creator.

**Generation directive:**
scheduled Runs reuse the canonical Design-130/133 snapshot, ReportVersion, rendering and artifact services. There is no scheduled-only report generator.

**Output directive:**
each successful reporting occurrence produces its own immutable canonical Report output identity according to Reporting policy; monthly cycles never overwrite the prior released Version.

**Snapshot directive:**
every generated finalized ReportVersion receives an exact frozen `ReportDatasetSnapshot` with the same MetricDefinition/version/provenance semantics used by manual reporting.

**Metric directive:**
Design 038 remains Metric authority. Scheduled Runs do not silently upgrade formulas without pinned semantic-version policy.

**Artifact directive:**
generated documents remain exact Design-030 FileVersions tied to the generated ReportVersion and never mere `"last_file_url"` fields on the schedule.

**Approval-policy directive:**
ScheduledReportDefinition may define whether Approval is required, but every required Approval remains a canonical exact-ReportVersion ApprovalRequest.

**Approval directive:**
approval for January's report does not approve February's report automatically.

**No-fake-approval directive:**
where policy does not require Approval, represent `NOT_REQUIRED`; do not fabricate human approval evidence.

**Release directive:**
ReportRelease remains explicit exact ReportVersion/FileVersion/Client access evidence and remains separate from artifact generation and delivery attempts.

**Recipient-policy directive:**
Definition stores recipient-selection policy; each Run resolves and preserves its exact recipient set so later Contact/Membership changes do not rewrite historical delivery intent.

**Recipient-authorization directive:**
recipient eligibility is revalidated at delivery time. Deactivated/restricted Client users cannot continue receiving reports solely because they were historically selected.

**Recipient/destination directive:**
recipient identity and delivery destination remain separate. One canonical recipient can have Portal and/or email destinations.

**Delivery directive:**
each external send is represented by an append-oriented `ReportDeliveryAttempt` tied to exact Run, ReportVersion, artifact, recipient and destination.

**Portal/email directive:**
Client Portal release and email delivery remain independent outcomes. One may succeed while the other fails.

**Provider directive:**
provider acceptance, successful delivery, open, Portal download and acknowledgement are all separate facts.

**Partial-delivery directive:**
multi-recipient partial outcomes are first-class. `2 delivered + 1 bounced` cannot be flattened into simple success/failure.

**Retry-generation directive:**
retrying generation operates on the same intended occurrence/period and does not advance to the next recurrence automatically.

**Retry-delivery directive:**
retrying one failed delivery sends the same exact already-generated ReportVersion/FileVersion when appropriate and never regenerates report content merely because transport failed.

**Retry-separation directive:**
generation retry, delivery retry, Run Now and historical backfill remain different operations and maintain different lineage.

**Outcome-unknown directive:**
uncertain report generation or external delivery is not failure. Reconcile by Run/external provider evidence before repeating an operation that could duplicate reports or Client messages.

**Delivery-idempotency directive:**
report deliveries use stable delivery-intent keys and provider idempotency where supported to prevent duplicate Client sends.

**Client directive:**
Design 056 remains Client report/access/download authority over exact released ReportVersions/artifacts. Scheduled-report state never becomes Client access truth by itself.

**Notification directive:**
Design 080 may alert Team users about failures, approvals or available reports, but Notification records/read-state never substitute for ReportDeliveryAttempt or ReportRelease.

**Integration directive:**
Designs 139–140 remain email/provider connection and credential authority. Scheduled report definitions reference authorized delivery capabilities without storing secrets.

**Automation directive:**
Designs 141–142 may later aggregate scheduled-report execution into generic Automation monitoring, but canonical reporting execution remains `ScheduledReportRun`; `AutomationRun` must not replace its reporting-specific business semantics.

**Concurrency directive:**
Definition edits vs Run claims, pause vs due occurrence, Approval vs delivery, recipient deactivation vs send, and provider callback vs retry all require transactional/revision-aware coordination.

**Idempotency directive:**
Definition creation, occurrence-to-Run creation, report generation, Snapshot creation, artifact generation, ReportRelease, recipient access and DeliveryAttempts are replay-safe.

**Audit directive:**
Definition lifecycle changes, manual Run/backfill, release and delivery retry/governed recipient changes produce actor/system-aware Audit evidence.

**Observability directive:**
scheduler delay, queue depth, generation duration, delivery latency and provider failures remain operational observability and never become report-performance data.

**Caching directive:**
scheduled-report summaries are revision/time-aware; next-run state, recipient eligibility and delivery health cannot be indefinitely cached.

**Performance directive:**
use indexed next-run times, compact Run summaries, asynchronous generation/rendering, batched recipient delivery summaries and lazy detailed histories instead of loading every output/attempt for every schedule row.

**Partial-failure directive:**
scheduler, report generation, Approval, artifact rendering, Portal release, individual delivery channels and Integrations may fail independently. `Unavailable` can never be converted into `Failed`, `Delivered`, `Approved`, `Paused`, or `No recipients` without evidence.

**Future-reuse directive:**
Design **135 — Analytics Executive Dashboard** should consume canonical Analytics/Metric Registry aggregates and report-safe KPI read models rather than reading ScheduledReportDefinition/Run state as business performance. Scheduled reports may be referenced as reporting operations, but dashboard metrics must remain analytically canonical and separate from report-generation automation.

**Overlap directive:**
Designs **030, 033, 038, 056, 080, 131–142** must preserve one continuous **versioned ScheduledReportDefinition → exact scheduled occurrence → ScheduledReportRun → immutable resolved period + pinned report configuration → canonical Snapshot/ReportVersion → exact artifact → Approval/ReportRelease → resolved recipients → idempotent DeliveryAttempts → Client access/download**, while generic Automation and Notification surfaces remain projections/adjacent infrastructure rather than source truth.

**Consolidation directive:**
**STANDARDIZE ONE SCHEDULED REPORTING & DELIVERY FOUNDATION — DESIGN-033 CANONICAL REPORT OUTPUTS + VERSIONED SCHEDULEDREPORTDEFINITION + DURABLE OCCURRENCE/RUN IDENTITY + IANA/DST-SAFE RECURRENCE + IMMUTABLE RELATIVE-PERIOD RESOLUTION + EXACT DESIGN-133 CONFIGURATION PINNING + CANONICAL SNAPSHOT/REPORTVERSION/ARTIFACT GENERATION + EXACT APPROVAL/RELEASE POLICY + RUN-SCOPED RECIPIENT RESOLUTION + DISTINCT PORTAL/EMAIL DELIVERY ATTEMPTS + PROVIDER-ACCEPTANCE/DELIVERED/DOWNLOADED SEPARATION + OUTCOME-UNKNOWN RECONCILIATION + PARTIAL RECIPIENT OUTCOMES + DESIGN-139–142 INTEGRATION/AUTOMATION PROJECTIONS — AND NEVER ALLOW `LATEST` BUILDER STATE, GENERIC CRON JOBS, `LAST_RUN_STATUS`, `LAST_FILE_URL`, RECIPIENT JSON, NOTIFICATION DELIVERY, PROVIDER ACCEPTANCE OR CLIENT DOWNLOADS TO SUBSTITUTE FOR OR REWRITE CANONICAL SCHEDULE DEFINITION, RUN, REPORTVERSION, ARTIFACT, RELEASE OR DELIVERY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **134 / 153** |
| **PASS**                                   |                        **134** |
| **STANDARDIZE decisions**                  |                        **132** |
| **Potential implementation-overlap flags** |                        **125** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**134 / 153 = 87.6% audited.**

### Canonical Scheduled Reporting architecture after Design 134

```text
SCHEDULED REPORT DEFINITION SRD-10
              │
              ├── Monthly
              ├── 08:00 Europe/Berlin
              ├── Previous calendar month
              ├── Report config v4
              └── Recipient policy
                         │
                         ↓
                 Sep 1 occurrence
                         │
                         ↓
                    RUN-25
                         │
                         ├── Period Aug 1–31
                         ├── Config v4 pinned
                         └── Recipient set pinned
                                  │
                                  ↓
                           ReportVersion RV-8
                                  │
                                  ↓
                              Snapshot
                                  │
                                  ↓
                           FileVersion FV-12
                                  │
                                  ↓
                           Approval / Release
                                  │
                         ┌────────┼────────┐
                         ↓        ↓        ↓
                    Recipient A  B        C
                      Delivered Delivered Bounced
```

The strongest recurrence rule is now explicit:

```text
Run occurs:
September 1

Report period:
August 1–31

October 1 run:
September 1–30

These are separate Runs
with separate immutable
period resolutions.

Changing the schedule later
does NOT rewrite either one.
```

Scheduled configuration is also frozen per Run:

```text
RUN-25 starts
using Report Config v4

Then someone creates:
Report Config v5

RUN-25 still uses v4.

Future eligible Runs may use v5
only through explicit
definition/version policy.
```

Generation and delivery remain layered:

```text
Report generated
       ≠
Artifact generated
       ≠
Approved
       ≠
Released
       ≠
Email provider accepted
       ≠
Delivered
       ≠
Opened
       ≠
Downloaded
```

And partial delivery is first-class:

```text
Report RV-8
generated successfully

Portal release:
SUCCESS

Email:
Recipient A → DELIVERED
Recipient B → DELIVERED
Recipient C → BOUNCED

Correct:
Generation = Success
Portal Release = Success
Email Delivery = Partial

Incorrect:
Report Run = Failed
```

## Next Sequential Audit Target

### **Design 135 — Analytics Executive Dashboard**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
