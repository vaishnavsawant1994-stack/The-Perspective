# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 148 — Data Import / Export Administration

Design 148 should become the **canonical Team Workspace administrative data-movement, structured import-job, staging/validation/mapping, controlled commit, governed export-job, dataset snapshot, generated-file, retention, and transfer-history surface** for moving platform data into and out of canonical domains.

Its purpose is to answer:

> **“Which dataset is being imported or exported, who requested it, under which Organization and permission scope, which exact source file/schema or query specification is involved, what validation/mapping occurred, which records were accepted/rejected/skipped, whether canonical writes actually committed, which immutable export dataset was generated, and where the resulting governed file artifact can safely be retrieved?”**

Design 148 must not become:

* another Lead/Data Extraction system;
* another generic database editor;
* a raw CSV-to-table loader;
* another Files library;
* another Reporting engine;
* another API/webhook system;
* a way to bypass source-domain validation or authorization.

Its strongest boundary is:

> **ImportJob ≠ ImportSourceFile ≠ ImportSchemaDefinition ≠ ImportMapping ≠ StagedImportRecord ≠ ImportValidationResult ≠ ImportCommitBatch ≠ CanonicalDomainRecord ≠ ExportJob ≠ ExportSpecification ≠ ExportDatasetSnapshot ≠ ExportArtifact ≠ Asset/FileVersion ≠ ReportVersion ≠ AuditEvent.**

No exact route is being invented or finalized during Phase 3A.1.

The central implementation rule is:

> **Imports never write arbitrary rows directly into canonical tables. They must pass through typed schema recognition, normalization, permission-aware validation, staging, deduplication, source-domain commands, and commit evidence. Exports must freeze the exact authorized query/scope/cutoff used to generate the dataset, then produce a protected immutable artifact. Import source files, generated export files, job state, domain records, and Audit evidence remain distinct throughout the lifecycle.**

---

# 1. Classification

| Audit field                     | Classification                                                                                                                                                                                  |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                   | **148**                                                                                                                                                                                         |
| **Canonical name**              | **Data Import / Export Administration**                                                                                                                                                         |
| **Product area**                | Team Workspace / Platform Administration / Data Governance                                                                                                                                      |
| **User surface**                | **Authenticated Team Workspace**                                                                                                                                                                |
| **Screen class**                | Data Transfer Administration / Import-Export Operations Workspace                                                                                                                               |
| **Classification**              | **Canonical Governed Data Import, Validation, Commit, Export Snapshot & Transfer-History Anchor**                                                                                               |
| **Primary purpose**             | Administer controlled bulk data ingestion and data extraction while preserving tenant isolation, source-domain semantics, authorization, provenance, validation, and immutable transfer history |
| **Primary import identity**     | `ImportJob`                                                                                                                                                                                     |
| **Import file identity**        | `ImportSourceFile` / canonical Asset/FileVersion reference                                                                                                                                      |
| **Import schema identity**      | `ImportSchemaDefinition`                                                                                                                                                                        |
| **Column/field mapping**        | `ImportMapping`                                                                                                                                                                                 |
| **Staging identity**            | `StagedImportRecord`                                                                                                                                                                            |
| **Validation evidence**         | `ImportValidationResult`                                                                                                                                                                        |
| **Import decision**             | accepted/rejected/skipped/duplicate/conflict state                                                                                                                                              |
| **Canonical write execution**   | `ImportCommitBatch` / per-record canonical command results                                                                                                                                      |
| **Primary export identity**     | `ExportJob`                                                                                                                                                                                     |
| **Export query/config**         | `ExportSpecification`                                                                                                                                                                           |
| **Frozen dataset identity**     | `ExportDatasetSnapshot`                                                                                                                                                                         |
| **Generated output**            | `ExportArtifact` backed by Design-030 Asset/FileVersion                                                                                                                                         |
| **Data extraction boundary**    | Designs 009 / 082 / 083                                                                                                                                                                         |
| **Lead source/import boundary** | Designs 008 / 081 / 083                                                                                                                                                                         |
| **Asset/File dependency**       | Design 030                                                                                                                                                                                      |
| **Reporting boundary**          | Designs 033 / 130–134                                                                                                                                                                           |
| **Search/filter dependency**    | Design 079 where selection derives from authorized search views                                                                                                                                 |
| **Tenant dependency**           | Design 145                                                                                                                                                                                      |
| **Authorization dependency**    | Design 144                                                                                                                                                                                      |
| **Developer/API boundary**      | Design 146                                                                                                                                                                                      |
| **Audit dependency**            | Designs 039 / 138                                                                                                                                                                               |
| **System-health dependency**    | Design 147 only for shared platform failure conditions                                                                                                                                          |
| **Primary query service**       | `DataTransferAdministrationQueryService`                                                                                                                                                        |
| **Import orchestration**        | `ImportJobService`                                                                                                                                                                              |
| **Schema registry**             | `ImportSchemaRegistry`                                                                                                                                                                          |
| **Mapping validator**           | `ImportMappingValidator`                                                                                                                                                                        |
| **Staging service**             | `ImportStagingService`                                                                                                                                                                          |
| **Commit service**              | `ImportCommitService`                                                                                                                                                                           |
| **Export orchestration**        | `ExportJobService`                                                                                                                                                                              |
| **Dataset snapshot service**    | `ExportDatasetSnapshotService`                                                                                                                                                                  |
| **Artifact generation**         | file generation + Design-030 storage infrastructure                                                                                                                                             |
| **Parent shell**                | `InternalAppShell` — Design 001                                                                                                                                                                 |
| **Auth**                        | Required                                                                                                                                                                                        |
| **Authorization**               | Active OrganizationMembership + data-transfer/source-domain permissions                                                                                                                         |
| **Implementation priority**     | **Critical Data Integrity / Bulk Mutation Safety / Privacy / Tenant Isolation**                                                                                                                 |
| **Reuse level**                 | **Platform-wide across CRM, Projects, finance-safe exports, Reports, contacts, leads, operational datasets and future administrative data movement**                                            |

Canonical architecture:

```text
IMPORT

Source File
    ↓
ImportJob
    ↓
Schema Detection
    ↓
Field Mapping
    ↓
Normalization
    ↓
Staging
    ↓
Validation / Dedupe
    ↓
Accepted Records
    ↓
Canonical Domain Commands
    ↓
Committed Domain Records


EXPORT

Authorized ExportSpecification
    ↓
Resolve exact scope/query
    ↓
Freeze cutoff / dataset snapshot
    ↓
Generate ExportArtifact
    ↓
Design-030 FileVersion
    ↓
Protected download
```

---

# 2. Reuse

## Design 148 must reuse Design 030 for files

Import source files and export output files should not create another file-storage subsystem.

Correct:

```text
ImportJob IJ-20
   ↓
ImportSourceFile
   ↓
Asset / FileVersion FV-50
```

and:

```text
ExportJob EJ-30
   ↓
ExportArtifact
   ↓
Asset / FileVersion FV-90
```

Design 030 remains canonical file/version/storage authority.

---

## ImportJob ≠ Asset/FileVersion

Critical.

### FileVersion

> The uploaded bytes.

### ImportJob

> The governed operation interpreting and attempting to import those bytes.

The same uploaded file may theoretically support:

* preview;
* validation retry;
* different authorized mapping/version;

without changing its byte identity.

---

## ExportJob ≠ FileVersion

Permanent.

The Job records:

* request;
* query scope;
* actor;
* dataset cutoff;
* state;
* generation process.

