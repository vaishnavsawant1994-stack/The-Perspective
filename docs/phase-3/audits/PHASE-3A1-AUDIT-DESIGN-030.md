Confirmed. The exact frozen identity is now:

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 030 — Asset & File Library

This screen should become the **canonical cross-domain file and media-asset workspace for the Team Workspace**. It must not create separate upload/storage systems for Projects, Editorial, Magazine, Podcast, Video, Events, Clients, Contracts, or Publishing.

| Audit field                 | Classification                                                                                                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**               | **030**                                                                                                                                                                               |
| **Canonical name**          | **Asset & File Library**                                                                                                                                                              |
| **Product area**            | Files / Assets / Digital Asset Management                                                                                                                                             |
| **User surface**            | Team Workspace                                                                                                                                                                        |
| **Screen class**            | Cross-Domain Asset Library / File Management Workspace                                                                                                                                |
| **Classification**          | **Unique Anchor — Platform Asset & File Management Family**                                                                                                                           |
| **Primary purpose**         | Search, organize, preview, upload, version, classify, permission, reuse and manage files/assets across the complete platform                                                          |
| **Primary entity**          | **Asset / FileRecord**                                                                                                                                                                |
| **Core child entities**     | FileVersion, StorageObject, AssetMetadata, AssetUsageReference                                                                                                                        |
| **Supporting entities**     | Folder/Collection, Tag, UploadJob, ProcessingJob, User, Client, Project, EditorialProject, MagazineIssue, PodcastEpisode, VideoProject, EventOccurrence, ApprovalRequest, Publication |
| **Parent shell**            | `InternalAppShell` — Design 001                                                                                                                                                       |
| **Template family**         | `AssetLibraryWorkspaceTemplate`                                                                                                                                                       |
| **Composition**             | `GlobalAssetLibraryComposition`                                                                                                                                                       |
| **Auth**                    | Required                                                                                                                                                                              |
| **Permissions**             | File/asset access + contextual Project/Client/domain scope                                                                                                                            |
| **Implementation priority** | **Core / Critical Infrastructure**                                                                                                                                                    |
| **Reuse level**             | **Platform-wide / Maximum**                                                                                                                                                           |

---

# 1. Functional responsibility

Design 030 answers:

> **“What files and media exist across the organization, where did they come from, which version is authoritative, where are they being used, who may access them, and which assets are actually ready for production or publication?”**

The architecture becomes:

```text
Projects
Editorial
Magazine
Podcast
Video
Events
Clients
Contracts
Publishing
      │
      ↓
┌───────────────────────────────┐
│   CANONICAL ASSET SERVICE     │
│                               │
│ Asset / FileRecord            │
│ FileVersion                   │
│ StorageObject                 │
│ Metadata                      │
│ Usage References              │
│ Permissions                   │
└───────────────────────────────┘
      ↓
Design 030
Asset & File Library
```

The core rule is:

> **One platform-wide Asset/File domain; many contextual usages.**

---

# 2. File ≠ physical storage object

This is the first critical separation.

### FileRecord / Asset

Business-level platform record.

### StorageObject

Actual binary object stored in S3-compatible storage or another storage provider.

Conceptually:

```text
Asset
  ↓
FileVersion
  ↓
StorageObject
```

Do not make an S3 URL the entire file model.

---

# 3. Asset ≠ FileVersion

A logical Asset can evolve.

Example:

```text
Executive Headshot
│
├── v1 — original upload
├── v2 — retouched
└── v3 — approved final
```

Therefore:

```text
Asset
≠
FileVersion
```

The Asset represents the logical media/document.

The FileVersion represents one exact binary revision.

---

# 4. Never overwrite important files destructively

Incorrect:

```text
headshot.jpg
↓
upload replacement
↓
old file disappears
```

Correct:

```text
Asset: Executive Headshot
├── Version 1
├── Version 2
└── Version 3
```

This is especially important for files involved in:

* approvals,
* publication,
* Contracts,
* magazine proofs,
* Podcast edits,
* Video edits.

---

# 5. Approved version must remain identifiable

If:

```text
Cover PDF v3
APPROVED
```

and v4 is later uploaded:

```text
v3 remains approved
v4 remains new/unapproved
```

The Asset Library must never reinterpret “approved” as:

> whatever the latest upload is.

---

# 6. Original source ≠ derivative

A source Asset can generate derivatives.

Example:

```text
Original Video
├── review proxy
├── thumbnail
├── compressed preview
└── publication output
```

Similarly:

```text
Original Image
├── web crop
├── magazine crop
├── thumbnail
└── social crop
```

These need lineage.

---

# 7. Derivative lineage

Conceptually:

```text
Asset
├── parentAssetId?
├── sourceVersionId?
└── derivationType?
```

or an explicit Asset relationship.

The system should be able to answer:

> Which original file produced this derivative?

without relying on filenames.

---

# 8. File ≠ usage

A file can be used in multiple contexts.

Example:

```text
CEO Headshot
│
├── Client profile
├── Magazine Cover
├── Article
├── Podcast Artwork
└── Event Speaker Profile
```

Therefore usage belongs in relationships.

Do not copy the same binary separately into each product domain unless intentionally necessary.

---

# 9. AssetUsageReference

A reusable concept should exist:

```text
AssetUsageReference
├── asset/file version
├── domain type
├── related record
├── usage role
└── timestamps
```

Examples:

```text
MagazineIssue → Cover
VideoProject → Thumbnail
EventOccurrence → Speaker Headshot
PodcastEpisode → Artwork
```

This becomes extremely valuable for impact analysis.

---

# 10. Replace-file impact awareness

Suppose a Logo is used in:

```text
7 Projects
3 Publications
2 Client Portal pages
```

Replacing its master record should not silently mutate historical publications.

Historical outputs often need fixed-version references.

Correct:

```text
Current reusable Asset
       ↓
latest active version

Historical Publication
       ↓
exact version used
```

---

# 11. Folder ≠ Asset ownership

Folders are organizational presentation.

They should not become the fundamental data ownership system.

Example:

```text
Folder:
Client Assets / TechNova
```

is useful.

But deleting or moving the Folder should not silently destroy Project/Client relationships.

---

# 12. Folder ≠ permission automatically

Putting a file in:

> Private Contracts

can be useful for navigation, but access must still derive from canonical permission policy.

Do not rely exclusively on path naming for security.

---

# 13. Folder vs Collection

The architecture should allow a distinction if the approved product needs it:

### Folder

Manual hierarchy.

### Smart Collection / Saved View

Query-based grouping.

Example:

```text
All Client-Approved Images
```

may be a dynamic view rather than physical folder membership.

No extra design is being added; this is implementation normalization.

---

# 14. Tags ≠ folders

Tags support classification across hierarchies:

```text
headshot
approved
executive
magazine
2026
```

One Asset can have many Tags.

Do not create deeply nested directory trees merely to express every attribute.

---

# 15. Metadata must be structured

Useful canonical metadata may include:

```text
filename
display name
mime type
extension
size
dimensions
duration
checksum
created/uploaded timestamps
creator/uploader
source
rights metadata
version
processing state
```

plus domain-specific metadata where necessary.

Do not embed everything into one JSON blob without validation.

---

# 16. Human title ≠ storage filename

Example:

```text
Display Name:
Arjun Mehta — Approved Executive Portrait

Stored object:
8f1d...jpg
```

Business identity should not rely on original filenames such as:

```text
IMG_7864_FINAL_FINAL2.jpg
```

---

# 17. Duplicate file detection

Users may upload the same 20 MB image repeatedly.

The system should compute a content checksum where appropriate.

Conceptually:

```text
upload
 ↓
checksum
 ↓
exact binary already exists?
```

This can support deduplication or warnings.

But identical binary content does not necessarily mean identical business Asset context.

---

# 18. Duplicate binary ≠ duplicate Asset automatically

The same PDF might legitimately be attached to:

* Client record,
* Project,
* Approval.

Therefore binary deduplication should not blindly collapse business records.

Separate:

```text
Storage deduplication
```

from:

```text
Business Asset identity
```

---

# 19. File upload needs a real lifecycle

Uploading should not be:

```text
browser → DB URL
```

A robust conceptual lifecycle is:

```text
Upload Requested
      ↓
Uploading
      ↓
Stored
      ↓
Security Scan
      ↓
Metadata Extraction
      ↓
Preview/Processing
      ↓
Ready
```

