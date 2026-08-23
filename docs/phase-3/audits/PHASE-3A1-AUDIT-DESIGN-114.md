# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 114 — Project Files / Deliverables Detail

Design 114 should become the **canonical Team Workspace Project file-association, working-asset, deliverable-definition, exact-version artifact, and delivery-readiness surface** for one Project.

It must build directly on the platform Asset/File foundation established by Design 030, the canonical Project from Design 023, the Client-safe file model from Design 051, version-specific review models from Designs 049–050/068–069, and the Project workflow already standardized through Designs 108–113.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ Asset ≠ FileVersion ≠ StorageObject ≠ Folder ≠ ProjectFileAssociation/UsageReference ≠ Deliverable ≠ DeliverableArtifactReference ≠ SourceDomainVersion ≠ Review ≠ Approval ≠ ClientRelease/Handover ≠ Publication.**

The central implementation rule is:

> **A Project may use many Assets and FileVersions, but merely attaching a file to a Project does not make it a Deliverable. A Deliverable is a business/output obligation or intentional Project output. The Deliverable must point to the exact artifact/version that currently satisfies it, while working files remain ordinary Assets. Review, Approval, client release, final handover, and publication remain separate governed processes. No file replacement, folder move, catalog change, or “latest version” lookup may silently change what was approved, delivered, released, or handed over.**

---

# 1. Classification

| Audit field                           | Classification                                                                                                                                                                    |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                         | **114**                                                                                                                                                                           |
| **Canonical name**                    | **Project Files / Deliverables Detail**                                                                                                                                           |
| **Product area**                      | Team Workspace / Projects / Files / Delivery Outputs                                                                                                                              |
| **User surface**                      | **Authenticated Team Workspace**                                                                                                                                                  |
| **Screen class**                      | Project Detail Variant / File & Deliverable Operations Workspace                                                                                                                  |
| **Classification**                    | **Canonical Project File Association, Deliverable Identity & Exact-Artifact Delivery Anchor**                                                                                     |
| **Primary purpose**                   | Manage Project-associated Assets/FileVersions and Project Deliverables while preserving exact artifact/version lineage, review/approval separation, and client-release boundaries |
| **Primary parent**                    | **Project** — Design 023                                                                                                                                                          |
| **Canonical file entity**             | **Asset** — Design 030                                                                                                                                                            |
| **Canonical binary/version entity**   | **FileVersion**                                                                                                                                                                   |
| **Physical storage entity**           | **StorageObject**                                                                                                                                                                 |
| **Project association**               | **ProjectFileAssociation / AssetUsageReference**                                                                                                                                  |
| **Deliverable entity**                | **ProjectDeliverable / Deliverable**                                                                                                                                              |
| **Deliverable artifact relation**     | **DeliverableArtifactReference**                                                                                                                                                  |
| **Source-domain artifact dependency** | DraftVersion / ProofVersion / ReportVersion / PublicationArtifact / media version, depending on deliverable type                                                                  |
| **Review dependency**                 | Designs 049–050 and specialized production domains                                                                                                                                |
| **Approval dependency**               | Designs 029 / upcoming 115                                                                                                                                                        |
| **Client file dependency**            | Design 051                                                                                                                                                                        |
| **Client proofs dependency**          | Designs 068–069                                                                                                                                                                   |
| **Final handover dependency**         | Design 121                                                                                                                                                                        |
| **Project completion dependency**     | Design 120                                                                                                                                                                        |
| **Publishing dependency**             | Designs 031 / 124–126                                                                                                                                                             |
| **Risk/blocker dependency**           | Design 113                                                                                                                                                                        |
| **Primary query service**             | `ProjectFilesDeliverablesQueryService`                                                                                                                                            |
| **Asset service**                     | canonical `AssetService`                                                                                                                                                          |
| **File-version service**              | canonical `FileVersionService`                                                                                                                                                    |
| **Deliverable service**               | `ProjectDeliverableService`                                                                                                                                                       |
| **Artifact-resolution service**       | `DeliverableArtifactResolver`                                                                                                                                                     |
| **Readiness resolver**                | `ProjectDeliverableReadinessResolver`                                                                                                                                             |
| **Parent shell**                      | `InternalAppShell` — Design 001                                                                                                                                                   |
| **Auth**                              | Required                                                                                                                                                                          |
| **Authorization**                     | Active OrganizationMembership + Project/Asset/Deliverable permissions                                                                                                             |
| **Implementation priority**           | **Critical Content Integrity / Version Lineage / Client-Delivery Safety**                                                                                                         |
| **Reuse level**                       | **Extremely High across Review, Approval, Handover, Publishing, Reporting and Portal delivery**                                                                                   |

Design 114 should answer:

> **“Which files belong to or are being used by this Project, which of them are working files versus intended Deliverables, what exact artifact/version currently satisfies each Deliverable, what still requires review or approval, what is safe for client release, and what can be handed over without relying on a mutable ‘latest file’ reference?”**

Canonical structure:

```text
Project PR-100
      │
      ├── Project File Associations
      │       │
      │       └── Asset
      │             │
      │             ├── FileVersion v1
      │             ├── FileVersion v2
      │             └── FileVersion v3
      │
      └── Deliverable[]
              │
              ├── expected output / business purpose
              │
              ├── exact artifact reference
              │      ↓
              │   FileVersion / ProofVersion /
              │   DraftVersion / ReportVersion /
              │   PublicationArtifact / etc.
              │
              ├── review / approval context
              │
              └── delivery readiness
                      │
                      ↓
                Final Handover
                Design 121
```

---

# 2. Reuse

## Design 030 remains the canonical Asset/File foundation

Design 114 must use the same:

```text
Asset
FileVersion
StorageObject
```

identities already established by Design 030.

Do not create:

```text
ProjectFile
ProjectStorageFile
DeliverableFileObject
UploadedProjectFile
```

as parallel binary/file identities.

---

## Project association ≠ duplicate Asset

Correct:

```text
Asset A-100
     │
     ├── used by Project PR-100
     └── used by Project PR-200
```

through controlled usage/association relationships where legitimate.

Not:

```text
A-100 copied into PR-100 file table
A-100 copied again into PR-200 file table
```

unless a deliberate new derivative/version is actually created.

---

## Asset ≠ FileVersion

Design 030 invariant remains permanent.

`Asset` answers:

> What logical file/media asset is this?

`FileVersion` answers:

> Which exact binary/revision is this?

Example:

```text
Asset: Executive portrait
├── FileVersion v1
├── FileVersion v2
└── FileVersion v3
```

---

## FileVersion ≠ StorageObject

Permanent.

StorageObject is implementation/storage evidence.

It is not the business-facing file/version identity.