FileVersion is the generated artifact.

---

## Design 009 Data Extraction ≠ Administrative Import

Design 009 handles:

> acquiring/extracting external source data.

Design 148 handles:

> administratively importing a structured dataset into canonical platform domains.

Possible chain:

```text
ExtractionJob
    ↓
NormalizedCandidate
    ↓
review/admission
```

is different from:

```text
CSV ImportJob
    ↓
StagedImportRecord
    ↓
canonical domain command
```

Do not merge them into one generic `DataJob`.

---

## Design 083 Extraction Review ≠ Import staging universally

Design 083 specifically governs extracted/imported prospect/candidate records in the CRM acquisition pipeline.

Design 148 is broader administrative data movement.

They may share:

* table preview;
* validation badges;
* field mapping primitives;
* row-error presentation.

Their domain records remain distinct.

---

## Lead import ≠ automatic Lead creation

If imported data targets CRM Lead domain:

it must obey canonical Lead admission/deduplication/business rules from Designs 011/083/089.

Design 148 cannot bypass them.

---

## Import mapping ≠ canonical schema

Critical.

User mapping:

> CSV `company` → CRM `company_name`

is job configuration.

It does not redefine the CRM schema.

---

## StagedImportRecord ≠ canonical record

Absolute.

A staged Contact row is not yet a Contact.

---

## Validation success ≠ committed record

Permanent.

A record can validate, then fail during commit due to:

* concurrent duplicate;
* permission change;
* source-domain conflict;
* changed reference;
* transaction failure.

---

## Import count ≠ canonical created count

Keep distinct:

```text
rows parsed
rows staged
rows valid
rows rejected
rows skipped
rows deduplicated
rows attempted
rows created
rows updated
rows failed
```

No one generic:

```text
processedCount
```

as sole truth.

---

## Import update ≠ upsert by default

Critical.

A bulk import must not silently overwrite an existing canonical record merely because:

> email or name matched.

Update behavior must be explicit, domain-specific, and guarded.

---

## Deduplication ≠ update

Permanent.

A duplicate may be:

* skipped;
* linked;
* reviewed;
* safely updated;

depending on domain policy.

---

## Import failure ≠ rollback all records universally

Some imports may support:

* all-or-nothing transaction;
* bounded batch commits;
* per-record partial success.

The policy must be explicit by import type.

Do not pretend one giant transaction works for million-row imports.

---

## Import retry ≠ parse again from mutable current configuration automatically

A retry should retain:

* same source FileVersion;
* same schema/mapping revision;
* same import intent;

unless the user deliberately creates a revised mapping/attempt.

---

# Export boundary

## ExportJob ≠ Report

Critical.

### Report

Curated, metric-defined, potentially approved/released business artifact.

### Export

Authorized dataset extraction.

A CSV of Clients is not a `ReportVersion`.

---

## ExportArtifact ≠ ReportArtifact

They may both reuse Design-030 files.

Their provenance/domain identity remains distinct.

---

## Live export ≠ ReportSnapshot

If exporting current CRM data:

that is a data snapshot of the authorized query at a defined cutoff.

It is not a finalized client Report.

---

## Export query ≠ SavedView

A SavedView may help initialize an ExportSpecification.

The export must freeze its own exact filters/scope/cutoff.

Later SavedView changes cannot change an already generated export.

---

## Export current-state query ≠ continuously live file

Absolute.

Once generated:

the artifact represents a historical extraction.

---

## API data access ≠ ExportJob

Design 146 supports programmatic requests.

Design 148 supports governed bulk administrative extraction.

Do not fake large exports as client-side API pagination downloads.

---

# 3. Entities

## ImportJob

Canonical administrative import execution identity.

Conceptually:

```text
ImportJob
├── id
├── organizationId
├── importType
├── sourceFileVersionId
├── schemaDefinitionId
├── mappingRevisionId
├── requestedBy
├── lifecycle
├── startedAt?
├── completedAt?
├── commitPolicy
├── summary
└── revision
```

---

## ImportJob lifecycle

Conceptually:

```text
Uploaded
Analyzing
Mapping Required
Validating
Ready
Importing
Completed
Completed With Errors
Failed
Cancelled
```

Exact taxonomy belongs Phase 3D.

---

## Uploaded ≠ analyzed

Permanent.

---

## Mapping complete ≠ validated

Permanent.

---

## Ready ≠ committed

Absolute.

---

## Cancel requested ≠ cancelled

If batch writes are already running.

---

## ImportSourceFile

Prefer reference to Design-030 exact FileVersion.

Important metadata:

* filename;
* format;
* byte size;
* media type;
* checksum;
* upload timestamp;
* scan state.

Do not use filename as file identity.

---

## Malware / file safety scan

Import source files should pass the platform's normal file security/scan policies before parsing where applicable.

Do not parse untrusted arbitrary uploaded documents before safety controls.

---

## Supported formats

Should be allowlisted.

Examples could include CSV/XLSX where frozen product supports them.

Do not accept arbitrary file formats simply because parser libraries exist.

---

## ImportSchemaDefinition

Versioned canonical description of an importable target shape.

Conceptually:

```text
ImportSchemaDefinition
├── id
├── domainType
├── version
├── fields[]
├── requiredFields[]
├── supportedOperations
├── mappingRules
└── lifecycle
```

---

## Import schema ≠ ORM/database schema

Critical.

Do not expose internal database column names.

Import schemas are stable external/admin contracts.

---

## Schema version

Important.

A file imported under:

> Contact Import Schema v2

must remain historically interpretable after v3 exists.

---

## ImportMapping

Conceptually:

```text
ImportMapping
├── importJobId
├── revision
├── sourceColumns
├── targetFields
├── transforms
├── constants?
└── createdBy
```

---

## Mapping transform safety

Use allowlisted transforms such as:

* trim;
* date parsing;
* enum mapping;
* phone normalization;
* country mapping;

where supported.

No arbitrary JS/Python/SQL expressions.

---

## Mapping revision

If mapping changes after validation:

validation results become stale and must be recomputed.

---

## StagedImportRecord

Conceptually:

```text
StagedImportRecord
├── id
├── importJobId
├── sourceRowNumber
├── normalizedData
├── validationState
├── duplicateState
├── targetReference?
├── decisionState
└── revision
```

---

## Raw row ≠ normalized row

Preserve enough lineage to explain conversion errors.

Do not mutate the source file.

---

## Source row number

Useful operational evidence.

But row number ≠ identity outside that FileVersion.

---

## Staged data retention

Should be temporary/governed.

Do not retain duplicate copies of sensitive imported data indefinitely merely because staging exists.

---

## ImportValidationResult

Conceptually:

```text
ImportValidationResult
├── stagedRecordId
├── ruleKey
├── severity
├── result
├── safeMessage
├── field?
└── validationVersion
```

---

## Validation rule ≠ source-domain business rule duplication

The Import layer can perform:

* format validation;
* required-field validation;
* referential prechecks.

Canonical domain service still performs final business validation at commit.

---

## Warning ≠ Error

Permanent.

Warnings may be importable.

Errors should block the affected record according to policy.

---

## DuplicateCandidate

If dedupe needs first-class evidence:

use references to canonical target candidates rather than matching only by text.

Do not auto-merge based on fuzzy similarity.

---

## Import decision

Possible orthogonal decision:

```text
Import
Skip
Reject
Needs Review
```

where supported.

It should not become source-domain lifecycle.

---

## ImportCommitBatch

For scalable imports.

Conceptually:

```text
ImportCommitBatch
├── id
├── importJobId
├── batchNumber
├── sourceRecordRange / record IDs
├── startedAt
├── completedAt?
├── state
└── revision
```

---

## ImportCommitResult

Per staged record:

```text
Created
Updated
Skipped
Duplicate
Conflict
Failed
```

with exact resulting canonical entity reference when successful.

---

## ImportJob success ≠ every row success

Permanent.

`COMPLETED_WITH_ERRORS` may be valid.

---

# Export entities

## ExportJob

Canonical export execution identity.

Conceptually:

```text
ExportJob
├── id
├── organizationId
├── exportType
├── exportSpecificationId
├── requestedBy
├── state
├── requestedAt
├── startedAt?
├── completedAt?
├── datasetSnapshotId?
├── artifactFileVersionId?
└── revision
```

---

## ExportSpecification

Frozen user/system intent.

Conceptually:

```text
ExportSpecification
├── domainType
├── selectedFields
├── filters
├── sort
├── scope
├── format
├── timezone/locale?
└── schemaVersion
```

---

## Selected fields must be allowlisted

No arbitrary SQL columns.

---

## Export fields require authorization

Critical.

A user authorized to export:

> Client names

may not be authorized to export:

> payment information;
> internal notes;
> Audit history.

Field-level export policy should be enforceable.

---

## ExportDatasetSnapshot

Frozen evidence of what dataset the export represents.

Conceptually:

```text
ExportDatasetSnapshot
├── exportJobId
├── query/specification hash
├── cutoffRecordedAt / revision boundary
├── source schema versions
├── row count
├── generatedAt
├── authorization context version
└── provenance
```

Exact snapshot strategy depends on database scale.

---

## Export snapshot ≠ full duplicate database copy necessarily

Could preserve:

* stable query;
* cutoff;
* source version/revision manifest;

sufficient to make the export deterministic/reconstructable.

---

## Export cutoff

Critical.

If the export begins at 10:00 and ends at 10:08:

records changing during generation must follow explicit snapshot/cutoff semantics.

Do not silently mix arbitrary points in time.

---

## ExportArtifact

Logical generated output.

Backed by Design-030 FileVersion.

May preserve:

* format;
* compression;
* checksum;
* row count;
* schema version.

---

## Artifact expiration ≠ ExportJob deletion

A downloadable temporary artifact may expire while ExportJob/history remains.

---

# 4. Permissions

Design 148 should conceptually distinguish:

```text
dataImport.read
dataImport.create
dataImport.validate
dataImport.commit
dataImport.cancel

dataExport.read
dataExport.create
dataExport.download

dataTransfer.readSensitive

dataImport.updateExisting
dataExport.exportSensitiveFields
```

Exact identifiers belong Phase 3D.

---

## Import create ≠ Import commit

Critical.

A user may be allowed to:

* upload;
* map;
* validate;

without being authorized to perform bulk canonical mutation.

---

## Validate ≠ update existing records

Permanent.

---

## Create-record import ≠ update-record import

Potentially separate permissions.

---

## Export read ≠ Export create

Permanent.

---

## Export create ≠ Export sensitive fields

Critical.

---

## Export download ≠ source-record permission bypass

At generation time, authorization filters dataset.

At download time, the artifact itself must still be access controlled.

---

## Previous export ownership ≠ permanent access after privilege revocation

Important.

If a user's access is revoked after an export was generated:

download authorization should follow explicit security policy rather than assuming:

> requester once had access, therefore file remains accessible forever.

---

## Export artifact URLs

Use short-lived signed/authorized delivery.

Never permanent public links.

---

## Import row permissions

Bulk operation cannot bypass source-domain permissions.

Example:

User may import Contacts but not modify protected Clients.

Each canonical command remains governed.

---

## Bulk authorization ≠ one superficial initial check

For homogeneous bulk operations, the system can optimize permission evaluation.

It cannot skip resource/scope validation.

---

## Cross-tenant target references

Absolute prohibition.

Imported:

```text
projectId = P-BELONGS-TO-ORG-B
```

must fail even if syntactically valid.

---

## Import reference resolution

Any referenced:

* Client;
* Project;
* Team;
* Role;
* Product;
* User;

must be tenant-validated and permission-safe.

---

## Export counts permission-safe

Before generation:

> 12,420 records

must represent only records the actor is authorized to export.

---

## Import/export administrator ≠ Audit administrator

Design 138 remains separate.

---

# 5. States

Design 148 must keep **file state, parsing state, mapping state, validation state, staging state, record decision, commit state, ExportJob state, dataset snapshot state, artifact state, and download availability** separate.

### Import Job

```text
Uploaded
Analyzing
Mapping Required
Validating
Ready
Importing
Completed
Completed With Errors
Failed
Cancelled
```

### File

```text
Uploading
Available
Scanning
Rejected
Unavailable
```

### Mapping

```text
Incomplete
Valid
Invalid
Stale
```

### Validation

```text
Pending
Validating
Valid
Warning
Invalid
Unavailable
```

### Staged Record

```text
Ready
Warning
Invalid
Duplicate
Conflict
Skipped
Committed
Failed
```

### Export Job

```text
Queued
Resolving Dataset
Generating
Completed
Failed
Cancelled
```

### Export Artifact

```text
Generating
Available
Expired
Restricted
Unavailable
```

These must never collapse into one generic:

```text
transfer.status
```

---

## File uploaded ≠ safe to parse

Permanent.

---

## File safe ≠ schema valid

Permanent.

---

## Mapping valid ≠ records valid

Permanent.

---

## Records valid ≠ commit succeeded

Absolute.

---

## ImportJob Completed ≠ all records imported

Permanent.

---

## Duplicate ≠ invalid

Permanent.

---

## Skipped ≠ failed

Permanent.

---

## Conflict ≠ duplicate

Critical.

A concurrent canonical change may create a conflict without the record being duplicate.

---

## Export queued ≠ dataset frozen

Permanent.

---

## Dataset frozen ≠ artifact generated

Permanent.

---

## Artifact generated ≠ download authorized

Absolute.

---

## Artifact expired ≠ export failed

Permanent.

---

## Export job failed ≠ source data corrupted

Permanent.

---

## Cancelled export ≠ generated artifact necessarily deleted

If artifact already completed before cancel race, preserve exact state.

---

## State Coverage

Design 148 inherits Design 150 plus:

```text
Data Transfer Loading
Data Transfer Available
Data Transfer Empty
Data Transfer Restricted
Data Transfer Partial
Data Transfer Unavailable

Import File Uploading
Import File Scanning
Import File Available
Import File Rejected
Import File Unavailable

Import Analyzing
Import Mapping Required
Import Mapping Valid
Import Mapping Invalid
Import Mapping Stale

Import Validation Pending
Import Validating
Import Valid
Import Warning
Import Invalid
Import Validation Unavailable

Import Ready
Import Running
Import Completed
Import Completed With Errors
Import Failed
Import Cancel Requested
Import Cancelled

Row Ready
Row Warning
Row Invalid
Row Duplicate
Row Conflict
Row Skipped
Row Committed
Row Failed

Export Queued
Export Resolving Dataset
Export Generating
Export Completed
Export Failed
Export Cancel Requested
Export Cancelled

Export Snapshot Ready
Export Snapshot Failed
Export Snapshot Restricted

Export Artifact Generating
Export Artifact Available
Export Artifact Expired
Export Artifact Restricted
Export Artifact Unavailable

Import Updated Elsewhere
Mapping Updated Elsewhere
Validation Became Stale
Commit Updated Elsewhere
Export Updated Elsewhere
Authorization Changed
Artifact Expired
Data Transfer Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize the lifecycle rather than just showing filenames.

For import:

```text
Import identity
↓
Source file
↓
Target data type
↓
Mapping
↓
Validation summary
↓
Duplicate/error counts
↓
Commit readiness
↓
Committed results
```

For export:

```text
Export identity
↓
Dataset/source
↓
Filters/scope
↓
Requested fields
↓
Snapshot/cutoff
↓
Row count
↓
Generation state
↓
Artifact/download state
```

Only frozen Design-148 areas/actions should render.

---

## Import summary must avoid misleading one-number progress

Prefer:

> 10,000 rows parsed
> 9,540 valid
> 240 duplicates
> 180 invalid
> 40 warnings

rather than:

> 95% successful

when the semantics are unclear.

---

## Row validation should preserve source location

Example:

> Row 184 · `email` · Invalid address

and safe target field.

---

## Mapping UI

If mapping appears in frozen Design 148:

it should communicate:

> Source column → Canonical import field

without exposing database column names.

---

## High-risk update modes should be visually distinct

If frozen UI allows:

> Update existing records

it must look materially different from:

> Create new records only.

---

## Export sensitive fields should remain explicit

If an export includes highly sensitive data:

the UI should show that the export requires heightened authorization.

---

## Download control must reflect artifact state

Correct:

> Export complete · Download available

not:

> Job complete = automatically publicly accessible.

---

## Tablet

Following Design 152:

* job identity/state first;
* validation/count summaries remain visible;
* row detail becomes expandable;
* mapping stacks vertically;
* export field/filter summary collapses into cards;
* primary commit/download action remains distinct.

---

## Mobile

Import priority:

```text
Import type
↓
File
↓
Job state
↓
Valid / warning / invalid / duplicate counts
↓
Mapping issue
↓
Safe commit action
```

Export priority:

```text
Dataset
↓
Job state
↓
Scope
↓
Record count
↓
Artifact state
↓
Download
```

Do not reproduce a 30-column spreadsheet on mobile.

---

## Mobile import item

Conceptually:

> Contact Import
> contacts-aug.csv
> Ready for import
> 942 valid
> 31 duplicates
> 12 invalid
> Action: Import 942 approved rows

---

## Accessibility

An import could communicate:

> Import job IJ-42 is using Contact Import Schema version 3 and source FileVersion FV-92. Nine hundred forty-two staged records are valid, thirty-one are duplicates, and twelve are invalid. Validation completed against the current Organization. No canonical Contacts have yet been created. You are authorized to commit new records but not to overwrite existing Contacts.

An export could communicate:

> Export job EJ-18 contains an authorized snapshot of 2,418 Client records as of August 23 at 3:05 AM organization time. The CSV artifact has been generated and is available for protected download. The export does not update or alter the source Client records.

where canonical evidence supports it.

---

# 7. Backend Requirements

## Canonical import architecture

```text
Upload
  ↓
Design-030 FileVersion
  ↓
Security scan
  ↓
ImportJob
  ↓
Parse with format limits
  ↓
Schema recognition
  ↓
Mapping
  ↓
Normalization
  ↓
StagedImportRecord
  ↓
Validation / dedupe
  ↓
Approved rows
  ↓
Source-domain command handlers
  ↓
Canonical records
```

---

## Canonical export architecture

```text
Export request
    ↓
Authorization
    ↓
Validated ExportSpecification
    ↓
Freeze query / scope / cutoff
    ↓
ExportDatasetSnapshot
    ↓
Asynchronous generator
    ↓
ExportArtifact
    ↓
Design-030 FileVersion
    ↓
Protected download
```

---

## Import format parsing security

Bulk parsers must defend against:

* oversized files;
* decompression bombs;
* extreme row/column counts;
* malformed encodings;
* formula injection;
* parser resource exhaustion.

---

## CSV formula injection

Critical for generated/import-preview/download workflows.

Values beginning with spreadsheet formula markers must be handled safely when generating CSV/XLSX intended for spreadsheet software.

Do not allow untrusted data to become executable spreadsheet formulas.

---

## XLSX parser limits

If XLSX is supported:

apply:

* worksheet limits;
* cell limits;
* shared-string limits;
* memory limits.

---

## Streaming parsing

Large imports should use streaming/batched parsing rather than loading whole files into process memory.

---

## Import source immutability

The exact source FileVersion remains immutable.

Mapping/normalization never edits uploaded bytes.

---

## Import Schema Registry

One canonical:

```text
ImportSchemaRegistry
```

should define supported targets.

Examples belong Phase 3D from actual required importable domains.

No generic:

> import any database table.

---

## Schema compatibility

ImportJob pins exact schema version.

---

## Mapping validator

Conceptually:

```text
validateImportMapping(
    schemaDefinition,
    mappingRevision
)
```

should check:

* required fields;
* duplicate mappings;
* type compatibility;
* transform allowlist;
* unavailable target fields;
* permission restrictions.

---

## No arbitrary transforms

Absolute.

No:

```text
eval()
custom JS
SQL expression
Python expression
```

from uploaded/admin data.

---

## Normalization

Use canonical shared normalizers where possible:

* email;
* URL;
* phone;
* dates;
* currency;
* enums.

Do not create import-only alternative normalization that yields values the source domain would reject.

---

## Validation pipeline

Conceptually:

```text
File syntax
    ↓
Schema validation
    ↓
Field normalization
    ↓
Reference validation
    ↓
Dedupe/conflict detection
    ↓
