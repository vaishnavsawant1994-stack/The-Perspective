# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 051 — Client Files & Assets

Design 051 should become the **canonical Client Portal file-and-asset access workspace** for files intentionally made available to an authenticated Client Portal member, while reusing the platform-wide Asset/File foundation already established in **Design 030**.

Its most important architectural responsibility is preserving this boundary:

> **Asset ≠ FileVersion ≠ StorageObject ≠ Folder ≠ Project Attachment ≠ Client Deliverable ≠ Client-visible File Access.**

The Client Portal must **not** have a second file-storage subsystem. It should consume explicit, permission-safe projections over the canonical Asset/FileVersion infrastructure.

| Audit field                     | Classification                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Design ID**                   | **051**                                                                                                                                                |
| **Canonical name**              | **Client Files & Assets**                                                                                                                              |
| **Product area**                | Client Portal / Files / Deliverables / Collaboration                                                                                                   |
| **User surface**                | **Client Portal**                                                                                                                                      |
| **Screen class**                | Client-Safe File Library / Asset Access Workspace                                                                                                      |
| **Classification**              | **Portal Workspace Variant — Client Asset & Deliverable Family**                                                                                       |
| **Primary purpose**             | Let authorized Client users view, filter, preview, download and where permitted upload files intentionally exposed within their Client/Project context |
| **Primary canonical entity**    | **Asset**                                                                                                                                              |
| **Version entity**              | **FileVersion / AssetVersion**                                                                                                                         |
| **Storage entity**              | **StorageObject**                                                                                                                                      |
| **Organizational concept**      | Folder / Collection                                                                                                                                    |
| **Context entities**            | ProjectAttachment, Deliverable, MessageAttachment, ReviewAttachment, QuestionnaireAttachment, ClientRequest                                            |
| **Access concept**              | ClientAssetAccess / AssetUsageReference / visibility policy                                                                                            |
| **Canonical foundation**        | Design 030 — Asset & File Library                                                                                                                      |
| **Project dependency**          | Design 043                                                                                                                                             |
| **Client Request dependency**   | Design 047                                                                                                                                             |
| **Review dependencies**         | Designs 049–050                                                                                                                                        |
| **Later related design**        | Design 069 — Client Designs / Proofs Library                                                                                                           |
| **Project file detail overlap** | Design 114                                                                                                                                             |
| **Parent shell**                | `ClientPortalShell` — Design 002                                                                                                                       |
| **Primary read model**          | `ClientFilesAssetsView`                                                                                                                                |
| **Template family**             | `ClientAssetLibraryWorkspaceTemplate`                                                                                                                  |
| **Composition**                 | `ClientFilesAssetsComposition`                                                                                                                         |
| **Auth**                        | Required                                                                                                                                               |
| **Authorization**               | Portal membership + Client/Project scope + Asset/version access policy                                                                                 |
| **Implementation priority**     | **Critical Client Collaboration & Delivery**                                                                                                           |
| **Reuse level**                 | **Extremely High with Design 030**                                                                                                                     |

The governing invariant is:

> **A file existing in the platform does not mean the Client can see it, and a Client seeing one FileVersion does not mean they can see every version, folder, Project file, or source asset around it.**

---

# 1. Classification — Functional Responsibility

Design 051 should answer:

> **“Which files have been intentionally shared with me, which Project do they belong to, which exact version am I viewing, can I preview or download them, which files am I allowed to upload, and which items are final deliverables versus ordinary shared assets?”**

Canonical architecture:

```text
Canonical Asset Infrastructure
Design 030
        │
        ├── Asset
        ├── FileVersion
        ├── StorageObject
        ├── derivatives
        ├── metadata
        └── usage/access references
                ↓
        Client-safe access policy
                ↓
        Portal membership/resource scope
                ↓
     Design 051 — Client Files & Assets
```

Design 051 is therefore a **Client-safe projection and interaction surface** over Design 030.

It is not a second DAM/file system.

---

# 2. Reuse — Design 030 is canonical

Design 030 already established the platform-wide file foundation.

Design 051 must reuse:

* Asset identity,
* FileVersion history,
* storage abstraction,
* upload processing,
* metadata,
* derivatives,
* security scanning,
* previews,
* search/indexing,
* access control,
* usage lineage.

Correct:

```text
Asset / FileVersion
        │
        ├── Internal Asset Library — Design 030
        └── Client-safe Asset View — Design 051
```

Incorrect:

```text
InternalFile
ClientFile
PortalFile
ProjectFile
```

as separate storage domains.

---

# 3. Entities — Asset ≠ FileVersion

`Asset` is the stable logical file/media identity.

Example:

```text
Asset:
Founder Portrait
```

Versions might be:

```text
FileVersion v1 — low resolution
FileVersion v2 — higher resolution
FileVersion v3 — final retouched
```

A Client may be entitled to one or several specific versions.

---

# 4. FileVersion must remain exact

If a Client downloaded:

> Final Magazine PDF v4

and internal team later produces v5, their historical access/download record must still point to v4.