Changing storage provider or object key must not create a new business FileVersion unless the binary/content itself changes.

---

## Folder ≠ security boundary

Design 030 rule remains.

Moving a file:

```text
/Working
→
/Final
```

must not automatically make it:

* client-visible,
* approved,
* deliverable,
* public.

---

## File ≠ Deliverable

This is Design 114's strongest distinction.

### Project file

A working/reference/source Asset associated with the Project.

### Deliverable

An intentional output/obligation the Project is expected to produce.

Example:

```text
working-files/
├── interview-notes.docx
├── reference-logo.png
├── cover-experiment-1.psd
└── cover-experiment-2.psd
```

None becomes a Deliverable merely because it is inside the Project.

The deliverable may be:

```text
Deliverable D-10
“Approved Magazine Cover”
        ↓
exact artifact:
ProofVersion PV-7
or FileVersion FV-12
```

---

## Design 051 remains client-safe file projection

Design 114 is internal Project operations.

Design 051 shows only Assets/FileVersions the Client is authorized to access.

Therefore:

```text
Internal Project File
≠
Client-visible File
```

Permanent.

---

## Client visibility ≠ folder location

Absolute.

Client release/access must use explicit access/release semantics.

---

## Design 049 Draft Review remains canonical DraftVersion review

If a Project deliverable is an editorial Draft:

```text
Deliverable
    ↓ exact source
DraftVersion DV-5
```

Review comments belong to the DraftReview domain.

Design 114 does not duplicate:

```text
deliverable.reviewComments[]
```

as a second review backend.

---

## Design 050 Proof Review remains canonical visual review

Likewise:

```text
Deliverable
    ↓
ProofVersion PV-8
```

Annotations/comments remain Design 050's version-specific review records.

---

## Design 029 remains Approval authority

A Deliverable may require:

```text
ApprovalRequest
subject = exact artifact/version
```

before release/handover.

Design 114 can display that status.

It must not own a second:

```text
deliverable.approved = true
```

truth.

---

## Review ≠ Approval

Permanent.

A reviewed file can still be unapproved.

An approved artifact must identify the exact approved version.

---

## Design 121 will own final handover

Design 114 prepares and identifies Deliverables.

Design 121 later governs the **final handover package/process**.

Therefore:

```text
Deliverable ready
≠
Final handover completed
```

---

## Design 120 remains Project completion authority

All Deliverables being ready does not automatically complete the Project.

Closeout may include:

* approvals,
* client acceptance,
* publishing,
* handover,
* unresolved blockers,
* administrative steps.

---

## Publishing remains separate

A Deliverable may later become a Publication artifact.

But:

```text
Deliverable
≠
Publication
```

and:

```text
Ready for delivery
≠
Published
```

Designs 031/124–126 remain publication authority.

---

# 3. Entities

## Asset

Canonical platform Asset remains:

```text
Asset
├── id
├── organizationId
├── logical identity
├── asset type/category
├── lifecycle
├── currentFileVersionId? for convenience
├── metadata
├── createdAt
└── revision
```

Exact schema remains Design 030 / Phase 3D territory.

---

## Asset current version ≠ approved version

Critical.

Valid:

```text
Asset A-10

latest FileVersion = v5
approved FileVersion = v4
```

A newly uploaded v5 must not silently replace v4 as the approved/deliverable artifact.

---

## Latest version ≠ released version

Permanent.

---

## Latest version ≠ client-visible version

Permanent.

---

## FileVersion

`FileVersion` remains immutable binary/content evidence.

Conceptually:

```text
FileVersion
├── id
├── assetId
├── revision/version
├── storageObjectId
├── file name
├── mime/type
├── byte size
├── checksum/hash
├── createdBy
├── createdAt
└── processing/security state
```

---

## FileVersion should be immutable

Once created:

* binary bytes,
* checksum,
* version identity

do not change in place.

New binary:

```text
→ new FileVersion
```

---

## Replace file ≠ overwrite version

Critical.

Correct:

```text
Asset A-10
v1
v2
v3
```

Incorrect:

```text
UPDATE v2 storageObject = new file
```

if v2 was already referenced by review/approval/delivery history.

---

## StorageObject

Storage backend object identity remains separate.

It may contain:

* provider,
* bucket/container,
* object key,
* encryption metadata,
* checksum.

Do not expose internal storage paths as authorization.

---

## ProjectFileAssociation / AssetUsageReference

This should represent why/how an Asset is associated with the Project.

Conceptually:

```text
ProjectFileAssociation
├── id
├── projectId
├── assetId
├── usage/context
├── category
├── addedBy
├── addedAt
└── lifecycle
```

Exact physical model may reuse Design 030's general `UsageReference`.

---

## Project association ≠ ownership

An Asset can be associated with a Project without the Project being its only owner/context.

---

## Removing association ≠ deleting Asset

Absolute.

If:

```text
Project PR-100
no longer uses Asset A-10
```

remove/end the association.

Do not delete A-10 if it is referenced elsewhere.

---

## Deliverable

`Deliverable` should be a first-class Project output/obligation identity.

Conceptually:

```text
Deliverable
├── id
├── organizationId
├── projectId
├── stable key/reference
├── title
├── description/purpose
├── lifecycle
├── owner/context
├── target date?
├── source commercial/template lineage?
├── currentArtifactReference?
├── createdAt
└── revision
```

Exact schema Phase 3D.

---

## Deliverable ≠ Asset

Critical.

One Deliverable may:

* be satisfied by one Asset/FileVersion,
* be represented by a domain-specific artifact,
* have supporting Assets.

Likewise one Asset may be used in several contexts.

---

## Deliverable ≠ Deliverable Artifact

Permanent.

The Deliverable is the business/output identity.

The artifact is the exact content fulfilling it.

---

## DeliverableArtifactReference

Strongly recommended conceptual relation:

```text
DeliverableArtifactReference
├── deliverableId
├── artifactType
├── artifactId
├── exactVersionId
├── relationship/purpose
├── assignedAt
├── assignedBy
└── revision/history
```

This allows a Deliverable to refer to exact:

* FileVersion,
* DraftVersion,
* ProofVersion,
* ReportVersion,
* PublicationArtifact,
* media version,

without forcing everything into generic files.

---

## Artifact reference must be typed

Avoid:

```text
deliverable.fileId
```

for every deliverable type.

A podcast deliverable, report, proof, publication build, or editorial Draft may have stronger domain-specific version identities.

---

## SourceDomainVersion ≠ FileVersion

Critical.

Example:

```text
ProofVersion PV-7
        │
        └── rendered Asset/FileVersion FV-30
```

The business review version is `PV-7`.

The rendered binary is `FV-30`.