with failure states.

---

# 20. Uploaded ≠ ready

A file can exist in storage but still be:

```text
SCANNING
PROCESSING
QUARANTINED
FAILED
```

Therefore:

```text
upload complete
≠
asset ready
```

This distinction matters for production workflows.

---

# 21. File security scanning

User uploads are untrusted input.

The backend should support appropriate scanning/validation before a file becomes generally usable.

Examples:

* malware scanning,
* MIME validation,
* file size validation,
* permitted extension checks.

A dangerous file should never simply become downloadable because its upload succeeded.

---

# 22. Quarantined ≠ deleted

If an uploaded file fails security validation:

```text
Asset record
   ↓
QUARANTINED
```

may be preferable to immediate silent deletion where audit/support needs exist.

It must not be available to ordinary users.

Exact retention policy belongs to Phase 3D/security design.

---

# 23. Image metadata extraction

For images, the processing layer can derive:

```text
width
height
format
orientation
```

and generate safe previews/thumbnails.

Production screens should consume these derived properties rather than repeatedly reading raw binaries.

---

# 24. Video/audio metadata extraction

For media:

```text
duration
codec
resolution
frame rate
audio channels
```

may be useful.

This metadata belongs to the file/media processing layer.

Podcast and Video should reuse it rather than each building their own metadata parser.

---

# 25. Document processing

Documents may require:

* preview generation,
* page count,
* safe text extraction,
* PDF thumbnailing.

Again:

```text
Asset Service
```

should provide common capabilities where appropriate.

---

# 26. File processing is asynchronous

Heavy operations should use background jobs:

```text
Upload
 ↓
ProcessingJob
 ├── scan
 ├── thumbnail
 ├── metadata
 ├── transcode
 └── preview
```

The user's browser should not have to stay open.

---

# 27. Processing jobs require idempotency

Retries must not generate:

```text
5 duplicate thumbnails
5 duplicate Asset records
```

for one upload.

Job handling must use idempotent operation keys or equivalent safeguards.

---

# 28. Processing failure must preserve original

Example:

```text
Original Video Asset       ✓
Preview generation         ✕
```

The original should remain intact.

The system can show:

> Preview unavailable — Retry processing.

Do not make users upload again unnecessarily.

---

# 29. Internal Asset ≠ Client-visible Asset

This is one of Design 030's most important security boundaries.

An Asset may be:

```text
INTERNAL_ONLY
```

or deliberately shared externally.

A Project association alone does **not** make it Client-visible.

---

# 30. Client-visible ≠ public

Another important distinction:

```text
Client-visible
≠
Public internet
```

A Client Portal Asset still requires authenticated/authorized access.

Only deliberately public publishing Assets should become public-facing.

---

# 31. Published asset ≠ source asset

A production team may have:

```text
PSD source
```

and:

```text
public JPG output
```

Only the publication artifact should normally be public.

The editable source remains protected.

---

# 32. Permission model

Potential Phase 3D capability dimensions:

```text
asset.read
asset.upload
asset.update_metadata
asset.create_version
asset.download
asset.share
asset.set_visibility
asset.archive
asset.delete
asset.restore
asset.export
```

Exact names come later.

Important:

```text
VIEW
≠
DOWNLOAD
≠
SHARE
≠
DELETE
```

---

# 33. Preview permission ≠ download permission

A user may be allowed to inspect an Asset in-app but not download the original source.

This may matter for:

* licensed media,
* sensitive Contracts,
* high-resolution production assets.

The backend needs separate access decisions where required.

---

# 34. Share permission ≠ visibility mutation

A user allowed to send an existing Client-visible Asset may not necessarily be allowed to reclassify an Internal Asset as Client-visible.

Those are distinct high-value operations.

---

# 35. Contextual access

Asset access can derive from:

* direct Asset permission,
* Project membership,
* Client/account relationship,
* domain role,
* folder/collection policy where supported.

The access service should evaluate those rules centrally.

Avoid scattered:

```ts
if (user.projectId === file.projectId)
```

logic.

---

# 36. Asset ACL ≠ Project permission entirely

Some Assets within the same Project can have different sensitivity.

Example:

```text
Project:
Personal Magazine

Assets:
✓ Approved client photos
✓ Final proof
✕ Internal editorial notes
✕ Finance spreadsheet
```