Never implement:

```text
Asset
→ always latest FileVersion
```

for historical or formally delivered artifacts.

---

# 5. Asset ≠ StorageObject

A logical Asset should not be tied directly to one cloud blob.

Conceptually:

```text
Asset
  ↓
FileVersion
  ↓
StorageObject
```

StorageObject may represent:

* S3 object,
* blob storage object,
* CDN-backed object,
* another provider-specific object.

Storage implementation must remain replaceable.

---

# 6. StorageObject ≠ public URL

A storage record does not imply that a Client receives a permanent public URL.

Client-safe access should use:

* authenticated streaming,
* short-lived signed URL,
* controlled download endpoint,

according to storage architecture.

---

# 7. Client-visible ≠ public

Permanent rule:

```text
Client-visible
≠
Public internet
```

A proof, invoice, Contract, Report or private executive image may be visible to authenticated Client users while remaining completely non-public.

---

# 8. Folder ≠ security boundary

Design 030 already established:

> Folder is organizational.

Do not implement:

```text
Folder = Client A
therefore every file inside belongs to Client A
```

Authorization must evaluate canonical ownership/context/access policy.

---

# 9. Folder ≠ Project

A Project may organize assets into folders, but:

```text
Folder
≠
Project
```

A folder can be moved or renamed without changing canonical Project relationships.

---

# 10. Folder path ≠ authorization identity

Do not rely on:

```text
/client-a/project-x/final/
```

as the security model.

Database/resource authorization remains authoritative.

---

# 11. Project Attachment ≠ Asset

A Project relationship should conceptually look like:

```text
Project
   ↓
AssetUsageReference / ProjectAttachment
   ↓
Asset / FileVersion
```

The Asset remains reusable beyond one context where appropriate.

---

# 12. Message Attachment ≠ Asset duplication

Design 045 already established:

```text
MessageAttachment
      ↓
Asset/FileVersion
```

Design 051 should not create another file copy simply because the same file appears in Messages.

---

# 13. Questionnaire Attachment ≠ separate storage

Design 048 uploads should likewise reuse:

```text
Questionnaire answer
      ↓
Asset/FileVersion
```

Design 051 may surface the file only if Client visibility policy allows it.

---

# 14. Review Attachment ≠ separate storage

Designs 049/050 should use the same Asset/FileVersion infrastructure for Client-visible review attachments.

---

# 15. Client Deliverable ≠ any Project Asset

This is one of the most important distinctions.

A Project may contain:

* raw interview audio,
* working Drafts,
* internal notes,
* source design files,
* temporary exports,
* final deliverables.

Only an explicit subset should be Client deliverables.

Correct:

```text
Project Asset
      ↓
Deliverable designation / release
      ↓
Client access
```

Not:

```text
All Project Assets
→ Client Files
```

---

# 16. Deliverable should be first-class contextually

A Client deliverable may conceptually include:

```text
Deliverable
├── Project
├── Asset
├── exact FileVersion
├── deliverable type
├── release state
├── releasedAt
└── Client visibility policy
```

Exact schema belongs to Phase 3D.

---

# 17. Deliverable ≠ FileVersion

A FileVersion is a stored file revision.

A Deliverable is a business relationship meaning:

> This exact artifact/version has been intentionally delivered to the Client.

The same FileVersion might appear in multiple contexts.

---

# 18. Released ≠ uploaded

Example:

```text
final-magazine-v4.pdf
```

can be uploaded and processed internally without being released.

Correct:

```text
FileVersion READY
Client release NOT_RELEASED
```

Design 051 should not show it yet.

---

# 19. Uploaded ≠ ready

Canonical upload lifecycle remains:

```text
upload initiated
↓
stored
↓
security scan
↓
metadata extraction
↓
preview/derivative generation
↓
READY
```

Client must not preview/download an unsafe/unprocessed file prematurely.

---

# 20. Ready ≠ approved

A file can be technically ready but:

* not reviewed,
* not approved,
* not intended for Client,
* not delivered.

Technical readiness and business readiness remain separate.

---

# 21. Approved ≠ delivered

Even if a proof or Report receives Approval:

it should only appear in Design 051 if delivery/access policy says it should.

Formal Approval does not automatically imply broad file-library visibility.

---

# 22. Client access should be explicit

Conceptually:

```text
Asset/FileVersion
      ↓
ClientAssetAccess / UsageVisibility
      ↓
Portal member/resource entitlement
```

Design 051 queries the resulting authorized set.

---

# 23. Same Client ≠ same file access

Example:

```text
CEO
→ all final Reports + Contracts

Marketing Director
→ magazine proofs + images

Finance Contact
→ invoice PDFs only
```

All belong to the same Client but legitimately receive different file sets.

---

# 24. File access can be Project-scoped

A Portal user may access files for Project A but not Project B.

The query must apply resource scope before:

* listing,
* searching,
* counting,
* previewing,
* downloading.

---

# 25. Project access ≠ every file

A Client member with:

```text
portal.projects.read
```

