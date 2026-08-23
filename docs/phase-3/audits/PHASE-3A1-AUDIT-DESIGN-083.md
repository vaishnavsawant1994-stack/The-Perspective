# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 083 — Extraction Review / Imported Records

Design 083 should become the **canonical Team Workspace review-and-CRM-admission surface** between acquired prospect evidence and the canonical CRM.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **RawObservation ≠ NormalizedRecord ≠ ProspectCandidate ≠ DuplicateMatch ≠ ReviewDecision ≠ ImportBatch ≠ ImportRecord ≠ Lead/Contact/Company ≠ Provenance.**

The central implementation rule is:

> **Design 083 reviews source-linked normalized evidence and decides whether a ProspectCandidate should be admitted, linked, skipped, rejected, or otherwise processed according to governed CRM admission policy. Review never mutates RawObservation evidence, duplicate detection never performs an uncontrolled destructive merge, and successful CRM admission must remain traceable back through the Candidate, normalized evidence, RawObservation, ExtractionRun and Source.**

---

# 1. Classification

| Audit field                      | Classification                                                                                                                                           |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **083**                                                                                                                                                  |
| **Canonical name**               | **Extraction Review / Imported Records**                                                                                                                 |
| **Product area**                 | Team Workspace / Lead Acquisition / Candidate Review / CRM Admission                                                                                     |
| **User surface**                 | **Authenticated Team Workspace**                                                                                                                         |
| **Screen class**                 | Candidate Review / Duplicate Resolution / Import Results Workspace                                                                                       |
| **Classification**               | **Lead Acquisition Review & CRM Admission Anchor**                                                                                                       |
| **Primary purpose**              | Review normalized acquired records, evaluate duplicates, record reviewer decisions, and explicitly admit approved Candidates into canonical CRM entities |
| **Raw evidence foundation**      | Designs 009 / 081 / 082                                                                                                                                  |
| **Candidate foundation**         | Design 008                                                                                                                                               |
| **Enrichment dependency**        | Design 010                                                                                                                                               |
| **Lead CRM destination**         | Design 011                                                                                                                                               |
| **Company CRM destination**      | Design 084 onward                                                                                                                                        |
| **Contact CRM destination**      | Design 086 onward                                                                                                                                        |
| **Source identity**              | Design 081                                                                                                                                               |
| **Run identity**                 | Design 082                                                                                                                                               |
| **Normalized review entity**     | **NormalizedRecord**                                                                                                                                     |
| **Candidate entity**             | **ProspectCandidate**                                                                                                                                    |
| **Duplicate-analysis entity**    | **DuplicateMatch**                                                                                                                                       |
| **Human/system review evidence** | **ReviewDecision**                                                                                                                                       |
| **Batch admission entity**       | **ImportBatch**                                                                                                                                          |
| **Per-record admission entity**  | **ImportRecord**                                                                                                                                         |
| **CRM entities**                 | **Lead / Contact / Company** — canonical, separate                                                                                                       |
| **Lineage**                      | **Provenance**                                                                                                                                           |
| **Parent shell**                 | `InternalAppShell` — Design 001                                                                                                                          |
| **Primary review query service** | `ExtractionReviewQueryService`                                                                                                                           |
| **Duplicate service**            | `CandidateDuplicateResolutionService`                                                                                                                    |
| **Admission service**            | `CRMAdmissionService`                                                                                                                                    |
| **Import orchestration**         | `ImportBatchService`                                                                                                                                     |
| **Auth**                         | Required                                                                                                                                                 |
| **Authorization**                | OrganizationMembership + candidate-review + CRM-admission + target-entity permissions                                                                    |
| **Implementation priority**      | **Critical CRM Data Quality / Duplicate Safety / Provenance Integrity**                                                                                  |
| **Reuse level**                  | **Extremely High with Designs 008–011 and 081–082**                                                                                                      |

Design 083 should answer:

> **“What was actually acquired, how was it normalized, which ProspectCandidate does it represent, does it appear to match an existing CRM record, what did the reviewer decide, what was actually imported or linked, and can every resulting CRM value still be traced back to its source evidence?”**

Canonical flow:

```text
Source
  ↓
ExtractionRun
  ↓
RawObservation
  ↓
NormalizedRecord
  ↓
ProspectCandidate
  ↓
Duplicate Analysis
  ↓
DuplicateMatch candidate(s)
  ↓
ReviewDecision
  ↓
ImportBatch
  ↓
ImportRecord
  ↓
Canonical CRM
 ┌─────────┼─────────┐
 ↓         ↓         ↓
Company  Contact    Lead
```

Importing remains an **explicit boundary crossing**.

---

# 2. Reuse

## Design 008 remains the canonical ProspectCandidate foundation

Design 083 does not create a second candidate entity.

Correct:

```text
Design 008
ProspectCandidate PC-101
        ↓
Design 083
Review / Duplicate Resolution / Admission
```

Not:

```text
ImportedCandidate
ReviewedLead
ExtractionContact
```

as parallel candidate truth.

---

## Design 009 remains the canonical extraction foundation

Raw and normalized data originate from the same extraction pipeline already established there.

Design 083 consumes those results.

It does not:

* refetch Source data,
* create its own scraper,
* recreate extraction jobs.

---

## Design 081 remains Source/provenance authority

The review surface should understand:

```text
Candidate
→ Observation
→ Run
→ Source
```

without editing Source history.

---

## Design 082 remains Run/execution authority

Design 083 may show:

> Imported from Extraction Run R-102

but it does not alter:

* Run success,
* Attempt state,
* checkpoint history,
* acquisition counts.

Review outcome is downstream.

---

## Design 010 remains enrichment authority

If enrichment proposes:

> corrected email

that may be available as candidate evidence.

But Design 083 should not collapse:

```text
raw source value
+
normalized value
+
enrichment proposal
+
reviewer-selected value
```

into one untraceable field.

---

## Design 011 remains canonical Lead CRM

After explicit admission:

```text
ProspectCandidate
        ↓
ImportRecord
        ↓
Lead
```

Design 011 owns ongoing Lead lifecycle.

Design 083 does not keep a separate mutable “imported lead” copy.

---

## Designs 084–087 must reuse resulting Company/Contact identities

Upcoming:

* 084 Company CRM / Company Directory
* 085 Company Detail / Company 360
* 086 Contact CRM / Contact Directory
* 087 Contact Detail / Contact 360

must use the exact CRM entities resolved/created through the admission layer.

Design 083 must not invent temporary Company/Contact records that later need migration.

---

## Import may resolve several canonical CRM entities

A person-oriented ProspectCandidate may result in something conceptually like:

```text
ProspectCandidate
      ↓
Resolve Company
      ↓
Resolve/Create Contact
      ↓
Create/Link Lead
```

depending on canonical CRM policy.

But these remain different entities.

Do not assume:

```text
Candidate = Contact = Lead = Company
```