Domain pre-validation
```

---

## Final validation remains source-domain authoritative

Critical.

Immediately before canonical commit, the source service must revalidate.

---

## Dedupe strategy must be domain-specific

Contact dedupe rules differ from:

* Company;
* Lead;
* Project;
* Invoice.

Do not use one universal:

```text
same name = duplicate
```

rule.

---

## Fuzzy match ≠ automatic merge

Absolute.

---

## Staging

Staging storage should have:

* Organization ID;
* ImportJob ID;
* source-row lineage;
* normalized values;
* validation state.

It should not be exposed as canonical application data.

---

## Staging data encryption/retention

Sensitive staged datasets require normal encryption/security plus explicit expiration/cleanup policy.

---

## Commit service

Conceptually:

```text
commitImportJob(
    importJobId,
    approvedRecordIds,
    expectedJobRevision
)
```

should:

1. authenticate;
2. resolve Organization;
3. authorize import commit;
4. ensure source file/schema/mapping unchanged;
5. ensure validation still current;
6. revalidate source-domain permissions;
7. process bounded batches;
8. call canonical domain commands;
9. record exact result per staged record;
10. update summary;
11. Audit.

---

## Do not directly bulk INSERT canonical tables

Absolute.

For example, importing Leads must still trigger canonical:

* validation;
* provenance;
* deduplication;
* indexes;
* domain events;
* Audit where applicable.

---

## Batch size

Should be bounded/configurable.

---

## Batch transaction semantics

Each batch may transact separately for scale.

Job summary must accurately expose partial success.

---

## Idempotent record commit

Critical.

A worker retry must not create duplicate Contacts/Leads/etc.

Each staged record should have a stable import operation identity passed to canonical services.

Conceptually:

```text
importJobId
+
stagedRecordId
```

---

## Worker crash

After restart:

committed rows must be recognized as already committed.

Do not restart from row 1 blindly.

---

## Import retry

Different concepts:

```text
retry failed commit
revalidate staged rows
reparse file
create revised mapping
new import job
```

Keep them distinct.

---

## Mapping change

Changing mapping after staging should invalidate downstream normalized/validation results as required.

---

## Canonical data changed after validation

Example:

At validation:

> email unique.

Before commit:

another Contact with email created.

Final canonical command must produce:

> duplicate/conflict

rather than trusting stale preview.

---

## Referential imports

If one row references another imported row:

explicit import dependency handling may be needed by certain schemas.

Do not invent a generic relational ETL engine unless frozen requirements demand it.

---

## Import cancellation

Cancellation stops future uncommitted batches.

It cannot undo already committed canonical records automatically.

---

## Cancel ≠ rollback committed records

Absolute.

A rollback would require source-domain compensation, not generic import deletion.

---

# Export backend requirements

## Export request

Conceptually:

```text
requestExport(
    exportSpecification,
    currentMembership,
    idempotencyKey
)
```

should:

1. authenticate;
2. resolve tenant;
3. validate export type;
4. validate field permissions;
5. validate filter/scope;
6. determine cutoff/snapshot strategy;
7. create ExportJob;
8. enqueue generation;
9. Audit request where appropriate.

---

## Export field registry

Reuse canonical safe external/admin field definitions.

Do not export:

* passwords;
* credential secrets;
* OAuth tokens;
* encryption keys;
* API key secrets;
* signing secrets.

Ever.

---

## Secret fields should not merely require elevated export permission

They should generally be **non-exportable**.

---

## Sensitive fields

Other data may require explicit high-level permission.

Examples depend on real domain and privacy policy.

---

## Export snapshot consistency

Possible implementation mechanisms:

* DB snapshot transaction for bounded jobs;
* revision/cutoff IDs;
* timestamp + stable ordering;
* materialized snapshot table.

Phase 3D selects appropriate strategy.

The semantic requirement is:

> the artifact has an exact dataset boundary.

---

## Stable ordering

Use canonical IDs/cursors.

Do not depend on nondeterministic DB row order.

---

## Large export

Asynchronous.

Do not hold an HTTP request open for millions of rows.

---

## Streaming generation

Generate large CSV/ZIP outputs incrementally to file/object storage.

---

## Export artifact security

Generated artifact must use:

* Design-030 protected storage;
* encryption at rest;
* authorized download;
* short-lived signed delivery;
* retention/expiration policy.

---

## Download should be auditable where sensitive

Design 138 may record:

> Export artifact downloaded

for high-risk governed exports if policy requires it.

Do not log file contents.

---

## Export Artifact expiration

After retention expiry:

file bytes may be removed while:

* ExportJob;
* specification;
* row count;
* Audit evidence;

remain according to governance policy.

---

## Regenerate ≠ retrieve old artifact

If expired artifact must be regenerated:

prefer a new ExportJob/snapshot unless exact old dataset can be deterministically reproduced.

Do not silently claim a new current export is the old one.

---

## Export retries

Generation retry should use the same frozen dataset boundary if possible.

If snapshot is no longer available:

fail explicitly rather than generating current data under old ExportJob identity.

---

## Formula injection on export

Again critical.

Untrusted text fields in CSV/XLSX must be encoded safely for spreadsheet consumption.

---

## Encoding/locale

Store/export standard canonical representations.

Locale-specific presentation should not corrupt round-tripping.

---

## Dates/timezones

Exports should state:

* timezone;
* timestamp format.

Do not emit ambiguous local times without context.

---

## Decimal/money

Use decimal-safe values and explicit currency.

Do not use floating-point formatting that changes financial meaning.

---

## Boolean/null distinctions

Preserve:

```text
false
null
empty string
0
```

as different values where source schema distinguishes them.

---

## PII minimization

Export only fields requested and authorized.

No hidden extra columns "for convenience."

---

## Import/export encryption

Files at rest follow Design-030 security.

Optional customer-supplied encrypted archives should not be invented without frozen requirement.

---

## Export selection from Design 079/Search

If a user exports a filtered result set:

freeze the authorized query/filter specification.

Do not trust client-supplied arbitrary record IDs without reauthorization.

---

## Data transfer Audit

Design 138 should record material actions such as:

* Import requested;
* Import committed;
* Import cancelled;
* sensitive Export requested/generated/downloaded where policy requires.

Audit stores:

* Job ID;
* type;
* counts;
* actor;
* safe query summary.

Never full source files/rows.

---

## Import mutation Audit

Source-domain commands may already produce per-record AuditEvents for sensitive changes.

Do not duplicate thousands of identical global Audit records solely because they came from one import.

Use:

* import Job-level Audit;
* canonical domain-specific Audit for genuinely audit-worthy record mutations.

---

## System Health boundary

A single ImportJob failing due bad CSV is not a Design-147 Incident.

A shared parser/queue/storage outage affecting all import/export jobs may contribute system-health evidence.

---

## Developer API boundary

Bulk export cannot be used to bypass API rate/permission architecture.

Machine clients needing bulk data should use explicit API/export capabilities when formally designed.

---

## Job scheduling

Use durable queue/run execution.

No browser-driven processing.

---

## Progress counters

Must come from committed/staged execution evidence.

Avoid speculative percentages without denominator certainty.

---

## Job leases

Workers claim Jobs/batches durably.

Crash recovery must be safe.

---

## Idempotency

Required for:

* ImportJob creation;
* staging;
* record commit;
* export request;
* snapshot creation;
* artifact generation;
* cancellation;
* download/audit callbacks where relevant.

---

## Concurrency

Critical races:

### Mapping changes while validation running

Validation output must pin mapping revision.

### Import commits while another import targets same data

Canonical domain dedupe/concurrency rules win.

### Permission revoked mid-import

Uncommitted batches reauthorize according to execution policy.

### Export generation while source data changes

Frozen dataset boundary protects consistency.

### Export permission revoked before download

Download reauthorizes.

### Artifact expires while user opens it

Return Expired, not a broken/public link.

---

## Authorization during long-running import

This requires explicit execution policy.

Safer model:

* Job created by authorized actor;
* system/service performs bounded work under an Organization-scoped execution authority;
* source-domain eligibility and tenant boundaries remain enforced;
* privilege revocation can stop future uncommitted high-risk operations according to policy.

Do not simply impersonate the creator forever.

---

## Authorization during long-running export

Sensitive egress should revalidate security at generation and download stages where appropriate.

---

## Cache

Design-148 cache varies by:

```text
organizationId
membership/authorizationRevision
importJobRevision
mappingRevision
validationRevision
commitRevision
exportJobRevision
snapshotRevision
artifactRevision
```

---

## Never cache raw sensitive import rows in shared caches

Absolute.

---

## Performance

Use:

* object/file storage;
* streaming parsers;
* bounded staging batches;
* bulk but canonical source-service command strategies;
* resumable checkpoints;
* asynchronous export generation;
* cursor/snapshot reads;
* compressed artifacts where appropriate;
* paginated error previews.

Do not render or load 500,000 row-level errors into Design 148 at once.

---

## Error sampling vs full error artifact

For huge imports:

UI may show first/bounded errors and generate a governed error file/report if the frozen design supports it.

Do not invent an extra screen.

---

## Partial failure contract

Example:

```text
File              ✓
Mapping           ✓
Validation        partial
```

Correct:

> 84% of rows validated; remaining rows are still being processed/unavailable.

Incorrect:

> Remaining rows are invalid.

Another:

```text
Import commits:
8 batches success
1 batch failed
```

Correct:

> Import completed partially; exact successful canonical records remain committed.

Not:

> Entire import failed, no data changed.

Another:

```text
ExportJob        ✓
Artifact storage ✕
```

Correct:

> Dataset snapshot was resolved, but export artifact generation/storage failed.

Not:

> No exportable data.

---

## Backend Requirement Matrix

| Requirement                                | Status                    |
| ------------------------------------------ | ------------------------- |
| Design-030 Asset/FileVersion reuse         | **Critical**              |
| ImportJob/FileVersion separation           | **Critical**              |
| ExportJob/FileVersion separation           | **Critical**              |
| Design-009/082/083 Extraction separation   | **Critical**              |
| Import staging/canonical record separation | **Critical**              |
| Import validation/commit separation        | **Critical**              |
| Import dedupe/update separation            | **Critical**              |
| Export/Report separation                   | **Critical**              |
| Export/SavedView separation                | **Critical**              |
| Stable ImportSchema registry               | **Critical**              |
| Import schema/DB schema separation         | **Critical**              |
| Schema version pinning                     | **Critical**              |
| Mapping revision pinning                   | **Critical**              |
| No arbitrary transform code                | **Critical**              |
| Source file immutability                   | **Critical**              |
| Malware/file scan reuse                    | **Critical**              |
| Parser format/size/resource limits         | **Critical security**     |
| Streaming large-file parsing               | **Critical performance**  |
| Spreadsheet formula-injection protection   | **Critical security**     |
| Typed normalization                        | **Critical**              |
| Domain-specific dedupe                     | **Critical**              |
| No fuzzy auto-merge                        | **Critical**              |
| Final source-domain validation             | **Critical**              |
| No direct canonical bulk INSERT            | **Critical**              |
| Batch commit lineage                       | **Critical**              |
| Per-record idempotency                     | **Critical**              |
| Worker crash recovery                      | **Critical**              |
| Partial import support                     | **Critical**              |
| Cancel/rollback separation                 | **Critical**              |
| Staging retention/minimization             | **Critical privacy**      |
| Cross-tenant reference validation          | **Critical**              |
| Import create/commit permission separation | **Critical**              |
| Update-existing privilege separation       | **Critical**              |
| Export field-level authorization           | **Critical**              |
| Non-exportable secret fields               | **Critical**              |
| Export specification validation            | **Critical**              |
| Frozen export dataset boundary             | **Critical**              |
| Stable export ordering                     | **Critical**              |
| Async large export                         | **Critical**              |
| Streaming artifact generation              | **Critical**              |
| Protected artifact download                | **Critical**              |
| Artifact expiration/history separation     | **Critical**              |
| Permission revalidation on download        | **Critical**              |
| Design-138 Audit reuse                     | **Critical**              |
| Design-145 tenant reuse                    | **Critical**              |
| Design-144 authorization reuse             | **Critical**              |
| Design-147 Incident separation             | **Critical architecture** |
| Durable queues/leases/checkpoints          | **Critical**              |
| Optimistic concurrency                     | **Critical**              |
| Idempotency                                | **Critical**              |
| Partial dependency failure handling        | **Critical**              |

---

# 8. Consolidation

Design 148 has very high data-integrity risk because a naive implementation can turn it into a privileged bypass around every canonical domain service.

**ImportJob / uploaded File conflation**
File storage becomes import execution state.

**Import source file / staging data conflation**
Original bytes are mutated during cleaning.

**Import schema / database schema conflation**
Internal columns become public/admin contract.

**Mapping / canonical field definition conflation**
CSV mapping redefines business schema.

**Mapping valid / row valid conflation**
Schema correctness appears data correctness.

**Validation / commit conflation**
Preview implies database mutation succeeded.

**Staged record / canonical record conflation**
Uncommitted rows appear in CRM.

**Valid row / committed row conflation**
Concurrent conflicts disappear.

**Duplicate / invalid conflation**
Valid existing record appears erroneous.

**Duplicate / update conflation**
Existing records are overwritten automatically.

**Fuzzy match / canonical identity conflation**
Wrong clients/contacts are merged.

**Import / raw SQL bulk load conflation**
Domain validation, events, permissions and Audit are bypassed.

**Import parser / ETL scripting engine conflation**
Uploaded mappings execute arbitrary code.

**Import transform / arbitrary JavaScript conflation**
Security/reproducibility collapses.

**Source row / canonical entity ID conflation**
Row number treated as permanent identity.

**Import count / created count conflation**
Success metrics become misleading.

**Job completed / every row succeeded conflation**
Partial failures disappear.

**Batch failure / whole-job rollback conflation**
Already committed canonical data is misrepresented.

**Cancel / rollback conflation**
Cancellation deletes valid committed records.

**Retry / create new rows again conflation**
Duplicate entities appear.

**Retry / current mapping conflation**
Historical import intent changes.

**Validation result / current domain state conflation**
Stale validation bypasses concurrent data changes.

**Import staging retention / permanent dataset conflation**
Sensitive duplicate data remains indefinitely.

**Lead import / LeadFinder extraction conflation**
Designs 008/009/083 fork.

**Extraction RawRecord / StagedImportRecord conflation**
Acquisition provenance and admin file import semantics merge.

**FileVersion / ImportJob deletion conflation**
Removing job deletes unrelated file history.

**ExportJob / ReportVersion conflation**
Raw data export becomes approved client report.

**ExportArtifact / ReportArtifact conflation**
Reporting provenance disappears.

**ExportJob / FileVersion conflation**
Generated bytes become request/query authority.

**Export query / SavedView conflation**
Saved filter changes old export meaning.

**Export query / arbitrary SQL conflation**
Admin gets unrestricted database extraction.

**Export field / database column conflation**
Internal/secrets become selectable.

**Sensitive field / secret field conflation**
Operator can "authorize" exporting API tokens.

**Export current data / frozen snapshot conflation**
Long generation mixes inconsistent time periods.

**Export snapshot / physical full DB copy conflation**
Implementation overcomplicates architecture unnecessarily.

**Export completed / download authorized conflation**
Revoked user retains sensitive artifact forever.

**Artifact URL / public link conflation**
Generated exports leak.

**Artifact expired / ExportJob failed conflation**
History becomes inaccurate.

**Regenerate expired export / same historical export conflation**
Current data is mislabeled as old snapshot.

**Export retry / current dataset conflation**
Artifact content changes under same ExportJob identity.

**Row count / unauthorized global count conflation**
Sensitive tenant/data volume leaks.

**Import source references / cross-tenant IDs conflation**
Valid IDs from another tenant mutate foreign data.

**Export client-selected IDs / authorized records conflation**
Browser submits inaccessible IDs.

**Creator identity / long-running execution authority conflation**
Jobs impersonate former user indefinitely.

**Spreadsheet value / spreadsheet formula conflation**
CSV export becomes formula-injection attack.

**Decimal / float conflation**
Financial exports corrupt values.

**Null / blank / zero conflation**
Round-trip semantics break.

**Local time / canonical timestamp conflation**
Exports/imports shift dates.

**Filename / file identity conflation**
Replacement file silently changes Import source.

**Current FileVersion / pinned FileVersion conflation**
Import retry reads changed bytes.

**Import Audit / per-row Audit flood conflation**
Compliance log becomes unusable.

**Job error / System Incident conflation**
Bad CSV becomes platform outage.

**Export API / Design-146 API access conflation**
Bulk egress bypasses Developer Access policy.

**Generic `data_jobs` table**
Import/export semantics collapse.

**Generic `status=processing`**
Cannot distinguish parse/validate/commit/generate.

**Generic `rows_processed`**
No valid/duplicate/conflict/committed distinction.

**Generic `mapping JSON`**
No schema version/validation safety.

**Generic `upsert=true`**
Dangerous overwrite behavior.

**Generic `export_fields=*`**
Sensitive-data leakage.

**Generic database CSV dump**
Tenant/RBAC/domain controls bypassed.

**Generic `retry()`**
No parse/validate/commit/export distinction.

**Generic `DELETE import` rollback**
Canonical data corruption.

**148/009–083 duplicate ingestion pipeline**
Extraction/prospect acquisition semantics fork.

**148/030 duplicate file storage**
Source/output file identities diverge.

**148/033/130–134 duplicate Reporting**
Data export becomes report generation.

**148/138 duplicate Audit/export evidence**
Data-transfer logs become governance source.

**148/145 tenant bypass**
Imports/exports operate by client-submitted Organization IDs.

**148/146 duplicate bulk developer access**
Exports become undocumented API.

**148/147 job failure/Incident conflation**
Individual transfer failures become platform incidents.

No additional screen is required.

These are **typed ImportJob/ExportJob identities, exact file/schema/mapping lineage, staged validation, canonical domain commit, record-level idempotency, frozen export dataset boundaries, protected artifacts, and strict Extraction/Reporting/API/Incident boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL GOVERNED DATA IMPORT, VALIDATION, COMMIT, EXPORT SNAPSHOT & TRANSFER-HISTORY ANCHOR**

**Domain directive:**
**ImportJob ≠ ImportSourceFile ≠ ImportSchemaDefinition ≠ ImportMapping ≠ StagedImportRecord ≠ ImportValidationResult ≠ ImportCommitBatch ≠ CanonicalDomainRecord ≠ ExportJob ≠ ExportSpecification ≠ ExportDatasetSnapshot ≠ ExportArtifact ≠ Asset/FileVersion ≠ ReportVersion ≠ AuditEvent.**

**File-foundation directive:**
Design 030 remains the sole canonical Asset/FileVersion/storage foundation for uploaded import sources and generated export artifacts. Design 148 owns data-transfer interpretation/execution, not file storage.

**Extraction-boundary directive:**
Designs 009/082/083 retain extraction/acquisition/raw-record/candidate-review semantics. Design 148 handles governed administrative structured-data movement and cannot replace Lead/prospect acquisition workflows.

**Import-identity directive:**
every import uses a durable `ImportJob` pinned to one exact source FileVersion, import schema version, mapping revision, Organization and requested operation policy.

**Source-immutability directive:**
normalization, mapping and validation never mutate the original uploaded FileVersion.

**Schema directive:**
one versioned `ImportSchemaRegistry` defines supported administrative import targets and fields independently of ORM/database table structure.

**No-database-schema directive:**
internal table/column names are never exposed as the import contract and admins cannot choose arbitrary database tables.

**Mapping directive:**
ImportMapping is a versioned job configuration that translates allowlisted source columns into canonical import fields; mapping changes invalidate dependent staged/validation evidence.

**Transform directive:**
mapping transforms are typed/allowlisted and never permit arbitrary JavaScript, SQL, Python, eval, or uploaded executable logic.

**File-security directive:**
source files are allowlisted by supported format, scanned/validated where appropriate, and parsed under strict file-size, cell, row, encoding, decompression and memory limits.

**Formula-security directive:**
spreadsheet/CSV ingestion and generation protect against formula injection from untrusted values.

**Staging directive:**
`StagedImportRecord` is temporary import evidence and never appears as a canonical Contact, Lead, Client, Project or other domain record until source-domain commit succeeds.

**Normalization directive:**
shared canonical normalizers should be reused for emails, phones, dates, currency, enums and similar fields so import output follows the same semantics as normal product input.

**Validation directive:**
file/schema/mapping/pre-validation can identify errors early, but final canonical business validation remains with the source-domain command service immediately before commit.

**Dedupe directive:**
deduplication is domain-specific and never uses one universal fuzzy/name-match rule.

**No-auto-merge directive:**
fuzzy matches can produce review/duplicate candidates but cannot silently merge canonical Companies, Contacts, Leads, Clients or other entities.

**Create/update directive:**
create-new and update-existing semantics remain explicit, separately authorized, and domain governed. A generic hidden `upsert=true` behavior is prohibited.

**Commit directive:**
ImportJob commit invokes canonical source-domain services with normal authorization, tenant validation, domain events, concurrency and Audit behavior rather than direct bulk database INSERT/UPDATE.

**Batch directive:**
large imports use bounded durable commit batches with exact per-record result lineage rather than an unsafe giant transaction or untraceable bulk mutation.

**Partial-success directive:**
valid partial imports remain first-class. Job completion never implies every row succeeded.

**Result directive:**
Parsed, staged, valid, warning, invalid, duplicate, skipped, attempted, created, updated, conflict, and failed counts remain separately defined and never collapse into one ambiguous `processed` number.

**Record-idempotency directive:**
each staged record carries stable import execution identity so worker/batch retries cannot create duplicate canonical records.

**Crash-recovery directive:**
durable checkpoints and committed-record evidence allow workers to resume safely after failure without restarting the import from the first row.

**Cancellation directive:**
cancelling Import stops future work but never automatically deletes or rolls back canonical records already committed.

**Historical-intent directive:**
retry/revalidation/reparse/remapping/new ImportJob are distinct actions. Historical ImportJob meaning never changes silently.

**Stale-validation directive:**
canonical source data and authorization are revalidated at commit; a record valid in preview can still become a duplicate/conflict later.

**Staging-retention directive:**
temporary staged/raw normalized data uses explicit minimization/retention cleanup and cannot become a permanent ungoverned copy of sensitive datasets.

**Tenant directive:**
all ImportJobs, staged rows, source references, ExportJobs, snapshots and artifacts remain bound to Design-145 canonical Organization context.

**Cross-tenant directive:**
imported resource references and exported row IDs are server-validated for current tenant ownership; valid foreign IDs from another Organization cannot be used to cross tenant boundaries.

**Authorization directive:**
Import upload/configuration, validation, commit, update-existing, Export request, sensitive-field export, artifact download and cancellation remain independently server-authorized through Design 144.

**Bulk-authorization directive:**
a bulk Job never bypasses normal source-domain permission/scope checks merely because the initial Job request was authorized.

**Execution-authority directive:**
long-running jobs execute under explicit Organization-scoped service authority rather than indefinitely impersonating the creator's stale personal session; current security policy remains enforced at defined checkpoints.

**Export-identity directive:**
`ExportJob` records the governed export operation while `ExportArtifact`/FileVersion records generated bytes. Neither is a ReportVersion.

**Reporting-boundary directive:**
Designs 033/130–134 remain curated/frozen Report authority. Data export is dataset extraction and does not inherit Report approval/release semantics.

**Specification directive:**
every export freezes a validated `ExportSpecification` containing allowed fields, filters, scope, format and temporal semantics rather than arbitrary SQL or raw DB columns.

**Field-authorization directive:**
selected export fields are allowlisted and independently authorization-aware. Visibility of a record does not automatically authorize export of every sensitive field.

**Secret-exclusion directive:**
passwords, API key secrets, OAuth tokens, refresh tokens, encryption material, webhook signing secrets and equivalent credentials are categorically non-exportable rather than merely hidden by UI.

**Snapshot directive:**
each export has an explicit dataset boundary/cutoff so long-running generation cannot silently mix arbitrary current states.

**Snapshot-implementation directive:**
`ExportDatasetSnapshot` may use database snapshot, revision/cutoff or equivalent deterministic strategy; it need not duplicate the entire database physically.

**Determinism directive:**
stable ordering/IDs and source schema versions allow the generated artifact to correspond to its stated snapshot boundary.

**Async-export directive:**
large exports are durable asynchronous jobs with streaming generation and protected object/file storage rather than long-running browser/API responses.

**Artifact directive:**
generated exports reuse Design-030 protected FileVersion storage with encryption, checksum, access control, retention and short-lived authorized download delivery.

**Artifact-access directive:**
Export completion never means universal download access. Download requests reauthorize under current security policy where required.

**Artifact-expiry directive:**
artifact expiry/removal does not erase ExportJob, specification, snapshot provenance or Audit history.

**Regeneration directive:**
an expired export is not silently regenerated from current data under the same historical identity. A new snapshot/job is required unless the original frozen snapshot remains reproducible.

**Data-type directive:**
timestamps, timezones, currencies, decimals, nulls, booleans and identifiers are exported/imported using unambiguous canonical representations to prevent round-trip corruption.

**PII directive:**
exports follow minimization: only explicitly selected and authorized fields are included; hidden convenience columns are prohibited.

**Audit directive:**
Design 138 receives Job-level evidence for material imports/exports and sensitive downloads according to policy without embedding full source rows/files or flooding Audit with routine transfer telemetry.

**Source-Audit directive:**
source-domain commands remain responsible for their own genuinely audit-worthy record mutations; Design 148 does not create a redundant per-row global Audit stream solely because changes came from an import.

**API boundary directive:**
Design 146 remains developer/machine-access authority. Design 148 bulk export cannot become an undocumented high-volume API bypass.

**Health directive:**
Design 147 may consume shared parser/queue/storage/service failures as reliability evidence, while malformed files or individual Import/Export job failures remain Design-148 job state rather than Incidents.

**State directive:**
file safety, mapping, validation, staging, commit, export snapshot, artifact generation and download availability remain independent lifecycle dimensions and cannot collapse into a generic `status=processing`.

**Progress directive:**
progress counters derive from real parsed/staged/validated/committed/generated evidence and never use misleading percentages when the denominator is unknown.

**Concurrency directive:**
mapping changes, validation, parallel imports, source edits, permission revocation, Export generation, artifact expiry and downloads use revision/current-state checks and canonical source concurrency rules.

**Idempotency directive:**
ImportJob creation, staging, commit, Export request, snapshot creation, artifact generation, cancellation and retry operations use stable idempotency identities.

**Caching directive:**
Data-transfer views are authorization/Organization/job/mapping/validation/snapshot/artifact revision scoped; raw staged sensitive rows are never placed in broad shared caches.

**Performance directive:**
use streaming parsers, bounded staging/commit batches, durable queues/leases/checkpoints, resumable workers, snapshot/cursor exports, streaming artifact generation, paginated error previews and object storage.

**Partial-failure directive:**
file storage, parsing, mapping, validation, commit, source domains, snapshot generation and artifact storage may fail independently. `Unavailable` can never become `Invalid row`, `No data`, `Import succeeded`, `Export completed`, or `No authorization` without evidence.

**Future-reuse directive:**
Design **149 — Global Settings / Platform Configuration** must remain the authority for platform-wide operational/security defaults. Design 148 can consume configured limits such as allowed formats, file-size ceilings, retention defaults, or export policies but must not become the global settings source.

**Overlap directive:**
Designs **009, 030, 033, 079, 082–083, 138, 144–149** must preserve one continuous import chain **FileVersion → ImportJob → pinned Schema/Mapping → Staging → Validation/Dedupe → canonical source commands → committed domain records**, and one export chain **authorized ExportSpecification → frozen dataset boundary → ExportJob → immutable ExportArtifact/FileVersion**, while Extraction, Reporting, Files, Audit, Developer Access, Health and Settings remain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE GOVERNED DATA-TRANSFER FOUNDATION — DESIGN-030 FILEVERSION STORAGE + VERSIONED IMPORT-SCHEMA REGISTRY + PINNED MAPPING/TRANSFORMS + TEMPORARY TENANT-SCOPED STAGING + DOMAIN-SPECIFIC VALIDATION/DEDUPE + CANONICAL SOURCE-SERVICE COMMIT + PER-RECORD IDEMPOTENCY/PARTIAL RESULTS + AUTHORIZED EXPORTSPECIFICATION + FROZEN DATASET CUTOFF/SNAPSHOT + PROTECTED IMMUTABLE EXPORT ARTIFACT + RETENTION/AUDIT — AND NEVER ALLOW RAW DATABASE IMPORTS, GENERIC UPSERTS, FUZZY AUTO-MERGE, ARBITRARY SQL/JS TRANSFORMS, DB COLUMN EXPORTS, SECRET FIELDS, CLIENT-SUPPLIED TENANT IDS, PUBLIC ARTIFACT LINKS, CURRENT-DATA REGENERATION OR GENERIC `TRANSFER.STATUS` / `RETRY()` ACTIONS TO SUBSTITUTE FOR OR REWRITE CANONICAL DATA, JOB, SNAPSHOT OR FILE TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **148 / 153** |
| **PASS**                                   |                        **148** |
| **STANDARDIZE decisions**                  |                        **146** |
| **Potential implementation-overlap flags** |                        **139** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**148 / 153 = 96.7% audited.**

Only **5 frozen designs remain** in Phase 3A.1.

### Canonical import architecture after Design 148

```text
FILE
 │
 ↓
