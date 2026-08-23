Confirmed. These frozen identities are now locked for the next sequential audits:

* **Design 036 — Team / Employee Management**
* **Design 037 — Roles & Permissions Management**
* **Design 038 — Analytics Workspace**
* **Design 039 — Audit Logs**
* **Design 040 — System / Organization Settings**

We do **not** jump ahead. We audit **Design 036 only** now.

# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 036 — Team / Employee Management

| Audit field                      | Classification                                                                                                                                                  |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                    | **036**                                                                                                                                                         |
| **Canonical name**               | **Team / Employee Management**                                                                                                                                  |
| **Product area**                 | People / Workforce / Organization Administration                                                                                                                |
| **User surface**                 | Team Workspace                                                                                                                                                  |
| **Screen class**                 | Workforce Directory + Team Administration Workspace                                                                                                             |
| **Classification**               | **Unique Anchor — People & Workforce Management Family**                                                                                                        |
| **Primary purpose**              | Maintain the organization's internal people, teams, departments, memberships, operational availability and workforce context used throughout the Team Workspace |
| **Primary identity entity**      | **User / OrganizationMember**                                                                                                                                   |
| **Core organizational entities** | OrganizationMembership, EmployeeProfile/MemberProfile, Team, TeamMembership, Department                                                                         |
| **Supporting entities**          | RoleAssignment, ManagerRelationship, Skill/Capability, Availability/Capacity profile, ProjectMembership, TaskAssignment, Activity                               |
| **Parent shell**                 | `InternalAppShell` — Design 001                                                                                                                                 |
| **Template family**              | `PeopleManagementWorkspaceTemplate`                                                                                                                             |
| **Composition**                  | `TeamEmployeeManagementComposition`                                                                                                                             |
| **Auth**                         | Required                                                                                                                                                        |
| **Permissions**                  | People/team administration with strongly scoped HR/admin fields                                                                                                 |
| **Implementation priority**      | **Core / Critical Platform Administration**                                                                                                                     |
| **Reuse level**                  | **Platform-wide / Maximum**                                                                                                                                     |

The central rule is:

> **Person identity ≠ login account ≠ organization membership ≠ employee profile ≠ team membership ≠ role assignment.**

That distinction is the foundation of Design 036.

---

# 1. Functional responsibility

Design 036 should answer:

> **“Who belongs to this organization, what is each person's operational relationship to the company, which teams/departments are they part of, who manages what, what work are they currently responsible for, and which administrative actions are authorized?”**

Conceptually:

```text
Identity
   ↓
Organization Membership
   ↓
Employee / Member Profile
   │
   ├── Department
   ├── Team Memberships
   ├── Manager Relationship
   ├── Role Assignments
   ├── Skills / Capabilities
   ├── Availability / Capacity
   └── Work Relationships
         ├── Projects
         ├── Tasks
         ├── Approvals
         └── Meetings
```

Design 036 is therefore a **workforce-management composition over several canonical platform domains**, not a standalone HR database detached from authentication and permissions.

---

# 2. User ≠ Employee

A `User` normally represents a platform identity/account.

An Employee/Organization Member represents the person's relationship to one organization.

Correct:

```text
User
  ↓
OrganizationMembership
  ↓
EmployeeProfile / MemberProfile
```

This matters if one person can eventually belong to:

* more than one workspace,
* more than one organization,
* external portal contexts,
* different roles in different organizations.

Do not place all employment state directly on the global User record.

---

# 3. Person ≠ login account

A person can potentially exist before they activate a login.

Example:

```text
Employee invited
Account activation pending
```

Therefore:

```text
Employee / Membership
≠
Authenticated session
```

This supports controlled invitation/onboarding without inventing fake credentials.

---

# 4. OrganizationMembership is critical

A canonical membership should conceptually preserve:

```text
OrganizationMembership
├── organizationId
├── user/person reference
├── membership status
├── joinedAt
├── invitation/activation context
├── employment/member state
└── administrative metadata
```

Exact schema belongs to Phase 3D.

This membership is what establishes:

> This person belongs to this workspace/organization.

---

# 5. Organization membership ≠ Role

Being a member answers:

> Are you part of this organization?

Role answers:

> What authority do you have?

Therefore:

```text
OrganizationMembership
≠
RoleAssignment
```

Design 037 will own the deeper permission/role administration model.