or force all three to be created in every admission.

Exact mapping belongs to Phase 3D.

---

# 3. Entities

## RawObservation

RawObservation remains immutable acquisition evidence.

Example:

```text
Raw source:
"Vaishnav Sawant, Founder & CEO, Perspective Media"
```

The review screen can inspect it where authorized.

It must not rewrite it to:

```text
"Vaishnav Sawant, Chief Executive Officer"
```

because normalization or human correction changed interpretation.

---

## Review correction ≠ RawObservation edit

If a reviewer corrects:

> “VP Strategy” → “Vice President, Strategy”

that correction belongs to the normalized/review/admission layer.

The original source evidence remains unchanged.

---

## RawObservation ≠ NormalizedRecord

Permanent.

`RawObservation`:

> what the source supplied.

`NormalizedRecord`:

> structured interpretation produced from that evidence.

---

## NormalizedRecord should preserve exact evidence lineage

Conceptually:

```text
NormalizedRecord
├── rawObservationId
├── normalizationVersion
├── normalized fields
├── field-level evidence references
├── processing timestamp
└── normalization confidence where used
```

---

## NormalizedRecord can be regenerated

If normalization rules improve:

```text
RawObservation O1
├── NormalizedRecord v1
└── NormalizedRecord v2
```

may exist conceptually.

Do not rewrite O1.

---

## Latest normalization ≠ only historical normalization

Where reproducibility matters, preserve which normalization revision was reviewed/imported.

---

## NormalizedRecord ≠ ProspectCandidate

A normalized row is evidence/interpretation.

A ProspectCandidate represents the canonical prospect identity before CRM admission.

Several normalized records may resolve to one Candidate.

---

## Many observations can contribute to one Candidate

```text
ProspectCandidate PC-10
├── Observation O1 / Normalized N1
├── Observation O2 / Normalized N2
└── Observation O3 / Normalized N3
```

This is expected.

---

## ProspectCandidate ≠ CRM entity

Permanent:

```text
ProspectCandidate
≠
Lead
≠
Contact
≠
Company
```

---

## Candidate acceptance ≠ Lead creation automatically

A reviewer can approve the candidate for admission.

Actual CRM creation/linking happens through the admission/import transaction.

Therefore:

```text
ReviewDecision = ACCEPT
≠
ImportRecord = SUCCEEDED
```

---

## DuplicateMatch

`DuplicateMatch` represents evidence that a Candidate may correspond to an existing canonical entity.

Conceptually:

```text
DuplicateMatch
├── candidateId
├── targetEntityType
├── targetEntityId
├── matching evidence
├── score/confidence
├── matching strategy/version
├── detectedAt
└── resolution state
```

---

## DuplicateMatch ≠ Duplicate fact necessarily

A match can be:

* high confidence,
* ambiguous,
* false positive.

Permanent:

> **Duplicate detection proposes; it does not automatically destroy or merge canonical records.**

---

## DuplicateMatch ≠ Merge

Critical.

```text
DuplicateMatch:
Candidate PC1 may match Contact C1
```

does not mean:

```text
merge PC1 into C1 automatically
```

without governed resolution/admission policy.

---

## Candidate matching can occur against different CRM entity types

Potentially:

```text
Candidate
├── Company match
├── Contact match
└── Lead match
```

The matching semantics differ.

Do not use one universal text-match score as authoritative identity resolution.

---

## Same email ≠ automatically same person

Emails are useful evidence but can be:

* shared,
* role-based,
* recycled,
* mistyped.

Duplicate resolution should combine appropriate evidence.

---

## Same company name ≠ same Company

Examples:

* subsidiaries,
* franchises,
* similarly named companies.

Company resolution needs canonical Company identity policy.

---

## Matching score ≠ business decision

A score helps review.

It does not directly mutate CRM.

---

## DuplicateMatch should retain why it matched

Examples:

```text
email exact
company domain match
name similarity
source profile URL match
phone match
```

Where possible, match reasoning should remain explainable.

---

## Match algorithm version matters

If duplicate logic changes later:

historical decisions should remain explainable under the algorithm/version that produced the match.

---

## ReviewDecision

`ReviewDecision` records what the reviewer decided about the Candidate/admission attempt.

Conceptually:

```text
ReviewDecision
├── candidateId
├── reviewer
├── decision
├── reviewedAt
├── candidate/normalized revision
├── duplicate-match context
├── target intent
└── reason/notes where required
```

---

## ReviewDecision ≠ Candidate lifecycle entirely

Candidate may accumulate several review actions over time.

Do not reduce all review history to:

```text
candidate.reviewed = true
```

---

## Accept ≠ Import success

Permanent.

---

## Reject ≠ delete

Critical.

Reject means:

> Do not admit this Candidate under this review decision/policy.

It must not delete:

* RawObservations,
* NormalizedRecords,
* SourceRuns,
* Source,
* Provenance.

---

## Skip ≠ Reject

This distinction should remain explicit if both are part of frozen design.

### Reject

A deliberate negative admission decision.

### Skip

No admission now / defer / not processed in this operation.

Do not record Skip as rejection.

---

## Duplicate ≠ Reject automatically

A Candidate may match an existing Contact.

Correct action may be:

* link evidence to existing Contact,
* update selected fields under governed policy,
* create Lead linked to existing Contact,
* skip creation.

Do not simply mark every duplicate candidate rejected.

---

## ReviewDecision should bind reviewed revision

If the Candidate changes after review:

the historical decision must still show what evidence/revision was reviewed.

This prevents:

```text
reviewed candidate X
→ candidate later changes
→ old approval appears to approve new data
```

---

## ReviewDecision should be append-oriented

Material re-review should create new decision history rather than silently overwriting the previous reviewer decision.

---

## Accept/Reject/Skip operations need idempotency

Double-clicking:

> Accept

must not create:

* two decisions,
* two ImportRecords,
* two Leads.

---

## ReviewDecision ≠ ImportBatch

Decision records reviewer intent.

Batch organizes the execution of multiple admission operations.

---

## ImportBatch

`ImportBatch` is the container for one explicit admission/import operation.

Conceptually:

```text
ImportBatch
├── id
├── organizationId
├── initiatedBy
├── createdAt
├── source/review context
├── candidate selection snapshot
├── state
└── aggregate outcome
```

---

## One ImportBatch can contain many ImportRecords

```text
ImportBatch IB-100
├── ImportRecord IR-1
├── ImportRecord IR-2
├── ImportRecord IR-3
└── ImportRecord IR-4
```

---

## ImportBatch ≠ ExtractionRun

Permanent.

One ExtractionRun could feed:

* several review sessions,
* multiple import batches,
* no imports.

One ImportBatch can potentially include candidates originating from several Runs if the frozen workflow permits.

---

## ImportRecord

`ImportRecord` records the per-Candidate CRM admission outcome.

Conceptually:

```text
ImportRecord
├── importBatchId
├── prospectCandidateId
├── reviewDecisionId
├── admission intent
├── target entity references
├── field mapping/provenance
├── state
├── failure
└── completedAt
```

---

## ImportRecord ≠ Lead

ImportRecord records the act/result of admission.

Lead remains Lead.

---

## ImportRecord ≠ Contact

Same.

---

## ImportRecord ≠ Company

Same.

---

## ImportRecord should preserve every resulting target reference

Example:

```text
ImportRecord IR-10
├── existingCompanyId = CO-44
├── newContactId = CT-81
└── newLeadId = L-92
```

if that is what the canonical admission policy produced.

---

## Import outcome can be link, create, update, skip, fail

Conceptually possible result classes:

```text
CREATED
LINKED_EXISTING
UPDATED_EXISTING
SKIPPED
REJECTED_BEFORE_IMPORT
FAILED
```

Exact enums Phase 3D.

The important rule is not to pretend every successful import means:

> New Lead created.

---

## Link existing ≠ create duplicate

If Contact already exists:

admission should link to it according to resolution policy.

---

## Update existing ≠ destructive overwrite

Candidate/source data should be proposed/applied under field-level merge policy.

Do not blindly overwrite canonical CRM fields with acquisition values.

---

## Existing canonical field ≠ source field

Example:

```text
Contact.currentTitle
= Chief Strategy Officer

Candidate source title
= VP Strategy
```

Import policy must decide:

* retain existing,
* update,
* add evidence,
* flag conflict,
* require review.

Design 083 should not silently replace stronger canonical data.

---

## Field merge requires provenance

Whenever a Candidate contributes to an existing CRM record:

the system should retain:

* source value,
* target value before change,
* resulting canonical value,
* evidence source,
* decision/application context.

---

## Manual reviewer correction ≠ source provenance

If reviewer changes a field before import:

its provenance should indicate:

```text
MANUAL_REVIEW_OVERRIDE
```

or equivalent, while preserving source evidence underneath.

Do not label it as though the Source originally supplied the corrected value.

---

## Provenance survives admission

This is mandatory.

Correct lineage:

```text
Lead L-100
 ↓
ImportRecord IR-100
 ↓
ProspectCandidate PC-100
 ↓
NormalizedRecord N-100
 ↓
RawObservation O-100
 ↓
ExtractionRun R-20
 ↓
Source S-4
```

---

## Field-level provenance should survive

Example:

```text
Contact CT-50

Name
→ Source A Observation O1

Company
→ Source B Observation O2

Email
→ Enrichment provider E5

Title
→ Reviewer override D7
```

---

## Provenance ≠ current canonical value

Current CRM data can later change while provenance remains historical evidence.

---

## Rejected Candidate retains provenance

Permanent.

---

## Duplicate Candidate retains provenance

Permanent.

---

## Skipped Candidate retains provenance

Permanent.

---

## Imported Candidate should not be deleted automatically

Candidate remains a historical acquisition identity/evidence bridge even after CRM admission.

It may be marked/projection-classified as admitted, but its evidence/identity should remain.

---

## Repeated import

If Candidate PC-1 was already admitted:

a repeated import attempt should resolve existing admission/CRM linkage rather than creating another Lead.

---

## Idempotency key should reflect admission intent

Conceptually:

```text
candidateId
+
admission target/policy
+
organization
+
review/admission revision
```

or equivalent.

Exact mechanism Phase 3D.

---

## Concurrent reviewers

Two reviewers accepting the same Candidate at the same time must not create duplicate CRM records.

Need:

* transaction isolation,
* unique identity/admission constraints,
* duplicate resolver recheck at commit.

---

## Duplicate check must be refreshed before import

A Candidate may show:

> No duplicate

at T1.

Another workflow creates matching Contact at T2.

Import occurs at T3.

The admission service should re-run/revalidate relevant duplicate/entity resolution before canonical creation.

---

# 4. Permissions

Design 083 should distinguish at least conceptually:

```text
candidate.read
candidate.review
candidate.reject
candidate.import
candidate.duplicate.resolve
crm.company.create/link
crm.contact.create/link
crm.lead.create/link
rawEvidence.read
provenance.read
import.history.read
```

Exact permission names Phase 3D.

---

## Candidate read ≠ import

An analyst can review candidate data without permission to create CRM records.

---

## Review ≠ CRM write

A reviewer might be permitted to mark:

> Accept for import

while an importer/authorized role executes the actual CRM admission.

Even if frozen workflow combines them for one role, permissions should remain logically distinct.

---

## Import permission ≠ arbitrary CRM overwrite

Import service still honors Company/Contact/Lead field-level and entity-level rules.

---

## Duplicate review ≠ merge permission

Critical.

Someone allowed to inspect duplicate suggestions should not automatically be allowed to merge existing canonical CRM entities.

---

## Create Contact ≠ modify existing Contact

Separate where policy requires.

---

## Create Lead ≠ update Company

Separate.

---

## RawObservation permission ≠ Candidate summary permission

Raw evidence may contain more sensitive source data than normalized candidate summary.

---

## Provenance read ≠ credential/source-admin access

Safe provenance can show:

> company leadership page

without exposing Source credentials or internal extraction secrets.

---

## Cross-tenant duplicate matching prohibited

Duplicate detection must never compare Candidate from Organization A to private CRM records from Organization B unless the system has an explicitly global canonical entity-resolution boundary, which is not introduced here.

Default is tenant isolation.

---

## Direct Candidate ID reauthorizes

Knowing `candidateId` is not sufficient.

---

## Direct ImportBatch/ImportRecord IDs reauthorize

Same.

---

## Direct CRM target IDs reauthorize

Import response must not expose inaccessible Company/Contact/Lead details.

---

## Bulk import permission

Bulk operation must reauthorize every Candidate and target operation server-side.

Do not authorize the batch once and assume every row is valid.

---

## Reviewer identity comes from session

Browser must not supply authoritative:

```text
reviewedBy = someoneElse
```

---

## Importer identity also session-derived

Permanent.

---

## Source evidence visibility after import

User who can access Lead may not automatically have access to all raw acquisition payloads.

Provenance can have a safe projection.

---

# 5. States

Design 083 must keep **candidate review state, duplicate-analysis state, ReviewDecision, ImportBatch state, ImportRecord outcome, CRM linkage state, and evidence availability** separate.

### Candidate review state

```text
Unreviewed
In Review
Reviewed
Needs Re-review
```

### Duplicate-analysis state

```text
Not Checked
Checking
No Match Found
Possible Match
Strong Match
Ambiguous
Match Resolution Required
Check Unavailable
```

### ReviewDecision

```text
Pending
Accepted
Rejected
Skipped
Superseded / Re-reviewed
```

where applicable.

### ImportBatch state

```text
Draft / Preparing
Queued
Processing
Partially Succeeded
Succeeded
Failed
Cancelled
```

