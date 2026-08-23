# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 081 — Lead Sources / Source Management

Design 081 should become the **canonical Team Workspace source-registry and acquisition-governance surface** for defining, configuring, enabling, disabling, monitoring, and executing the origins from which Lead Finder/Data Extraction acquires prospect evidence.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Source ≠ SourceConfiguration ≠ SourceCredential/Secret ≠ SourceRun ≠ RawObservation/RawRecord ≠ ProspectCandidate ≠ Lead ≠ Import ≠ Provenance.**

The central implementation rule is:

> **Design 081 manages where acquisition comes from and how a source may be executed. It does not create CRM Leads directly. Every acquisition run must preserve its exact Source/configuration context and immutable raw evidence so that downstream normalization, deduplication, ProspectCandidate creation, review, and eventual CRM admission remain traceable back to their origin.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                  |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **081**                                                                                                                                         |
| **Canonical name**                    | **Lead Sources / Source Management**                                                                                                            |
| **Product area**                      | Team Workspace / Lead Acquisition / Source Registry                                                                                             |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                |
| **Screen class**                      | Source Registry / Acquisition Configuration / Source Operations                                                                                 |
| **Classification**                    | **Lead Acquisition Source Registry & Provenance Anchor**                                                                                        |
| **Primary purpose**                   | Manage the origins from which Lead Finder/Data Extraction discovers candidate data without collapsing source acquisition into CRM Lead creation |
| **Canonical source entity**           | **Source**                                                                                                                                      |
| **Mutable operating definition**      | **SourceConfiguration**                                                                                                                         |
| **Secret/authentication dependency**  | **SourceCredential / SecretReference**                                                                                                          |
| **Execution entity**                  | **SourceRun**                                                                                                                                   |
| **Evidence entity**                   | **RawObservation / RawRecord**                                                                                                                  |
| **Candidate entity**                  | **ProspectCandidate** — Design 008                                                                                                              |
| **Extraction foundation**             | Design 009                                                                                                                                      |
| **Enrichment relationship**           | Design 010                                                                                                                                      |
| **CRM Lead destination**              | Design 011                                                                                                                                      |
| **Explicit admission/import concept** | **Import / CRM Admission**                                                                                                                      |
| **Lineage concept**                   | **Provenance**                                                                                                                                  |
| **Next detailed execution surfaces**  | Designs 082–083                                                                                                                                 |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                 |
| **Primary registry service**          | `LeadSourceRegistryService`                                                                                                                     |
| **Execution service**                 | `SourceRunService`                                                                                                                              |
| **Connector layer**                   | `SourceAdapterRegistry`                                                                                                                         |
| **Provenance service**                | `AcquisitionProvenanceService`                                                                                                                  |
| **Auth**                              | Required                                                                                                                                        |
| **Authorization**                     | OrganizationMembership + source-management/run/secret permissions                                                                               |
| **Implementation priority**           | **Critical Data Lineage / Acquisition Integrity / Secret Isolation**                                                                            |
| **Reuse level**                       | **Extremely High with Designs 008–010 and upcoming 082–083**                                                                                    |

Design 081 should answer:

> **“Which acquisition sources are registered, how are they configured, are they currently enabled and healthy, which credentials or connection capabilities do they require, when were they last run, and how can future acquisition continue without losing historical provenance?”**

Conceptually:

```text
Source Registry
      │
      ├── Source A
      │     ├── Configuration
      │     ├── Secret References
      │     └── SourceRuns
      │              │
      │              ↓
      │         RawObservation(s)
      │              │
      │              ↓
      │        Normalization
      │              │
      │              ↓
      │       ProspectCandidate
      │              │
      │              ↓
      │        Review / Import
      │              │
      │              ↓
      │             Lead
      │
      └── Source B ...
```

The critical progression remains:

> **Source → Run → Raw Evidence → Normalized Candidate → ProspectCandidate → Explicit CRM Admission → Lead**

Every stage is distinct.

---

# 2. Reuse

## Design 008 remains the canonical ProspectCandidate foundation

Design 008 already established:

> **ProspectCandidate ≠ Lead.**

Design 081 must preserve that completely.

A configured Source can discover:

```text
ProspectCandidate PC-101
```

but it must not silently create:

```text
Lead L-101
```

simply because a record was found.

---

## Design 009 remains the canonical acquisition/extraction engine

Design 009 established the acquisition chain:

> **ExtractionJob / Run → RawExtractionRecord → NormalizedCandidate → canonical CRM admission.**

Design 081 should manage the **source definitions and operating configuration** feeding that engine.

Correct:

```text
Design 081
Source definition/configuration
        ↓
Design 009
Data acquisition/extraction execution
        ↓
Design 008
Prospect candidate discovery/review
```

Not three independent acquisition implementations.

---

## Design 081 ≠ Design 009

### Design 081

Answers:

> What sources exist and how are they configured/controlled?

### Design 009

Answers:

> How is source data acquired and processed?

These screens can overlap operationally but must share one acquisition backend.

---

## Designs 082–083 should deepen, not duplicate, Design 081

Upcoming:

* **082 — Data Extraction Jobs / Extraction Runs**
* **083 — Extraction Review / Imported Records**

should reuse:

```text
Source
SourceConfiguration
SourceRun
RawObservation
ProspectCandidate
Import
Provenance
```

from Designs 081/009.

Design 081 should not build alternate run/review records that later have to be replaced.

---

## Reuse Design 010 for enrichment separately

A Source may provide:

* name,
* title,
* company,
* profile URL,
* email,
* phone,

but discovered values remain source observations.

Design 010 enrichment may later propose stronger/alternate values.

Permanent:

> **Source acquisition ≠ enrichment truth.**

---

## Reuse Design 011 CRM Lead only after admission

Once a ProspectCandidate is deliberately admitted to CRM:

```text
ProspectCandidate PC-100
      ↓
CRM Admission / Import
      ↓
Lead L-500
```

Design 011 becomes authoritative for the Lead.

Source management must not continue editing the Lead as though the Lead were still a raw source row.

---

## Source history remains useful after CRM admission

A Lead can retain provenance pointing back to:

```text
Lead
  ↓
Candidate
  ↓
Normalized source evidence
  ↓
RawObservation
  ↓
SourceRun
  ↓
Source
```

This creates explainability without making Source the CRM owner.

---

# 3. Entities

## Source

`Source` is the durable identity of an acquisition origin or provider.

Conceptually:

```text
Source
├── id
├── organizationId
├── source type
├── canonical name
├── provider/domain identity
├── lifecycle
├── ownership/context
├── current configuration reference
└── provenance classification
```

Exact schema belongs to Phase 3D.

---

## Source ≠ website URL alone

A source may conceptually represent:

* a website/domain,
* RSS/feed,
* event directory,
* speaker directory,
* company directory,
* public API,
* subscribed/licensed provider,
* uploaded acquisition feed,

depending on actual supported acquisition types.

The durable Source identity should not depend solely on one mutable URL string.

---

## Source ≠ Lead

Permanent.

A source can produce zero, one, or millions of candidate observations.

---

## Source ≠ ProspectCandidate

Permanent.

One Source can contribute evidence to many candidates.

One ProspectCandidate can also have provenance from multiple Sources.

---

## One candidate may have multiple sources

Example:

```text
ProspectCandidate PC-20
├── Source A → event speaker page
├── Source B → company leadership page
└── Source C → press release
```

Do not duplicate the candidate solely because multiple sources discovered the same person.

---

## Multiple sources ≠ lost provenance after dedupe

Critical.

Dedupe may decide:

> these observations refer to the same ProspectCandidate.

It must preserve all evidence edges:

```text
PC-20
├── Observation O1 → Source A
├── Observation O2 → Source B
└── Observation O3 → Source C
```

Not:

```text
PC-20
→ Source C only
```

because C was the most recent.

---

## SourceConfiguration

`SourceConfiguration` describes **how the Source should currently operate**.

Conceptually:

```text
SourceConfiguration
├── sourceId
├── configuration revision/version
├── endpoint/path rules
├── scheduling/rate policy
├── extraction parameters
├── connector settings
├── mapping hints
├── effectiveFrom
└── lifecycle
```

Exact fields depend on source type.

---

## Source ≠ SourceConfiguration

Permanent.

The Source is stable identity.

Configuration can change over time.

---

## Configuration changes should not rewrite historical runs

Critical.

Example:

```text
Source S1

Configuration v1
→ Run R1
→ Run R2

Configuration v2
→ Run R3
```

R1 and R2 must remain attributable to v1.

---

## SourceRun should pin configuration revision

Conceptually:

```text
SourceRun
├── sourceId
├── sourceConfigurationRevision
├── connector/adapter version
├── startedAt
├── endedAt
├── trigger
└── execution outcome
```

This makes historical acquisition reproducible/explainable.

---

## Current configuration ≠ run configuration

Never reconstruct an old run using today's config and pretend it is the historical setup.

---

## SourceConfiguration ≠ SourceCredential

A configuration can say:

> use Acme Data Provider API

without containing the raw API secret.

Correct:

```text
SourceConfiguration
→ credentialReferenceId
```

not:

```text
SourceConfiguration
{
  apiKey: "secret..."
}
```

---

## SourceCredential ≠ raw secret value

Prefer a model such as:

```text
SourceCredential
├── id/reference
├── provider/type
├── secret storage reference
├── lifecycle/status
├── rotatedAt
└── lastValidatedAt
```

while the actual secret material lives in a secure secret-management/encrypted boundary.

---

## Secrets must not enter ordinary read models

Design 081 may show:

> Credential connected
> Credential expired
> Reconnect required

but should not return the complete credential secret to the browser merely because the user can manage a Source.

---

## Manage Source ≠ reveal Secret

These permissions must remain separate.

---

## Secret rotation ≠ Source recreation

If API credentials rotate:

```text
Source S1 remains S1
```

and future runs use the new credential reference/version.

Historical runs remain unchanged.

---

## Credential expired ≠ Source deleted

Permanent.

---

## SourceRun

`SourceRun` represents one concrete acquisition execution.

A Source can have many runs:

```text
Source S1
├── Run R1
├── Run R2
├── Run R3
└── Run R4
```

---

## SourceRun ≠ Source

Permanent.

Do not store:

```text
source.lastRunPayload
```

as the sole execution history.

---

## SourceRun ≠ Import

A run acquires/processes data.

Import/CRM Admission moves selected candidate data into canonical CRM.

These may be separated by review.

---

## SourceRun ≠ RawObservation

One run can emit many observations.

```text
Run R-20
├── Observation O1
├── Observation O2
├── Observation O3
└── ...
```

---

## RawObservation / RawRecord

A raw record is source evidence captured during acquisition.

Conceptually:

```text
RawObservation
├── id
├── sourceId
├── sourceRunId
├── externalSourceRecordId where available
├── fetchedAt
├── observedAt where known
├── source locator
├── raw payload/reference
├── content hash
├── media/content type
└── provenance metadata
```

---

## RawObservation should be append-oriented/immutable

Once captured as evidence, do not rewrite its raw content because:

* normalization improved,
* Source changed,
* Candidate changed,
* Lead was edited.

A new acquisition can create a new observation.

---

## RawObservation ≠ normalized data

Permanent.

Source may say:

```text
"VP, AI & ML"
```

Normalization may interpret:

```text
jobTitle = "Vice President, Artificial Intelligence & Machine Learning"
```

The raw source value remains preserved.

---

## RawObservation ≠ ProspectCandidate

A raw observation can be:

* incomplete,
* duplicate,
* malformed,
* unrelated,
* unusable,
* ambiguous.

Candidate creation follows processing/resolution policy.

---

## RawObservation ≠ current webpage truth forever

A snapshot captured at T1 remains evidence of what was observed at T1.

The page may change at T2.

Do not mutate the old observation to match the new page.

---

## Source locator should be preserved

Where applicable:

* source URL,
* provider record ID,
* page/entity identifier,
* acquisition timestamp

should remain available for provenance.

This does not imply publicly exposing every URL or secret provider identifier.

---

## NormalizedCandidate ≠ ProspectCandidate necessarily

The extraction pipeline may temporarily create normalized candidate representations before deduplication/entity resolution.

Conceptually:

```text
RawObservation
      ↓
Normalization
      ↓
NormalizedCandidate
      ↓
Dedupe / identity resolution
      ↓
ProspectCandidate
```

---

## ProspectCandidate ≠ Lead

Permanent and central.

A discovered CEO does not become a CRM Lead until the platform's explicit admission rule is satisfied.

---

## Import ≠ SourceRun

`Import` should represent explicit movement/admission of reviewed candidate data into CRM or another governed destination.

A run that finds 10,000 records should not automatically mean 10,000 CRM Leads were imported.

---

## Import should preserve candidate/source lineage

Correct:

```text
Lead L1
→ CRMAdmission / ImportRecord
→ ProspectCandidate PC1
→ Observation O1/O2
→ SourceRun
→ Source
```

---

## Import ≠ copy-and-forget

Do not throw away candidate/source references after Lead creation.

Provenance survives CRM admission.

---

## Provenance

`Provenance` is lineage/evidence explaining:

* where a value came from,
* when it was observed,
* in which run,
* under which source configuration,
* how it reached the candidate/Lead.

It should not be flattened into one string such as:

```text
source = "LinkedIn"
```

for a multi-source history.

---

## Provenance can be field-level

Example:

```text
ProspectCandidate PC1

Name
→ company bio page

Title
→ conference speaker page

Email
→ enrichment provider

Company
→ corporate site
```

This is more robust than one candidate-level source label.

Exact implementation depth belongs to Phase 3D, but architecture should not block it.

---

## Provenance ≠ confidence

Source lineage says where the value came from.

Confidence says how strongly the system believes/interprets it.

They may correlate but remain separate.

---

## Provenance ≠ authorization

Knowing a source URL does not mean the user has permission to manipulate source configuration or credentials.

---

## Dedupe ≠ provenance deletion

Critical.

When:

```text
PC-A
+
PC-B
→ same person
```

merge/resolution must preserve prior observation/source lineage.

---

## Lead edits ≠ provenance rewrite

A sales rep may change a Lead's current job title.

That does not rewrite what Source S1 observed last month.

---

## Source disabling

Disabling should mean:

> No new routine acquisition runs should start from this Source.

It must not mean:

* delete past runs,
* delete RawObservations,
* delete Candidates,
* delete Leads,
* erase provenance.

---

## Disabled ≠ archived

Potentially separate lifecycle concepts:

### Disabled

Temporarily not acquiring.

### Archived

No longer actively maintained/discoverable in routine source operations.

Historical evidence still remains.

Exact frozen UI terminology controls display.

---

## Source deletion should not erase referenced history

If physical deletion is ever allowed, referential/evidence policies must preserve necessary historical provenance.

Prefer archival/deactivation over destructive deletion where historical candidate/CRM evidence depends on the Source.

---

## Source failure ≠ downstream Lead invalidation

Critical.

If today's API call fails:

```text
SourceRun R50 = FAILED
```

that does not invalidate Leads created months ago from successful earlier evidence.

---

## Current Source health ≠ historical evidence reliability automatically

A provider outage today does not make yesterday's captured evidence nonexistent.

---

# 4. Permissions

Design 081 combines configuration, acquisition execution, credentials, and potentially high-volume external access.

Capabilities should be separated conceptually:

```text
source.read
source.create
source.configure
source.enableDisable
source.run
source.archive
source.credentials.manage
source.credentials.validate
source.history.read
source.rawEvidence.read
source.provenance.read
```

Exact permission keys Phase 3D.

---

## Source view ≠ Source configuration

An analyst may inspect available sources without being allowed to modify them.

---

## Source configuration ≠ credential management

Critical.

A user allowed to change:

* extraction rule,
* schedule,
* category,

should not automatically see/replace API credentials.

---

## Credential management ≠ secret reveal

Even privileged operators usually need:

* set,
* rotate,
* replace,
* validate

rather than:

> show me the existing plaintext API key.

---

## Secret write should be one-way where practical

The UI can accept a new secret and return:

> Connected / saved

without returning it again.

---

## Run permission ≠ config permission

An operator can potentially execute a configured Source without editing its configuration.

---

## Run permission ≠ CRM import permission

Critical.

Someone allowed to acquire candidates should not automatically be able to admit them into Sales CRM.

---

## Candidate review ≠ source administration

Design 008/083 reviewers need not be credential/source administrators.

---

## CRM Lead permissions remain separate

Design 011 controls Lead visibility/editing after admission.

---

## Organization scope

Every Source, Configuration, Run, Observation and resulting Candidate relationship must remain tenant-scoped.

No cross-organization source data leakage.

---

## Shared provider ≠ shared tenant evidence automatically

Two Organizations might use the same external provider.

Their:

* credentials,
* configurations,
* runs,
* raw results,
* candidates

remain isolated.

---

## Raw evidence can be more sensitive than Source metadata

Someone may be allowed to know:

> Conference Speaker Source is enabled

without seeing all acquired personal/contact data.

Read permissions should respect this difference.

---

## Provenance visibility

Users who can inspect a Candidate/Lead may need safe provenance.

But internal connector secrets/provider account identifiers should not leak through provenance DTOs.

---

## Direct Run ID reauthorization

Knowing a SourceRun ID does not grant access.

---

## Direct RawObservation ID reauthorization

Same.

---

## External-fetch security

For Sources based on URLs/endpoints, backend must protect against:

* SSRF,
* internal network access,
* cloud metadata endpoints,
* unsupported schemes,
* malicious redirects,
* DNS rebinding where relevant.

A source administrator should not gain arbitrary internal-network fetch capability.

---

## Source URL validation

Server-side controls should define allowed:

* protocols,
* destinations,
* source classes,
* redirect policies,

according to connector type.

---

## Connector execution ≠ arbitrary code execution

A source configuration must not allow a user to submit arbitrary executable code to the acquisition worker unless a separately sandboxed capability exists.

No such capability is introduced here.

---

## Rate/provider policy

Source execution must respect:

* configured provider rate limits,
* system safeguards,
* legal/licensing policies where applicable.

Users should not bypass these by repeated manual-run requests.

---

# 5. States

Design 081 must keep **Source lifecycle, configuration validity, credential health, operational health, SourceRun lifecycle, and downstream processing state** separate.

### Source lifecycle

```text
Enabled
Disabled
Archived
```

where applicable.

### Configuration state

```text
Configured
Incomplete
Invalid
Updating
```

### Credential state

```text
Not Required
Connected
Missing
Invalid
Expired
Revoked
Validation Unknown
```

### Source operational health

```text
Healthy
Degraded
Failing
Unknown
```

### SourceRun lifecycle

```text
Queued
Starting
Running
Partially Succeeded
Succeeded
Failed
Cancelled
Outcome Unknown
```

### Processing state

```text
Raw Captured
Normalization Pending
Normalization Complete
Candidate Resolution Pending
Candidate Resolution Complete
Review Pending
```

as applicable.

These must not collapse into one `source.status`.

---

## Enabled ≠ healthy

Permanent.

A Source can be enabled but failing.

---

## Disabled ≠ failed

Permanent.