Design 036 may display roles but must not create a second RBAC system.

---

# 6. Role ≠ job title

This is another critical distinction.

Example:

```text
Job Title:
Senior Editor

Security Role:
Editorial Manager
```

or:

```text
Job Title:
Account Director

Security Role:
Team Member
```

Job titles are organizational/people metadata.

Roles are authorization constructs.

Never infer platform permissions from a string such as:

```text
jobTitle = "Director"
```

---

# 7. Department ≠ Team

These should remain different organizational concepts.

### Department

Usually stable functional structure:

```text
Editorial
Sales
Finance
Production
```

### Team

Can be operational/cross-functional:

```text
Enterprise Accounts Team
Magazine Production Team
Leadership Events Team
```

A person might have:

```text
Department:
Editorial

Teams:
Executive Magazine
Client Alpha
```

Do not force Team and Department into one generic group with ambiguous semantics unless the product explicitly chooses that model in Phase 3D.

---

# 8. Team ≠ Project Team

A persistent organization Team differs from one Project's assigned members.

Correct:

```text
Organization Team
≠
ProjectMembership
```

Example:

```text
Team:
Video Production

Project:
TechNova CEO Film

Project members:
selected people from Video + Account Management
```

Design 112 later owns deeper Project resource assignment.

---

# 9. TeamMembership should be first-class

Conceptually:

```text
TeamMembership
├── teamId
├── memberId
├── team role/context
├── joinedAt
├── active state
└── history
```

Do not store:

```text
user.team = "Editorial"
```

as the entire architecture.

One employee may belong to multiple Teams.

---

# 10. Membership history matters

If an employee moves:

```text
Editorial Team
   ↓
Leadership Content Team
```

the system should preserve relevant history rather than rewriting the past.

This matters for:

* project attribution,
* workload analytics,
* audit,
* team-performance reporting.

---

# 11. Manager relationship ≠ security authority automatically

A person's manager may need broader visibility into work.

But:

```text
Manager
≠
automatic administrator
```

A reporting relationship must not automatically grant:

* Role administration,
* Finance access,
* organization settings access.

Permissions remain explicit through Design 037.

---

# 12. Manager relationship should be structured

Avoid only:

```text
employee.managerName = "Sarah"
```

Prefer canonical relationship:

```text
Member
  ↓
ManagerRelationship
  ↓
Manager Member
```

This supports organizational charts and manager-aware queries.

---

# 13. Manager history

If reporting lines change, the platform may need to preserve:

```text
previous manager
new manager
effective date
```

for meaningful historical interpretation.

Exact HR depth can remain appropriately limited; Design 036 does not need to become a full enterprise HRIS.

---

# 14. Design 036 is not a payroll system

The frozen screen is Team / Employee Management.

It should not automatically expand into:

* salary payroll,
* tax processing,
* benefits administration,
* leave compliance,
* employment-law document management.

Those are separate products unless explicitly included later.

Architecture should remain focused on what the media business platform needs operationally.

---

# 15. Employee profile

A safe operational profile may conceptually contain:

```text
EmployeeProfile
├── display name
├── profile image
├── job title
├── department
├── manager
├── location/timezone
├── work contact information
├── availability context
└── skills/capabilities
```

Sensitive personal HR data should be minimized and isolated if ever required.

---

# 16. Employee profile ≠ Contact CRM

Design 086 later owns Contact CRM.

An internal employee is not automatically the same domain as an external business Contact.

Correct separation:

```text
Organization Member
≠
CRM Contact
```

A person could theoretically be represented in both contexts, but the domains have different semantics and access rules.

Do not reuse Client/Lead CRM records as employee identities.

---

# 17. Employee email ≠ identity key

Email addresses can change.

Avoid making every relationship depend directly on:

```text
employee.email
```

Use stable internal IDs.

Email is an attribute/contact method, not a permanent relational key.

---

# 18. Invitation ≠ active membership

Conceptually:

```text
INVITED
→
ACTIVATED
```

should remain distinguishable.

A pending invited member should not count as an active employee in every operational metric.

---

# 19. Active ≠ available

An employee can be an active organization member but unavailable operationally.

Example:

```text
Membership:
ACTIVE

Availability:
OUT / UNAVAILABLE
```

or:

```text
Capacity:
FULLY_ALLOCATED
```

These dimensions remain separate.

---

# 20. Membership lifecycle ≠ employment/work availability