### ImportRecord state

```text
Pending
Processing
Created
Linked Existing
Updated Existing
Skipped
Failed
Already Imported / Reconciled
```

Exact labels depend on implementation.

---

## Candidate accepted ≠ imported

Permanent.

---

## Candidate rejected ≠ deleted

Permanent.

---

## Candidate skipped ≠ rejected

Permanent.

---

## Duplicate found ≠ import failed

Permanent.

---

## Possible duplicate ≠ confirmed duplicate

Permanent.

---

## Duplicate resolved ≠ entities merged necessarily

It may resolve as:

* same entity → link;
* false positive → continue creation;
* needs manual resolution.

---

## No duplicate found ≠ guaranteed unique forever

Another CRM record could be created before commit.

Revalidate at admission.

---

## ImportBatch succeeded ≠ every row created new records

Some may have:

* linked existing,
* updated existing,
* created new.

Batch success means operation completed according to policy.

---

## Partial success ≠ success

Critical.

Example:

```text
100 selected
82 imported
10 linked existing
8 failed
```

This is not a full success if failed rows remain.

---

## Partial success ≠ full failure

Also critical.

Successfully admitted records remain valid.

Do not roll them back automatically simply because unrelated rows failed unless explicit all-or-nothing transaction policy exists—which is usually inappropriate for large imports.

---

## Per-record transactions are generally safer

For batch import:

each ImportRecord should have atomic canonical CRM mutation.

Batch aggregates their outcomes.

This prevents one malformed Candidate from undoing 500 valid admissions.

---

## Import failed ≠ ReviewDecision rejected

Permanent.

A Candidate can remain accepted for import while technical admission failed and may be retried.

---

## Retry import ≠ new ReviewDecision necessarily

If reviewer intent remains current and evidence/policy still valid:

technical retry can reuse the same decision.

If Candidate data materially changed, re-review may be required.

---

## Already imported ≠ failure

Idempotent repeat should resolve:

> Already admitted / linked

rather than produce another CRM record.

---

## Existing match found during commit ≠ fatal duplicate necessarily

Admission can safely reconcile to existing canonical entity under policy.

---

## CRM target creation succeeded but later step failed

Example:

```text
Company linked     ✓
Contact created    ✓
Lead creation      ✕
```

The per-record transaction should be designed to avoid unsafe partial canonical relationships or clearly model compensating/recoverable state.

Prefer one atomic per-record admission transaction where those operations form one intended admission.

---

## Provenance persistence failure ≠ safe import success

Critical.

If canonical CRM creation succeeds but required lineage cannot be stored, the system should not claim fully trustworthy import success.

Admission transaction should include required provenance/linkage.

---

## Duplicate-check service unavailable ≠ no duplicate

Critical.

Unknown remains unknown.

---

## Source unavailable ≠ evidence deleted

Review continues from captured evidence where possible.

---

## Raw evidence missing unexpectedly ≠ no provenance

This should surface as data integrity failure, not silently import unattributed fields.

---

## State Coverage

Design 083 inherits Design 150 plus:

```text
Review Loading
Review Queue Available
Review Queue Empty
Review Restricted

Candidate Unreviewed
Candidate In Review
Candidate Reviewed
Candidate Needs Re-review

Duplicate Check Pending
Duplicate Check Running
No Duplicate Match
Possible Duplicate Match
Strong Duplicate Match
Ambiguous Duplicate Match
Duplicate Check Unavailable

Review Accepted
Review Rejected
Review Skipped
Review Superseded

Import Preparing
Import Queued
Import Processing
Import Partially Succeeded
Import Succeeded
Import Failed
Import Cancelled

Import Record Created
Import Record Linked Existing
Import Record Updated Existing
Import Record Failed
Import Record Already Imported
Import Record Reconciled

Provenance Available
Provenance Partial
Provenance Integrity Error

CRM Target Changed Since Review
Candidate Changed Since Review
Re-review Required

Partial Import Service Failure
```

---

# 6. Responsive Behavior

## Desktop

Desktop should optimize **side-by-side evidence comparison and careful admission**, not just rapid checkbox bulk importing.

Conceptually:

```text
Extraction Review
↓
Candidate list / review queue
↓
Selected Candidate
    ├── normalized identity
    ├── source/provenance summary
    ├── raw evidence where authorized
    ├── possible duplicates
    ├── existing CRM comparison
    ├── review decision
    └── import/admission outcome
```

Only frozen-design sections should render.

---

## Source vs normalized value should remain distinguishable

If the UI shows both:

```text
Source value:
"VP AI"

Normalized:
"Vice President, Artificial Intelligence"
```

they should never look like two equivalent editable canonical fields.

---

## Duplicate comparison should preserve side identity

If frozen design includes comparison:

```text
Candidate
vs
Existing CRM Contact
```

make it clear which fields belong to:

* incoming candidate,
* existing canonical CRM.

Do not visually encourage accidental overwrite.

---

## Desktop bulk selection

If frozen Design 083 supports bulk review/import:

bulk actions still require:

* row-specific validation,
* duplicate policy,
* per-record outcomes.

Selecting 100 rows does not turn them into one atomic generic operation.

---

## Import result presentation

A batch should distinguish:

```text
Created
Linked existing
Updated existing
Skipped
Failed
```

rather than one “100 imported” number.

---

## Tablet

Following Design 152:

* candidate list and review detail can stack,
* duplicate comparison becomes grouped cards,
* source/provenance remains visible,
* decision CTA stays distinguishable from import execution where frozen.

---

## Mobile

Priority:

```text
Candidate
↓
Normalized summary
↓
Source evidence
↓
Duplicate status
↓
Existing record comparison
↓
Review decision
↓
Import outcome
```

Avoid trying to compress a large desktop merge table horizontally.

---

## Mobile duplicate handling

Use explicit text:

> Possible existing Contact found.

rather than color-only match scores.

---

## Mobile import outcome

Use precise labels:

> Linked to existing Contact

not:

> Imported

when no new Contact was actually created.

---

## Accessibility

A review card should communicate something equivalent to:

> Prospect candidate Sarah Patel from Executive Leadership Directory. One possible existing Contact match with exact email and similar company. Candidate has not yet been imported. Review required.

where evidence supports it.

---

# 7. Backend Requirements

## Review architecture

```text
Design 083
    ↓
Authenticated Workspace Context
    ↓
ExtractionReviewQueryService
    │
    ├── ProspectCandidate
    ├── selected NormalizedRecord revision
    ├── safe RawObservation evidence
    ├── Source/Run provenance
    ├── DuplicateMatch candidates
    ├── prior ReviewDecisions
    └── prior ImportRecords
    ↓
ExtractionReviewView
```

---

## Review should anchor on ProspectCandidate

Do not anchor the primary review identity only on a RawObservation row.

Several observations may belong to the same Candidate.

---

## Candidate snapshot/revision