Do not collapse them.

---

## Render derivative ≠ business artifact version

Design 050/069 rule remains.

---

## Deliverable current artifact ≠ “latest Asset version”

Absolute.

The Deliverable should explicitly pin the version that currently satisfies it.

Example:

```text
Asset A-20
latest = FV-9

Deliverable D-10
current approved artifact = FV-8
```

FV-9 must not become D-10 automatically.

---

## Deliverable lifecycle

Conceptually:

```text
Planned
In Progress
Ready for Review
Approved / Ready
Delivered / Released
Superseded / Cancelled
```

Exact enums belong to Phase 3D and must reflect frozen design.

The important rule:

> Deliverable lifecycle is separate from artifact version, Approval state, Client release state, and Project stage.

---

## Deliverable versioning

Do not automatically invent a second generic `DeliverableVersion` if exact source-domain/FileVersion references already preserve content history.

Only introduce a separate DeliverableVersion if the business definition of the Deliverable itself has independently versioned:

* scope,
* acceptance criteria,
* metadata,

that must be historically tracked.

This decision belongs to Phase 3D.

---

## Deliverable requirement / acceptance criteria

If the Project Template or commercial snapshot establishes expected outputs:

preserve provenance such as:

```text
sourceCommercialSnapshot
sourceProjectTemplateVersion
sourceDeliverableDefinition
```

without making the current catalog/template a live dependency.

---

## Deliverable definition ≠ current Package item

Permanent.

A commercial Package may originally promise:

> 1 magazine cover.

Later Package edits cannot change this Project's Deliverable expectation.

---

## Supporting Asset

A Deliverable may have:

```text
primary artifact
supporting assets
source files
reference files
```

These roles should be explicit if needed.

Do not infer from folder name.

---

## ClientRelease / ClientAssetAccess

Client visibility/release should remain first-class or explicit relation.

Conceptually:

```text
ClientAssetAccess
or
DeliverableRelease
```

can identify:

* exact released version,
* audience,
* release time,
* actor,
* revocation/supersession policy.

---

## Client release ≠ file existence

Permanent.

---

## Client release ≠ Approval

Permanent.

Approval may be required before release.

They remain different facts.

---

## Client release ≠ final handover

Permanent.

A client may preview/review files throughout the Project before formal final handover.

---

## Final handover

Design 121 later owns the formal final handover event/package.

It should consume exact ready Deliverables/artifacts from Design 114.

---

## Final handover ≠ Deliverable lifecycle shortcut

Do not merely set:

```text
all deliverables.status = DELIVERED
```

without exact handover/artifact evidence.

---

## Processing/security state

Uploaded file can have:

```text
Upload complete
Virus scan pending
Processing pending
Ready
Rejected
Quarantined
```

These technical states remain distinct from Deliverable readiness.

---

## Uploaded ≠ safe to use

Critical.

---

## Scan passed ≠ approved

Permanent.

---

## Processing complete ≠ review complete

Permanent.

---

## Folder

Folder can remain organization/navigation metadata.

It must not own:

* approval,
* access control,
* release,
* deliverable identity.

---

# 4. Permissions

Design 114 should conceptually distinguish:

```text
projectFiles.read
projectFiles.attach
projectFiles.removeAssociation

asset.read
asset.upload
asset.download
asset.createVersion

deliverable.read
deliverable.create
deliverable.edit
deliverable.assignArtifact
deliverable.markReady

clientRelease.read
clientRelease.manage

sourceFile.read
sensitiveAsset.read
```

Exact permission keys belong to Phase 3D.

---

## Project read ≠ Asset download

Permanent.

A user may see:

> Final cover exists

without permission to download restricted source files.

---

## Asset read ≠ source-file read

Critical.

Rendered PDF/JPG may be accessible while:

* PSD,
* InDesign,
* production source,

remains restricted.

---

## File download ≠ file edit/upload

Permanent.

---

## Upload new version ≠ replace approved artifact automatically

Absolute.

---

## Deliverable edit ≠ Asset edit

Permanent.

---

## Deliverable artifact assignment ≠ Approval authority

Critical.

Selecting FV-10 as a candidate Deliverable artifact cannot mark it approved.

---

## Deliverable readiness ≠ release permission

Permanent.

---

## Client release permission ≠ source-file permission

Permanent.

---

## Approval permission remains Design 029

Design 114 cannot grant itself:

```text
approveDeliverable
```

if that action is actually a formal ApprovalRequest decision.

---

## Project owner ≠ unrestricted file access

Permanent.

Restricted legal/finance/internal Assets may still require separate permissions.

---

## Folder access cannot bypass Asset permission

Absolute.

---

## Direct Asset ID reauthorizes

Permanent.

---

## Direct FileVersion ID reauthorizes

Permanent.

---

## Direct Deliverable ID reauthorizes

Permanent.

---

## Cross-tenant artifact links prohibited

Absolute.

A Deliverable in Organization A cannot point to:

* Asset,
* FileVersion,
* DraftVersion,
* ProofVersion,
* ReportVersion

from Organization B.

---

## Project-context validation required

An Asset may be same-tenant but not authorized/relevant for a Project.

Assigning it as a Deliverable artifact must validate context and permission.

---

## Client-facing access reauthorizes independently

Portal download links cannot rely on internal Team permission.

They must resolve:

* client organization,
* portal membership,
* project access,
* exact released version.

---

# 5. States

Design 114 must keep **Asset lifecycle, FileVersion processing/security state, Deliverable lifecycle, review state, Approval state, client release/access state, and handover state** independent.

### Asset lifecycle

Canonical Design 030 lifecycle.

### FileVersion technical state

Conceptually:

```text
Uploading
Processing
Scanning
Ready
Quarantined
Rejected
Unavailable
```

### Deliverable lifecycle

Conceptually:

```text
Planned
In Progress
Ready for Review
Ready / Approved
Delivered / Released
Superseded
Cancelled
```

Exact enums Phase 3D.

### Review

Owned by Draft/Proof/source review domain.

### Approval

Owned by Approval engine.

### Client release/access

Conceptually:

```text
Not Released
Released
Superseded
Withdrawn / Revoked
```

if supported.

### Final handover

Owned by Design 121.

These must never collapse into one generic `file.status`.

---

## File Ready ≠ Deliverable Ready

Permanent.

---

## Deliverable Ready ≠ Approved

Depends on exact frozen semantics, but architecture must support them separately.

If formal Approval is required:

```text
Deliverable artifact prepared
≠
ApprovalRequest approved
```

---

## Approved ≠ Released

Critical.

---

## Released ≠ Handed Over

Permanent.

---

## Handed Over ≠ Published

Permanent.

---

## Latest version ≠ Approved version

