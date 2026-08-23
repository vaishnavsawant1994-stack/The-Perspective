# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 112 — Project Team / Resource Assignment

Design 112 should become the **canonical Team Workspace Project staffing, project-role, resource-allocation, capacity-context, and assignment surface** for determining who is operationally participating in one Project, in what delivery role, for what period/capacity, and how that staffing relates to Tasks and workload.

It must build on the canonical Project foundation from Design 023, workforce identity foundation from Design 036, authorization foundation from Design 037, and runtime Task/Milestone model from Design 111.

No exact route is being invented or finalized during Phase 3A.1.

Its governing boundary is:

> **Project ≠ ProjectTeamMembership ≠ ProjectRoleAssignment ≠ ResourceAllocation ≠ TaskAssignment ≠ User ≠ OrganizationMembership ≠ EmployeeProfile ≠ Team ≠ RBACRole/Permission ≠ Availability ≠ Capacity ≠ Workload ≠ ScheduleEntry.**

The central implementation rule is:

> **Design 112 answers who is operationally staffed on a Project—not who the person is globally and not what security permissions they possess. User/OrganizationMembership/EmployeeProfile remain canonical identity/workforce records; ProjectTeamMembership expresses participation in this exact Project; ProjectRoleAssignment expresses an operational delivery role; ResourceAllocation expresses planned capacity/time commitment; TaskAssignment expresses responsibility for individual runtime work; and authorization remains server-resolved under Design 037. Staffing, capacity, workload, titles, project roles, and RBAC must never collapse into one mutable “team member” record.**

---

# 1. Classification

| Audit field                        | Classification                                                                                                                                                                                                         |
| ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                      | **112**                                                                                                                                                                                                                |
| **Canonical name**                 | **Project Team / Resource Assignment**                                                                                                                                                                                 |
| **Product area**                   | Team Workspace / Projects / Staffing & Resource Management                                                                                                                                                             |
| **User surface**                   | **Authenticated Team Workspace**                                                                                                                                                                                       |
| **Screen class**                   | Project Detail Variant / Staffing / Resource Allocation Workspace                                                                                                                                                      |
| **Classification**                 | **Canonical Project Team Membership, Delivery-Role & Resource-Allocation Anchor**                                                                                                                                      |
| **Primary purpose**                | Staff one Project with authorized workforce resources, assign operational Project roles, understand planned allocation/capacity, and support downstream Task assignment without conflating staffing with authorization |
| **Primary parent**                 | **Project** — Design 023                                                                                                                                                                                               |
| **Workforce identity**             | **User / OrganizationMembership / EmployeeProfile** — Design 036                                                                                                                                                       |
| **Project participation relation** | **ProjectTeamMembership**                                                                                                                                                                                              |
| **Operational role relation**      | **ProjectRoleAssignment**                                                                                                                                                                                              |
| **Capacity relation**              | **ResourceAllocation**                                                                                                                                                                                                 |
| **Task responsibility**            | **TaskAssignment** — Design 111 / Design 034                                                                                                                                                                           |
| **Organization Team dependency**   | canonical Team / TeamMembership from Design 036                                                                                                                                                                        |
| **Authorization dependency**       | Design 037                                                                                                                                                                                                             |
| **Schedule dependency**            | Design 035 where availability scheduling is relevant                                                                                                                                                                   |
| **Workload analytics dependency**  | upcoming Design 137                                                                                                                                                                                                    |
| **Project intake dependency**      | Design 108 for initial staffing defaults                                                                                                                                                                               |
| **Template dependency**            | Designs 109–110 for reusable assignment rules/defaults only                                                                                                                                                            |
| **Primary query service**          | `ProjectResourceAssignmentQueryService`                                                                                                                                                                                |
| **Project-team service**           | `ProjectTeamService`                                                                                                                                                                                                   |
| **Resource-allocation service**    | `ProjectResourceAllocationService`                                                                                                                                                                                     |
| **Capacity resolver**              | `ResourceCapacityResolver`                                                                                                                                                                                             |
| **Workload resolver**              | `ResourceWorkloadResolver`                                                                                                                                                                                             |
| **Authorization resolver**         | canonical server-side authorization layer from Design 037                                                                                                                                                              |
| **Parent shell**                   | `InternalAppShell` — Design 001                                                                                                                                                                                        |
| **Auth**                           | Required                                                                                                                                                                                                               |
| **Authorization**                  | Active OrganizationMembership + Project staffing/resource permissions                                                                                                                                                  |
| **Implementation priority**        | **Critical Staffing Integrity / Capacity Accuracy / Authorization Separation**                                                                                                                                         |
| **Reuse level**                    | **Extremely High across Tasks, Timeline, Workload Analytics, Project Operations and Team Management**                                                                                                                  |

Design 112 should answer:

> **“Who is actually staffed on this Project, which canonical workforce identity does each person represent, what delivery role do they have, what capacity has been allocated to this Project and during which period, what workload already competes for that capacity, and which staffing changes are allowed—without treating job titles, Task assignment, or Project participation as security roles?”**

Canonical composition:

```text
Organization
    │
    ├── User
    │     ↓
    │ OrganizationMembership
    │     ↓
    │ EmployeeProfile
    │
    └── Team / TeamMembership

              ↓ eligible workforce

Project PR-100
    │
    ├── ProjectTeamMembership
    │        │
    │        ├── ProjectRoleAssignment
    │        └── ResourceAllocation
    │
    ├── Task
    │     └── TaskAssignment
    │
    └── Workload / Capacity projections

Authorization
    remains independently
    server-resolved.
```

---

# 2. Reuse

## Design 036 remains canonical workforce identity

Design 036 already established:

> **User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment.**

Design 112 must reuse those exact identities.

Do not create:

```text
ProjectUser
ProjectEmployee
ProjectPerson
ProjectResourcePerson
```

as duplicated people.

Correct:

```text
User U-10
   ↓
OrganizationMembership OM-10
   ↓
EmployeeProfile EP-10
   ↓
ProjectTeamMembership PTM-50
```

---

## User ≠ ProjectTeamMembership

Critical.

`User` is the stable authentication/person account.

`ProjectTeamMembership` means:

> this organizational member participates in Project PR-100.

One User can participate in many Projects.

---

## OrganizationMembership is the tenant boundary

Project staffing should normally reference the person's active OrganizationMembership/workforce identity rather than global `User.id` alone.

This ensures:

* tenant membership exists,
* deactivation is respected,
* cross-organization assignment is prevented.

---

## EmployeeProfile ≠ Project participation

A person can be an active employee but not belong to a particular Project.

---

## TeamMembership ≠ ProjectTeamMembership

Permanent.

Example:

```text
Employee Alex
Organization Team = Editorial

Project PR-100
Project role = Lead Editor
```

Being in the Editorial organizational Team does not automatically mean Alex is staffed on every editorial Project.

---