Therefore Project membership alone cannot automatically expose every Asset.

---

# 37. Rights / licensing metadata

Media publishing may require rights information.

Conceptually:

```text
AssetRights
├── source
├── owner/licensor
├── permitted use
├── expiration
├── territory where applicable
└── evidence/reference
```

Exact scope depends on the actual business.

The architecture should at least avoid assuming:

> uploaded = unrestricted publishing rights.

---

# 38. Rights state ≠ file processing state

Example:

```text
File:
READY

Usage Rights:
UNVERIFIED
```

The Asset can be technically valid but not yet safe for publication.

This distinction can feed Publication Readiness.

---

# 39. Approved Asset ≠ rights-cleared Asset

Likewise:

```text
Design Approval:
APPROVED

Rights:
EXPIRED
```

can theoretically coexist.

Approval and rights are different domains.

Publication gates should evaluate the relevant requirements.

---

# 40. Source/provenance

The system should preserve where an Asset came from:

```text
Client upload
Team upload
External integration
Generated derivative
Imported archive
```

and, where useful, source record/provider IDs.

This assists audit, debugging, and compliance.

---

# 41. File attachment ≠ Asset duplicate

When a Message, Project, Contact, or Contract “attaches” a file:

correct:

```text
Attachment
   ↓
Asset/FileVersion reference
```

not:

```text
copy binary again
```

unless isolation/retention policy specifically requires a copy.

---

# 42. Search must be server-side

Design 030 is a potentially very large library.

Search/filter should support canonical indexed metadata such as:

* name,
* type,
* uploader,
* Client,
* Project,
* product/workstream,
* tag,
* date,
* status.

Do not load 50,000 assets into the browser and filter client-side.

---

# 43. Search access must remain permission-scoped

A filename can itself reveal confidential information.

Therefore search results must apply:

```text
tenant
+
authorization
+
filters
```

before data is returned.

Do not search globally and remove unauthorized rows afterward.

---

# 44. Search ≠ Global Search duplication

Design 079 later provides Universal Search.

Correct relationship:

```text
Design 079
Global Search
    ↓
Asset result
    ↓
Design 030
Asset Library / Asset Detail context
```

Design 030 retains Asset-specific filtering and management.

---

# 45. List/Grid views share one dataset

The Asset Library may visually support:

```text
Grid
List
```

or similar representations.

These are presentations of the same Asset query.

Do not build independent APIs/storage for Grid and List.

---

# 46. Preview ≠ source download

The UI should normally use generated/safe previews where possible.

For example:

```text
Original PSD
↓
Preview JPG
```

The frontend should not download the 500 MB original merely to show a card thumbnail.

---

# 47. Secure download delivery

Private Asset downloads should use controlled access.

Conceptually:

```text
User requests Asset
      ↓
permission check
      ↓
short-lived signed access
```

not permanently public object URLs.

---

# 48. Cache safety

Private signed URLs and authorization-dependent Asset responses must be cached carefully.

Never allow a private Client/Project file response to be reused across unauthorized sessions.

---

# 49. Archive ≠ delete

A business Asset may no longer be actively used but should remain historically available.

```text
ACTIVE
→
ARCHIVED
```

is different from destructive deletion.

---

# 50. Delete ≠ binary immediately destroyed

Depending on retention requirements:

```text
Delete request
      ↓
soft deletion / retention
      ↓
eventual storage deletion
```

may be required.

Especially where the Asset is referenced by historical publications/Contracts, deletion policy must check dependencies.

---

# 51. Referenced Asset deletion protection

If an Asset Version is used by:

```text
Signed Contract
Published Magazine
Approved Video
```

ordinary deletion must not destroy the historical artifact.

The system should either:

* prohibit deletion,
* preserve immutable referenced version,
* or enforce retention rules.

Phase 3D will determine exact policy.

---

# 52. Published artifact immutability

Once a FileVersion becomes the exact artifact associated with a Publication, Contract execution, or Client approval:

it should normally become effectively immutable.

New corrections create new versions/artifacts.

Historical output remains reconstructable.

---

# 53. File status ≠ workflow status

An Asset can be:

```text
Processing State:
READY

Approval:
PENDING

Production Usage:
IN_USE
```