A ReviewDecision should bind the Candidate/normalized evidence revision reviewed.

Conceptually:

```text
reviewCandidate(
    candidateId,
    expectedRevision,
    decision
)
```

This protects against stale review.

---

## Optimistic concurrency

If another process changes Candidate evidence while the reviewer is open:

the server should reject or require reconciliation instead of silently applying the decision to changed data.

---

## Duplicate-resolution architecture

```text
ProspectCandidate
      ↓
CandidateDuplicateResolutionService
      │
      ├── Company matcher
      ├── Contact matcher
      └── Lead matcher
      ↓
DuplicateMatch[]
```

Each matcher uses entity-appropriate semantics.

---

## Duplicate detection should combine deterministic and probabilistic evidence

Potentially:

* exact external profile ID,
* exact normalized email,
* normalized phone,
* company domain,
* name/company similarity,
* known relationships.

Exact algorithms Phase 3D.

---

## No automatic destructive merge from fuzzy score

Critical.

High score can generate:

```text
DuplicateMatch
```

but not destructive canonical merge without governed resolution.

---

## Match threshold policy should be versioned

If thresholds/algorithms change, historical review context remains interpretable.

---

## Entity resolution recheck at import time

Before creating Company/Contact/Lead:

```text
CRMAdmissionService
→ revalidate candidate
→ recheck existing canonical entity identity
```

This protects against races.

---

## ReviewDecision command

Prefer narrow commands:

```text
acceptCandidateForAdmission()
rejectCandidate()
skipCandidate()
```

or a typed decision command.

Do not generic PATCH:

```text
candidate.status = "accepted"
```

without history/context.

---

## ReviewDecision idempotency

A repeated command with the same operation ID should return the same decision rather than duplicate history.

---

## Re-review

If a previous decision needs correction:

create a superseding decision/review history.

Do not delete the original reviewer evidence.

---

## ImportBatch creation

Conceptually:

```text
createImportBatch(
    selectedCandidateIds,
    admissionPolicy/version,
    actor
)
```

should validate every candidate.

---

## ImportBatch should snapshot intent, not copy entire source truth unnecessarily

Preserve:

* candidate IDs/revisions,
* ReviewDecision IDs,
* policy revision,
* requested operation.

Canonical data remains canonical.

---

## ImportRecord creation

Create one ImportRecord per candidate/admission unit before or with processing.

This gives:

* retry identity,
* per-record status,
* failure isolation,
* auditability.

---

## Per-record atomic admission

Conceptually:

```text
admitCandidate(importRecord)
    ↓
lock/re-read Candidate
    ↓
validate ReviewDecision
    ↓
refresh duplicate/entity resolution
    ↓
resolve Company
    ↓
resolve Contact
    ↓
resolve Lead admission
    ↓
apply governed field mappings
    ↓
persist provenance
    ↓
persist CRM relationships
    ↓
complete ImportRecord
COMMIT
```

---

## Default atomic boundary

For one ImportRecord, the intended CRM changes and required provenance should normally commit together.

Avoid:

```text
Lead created ✓
Provenance failed ✕
ImportRecord failed
```

leaving unattributed CRM data.

---

## Batch should not require one giant database transaction

For large imports, use per-record transactions with batch aggregation.

This improves:

* resilience,
* retryability,
* lock contention,
* partial-success correctness.

---

## ImportRecord idempotency

Use stable admission identity to prevent repeated creation.

Potential constraints:

```text
organization
+
prospectCandidate
+
admission target/policy
```

according to CRM model.

---

## Candidate already admitted

`CRMAdmissionService` should return existing canonical linkage when valid.

Do not create second Lead.

---

## Concurrent import safety

Use:

* unique constraints,
* transaction locks,
* canonical identity resolver,
* upsert-like controlled semantics,

not “check then insert” without transactional protection.

---

## Company resolution

Before creating a Company:

check canonical Company identity using governed resolver.

Do not create:

```text
Acme Inc
Acme, Inc.
ACME INC
```

as separate Companies merely because strings differ.

---

## Contact resolution

Same principle.

---

## Lead resolution

Lead dedupe/lifecycle policy can differ from Contact identity.

A single Contact may potentially have multiple legitimate Lead/opportunity contexts depending CRM semantics.

Do not assume:

> existing Contact = no Lead can ever be created.

Exact policy belongs to CRM architecture.

---

## Candidate-to-CRM mapping

Use a versioned admission/mapping policy.

Conceptually:

```text
CRMAdmissionMappingVersion
```

or equivalent configuration.

This makes historical imports explainable.

---

## Field conflict resolver

For each incoming value:

```text
incoming candidate value
existing canonical value
source provenance
confidence/evidence
field merge policy
review override
```

determine:

* keep existing,
* apply incoming,
* add secondary value,
* flag conflict,
* require manual decision.

---

## No blind overwrite

Critical.

Especially for:

* email,
* phone,
* job title,
* company,
* role,
* location.

---

## Field provenance write

Any admitted value should retain references to relevant:

```text
RawObservation
NormalizedRecord
ProspectCandidate
ReviewDecision
ImportRecord
```

where appropriate.

---

## Manual reviewer overrides

If allowed by frozen design, store as explicit review/admission override with actor/timestamp.

Never mutate RawObservation.

---

## Import failure classification

Potential categories:

```text
DUPLICATE_CONFLICT
STALE_CANDIDATE
INVALID_DATA
PERMISSION
CRM_CONSTRAINT
PROVENANCE_FAILURE
TRANSIENT_DATABASE
INTERNAL
UNKNOWN
```

This controls retry behavior.

---

## Retry failed ImportRecord

Technical failures can retry the same ImportRecord/idempotency identity.

Do not create a new Lead or new ReviewDecision automatically.

---

## Stale Candidate during retry

If Candidate materially changed after decision:

mark:

> RE_REVIEW_REQUIRED

rather than importing changed information under an old Accept decision.

---

## ImportBatch aggregate resolver

Centralize:

```text
deriveImportBatchOutcome(records)
```

so the frontend does not decide batch success from row counts.

---

## Batch outcome

Example:

```text
200 records
150 created
30 linked
15 updated
5 failed

→ PARTIALLY_SUCCEEDED
```

if failures remain.

---

## Cancellation

If batch cancellation exists in frozen design:

cancellation should stop **not-yet-started** records where safe.

Already committed ImportRecords remain valid.

Never roll back historical successful CRM admission by deleting records solely because batch was cancelled.

---

## Rejected/Skipped storage

Rejected or skipped candidate decisions remain queryable/auditable according to retention policy.

They do not create CRM entities.

---

## Raw evidence retention

Neither ReviewDecision nor Import outcome may delete source evidence needed for:

* provenance,
* debugging,
* future re-review.

---

## Provenance integrity checks

Admission should verify required evidence references exist before commit.

If provenance is partially missing unexpectedly, surface an integrity error.

---

## Audit integration