FileVersion FV-20
 │
 ↓
ImportJob IJ-50
 │
 ↓
Schema v3
 │
 ↓
Mapping revision 2
 │
 ↓
Staged Records
 │
 ├── Valid
 ├── Warning
 ├── Duplicate
 └── Invalid
       │
       ↓
 Approved records
       │
       ↓
Canonical Domain Services
       │
       ↓
Actual CRM / Project /
other domain records
```

The strongest import rule is now explicit:

```text
BAD

Upload contacts.csv
      ↓
INSERT rows directly
into Contact table


CORRECT

Upload
  ↓
FileVersion
  ↓
ImportJob
  ↓
Mapping
  ↓
Normalization
  ↓
Validation
  ↓
Dedupe
  ↓
Canonical ContactService
  ↓
Contact
```

Validation and commit also remain different:

```text
10:00

Row 184 validates:

email = unique


10:04

Another user creates
the same Contact.


10:05

Import commits Row 184.


Correct:

Canonical ContactService
detects the new duplicate/conflict.

Import preview
does NOT override
current domain truth.
```

Exports now preserve exact dataset meaning:

```text
Export requested:
10:00

Snapshot cutoff:
10:00:15

Generation completes:
10:07


The artifact represents:

the authorized dataset
at the frozen cutoff

NOT:

a random mixture of values
between 10:00 and 10:07.
```

And export files remain artifacts rather than source truth:

```text
ExportJob EJ-20
     ↓
Dataset Snapshot DS-20
     ↓
ExportArtifact EA-20
     ↓
FileVersion FV-90


If FV-90 later expires:

EJ-20 still exists.
DS-20 provenance still exists.

Artifact expiry
      ≠
Export history deletion.
```

## Next Sequential Audit Target

### **Design 149 — Global Settings / Platform Configuration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