Do not combine:

```text
ACTIVE
BUSY
ON_LEAVE
OFFBOARDING
```

into one giant status enum.

At minimum, keep conceptually separate:

* Membership/access state,
* Employment/member state where needed,
* Operational availability,
* Capacity/workload.

---

# 21. Deactivate ≠ delete

When an employee leaves:

do not delete their identity/history.

Preserve:

* authored content,
* assignments,
* comments,
* approvals,
* activity,
* ownership history,
* Project participation.

Correct:

```text
Active Membership
↓
Deactivated / Offboarded
```

rather than destructive deletion.

---

# 22. Offboarding must preserve records

If:

```text
Emma leaves the company
```

then historical records still need:

> Approved by Emma Wilson

not:

> Approved by Deleted User.

This is essential across Audit, Approval, Project, and Reporting domains.

---

# 23. Deactivation should revoke future access

Although history remains, an offboarded/deactivated member should no longer authenticate/access the organization unless explicitly reactivated.

This becomes a high-value security command.

---

# 24. Deactivation ≠ reassignment

Deactivating an employee does not automatically solve ownership of:

* open Tasks,
* Deals,
* Projects,
* approvals,
* meetings.

The system may require explicit reassignment or an offboarding workflow.

Do not silently change every record to another user.

---

# 25. Open-work impact analysis

Before deactivation, the platform should be able to identify affected work:

```text
Assigned Tasks
Owned Deals
Active Projects
Pending Approvals
Upcoming Meetings
Publishing responsibilities
Distribution campaigns
```

This can be an operational read model; no new design is required.

---

# 26. Workload comes from canonical work domains

If Design 036 shows workload:

the numbers should derive from:

* Tasks — Design 034,
* Projects,
* approvals,
* relevant assignments,
* possibly capacity data.

Do not manually store:

```text
employee.workload = 78
```

with no source.

---

# 27. Workload ≠ performance

This is critical.

A person having many Tasks does not mean:

> high performance.

Likewise fewer Tasks does not imply low performance.

Design 036 should avoid turning operational allocation into employee ranking without clear methodology.

---

# 28. Capacity ≠ task count

Example:

```text
Person A:
5 large projects

Person B:
15 small tasks
```

Raw counts are not comparable workload measurements.

If capacity scoring exists, Phase 3D must define:

* working capacity,
* estimated effort,
* allocations,
* timeframe.

No decorative precision.

---

# 29. Capacity is time-bound

A statement such as:

```text
75% allocated
```

needs a period:

```text
This week
This month
Current active assignment window
```

Otherwise the number is ambiguous.

---

# 30. Skills ≠ permissions

Another mandatory separation:

```text
Skill:
Video Editing
```

does not grant:

```text
video.edit
```

Security permissions must still come from Design 037.

Skills help:

* staffing,
* filtering,
* capability discovery.

They never authorize protected actions.

---

# 31. Skills should be structured

If supported:

```text
Skill
      ↓
MemberSkill
      ↓
proficiency / evidence / context
```

rather than a single comma-separated text string.

Exact sophistication should remain proportional to the actual product.

---

# 32. Skills ≠ job titles

A Designer may know:

* Photoshop,
* InDesign,
* video editing.

A title does not fully express capability.

Likewise a skill does not determine a person's organizational title.

---

# 33. Organization Chart

The Organization Chart should be a projection over:

```text
OrganizationMembership
+
ManagerRelationship
+
Department/Team context
```

It should not be maintained as a separate disconnected tree.

Correct:

```text
People data
    ↓
Org chart projection
```

---

# 34. Org chart ≠ permission hierarchy

Reporting lines and authorization hierarchy can differ.

Example:

```text
Finance Administrator
```

may have strong Finance privileges while reporting to an Operations Director.

Do not derive RBAC from visual org-chart placement.

---

# 35. Department membership

A member can conceptually have:

```text
Primary Department
```

plus Teams/project assignments.

If multiple departments are allowed, Phase 3D should establish consistent cardinality.

Avoid different modules interpreting the same field differently.

---

# 36. Department owner/head ≠ security administrator

A Department Head may have management visibility within the department.

That does not automatically make them:

```text
Organization Admin
```

unless Role/Permission policy says so.

---

# 37. Team lead ≠ Project owner

A Team Lead may oversee:

```text
Video Production Team
```