## ProjectTeamMembership ≠ TaskAssignment

Critical.

A Project team member may have:

* zero Tasks,
* many Tasks.

A Task may be assigned according to policy to someone staffed on the Project.

But individual work responsibility remains a separate relation.

---

## Design 111 remains Task Assignment authority

Correct:

```text
ProjectTeamMembership
      ↓ establishes operational participation

Task T-100
      ↓
TaskAssignment
      ↓ establishes responsibility for T-100
```

Do not store Task responsibility directly in the Project Team record.

---

## Initial staffing from Design 108 must converge here

If Project Intake selects:

* Project owner,
* initial editor,
* designer,

those selections must call the same canonical staffing services used by Design 112.

No separate:

```text
project.initialTeam[]
```

that later diverges from Project Team state.

---

## Template assignment rules ≠ actual assignments

Design 110 may contain rules such as:

> Assign Project Editor role.

That is reusable configuration.

At runtime:

```text
AssignmentRule
     ↓ resolve
ProjectRoleAssignment
```

The template itself does not contain a live person assignment.

---

## Project Role ≠ Organizational Job Title

Critical.

Examples:

```text
EmployeeProfile.jobTitle = Senior Editor
```

while on one Project:

```text
ProjectRole = Interview Lead
```

and another:

```text
ProjectRole = Copy Reviewer
```

The Project role is contextual.

---

## Project Role ≠ RBAC Role

Absolute.

`Lead Editor` as a delivery role does not automatically equal:

```text
ADMIN
EDITOR_PERMISSION_SET
```

in Design 037.

Any access effect must come through explicit policy.

---

## Design 037 remains authorization authority

A ProjectTeamMembership can be an **input** to Project-scoped authorization if the platform explicitly defines such policy.

But:

```text
ProjectTeamMembership
≠
Permission
```

and:

```text
ProjectRoleAssignment
≠
RBAC RoleAssignment
```

---

## Design 137 will consume workload/capacity data

Design 112 establishes canonical staffing/allocation facts.

Design 137 later summarizes:

* workload,
* utilization,
* performance.

It must not create another ResourceAllocation model.

---

## Design 035 remains calendar/scheduling projection

Availability or allocation periods may appear on Calendar/Timeline.

But `ScheduleEntry` remains a projection.

It is not ProjectTeamMembership or ResourceAllocation.

---

# 3. Entities

## ProjectTeamMembership

This should be the stable Project ↔ workforce participation relation.

Conceptually:

```text
ProjectTeamMembership
├── id
├── organizationId
├── projectId
├── organizationMembershipId
├── lifecycle
├── joinedAt
├── leftAt?
├── source
├── createdBy
└── revision
```

Exact physical schema belongs to Phase 3D.

---

## ProjectTeamMembership ≠ User

Permanent.

---

## ProjectTeamMembership ≠ EmployeeProfile

Permanent.

---

## One workforce member can have many Project memberships

Correct:

```text
Employee EP-10
├── Project PR-100 → PTM-1
├── Project PR-200 → PTM-2
└── Project PR-300 → PTM-3
```

---

## Duplicate active Project membership should normally be prevented

For one:

```text
projectId + organizationMembershipId
```

there should generally be one active ProjectTeamMembership unless the final domain explicitly needs parallel membership contexts.

Different Project roles should live under that membership rather than duplicate the membership.

---

## Remove from Project ≠ delete identity

Critical.

Removing Alex from PR-100:

* does not deactivate User,
* does not terminate OrganizationMembership,
* does not delete EmployeeProfile,
* does not remove Alex from organization Teams.

---

## Historical membership remains evidence

If Alex worked on PR-100 for two months and then left:

preserve:

```text
joinedAt
leftAt
historical assignments/allocations
```

rather than deleting the row.

---

## ProjectRoleAssignment

Represents operational responsibility within this exact Project.

Conceptually:

```text
ProjectRoleAssignment
├── id
├── projectTeamMembershipId
├── projectRoleDefinitionId / role key
├── effectiveFrom
├── effectiveTo?
├── assignment source
└── revision
```

---

## ProjectRoleAssignment ≠ RBAC RoleAssignment

Absolute.

This is one of Design 112's strongest boundaries.

Example:

```text
Project role:
Design Lead

RBAC role:
Team Member

These can coexist.
```

---

## Project role may be many-to-one or many-per-member

A team member may have:

* one primary delivery role,
* several contextual roles,

depending on final frozen product semantics.

Architecture should not unnecessarily hard-code one role per person.

---

## ProjectRoleDefinition

If Project roles are configurable:

```text
ProjectRoleDefinition
├── stable key
├── label
├── operational meaning
└── assignment constraints
```

It remains distinct from security Roles.

If the frozen system uses fixed role enums, Phase 3D may simplify it.

---

## Role label ≠ role identity

Renaming:

> Design Lead

to:

> Creative Lead

must not break historical assignments.

---

## ResourceAllocation

Represents planned commitment of a resource to this Project.

Conceptually:

```text
ResourceAllocation
├── id
├── projectTeamMembershipId
├── projectId
├── allocationStart
├── allocationEnd
├── allocationAmount / percentage / units
├── allocationBasis
├── source
├── createdAt
└── revision
```

Exact representation belongs to Phase 3D.

---

## ResourceAllocation ≠ ProjectTeamMembership

Critical.

A person can be on a Project team while:

```text
current allocation = 0%
```

for a future/paused period.

Likewise their allocation can change over time without creating another Project membership.

---

## ResourceAllocation ≠ TaskAssignment

Permanent.

Allocated:

> 40% to PR-100

does not mean:

> automatically responsible for 40% of Tasks.

---

## Allocation ≠ actual time spent

Critical.

Planned allocation:

> 20 hours this week.

Actual recorded work/time, if the platform later tracks it, is a different fact.

Do not treat allocation as time tracking.

---

## Allocation ≠ utilization

Utilization is derived from capacity/allocation/actuals under analytics policy.

---

## Allocation amount needs a defined basis

Possible supported basis might be:

* percentage of capacity,
* planned hours,
* FTE fraction.

Do not mix:

```text
50
```

without knowing whether it means:

* 50%,
* 50 hours.

Use typed units/basis.

---

## Allocation period matters

Correct:

```text
Aug 1–15 → 25%
Aug 16–31 → 60%
```

not one permanent mutable:

```text
projectAllocation = 60
```

if the product needs scheduling over time.

---

## Allocation history must survive edits

Changing next month's allocation should not rewrite last month's plan.

Use temporal/versioned allocation semantics where necessary.

---

## Capacity

Capacity is not a Project-owned mutable field.

Conceptually:

```text
ResourceCapacity
=
work schedule
- non-working time
- organizational constraints
```

according to future workforce policy.

Design 112 consumes a capacity resolver.

---

## Capacity ≠ availability

Important.

### Capacity

How much working capacity exists.

### Availability