Material events include:

```text
CandidateReviewed
CandidateAccepted
CandidateRejected
CandidateSkipped
DuplicateResolutionRecorded
ImportBatchCreated
ImportRecordSucceeded
ImportRecordFailed
CandidateLinkedToExistingCRMEntity
CRMEntityCreatedFromCandidate
```

with safe field-change summaries.

---

## Audit ≠ provenance

Audit answers:

> who performed the business action?

Provenance answers:

> where did the data come from?

Both are needed and separate.

---

## Notification integration

Design 080 can notify:

* ImportBatch completed,
* import partially failed,
* manual review required.

Notification state never changes import outcome.

---

## Search integration

Design 079 may index canonical CRM entities after successful commit.

Search indexing failure must not roll back successful CRM admission.

It should retry asynchronously.

---

## Post-import events

Successful admission should emit events for:

* CRM projections,
* search,
* analytics,
* activity,
* downstream workflow.

Those consumers should reference canonical CRM entity IDs.

---

## Analytics

Acquisition funnel metrics should distinguish:

```text
Raw observations
Normalized records
Candidates
Reviewed
Accepted
Rejected
Duplicates
Imported
Created new
Linked existing
Failed
```

Do not call all stages “Leads.”

---

## Permission-safe batch processing

Each worker executes under a trusted system context that still validates:

* Organization,
* originally authorized admission intent,
* current relevant constraints.

Do not trust stale browser authorization forever for long-running imports.

---

## Partial-service failure

Example:

```text
Candidate data       ✓
Duplicate service    ✕
CRM target lookup    ✓
```

Do **not** interpret this as:

> No duplicates found.

Block or safely defer admission according to policy.

---

## Backend Requirement Matrix

| Requirement                                  | Status                              |
| -------------------------------------------- | ----------------------------------- |
| Authenticated Team Workspace                 | **Critical**                        |
| Organization isolation                       | **Critical**                        |
| RawObservation immutability                  | **Critical**                        |
| Raw/normalized separation                    | **Critical**                        |
| NormalizedRecord version lineage             | **Critical**                        |
| ProspectCandidate canonical reuse            | **Critical**                        |
| Candidate/Lead separation                    | **Critical**                        |
| Candidate/Contact separation                 | **Critical**                        |
| Candidate/Company separation                 | **Critical**                        |
| Review anchored on Candidate                 | **Critical**                        |
| Candidate revision binding                   | **Critical**                        |
| Optimistic concurrency                       | **Critical**                        |
| DuplicateMatch first-class evidence          | **Critical**                        |
| DuplicateMatch/merge separation              | **Critical**                        |
| Entity-specific duplicate resolvers          | **Critical**                        |
| Explainable duplicate evidence               | **Required**                        |
| Match algorithm/version lineage              | **Required**                        |
| Duplicate recheck at admission               | **Critical**                        |
| ReviewDecision entity/history                | **Critical**                        |
| Accept/import-success separation             | **Critical**                        |
| Reject/delete separation                     | **Critical**                        |
| Skip/reject separation                       | **Critical**                        |
| Review idempotency                           | **Critical**                        |
| Re-review/supersession history               | **Critical**                        |
| ImportBatch entity                           | **Critical**                        |
| One batch → many ImportRecords               | **Critical**                        |
| ImportBatch/ExtractionRun separation         | **Critical**                        |
| Per-record atomic admission                  | **Critical**                        |
| Batch partial-success semantics              | **Critical**                        |
| ImportRecord/idempotency                     | **Critical**                        |
| Repeated import duplicate prevention         | **Critical**                        |
| Concurrent import safety                     | **Critical**                        |
| Existing Company resolution                  | **Critical**                        |
| Existing Contact resolution                  | **Critical**                        |
| Existing Lead/admission resolution           | **Critical**                        |
| No blind canonical field overwrite           | **Critical**                        |
| Versioned admission/mapping policy           | **Required**                        |
| Field-conflict resolver                      | **Critical**                        |
| Field/source provenance persistence          | **Critical**                        |
| Reviewer override provenance                 | **Critical if overrides exist**     |
| Required provenance in admission transaction | **Critical**                        |
| Rejected candidate provenance retention      | **Critical**                        |
| Duplicate candidate provenance retention     | **Critical**                        |
| Imported candidate evidence retention        | **Critical**                        |
| Import failure classification                | **Critical**                        |
| Failed-record retry                          | **Critical**                        |
| Stale Candidate/re-review enforcement        | **Critical**                        |
| ImportBatch aggregate resolver               | **Critical**                        |
| Safe cancellation semantics                  | **Required if cancellation exists** |
| Design 039 Audit integration                 | **Critical**                        |
| Audit/Provenance separation                  | **Critical**                        |
| Design 080 notification reuse                | **Required**                        |
| Design 079 post-import indexing              | **Required**                        |
| Designs 084–087 CRM reuse                    | **Critical architecture**           |
| Partial duplicate-service failure handling   | **Critical**                        |

---

# 8. Consolidation

Design 083 exposes some of the most consequential data-quality risks in the acquisition pipeline.

**RawObservation / NormalizedRecord conflation**
Human correction rewrites source evidence.

**NormalizedRecord / ProspectCandidate conflation**
Every extracted row becomes a canonical prospect identity.

**ProspectCandidate / Lead conflation**
Discovery automatically contaminates Sales CRM.

**ProspectCandidate / Contact conflation**
Every person discovered becomes a CRM Contact automatically.

**Candidate company text / Company entity conflation**
Every company string creates a new Company.

**Normalization update / historical evidence rewrite**
Old review/import cannot be reconstructed.

**Reviewer correction / source value conflation**
Manual edits are falsely attributed to the external Source.

**DuplicateMatch / confirmed duplicate conflation**
Similarity score becomes identity truth.

**DuplicateMatch / destructive merge conflation**
Detection immediately overwrites/deletes CRM data.

**Exact email / same person conflation**
Shared/recycled addresses create false merges.

**Same company name / same Company conflation**
Distinct legal/business entities collapse.

**Match score / merge permission conflation**
Algorithm decides destructive business operation.

**Match algorithm change / historical decision rewrite**
Past duplicate rationale becomes uninterpretable.

**ReviewDecision / Candidate state conflation**
One mutable `reviewStatus` destroys decision history.

**Accept / import success conflation**
Technical CRM failure appears successfully admitted.

**Reject / delete conflation**
Rejected source evidence disappears.

**Skip / reject conflation**
Deferred record becomes permanent rejection.

**Duplicate / reject conflation**
Existing canonical entity match causes evidence to be discarded.

**ReviewDecision / ImportBatch conflation**
Reviewer intent and execution result become inseparable.

**ImportBatch / ExtractionRun conflation**
Every extraction run is treated as one CRM import.

**ImportBatch / one giant transaction conflation**
One bad row rolls back thousands of good records.