while individual Video Projects have different Project Owners/Producers.

These relationships remain separate.

---

# 38. People directory

Design 036 should provide a canonical authorized directory over members.

Useful filters can include:

* Department,
* Team,
* Manager,
* status,
* location/timezone,
* skills,
* availability.

Search/filtering must be server-side at scale.

---

# 39. People search must be permission-scoped

The directory can contain organizational information not intended for all users.

At minimum:

```text
tenant scope
+
directory permission
+
field visibility
```

must be applied before results are returned.

---

# 40. Field-level sensitivity

Not every employee field needs the same visibility.

Example:

```text
Display Name        broadly visible
Department          broadly visible
Work Email          authorized users
Private HR fields   restricted administrators
```

Even if V1 only uses operational fields, architecture should not assume all employee metadata is universally visible.

---

# 41. Team directory ≠ user administration entirely

Design 036 concerns workforce/team management.

Authentication/security operations such as:

* MFA policy,
* SSO,
* password/security management,

belong to Identity/System administration rather than being embedded as arbitrary Employee fields.

---

# 42. Relationship to Design 037

This is the strongest immediate boundary.

### Design 036

**Who is in the organization and how are people organized?**

### Design 037

**What are they allowed to do?**

Correct:

```text
Employee / Membership
      ↓
RoleAssignment
      ↓
Role
      ↓
Permissions
```

Design 036 may display the assigned Role.

All mutation of RBAC policy should route through Design 037's canonical authorization system.

---

# 43. Employee Role display ≠ Role definition

For example:

```text
Emma
Role: Editor
```

can appear in Design 036.

But:

* editing Role permissions,
* creating Roles,
* changing policy,

belongs to Design 037.

No duplicate permission editor.

---

# 44. Relationship to Design 034

Design 034 supplies canonical Task work.

Design 036 can summarize:

```text
Open Tasks
Overdue Tasks
Assigned Tasks
```

for an employee.

Those are queries into Task domain—not copied counters permanently stored on Employee.

---

# 45. Relationship to Design 035

Calendar/Scheduling supplies:

* Meetings,
* schedule context,
* availability/free-busy where authorized.

Design 036 can summarize availability but should not create its own Calendar.

---

# 46. Relationship to Project 360

Project membership remains canonical project-domain data.

Design 036 can ask:

```text
Which active Projects is Sarah assigned to?
```

But it should not duplicate Project membership into an employee-owned JSON list.

---

# 47. Relationship to Design 112

Later:

**Design 112 — Project Team / Resource Assignment**

Expected architecture:

```text
Canonical User/Member/Team
       │
       ├── Design 036
       │   Organization workforce
       │
       └── Design 112
           Project-specific assignment
```

One workforce/member identity foundation.

Different operational scope.

---

# 48. Relationship to Design 137

Later:

**Design 137 — Team Performance / Workload Analytics**

This is another significant overlap checkpoint.

Design 036 may show simple operational workload snapshots.

Design 137 should own deeper analytical composition.

Both must consume:

```text
Tasks
Projects
Assignments
Capacity definitions
```

rather than parallel employee score databases.

---

# 49. Relationship to Design 144

Later:

**Design 144 — Role & Permission Administration**

This appears to strongly overlap Design 037, not Design 036.

Design 036 should therefore remain firmly focused on people/team organization and assignment context.

No permission administration creep.

---

# 50. Relationship to organization administration

Design 040 later owns:

**System / Organization Settings**

Organization profile/configuration belongs there.

Design 036 should not become:

* company settings,
* billing,
* API keys,
* system integrations.

---

# 51. Team creation

Conceptually:

```text
createTeam()
```

should create one reusable organization Team.

It should not automatically:

* grant permissions,
* create Project,
* create department,
* invite every listed person.

Those are separate commands/policies.

---

# 52. Team membership mutation

Use explicit operations such as:

```text
addMemberToTeam()
removeMemberFromTeam()
changeTeamLead()
```

with permission checks/history.

Avoid replacing an entire team membership array in one generic PATCH.

---

# 53. Department reassignment

Moving an employee between departments can affect:

* manager,
* team filters,
* analytics,
* organizational hierarchy.

This should be a deliberate business command with audit history where needed.

---

# 54. Changing department ≠ changing Role

Example:

```text
Editorial
→ Content Strategy
```

should not automatically change:

```text
Editor Role
```