A disabled Source may be perfectly configured and healthy; it simply should not run.

---

## Archived ≠ deleted

Permanent.

Historical evidence remains.

---

## Credential valid ≠ Source healthy

The external provider can be unavailable despite valid credentials.

---

## Credential invalid ≠ Configuration invalid necessarily

The endpoint/configuration can be correct while secret has expired.

---

## Source healthy ≠ last Run successful forever

Health can change.

---

## Run failed ≠ Source disabled

Permanent.

One execution failure should not automatically disable the Source unless an explicit governed circuit-breaker policy does so.

---

## Run succeeded ≠ candidates imported

Permanent.

---

## Run succeeded ≠ zero candidates impossible

A legitimate SourceRun can succeed and find zero new records.

---

## Zero records ≠ failed run

Permanent.

---

## Unknown record count ≠ zero

Critical.

---

## Partial success ≠ full success

Example:

```text
100 pages planned
82 fetched
18 failed
```

must not be represented as a clean full success.

---

## Partial success ≠ full failure

Also important.

Usable acquired evidence from successful portions should remain traceable.

---

## Outcome unknown ≠ failed

If a provider job was accepted asynchronously and status check fails:

verify/reconcile before rerunning where duplication could matter.

---

## Configuration change while Run active

The active Run must continue against its **pinned configuration snapshot/revision**.

It must not switch halfway to a newly edited configuration.

---

## Source disabled while Run active

Policy must deliberately define whether:

* current Run finishes,
* gets cancelled safely,
* stops at checkpoint.

Do not make disabling mutate already captured evidence.

---

## Credential rotated while Run active

Same principle: a run's execution context should remain coherent and auditable.

---

## Source unavailable ≠ historical records unavailable

Historical Runs/Provenance should remain viewable independently of current provider availability.

---

## Raw-processing failure ≠ SourceRun acquisition failure necessarily

Example:

```text
Fetch succeeded
Normalization worker failed
```

The raw evidence should remain and be retryable for downstream processing.

Do not fetch the source again unnecessarily just to recover normalization.

---

## Candidate rejection ≠ source failure

A discovered record can be rejected during review while the Source/Run was perfectly successful.

---

## Duplicate candidate ≠ extraction error

Deduplication is an expected downstream outcome.

---

## State Coverage

Design 081 inherits Design 150 plus:

```text
Sources Loading
Sources Available
Sources Empty
Source Detail Restricted

Source Enabled
Source Disabled
Source Archived

Configuration Valid
Configuration Incomplete
Configuration Invalid
Configuration Updating

Credential Connected
Credential Missing
Credential Invalid
Credential Expired
Credential Revoked
Credential Validation Unavailable

Source Healthy
Source Degraded
Source Failing
Source Health Unknown

Run Queued
Run Starting
Run Running
Run Partially Succeeded
Run Succeeded
Run Failed
Run Cancelled
Run Outcome Unknown

Run Found Zero Records
Run Record Count Unknown

Raw Evidence Captured
Normalization Pending
Normalization Failed
Candidate Resolution Pending

Source Disabled During Run
Configuration Changed After Run Start
Provider Temporarily Unavailable

Partial Source-Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize source administration and operational visibility.

Conceptually:

```text
Lead Sources
↓
Source summary / controls if frozen
↓
Source list
    ├── source name/type
    ├── enabled/disabled state
    ├── configuration readiness
    ├── credential status
    ├── health
    ├── last run
    ├── last run outcome
    └── source action
```

Only fields/actions actually present in the frozen Design 081 should render.

---

## Distinguish lifecycle from health

Avoid one ambiguous badge such as:

> Active

that could mean:

* enabled,
* connected,
* healthy,
* currently running.

These are different dimensions.

---

## Credential state should not expose secret material

Desktop may show:

> API connection valid

not the raw credential.

---

## Run history summary should remain source-linked

If frozen Design 081 surfaces recent runs, they should identify:

* when,
* result,
* records acquired,
* current processing state,

without turning Design 081 into the full Design 082 execution workspace.

---

## Tablet

Following Design 152:

* source rows can become structured cards,
* lifecycle and health remain distinct,
* run/credential state remains readable,
* configuration actions remain touch-safe,
* secrets never appear because of responsive simplification.

---

## Mobile

Priority:

```text
Source
↓
Source Name / Type
↓
Enabled / Disabled
↓
Health
↓
Credential / Configuration readiness
↓
Last Run
↓
Allowed Source Action
```

No compressed desktop operations table.

---

## Mobile status clarity

Use semantic labels:

> Enabled · Healthy

rather than one green dot.

Example:

> Enabled · Credential expired

must also remain possible and understandable.

---

## Long endpoints/source names

URLs/provider names must wrap/truncate safely without exposing hidden tokens/query secrets.

---

## Accessibility

A source card should communicate something equivalent to:

> Executive Events Directory. Source enabled. Configuration valid. Credential not required. Health healthy. Last run today at 9:30 AM, succeeded with 143 raw records.

where canonical data supports it.

---

## Secret field accessibility

If frozen configuration allows entering a secret:

* label field clearly,
* use proper password/secret semantics,
* do not pre-fill plaintext existing secret,
* announce saved/validation result safely.

---

# 7. Backend Requirements

## Source registry architecture

```text
Design 081
    ↓
Authenticated Workspace Context
    ↓
LeadSourceRegistryService
    │
    ├── Source
    ├── current SourceConfiguration
    ├── credential status projection
    ├── operational health
    ├── recent SourceRun summary
    └── safe provenance metadata
    ↓
LeadSourceManagementView
```

---

## Source adapter registry

A typed connector registry should conceptually define:

```text
SourceAdapterDefinition
├── sourceType
├── configuration schema
├── credential requirements
├── validation strategy
├── acquisition adapter
├── rate/concurrency policy
├── health-check capability
├── normalization handoff
└── provider/source metadata
```

This prevents arbitrary one-off source code paths.

---

## Configuration must be type-safe

Different source classes may require different settings.

Use validated discriminated configuration schemas.

Avoid:

```text
configurationJson: any
```

with unchecked runtime behavior.

A JSON storage column can still be used internally if validated against a versioned schema.

---

## Source configuration revisioning

Material config changes should produce:

```text
SourceConfigurationRevision
```

or equivalent immutable snapshot/version.

SourceRun pins that revision.

---

## Configuration validation

Before enabling/running:

* required fields present,
* URLs/endpoints valid,
* credential reference appropriate,
* connector-specific rules valid.

Validation result remains separate from Source health.

---

## Secret management architecture

Prefer:

```text
SourceCredentialReference
       ↓