Do not create one giant `fileStatus` containing all concerns.

---

# 54. Current version vs approved version vs published version

These can differ.

Example:

```text
Latest Version: v6
Approved Version: v5
Published Version: v4
```

The system must be able to represent this safely.

This is a major platform-wide requirement.

---

# 55. Asset Library should expose usage context

A useful asset detail/read model can answer:

> Used in 4 Projects, 2 Publications, 1 Approval.

This helps users understand consequences before replacing/archiving something.

---

# 56. Asset activity

Meaningful events can include:

```text
Asset uploaded
New version created
Metadata updated
Asset shared with Client
Visibility changed
Approval requested
Version approved
Used in publication
Archived
Restored
```

Events should reference canonical records.

---

# 57. Activity ≠ audit

Human-readable:

> Emma uploaded Headshot v3.

Audit-grade:

```text
actor
asset/version
operation
timestamp
previous metadata
new metadata
authorization context
```

Sensitive operations need stronger auditing.

---

# 58. Audit-critical operations

Particularly important:

* visibility changes,
* Client sharing,
* deletion,
* restoration,
* rights/licensing changes,
* version replacement,
* security quarantine override,
* original download of sensitive files,
* mass export.

---

# 59. Bulk operations

The library may support safe bulk actions such as:

```text
tag
move
archive
assign visibility
download/export where allowed
```

But every bulk operation requires:

* permission checks per record,
* partial failure handling,
* backend execution.

Do not trust that one selected batch shares identical permissions.

---

# 60. Large bulk actions should use jobs

Examples:

* 2,000-file export,
* bulk processing,
* bulk archive,
* metadata import.

Use:

```text
BulkAssetJob
```

or generic job infrastructure.

Do not keep a browser request open for minutes.

---

# 61. Export ≠ view

As with Leads and Event registrants:

> **View Asset Library ≠ Export entire Asset Library.**

Mass export is a stronger permission because it can extract significant proprietary/client data.

---

# 62. Asset Library ≠ Project Files detail

Later:

**Design 114 — Project Files / Deliverables Detail**

will create significant implementation overlap.

Expected relationship:

```text
Canonical Asset/File Domain
         │
         ├── Design 030
         │   Global Team Asset Library
         │
         └── Design 114
             Project-scoped files/deliverables
```

One backend.

Two different operational contexts.

**DO NOT MERGE YET.**

---

# 63. Relationship to Client Portal file surfaces

Client Portal Designs may display:

* drafts,
* designs,
* proofs,
* deliverables.

These should consume the same canonical Assets/FileVersions through client-safe queries.

There must not be:

```text
internal_files
client_files
```

as two unrelated storage domains.

Visibility/access relationships determine what appears externally.

---

# 64. Relationship to Editorial

Design 024 uses Assets for:

* Questionnaire attachments,
* research,
* Client images,
* Draft-related files.

Design 030 becomes the common Asset source.

Editorial should not implement its own generic upload subsystem.

---

# 65. Relationship to Magazine

Design 025 uses:

* photographs,
* logos,
* Cover files,
* Page layouts,
* Proofs,
* final PDFs.

Every artifact should reuse the Asset/FileVersion infrastructure.

Magazine-specific entities reference them.

---

# 66. Relationship to Podcast and Video

Designs 026–027 require:

* master recordings,
* edit versions,
* transcripts,
* captions,
* thumbnails,
* clips.

These are all powered by the same storage/metadata/processing foundation.

The Media domains add business-specific lineage.

---

# 67. Relationship to Event

Design 028 uses Assets for:

* speaker media,
* decks,
* Event graphics,
* photos,
* recordings,
* post-event outputs.

Again, no Event-only file backend.

---

# 68. Relationship to Proposal / Contract / Invoice

Designs 018–020 create document artifacts.

These can also use the shared Asset/File storage infrastructure, while their domain records preserve:

```text
exact issued/executed document version
```

The Asset Library should not own Contract or Invoice lifecycle.

---

# 69. Relationship to Publishing

Publishing should consume an exact:

```text
Asset/FileVersion
```

as the publication artifact/source.

It should never publish:

```text
latest file
```

ambiguously.

This ties Asset Versioning directly into publication integrity.

---

# 70. AssetLibraryWorkspaceTemplate