How much uncommitted usable capacity remains for the requested period.

Conceptually:

```text
Availability
=
Capacity
-
other allocations
-
other governed commitments
```

---

## Availability ≠ permission to assign

A person can be available but not eligible/authorized for this Project.

---

## Capacity ≠ workload

Workload may include:

* Project allocations,
* Tasks,
* deadlines,
* active Projects.

It is a projection.

---

## Workload

`ResourceWorkload` should be derived.

Conceptually:

```text
ResourceWorkload
├── active Projects
├── planned allocation
├── open Tasks
├── overdue work
├── upcoming milestones
├── calculatedAt
└── source freshness
```

Do not store one manually editable:

```text
workload = HIGH
```

as source truth.

---

## Workload ≠ performance

Critical for future Design 137.

A person can be heavily loaded and performing well.

High workload is not poor performance.

---

## Overallocated

Derived condition.

Conceptually:

```text
sum(valid planned allocations)
>
available capacity
```

under the canonical period/unit rules.

---

## Overallocated ≠ assignment invalid universally

Business policy may:

* block it,
* warn,
* require override.

Do not hard-code either behavior without policy.

---

## Allocation warning ≠ RBAC denial

Permanent.

---

## TaskAssignment

Canonical responsibility relation for one Task.

Conceptually:

```text
TaskAssignment
├── taskId
├── assignee membership/resource
├── assignedAt
├── assignedBy
└── historical state
```

It remains Design 111/034 runtime work state.

---

## TaskAssignment ≠ ResourceAllocation

Example:

```text
Alex allocated 40% to PR-100

Tasks assigned:
T1
T2
T3
```

Those are separate facts.

---

## Project Owner

If the Project has an Owner concept:

> owner ≠ ProjectTeamMembership ≠ ProjectRoleAssignment ≠ authorization role

The owner may be represented through a designated Project role/relationship, but semantics should remain explicit.

---

## Project owner ≠ manager hierarchy

Design 036's organizational Manager relationship remains separate.

---

## Team

Organizational Team remains Design 036.

If Design 112 allows assigning a Team as a resource, it should resolve team participation to explicit Project staffing rules rather than copying the entire organizational Team as a magic authorization group.

Do not invent this if absent from the frozen design.

---

# 4. Permissions

Design 112 should conceptually distinguish:

```text
project.read

projectTeam.read
projectTeam.addMember
projectTeam.removeMember

projectRole.read
projectRole.assign

resourceAllocation.read
resourceAllocation.manage

resourceCapacity.read
resourceWorkload.read

taskAssignment.read
taskAssignment.manage
```

Exact permission names belong to Phase 3D.

---

## Project read ≠ Project Team management

Permanent.

---

## Task assignment ≠ Project staffing permission

Critical.

A user may be allowed to assign Tasks among existing team members without being allowed to add/remove people from the Project.

---

## Add Project member ≠ assign security Role

Absolute.

---

## Assign Project role ≠ assign RBAC Role

Absolute.

---

## ResourceAllocation manage ≠ Task manage

Permanent.

---

## Capacity read may be sensitive

A Project manager may see enough availability to staff the Project without receiving unrelated HR/private employee information.

---

## Workload access ≠ performance-management access

Critical.

Design 112 should expose only staffing-relevant workload data authorized for the current user.

---

## EmployeeProfile access ≠ Project assignment authority

Permanent.

---

## Organization administrator ≠ automatically Project staffing operator

Depends on permissions; do not infer from title.

---

## Project owner ≠ unrestricted resource administration

Permanent.

---

## Manager ≠ security authority

Design 036 invariant remains.

---

## Assignment candidate search must be permission-safe

Searching available resources must not expose unauthorized:

* HR data,
* private calendars,
* unrelated Project names,
* confidential workloads.

Return safe staffing projections.

---

## Browser cannot submit arbitrary User ID

Server must validate:

1. User/OrganizationMembership exists;
2. membership is active;
3. same tenant;
4. eligible for Project staffing;
5. actor can assign;
6. no conflicting active membership rule.

---

## Browser-selected Project Role validated

Cannot submit an arbitrary role ID from:

* another tenant,
* another role family,
* RBAC role table.

---

## Removing Project member requires dependency checks

Before removal, server should consider canonical dependencies such as:

* open TaskAssignments,
* Project ownership,
* required delivery roles,
* active allocations.

Exact policy belongs to Phase 3D.

---

## Removal cannot silently orphan Tasks

Critical.

If Alex owns open Tasks:

the remove operation must either:

* reject until reassigned,
* invoke explicit reassignment workflow,
* leave Tasks unassigned under allowed policy,

but never make responsibility disappear invisibly.

---

## Direct ProjectTeamMembership ID reauthorizes

Permanent.

---

## Direct ResourceAllocation ID reauthorizes

Permanent.

---

## Cross-tenant staffing prohibited

Absolute.

---

## Staffing cannot reactivate deactivated membership

If OrganizationMembership is inactive:

Project assignment cannot bypass that status.

---

# 5. States

Design 112 must keep **Project membership lifecycle, Project role assignment, resource-allocation state, workforce membership state, availability, workload, Task assignment and authorization** separate.

### Project team membership

Conceptually:

```text
Active
Scheduled / Future
Inactive / Removed
Historical
```

### Resource allocation

```text
Planned
Active
Ended
Cancelled
Conflict / Needs Attention
```

### Capacity/availability

```text
Available
Partially Available
Fully Allocated
Overallocated
Unavailable
Unknown
```

### Workforce status

Comes from canonical OrganizationMembership/EmployeeProfile and remains distinct.

### Role state

```text
Active
Scheduled
Ended
```

where temporal roles are supported.

These must never collapse into one generic `member.status`.

---

## Project member Active ≠ employee active globally

Both must be true independently.

---

## OrganizationMembership deactivated ≠ Project membership deleted

Critical.

Historical Project participation remains.

Current operational eligibility should resolve inactive appropriately.

---

## Project member removed ≠ User deleted

Absolute.

---

## Future allocation ≠ currently allocated

Permanent.

---

## Allocation ended ≠ Project membership removed

Permanent.

The person may remain on the Project for review/advisory work.

---

## Fully allocated ≠ unavailable universally

Depends on allocation/capacity policy.

But it must not be interpreted as “not a valid user.”

---

## Overallocated ≠ Task overdue

Permanent.

---

## Overallocated ≠ performance problem

Permanent.

---

## No Tasks assigned ≠ not Project member

Permanent.

---

## Project role ended ≠ Project membership ended necessarily

Permanent.

---

## TaskAssignment removed ≠ Project membership removed

Permanent.

---

## Project membership active ≠ Project permission automatically granted

Critical.

Authorization resolver remains separate.

---

## Capacity service unavailable ≠ zero capacity

Absolute.

---

## Workload service unavailable ≠ no workload

Absolute.

---

## Employee directory unavailable ≠ no eligible resources