Secrets/KMS/Vault-style protected store
```

rather than plaintext secrets in ordinary application tables.

---

## Encryption

Where credentials must be persisted by the application:

* strong encryption at rest,
* controlled encryption keys,
* rotation capability,
* minimal decryption surface.

---

## Secret redaction

Explicitly redact credentials from:

* logs,
* exceptions,
* tracing,
* Audit change payloads,
* analytics,
* source config exports.

---

## Credential validation

A narrow service can conceptually provide:

```text
validateSourceCredential(sourceId)
```

without returning the secret.

---

## Credential update

Prefer:

```text
setSourceCredential(sourceId, newSecret)
```

with one-way UI behavior.

No generic:

```text
GET /source/:id/credential
```

returning plaintext.

---

## Run initiation

Conceptually:

```text
startSourceRun(sourceId, triggerContext)
```

must:

1. authorize actor;
2. ensure Source enabled or manual-run policy permits it;
3. resolve current valid configuration revision;
4. resolve credential securely;
5. create SourceRun;
6. pin Source/config/adapter revision;
7. enqueue execution.

---

## Manual run ≠ direct synchronous scraping request

Prefer durable queued execution for potentially long-running acquisition.

This provides:

* retries,
* observability,
* idempotency,
* cancellation,
* rate control.

---

## Scheduler and manual triggers should share the same run engine

Do not create:

```text
manualExtractionBackend
scheduledExtractionBackend
```

with different semantics.

Both create canonical SourceRuns.

---

## SourceRun trigger

Conceptually preserve:

```text
MANUAL
SCHEDULED
RETRY
SYSTEM
```

or equivalent provenance for why the Run occurred.

---

## Run idempotency

Scheduler retries or double-clicked manual execution must not accidentally create duplicate equivalent Runs if the trigger policy intends one execution.

Use stable trigger/idempotency keys where applicable.

---

## Concurrent run policy

Per-source/provider policy should decide whether:

* parallel Runs allowed,
* second run queued,
* duplicate rejected.

Do not let uncontrolled concurrency violate provider rate limits or duplicate acquisition.

---

## Connector execution isolation

Adapters should run behind controlled network/security boundaries.

For URL sources:

* prevent SSRF,
* limit redirects,
* restrict protocols,
* enforce timeouts,
* constrain response sizes,
* protect internal networks.

---

## Acquisition pipeline

```text
SourceRun
    ↓
SourceAdapter
    ↓
RawObservation Writer
    ↓
Normalization Pipeline
    ↓
Candidate Resolution / Dedupe
    ↓
ProspectCandidate
```

No direct Lead mutation.

---

## Raw-first persistence

Where practical, persist raw evidence before normalization.

This allows:

* reprocessing,
* debugging,
* improved normalization,
* lineage reconstruction

without repeatedly fetching the provider.

---

## Raw payload storage

Depending on size/type:

* database metadata + object storage,
* compressed blob storage,
* immutable object reference,

may be appropriate.

The important rule is exact evidence preservation and access control.

---

## Content hashing

Useful for:

* duplicate raw records,
* change detection,
* immutable evidence verification.

Do not use content hash alone as person/company identity.

---

## External source record IDs

When providers expose stable record IDs, preserve them.

Use them for acquisition dedup/version tracking but do not assume every Source provides one.

---

## Run checkpointing

Long extraction jobs should support resumable/checkpointed execution where appropriate.

A worker crash should not necessarily restart the entire Source from zero.

---

## Run retries

Retry transient failures with:

* bounded backoff,
* provider limits,
* idempotency awareness.

Do not retry permanent authentication/configuration errors indefinitely.

---

## Outcome-unknown handling

For async provider jobs:

```text
SourceRun → OUTCOME_UNKNOWN
```

should trigger status reconciliation before duplicating the job.

---

## Raw observation uniqueness/dedupe

Dedupe raw acquisitions using source-specific identity where possible:

```text
sourceId
+
externalRecordId
+
observation revision/hash
```

rather than simplistic title/email matching.

---

## Normalization pipeline

Normalization must preserve:

```text
rawValue
normalizedValue
normalizer version
provenance link
```

where appropriate.

---

## Normalizer changes

If normalization logic improves later:

old RawObservations can be reprocessed into a new normalized result while preserving old evidence.

Do not rewrite the original observation.

---

## Candidate resolution

A `ProspectCandidateResolver` should determine whether normalized evidence:

* creates new Candidate,
* enriches existing Candidate,
* is duplicate,
* is ambiguous,
* requires review.

---

## Dedupe provenance

When evidence attaches to an existing Candidate:

append provenance.

Do not overwrite previous source lineage.

---

## CRM admission boundary

Critical command should conceptually be separate:

```text
admitProspectCandidateToCRM(candidateId, ...)
```

or a bulk Import/Review operation later in Design 083.

It is not part of `SourceRunService`.

---

## Import batch

If multiple Candidates are admitted together, model an Import/admission operation with per-record outcomes.

Do not equate:

```text
SourceRun
=
ImportBatch
```

because one Run may have many review/admission sessions.

---

## Lead creation idempotency

The CRM admission layer should prevent repeated review/import from creating duplicate Leads for the same accepted CRM identity.

Design 081 must preserve enough provenance to support that later.

---

## Source disable command

Prefer a narrow command:

```text
disableSource(sourceId)
```

that:

* stops future scheduling/new routine runs,
* records actor/time,
* preserves configuration/history/evidence.

No cascade deletion.

---

## Source archive command

If frozen product supports it, archival remains distinct from deletion and future-run disabling.

---

## Source deletion

If implemented at all, it requires strict referential checks and historical-evidence policy.

A generic `DELETE source` cascade is unsafe.

---

## Source health service

Health should derive from signals such as:

* configuration validity,
* credential validation,
* provider connectivity,
* recent Run outcomes,
* rate-limit state.

But do not reduce all of them into one destructive status field.

---

## Health snapshot ≠ Run state

One can inform the other without becoming the same entity.

---

## Historical run metrics

Useful operational summaries:

* records attempted,
* raw records captured,
* pages processed,
* duplicates,
* rejected/invalid raw entries,
* errors.

These should remain run/extraction metrics, not CRM Lead counts unless explicitly named.

---

## “Leads found” terminology

Be careful.

Before CRM admission, the technically correct entity is usually:

> prospects/candidates found

not:

> Leads created.

UI wording should follow the frozen design, but backend semantics must remain correct.

---

## Provenance graph

Conceptually:

```text
Source
  ↓