should not automatically get:

```text
portal.assets.read_all_project_files
```

if no such permission/policy exists.

---

# 26. File metadata can itself be sensitive

Even metadata such as:

> Contract-Termination-Draft.pdf

can leak confidential information.

Therefore authorization applies before returning:

* file names,
* types,
* uploader names,
* timestamps,
* thumbnails.

---

# 27. Search must be permission-scoped

Dangerous:

```text
search all Asset metadata
→ filter unauthorized files later
```

could leak names and snippets.

Correct:

```text
authorized Asset scope
→ search within permitted set
```

---

# 28. Search index must preserve tenant/resource boundaries

If a global Asset search index exists, it must include enough access/filter dimensions to prevent cross-Client leakage.

---

# 29. Client file categories

Design 051 may visually group files into categories such as:

* Project Files,
* Deliverables,
* Drafts,
* Designs,
* Reports,
* Contracts,
* Uploads,

depending on the frozen UI.

These are presentation/query categories.

They must not become separate storage systems.

---

# 30. Category ≠ entity type automatically

A PDF can appear as:

```text
Deliverable
Report
Project File
```

based on usage/context.

Do not force one irreversible `asset.type` field to represent every business meaning.

---

# 31. AssetUsageReference

A flexible contextual model can represent:

```text
Asset
   ↓
UsageReference
   ├── Project attachment
   ├── Message attachment
   ├── Questionnaire answer
   ├── Review attachment
   ├── Deliverable
   ├── Contract artifact
   └── Report artifact
```

while keeping the stored Asset canonical.

---

# 32. One Asset can have multiple uses

Example:

```text
CEO Portrait v3
```

may be:

* Questionnaire attachment,
* magazine production asset,
* final website publication asset.

Do not duplicate the binary for each module.

---

# 33. Rights/licensing ≠ technical access

Design 030 already established rights/licensing as a separate concern.

A file may be technically downloadable but legally restricted for reuse.

Where the product represents rights, keep:

```text
Access permission
≠
Usage rights
```

---

# 34. Source ≠ derivative

Example:

```text
portrait-original.tiff
       ↓
web-preview.jpg
       ↓
thumbnail.webp
```

Derivatives should preserve lineage to the source FileVersion.

---

# 35. Preview derivative ≠ business version

Generating a thumbnail or compressed PDF does not create a new Asset business version.

---

# 36. Download artifact ≠ preview derivative necessarily

A Client may:

* preview a low-resolution derivative,
* download the exact approved original/final delivery artifact.

The backend should intentionally select the correct FileVersion/derivative.

---

# 37. Preview ≠ download permission

Permanent boundary:

```text
portal.assets.preview
≠
portal.assets.download
```

where required.

A Client may be allowed to view a design proof without receiving the source/high-resolution file.

---

# 38. Download ≠ share

Likewise:

```text
DOWNLOAD
≠
SHARE
```

If public/external sharing links exist later, they need a separate permission/policy.

No sharing feature is introduced here.

---

# 39. Download ≠ export all

A user who can download one file should not automatically be permitted to bulk-export an entire Client Project.

---

# 40. Upload permission

Design 051 may support Client uploads where frozen.

If allowed:

```text
portal.assets.upload
```

should remain separate from:

```text
portal.assets.download
```

---

# 41. Upload target must be explicit

A Client upload should know its intended context:

```text
Project
ClientRequest
Questionnaire
Message
Review
general Client library
```

Do not allow arbitrary orphaned upload records without business context unless the product intentionally provides general storage.

---

# 42. Upload ≠ Client deliverable

A Client-supplied portrait uploaded for editorial use is not a deliverable back to the Client.

Direction and usage matter.

---

# 43. Client upload actor attribution

Every upload should preserve:

```text
uploadedBy = ClientPortalMembership
uploadedAt
```

Historical attribution remains even if membership is later revoked.

---

# 44. Upload filename ≠ trusted metadata

Client-provided file names can contain:

* unsafe characters,
* misleading extensions,
* path traversal attempts.

Canonical storage should generate safe object identifiers independently from display file names.

---

# 45. MIME type must be validated

Do not trust only:

```text
filename = portrait.jpg
```

The server should inspect/validate actual content type according to security policy.

---

# 46. Malware/security scanning

Client uploads should not become available to internal employees or other Clients before security checks complete.

---

# 47. Quarantine

If a file is unsafe:

```text
Asset/FileVersion
→ QUARANTINED
```

or equivalent processing state.

The file record can remain for traceability while download/use is blocked.

---

# 48. Security scan failure ≠ business rejection

A security infrastructure failure is different from:

> This image is too low resolution.

Technical and business validation must remain separate.

---

# 49. Asset technical state ≠ ClientRequest satisfaction

Design 047 may ask:

> Upload high-resolution portrait.

File flow:

```text
Uploaded
↓
security-ready
↓
business validated
↓
ClientRequest satisfied
```

The request should not close at the first upload byte.

---

# 50. Business validation

Some files may require:

* resolution check,
* format check,
* editorial suitability,
* completeness.

This should not be hard-coded globally into Asset status.

Domain-specific requirement validation stays contextual.

---

# 51. Version replacement

If Client uploads a replacement:

```text
portrait-v1.jpg
→ portrait-v2.jpg
```

the platform needs deliberate semantics:

* new FileVersion of same Asset,
* or new Asset linked as replacement.

Exact model depends on usage.

Historical contexts must preserve the exact original version.

---

# 52. Replacement ≠ historical rewrite

A Message sent with v1 stays attached to v1.

A Questionnaire submitted with v1 stays attached to v1.

A current Project requirement may now point to v2.

---

# 53. File naming

Display names can evolve or be Client-friendly.

Stable IDs remain independent from filenames.

Do not use filename as primary identity.

---

# 54. Rename ≠ new FileVersion necessarily

Changing display name:

> portrait-final.jpg

to:

> CEO Portrait.jpg

without changing binary content may be metadata mutation rather than content version.

Exact versioning policy Phase 3D.

---

# 55. Binary content change generally requires versioning

If actual file content changes, historical references should not silently point to the changed blob.

---

# 56. Hashing / deduplication

Design 030 may use content hashes to avoid duplicate physical storage.

But:

> duplicate binary ≠ same business Asset automatically.

Two business contexts can intentionally reference identical bytes while retaining separate logical identity.

Deduplication is storage optimization, not business identity.

---

# 57. Client-facing uploader identity

If showing who uploaded an internal file:

use a safe Design 036 employee projection.

Do not expose:

* internal email,
* Team Role,
* Department,
* internal profile metadata.

---

# 58. Internal notes never enter file metadata projection

Internal Asset records may contain:

* editorial notes,
* processing details,
* rights notes,
* QA status.

Design 051 should receive only Client-safe metadata.

---

# 59. Internal filenames may need safe display names

An internal filename like:

```text
client-final_FINAL-v7-use-this.pdf
```

may not be appropriate Client-facing presentation.

The product can maintain a Client-safe display label without changing the canonical stored object.

---

# 60. File version history

If frozen UI exposes version history:

the Client should only see versions intentionally released to them.

Internal working versions remain hidden.

---

# 61. Client-visible version history ≠ complete internal version history

Example:

```text
v1 internal
v2 internal
v3 Client
v4 internal
v5 Client
```

Portal history can legitimately show only:

```text
Client Version 1 → internal v3
Client Version 2 → internal v5
```

or equivalent safe labeling.

---

# 62. Design 049 Draft Review relationship

A DraftVersion being reviewable does not automatically place its backing file into Design 051.

Review entitlement and library visibility can be separate.

---

# 63. Design 050 Design Review relationship

Likewise, a visual ProofVersion may be reviewable without being generally downloadable.

Design 050's proof viewer can use protected render derivatives while Design 051 follows its own file access rules.

---

# 64. Design 052 Approval relationship

Approval can bind to an exact FileVersion-backed artifact.

But:

```text
Approved
≠
Client File Library release
```

unless delivery policy explicitly says so.

---

# 65. Design 053 Contract relationship

Client Contract PDFs should use canonical Asset/FileVersion generation/storage.

But Contract access remains governed by Contract permissions.

A Client with file-library access should not automatically receive all legal documents.

---

# 66. Design 054 Invoice relationship

Invoice PDFs likewise use the common file infrastructure.

Finance permission remains authoritative.

---

# 67. Design 056 Reports relationship

Final Report downloads should use Asset/FileVersion.

Design 056 owns report semantics.

Design 051 may list downloadable Report artifacts only when Report permissions allow it.

---

# 68. Design 068 Drafts Library relationship

Later:

**Design 068 — Client Drafts Library**

It should use canonical Draft/DraftVersion access.

Design 051 should not become a second Draft library with duplicate Draft semantics.

---

# 69. Design 069 Designs / Proofs Library relationship

Later:

**Design 069 — Client Designs / Proofs Library**

Same principle:

* Design 051 = general file/asset library.
* Design 069 = design/proof-specific discovery.

One underlying Asset/Proof access foundation.

---

# 70. Design 114 relationship

Later internal:

**Design 114 — Project Files / Deliverables Detail**

This is a major overlap checkpoint.

Expected architecture:

```text
Canonical Asset / File / Deliverable Domain
            │
            ├── Design 051
            │   Client-safe files/assets
            │
            └── Design 114
                Internal Project file/deliverable management
```

One backend.

Two permission/detail surfaces.

---

# 71. Internal Design 114 may show more

Internal screen can expose:

* processing state,
* ownership,
* internal source versions,
* internal notes,
* delivery state,
* replacement lineage,
* QA.

Design 051 must expose only Client-safe projections.

---

# 72. Client Files ≠ public CDN directory

Do not expose browseable storage paths.

Every listed item should come through authenticated application queries.

---

# 73. Signed URL expiry

If using signed downloads:

* URLs should expire,
* permission checked before issuance,
* object identity/version pinned.