**ImportBatch success / all-new records conflation**
Linked/updated records are misreported as newly created.

**ImportRecord / Lead conflation**
Admission history becomes a second Lead table.

**ImportRecord / Contact conflation**
Import results duplicate Contact state.

**ImportRecord / Company conflation**
Admission results duplicate Company state.

**Created / Linked existing conflation**
Metrics overstate CRM growth.

**Update existing / blind overwrite conflation**
Weak source data replaces stronger canonical CRM data.

**Current canonical value / imported value conflation**
Field history/provenance disappears.

**Source provenance / Candidate provenance conflation**
Multi-source candidate appears to come from only one origin.

**Candidate provenance / field provenance conflation**
All fields receive same source attribution incorrectly.

**Provenance / Audit conflation**
Data origin and actor-action history become one log.

**Provenance persistence failure / import success conflation**
CRM record exists without trustworthy lineage.

**Rejected / no provenance conflation**
Non-imported candidate loses evidence.

**Duplicate / no provenance conflation**
Linking existing record discards additional source evidence.

**Imported Candidate / deletable staging row conflation**
Deleting staging data destroys CRM lineage.

**Repeated import / new CRM record conflation**
Retry creates duplicate Lead/Contact/Company.

**Check-then-insert race**
Concurrent reviewers create duplicate canonical entities.

**Stale duplicate check / safe creation conflation**
New duplicate appears between review and commit.

**Candidate accepted revision / current Candidate conflation**
Old approval imports newer unreviewed data.

**Import technical retry / new review decision conflation**
Failures clutter review history or create duplicate authority.

**Partial batch success / full success conflation**
Failed rows disappear from operational visibility.

**Partial batch success / full failure conflation**
Valid CRM records are rolled back/deleted unnecessarily.

**Per-record failure / candidate rejection conflation**
Technical error becomes business rejection.

**Batch cancellation / delete successful imports conflation**
Already committed CRM history is destroyed.

**Duplicate-service outage / no duplicate conflation**
Unsafe new records are created during resolver failure.

**Raw evidence unavailable / no evidence conflation**
Import proceeds without lineage.

**Candidate reviewer / CRM administrator conflation**
Review permissions automatically grant broad CRM mutation.

**Duplicate reviewer / merge authority conflation**
Analyst can destructively merge CRM entities.

**Bulk permission / row permission conflation**
One batch authorization bypasses restricted candidates.

**Direct target ID / import authority conflation**
Request tampering links Candidate to another tenant's CRM entity.

**Search indexing / admission transaction conflation**
Search outage rolls back valid CRM data.

**Notification failure / import failure conflation**
Successful import retries and creates duplicates because alert delivery failed.

**083/008 duplicate Candidate backend**
Review screen creates a second candidate identity.

**083/009 duplicate normalized/extraction data**
Review creates copied extraction records as truth.

**083/010 duplicate enrichment truth**
Reviewer overwrites enrichment/source evidence.

**083/011 duplicate Lead backend**
Imported rows remain editable outside CRM.

**083/082 duplicate processing state**
Review screen changes ExtractionRun lifecycle.

**083/084–087 duplicate Company/Contact identities**
Temporary imported entities diverge from future CRM directories.

No additional screen is required.

These are **review integrity, duplicate resolution, CRM admission, batch execution, canonical-entity identity, idempotency, concurrency, field conflict, and provenance requirements**.

---

# 9. Implementation Verdict

## **PASS — PROSPECT REVIEW, DUPLICATE RESOLUTION & EXPLICIT CRM ADMISSION ANCHOR**

**Domain directive:**
**RawObservation ≠ NormalizedRecord ≠ ProspectCandidate ≠ DuplicateMatch ≠ ReviewDecision ≠ ImportBatch ≠ ImportRecord ≠ Lead/Contact/Company ≠ Provenance.**

**Raw-evidence directive:**
Design 083 reads immutable RawObservations from the canonical extraction pipeline. Reviewer corrections, normalization improvements and CRM field edits never rewrite captured source evidence.

**Normalization directive:**
NormalizedRecord remains a versioned/derived interpretation of RawObservation. Review and import bind the exact normalized/Candidate revision actually evaluated so later normalization changes cannot rewrite historical decisions.

**Candidate directive:**
Design 008 remains the canonical ProspectCandidate identity. Several source observations may contribute to one Candidate, and a Candidate remains outside CRM until explicit admission.

**CRM-boundary directive:**
ProspectCandidate never silently becomes Lead, Contact or Company. Admission deliberately resolves which canonical CRM entities should be created, linked or updated.

**Duplicate directive:**
DuplicateMatch is explainable identity-resolution evidence, not a destructive merge command. Matching algorithms can propose existing Company/Contact/Lead candidates, but canonical merge/link/create decisions follow governed policy.

**Duplicate-safety directive:**
high-confidence matching, exact email, same name or company similarity must never by themselves cause uncontrolled destructive CRM merging.

**Fresh-match directive:**
duplicate/entity resolution is revalidated immediately before canonical admission so stale review results cannot create duplicate CRM entities under concurrent activity.

**Review directive:**
ReviewDecision is append-oriented reviewer evidence tied to exact Candidate/evidence revision and authenticated reviewer. Accept, Reject and Skip remain semantically distinct and idempotent.

**Accept directive:**
`Accepted` means approved for admission under current policy. It does not mean CRM admission succeeded.

**Reject directive:**
rejecting a Candidate prevents that intended admission but preserves Candidate, RawObservation, SourceRun and Provenance history.

**Skip directive:**
Skip/defer remains distinct from rejection and can support later review without rewriting prior history.

**Re-review directive:**
materially changed Candidate evidence or corrected reviewer intent produces a new/superseding review decision rather than rewriting the old one.

**Batch directive:**
ImportBatch is an execution container for many admission records and remains separate from ExtractionRun and individual CRM entities.

**Record directive:**
each Candidate admission has its own ImportRecord preserving ReviewDecision, candidate revision, target CRM IDs, result type, failure state and provenance/application context.

**Atomicity directive:**
each ImportRecord should normally commit its intended Company/Contact/Lead relationship changes and required provenance atomically so the system never reports trustworthy admission while lineage is missing.

**Batch-isolation directive:**
large ImportBatches should generally use per-record transactions rather than one giant all-or-nothing transaction. A malformed record must not undo hundreds of successful canonical admissions.

**Partial-success directive:**
ImportBatch can be fully successful, partially successful, failed or cancelled. Per-record `Created`, `Linked Existing`, `Updated Existing`, `Skipped`, `Failed`, and `Already Imported/Reconciled` remain visible.

**Idempotency directive:**
double-clicks, worker retries and repeated Import operations reconcile to existing ImportRecord/CRM identities and must never create duplicate Lead, Contact or Company records.

**Concurrency directive:**
simultaneous reviewers/importers are protected through canonical identity resolution, current duplicate rechecks, database constraints and transactional locking/upsert semantics.