Absolute.

---

## Latest version ≠ Released version

Absolute.

---

## New version uploaded ≠ old Approval invalidated silently

Critical.

Approval v4 remains evidence for v4.

New v5 requires its own review/approval if policy requires.

---

## New version ≠ existing client release replaced automatically

Permanent.

---

## File removed from folder ≠ file unavailable

Permanent.

---

## Project association removed ≠ Asset deleted

Permanent.

---

## Asset archived ≠ historical Deliverable broken

Critical.

Exact historical FileVersion/artifact references must remain reconstructable.

---

## Scan pending ≠ file missing

Permanent.

---

## Quarantined ≠ deleted

Permanent.

---

## Storage temporarily unavailable ≠ Asset deleted

Absolute.

---

## Client access service unavailable ≠ not released

Critical.

---

## Approval service unavailable ≠ not approved

Critical.

Use:

> Approval state unavailable.

---

## Handover service unavailable ≠ not handed over

Permanent.

---

## State Coverage

Design 114 inherits Design 150 plus:

```text
Project Files Loading
Project Files Available
Project Files Empty
Project Files Restricted
Project Files Partial

Asset Available
Asset Archived
Asset Restricted
Asset Unavailable

File Uploading
File Processing
File Scan Pending
File Ready
File Quarantined
File Rejected
File Storage Unavailable

File Version Current
File Version Historical
Newer File Version Available

Deliverable Planned
Deliverable In Progress
Deliverable Ready for Review
Deliverable Ready
Deliverable Superseded
Deliverable Cancelled

Deliverable Artifact Assigned
Deliverable Artifact Missing
Deliverable Artifact Restricted
Deliverable Artifact Unavailable
Newer Artifact Version Available

Review Not Started
Review In Progress
Review Completed
Review State Unavailable

Approval Not Requested
Approval Pending
Approval Approved
Approval Rejected
Approval State Unavailable

Client Not Released
Client Released
Client Release Superseded
Client Access Restricted
Client Release State Unavailable

Final Handover Pending
Final Handover Complete
Handover State Unavailable

Project File Updated Elsewhere
Deliverable Updated Elsewhere
Artifact Version Updated Elsewhere
Approval Updated Elsewhere
Partial Deliverable Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **file identity vs deliverable identity vs exact version state**.

Conceptually:

```text
Project Files / Deliverables
↓
Working Files
   ├── Asset
   ├── current FileVersion
   ├── file type
   ├── processing state
   └── Project usage

Deliverables
   ├── Deliverable
   ├── exact assigned artifact/version
   ├── review
   ├── approval
   ├── client release readiness
   └── frozen-design action
```

Only frozen Design 114 elements should render.

---

## Working Files and Deliverables should be distinguishable

Do not display all Project Assets as though they are client outputs.

A user should be able to understand:

> Working/source/reference file

versus:

> Deliverable.

---

## Version numbers must remain explicit

Correct:

> Cover.pdf — File v8
> Deliverable uses v7 — Approved

rather than silently displaying only the latest file.

---

## Newer version warning

Where relevant:

> Newer v8 exists; approved Deliverable remains v7.

This is safer than auto-swapping the Deliverable.

---

## Approval and release require separate indicators

Correct:

> Approved
> Not yet released

or:

> Client released
> New internal draft exists

rather than one generic “Complete”.

---

## Source files require distinct treatment

If the deliverable has:

* final PDF,
* editable source file,

do not imply both have identical client access.

---

## Tablet

Following Design 152:

* file/deliverable sections stack,
* version and status remain visible,
* metadata compresses,
* review/approval/release indicators stack,
* download/version actions remain touch-safe.

---

## Mobile

Priority for a Deliverable:

```text
Deliverable name
↓
Exact artifact/version
↓
Review state
↓
Approval state
↓
Client release state
↓
Primary allowed action
```

Priority for Project files:

```text
File name
↓
Asset/File version
↓
processing state
↓
Project usage
↓
allowed actions
```

Avoid a wide file-manager table squeezed horizontally.

---

## Mobile version safety

Never hide the exact active deliverable version behind an ambiguous filename.

Example:

> Final Cover — approved artifact v7
> v8 exists but is not approved

is far safer than:

> Final Cover.pdf

alone.

---

## Accessibility

A Deliverable could communicate:

> Final Magazine Cover. Deliverable D-10. Approved artifact is Proof Version 7. A newer Proof Version 8 exists but is not approved. Version 7 has not yet been released to the client.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical Project Files / Deliverables architecture

```text
Design 114
    ↓
Authenticated Workspace Context
    ↓
ProjectFilesDeliverablesQueryService
    │
    ├── ProjectAdapter
    ├── AssetAdapter
    ├── FileVersionAdapter
    ├── ProjectFileAssociationAdapter
    ├── DeliverableAdapter
    ├── ArtifactReferenceAdapter
    ├── ReviewAdapter
    ├── ApprovalAdapter
    ├── ClientReleaseAdapter
    └── DeliverableReadinessResolver
    ↓
ProjectFilesDeliverablesView
```

Mutations go through the canonical source services.

---

## Upload architecture

Conceptually:

```text
create Asset
   ↓
obtain secure upload target
   ↓
upload StorageObject
   ↓
verify upload/checksum
   ↓
create FileVersion
   ↓
scan/process
   ↓