Design 030 establishes a reusable structural family:

```text
AssetLibraryWorkspace
├── LibraryHeader
├── Search
├── FilterBar
├── Saved Views
├── Folder/Collection Navigation
├── Grid/List View
├── AssetCard
├── FileTypeIndicator
├── Thumbnail/Preview
├── VersionBadge
├── ProcessingStatus
├── UsageIndicator
├── VisibilityIndicator
├── SelectionBar
└── AssetQuickView
```

These primitives can be reused by Project and Portal-specific libraries.

---

# 71. Asset Quick View

A quick-view drawer can safely provide:

```text
preview
metadata
version
uploader
usage
permissions/visibility
related Project/Client
activity
```

with links to the owning domain record.

It should not become a giant editor for every file type.

---

# 72. Specialized editors remain specialized

Design 030 can preview:

* video,
* audio,
* PDF,
* image.

But it should not become:

* Video editor,
* Magazine layout editor,
* Contract editor,
* Draft editor.

Those remain their domain workspaces.

---

# 73. Responsive — Desktop

The frozen Design 030 is a high-resolution Team Workspace screen, so desktop can support a productivity-rich layout:

```text
Asset Library Header
↓
Search / Filters / Upload
↓
Folder / Collection navigation
+
Grid / List
+
Selected Asset detail/preview
```

Dense asset browsing is appropriate on large screens.

---

# 74. Responsive — Tablet

Following Design 152:

* folder navigation can collapse into a drawer,
* Grid remains responsive,
* Asset detail uses a side sheet/full panel,
* filters become touch-friendly,
* previews remain prominent.

---

# 75. Responsive — Mobile

Following Design 151:

```text
Library Header
↓
Search
↓
Filter / Sort
↓
Asset Cards
↓
Open Asset
↓
Preview
↓
Metadata / Usage
↓
Allowed Actions
```

Folder trees should become navigable sheets rather than squeezed sidebars.

---

# 76. Mobile upload

Mobile should support practical uploads such as:

* image,
* document,
* recorded media,

where allowed.

Large professional production uploads may remain desktop-oriented, but the architecture should not artificially block ordinary mobile file capture.

---

# 77. State coverage

Design 030 inherits Design 150 and requires Asset-specific states including:

```text
Library Loading
Library Empty
No Search Results
Folder Empty
Upload Preparing
Uploading
Upload Paused/Interrupted if supported
Upload Failed
Security Scan Pending
Quarantined
Processing
Processing Failed
Preview Generating
Preview Unavailable
Ready
New Version Available
Permission Restricted
Asset Archived
Asset Missing
Storage Provider Unavailable
Partial Processing Failure
Bulk Operation Running
Bulk Operation Partially Failed
```

These should not become one giant `AssetStatus` enum.

---

# 78. Unknown ≠ empty

If Asset search/index service fails:

do not display:

> **No files found**

when truth is unknown.

If storage preview fails:

do not say:

> **File missing**

when only the preview service is unavailable.

Design 150 semantics apply throughout.

---

# 79. Concurrency

Two users can simultaneously:

```text
upload new version
change metadata
change visibility
add tag
attach Asset to Project
```

These operations should be domain commands with optimistic concurrency where relevant.

Avoid one giant Asset form saving stale state over unrelated changes.

---

# 80. Version race

Example:

```text
User A uploads v4
User B still sees v3 and uploads replacement
```

The backend must determine whether:

* B created v5,
* conflict requires reconciliation,

rather than overwriting v4 silently.

---

# 81. Client visibility race

Example:

```text
User A marks Asset INTERNAL_ONLY
User B simultaneously shares old state to Client
```

The sharing command must re-evaluate current visibility/permission before delivering access.

---

# 82. Backend read model

A useful library query/read composition:

```text
AssetLibraryView
├── scope context
├── folders/collections
├── Asset summaries
├── current versions
├── thumbnails/previews
├── file types
├── tags
├── processing states
├── visibility
├── usage counts
└── permission-aware actions
```

Asset detail can load deeper information separately.

---

# 83. Backend architecture