unless explicit business policy says so.

Organizational structure and security remain decoupled.

---

# 55. Changing manager ≠ changing Team

Likewise:

```text
Manager changes
```

does not necessarily change:

* Department,
* Team,
* Role,
* Project assignment.

Avoid hidden cascading mutations.

---

# 56. Onboarding

If Design 036 includes employee onboarding context, keep it distinct from Client onboarding.

Conceptually:

```text
OrganizationMember
      ↓
EmployeeOnboarding
```

could track:

* account activation,
* Team assignment,
* Role assignment,
* initial setup.

But this should remain narrow workforce setup rather than a generic HR suite.

---

# 57. Employee onboarding ≠ authentication activation

Account activation is one onboarding requirement.

It is not the whole onboarding lifecycle.

Correct:

```text
Invite accepted
≠
Employee fully operational
```

---

# 58. Employee onboarding ≠ Client onboarding

Design 022:

```text
ClientOnboarding
```

Design 036:

```text
Employee/Member Onboarding
```

They may reuse generic checklist/workflow primitives but have separate domains and visibility rules.

---

# 59. Exit management

If the frozen screen includes exit/offboarding:

the architecture should coordinate:

```text
membership deactivation
+
access revocation
+
ownership reassignment review
+
asset/device/process requirements where supported
```

without deleting historical identity.

---

# 60. Exit completion ≠ deletion

Permanent invariant:

```text
Employee offboarded
→ identity/history retained
→ login/access disabled
```

Never:

```text
DELETE user
```

as the normal exit workflow.

---

# 61. People management permissions

Potential Phase 3D capability dimensions:

```text
people.read
people.create_invite
people.edit_profile
people.manage_department
people.manage_team
people.change_manager
people.deactivate_member
people.reactivate_member
people.view_workload
people.view_sensitive_fields
```

Exact names later.

Do **not** include Role permission editing here; that belongs to Design 037.

---

# 62. View directory ≠ manage employees

Important:

```text
people.read
≠
people.edit
≠
people.deactivate
```

Most team members may view colleagues.

Far fewer should administer memberships.

---

# 63. Team management ≠ employee deactivation

A Team Lead may manage Team assignments without being permitted to remove someone from the organization.

These are separate privileges.

---

# 64. Workload visibility

Managers may see Team workload.

Ordinary users may see only their own.

Permissions can conceptually scope:

```text
own
team
department
organization
```

without exposing all employee operational data universally.

---

# 65. Workload privacy

Workload summaries should be used for:

* allocation,
* operational planning,
* delivery risk.

They should not automatically become disciplinary/performance scores.

This is both a product-trust and data-quality requirement.

---

# 66. User invitations

A safe conceptual flow:

```text
Invite member
    ↓
Invitation record/token
    ↓
Recipient accepts
    ↓
Identity created/linked
    ↓
OrganizationMembership activated
```

Invitations require:

* expiration,
* one-time acceptance,
* correct organization binding,
* replay protection.

---

# 67. Invitation role assignment

If an invite preselects a Role:

the final activation transaction must still validate that the inviter is authorized to assign that Role.

Frontend-provided `roleId` cannot be trusted.

---

# 68. Duplicate membership protection

The system should prevent accidental:

```text
same user
+
same organization
+
two active memberships
```

unless a deliberate business model supports it.

Unique/index constraints should enforce canonical membership rules.

---

# 69. Email-change handling

Changing an employee's work email should not:

* create a second employee,
* break Task ownership,
* erase approvals,
* disconnect historical Project participation.

Stable IDs solve this.

---

# 70. Profile photo uses Asset infrastructure

Correct:

```text
EmployeeProfile
      ↓
ProfileAsset reference
      ↓
Design 030 Asset/File domain
```

No separate ad-hoc upload system.

---

# 71. Profile image privacy

Team profile images may be broadly visible internally.

But the Asset itself should still use the platform's permission/visibility model rather than becoming a permanently public URL by default.

---

# 72. Activity history

Relevant workforce activity can include:

```text
Member invited
Member activated
Profile updated
Department changed
Manager changed
Added to Team
Removed from Team
Team lead changed
Member deactivated
Member reactivated
```

These events reference canonical member/team records.

---

# 73. Activity ≠ Audit

Human-readable:

> Emma moved to Editorial.

Audit:

```text
actor
member
previous department
new department
timestamp
authorization context
```