SourceConfigurationRevision
  ↓
SourceRun
  ↓
RawObservation
  ↓
NormalizedEvidence
  ↓
ProspectCandidate
  ↓
CRMAdmission
  ↓
Lead
```

Each arrow should remain reconstructable.

---

## Field-level provenance

Candidate/Lead field lineage can reference one or more source observations.

Example:

```text
Lead.currentTitle
├── originating observation
├── enrichment confirmation
└── later manual CRM edit
```

Current CRM value and historical source evidence remain different.

---

## Event/outbox integration

Useful events:

```text
SourceCreated
SourceConfigurationChanged
SourceEnabled
SourceDisabled
SourceCredentialRotated
SourceRunStarted
SourceRunCompleted
SourceRunFailed
RawObservationsCaptured
ProspectCandidatesResolved
```

can drive:

* activity,
* monitoring,
* later extraction screens.

---

## Audit integration

Material administration events should be auditable:

* Source created,
* configuration changed,
* enabled/disabled,
* credential reference changed,
* manual Run initiated.

Never audit raw secrets.

---

## Notification integration

Operational failure notifications can use Design 080 infrastructure.

But:

> SourceRun failed notification ≠ SourceRun state.

---

## Search integration

Design 079 can search safe Source metadata if appropriate.

Do not index:

* secrets,
* raw sensitive payloads,
* private credential errors.

---

## Cache

Source-management read models can be cached by:

```text
organizationMembership
source revision
configuration revision
credential-status revision
health revision
permission revision
```

with secrets excluded entirely.

---

## Partial failure handling

Example:

```text
Source registry       ✓
Configuration         ✓
Credential health     ✕
Recent runs           ✓
```

Design 081 should still render known Source state with:

> Credential validation temporarily unavailable

rather than marking the Source invalid/deleted.

---

## Backend Requirement Matrix

| Requirement                                                | Status                    |
| ---------------------------------------------------------- | ------------------------- |
| Authenticated Team Workspace                               | **Critical**              |
| Organization/tenant isolation                              | **Critical**              |
| Canonical Source entity                                    | **Critical**              |
| Source/Lead separation                                     | **Critical**              |
| Source/ProspectCandidate separation                        | **Critical**              |
| Source/SourceConfiguration separation                      | **Critical**              |
| Versioned configuration/snapshot semantics                 | **Critical**              |
| SourceRun pins exact config revision                       | **Critical**              |
| SourceConfiguration/Credential separation                  | **Critical**              |
| Secret-reference model                                     | **Critical**              |
| No plaintext secrets in ordinary tables/DTOs               | **Critical**              |
| Secret encryption/protected storage                        | **Critical**              |
| Secret log/Audit redaction                                 | **Critical**              |
| Source read/configure/credential/run permission separation | **Critical**              |
| Canonical SourceRun entity                                 | **Critical**              |
| One Source → many SourceRuns                               | **Critical**              |
| Manual/scheduled run engine reuse                          | **Critical**              |
| Durable asynchronous execution                             | **Critical**              |
| Run idempotency                                            | **Critical**              |
| Controlled concurrent-run policy                           | **Critical**              |
| Adapter/connector registry                                 | **Critical**              |
| Typed configuration schemas                                | **Critical**              |
| URL/endpoint validation                                    | **Critical**              |
| SSRF/internal-network protection                           | **Critical**              |
| Connector timeout/size/rate controls                       | **Critical**              |
| RawObservation canonical evidence                          | **Critical**              |
| Raw/normalized separation                                  | **Critical**              |
| Raw evidence immutability                                  | **Critical**              |
| Raw-first persistence where feasible                       | **Critical**              |
| Source locator/external ID preservation                    | **Critical**              |
| Content hashing/version evidence                           | **Required**              |
| Normalization lineage                                      | **Critical**              |
| Normalizer-version provenance                              | **Required**              |
| Candidate resolution/dedupe                                | **Critical**              |
| Multi-source Candidate provenance                          | **Critical**              |
| Dedupe without provenance loss                             | **Critical**              |
| ProspectCandidate/Lead separation                          | **Critical**              |
| Explicit CRM admission/import boundary                     | **Critical**              |
| SourceRun/Import separation                                | **Critical**              |
| Candidate import idempotency                               | **Critical**              |
| Historical provenance survives Lead creation               | **Critical**              |
| Source disable/history preservation                        | **Critical**              |
| Source archive/delete separation                           | **Critical**              |
| Source failure/downstream history separation               | **Critical**              |
| Config change/active Run isolation                         | **Critical**              |
| Credential rotation/history isolation                      | **Critical**              |
| Health/lifecycle/run-state separation                      | **Critical**              |
| Partial-success modeling                                   | **Critical**              |
| Zero records/failure separation                            | **Critical**              |
| Outcome-unknown reconciliation                             | **Required**              |
| Event/outbox integration                                   | **Required**              |
| Audit without secrets                                      | **Critical**              |
| Design 080 operational-notification reuse                  | **Required**              |
| Design 079 safe search integration                         | **Required**              |
| Designs 008–010 backend reuse                              | **Critical**              |
| Designs 082–083 future reuse                               | **Critical architecture** |

---

# 8. Consolidation

Design 081 exposes several significant acquisition/data-lineage risks.

**Source / Lead conflation**
Adding a source creates CRM Leads directly.

**Source / ProspectCandidate conflation**
One source is treated as one prospect.

**Source / SourceConfiguration conflation**
Editing configuration rewrites Source identity/history.

**Current configuration / historical run configuration conflation**
Old Runs become unreproducible.

**SourceConfiguration / Credential conflation**
API keys appear inside ordinary JSON configuration.

**Credential reference / raw secret conflation**
Read DTO exposes usable provider secret.

**Source configuration permission / secret reveal permission conflation**
Source editor can steal credentials.

**Credential rotation / Source recreation conflation**
Historical lineage breaks every time key changes.

**Credential invalid / Source deleted conflation**
Temporary secret issue destroys registry identity.

**Source / SourceRun conflation**
Only `lastRun` exists; execution history is lost.

**Run / Import conflation**
Every extraction automatically becomes CRM admission.

**Run / raw observation conflation**
One run stores only aggregate result and loses individual evidence.

**RawObservation / normalized candidate conflation**
Cleaning source data destroys original evidence.

**RawObservation / ProspectCandidate conflation**
Malformed/duplicate observations create duplicate candidates.

**NormalizedCandidate / Lead conflation**
Normalization bypasses candidate review/CRM admission.

**ProspectCandidate / Lead conflation**
Every found person contaminates canonical Sales CRM.

**Import / Lead source conflation**
CRM admission history cannot explain what was accepted or rejected.

**Dedupe / provenance deletion conflation**
Merging Candidates throws away secondary sources.

**Latest source / only source conflation**
Historical multi-source evidence disappears.

**Provenance / one source label conflation**
Field-level lineage cannot be reconstructed.

**Provenance / confidence conflation**
“Where did this come from?” becomes “How sure are we?”

**Lead edit / source evidence rewrite conflation**
CRM edits mutate historical observations.

**Current webpage / historical observation conflation**
Old evidence changes when source content changes.

**Source disabled / history deleted conflation**
Turning off acquisition destroys Leads/Candidates/Runs.

**Disabled / failed conflation**
Intentionally inactive source appears broken.

**Enabled / healthy conflation**
Enabled source with expired credentials appears healthy.

**Credential valid / provider healthy conflation**
Good secret masks provider outage.

**Source health / Run status conflation**
One failed Run permanently marks Source failed.

**Run failed / downstream Lead invalid conflation**
Current outage damages old CRM data.

**Run succeeded / imported conflation**
Successful fetch is reported as Lead creation.

**Run succeeded / records > 0 assumption**
Legitimate zero-result Run appears failed.

**Zero / unknown conflation**
Unavailable count becomes 0.

**Partial success / success conflation**
Missing pages/data are hidden.

**Partial success / failure conflation**
Useful captured evidence is discarded.

**Outcome unknown / failed conflation**
Asynchronous provider job is rerun and duplicates acquisition.

**Configuration changed mid-run**
A Run becomes internally inconsistent.

**Credential rotated mid-run / history mutation**
Execution lineage becomes ambiguous.

**Disabling source mid-run / raw evidence deletion**
Captured records disappear.

**Normalization failure / refetch conflation**
System repeatedly calls provider instead of reprocessing retained raw evidence.

**Candidate rejected / Source failed conflation**
Review outcome corrupts source health.

**Duplicate candidate / extraction error conflation**
Normal dedupe is treated as pipeline failure.

**Source type / arbitrary executable connector conflation**
Configuration becomes remote-code execution.

**Source URL / unrestricted backend fetch conflation**
Source management becomes SSRF gateway.

**External provider / internal network conflation**
User configures cloud metadata/private network URLs.

**Source admin / CRM importer conflation**
Acquisition operator can populate Sales CRM without review.

**Candidate reviewer / secret administrator conflation**
Lead reviewer gains credential access.

**Shared external provider / shared tenant data conflation**
Organization A sees Organization B's extraction results.

**Raw evidence / Source metadata permission conflation**
Users who can list Sources see all acquired personal/contact data.

**Audit configuration / secret logging conflation**
API tokens land in Audit history.

**Search indexing / secret indexing conflation**
Universal Search exposes provider credentials.

**081/008 duplicate Lead Finder backend**
Source manager creates a second ProspectCandidate model.

**081/009 duplicate extraction backend**
Source manager implements independent scraping jobs.

**081/010 duplicate enrichment truth**
Source observations overwrite enrichment semantics.

**081/011 duplicate CRM Lead model**
Acquisition records become Sales CRM records.

**081/082 duplicate run model**
Later Extraction Jobs creates incompatible SourceRun identity.

**081/083 duplicate import/review model**
Source screen prematurely owns CRM-admission state.

No additional screen is required.

These are **source identity, configuration versioning, secret isolation, run execution, raw evidence immutability, candidate resolution, CRM admission, provenance, tenant security, and historical lineage requirements**.

---

# 9. Implementation Verdict

## **PASS — LEAD ACQUISITION SOURCE REGISTRY, RUN ORIGINATION & PROVENANCE GOVERNANCE ANCHOR**

**Domain directive:**
**Source ≠ SourceConfiguration ≠ SourceCredential/Secret ≠ SourceRun ≠ RawObservation/RawRecord ≠ ProspectCandidate ≠ Lead ≠ Import ≠ Provenance.**

**Source directive:**
`Source` is the stable acquisition-origin identity. It defines where acquisition originates but never becomes a Candidate, Lead, Run, credential, or raw record.

**Configuration directive:**
mutable SourceConfiguration remains separate from Source identity. Material configuration revisions must be snapshot/version-aware so every historical SourceRun remains attributable to the exact configuration under which it executed.

**Credential directive:**
credentials/secrets remain outside ordinary SourceConfiguration and are represented through protected credential/secret references. Source administration never implies plaintext secret retrieval.

**Secret-security directive:**
provider secrets are encrypted/protected, minimally decryptable, excluded from ordinary DTOs, logs, traces, analytics, search documents and Audit change payloads.

**Permission directive:**
Source read, configuration management, enable/disable, Run initiation, raw-evidence access, CRM admission and credential management remain separate authorization capabilities.

**Adapter directive:**
all acquisition source types use a governed typed SourceAdapter registry with versioned/validated configuration contracts rather than one-off scraping code or arbitrary executable configuration.

**Network-security directive:**
URL/network-based Sources must operate through a constrained acquisition network layer with SSRF protection, safe protocols/redirect policies, internal-network restrictions, timeouts, response-size controls and provider-rate safeguards.

**Run directive:**
each acquisition execution becomes a canonical SourceRun bound to one Source, exact SourceConfiguration revision, connector version and trigger context. One Source can have unlimited historical Runs without overwriting prior execution evidence.

**Scheduling directive:**
manual and scheduled acquisition both invoke the same canonical SourceRun engine. They do not create parallel extraction backends.

**Run-idempotency directive:**
scheduler retries, double clicks and uncertain provider execution must be handled using idempotency/concurrency rules appropriate to the Source so duplicate acquisition jobs are not created unnecessarily.

**Raw-evidence directive:**
RawObservation/RawRecord is append-oriented acquisition evidence preserving source/run lineage, external identifiers/locators, observation/fetch timing and exact raw representation or immutable storage reference.

**Evidence directive:**
normalization, enrichment, Candidate edits and CRM edits never rewrite historical raw evidence.

**Normalization directive:**
RawObservation and normalized interpretation remain distinct. Improved normalization may reprocess retained evidence with explicit normalizer lineage rather than changing the original observation.

**Candidate directive:**
Design 008 remains the canonical ProspectCandidate layer. Normalized observations are deduplicated/resolved into Candidates through explicit identity-resolution logic rather than directly becoming Leads.

**Multi-source directive:**
one ProspectCandidate may accumulate evidence from multiple Sources/Runs, and deduplication must preserve every legitimate provenance edge rather than retaining only the latest source.

**CRM directive:**
Design 011 remains the canonical Lead CRM. A ProspectCandidate becomes or links to a Lead only through explicit governed CRM admission/import, never simply because a SourceRun succeeded.

**Import directive:**
Import/CRM Admission is separate from SourceRun and may operate on reviewed candidate selections with per-record outcomes. One SourceRun can feed multiple review/admission operations.

**Provenance directive:**
the complete lineage **Source → Config Revision → SourceRun → RawObservation → Normalized Evidence → ProspectCandidate → CRM Admission → Lead** must remain reconstructable.

**Field-provenance directive:**
architecture should allow field-level provenance where different Candidate/Lead attributes originate from different Sources, enrichment providers or later manual CRM edits.

**Disable directive:**
disabling a Source stops future applicable acquisition but never cascades into deletion of SourceRuns, RawObservations, ProspectCandidates, Leads, Imports or Provenance.

**Archive directive:**
archival/deactivation and destructive deletion remain separate concepts. Historical acquisition evidence must survive source retirement.

**Failure directive:**
current Source failures affect current/future acquisition only. They never invalidate downstream Leads or rewrite successful historical Runs/evidence.

**State directive:**
Source lifecycle, configuration validity, credential validity, operational health, SourceRun state and downstream processing state remain independent dimensions. `Enabled`, `Healthy`, `Credential Valid`, and `Last Run Succeeded` are never one boolean.

**Partial-success directive:**
Runs can succeed fully, partially, fail, or legitimately return zero observations. `0`, `unknown`, `partial`, and `failed` must remain distinct.

**Processing directive:**
raw acquisition and downstream normalization/candidate resolution are recoverable stages. A normalization failure should not require refetching already captured raw evidence.

**Audit directive:**
Source creation/configuration, enable/disable, credential-reference changes and manual Run initiation produce safe Audit evidence without exposing secret material.

**Notification directive:**
operational Source/Run failures may feed Design 080, but Notification status never becomes Source or Run truth.

**Search directive:**
Design 079 may index safe Source metadata where useful, while credential secrets and raw sensitive acquisition data remain excluded unless explicitly authorized by a dedicated source projection.

**Future-reuse directive:**
Design **082 — Data Extraction Jobs / Extraction Runs** must reuse the exact SourceRun identity and Design **083 — Extraction Review / Imported Records** must reuse the exact RawObservation/ProspectCandidate/Import lineage established here. Neither should create another acquisition backend.

**Overlap directive:**
Designs **008–011, 079–083** must ultimately share one acquisition lineage from source registry through raw evidence and candidate admission without letting any one screen duplicate Source, Run, Candidate, Lead or Import identities.

**Consolidation directive:**
**STANDARDIZE ONE LEAD-ACQUISITION FOUNDATION — STABLE SOURCE + VERSIONED SOURCECONFIGURATION + ISOLATED SECRET/CREDENTIAL REFERENCES + TYPED SOURCE ADAPTERS + CANONICAL SOURCERUNS + IMMUTABLE RAW OBSERVATIONS + VERSIONED NORMALIZATION + MULTI-SOURCE PROSPECTCANDIDATE PROVENANCE + EXPLICIT CRM ADMISSION — AND NEVER ALLOW SOURCE CONFIGURATION, CURRENT PROVIDER HEALTH, RUN SUCCESS, DEDUPLICATION, OR IMPORT CONVENIENCE TO ERASE RAW EVIDENCE, CREATE LEADS IMPLICITLY, EXPOSE SECRETS, OR REWRITE HISTORICAL LINEAGE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **81 / 153** |
| **PASS**                                   |                         **81** |
| **STANDARDIZE decisions**                  |                         **79** |
| **Potential implementation-overlap flags** |                         **72** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**81 / 153 = 52.9% audited.**

### Canonical Lead Acquisition lineage after Design 081

```text
                     SOURCE
                       │
                       ↓
             SourceConfiguration
                   Revision
                       │
            ┌──────────┴──────────┐
            ↓                     ↓
     Credential Reference     Source Adapter
            │                     │
            └──────────┬──────────┘
                       ↓
                   SourceRun
                       │
                       ↓
                RawObservation
                  IMMUTABLE
                       │
                       ↓
                  Normalize
                       │
                       ↓
              Normalized Evidence
                       │
                       ↓
             Candidate Resolution
                       │
                       ↓
               ProspectCandidate
                       │
                       ↓
                  Review
                       │
                       ↓
              CRM Admission/Import
                       │
                       ↓
                      Lead