```text
Asset & File Library UI
          ↓
AssetQueryService
          ↓
Tenant + Permission Scope
          ↓
Canonical Asset Domain
          │
          ├── Asset / FileRecord
          ├── FileVersion
          ├── StorageObject
          ├── Metadata
          ├── Tags
          ├── Folder / Collection
          ├── Usage References
          └── Rights / Visibility
          │
          ├── Object Storage Adapter
          ├── Upload Service
          ├── Security Scanner
          ├── Media/Document Processor
          ├── Search Index
          ├── Job Queue
          ├── Activity / Audit
          └── Domain Relationship Services
```

---

# 84. Domain commands

Avoid generic:

```text
PATCH /files/:id
```

for every action.

Prefer explicit conceptual commands:

```text
createUpload()
finalizeUpload()
createFileVersion()
updateAssetMetadata()
addTag()
moveAsset()
setAssetVisibility()
attachAssetToRecord()
archiveAsset()
restoreAsset()
requestAssetDeletion()
generatePreview()
```

Sensitive actions can have stronger validation/audit.

---

# 85. Backend requirements

| Requirement                                  | Status                    |
| -------------------------------------------- | ------------------------- |
| Authentication                               | **Required**              |
| Tenant isolation                             | **Critical**              |
| Asset/File RBAC                              | **Critical**              |
| Canonical Asset/FileRecord                   | **Critical**              |
| FileVersion model                            | **Critical**              |
| StorageObject abstraction                    | **Critical**              |
| Signed/private access                        | **Critical**              |
| Asset usage relationships                    | **Critical**              |
| Project/Client/domain scoping                | **Critical**              |
| Folder/collection infrastructure             | **Required**              |
| Tags/metadata                                | **Required**              |
| Search/indexing                              | **Critical**              |
| Server-side filtering/pagination             | **Critical**              |
| Exact-version references                     | **Critical**              |
| Security/MIME validation                     | **Critical**              |
| Malware/file scanning                        | **Critical**              |
| Background processing jobs                   | **Critical**              |
| Image/media/document metadata extraction     | **Required**              |
| Preview/thumbnail generation                 | **Required**              |
| Checksum/dedup infrastructure                | **Required**              |
| Internal/client/public visibility separation | **Critical**              |
| Rights/licensing support where needed        | **Required architecture** |
| Version concurrency                          | **Critical**              |
| Bulk job infrastructure                      | **Required**              |
| Download/export controls                     | **Critical**              |
| Archive/delete/retention policy              | **Critical**              |
| Historical artifact protection               | **Critical**              |
| Activity history                             | **Required**              |
| Audit history                                | **Critical**              |
| Partial-service failure handling             | **Required**              |

---

# 86. Canonical Asset metrics

Later operational/reporting surfaces may need:

**Total Assets**
**Storage Used**
**Assets Added This Period**
**Processing Failures**
**Assets Awaiting Review**
**Client-Visible Assets**
**Published Assets**
**Archived Assets**

Any storage metric must distinguish, where relevant:

```text
logical Asset size
vs
version size
vs
physical stored bytes
```

to avoid misleading totals.

---

# 87. Main implementation risks

Design 030 exposes several major platform risks:

**URL-as-file architecture** — database stores only arbitrary URLs without canonical Asset identity.

**File/Version conflation** — replacement uploads destroy historical artifacts.

**Latest-version bug** — approvals/publications reference “latest” instead of exact versions.

**Storage/business-record conflation** — S3 object key treated as Asset identity.

**Usage duplication** — same Asset copied separately into every product domain.

**Folder/security conflation** — directory placement used as authorization.

**Project membership leakage** — every Project Asset automatically exposed to every Project user.

**Client-visible/public conflation** — authenticated Client Assets accidentally made public.

**Source/derivative conflation** — production outputs cannot trace their source.

**Upload/readiness conflation** — technically uploaded file considered safe and production-ready before scanning/processing.

**Rights/readiness conflation** — uploaded/approved Assets treated as legally cleared automatically.

**Preview/source-download conflation** — browser downloads enormous originals for simple previews.

**Delete/history conflict** — files referenced by signed Contracts or published content destructively removed.

**Export permission leakage** — ordinary viewers able to bulk exfiltrate Client data.

**Search leakage** — unauthorized filenames/metadata appear in results.

**Duplicate backend systems** — Editorial, Magazine, Podcast, Video, Event, Client Portal, and Project Files independently implement storage.