READY
```

Do not trust client-reported:

* file type,
* size,
* hash,
* completion.

Verify server/provider-side.

---

## Secure upload flow

Use:

* time-limited signed URLs or controlled upload endpoints,
* content-length limits,
* MIME/extension validation,
* malware scanning,
* tenant-scoped object paths,
* checksum verification.

---

## Storage keys must not be public authorization

Knowing:

```text
bucket/key
```

must never grant download access.

---

## Download architecture

Use:

```text
authorize user
↓
authorize Asset/FileVersion
↓
generate short-lived download access
```

rather than static public object URLs for restricted files.

---

## FileVersion creation

Conceptually:

```text
createFileVersion(
    assetId,
    verifiedStorageObject,
    expectedAssetRevision,
    idempotencyKey
)
```

must:

1. authorize;
2. validate Asset/tenant;
3. verify uploaded object;
4. compute/verify checksum;
5. create immutable FileVersion;
6. begin scan/processing;
7. update convenient current pointer only under policy;
8. emit events.

---

## Current version pointer ≠ delivery pointer

Critical.

Asset may have:

```text
currentFileVersionId = FV-8
```

while:

```text
Deliverable.currentArtifact = FV-7
```

This is valid.

---

## Version upload cannot mutate Deliverable artifact automatically

Absolute.

Any change of Deliverable artifact uses an explicit command.

---

## Attach Project file

Conceptually:

```text
attachAssetToProject(
    projectId,
    assetId,
    usage,
    expectedProjectRevision,
    idempotencyKey
)
```

must validate:

* same tenant,
* Project access,
* Asset access,
* allowed usage.

---

## Attach idempotency

Repeated request must not create duplicate identical Project associations.

---

## Detach Project file

Should remove/end only the association.

Do not delete:

* Asset,
* FileVersions,
* Deliverable references,
* other usage references.

---

## Deliverable creation

Conceptually:

```text
createProjectDeliverable(
    projectId,
    deliverableInput,
    sourceDefinition/commercial lineage?,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate Project;
3. preserve expected output/source lineage;
4. create stable Deliverable;
5. emit Audit/outbox.

---

## Template-generated Deliverables

If ProjectTemplate creates expected Deliverables:

instantiation must be idempotent.

Use stable source lineage such as:

```text
projectId
+
sourceDeliverableDefinitionId
```

or equivalent.

Do not recreate expected Deliverables every time Design 114 loads.

---

## Deliverable artifact assignment

Conceptually:

```text
assignDeliverableArtifact(
    deliverableId,
    artifactType,
    exactArtifactVersionId,
    expectedDeliverableRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. validate Deliverable/Project;
3. resolve exact artifact;
4. validate tenant/context;
5. verify artifact is usable/safe;
6. preserve previous artifact assignment history;
7. assign exact version;
8. invalidate readiness/review/approval projections as required;
9. emit Audit/outbox.

---

## Artifact assignment ≠ Approval

Permanent.

---

## New artifact version may supersede readiness

Policy-dependent but must be explicit.

Example:

```text
D-10 currently approved on PV-7

assign new PV-8
```

System must not transfer PV-7 Approval to PV-8.

---

## Approval subject must remain exact-version bound

Design 029 rule:

```text
ApprovalRequest
subject = PV-7
```

Approval never means:

> whatever version Deliverable D-10 currently points to.

---

## Approval v7 ≠ Approval v8

Absolute.

---

## Review subject must remain exact-version bound

Same for:

* DraftVersion,
* ProofVersion,
* ReportVersion.

---

## Deliverable Readiness Resolver

Use centralized:

```text
ProjectDeliverableReadinessResolver.resolve(deliverableId)
```

Potentially evaluates:

* exact artifact assigned,
* FileVersion safe/ready,
* required review finished,
* required Approval passed,
* required metadata/evidence,
* unresolved blocking condition.

Exact policy Phase 3D.

---

## Readiness ≠ release

Critical.

A ready Deliverable still requires an explicit release/handover action where applicable.

---

## Readiness result needs reasons

Prefer typed blockers such as:

```text
ARTIFACT_MISSING
FILE_PROCESSING
MALWARE_SCAN_PENDING
REVIEW_REQUIRED
APPROVAL_PENDING
ARTIFACT_VERSION_SUPERSEDED
ACCESS_RESTRICTED
```

rather than only:

> Not Ready.

---

## Client release

If Project files are released before Design 121 final handover:

use an explicit service such as:

```text
releaseDeliverableToClient(
    deliverableId,
    exactArtifactVersionId,
    expectedRevision,
    idempotencyKey
)
```

which validates:

* current authorized client access,
* exact version,
* readiness,
* release permission.

---

## Release exact version

Never:

```text
release Asset A-10
```

meaning:

> always expose latest version.

Release:

```text
FileVersion FV-7
```

or exact source-domain version/artifact.

---

## New version upload does not update client release

Absolute.

---

## Release revocation/supersession

If allowed:

preserve history.

Do not erase the fact that v7 was previously released.

---

## Client Portal access

Design 051 should query safe `ClientAssetAccess` / release projection.

Portal must never simply ask:

```text
asset.projectId = client's project
```

and expose it.

---

## Final handover integration

Design 121 should consume:

```text
Deliverable
+
exact final artifact reference
+
approval/readiness/release evidence
```

and create a canonical handover package/event.

---

## Handover must pin exact versions

Critical.

If final handover included:

```text
D-10 → FV-7
```

later FV-8 upload does not alter historical handover.

---

## Project closeout integration

Design 120 may evaluate:

```text
required Deliverables ready/handed over
```

through canonical Deliverable/Handover state.

It must not merely count files in a `Final` folder.

---

## Publishing integration

Where Deliverable becomes Publication input:

```text
Publication
→ exact approved artifact/version
```

Design 031/124 owns publication scheduling/attempts.

Do not publish “latest Asset”.

---

## File processing events

Useful events:

```text
FileVersionCreated
FileScanPassed
FileScanFailed
FileProcessingCompleted
FileProcessingFailed
```

These invalidate Deliverable readiness where relevant.

---

## Asset security

Quarantined/unsafe FileVersion must not be:

* downloadable,
* deliverable-ready,
* released,
* published.

---

## MIME validation

Never trust filename extension alone.

---

## Checksum

FileVersion should preserve cryptographic checksum/hash where appropriate for:

* dedupe,
* integrity,
* handover evidence,
* executed artifact verification.

---

## Duplicate upload ≠ same business version automatically

Two identical binaries may still represent different intended revisions/contexts.

Checksum can assist dedupe but cannot alone decide business identity.

---

## File replacement concurrency

Two users uploading v8 and v9 concurrently require controlled version numbering/current-pointer updates.

No last-write-wins ambiguity.

---

## Deliverable artifact concurrency

Two users cannot assign different artifacts to the same Deliverable without revision conflict.

---

## Bulk release/download

If frozen Design 114 includes bulk operations:

each Asset/Deliverable must still be:

* individually authorized,
* exact-version resolved,
* individually validated.

Return partial outcomes.

---

## Risk/blocker integration

Design 113 may link:

```text
Deliverable missing
Artifact processing failed
Required file unavailable
```

as Risk/Blocker evidence.

Design 114 remains source truth.

Resolving ProjectBlocker cannot fabricate file readiness.

---

## Task integration

Design 111 may create Tasks such as:

> Upload final cover source.

Task completion does not prove that the correct Asset/FileVersion now exists.

Deliverable readiness resolver checks actual file/artifact state.

---

## Timeline integration

Design 118 may visualize:

* Deliverable target dates,
* review deadlines,
* handover dates.

Timeline remains a projection.

---

## Activity

Design 119 can project:

```text
AssetAttached
FileVersionUploaded
DeliverableCreated
DeliverableArtifactAssigned
DeliverableReleased
```

Activity remains observational.

---

## Audit

Material actions should include:

* sensitive file upload/delete/archive,
* Project attachment changes,
* Deliverable creation/change,
* artifact-version assignment,
* client release/revocation,
* source-file download where policy requires,
* exceptional readiness override if supported.

---

## Search

Design 079 may index safe:

* Asset filename/title,
* Deliverable title,
* Project context.

It should not broadly index:

* restricted source files,
* confidential file contents,
* storage keys.

Search never decides version/release authority.

---

## Caching

Project Files/Deliverables caches should vary by:

```text
organizationMembershipId
projectId
authorizationRevision
assetRevision aggregate
fileVersionRevision
deliverableRevision
artifactReferenceRevision
reviewRevision
approvalRevision
clientReleaseRevision
```

---

## Signed download URLs should not be cached as business state

They are short-lived transport credentials.

---

## Performance

Use:

* Project-scoped usage-reference indexes,
* batched Asset/current-version queries,
* exact artifact joins,
* summarized review/approval/release status,
* lazy FileVersion history,
* lazy large previews/downloads.

Avoid loading every historical FileVersion for every file on initial render.

---

## Partial failure contract

Example:

```text
Project core        ✓
Assets              ✓
FileVersions        ✓
Deliverables        ✓
Review service      ✓
Approval service    ✕
Client release      ✓
```

Correct:

> Deliverable artifact available. Approval state currently unavailable.

Incorrect:

> Not approved.

Another:

```text
Asset metadata      ✓
Storage provider    ✕
```

Correct:

> File metadata available; binary temporarily unavailable.

Not:

> File deleted.

---

## Backend Requirement Matrix

| Requirement                                           | Status                         |
| ----------------------------------------------------- | ------------------------------ |
| Design 030 canonical Asset reuse                      | **Critical**                   |
| Asset/FileVersion separation                          | **Critical**                   |
| FileVersion/StorageObject separation                  | **Critical**                   |
| Folder/security separation                            | **Critical**                   |
| Project association/Asset identity separation         | **Critical**                   |
| Removing association does not delete Asset            | **Critical**                   |
| Asset current version/Deliverable artifact separation | **Critical**                   |
| Latest version/approved version separation            | **Critical**                   |
| Latest version/released version separation            | **Critical**                   |
| File/Deliverable separation                           | **Critical**                   |
| First-class Deliverable identity                      | **Critical**                   |
| Deliverable/artifact separation                       | **Critical**                   |
| Typed exact artifact references                       | **Critical**                   |
| SourceDomainVersion/FileVersion separation            | **Critical**                   |
| Render derivative/business version separation         | **Critical**                   |
| Deliverable artifact exact-version pinning            | **Critical**                   |
| Working files/client-visible files separation         | **Critical**                   |
| Review/Approval separation                            | **Critical**                   |
| Approval exact-version pinning                        | **Critical**                   |
| Review exact-version pinning                          | **Critical**                   |
| Approval/client release separation                    | **Critical**                   |
| Client release/final handover separation              | **Critical**                   |
| Deliverable/Publication separation                    | **Critical**                   |
| Deliverable readiness/Project completion separation   | **Critical**                   |
| Immutable FileVersions                                | **Critical**                   |
| Secure upload/download                                | **Critical**                   |
| Malware scanning/quarantine                           | **Critical**                   |
| MIME/size/checksum validation                         | **Critical**                   |
| Storage key not authorization                         | **Critical**                   |
| Current-pointer concurrency protection                | **Critical**                   |
| Deliverable artifact concurrency protection           | **Critical**                   |
| Project association idempotency                       | **Critical**                   |
| Template-generated Deliverable idempotency            | **Critical if used**           |
| Artifact assignment idempotency                       | **Critical**                   |
| Release exact-version idempotency                     | **Critical if release exists** |
| New version does not inherit old Approval             | **Critical**                   |
| New version does not silently replace client release  | **Critical**                   |
| Client Portal explicit access projection              | **Critical**                   |
| Design 051 reuse                                      | **Critical**                   |
| Design 115 Approval reuse                             | **Critical architecture**      |
| Design 120 closeout separation                        | **Critical architecture**      |
| Design 121 handover reuse                             | **Critical architecture**      |
| Design 124 publishing reuse                           | **Critical architecture**      |
| Design 113 Risk/Blocker source reuse                  | **Critical architecture**      |
| Cross-tenant artifact links prohibited                | **Critical**                   |
| Permission-safe source/binary access                  | **Critical**                   |
| Audit/outbox integration                              | **Required**                   |
| Partial dependency failure handling                   | **Critical**                   |

---

# 8. Consolidation

Design 114 creates major risk if **files, versions, deliverables, approvals, releases, and handover** are reduced to one generic attachment model.

**Asset / FileVersion conflation**
Logical file identity and exact binary revision collapse.

**FileVersion / StorageObject conflation**
Storage-provider object becomes business identity.

**Storage key / authorization conflation**
Knowing object path grants access.

**Folder / security boundary conflation**
Moving file to “Client” folder exposes it.

**Folder / Deliverable lifecycle conflation**
Moving into “Final” marks it delivered.

**Project association / Asset ownership conflation**
Removing Project link deletes globally reused Asset.

**Project file / Deliverable conflation**
Every working file becomes a client output.

**Deliverable / Asset conflation**
Business obligation and file identity collapse.

**Deliverable / FileVersion conflation**
One binary becomes the entire delivery obligation.

**Deliverable / current Asset version conflation**
Uploading new version silently changes what will be delivered.

**Deliverable / SourceDomainVersion conflation**
ProofVersion/DraftVersion semantics disappear.

**ProofVersion / rendered FileVersion conflation**
Review anchors break when render changes.

**DraftVersion / DOCX/PDF file conflation**
Editorial business revision becomes storage format.

**ReportVersion / generated PDF conflation**
Frozen metrics/report semantics are lost.

**Latest version / approved version conflation**
New unreviewed file inherits prior approval.

**Latest version / released version conflation**
Client sees unfinished update.

**Latest version / handover version conflation**
Historical final package changes after delivery.

**Current pointer / immutable history conflation**
Version lineage disappears.

**Replace file / overwrite FileVersion conflation**
Review/approval evidence no longer matches the binary.

**Checksum equality / business identity conflation**
Identical bytes merge unrelated contextual files.

**Upload complete / safe file conflation**
Unscanned content becomes usable.

**Scan passed / Approved conflation**
Technical safety becomes business approval.

**Processing complete / review complete conflation**
Render readiness becomes editorial sign-off.

**Review / Approval conflation**
Comments/resolution become formal authorization.

**Approval / client release conflation**
Approved artifact becomes externally visible automatically.

**Client release / handover conflation**
Routine preview access becomes final delivery.

**Handover / Publication conflation**
Client delivery becomes public publishing.

**Deliverable ready / Project complete conflation**
Project bypasses closeout.

**All files present / all Deliverables satisfied conflation**
Working file count substitutes business obligations.

**File count / Project progress conflation**
More files falsely means more completion.

**Deliverable lifecycle / Approval state conflation**
Formal approval is copied into generic status.

**Deliverable lifecycle / review state conflation**
Review workflow disappears.

**Deliverable lifecycle / Project stage conflation**
File readiness moves workflow directly.

**Deliverable lifecycle / publication state conflation**
Ready output appears published.

**Deliverable lifecycle / handover state conflation**
One status tries to represent delivery contract.

**Supporting Asset / primary artifact conflation**
Reference/source material gets released as final output.

**Source file / client-safe derivative conflation**
Editable PSD/INDD leaks externally.

**Client visibility / internal Asset availability conflation**
Portal exposes all Project files.

**Client Project access / file download permission conflation**
Project access grants every binary.

**Release of Asset / release of exact FileVersion conflation**
Future versions leak automatically.

**Release revoked / historical release deletion conflation**
Cannot prove what client previously received.

**Approval v7 / Approval of Deliverable forever conflation**
v8 inherits v7 approval.

**Review v4 / review latest conflation**
Comments attach to wrong version.

**Deliverable artifact reassignment / prior artifact history overwrite conflation**
Cannot explain earlier approval/release.

**Template Deliverable definition / runtime Deliverable conflation**
Template stores client-specific output state.

**Package item / Deliverable conflation**
Current catalog changes active Project obligations.

**Current Package / Project Deliverable definition conflation**
Commercial history is rewritten.

**Task “upload file” completed / file exists conflation**
Checkbox substitutes actual artifact evidence.

**Blocker resolved / file ready conflation**
Risk workspace manufactures content readiness.

**Timeline item / Deliverable identity conflation**
Gantt marker becomes output truth.

**Activity event / FileVersion history conflation**
Timeline text replaces exact version records.

**Audit event / approval/release evidence conflation**
Compliance log becomes business state.

**Search index / current file version authority conflation**
Stale indexed file becomes deliverable artifact.

**Signed URL / file permission conflation**
Temporary transport token becomes durable access.

**Storage outage / file deleted conflation**
Metadata/history disappears from UI.

**Approval service outage / rejected/unapproved conflation**
Dependency failure becomes business status.

**Client release service outage / not released conflation**
System may duplicate release.

**Bulk release / blind file visibility conflation**
Restricted files leak.

**Cross-tenant Asset reference**
Project deliverable points to another organization's binary.

**Generic ProjectAttachment entity for everything**
Working assets, deliverables, proofs and client releases lose semantics.

**Generic `file.status` field**
Upload, scan, review, approval, release and handover collapse.

**Generic File mega-PATCH**
One payload changes version, visibility, approval and delivery status.

**114/030 duplicate Asset backend**
Project files and Asset Library disagree.

**114/051 duplicate Client file access state**
Internal and Portal visibility diverge.

**114/049–050 duplicate review backend**
Project file screen creates review comments.

**114/068–069 duplicate client-visible version state**
Libraries expose different artifacts.

**114/113 duplicate blocker state**
Missing file exists as separate issue truth.

**114/115 duplicate Approval state**
Deliverable owns approval boolean.

**114/120 duplicate Project completion logic**
Files workspace closes Project.

**114/121 duplicate handover state**
Project Files independently marks final delivery.

**114/124 duplicate Publication artifact state**
Project file “published” flag replaces publishing backend.

No additional screen is required.

These are **Asset identity, immutable FileVersion lineage, Project usage, Deliverable identity, exact artifact-version pinning, review/approval/client-release separation, secure storage/access, handover/publishing boundaries, and partial-failure requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT FILE ASSOCIATION, DELIVERABLE IDENTITY & EXACT-ARTIFACT DELIVERY ANCHOR**

**Domain directive:**
**Project ≠ Asset ≠ FileVersion ≠ StorageObject ≠ Folder ≠ ProjectFileAssociation/UsageReference ≠ Deliverable ≠ DeliverableArtifactReference ≠ SourceDomainVersion ≠ Review ≠ Approval ≠ ClientRelease/Handover ≠ Publication.**

**Asset directive:**
Design 030 remains the sole canonical Asset/File foundation. Design 114 associates those Assets with Projects and never creates a second Project-file binary domain.

**Version directive:**
Asset is logical identity; FileVersion is exact immutable content. Replacing a file creates a new FileVersion rather than mutating historical bytes/reference evidence.

**Storage directive:**
StorageObject remains infrastructure state. Provider object paths, buckets or keys never become business identity or authorization.

**Folder directive:**
folders organize files only. Folder movement never grants client access, Approval, Deliverable status, release, handover or publication.

**Project-association directive:**
a Project file association/UsageReference explains Project context without duplicating or transferring Asset identity. Removing that relation does not delete the Asset or its history.

**Deliverable directive:**
`Deliverable` is a first-class Project business/output obligation and remains separate from arbitrary working files, Tasks, Project stages and individual binaries.

**Artifact directive:**
each Deliverable references the exact artifact/version that currently satisfies it through a typed artifact relation. It never relies on an ambiguous “latest file” lookup.

**Source-version directive:**
domain-specific DraftVersion, ProofVersion, ReportVersion, PublicationArtifact, podcast/video versions and similar business revisions remain canonical even when they render/store ordinary Asset/FileVersions.

**Derivative directive:**
rendered binary derivative and source-domain business version are never treated as equivalent identities.

**Current/latest directive:**
Asset `currentFileVersionId`, Deliverable current artifact, approved artifact, client-released artifact and final-handover artifact may all legitimately reference different exact versions.

**Review directive:**
Draft/Proof/source-domain review remains exact-version bound under its canonical review engine. Design 114 displays review state but never creates another comment/annotation backend.

**Approval directive:**
Design 029/115 remain authoritative for formal Approval. Approval always targets the exact artifact/source version; approval of v7 never transfers to v8.

**Readiness directive:**
`ProjectDeliverableReadinessResolver` centrally evaluates whether the exact artifact is safe, complete, reviewed/approved as required and free from blocking conditions. Readiness is derived, not a browser checkbox.

**Release directive:**
client release/access is explicit and exact-version based. New uploads never silently become client-visible merely because the same Asset already had an older released version.

**Portal directive:**
Design 051 consumes explicit safe ClientAssetAccess/release projections. Client Project access does not expose all internal Project files or source assets.

**Source-file directive:**
editable/source production files can have different permissions from client-ready derivatives. Download/access decisions remain artifact-specific.

**Handover directive:**
Design 121 remains authoritative for final handover. It consumes exact ready Deliverable/artifact references and freezes what was actually handed over.

**Historical-handover directive:**
later file uploads or Deliverable changes cannot rewrite the artifact versions contained in a completed handover.

**Closeout directive:**
Design 120 remains Project completion authority. Required Deliverables may be closeout inputs, but “all files uploaded” or “all Deliverables ready” cannot bypass broader Project completion policy.

**Publishing directive:**
Designs 031/124–126 remain publication authority. Publishing uses exact approved artifacts; Deliverable-ready or client-delivered does not mean publicly published.

**Commercial directive:**
Project Deliverables may retain provenance to agreed commercial snapshots or ProjectTemplate definitions, but current Product/Package/template edits never change this Project's existing delivery obligations.

**Task directive:**
Tasks may request file creation/upload/review, but Task completion is never evidence by itself that the correct artifact exists, is safe, approved, or delivered.

**Risk directive:**
Design 113 can reference missing/rejected/delayed Assets or Deliverables as risk/blocker evidence while Design 114 remains the source of file/delivery truth.

**Security directive:**
uploads use verified object creation, malware scanning, MIME/size/checksum validation and tenant-scoped storage. Restricted downloads use reauthorization and short-lived access rather than static public paths.

**Quarantine directive:**
unsafe/quarantined FileVersions cannot be assigned as ready Deliverables, released, handed over or published.

**Idempotency directive:**
Project attachment, template-generated Deliverable creation, artifact assignment, client release and source-event processing are replay-safe.

**Concurrency directive:**
Asset current-version changes and Deliverable artifact assignments use expected revisions/atomic pointer updates. Parallel users cannot silently replace approved/delivered artifacts.

**Tenant directive:**
Project, Asset, FileVersion, Deliverable, review subject, Approval and release references remain strictly tenant-scoped.

**Permission directive:**
Project access, file metadata read, binary download, source-file access, upload/version creation, Deliverable management, Approval and client release remain independently server-authorized.

**Search directive:**
Design 079 may index safe file/deliverable metadata but never storage secrets, restricted content, version authority or release state beyond the user's permissions.

**Caching directive:**
Project Files/Deliverables caches vary by membership authorization, Asset/FileVersion/Deliverable/artifact/review/Approval/release revisions. Signed download URLs remain ephemeral transport credentials rather than cached business state.

**Partial-failure directive:**
Asset metadata, binary storage, processing, review, Approval, client release and handover services can fail independently. `Unavailable` can never silently become `Deleted`, `Unapproved`, `Not released`, or `Ready`.

**Performance directive:**
use Project-scoped usage indexes, batched Asset/current-version/artifact queries, summarized approval/release state and lazy version/history/preview loading rather than loading all binaries and historical versions by default.

**Activity directive:**
Design 119 may project uploads, version changes, Deliverable assignment and release events, but Activity remains observational and never substitutes for exact FileVersion/artifact history.

**Audit directive:**
sensitive upload/download, Deliverable creation/change, artifact reassignment, release/revocation and exceptional readiness actions generate actor/version-aware Audit evidence.

**Future-reuse directive:**
Design **115 — Project Approval Gates / Approval History** must consume exact Deliverable/Draft/Proof/artifact versions from Design 114 while continuing to use Design 029's canonical ApprovalRequest/Decision engine. It must not attach approval to a mutable Deliverable without an exact subject version.

**Overlap directive:**
Designs **023, 029–031, 049–051, 068–069, 111–126** must preserve one continuous **Project → Asset/FileVersion + Deliverable → exact Draft/Proof/File/Report/Publication artifact version → Review → Approval → Client Release → Final Handover / Publication** lineage while keeping files, business deliverables, reviews, approvals, access, handover and publication independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT FILE & DELIVERABLE FOUNDATION — CANONICAL DESIGN-030 ASSETS + IMMUTABLE FILEVERSIONS + NON-SECURITY FOLDER/PROJECT-USAGE RELATIONS + FIRST-CLASS PROJECT DELIVERABLES + TYPED EXACT ARTIFACT-VERSION REFERENCES + STRICT LATEST/APPROVED/RELEASED/HANDOVER VERSION SEPARATION + SOURCE-DOMAIN REVIEW/APPROVAL REUSE + EXPLICIT CLIENT ACCESS/RELEASE + SECURE STORAGE/SCAN/DOWNLOAD CONTROLS + IDEMPOTENT VERSION/ARTIFACT OPERATIONS + NON-DESTRUCTIVE HISTORY — AND NEVER ALLOW FOLDER MOVES, “LATEST FILE” POINTERS, UPLOAD COMPLETION, TASK CHECKBOXES, PRIOR VERSION APPROVALS, CLIENT PROJECT ACCESS OR STORAGE URLs TO SUBSTITUTE FOR OR REWRITE CANONICAL DELIVERABLE, REVIEW, APPROVAL, RELEASE, HANDOVER, PUBLICATION OR PROJECT-COMPLETION TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **114 / 153** |
| **PASS**                                   |                        **114** |
| **STANDARDIZE decisions**                  |                        **112** |
| **Potential implementation-overlap flags** |                        **105** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**114 / 153 = 74.5% audited.**

### Canonical Project file/deliverable architecture after Design 114

```text
PROJECT PR-100
      │
      ├── Working / Reference Files
      │       ↓
      │     Asset A-10
      │       ├── FV-1
      │       ├── FV-2
      │       └── FV-3
      │
      └── Deliverable D-20
              │
              ↓
        exact artifact
        ProofVersion PV-7
              │
              ↓
        Render FileVersion FV-12
```

The strongest version rule is now explicit:

```text
Asset A-10

Latest FileVersion   = v8
Approved FileVersion = v7
Released FileVersion = v7

RESULT:

Uploading v8
does NOT automatically change:

Approval
Client release
Final handover.
```

The file/deliverable distinction is equally strict:

```text
Project contains:

interview-notes.docx
logo-reference.png
cover-source.psd
cover-final.pdf

These are Project files.

Only an explicitly created:

Deliverable:
“Final Magazine Cover”

with an exact artifact/version

becomes the governed
Project Deliverable.
```

Review and Approval remain version-specific:

```text
Proof v7
   ↓
ApprovalRequest A-10
   ↓
APPROVED

Later:
Proof v8 created

RESULT:

v8 = NOT APPROVED

Approval of v7
does not transfer.
```

And delivery remains layered:

```text
File exists
    ≠
Deliverable ready
    ≠
Reviewed
    ≠
Approved
    ≠
Client released
    ≠
Final handover complete
    ≠
Published
    ≠
Project completed
```

Each remains a separately provable canonical fact.

## Next Sequential Audit Target

### **Design 115 — Project Approval Gates / Approval History**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