A revoked user should not receive indefinitely valid links.

---

# 74. Previously issued signed URL

Revocation cannot always invalidate already-issued object URLs instantly unless architecture supports it.

Therefore expiry should be appropriately short for sensitive files.

Exact duration belongs to implementation/security policy.

---

# 75. Download audit

Sensitive downloads can emit Design 039 AuditEvents where policy requires:

```text
ClientFileDownloaded
ContractDownloaded
ReportDownloaded
```

Do not audit every thumbnail request as a business-level event.

---

# 76. Download event ≠ Activity necessarily

Audit can record sensitive download.

Client Activity may or may not show:

> You downloaded Report.pdf.

Different purpose.

---

# 77. Access revocation

If Client Project access is revoked:

Design 051 must promptly stop listing/downloading associated restricted files.

The canonical Asset and historical relationships remain.

---

# 78. Revocation ≠ deletion

Permanent:

```text
Access removed
≠
Asset deleted
```

---

# 79. Delete permission

Client users should not automatically be able to delete canonical business files.

If frozen UI includes deletion for their own uploads, it needs explicit lifecycle semantics.

This audit introduces no delete feature.

---

# 80. Client upload removal

A Client may need to replace/remove an incorrect submission.

If supported, do not hard-delete the original evidence if it was already used in a Questionnaire, Review or published artifact.

Usage/dependency checks are required.

---

# 81. File dependency graph

Before deletion/archival, the platform should know where a FileVersion is referenced:

```text
Questionnaire
Review
Message
Project
Deliverable
Publication
Report
Contract
```

This prevents broken historical artifacts.

---

# 82. Deleting Asset ≠ deleting StorageObject immediately

Where retention/history requires preservation, logical archival and physical deletion may occur separately.

Exact retention rules later.

---

# 83. Storage lifecycle

Large media systems may eventually transition old objects to archival tiers.

That technical storage lifecycle should not change business Asset identity.

---

# 84. Archived storage ≠ Client unavailable necessarily

If cold storage requires restore delay:

the Client-facing state can distinguish:

> File is being prepared.

rather than pretending the file no longer exists.

---

# 85. File size and metadata

Client-safe metadata may include:

* display name,
* type,
* file size,
* uploaded/released date,
* Project,
* version label,
* safe uploader,
* download/preview state.

Only if appropriate to frozen UI.

---

# 86. Zero-byte/invalid file

Upload validation should reject or quarantine invalid file content.

Do not create apparently healthy Client Asset records for failed uploads.

---

# 87. Duplicate upload

If the Client uploads the same file twice:

the system may deduplicate physically, but UX/business semantics should avoid confusing duplicate list entries where possible.

No automatic business merge should occur purely from hash equality.

---

# 88. File processing failure

If thumbnail generation fails:

the original file may still be downloadable if safely processed and permissions allow.

Processing failures should be localized.

---

# 89. Preview unavailable ≠ download unavailable

Example:

```text
Preview renderer failed
Original file ready
```

Design 051 may show:

> Preview unavailable — Download

if allowed.

Do not mark the entire Asset unavailable.

---

# 90. Download unavailable ≠ file missing

A file can exist while policy disallows download.

Use a restricted state rather than:

> File not found.

---

# 91. Unknown ≠ zero files

If Asset service is unavailable:

do not show:

> No files yet.

---

# 92. Unknown ≠ no deliverables

If Deliverable query fails:

do not claim:

> No deliverables available.

---

# 93. Restricted ≠ unavailable

A Client lacking Contract permission should not receive:

> Contract file failed to load.

That resource is restricted.

---

# 94. State Coverage

Design 051 inherits Design 150 plus file-specific states such as:

```text
Files Loading
Files Available

No Files Yet
No Files Matching Filters

Asset Uploading
Upload Failed
Upload Completed

File Scanning
File Processing
File Ready
File Quarantined
File Processing Failed

Preview Generating
Preview Ready
Preview Unavailable

Download Available
Download Restricted
Download Failed

FileVersion Current
FileVersion Historical
Newer Client-visible Version Available

Client Deliverable Ready
Deliverable Not Released
Deliverable Superseded

File Restricted
Project Access Revoked
Portal Access Revoked

Storage Restore Pending
Partial Service Failure
```

These are **not** one `file.status` enum.

---

# 95. No Files ≠ no Deliverables

A Client can have:

```text
shared files = 5
final deliverables = 0
```

These are different states.

---

# 96. Upload complete ≠ processing complete

The UI should clearly distinguish:

> Uploaded — processing

from:

> Ready.

---

# 97. Processing complete ≠ business accepted

For requested Client uploads:

> Ready

can still be followed by:

> Needs revision / accepted

through the ClientRequest/business-validation domain.

---

# 98. Superseded ≠ deleted

An older Client-visible version may remain accessible historically where policy allows.

---

# 99. Permission Architecture

Potential Phase 3D Client capabilities may include:

```text
portal.assets.read
portal.assets.preview
portal.assets.download
portal.assets.upload
portal.assets.view_versions
```