**Processing-job fragility** — failed thumbnails/transcodes cause original Asset loss.

**False empty state** — storage/search outage shown as “No files.”

No new visual screen is needed.

These are platform-infrastructure requirements.

# Design 030 Audit Verdict

## **PASS — PLATFORM ASSET & FILE MANAGEMENT ANCHOR**

**Domain directive:** **Asset ≠ FileVersion ≠ StorageObject ≠ UsageReference.**

**Platform directive:** One canonical Asset/File domain must support Projects, Clients, Editorial, Magazine, Podcast, Video, Events, Commercial Documents, Publishing and Portal surfaces.

**Version directive:** meaningful replacement creates a new `FileVersion`; approved/published/signed historical versions remain permanently identifiable.

**Storage directive:** object-storage provider IDs/URLs remain infrastructure metadata and never become the sole business identity of a File.

**Usage directive:** Assets attach to domain records through canonical usage/reference relationships rather than duplicate binary uploads.

**Derivative directive:** transformed images, Podcast clips, Video clips, previews and publication outputs preserve source-version lineage.

**Security directive:** uploads are untrusted until validated/scanned; private Assets use permission-controlled delivery rather than permanently public URLs.

**Visibility directive:** **Internal ≠ Client-visible ≠ Public.** These are explicit access dimensions.

**Permission directive:** view, preview/download, upload, version, metadata edit, share, visibility change, archive, delete and export remain separately enforceable.

**Rights directive:** technical readiness, approval state and usage-rights state remain independent concerns.

**Processing directive:** scan, metadata extraction, previews, transcoding and other heavy operations use asynchronous/idempotent processing jobs.

**Search directive:** Asset search/filtering is server-side, tenant-scoped and permission-filtered before results are returned.

**Retention directive:** archive, delete and physical storage destruction remain separate; historical/version-bound artifacts must be protected from destructive deletion.

**Performance directive:** thumbnails/previews, pagination, indexing and lazy detail loading prevent the library from downloading or loading complete source Assets unnecessarily.

**Reuse directive:** later Project Files, Client deliverables and Portal libraries must consume the same canonical Asset/File infrastructure.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE ASSET + FILE VERSION + STORAGE + PROCESSING + SEARCH + ACCESS INFRASTRUCTURE — DO NOT BUILD SEPARATE FILE SYSTEMS FOR PROJECTS, EDITORIAL, MAGAZINE, PODCAST, VIDEO, EVENT, CLIENT PORTAL, CONTRACTS OR PUBLISHING.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **30 / 153** |
| **PASS**                                   |                         **30** |
| **STANDARDIZE decisions**                  |                         **28** |
| **Potential implementation-overlap flags** |                         **21** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

We have now audited almost **20% of the complete 153-design system**:

**30 / 153 = 19.6% audited.**

### Cross-domain platform architecture after Design 030

```text
                    InternalAppShell
                           │
          ┌────────────────┴────────────────┐
          │                                 │
          ↓                                 ↓
 Product / Business Domains          Shared Platform Services
          │                                 │
   ┌──────┼──────┐               ┌──────────┼──────────┐
   ↓      ↓      ↓               ↓          ↓          ↓
Editorial Mag. Podcast         Approval     Asset     Workflow
Video    Event Projects        Domain       Domain     Engine
                              Design 029   Design 030
                                             │
                                             ├── Asset
                                             ├── FileVersion
                                             ├── Storage
                                             ├── Processing
                                             ├── Preview
                                             ├── Search
                                             ├── Permissions
                                             └── Usage
```

Two major platform-wide services are now formally established back-to-back:

```text
029 → CANONICAL APPROVAL INFRASTRUCTURE
030 → CANONICAL ASSET / FILE INFRASTRUCTURE
```

These will dramatically reduce duplication during implementation.

# Next Sequential Audit Target

## Phase 3A.1 — Design 031 Audit

For **Design 031**, we should again retrieve its **exact frozen identity from the approved 153-design inventory before auditing it**.

We should not infer it from the Asset Library or assume the next design is an Asset Detail, Tasks, Publishing, Distribution, Team, Calendar, or another shared platform workspace.

Once its exact frozen identity is confirmed, we continue with:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no guessing, no redesign, no additional screen and no sequence change.**