Critical.

Do not duplicate/add arbitrary workforce records as fallback.

---

## State Coverage

Design 112 inherits Design 150 plus:

```text
Project Team Loading
Project Team Available
Project Team Empty
Project Team Restricted
Project Team Partial

Project Member Active
Project Member Future / Scheduled
Project Member Removed
Project Member Historical

Project Role Active
Project Role Scheduled
Project Role Ended

Allocation Planned
Allocation Active
Allocation Ended
Allocation Cancelled
Allocation Conflict
Allocation Needs Attention

Resource Available
Resource Partially Available
Resource Fully Allocated
Resource Overallocated
Resource Unavailable
Resource Availability Unknown

Capacity Available
Capacity Restricted
Capacity Unavailable

Workload Available
Workload Restricted
Workload Unavailable
Workload Stale

Organization Membership Active
Organization Membership Inactive
Organization Membership Unavailable

Open Task Assignments Exist
No Open Task Assignments
Task Assignment Data Unavailable

Required Project Role Satisfied
Required Project Role Missing
Required Role Evaluation Unknown

Project Staffing Updated Elsewhere
Allocation Updated Elsewhere
Workforce Membership Updated Elsewhere
Project Team Conflict

Partial Resource Detail Available
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize **who, role, commitment, and capacity context**.

Conceptually:

```text
Project Team
↓
Team member
   ├── canonical person
   ├── operational Project role
   ├── allocation
   ├── allocation period
   ├── availability/capacity
   ├── open Task responsibility summary
   └── frozen-design actions
```

Only elements present in frozen Design 112 should render.

---

## Project Role and job title should not be visually conflated

Correct:

> Maya Singh
> Job title: Senior Editor
> Project role: Editorial Lead

Not:

> Role: Senior Editor

if that label ambiguously implies Project/security role.

---

## Allocation and workload should remain distinct

Correct:

> Project allocation: 40%
> Total planned allocation: 85%
> Open tasks: 7

Not:

> Workload: 40%.

---

## Capacity warnings should explain the period

Example:

> 110% allocated for Aug 24–30

rather than permanently labeling the person:

> Overallocated.

---

## Security roles should not appear as project staffing roles

If RBAC information appears anywhere, it must be explicitly labeled separately.

Do not mix:

> Admin

into a dropdown intended for:

> Writer / Editor / Designer.

---

## Removal should make consequences visible

If frozen Design 112 has remove/reassign actions:

> 4 open Tasks currently assigned

should be considered before removal.

Do not silently orphan work.

---

## Tablet

Following Design 152:

* member identity and Project role remain primary,
* allocation/workload stack,
* capacity warnings remain visible,
* Task summary can collapse,
* staffing actions remain touch-safe.

---

## Mobile

Priority:

```text
Team member
↓
Project role
↓
Current allocation
↓
Availability / capacity
↓
Open work summary
↓
Assignment actions
```

Do not compress workforce data into a wide spreadsheet.

---

## Mobile resource selection

If frozen design includes adding resources:

candidate cards should be able to communicate:

> Alex Morgan
> Senior Editor
> Available 30% next week
> Currently on 3 Projects

without exposing unauthorized underlying Project/client details.

---

## Accessibility

A staffing row could communicate:

> Alex Morgan, Senior Editor. Project role Editorial Lead. Allocated 40 percent to this Project from August 20 through September 15. Total planned utilization during this period is 85 percent. Seven open Tasks are currently assigned.

where authorized canonical data supports it.

---

# 7. Backend Requirements

## Canonical resource-assignment architecture

```text
Design 112
    ↓
Authenticated Workspace Context
    ↓
ProjectResourceAssignmentQueryService
    │
    ├── ProjectAdapter
    ├── OrganizationMembershipAdapter
    ├── EmployeeProfileAdapter
    ├── ProjectTeamMembershipAdapter
    ├── ProjectRoleAssignmentAdapter
    ├── ResourceAllocationAdapter
    ├── TaskAssignmentAdapter
    ├── CapacityResolver
    └── WorkloadResolver
    ↓
ProjectResourceAssignmentView
```

Mutations remain typed staffing/allocation commands.

---

## Do not use User directly as the only staffing reference

Prefer canonical tenant-scoped workforce context such as:

```text
organizationMembershipId
```

with EmployeeProfile enrichment.

This prevents assigning a User who has no active membership in the organization.

---

## Add Project member command

Conceptually:

```text
addProjectTeamMember(
    projectId,
    organizationMembershipId,
    initialProjectRole?,
    initialAllocation?,
    expectedProjectRevision,
    idempotencyKey
)
```

should:

1. authenticate/authorize;
2. load Project;
3. verify active OrganizationMembership;
4. verify same tenant;
5. validate staffing eligibility;
6. detect existing active ProjectTeamMembership;
7. create/reuse membership idempotently;
8. create approved ProjectRoleAssignment;
9. create approved ResourceAllocation if supplied;
10. emit Audit/outbox.

---

## Membership creation idempotency

Repeated add request must not create duplicate active memberships.

Database uniqueness is preferable to frontend-only checking.

---

## Concurrent assignment

If two managers add Alex simultaneously:

both should converge to the same ProjectTeamMembership under the appropriate uniqueness rule.

---

## Existing member is not an error necessarily

Safe result:

> Already on Project — existing membership returned.

---

## Project role assignment command

Conceptually:

```text
assignProjectRole(
    projectTeamMembershipId,
    projectRoleDefinitionId,
    effectivePeriod,
    expectedMembershipRevision,
    idempotencyKey
)
```

must validate:

* member belongs to Project,
* role belongs to correct tenant/project role registry,
* role is operational rather than RBAC,
* period constraints,
* duplicate/overlap policy.

---

## Project role changes preserve history

Correct:

```text
Aug 1–15  → Writer
Aug 16+   → Editorial Lead
```

rather than rewriting the original assignment if historical accountability matters.

---

## Role assignment must not call RBAC role APIs automatically

Absolute.

Only an explicit authorization policy, if designed, may derive scoped access separately.

---

## Authorization synchronization

If Project membership legitimately affects Project access:

preferred architecture:

```text
ProjectTeamMembership changed
        ↓
ProjectAccessPolicyResolver
        ↓