High-impact administrative operations should have stronger audit coverage.

---

# 74. Design 039 relationship

Design 039 — Audit Logs will later surface these administrative audit events.

Design 036 should emit auditable domain events rather than maintain its own disconnected audit table.

---

# 75. Audit-critical people actions

Particularly important:

* member invitation,
* activation,
* deactivation/reactivation,
* Team changes,
* Department changes,
* manager changes,
* sensitive field changes,
* organization-membership changes.

Role/permission changes become even more sensitive in Design 037.

---

# 76. Concurrency

Example:

```text
Admin A:
moves Sarah to Editorial

Admin B:
moves Sarah to Video
```

The backend must use current revision/state.

Another:

```text
Admin A:
deactivates member

Manager B:
assigns new Task simultaneously
```

Assignment commands should re-check current membership eligibility.

---

# 77. Deactivation race

If deactivation and Role assignment occur simultaneously:

the canonical Membership state must decide whether assignment remains valid.

No operation should silently reactivate or preserve unauthorized future access.

---

# 78. Team membership concurrency

Two managers might add/remove the same person simultaneously.

Commands should be:

* idempotent where possible,
* constraint-protected,
* auditable.

---

# 79. Partial service failure

Example:

```text
People directory       ✓
Team memberships       ✓
Task workload          ✕
Calendar availability  ✓
Project assignments    ✓
```

Design 036 should remain usable.

Only workload analytics show unavailable/degraded state.

---

# 80. Unknown ≠ zero workload

If Task service is unavailable:

do not show:

```text
0 active tasks
```

as though the person has no work.

Show:

> Task workload unavailable.

This follows Design 150's global state contract.

---

# 81. Unknown ≠ available

If Calendar/availability service fails:

do not display:

> Available

because schedule state is unknown.

---

# 82. Restricted ≠ unavailable

If a user lacks permission to see someone else's workload:

show:

> Restricted

not:

> No work assigned.

Permission and missing data remain distinct.

---

# 83. Responsive — Desktop

Desktop can preserve the richest workforce-management composition:

```text
People Header
↓
Workforce summary
↓
Search / Filters
↓
Employee Directory
+
Department / Team navigation
↓
Selected Employee
↓
Role / Team / Manager / Workload / Projects
↓
Administrative Actions
```

Organization chart and skill/capacity views can use the available desktop width effectively.

---

# 84. Responsive — Tablet

Following Design 152:

* directory becomes compact,
* detail moves to a large side sheet,
* Department/Team navigation becomes collapsible,
* org chart uses pan/zoom or hierarchical drilldown,
* actions remain touch-safe.

---

# 85. Responsive — Mobile

Following Design 151, prioritize:

```text
People
↓
Search
↓
Employee Cards
↓
Employee Profile
↓
Job / Department / Manager
↓
Teams
↓
Current Work Summary
↓
Contact / Availability
↓
Allowed Admin Actions
```

Do not squeeze a wide org chart/table onto a phone.

---

# 86. Mobile organization chart

A mobile Org Chart should become hierarchical navigation:

```text
Executive
↓
Department
↓
Manager
↓
Members
```

rather than attempting to render an enormous desktop tree at miniature scale.

---

# 87. Accessibility

Employee directory and organization chart must not rely solely on:

* avatars,
* color,
* hover,
* drag-and-drop.

Names, roles, status, Department, and manager relationships require semantic text.

---

# 88. Search / filtering

A conceptual query service:

```text
PeopleQueryService.list({
  organization,
  search,
  department,
  team,
  manager,
  status,
  skill,
  availability
})
```

should operate server-side.

Never load the entire organization indefinitely and filter purely client-side.

---

# 89. Read model

A useful composed workforce view:

```text
TeamEmployeeManagementView
├── organization summary
├── member directory
├── departments
├── teams
├── manager relationships
├── Role display summaries
├── availability
├── workload summaries
├── active Project summaries
└── permission-aware actions
```

This is a read composition.

---

# 90. Do not PATCH the whole employee workspace

Avoid:

```text
PATCH /employee/:id
{
  department,
  team,
  role,
  manager,
  active,
  workload
}
```

because these fields belong to different domain relationships and permission levels.

Prefer explicit commands such as:

```text
updateMemberProfile()
changeMemberDepartment()
changeMemberManager()

createTeam()
addMemberToTeam()
removeMemberFromTeam()
changeTeamLead()

inviteOrganizationMember()
deactivateOrganizationMember()
reactivateOrganizationMember()
```

Role assignment should route to the Design 037 authorization domain.

---

# 91. Backend architecture

```text
Team / Employee Management UI
            ↓
PeopleQueryService
            ↓
Tenant + Permission Scope
            ↓
People / Organization Domain
            │
            ├── User / Identity Reference
            ├── OrganizationMembership
            ├── Employee / Member Profile
            ├── Department
            ├── Team
            ├── TeamMembership
            ├── ManagerRelationship
            └── Skill / Capability
            │
            ├── Identity / Auth Service
            ├── Role / Permission Service
            ├── Task Service
            ├── Project Service
            ├── Calendar / Availability
            ├── Asset/File Service
            └── Activity / Audit
```

---

# 92. Backend requirements

| Requirement                             | Status                                         |
| --------------------------------------- | ---------------------------------------------- |
| Authentication                          | **Required**                                   |
| Tenant/organization isolation           | **Critical**                                   |
| People-management RBAC                  | **Critical**                                   |
| Stable User/identity model              | **Critical**                                   |
| OrganizationMembership                  | **Critical**                                   |
| Employee/Member profile separation      | **Critical**                                   |
| Invitation/activation flow              | **Critical**                                   |
| Membership deactivation/reactivation    | **Critical**                                   |
| Historical identity preservation        | **Critical**                                   |
| Department model                        | **Required**                                   |
| Team model                              | **Critical**                                   |
| TeamMembership                          | **Critical**                                   |
| Manager relationships                   | **Required**                                   |
| Role display/integration                | **Critical**                                   |
| Role mutation delegated to Design 037   | **Critical**                                   |
| Skills/capabilities                     | **Required if frozen functionality uses them** |
| Workload projection                     | **Required**                                   |
| Task integration                        | **Critical**                                   |
| Project assignment integration          | **Critical**                                   |
| Calendar/availability integration       | **Required**                                   |
| Profile assets via Asset service        | **Required**                                   |
| Directory search/filtering              | **Critical**                                   |
| Field-level data visibility             | **Critical**                                   |
| Invitation uniqueness/replay protection | **Critical**                                   |
| Concurrency protection                  | **Critical**                                   |
| Deactivation/work-impact handling       | **Critical**                                   |
| Activity history                        | **Required**                                   |
| Audit events                            | **Critical**                                   |
| Partial-service failure handling        | **Required**                                   |

---

# 93. Canonical workforce metrics

Metrics needing clear definitions may include:

**Active Members**
**Pending Invitations**
**Teams**
**Departments**
**Members by Department**
**Members by Team**
**Open Tasks per Member**
**Overdue Tasks per Member**
**Active Projects per Member**
**Available Capacity**, only if methodology is defined.

Important:

> **Workload metrics are operational planning data, not automatic performance scores.**

---

# 94. Main implementation risks

Design 036 exposes several critical risks.

**User/Employee conflation**
Global authentication record overloaded with organization-specific HR/workforce data.

**Membership/Role conflation**
Being part of the company interpreted as having authorization.

**Job-title/Role conflation**
“Director” or “Editor” strings grant security permissions.

**Department/Team conflation**
Persistent organizational hierarchy and flexible operational teams lose meaning.

**Team/Project-team conflation**
Organization Teams become duplicated inside Projects.

**Manager/Admin conflation**
Reporting-line authority incorrectly grants security administration.

**Employee/CRM Contact conflation**
Internal workforce identity stored inside sales CRM.

**Email-as-identity**
Email changes break record ownership/history.

**Active/available conflation**
Active employee shown as free even when capacity is full.

**Workload/performance conflation**
Task count used to score employee performance.

**Skills/permissions conflation**
Skill tags grant system capabilities.

**Deactivation/deletion conflation**
Employee departure destroys approval, Project and audit history.

**Deactivation/reassignment conflation**
Ownership silently moved without review.

**Invitation/activation conflation**
Invited user counted as active/authorized prematurely.

**People/Role administration duplication**
Design 036 creates its own permission editor competing with Design 037.

**Workload duplication**
Task/Project numbers copied onto employee records and drift from canonical sources.

**Availability-zero assumption**
Calendar outage interpreted as employee availability.

**Mega-PATCH security leakage**
Low-privilege profile edit can accidentally change Team, Role or active membership.