along with source-domain permissions such as:

```text
portal.contracts.read
portal.reports.read
portal.finance.read
```

Exact names later.

---

# 100. Asset permission ≠ source-domain permission bypass

A Client should not gain a Contract PDF merely because they have:

```text
portal.assets.read
```

if they lack:

```text
portal.contracts.read
```

Access evaluation needs both:

* Asset-level permission,
* context/domain eligibility.

---

# 101. Preview ≠ download

Already central enough to repeat:

```text
READ/PREVIEW
≠
DOWNLOAD
```

---

# 102. Download ≠ source access

A user might download:

```text
final-magazine.pdf
```

without being able to download:

```text
magazine-source.indd
```

These are separate Assets/versions/access classes.

---

# 103. Upload ≠ replace any file

A Client authorized to upload requested material should not be able to overwrite arbitrary internal Assets.

Upload targets must be constrained.

---

# 104. Version-history read ≠ all internal versions

`view_versions` must still filter to Client-released versions.

---

# 105. Client Portal Admin ≠ Asset Administrator

A Client account admin should not gain:

* delete any canonical Asset,
* access storage metadata,
* alter retention,
* bypass rights/licensing,
* change internal classifications.

---

# 106. Responsive Behavior — Desktop

Desktop should preserve an efficient file-library experience:

```text
Client Files & Assets
↓
Search / Filters / Project Context
↓
Categories / File Groups
↓
File Grid or List
    ├── preview/thumbnail
    ├── display name
    ├── Project/context
    ├── type/size
    ├── version
    ├── date
    ├── status
    └── permitted actions
↓
Preview / Detail panel where frozen
```

The visual can remain richer than a plain table while staying simpler than the internal Asset Library.

---

# 107. Responsive — Tablet

Following Design 152:

* grid/list reflows,
* filters collapse,
* preview can open in drawer/full overlay,
* file actions remain touch-safe,
* names truncate with accessible full text,
* Project and status remain visible.

---

# 108. Responsive — Mobile

Mobile priority:

```text
Files & Assets
↓
Search / Filter
↓
File Card
    ├── Thumbnail/icon
    ├── Name
    ├── Project/context
    ├── Version/status
    └── Preview / Download
↓
Upload where permitted
```

Do not force desktop file tables horizontally.

---

# 109. Mobile upload

Before confirming Client upload, clearly show:

* selected file,
* target Project/request/context,
* upload/scan state.

This reduces accidental upload to the wrong Project.

---

# 110. Mobile download clarity

If multiple versions exist, the Client should know which version they are downloading.

Avoid one ambiguous:

> Download

button on a page containing historical and current artifacts.

---

# 111. Accessibility

File cards need semantic labels including:

* filename,
* file type,
* version,
* status,
* available action.

Do not communicate:

* quarantined,
* ready,
* new version,

only through icon/color.

Preview controls need keyboard support.

---

# 112. Backend Query Model

Conceptually:

```text
ClientFilesAssetsView
├── current Portal membership
├── authorized Asset usages
├── exact Client-visible FileVersions
├── safe metadata
├── Project/account context
├── Deliverable classification
├── preview derivative
├── available versions
├── available actions
├── processing/security state
├── pagination/search/filter
└── partial service state
```

This is a read model.

---

# 113. ClientAssetSummary

A compact DTO might conceptually include:

```text
ClientAssetSummary
├── assetId
├── fileVersionId
├── displayName
├── content type
├── size
├── Project/context
├── usage type
├── Client-visible version label
├── processing state
├── preview capability
├── download capability
└── releasedAt / uploadedAt
```

No internal storage keys or private metadata.

---

# 114. Backend Mutation Architecture

Avoid:

```text
PATCH /client/files/:id
{
  visible: true,
  delivered: true,
  approved: true,
  projectId: ...
}
```

Client commands should be narrow:

```text
uploadClientAsset()
replaceClientSubmission()   // if supported
requestAssetPreview()
requestAuthorizedDownload()
```

Internal commands may include:

```text
releaseAssetToClient()
designateProjectDeliverable()
revokeClientAssetAccess()
```

according to business policy.

---

# 115. Download authorization should be evaluated at request time

Correct flow:

```text
Client requests download
        ↓
authenticate membership
        ↓
authorize Asset + context + FileVersion
        ↓
issue controlled download
```

Do not rely solely on permissions cached when the file list was rendered.

---

# 116. Backend Architecture

```text
Design 051
    ↓
ClientPortalSessionContext
    ↓
Client Asset Authorization
    ↓
AssetUsage / Deliverable Query
    ↓
Asset
    ↓
Exact FileVersion
    ↓
StorageObject / Derivatives
    ↓
Client-safe Preview / Download
```

Upload path:

```text
Client Upload
    ↓
Asset Service
    ↓
Storage
    ↓
Scan / Processing
    ↓
FileVersion READY
    ↓
Context-specific validation
    ↓
ClientRequest / Project workflow if applicable
```

---