effective authorization
```

not:

```text
copy role name into RBAC role
```

---

## Removing member command

Conceptually:

```text
removeProjectTeamMember(
    projectTeamMembershipId,
    effectiveAt,
    reassignmentPlan?,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. revalidate active membership;
3. inspect open TaskAssignments;
4. inspect required Project roles;
5. inspect active allocations;
6. validate removal/reassignment policy;
7. end ProjectRoleAssignments;
8. end/cancel future allocations appropriately;
9. preserve history;
10. emit events/Audit.

---

## Remove ≠ DELETE

Critical.

Prefer temporal/end-state semantics.

Historical Project evidence must remain.

---

## Open Task handling

Removal should not simply:

```text
DELETE taskAssignments
```

without explicit reassignment/unassigned state.

Task history retains the previous assignee.

---

## Task reassignment remains TaskService

Design 112 may orchestrate required reassignments.

The actual Task mutation belongs to:

```text
TaskService.reassign(...)
```

not ProjectTeamService directly rewriting Task rows.

---

## Resource allocation command

Conceptually:

```text
setResourceAllocation(
    projectTeamMembershipId,
    start,
    end,
    amount,
    basis,
    expectedRevision,
    idempotencyKey
)
```

should:

1. authorize;
2. verify active/eligible member;
3. normalize timeframe/timezone;
4. validate allocation units;
5. load capacity;
6. detect overlap/conflicts;
7. apply warning/block/override policy;
8. preserve previous allocation history;
9. emit Audit/outbox.

---

## Allocation percentage uses fixed-point/decimal-safe arithmetic

If percent allocation exists:

avoid binary floating-point drift.

---

## Allocation cannot exceed defined bounds silently

For percentage basis:

individual allocation should obey allowed range.

Aggregate overallocation is a separate policy evaluation.

---

## Overlap handling

Multiple allocations to the **same Project** over the same period should not double-count accidentally.

Use:

* non-overlap constraints,
* explicit additive allocation semantics,

according to Phase 3D policy.

Do not depend on row order.

---

## Capacity resolver

Conceptually:

```text
ResourceCapacityResolver.resolve(
    organizationMembershipId,
    start,
    end
)
```

returns authorized staffing-safe data such as:

```text
nominal capacity
planned commitments
available capacity
freshness
```

---

## Capacity source

Potential inputs may include:

* work schedule,
* holidays/time off,
* other Project allocations,

according to the final workforce model.

Design 112 must not invent HR systems.

The important point is one centralized capacity resolver.

---

## Capacity unavailable fails safe

Do not assume:

```text
capacity = 100%
```

when the resolver fails.

Return:

> availability unknown.

---

## Workload resolver

Conceptually:

```text
ResourceWorkloadResolver.resolve(
    organizationMembershipId,
    period
)
```

may aggregate:

* active Project allocations,
* open Tasks,
* overdue Tasks,
* milestones/context.

---

## Workload ≠ performance score

Never calculate employee performance from workload in Design 112.

---

## Design 137 reuses same allocation facts

Future Team Performance / Workload Analytics must read:

```text
ProjectTeamMembership
ResourceAllocation
TaskAssignment
```

rather than its own staffing database.

---

## Initial Project staffing

Design 108 may call:

```text
ProjectTeamService
```

during Project creation.

If creation retries:

staffing initialization must be idempotent.

---

## Template assignment rules

If Workflow/ProjectTemplate says:

> required role: Editor

Project creation can call a resolver such as:

```text
ProjectStaffingRuleResolver
```

but the rule itself does not select arbitrary current employee without explicit deterministic policy/user confirmation where required.

---

## Required Project roles

If a Project requires particular delivery roles:

their satisfaction is a **staffing readiness projection**.

Conceptually:

```text
RequiredRoleEvaluation
├── role
├── satisfied
├── assignments
└── evaluatedAt
```

This is not authorization.

---

## Required role missing ≠ Project failed

Permanent.

It can block specific readiness/workflow gates according to policy.

---

## Task assignment

Conceptually:

```text
assignTask(
    taskId,
    organizationMembershipId,
    expectedTaskRevision
)
```

must validate Project context/staffing eligibility according to Task policy.

---

## Task assignment to non-Project member

Do not assume universally allowed or forbidden.

Safe default architecture:

* Project Task assignment validates membership/eligibility.
* If business allows external/cross-project specialists, this must be an explicit policy/path.

Do not silently auto-add users to the Project merely because a Task was assigned.

---

## Schedule integration

Resource allocation period may project into calendar/resource views.

Calendar does not own allocation.

---

## Project Timeline integration

Design 118 can consume staffing-related dates if frozen UI includes them.

Timeline edits cannot bypass ResourceAllocationService.

---

## Project risks integration

Design 113 may use resource/capacity issues as evidence for:

```text
ProjectRisk / ProjectBlocker
```

but `OVERALLOCATED` does not automatically create/delete a Risk unless explicit policy acts.

---

## Activity

Useful events:

```text
ProjectTeamMemberAdded
ProjectTeamMemberRemoved
ProjectRoleAssigned
ProjectRoleEnded
ResourceAllocationCreated
ResourceAllocationChanged
TaskReassigned
```

Activity remains projection.

---

## Audit

Material actions should capture:

* Project member add/remove,
* Project role changes,
* allocation creation/change,
* exceptional overallocation override,
* bulk staffing modifications.

---

## Notifications

Design 080 may notify:

* added to Project,
* staffing role changed,
* resource conflict,
* Task reassigned.

Notification read state never changes staffing/allocation.

---

## My Work

Design 078 remains driven by canonical TaskAssignments/actionability.

Being on Project Team does not automatically generate My Work items.

---

## Search

Design 079 may discover safe Project/team context.

Search results never determine:

* workforce eligibility,
* current capacity,
* permission.

---

## Caching

Project Resource Assignment caches should vary by:

```text
organizationMembershipId/current actor
projectId
authorizationRevision
projectRevision
projectTeamRevision
projectRoleRevision
allocationRevision
workforceMembershipRevision
capacityRevision/freshness
taskAssignmentRevision
```

---

## Availability caching needs period awareness

Capacity next week and capacity next month are different results.

Never cache one:

```text
available = true
```

globally for the person.

---

## Performance

Use:

* batched workforce summaries,
* indexed ProjectTeamMembership queries,
* period-based allocation aggregation,
* aggregate Task workload summaries,
* lazy detailed workload history.

Avoid loading every Task from every Project for each staffing candidate.

---

## Partial failure contract

Example:

```text
Project core            ✓
Project members         ✓
Roles                   ✓
Allocations             ✓
Capacity service        ✕
Task workload summary   ✓
```

Correct:

> Alex — Editorial Lead — 40% Project allocation — capacity currently unavailable.

Incorrect:

> Alex — 60% available.

Another:

```text
Employee directory      ✓
Task service            ✕
```

show:

> Open-task workload unavailable

not:

> 0 open Tasks.

---

## Backend Requirement Matrix

| Requirement                                            | Status                                      |
| ------------------------------------------------------ | ------------------------------------------- |
| Canonical Project reuse from 023                       | **Critical**                                |
| Design 036 workforce identity reuse                    | **Critical**                                |
| User/OrganizationMembership separation                 | **Critical**                                |
| OrganizationMembership/EmployeeProfile separation      | **Critical**                                |
| EmployeeProfile/ProjectTeamMembership separation       | **Critical**                                |
| TeamMembership/ProjectTeamMembership separation        | **Critical**                                |
| First-class ProjectTeamMembership                      | **Critical**                                |
| Duplicate active membership prevention                 | **Critical**                                |
| Historical membership retention                        | **Critical**                                |
| Removal/delete separation                              | **Critical**                                |
| ProjectTeamMembership/ProjectRoleAssignment separation | **Critical**                                |
| Project role/RBAC Role separation                      | **Critical**                                |
| Project role/job title separation                      | **Critical**                                |
| Project role history                                   | **Critical where temporal roles supported** |
| ProjectTeamMembership/ResourceAllocation separation    | **Critical**                                |
| ResourceAllocation/TaskAssignment separation           | **Critical**                                |
| Planned allocation/actual work separation              | **Critical**                                |
| Allocation/capacity separation                         | **Critical**                                |
| Capacity/availability separation                       | **Critical**                                |
| Workload/performance separation                        | **Critical**                                |
| Allocation basis/unit explicit                         | **Critical**                                |
| Allocation period explicit                             | **Critical**                                |
| Decimal-safe allocation percentages                    | **Critical if percentage-based**            |
| Overallocation centralized policy                      | **Critical**                                |
| Capacity resolver centralized                          | **Critical**                                |
| Availability unavailable/zero separation               | **Critical**                                |
| Workload unavailable/zero separation                   | **Critical**                                |
| Task assignment reuse from 034/111                     | **Critical**                                |
| Removal handles open Tasks safely                      | **Critical**                                |
| Task reassignment via TaskService                      | **Critical**                                |
| Initial Design 108 staffing convergence                | **Critical**                                |
| Template assignment-rule/runtime assignment separation | **Critical**                                |
| Design 037 authorization remains authoritative         | **Critical**                                |
| Assignment/authorization separation                    | **Critical**                                |
| Project membership/permission separation               | **Critical**                                |
| Active OrganizationMembership validation               | **Critical**                                |
| Deactivated workforce cannot be newly assigned         | **Critical**                                |
| Cross-tenant staffing prohibited                       | **Critical**                                |
| Cross-tenant role/allocation references prohibited     | **Critical**                                |
| Add-member idempotency                                 | **Critical**                                |
| Allocation mutation idempotency                        | **Critical**                                |
| Staffing concurrency protection                        | **Critical**                                |
| Period-aware allocation conflict detection             | **Critical**                                |
| Permission-safe candidate search                       | **Critical**                                |
| Sensitive capacity/workload field filtering            | **Critical**                                |
| Design 137 analytics reuse                             | **Critical architecture**                   |
| Design 118 timeline projection reuse                   | **Critical architecture**                   |
| Design 113 risk/blocker separation                     | **Critical architecture**                   |
| Audit/outbox integration                               | **Required**                                |
| Partial dependency failure handling                    | **Critical**                                |

---

# 8. Consolidation

Design 112 exposes a major risk of collapsing **identity, staffing, workload, and authorization** into one broad “Project member” concept.

**User / ProjectTeamMembership conflation**
Global account identity becomes Project participation.

**OrganizationMembership / ProjectTeamMembership conflation**
Tenant membership automatically means Project membership.

**EmployeeProfile / Project member conflation**
Every employee appears staffed on every Project.

**TeamMembership / ProjectTeamMembership conflation**
Organizational Team automatically populates Project Team.

**ProjectTeamMembership / TaskAssignment conflation**
Being staffed means owning every Task.

**TaskAssignment / Project membership conflation**
Assigning one Task silently adds someone to full Project Team.

**ProjectTeamMembership / ResourceAllocation conflation**
Membership requires permanent allocation percentage.

**ResourceAllocation / TaskAssignment conflation**
40% allocation becomes 40% of Tasks.

**ResourceAllocation / actual time conflation**
Plan becomes timesheet evidence.

**Allocation / utilization conflation**
Planned commitment becomes actual utilization metric.

**Allocation / workload conflation**
Percentage is treated as all workload.

**Workload / performance conflation**
Busy person appears low-performing.

**Capacity / availability conflation**
Working hours and remaining capacity become one number.

**Availability / eligibility conflation**
Free capacity means user is assignable regardless of tenant/skills/policy.

**Capacity unavailable / 100% capacity conflation**
Service outage creates false availability.

**Workload unavailable / zero workload conflation**
Candidate appears free when data failed.

**Project role / job title conflation**
“Senior Editor” becomes Project delivery responsibility.

**Project role / RBAC Role conflation**
“Project Lead” grants administrator rights.

**Project role / permission conflation**
Operational responsibility becomes security authority.

**Project owner / organization administrator conflation**
Project ownership grants global privileges.

**Project role / manager relationship conflation**
Delivery lead changes org reporting hierarchy.

**Manager / security authority conflation**
Design 036 invariant is broken.

**Assignment / authorization conflation**
Task assignee gains access to every Project resource.

**Project member / authorization grant conflation**
Staffing row itself becomes permission record.

**RBAC role / staffing role label conflation**
Identical labels create hidden privilege escalation.

**ProjectRoleAssignment / ProjectTeamMembership conflation**
Changing role recreates person membership.

**Role ended / membership ended conflation**
Person is removed unnecessarily.

**Member removed / User deactivated conflation**
Project staffing action disables account.

**Member removed / EmployeeProfile deleted conflation**
Historical workforce identity disappears.

**Member removed / org Team removal conflation**
Project-specific change alters organization structure.

**Member removal / TaskAssignment deletion conflation**
Open work becomes ownerless silently.

**Task reassignment / historical assignee rewrite conflation**
Cannot explain who previously owned work.

**Duplicate role / duplicate Project membership conflation**
Multiple roles create multiple membership rows.

**Project membership / Project lifecycle conflation**
Removing final member completes/cancels Project.

**Future allocation / current allocation conflation**
Scheduled commitment appears active today.

**Allocation period / permanent percentage conflation**
Historical/resource planning becomes inaccurate.

**Multiple allocation rows / accidental additive overlap conflation**
Person appears 160% allocated because periods overlap unintentionally.

**Overallocation / invalid employee conflation**
Capacity conflict becomes identity error.

**Overallocation / Task overdue conflation**
Capacity planning becomes execution state.

**Overallocation / ProjectBlocker conflation**
Every capacity warning creates formal blocker.

**Allocation ended / Project membership removed conflation**
Reviewer/advisor disappears from Project.

**No Tasks / no Project membership conflation**
Stakeholders without Tasks vanish.

**No allocation / no Project participation conflation**
Future/advisory members cannot exist.

**Task priority / resource priority conflation**
One urgent Task permanently marks person high priority.

**Project priority / individual workload conflation**
Project urgency overrides actual capacity calculations.

**Organizational Team / Project Team identity conflation**
Structural workforce grouping becomes temporary delivery staffing.

**Template assignment rule / live assignment conflation**
Workflow template permanently contains employee IDs.

**Template role / RBAC role conflation**
Delivery templates become permission provisioning.

**Current template / existing Project assignment conflation**
Template edits reassign active Projects.

**Design 108 initial team / separate staffing backend conflation**
Project Intake and Project Team disagree.

**Calendar availability / capacity source conflation**
Calendar UI becomes staffing database.

**ScheduleEntry / ResourceAllocation conflation**
Calendar projection becomes commitment record.

**Gantt positioning / allocation dates conflation**
Timeline drag edits staffing without canonical service.

**My Work / Project Team conflation**
Every Project member receives artificial work items.

**Analytics workload / canonical allocation conflation**
Design 137 computes/stores a second resource plan.

**Usage analytics / performance evaluation conflation**
Workload becomes employee scoring.

**Employee directory outage / no eligible resources conflation**
System encourages duplicate person creation.

**Candidate search / unrestricted HR access conflation**
Project manager can inspect private workforce information.

**Capacity visibility / calendar detail visibility conflation**
Safe availability summary leaks private events/time off.

**Project staffing / cross-tenant identity conflation**
User from another organization is assigned.

**Direct User ID / active membership conflation**
Global User exists but tenant membership does not.

**Inactive OrganizationMembership / assignable resource conflation**
Deactivated user returns through Project staffing.

**Browser-selected project role / security role conflation**
Request tampering escalates permissions.

**Removal by DELETE**
Historical staffing accountability disappears.

**Generic `project.members[]` JSON**
Roles, allocations, history and identity cannot be governed independently.

**Generic Project Team mega-PATCH**
One request adds members, assigns RBAC, changes Tasks and allocation simultaneously.

**112/036 duplicate workforce backend**
Project creates its own people identities.

**112/037 duplicate authorization backend**
Project role becomes security role.

**112/108 duplicate initial staffing state**
Intake and Project Detail disagree.

**112/111 duplicate Task assignment state**
Task assignees differ between Project work and team view.

**112/113 duplicate resource blocker state**
Capacity warning and ProjectBlocker merge.

**112/118 duplicate allocation scheduling state**
Gantt/calendar become independent staffing sources.

**112/137 duplicate workload/capacity truth**
Analytics recalculates from a separate staffing database.

No additional screen is required.

These are **Project participation identity, workforce reuse, operational roles, resource allocation, capacity/workload separation, Task-assignment reuse, authorization isolation, temporal staffing, concurrency, and historical-accountability requirements**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL PROJECT TEAM MEMBERSHIP, DELIVERY-ROLE & RESOURCE-ALLOCATION ANCHOR**

**Domain directive:**
**Project ≠ ProjectTeamMembership ≠ ProjectRoleAssignment ≠ ResourceAllocation ≠ TaskAssignment ≠ User ≠ OrganizationMembership ≠ EmployeeProfile ≠ Team ≠ RBACRole/Permission ≠ Availability ≠ Capacity ≠ Workload ≠ ScheduleEntry.**

**Identity directive:**
Design 036 remains authoritative for User, OrganizationMembership, EmployeeProfile, Team and workforce identity. Design 112 never creates Project-specific duplicate people.

**Tenant-membership directive:**
Project staffing references an authorized tenant-scoped OrganizationMembership/workforce identity rather than trusting global User identity alone.

**Project-membership directive:**
`ProjectTeamMembership` is the canonical Project participation relation. One workforce member may participate in many Projects while retaining one canonical workforce identity.

**Duplicate-membership directive:**
the same organizational member should not accidentally acquire multiple active ProjectTeamMembership rows merely because they hold several delivery roles or because an add request was retried.

**Historical-membership directive:**
Project participation is temporal/history-preserving. Removing a member ends the Project relationship; it does not delete the row, User, EmployeeProfile, OrganizationMembership or organizational Team history.

**Team directive:**
organizational TeamMembership and ProjectTeamMembership remain independently canonical. Belonging to the Editorial Team never automatically staffs a person onto every editorial Project.

**Project-role directive:**
`ProjectRoleAssignment` represents contextual delivery responsibility and remains separate from workforce job title, organization Team, manager hierarchy and RBAC RoleAssignment.

**Role-history directive:**
Project-role changes preserve effective periods/history where accountability requires it rather than overwriting the member's prior role.

**RBAC directive:**
Project roles are never security Roles merely because their labels resemble them. Design 037 remains the sole authorization authority.

**Access directive:**
ProjectTeamMembership may be an explicit input to a server-side Project access policy, but the membership itself is not a Permission. Any access effect must be deliberate, scoped and separately resolved.

**Assignment directive:**
TaskAssignment is responsibility for one Task and remains distinct from Project participation and Project role. Design 111/034 retain canonical Task ownership.

**No-auto-membership directive:**
assigning a Task must not silently create broad Project membership/access unless an explicit policy and canonical staffing operation intentionally do so.

**Removal directive:**
removing a Project member must inspect open TaskAssignments, required Project roles and active allocations. It cannot silently orphan work or erase assignment history.

**Task-reassignment directive:**
Task reassignment invokes canonical `TaskService`; Project Team management never directly rewrites Task state as a side effect.

**Allocation directive:**
`ResourceAllocation` represents planned Project commitment for a defined period/unit and remains separate from Project membership, Task assignment, actual time worked, utilization and performance.

**Allocation-unit directive:**
allocation values always carry a defined basis—percentage, planned hours or another explicit unit. Naked ambiguous numbers are prohibited.

**Temporal-allocation directive:**
resource allocation is period-aware. Future, current and ended commitments remain distinguishable, and changing future allocation cannot rewrite historical planning evidence.

**Capacity directive:**
one centralized `ResourceCapacityResolver` supplies safe staffing capacity context. Design 112 does not store duplicate employee capacity on Project rows.

**Availability directive:**
availability is derived from capacity minus governed commitments for the requested period. `Capacity`, `availability`, `allocation` and `workload` remain independent facts.

**Unknown-capacity directive:**
capacity/workload service failure results in `Unknown/Unavailable`, never assumed zero workload or full availability.

**Overallocation directive:**
over-allocation is a derived condition evaluated under one central policy. Whether it blocks, warns or requires an override is policy-driven rather than encoded in UI arithmetic.

**Workload directive:**
ResourceWorkload is a permission-safe projection over allocations, open work and relevant schedules. It does not become an employee performance score.

**Performance directive:**
future Design 137 must consume the exact staffing/allocation/task facts established here. It cannot create a parallel resource-allocation or Project-membership model.

**Initial-staffing directive:**
Design 108 initial Project staffing calls the exact same ProjectTeam/ResourceAllocation services used by Design 112, ensuring Project Intake and Project Detail cannot diverge.

**Template directive:**
Project/Workflow template assignment rules are reusable defaults only. Runtime ProjectRoleAssignments and ResourceAllocations are newly created canonical relations and never live inside the template.

**Required-role directive:**
if a Project requires particular operational roles, satisfaction is a derived staffing-readiness result—not an authorization role, Project lifecycle state, or browser-managed checkbox.

**Authorization directive:**
Project read, Project Team management, Task assignment, Project-role assignment, capacity viewing and allocation management remain independently server-authorized.

**Manager/title directive:**
organizational manager relationships and EmployeeProfile job titles never imply Project staffing or security authority.

**Candidate-search directive:**
staffing candidate discovery exposes only permission-safe workforce/capacity summaries. It must not leak private calendar events, HR data or unrelated Client/Project details.

**Deactivation directive:**
inactive/deactivated OrganizationMembership cannot be newly staffed simply because the underlying User still exists. Existing historical Project participation remains evidence.

**Tenant directive:**
Project, ProjectTeamMembership, OrganizationMembership, EmployeeProfile, ProjectRoleAssignment, ResourceAllocation and TaskAssignment references remain strictly tenant-scoped.

**Idempotency directive:**
Project member addition, role assignment, allocation creation/change and initialization from Project Intake are replay-safe. UI/network retries cannot duplicate memberships, roles or allocations.

**Concurrency directive:**
simultaneous staffing/resource updates use database uniqueness and expected-revision/transactional safeguards so parallel managers cannot silently create contradictory assignments or over-consume the same capacity.

**Allocation-conflict directive:**
overlapping allocation periods use explicit validation/additive policy. Accidental double counting from overlapping rows is prohibited.

**Schedule directive:**
Design 035/118 may visualize allocation/work dates, but ScheduleEntries/Gantt items remain projections. Mutations route to canonical Project Resource Allocation services.

**Risk directive:**
resource conflicts may contribute evidence to Design 113 risks/blockers, but an overallocated resource never automatically becomes a ProjectBlocker without explicit policy.

**My Work directive:**
Project membership alone does not create My Work items. Design 078 remains driven by canonical Tasks, FollowUps, Approvals and other actionable source records.

**Search directive:**
Design 079 can discover safe Project/member metadata but Search never decides eligibility, capacity, staffing identity or authorization.

**Caching directive:**
resource/staffing caches vary by membership authorization, Project/team/role/allocation/workforce revisions and time-window-specific capacity/workload freshness. A global cached `available=true` is prohibited.

**Partial-failure directive:**
Project membership, role, allocation, Task workload, capacity, employee-directory and authorization data may fail independently. `Unavailable` can never become `No work`, `100% available`, `Not a member`, or permission granted.

**Performance directive:**
use Project-scoped membership indexes, batched workforce summaries, period-aware allocation aggregation and workload summaries rather than loading complete Tasks/calendars for every candidate.

**Activity directive:**
Project Team/role/allocation changes may project into Project Activity but Activity never substitutes for staffing/allocation history.

**Audit directive:**
member addition/removal, Project-role changes, allocation modifications, exceptional capacity overrides and material reassignments produce actor/time/context-aware Audit evidence.

**Future-reuse directive:**
Design **113 — Project Risks / Blockers Workspace** must consume staffing/capacity problems only as potential evidence/context and must keep formal `ProjectRisk` / `ProjectBlocker` identities separate from `ResourceAllocation`, workload warnings and blocked Tasks.

**Overlap directive:**
Designs **023, 034–037, 078, 108–118, 137** must preserve one continuous **Workforce Identity → OrganizationMembership/EmployeeProfile → ProjectTeamMembership → ProjectRoleAssignment + ResourceAllocation → TaskAssignment → Timeline/Workload/Risk projections** lineage while keeping identity, organization structure, staffing, operational responsibility, capacity and authorization independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE PROJECT RESOURCE-ASSIGNMENT FOUNDATION — CANONICAL TENANT-SCOPED WORKFORCE IDENTITY + FIRST-CLASS TEMPORAL PROJECTTEAMMEMBERSHIP + DISTINCT OPERATIONAL PROJECTROLEASSIGNMENTS + PERIOD/UNIT-AWARE RESOURCEALLOCATIONS + SHARED CANONICAL TASKASSIGNMENTS + CENTRAL CAPACITY/AVAILABILITY/WORKLOAD RESOLVERS + SAFE MEMBER REMOVAL/REASSIGNMENT + IDEMPOTENT INITIAL/ONGOING STAFFING + STRICT RBAC SEPARATION — AND NEVER ALLOW JOB TITLES, ORGANIZATIONAL TEAMS, PROJECT ROLES, TASK ASSIGNMENT, ALLOCATION PERCENTAGES, WORKLOAD WARNINGS, TEMPLATE DEFAULTS OR PROJECT PARTICIPATION TO SUBSTITUTE FOR OR REWRITE USER IDENTITY, ORGANIZATION MEMBERSHIP, AUTHORIZATION, TASK HISTORY OR PROJECT DELIVERY TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **112 / 153** |
| **PASS**                                   |                        **112** |
| **STANDARDIZE decisions**                  |                        **110** |
| **Potential implementation-overlap flags** |                        **103** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**112 / 153 = 73.2% audited.**

### Canonical Project staffing architecture after Design 112

```text
USER U-10
   │
   ↓
OrganizationMembership OM-10
   │
   ↓
EmployeeProfile EP-10
   │
   ↓
ProjectTeamMembership PTM-100
   │
   ├── ProjectRoleAssignment
   │      “Editorial Lead”
   │
   └── ResourceAllocation
          40% · Aug 20–Sep 15

Project PR-100
   │
   └── Task T-100
          ↓
      TaskAssignment
          ↓
      OM-10 / PTM-100
```

The strongest staffing/security boundary is now explicit:

```text
Project Role:
Editorial Lead

        ≠

Employee Job Title:
Senior Editor

        ≠

RBAC Role:
Team Member / Admin / etc.

        ≠

Permission.
```

Allocation is also separate from actual work:

```text
Project allocation = 40%

Open Tasks = 7

Actual work/time spent = separate fact

Therefore:

40% allocation
≠
40% of Tasks
≠
40% Project progress
≠
40% utilization automatically.
```

Repeat staffing does not duplicate people:

```text
Alex / OM-10

PR-100 → ProjectTeamMembership PTM-1
PR-200 → ProjectTeamMembership PTM-2

Same workforce identity.
Different Project participation.
```

And removal remains non-destructive:

```text
Remove Alex from PR-100

RESULT:

ProjectTeamMembership → ended/historical
Project roles         → ended
future allocations    → ended/cancelled as policy requires

BUT:

User                    remains
OrganizationMembership  remains
EmployeeProfile         remains
historical Task records remain
organizational Team     remains
```

Finally:

```text
Project team member
        ≠
authorized for everything

Task assignee
        ≠
Project administrator

Project owner
        ≠
RBAC administrator

Overallocated
        ≠
poor performance
        ≠
Project blocker automatically
```

Each remains a separately governed canonical fact.

## Next Sequential Audit Target

### **Design 113 — Project Risks / Blockers Workspace**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