**036/112/137 duplication**
Project resource and Team analytics later create separate employee identity models.

None requires a new design.

They require correct workforce-domain architecture.

# Design 036 Audit Verdict

## **PASS — PLATFORM PEOPLE & WORKFORCE MANAGEMENT ANCHOR**

**Identity directive:** **Person/User ≠ OrganizationMembership ≠ EmployeeProfile ≠ TeamMembership ≠ RoleAssignment.**

**Membership directive:** organization membership is the canonical record establishing that a person belongs to the workspace; invitation, activation and deactivation remain explicit lifecycle operations.

**History directive:** offboarding/deactivation preserves historical identity, ownership, approvals, activity and audit records; normal employee exit never deletes historical truth.

**Organization directive:** Departments, persistent Teams and Project-specific assignments remain separate organizational concepts.

**Role directive:** job title, manager relationship, Team lead and security Role are not interchangeable. Permission administration belongs to Design 037.

**Management directive:** manager reporting relationships do not automatically grant organization-admin privileges.

**Task directive:** workload summaries consume Design 034's canonical Task domain rather than storing duplicate employee task counts.

**Calendar directive:** availability consumes Design 035's scheduling infrastructure; unknown availability is never represented as free.

**Project directive:** Project membership remains Project-domain truth while Design 036 provides workforce-centric projections.

**Skills directive:** skills/capabilities support staffing and discovery but never directly grant authorization.

**Workload directive:** operational workload/capacity and employee performance remain separate concepts; any capacity percentage requires a defined, time-bounded methodology.

**Security directive:** employee/member fields can have different visibility levels; directory access never means access to sensitive personnel or administrative data.

**Command directive:** profile edits, Department changes, Team membership, manager relationships, membership activation/deactivation and Role assignment must be separate server-authoritative commands.

**Audit directive:** invitation, activation, deactivation, manager/Department/Team changes and later Role changes generate canonical audit events for Design 039.

**Responsive directive:** desktop supports dense directory/org structures, while mobile becomes search → employee → organization/work context rather than shrinking wide tables or charts.

**Overlap directive:** Designs **036, 037, 112, 137 and 144** must reuse the same stable User/OrganizationMembership/Team identity foundation while retaining different administrative and analytical responsibilities.

**Consolidation directive:** **STANDARDIZE ONE PLATFORM-WIDE USER + ORGANIZATION MEMBERSHIP + EMPLOYEE PROFILE + DEPARTMENT + TEAM + TEAM MEMBERSHIP + MANAGER RELATIONSHIP INFRASTRUCTURE — DO NOT BUILD SEPARATE PEOPLE MODELS FOR PROJECTS, TASKS, ANALYTICS, ROLES OR ADMINISTRATION.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                   **36 / 153** |
| **PASS**                                   |                         **36** |
| **STANDARDIZE decisions**                  |                         **34** |
| **Potential implementation-overlap flags** |                         **27** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**36 / 153 = 23.5% audited.**

### Platform administration foundation after Design 036

```text
                         ORGANIZATION
                              │
                    OrganizationMembership
                              │
             ┌────────────────┼────────────────┐
             ↓                ↓                ↓
        Employee Profile   Department        Teams
                                              │
                                       TeamMembership
             │                │                │
             └────────────────┼────────────────┘
                              ↓
                         Workforce
                              │
          ┌───────────────────┼────────────────────┐
          ↓                   ↓                    ↓
       Tasks 034         Calendar 035        Projects
          │                   │                    │
          └───────────────────┴────────────────────┘
                              ↓
                  Workload / Availability Views
```

And our platform-wide shared service layer now contains:

```text
029 → Approval
030 → Asset / File
031 → Publishing
032 → Distribution
033 → Reporting
034 → Task / Work
035 → Calendar / Scheduling
036 → People / Workforce
```

The next identities are now already frozen, so there is no identity-verification ambiguity for the next four steps:

### Next Sequential Audit

**Design 037 — Roles & Permissions Management**

Then, strictly in sequence:

**038 — Analytics Workspace**
**039 — Audit Logs**
**040 — System / Organization Settings**

For Design 037 we continue with exactly the same audit contract:

**classification → reuse → entities → permissions → states → responsive behavior → backend requirements → consolidation → implementation verdict**

with **no redesign, no additional screen and no sequence change.**