**Company directive:**
Company resolution must normalize canonical company identity before creation. Raw company strings cannot produce duplicate Company entities merely because punctuation/casing differs.

**Contact directive:**
Contact resolution remains canonical and independent of Lead lifecycle. Existing Contact identity can be linked rather than duplicated.

**Lead directive:**
Lead identity/lifecycle remains Design 011's responsibility. Existing Contact does not automatically imply that no legitimate Lead can ever be created; admission follows the canonical CRM policy.

**Field-merge directive:**
incoming acquisition data never blindly overwrites canonical CRM values. Field-conflict policy evaluates existing value, incoming value, evidence strength, provenance and reviewer override before application.

**Override directive:**
manual reviewer corrections, if supported by frozen design, are stored as explicit reviewer-derived values/evidence and never falsely attributed to the external Source.

**Provenance directive:**
the chain **Source → SourceRun → RawObservation → NormalizedRecord → ProspectCandidate → ReviewDecision → ImportRecord → Company/Contact/Lead** remains reconstructable after admission.

**Field-provenance directive:**
architecture must allow individual CRM fields to retain different evidence origins—including Source observations, enrichment results, reviewer overrides and later CRM edits.

**Evidence-retention directive:**
Rejected, Skipped, Duplicate/Linked and successfully Imported Candidates all retain their source evidence. Admission outcome never destroys provenance.

**Authorization directive:**
Candidate review, duplicate resolution, CRM import, Company creation/linking, Contact creation/linking, Lead creation/linking, raw-evidence access and destructive CRM merge authority remain separately enforced.

**Bulk directive:**
bulk review/import is only orchestration convenience. Every row is independently authorized, validated, duplicate-checked, executed and recorded.

**Failure directive:**
duplicate-service outage, stale Candidate revision, invalid data, CRM constraint failure, provenance failure and infrastructure failure remain distinct. `Unavailable` duplicate analysis must never be interpreted as `No duplicate`.

**Audit directive:**
review decisions, duplicate resolutions and CRM admission operations create durable Audit evidence with actor/time/result, while Provenance separately records data origin.

**Notification directive:**
Design 080 can report review/import outcomes, but notification generation/read/dismissal never alters ReviewDecision or ImportRecord state.

**Search directive:**
after canonical CRM commit, Design 079 may asynchronously index resulting Company/Contact/Lead records. Search indexing failure never reverses successful CRM admission.

**Analytics directive:**
acquisition funnel reporting must preserve different counts for RawObservations, NormalizedRecords, Candidates, Accepted, Rejected, Duplicate/Linked, Imported, Newly Created and Failed. These must not all be called “Leads.”

**Future-reuse directive:**
Designs **084–087** must consume the exact Company and Contact identities produced/resolved here, while Design 011 continues to own Lead identity. No temporary “imported CRM” entities should survive as parallel truth.

**Overlap directive:**
Designs **008–011, 081–087** must ultimately consume one continuous evidence-to-CRM lineage without duplicating RawObservation, Candidate, Company, Contact, Lead or Import identities.

**Consolidation directive:**
**STANDARDIZE ONE REVIEW & CRM-ADMISSION FOUNDATION — IMMUTABLE RAW EVIDENCE + VERSIONED NORMALIZED RECORDS + CANONICAL PROSPECTCANDIDATE + EXPLAINABLE DUPLICATEMATCHES + REVISION-BOUND APPEND-ORIENTED REVIEWDECISIONS + PER-RECORD IDEMPOTENT IMPORT EXECUTION + CANONICAL COMPANY/CONTACT/LEAD RESOLUTION + FIELD-CONFLICT POLICY + END-TO-END PROVENANCE — AND NEVER ALLOW REVIEW CORRECTIONS, FUZZY DUPLICATE SCORES, BULK IMPORT CONVENIENCE, RETRIES OR CRM CREATION TO ERASE SOURCE EVIDENCE, SILENTLY MERGE CANONICAL RECORDS, CREATE DUPLICATES OR BREAK HISTORICAL LINEAGE.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **83 / 153** |
| **PASS**                                   |                         **83** |
| **STANDARDIZE decisions**                  |                         **81** |
| **Potential implementation-overlap flags** |                         **74** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**83 / 153 = 54.2% audited.**

### Canonical acquisition-to-CRM architecture after Design 083

```text
SOURCE
  ↓
SourceConfiguration
  ↓
ExtractionRun
  ↓
RawObservation
  │
  │ immutable evidence
  ↓
NormalizedRecord
  ↓
ProspectCandidate
  ↓
Duplicate Resolution
  ├── no canonical match
  ├── possible Contact match
  ├── possible Company match
  └── possible Lead match
  ↓
ReviewDecision
  ↓
ImportBatch
  ↓
ImportRecord
  ↓
CRM Admission Resolver
  │
  ├── CREATE / LINK Company
  ├── CREATE / LINK Contact
  └── CREATE / LINK Lead
  ↓
Canonical CRM
```

The critical duplicate boundary is:

```text
DuplicateMatch
      ↓
“This may be the same canonical entity.”

      ≠

Merge
      ↓
“Destroy/combine canonical identity.”
```

Detection can propose.

**Only governed resolution can mutate canonical CRM.**

The import boundary is equally strict:

```text
ACCEPTED FOR IMPORT
        ≠
IMPORTED SUCCESSFULLY

IMPORTED SUCCESSFULLY
        ≠
NEW RECORD CREATED

A successful admission may:
        ├── create new
        ├── link existing
        └── update existing under policy
```

And provenance survives every outcome:

```text
Rejected Candidate   → evidence preserved
Skipped Candidate    → evidence preserved
Duplicate/Linked     → evidence preserved
Imported Candidate   → evidence preserved
Import Failed        → evidence preserved
```

## Next Sequential Audit Target

### **Design 084 — Company CRM / Company Directory**

The next audit should preserve the Company-domain boundary:

> **Company ≠ Contact ≠ Lead ≠ Client ≠ Deal ≠ Organization/Tenant ≠ CompanyDomain ≠ CompanyAlias ≠ CompanyRelationship ≠ CompanySearch/ListProjection.**

It should reconcile Designs **008–011 and 083** with the canonical CRM entity model while preserving:

* Company is a durable CRM business/entity identity, not merely a Lead's company-name string,
* Company ≠ the platform's own tenant/Organization entity,
* one Company can have many Contacts and Leads,
* Contact employment/association ≠ Company identity,
* duplicate Company detection must not destructively merge records automatically,
* domains, names and aliases are evidence/identifiers rather than sole identity keys,
* CRM admission from Design 083 must link to/reuse canonical Company identity instead of creating duplicates,
* Company list/search projections must not become another Company source of truth,
* historical Lead/Deal/Contact relationships survive Company name/domain changes.

The sequence continues strictly with **Design 084 only next**, under the unchanged audit contract.