```

The historical lineage remains attached all the way through:

```text
Lead
 ↓
CRM Admission
 ↓
ProspectCandidate
 ├── Observation A → Run 1 → Source A
 ├── Observation B → Run 8 → Source B
 └── Observation C → Run 4 → Source C
```

Dedupe consolidates identity.

It **does not** consolidate away evidence.

And the Source lifecycle boundary remains:

```text
SOURCE DISABLED
      │
      ↓
No new applicable Runs

BUT:

Old SourceRuns         preserved
RawObservations        preserved
ProspectCandidates     preserved
CRM Imports            preserved
Leads                  preserved
Provenance             preserved
```

# Next Sequential Audit Target

## **Design 082 — Data Extraction Jobs / Extraction Runs**

The next audit should preserve the execution boundary:

> **Source ≠ ExtractionJob/SourceRun ≠ RunAttempt ≠ RunCheckpoint ≠ RawObservation ≠ ProcessingStage ≠ Error/Failure ≠ Retry ≠ ProspectCandidate ≠ Import.**

It should reconcile Designs **009 and 081** while preserving:

* a Run pins exact Source + configuration/connector revision,
* one Source can have many Runs,
* Run ≠ individual execution attempt/retry,
* retry must not silently discard previous attempt evidence,
* partial success ≠ full success ≠ full failure,
* raw acquisition success ≠ normalization/candidate-resolution success,
* zero records ≠ failed run,
* cancellation stops future work without deleting already captured evidence,
* rerun/retry must be idempotency- and duplication-aware,
* Designs 082 and 009 must share one canonical extraction engine rather than parallel job systems.

The sequence continues strictly with **Design 082 only next**, under the unchanged audit contract.