# 117. Backend Requirements

| Requirement                                  | Status                    |
| -------------------------------------------- | ------------------------- |
| Client Portal authentication                 | **Critical**              |
| Active Portal membership                     | **Critical**              |
| Client/account isolation                     | **Critical**              |
| Project/resource scoping                     | **Critical**              |
| Canonical Asset reuse                        | **Critical**              |
| Canonical FileVersion reuse                  | **Critical**              |
| StorageObject abstraction                    | **Critical**              |
| AssetUsage / contextual relationships        | **Critical**              |
| Client-safe Asset projection                 | **Critical**              |
| Client-deliverable distinction               | **Critical**              |
| Explicit Client release/access state         | **Critical**              |
| Exact FileVersion access                     | **Critical**              |
| Client-visible vs internal version filtering | **Critical**              |
| Preview/download permission separation       | **Critical**              |
| Source-domain permission enforcement         | **Critical**              |
| Secure authenticated/signed downloads        | **Critical**              |
| Upload authorization/targeting               | **Critical**              |
| Malware/security scanning                    | **Critical**              |
| MIME/content validation                      | **Critical**              |
| Processing/derivative pipeline               | **Critical**              |
| Source/derivative lineage                    | **Critical**              |
| Upload/business-validation separation        | **Critical**              |
| ClientRequest integration                    | **Critical**              |
| Review attachment integration                | **Required**              |
| Questionnaire attachment integration         | **Required**              |
| Message attachment integration               | **Required**              |
| Contract artifact integration                | **Required**              |
| Invoice artifact integration                 | **Required**              |
| Report artifact integration                  | **Required**              |
| Search scoped before retrieval               | **Critical**              |
| Permission-safe caching                      | **Critical**              |
| Download/audit integration                   | **Required**              |
| Access revocation                            | **Critical**              |
| Retention/history preservation               | **Required**              |
| Partial processing/service failure           | **Critical**              |
| Design 030 infrastructure reuse              | **Critical**              |
| Design 114 backend reuse                     | **Critical architecture** |

---

# 118. Consolidation — Main Implementation Risks

Design 051 exposes several major implementation risks.

**Client file-system duplication**
A second Client storage/database is created instead of reusing Design 030.

**Asset/FileVersion conflation**
Logical file identity and exact content revision are treated as the same thing.

**FileVersion/StorageObject conflation**
Business version becomes cloud-storage implementation detail.

**StorageObject/public-URL conflation**
Private Client file receives permanent public access.

**Folder/security conflation**
Folder location is treated as authorization.

**Project/file visibility conflation**
Every Project file becomes Client-visible.

**Project access/file access conflation**
Any Project viewer receives every Project Asset.

**Asset/Deliverable conflation**
Any uploaded file is presented as final deliverable.

**Uploaded/ready conflation**
Unsafe file becomes immediately available.

**Ready/approved conflation**
Technical processing completion becomes business approval.

**Approved/released conflation**
Approved artifact appears in Client library before intentional delivery.

**Preview/download conflation**
Review access leaks downloadable source/high-resolution artifacts.

**Download/source-file conflation**
Client receives editable production sources.

**Current/latest bug**
Historical Client link silently changes to newest FileVersion.

**Version-history leakage**
Client sees internal-only file revisions.

**ProjectAttachment/Asset conflation**
Same binary is unnecessarily duplicated for every usage.

**Derivative/business-version conflation**
Thumbnail generation creates fake new Asset version.

**Filename/identity conflation**
Renaming or duplicate filenames corrupt identity.

**Hash/business-identity conflation**
Identical bytes are incorrectly merged into one Asset context.

**Upload/ClientRequest satisfaction conflation**
Any file upload closes the Client requirement.

**Security/business-validation conflation**
Malware scan status and editorial suitability become one status.

**Message attachment/project-library conflation**
Sharing one attachment exposes entire Project files.

**Contract/Asset permission bypass**
Generic file access exposes legal documents to unauthorized Client users.

**Report/Asset permission bypass**
Generic file access exposes restricted Reports.

**Signed-URL permanence**
Revoked user retains long-lived private-file access.

**Restricted/unavailable conflation**
Authorization denial is reported as system failure.

**Preview failure/file missing conflation**
Derivative outage makes valid Asset appear gone.

**No files/service outage conflation**
Asset-service failure becomes empty-state success.

**051/114 duplicate file management engines**
Internal Project File Detail gets a separate backend.

**051/068/069 duplicate libraries**
Draft/Design libraries create separate file storage and version logic.

No additional design is required.

These are **asset identity, versioning, storage, delivery, authorization, file-security, and contextual-access requirements**.

# Design 051 Audit Verdict

## **PASS — CLIENT-SAFE ASSET, FILEVERSION & DELIVERABLE ACCESS ANCHOR**

**Domain directive:** **Asset ≠ FileVersion ≠ StorageObject ≠ Folder ≠ ProjectAttachment ≠ Deliverable ≠ ClientAssetAccess.**

**Reuse directive:** Design 030 remains the single canonical Asset/File/Storage domain for the entire platform. Design 051 is a Client-safe projection and interaction layer over it.

**Asset directive:** Asset is stable logical identity; FileVersion identifies exact binary/content revisions; StorageObject remains infrastructure only.

**Folder directive:** folders organize files but never become security or Project ownership boundaries.

**Usage directive:** Project attachments, Message attachments, Questionnaire attachments, Review attachments, Contract artifacts and Reports all reference canonical Assets/FileVersions rather than storing duplicate binaries.

**Deliverable directive:** a Project Asset becomes a Client Deliverable only through explicit business designation/release. Uploaded, processed, approved and delivered remain different states.

**Version directive:** Client-visible historical references always pin exact FileVersions. “Latest file” can never silently rewrite a delivered/reviewed historical artifact.

**Release directive:** technically ready ≠ Client-visible; Client access requires an intentional access/release policy.

**Permission directive:** Project access, Asset preview, Asset download, upload, version-history access and source-domain permissions remain independent and composable.

**Context directive:** generic Asset permission never bypasses Contract, Finance, Report, Project or other domain-specific visibility rules.

**Security directive:** Client uploads pass server-side filename/content validation, malware scanning and processing before becoming usable.

**Upload directive:** upload completion, technical readiness, business validation and ClientRequest satisfaction remain separate steps.

**Derivative directive:** previews, thumbnails, compressed versions and high-resolution review renders remain derivatives of an exact FileVersion—not new business versions.

**Source-file directive:** Client access must never accidentally expose production source files, internal working assets or unreleased versions.

**Download directive:** downloads are authorized at request time and served through controlled authenticated/signed access rather than permanent public object URLs.

**Search directive:** search and metadata retrieval are permission-scoped before results are produced so filenames, thumbnails and snippets cannot leak.

**Revocation directive:** revoking Portal/Project/File access stops future retrieval while preserving canonical Asset/history relationships.

**Audit directive:** sensitive download/release/revocation operations can feed Design 039 without treating every preview request as a business audit event.

**Reliability directive:** empty, restricted, processing, quarantined, preview-unavailable, download-restricted, historical and service-unavailable states remain distinct.

**Responsive directive:** desktop provides full file discovery/preview actions; mobile becomes file card → context/version → preview/download/upload without compressing an internal asset-management table.

**Overlap directive:** Designs **030, 043, 047–051, 053–056, 068–069 and 114** must ultimately consume one Asset + FileVersion + StorageObject + Usage + Derivative + Access foundation.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE ASSET + FILEVERSION + STORAGEOBJECT + DERIVATIVE + USAGE/DELIVERABLE + CLIENT-ACCESS + SECURE-DELIVERY INFRASTRUCTURE — DO NOT BUILD SEPARATE FILE STORES OR VERSION SYSTEMS FOR CLIENT PORTAL, PROJECTS, MESSAGES, QUESTIONNAIRES, REVIEWS, CONTRACTS, REPORTS OR PUBLISHING.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **51 / 153** |
| **PASS**                                   |                         **51** |
| **STANDARDIZE decisions**                  |                         **49** |
| **Potential implementation-overlap flags** |                         **42** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**51 / 153 = 33.3% audited.**

### Canonical Asset architecture after Design 051

```text
                     ASSET
                  Design 030
                      │
                      ↓
                 FileVersion
                      │
             ┌────────┼─────────┐
             ↓        ↓         ↓
        Storage    Metadata   Derivatives
             │
             ↓
       Usage / Access Layer
             │
   ┌─────────┼──────────┬───────────┐
   ↓         ↓          ↓           ↓
Project   Message   Questionnaire   Review
   │
   ├── Contract
   ├── Invoice
   ├── Report
   └── Deliverable
             │
             ↓
       CLIENT-SAFE ACCESS
             │
             ↓
      Design 051 — Files
```

The strongest internal/external pairing is now:

```text
Canonical Asset / Deliverable Domain
             │
      ┌──────┴──────┐
      ↓             ↓
 Design 051      Design 114
 Client Files    Internal Project
 & Assets        Files / Deliverables
```

with **one backend and two security/detail projections**.

# Next Sequential Audit Target

## **Design 052 — Client Approvals**

Its frozen identity is already locked.

The next audit must preserve the already-established formal decision boundary:

> **Review ≠ ApprovalRequest ≠ ApprovalParticipant ≠ ApprovalDecision ≠ ApprovalPolicy ≠ source workflow state.**

It must also reconcile the platform-wide Approval foundation from **Design 029** with the Client-facing approval queue, while preserving exact-version subject binding for Drafts, Proofs, Reports, Contracts or any other approvable artifact.

After Design 052 we continue strictly:

**053 Client Contracts → 054 Client Invoices & Payments → 055 Client Publishing & Distribution → 056 Client Reports & Downloads → 057 Client Renewal / Continuation Workspace → … → 077 Client Access Recovery**

with the unchanged audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

and **no redesign, no extra screen, no skipping and no sequence change.**
