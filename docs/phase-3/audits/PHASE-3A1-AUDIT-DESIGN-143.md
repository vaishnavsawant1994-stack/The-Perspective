# Phase 3A.1 — Master 153-Design Inventory Audit

## Design 143 — System Notifications / Alert Rules Management

Design 143 should become the **canonical Team Workspace system-alert definition, typed condition evaluation, alert occurrence, recipient-policy, notification orchestration, acknowledgement/suppression, deduplication, and delivery-policy management surface** built on the existing canonical Notification infrastructure established across **Designs 061, 064, and 080**.

Design 143 must **not create a second Notification system and must not become another Automation engine**.

Its purpose is to answer:

> **“Which operational/system conditions should create an alert, what exact governed rule detects them, how severe is the alert, who should be notified, through which supported channels, whether the alert has already fired for the same condition, whether notifications were successfully delivered, whether someone has acknowledged the alert, and whether the underlying source condition is actually resolved?”**

The most important boundary is:

> **AlertRule ≠ AlertRuleVersion ≠ AlertConditionDefinition ≠ AlertEvaluation ≠ AlertOccurrence ≠ AlertAcknowledgement ≠ Notification ≠ NotificationDeliveryAttempt ≠ OperationalAttentionItem ≠ AutomationRun ≠ Incident ≠ SourceDomainRecord.**

No exact route is being invented or finalized during Phase 3A.1.

The central implementation rule is:

> **Alert Rules observe canonical source-domain/analytics/operational conditions and create typed AlertOccurrences. They do not own or rewrite those source conditions. An AlertOccurrence may produce one or more canonical Notifications through the existing Notification infrastructure. Notification delivery, Notification read state, Alert acknowledgement, Alert suppression, and source-domain resolution are all independent facts. Alert conditions must use typed allowlisted rule semantics—never arbitrary SQL, JavaScript, raw database expressions, or frontend-only logic.**

---

# 1. Classification

| Audit field                                  | Classification                                                                                                                                                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Design ID**                                | **143**                                                                                                                                                                                                                       |
| **Canonical name**                           | **System Notifications / Alert Rules Management**                                                                                                                                                                             |
| **Product area**                             | Team Workspace / Platform / Alerts & Notifications                                                                                                                                                                            |
| **User surface**                             | **Authenticated Team Workspace**                                                                                                                                                                                              |
| **Screen class**                             | Alert Policy Administration / System Notification Management Workspace                                                                                                                                                        |
| **Classification**                           | **Canonical Alert Rule, Condition Evaluation, Alert Occurrence & Notification-Orchestration Anchor**                                                                                                                          |
| **Primary purpose**                          | Define governed alert conditions, detect qualifying source states/events, produce deduplicated AlertOccurrences, resolve recipients/channels, and orchestrate canonical Notifications without duplicating source-domain state |
| **Canonical Team Notification foundation**   | Design 080                                                                                                                                                                                                                    |
| **Canonical Client Notification foundation** | Designs 061 / 064                                                                                                                                                                                                             |
| **Operational condition dependency**         | Design 136                                                                                                                                                                                                                    |
| **Analytics dependency**                     | Designs 038 / 135 / 137                                                                                                                                                                                                       |
| **Automation dependency**                    | Designs 141–142                                                                                                                                                                                                               |
| **Integration dependency**                   | Designs 139–140                                                                                                                                                                                                               |
| **Audit dependency**                         | Designs 039 / 138                                                                                                                                                                                                             |
| **Incident boundary**                        | Design 147                                                                                                                                                                                                                    |
| **Source-domain dependencies**               | Tasks, Projects, Publishing, Distribution, Reporting, Integrations, Automation, Finance, etc.                                                                                                                                 |
| **Primary rule identity**                    | `AlertRule`                                                                                                                                                                                                                   |
| **Immutable rule revision**                  | `AlertRuleVersion`                                                                                                                                                                                                            |
| **Condition configuration**                  | `AlertConditionDefinition`                                                                                                                                                                                                    |
| **Evaluation identity/evidence**             | `AlertEvaluation`                                                                                                                                                                                                             |
| **Canonical alert instance**                 | `AlertOccurrence`                                                                                                                                                                                                             |
| **Alert-source relation**                    | `AlertSubjectReference`                                                                                                                                                                                                       |
| **Deduplication identity**                   | `AlertDeduplicationKey` / derived condition identity                                                                                                                                                                          |
| **Acknowledgement identity**                 | `AlertAcknowledgement` if frozen behavior supports acknowledgement                                                                                                                                                            |
| **Recipient configuration**                  | `AlertRecipientPolicy`                                                                                                                                                                                                        |
| **Channel policy**                           | `AlertNotificationPolicy`                                                                                                                                                                                                     |
| **Notification business identity**           | canonical `Notification`                                                                                                                                                                                                      |
| **Delivery execution**                       | `NotificationDeliveryAttempt`                                                                                                                                                                                                 |
| **Notification preference dependency**       | existing Notification Preferences infrastructure                                                                                                                                                                              |
| **Primary query service**                    | `AlertRulesQueryService`                                                                                                                                                                                                      |
| **Rule service**                             | `AlertRuleService`                                                                                                                                                                                                            |
| **Evaluation service**                       | `AlertEvaluationService`                                                                                                                                                                                                      |
| **Occurrence resolver**                      | `AlertOccurrenceResolver`                                                                                                                                                                                                     |
| **Deduplication service**                    | `AlertDeduplicationService`                                                                                                                                                                                                   |
| **Recipient resolver**                       | `AlertRecipientResolver`                                                                                                                                                                                                      |
| **Notification orchestrator**                | `SystemNotificationOrchestrator`                                                                                                                                                                                              |
| **Delivery adapter registry**                | canonical Notification delivery infrastructure                                                                                                                                                                                |
| **Parent shell**                             | `InternalAppShell` — Design 001                                                                                                                                                                                               |
| **Auth**                                     | Required                                                                                                                                                                                                                      |
| **Authorization**                            | Active OrganizationMembership + alert-rule/notification administration permissions                                                                                                                                            |
| **Implementation priority**                  | **Critical Alert Integrity / Notification Noise Control / Operational Safety**                                                                                                                                                |
| **Reuse level**                              | **Platform-wide across Operations, Automation, Integrations, Publishing, Distribution, Reporting, Security, Finance and Incident workflows**                                                                                  |

Design 143 should answer:

> **“Which rule is enabled, what exact condition does it monitor, against which canonical source scope, what severity does it assign, how often can it fire, how are duplicates suppressed, who receives Notifications, what has recently fired, and whether acknowledgement/delivery has occurred without falsely claiming that the underlying business condition is resolved?”**

Canonical architecture:

```text
Canonical Source Domains
        │
        ├── Tasks / Projects
        ├── Publishing
        ├── Distribution
        ├── Reporting
        ├── Integrations
        ├── Automation
        ├── Analytics
        └── Incidents / System state
                 │
                 ↓
        Typed Alert Condition
                 │
                 ↓
        AlertEvaluationService
                 │
          ┌──────┴──────┐
          ↓             ↓
       No Match        Match
                         │
                         ↓
                  AlertOccurrence
                         │
              ┌──────────┼───────────┐
              ↓          ↓           ↓
           Severity   Recipients   Dedup key
              │          │           │
              └──────────┼───────────┘
                         ↓
               Canonical Notification
                         │
                         ↓
              NotificationDeliveryAttempt
```

---

# 2. Reuse

## Existing Notification infrastructure remains canonical

Design 143 must not introduce:

```text
SystemAlertNotification
AlertMessage
OpsNotification
AutomationNotification
```

as parallel Notification business entities.

Correct:

```text
AlertOccurrence AO-20
       │
       ↓
Notification N-50
       │
       ├── Team Notifications Center — Design 080
       └── delivery channels
```

Client-safe Notifications continue through the existing Client Notification infrastructure where applicable.

---

## AlertRule ≠ Notification

Critical.

### AlertRule

> Detect this condition.

### Notification

> Deliver this information to this recipient.

One Rule may generate many AlertOccurrences.

One AlertOccurrence may create many Notifications.

---

## AlertRule ≠ AutomationDefinition

This is one of Design 143's strongest boundaries.

### Alert Rule

Observes a condition and raises an alert.

### Automation

Executes a sequence of actions.

Example:

```text
Alert Rule:
When AutomationRun requires reconciliation
→ alert Operations

        ≠

Automation:
When Deal becomes WON
→ create Project
→ send onboarding message
```

Do not make Alert Rules generic action workflows.

---

## AlertConditionDefinition ≠ Automation TriggerDefinition

They may share low-level safe expression primitives.

They remain semantically different.

Automation trigger:

> Should a workflow begin?

Alert condition:

> Should an operator/system alert exist?

---

## AlertOccurrence ≠ OperationalAttentionItem

Design 136 remains cross-domain operational attention.

Example:

```text
AutomationRun AR-20
requires reconciliation

→ OperationalAttentionItem
  because it requires action

→ AlertOccurrence
  because AlertRule says notify Ops
```

Same source condition.

Different projections/entities.

---

## AlertOccurrence ≠ Incident

Permanent.

An Alert may be evidence that leads to Incident creation.

It does not automatically become an Incident.

---

## AlertOccurrence ≠ source-domain condition

Critical.

If:

> Publication failed

then Publication remains canonical Publishing truth.

AlertOccurrence says:

> Rule matched that failure.

Acknowledging or deleting the alert must never mark Publication successful.

---

## Alert severity ≠ source severity

Possible distinction:

```text
Project Risk severity = HIGH
Alert notification severity = MEDIUM
```

depending on policy.

Do not overwrite source-domain severity.

---

## Alert priority ≠ Operational priority

Design 136 may rank operational attention using different business-impact logic.

Alert severity controls alerting/communication policy.

They are not interchangeable.

---

## Notification read ≠ Alert acknowledgement

Absolute.

A recipient can open/read a Notification without formally acknowledging the AlertOccurrence.

---

## Alert acknowledgement ≠ source resolution

Absolute.

---

## Alert suppression ≠ source resolution

Absolute.

---

## Rule disabled ≠ existing Alerts resolved

Permanent.

Disabling a rule stops future evaluation/emission according to policy.

It does not change historical occurrences.

---

## Notification preference ≠ AlertRule configuration

Critical.

### Alert Rule

Organization/system policy:

> Send an alert when a Publication remains failed.

### User preference

Personal delivery preference:

> Do not email me for normal alerts.

These remain separate.

---

## Mandatory system notifications

Where governance defines certain alerts as mandatory:

personal preference may not suppress the mandatory delivery class.

That policy must be explicit.

Do not invent mandatory classes arbitrarily.

---

## Design 080 remains Notification Center authority

Design 143 manages rules/policies.

Design 080 presents recipient Notifications.

No duplicate Notification inbox.

---

## Design 061 remains preference architecture for Client notifications

Any analogous internal preference infrastructure should use the same conceptual distinction:

```text
Alert policy
        ≠
Recipient preference
        ≠
Notification
        ≠
Delivery attempt
```

---

# 3. Entities

## AlertRule

Stable alert-policy identity.

Conceptually:

```text
AlertRule
├── id
├── organizationId
├── name
├── ruleType
├── lifecycle
├── currentPublishedVersionId?
├── createdBy
├── createdAt
└── revision
```

---

## AlertRule lifecycle

Conceptually:

```text
Draft
Active
Paused
Archived
```

Exact states belong to Phase 3D.

---

## Paused ≠ deleted

Permanent.

---

## Archived ≠ historical AlertOccurrences deleted

Absolute.

---

## AlertRuleVersion

Published versions should be immutable once evaluations/occurrences depend on them.

Conceptually:

```text
AlertRuleVersion
├── id
├── alertRuleId
├── versionNumber
├── conditionDefinition
├── sourceScope
├── severityPolicy
├── recipientPolicy
├── notificationPolicy
├── deduplicationPolicy
├── cooldownPolicy?
├── publishedAt
└── schemaVersion
```

---

## Rule version pinning

Every AlertOccurrence should identify:

```text
alertRuleVersionId
```

that generated it.

If v4 fires today and v5 is published tomorrow:

historical AO-20 remains v4.

---

## Rule update ≠ historical reclassification automatically

Absolute.

---

## AlertConditionDefinition

Typed condition configuration.

Examples conceptually:

```text
AutomationRun.state = NEEDS_RECONCILIATION
```

or:

```text
Integration health = DEGRADED
for longer than threshold
```

or:

```text
MetricDefinition M-20
crosses governed threshold
```

only where frozen/product rules support those condition families.

---

## ConditionDefinition ≠ arbitrary query

Absolute.

No:

```text
SELECT ...
```

No:

```text
eval("...")
```

No raw DB column names.

---

## Typed condition DSL

Use allowlisted semantic fields/operators.

Conceptually:

```text
AND
├── sourceType = AUTOMATION_RUN
├── state = NEEDS_RECONCILIATION
└── age > 15 minutes
```

or equivalent typed AST.

---

## Condition field registry

Strongly recommended:

```text
AlertConditionFieldDefinition
```

can define:

* source type;
* semantic field;
* data type;
* allowed operators;
* sensitivity;
* evaluation adapter.

---

## AlertEvaluation

Represents one evaluation of a rule against relevant source context where durable evidence is useful.

Conceptually:

```text
AlertEvaluation
├── id
├── alertRuleVersionId
├── sourceReference
├── evaluatedAt
├── conditionResult
├── inputRevision/evidenceRef
├── evaluationState
└── reason
```

Do not necessarily persist every negative evaluation if volume is enormous.

Phase 3D can decide materialization policy.

---

## Evaluation ≠ AlertOccurrence

Critical.

A rule may be evaluated 1,000 times.

Only matching, deduplicated evaluations create an AlertOccurrence.

---

## AlertOccurrence

Canonical alert instance.

Conceptually:

```text
AlertOccurrence
├── id
├── organizationId
├── alertRuleId
├── alertRuleVersionId
├── subjectReferences[]
├── deduplicationKey
├── openedAt
├── lastObservedAt
├── severity
├── alertState
├── conditionState
├── occurrenceCount
├── resolvedAt?
└── revision
```

Exact persistence Phase 3D.

---

## AlertOccurrence stable identity

For persistent conditions, repeated evaluations may update one active occurrence rather than create thousands of duplicates.

Example:

```text
Integration IC-20 degraded

evaluation every minute
```

should not produce:

```text
60 Alerts per hour
```

unless policy intentionally defines repeated occurrences.

---

## Deduplication key

Conceptually:

```text
alertRuleVersion
+
condition identity
+
source subject
+
optional evaluation window
```

according to policy.

---

## Deduplication ≠ suppression

Critical.

### Deduplication

> This is the same alert condition.

### Suppression

> Do not notify/create additional actionable alert now because policy says suppress.

Separate semantics.

---

## Cooldown

If frozen Alert Rules support cooldown:

```text
do not send another notification for this ongoing condition for 30m
```

this affects delivery/emission policy.

It does not hide the continued source problem.

Do not invent a cooldown control if absent.

---

## Occurrence count

One active occurrence can preserve:

> condition observed 14 times

without generating 14 identical Notifications.

---

## Persistent condition

Should track:

```text
openedAt
lastObservedAt
```

separately.

---

## First occurrence ≠ last occurrence

Permanent.

---

## AlertSubjectReference

Typed canonical source references.

Examples:

* AutomationRun;
* IntegrationConnection;
* Publication;
* Project;
* Task;
* ReportDeliveryAttempt.

Do not store only free-text titles.

---

## Alert severity

Should use governed taxonomy.

Potential:

```text
Critical
High
Medium
Low
Informational
```

if aligned with frozen system.

Exact taxonomy Phase 3D.

---

## Alert state

Conceptually:

```text
Open
Acknowledged
Resolved-by-Source
Suppressed
Expired/No-Longer-Applicable
```

But be careful not to make these mutually exclusive if acknowledgement is better modeled separately.

Prefer:

```text
conditionState
acknowledgementState
notificationState
```

as orthogonal dimensions.

---

## AlertAcknowledgement

If acknowledgement exists:

```text
AlertAcknowledgement
├── alertOccurrenceId
├── acknowledgedBy
├── acknowledgedAt
├── note?
└── revision
```

It is triage evidence.

It does not modify the source domain.

---

## Multiple acknowledgements

If Team-level acknowledgement is one-time, define policy.

Do not overload Notification reads.

---

## Source resolution

Alert occurrence should resolve when canonical condition is no longer true according to the same rule semantics or explicit source resolution evidence.

---

## Resolved-by-source ≠ manually dismissed

Permanent.

---

## Suppression record

If frozen UI allows suppression:

a separate:

```text
AlertSuppression
```

or policy metadata can preserve:

* who;
* scope;
* reason;
* duration.

Do not use `resolved=true`.

---

## AlertRecipientPolicy

Conceptually:

```text
AlertRecipientPolicy
├── recipientMode
├── Team/Role/Membership references
├── source-owner policy?
├── mandatory class?
└── revision
```

Exact supported recipient modes depend on frozen product.

---

## Role label ≠ recipient identity automatically

If a rule says:

> notify Project Owner

use source-derived recipient resolution.

Do not hard-code by job title.

---

## Dynamic recipients ≠ resolved recipients

At occurrence time:

recipient policy should resolve exact current authorized recipients.

Notification history should retain who was targeted.

---

## Recipient later deactivated

Does not rewrite historical Notification recipient evidence.

---

## Notification

Reuse canonical Notification.

Conceptually:

```text
Notification
├── id
├── recipientMembershipId
├── notificationType
├── subjectReference
├── alertOccurrenceId?
├── title/body projection
├── createdAt
├── readAt?
└── actionReference?
```

---

## Notification ≠ DeliveryAttempt

Permanent.

---

## Notification read state

Only recipient inbox/read state.

---

## NotificationDeliveryAttempt

If multiple delivery channels exist:

```text
NotificationDeliveryAttempt
├── notificationId
├── channel
├── destinationReference
├── attemptNumber
├── initiatedAt
├── providerRequestId?
├── state
└── completedAt?
```

---

## In-app Notification ≠ Email delivery

Permanent.

---

## Delivery accepted ≠ delivered

Same transport safety established in Design 134.

---

# 4. Permissions

Design 143 should conceptually distinguish:

```text
alertRule.read
alertRule.create
alertRule.edit
alertRule.publish
alertRule.pause
alertRule.archive

alertOccurrence.read
alertOccurrence.acknowledge
alertOccurrence.suppress

alertRecipientPolicy.manage
alertNotificationPolicy.manage

notificationDelivery.read
```

Exact identifiers belong to Phase 3D.

---

## Rule read ≠ Rule edit

Permanent.

---

## Rule edit ≠ Rule publish

Critical.

Draft condition changes should not affect active alert behavior until published/activated according to policy.

---

## Rule publish ≠ Notification administration

Permanent.

---

## Alert read ≠ acknowledgement

Permanent.

---

## Acknowledge ≠ source-domain mutation

Absolute.

---

## Suppress ≠ source resolve

Absolute.

---

## Alert Rule access ≠ source-domain access

A user may manage a high-level alert policy without permission to inspect every resulting sensitive source record.

This needs explicit governance.

---

## Condition-field availability permission-safe

Rule Builder, if present in frozen Design 143, should expose only source/fields the administrator is permitted to configure.

---

## Recipient policy management ≠ RBAC administration

Permanent.

Design 037/144 remain authorization authority.

---

## "Notify Admins" must resolve canonical RoleAssignments

Do not use job title text.

---

## Alert rule cannot grant Notification recipient source access

Critical.

Receiving:

> Invoice overdue alert

does not automatically grant permission to inspect the Invoice.

Notification deep link reauthorizes.

---

## System mandatory notification policy requires strong permission

If supported.

---

## Cross-tenant rule/source/recipient binding prohibited

Absolute.

---

## Counts/facets permission-safe

If rules list shows:

> 12 active alerts

only authorized occurrences should be counted.

---

## Direct IDs reauthorize

Rules, Occurrences, Notifications, and source references all reauthorize.

---

# 5. States

Design 143 must keep **Rule lifecycle, evaluation state, condition state, AlertOccurrence state, acknowledgement, suppression, Notification state, delivery state, and source state** separate.

### Rule lifecycle

```text
Draft
Active
Paused
Archived
```

### Evaluation

```text
Not Evaluated
Evaluating
Matched
Not Matched
Failed
Unavailable
```

### Condition

```text
Active
Cleared
Unknown
```

### Acknowledgement

```text
Unacknowledged
Acknowledged
```

### Suppression

```text
Not Suppressed
Suppressed
Expired
```

### Notification

```text
Created
Read
Unread
Restricted
```

### Delivery

```text
Pending
Provider Accepted
Delivered
Failed
Bounced
Outcome Unknown
```

These must never collapse into one generic `alert.status`.

---

## Rule Active ≠ alert currently firing

Permanent.

---

## Rule Paused ≠ existing occurrence resolved

Absolute.

---

## Rule Archived ≠ Notification history deleted

Permanent.

---

## Matched ≠ Notification delivered

Critical.

---

## AlertOccurrence created ≠ recipient notified successfully

Permanent.

---

## Notification created ≠ email delivered

Permanent.

---

## Notification read ≠ acknowledged

Absolute.

---

## Acknowledged ≠ source resolved

Absolute.

---

## Suppressed ≠ source resolved

Absolute.

---

## Source resolved ≠ Notification unread state changed

Permanent.

---

## Alert cleared ≠ historical occurrence deleted

Permanent.

---

## Evaluation failed ≠ condition false

Critical.

If source service unavailable:

correct:

> Evaluation unavailable.

Not:

> Condition not met.

---

## Source unavailable ≠ no alerts

Absolute.

---

## Deduplicated evaluation ≠ ignored source condition

Permanent.

The occurrence remains active.

---

## Delivery failed ≠ Alert condition failed

Permanent.

---

## One recipient delivery failed ≠ whole Alert failed

Partial delivery is first-class.

---

## Outcome unknown ≠ delivery failed

Permanent.

---

## State Coverage

Design 143 inherits Design 150 plus:

```text
Alert Rules Loading
Alert Rules Available
Alert Rules Empty
Alert Rules Restricted
Alert Rules Partial
Alert Rules Unavailable

Rule Draft
Rule Active
Rule Paused
Rule Archived

Rule Version Current
Rule Version Historical
Rule Version Draft

Evaluation Pending
Evaluation Running
Evaluation Matched
Evaluation Not Matched
Evaluation Failed
Evaluation Unavailable

Alert Condition Active
Alert Condition Cleared
Alert Condition Unknown

Alert Open
Alert Acknowledged
Alert Resolved By Source
Alert Suppressed
Alert State Unknown

Alert Unacknowledged
Alert Acknowledged

Suppression Active
Suppression Expired
Suppression Restricted

Notification Created
Notification Unread
Notification Read
Notification Restricted

Delivery Pending
Delivery Provider Accepted
Delivery Delivered
Delivery Failed
Delivery Bounced
Delivery Outcome Unknown
Delivery Partial

Recipient Available
Recipient Restricted
Recipient Deactivated
Recipient Unavailable

Rule Updated Elsewhere
Rule Version Published Elsewhere
Source Updated Elsewhere
Condition Cleared Elsewhere
Acknowledgement Updated Elsewhere
Notification Delivery Updated
Evaluation Projection Stale
```

---

# 6. Responsive Behavior

## Desktop

Desktop should prioritize:

```text
Alert rule identity
↓
Active / Paused state
↓
Condition
↓
Source scope
↓
Severity
↓
Recipients
↓
Notification policy
↓
Deduplication/cooldown summary
↓
Recent occurrences
↓
Delivery / acknowledgement status
```

Only controls/sections actually present in frozen Design 143 should be implemented.

---

## Rule condition should be understandable

Prefer:

> When an Automation Run requires reconciliation for more than 15 minutes

rather than exposing:

> `state_code = 7 AND age_ms > 900000`.

---

## Source type should remain explicit

Examples:

* Automation;
* Integration;
* Publishing;
* Project;
* Finance;
* Analytics.

Avoid making all Rules look like generic system alerts.

---

## Severity should not imply source state mutation

A Critical Alert badge means alerting importance.

It does not alter the source entity's own severity/status.

---

## Rule state and recent Alert state should appear separately

Correct:

> Rule: Active
> Last occurrence: Acknowledged, source still active

Incorrect:

> Rule: Acknowledged.

---

## Recipient summary should be policy-aware

Example:

> Operations Team · Project Owner

rather than:

> 14 emails

when rule uses dynamic recipients.

---

## Notification delivery should not obscure condition status

A condition can remain:

> Active

even if all Notifications are Delivered.

---

## Acknowledgement UI

If present:

make clear:

> Acknowledge alert

not:

> Resolve issue.

---

## Suppression UI

If present:

make clear:

> Suppress notifications/occurrence for defined scope/time

not:

> Fix condition.

---

## Tablet

Following Design 152:

* rule name/state/condition remain top;
* severity/recipient policy stack;
* recent occurrences become compact;
* delivery details collapse;
* primary administration action remains reachable.

---

## Mobile

Priority:

```text
Rule name
↓
Active / Paused
↓
Condition summary
↓
Severity
↓
Recipients
↓
Last occurrence
↓
Acknowledgement / delivery
↓
Allowed action
```

Avoid squeezing a desktop rule table horizontally.

---

## Mobile occurrence card

Conceptually:

> Automation Reconciliation Alert
> High severity
> AR-250 requires reconciliation
> Active for 22 minutes
> Notification delivered to 3 recipients
> 1 acknowledged
> Source condition still active

---

## Accessibility

A rule could communicate:

> Alert rule Automation Reconciliation Alert is active. It monitors Automation Runs that remain in Needs Reconciliation state for more than 15 minutes. Severity is High. The latest alert occurrence concerns Automation Run AR-250. Notifications were delivered to three recipients. One recipient acknowledged the alert. The underlying Automation Run still requires reconciliation.

where canonical data supports it.

---

# 7. Backend Requirements

## Canonical Alert architecture

```text
Canonical source state/event
        ↓
Alert source adapter
        ↓
AlertEvaluationService
        ↓
Typed AlertConditionDefinition
        ↓
Condition matched?
        │
   ┌────┴────┐
   ↓         ↓
  No        Yes
             │
             ↓
     Deduplication resolver
             │
             ↓
       AlertOccurrence
             │
             ↓
      Recipient resolver
             │
             ↓
      Notification creation
             │
             ↓
   Notification delivery
```

---

## Alert source adapters

Use typed adapters such as conceptually:

```text
AutomationAlertSourceAdapter
IntegrationAlertSourceAdapter
PublishingAlertSourceAdapter
ProjectAlertSourceAdapter
AnalyticsAlertSourceAdapter
```

Do not let Alert Rules query arbitrary database tables.

---

## Alert Source Registry

Strong architecture:

```text
AlertSourceRegistry
```

defines:

* supported source types;
* condition fields;
* operators;
* source references;
* sensitivity;
* evaluation mode.

---

## Evaluation modes

Different Rule classes may require:

### Event-driven

Example:

> AutomationRun enters FAILED.

### State-driven

Example:

> Integration remains degraded > 10 min.

### Metric/window-driven

Example:

> failure rate exceeds threshold.

Only support what the frozen product requires.

Do not make every rule poll every table.

---

## Event-driven evaluation

Canonical DomainEvent/provider/system event can trigger evaluation.

The Alert service consumes the event but does not become DomainEvent authority.

---

## State-driven evaluation

For time-based conditions:

use durable scheduled evaluation, not browser timers.

---

## Metric-based alerts

If Design 143 supports metric thresholds:

reuse Design-038 MetricDefinition/Aggregate semantics.

Do not define metric formulas inside Alert Rules.

---

## Metric rule example

Correct:

```text
MetricDefinition:
AUTOMATION_FAILURE_RATE

threshold:
> 10%

window:
15 minutes
```

Incorrect:

```text
COUNT(failed rows) / COUNT(*)...
```

written as arbitrary SQL.

---

## Rule Builder condition engine

If frozen Design 143 includes visual Rule editing:

reuse safe typed DSL principles established for Designs 013, 110, 133, and 141.

No arbitrary JS/eval.

---

## Typed operators

Examples:

* equality;
* enum membership;
* numeric comparison;
* duration;
* count/threshold;
* state transition;

only where source definitions allow.

---

## Server-authoritative validation

Rule validation must check:

* source type exists;
* fields/operators compatible;
* scope authorized;
* severity valid;
* recipients valid;
* notification channels supported;
* deduplication policy valid;
* threshold/window valid.

Frontend validation is not authority.

---

## Rule versioning

Material changes should create/publish a new `AlertRuleVersion` rather than mutating the exact version referenced by historical occurrences.

---

## Draft edits

If frozen Rule UI supports drafting:

Draft changes do not affect active evaluation until published/activated.

---

## Rule publication

Conceptually:

```text
publishAlertRuleVersion(
    alertRuleId,
    draftVersionId,
    expectedRevision
)
```

should:

1. authorize;
2. validate condition/source;
3. validate recipients/channels;
4. freeze RuleVersion;
5. set effective version;
6. preserve old historical Version;
7. emit AuditEvent.

---

## Rule evaluation

Conceptually:

```text
evaluateAlertRule(
    alertRuleVersionId,
    sourceEvidence
)
```

should:

1. resolve exact RuleVersion;
2. validate tenant/source scope;
3. evaluate typed condition;
4. capture safe evidence/revision;
5. derive match/no-match/unknown;
6. invoke deduplication;
7. create/update occurrence if appropriate;
8. generate Notifications according to policy.

---

## Evaluation failure

Source adapter unavailable should produce:

> evaluation unavailable

not:

> condition false.

---

## Idempotent evaluation

Same source event/evaluation should not create duplicate AlertOccurrences/Notifications.

---

## Alert deduplication

Central:

```text
AlertDeduplicationService
```

should determine:

* same active condition;
* new occurrence;
* repeated observation;
* re-opened condition.

---

## Condition clearing

The same condition semantics should determine when an active alert is no longer true.

---

## Re-open semantics

Example:

```text
Integration degraded
→ alert opens

Integration recovers
→ alert resolves

Integration degrades again
→ new occurrence
```

Do not silently reuse old resolved occurrence forever unless policy explicitly models episodes differently.

---

## Alert flapping

Repeated healthy/degraded changes can create noise.

If frozen platform supports dampening/cooldown:

use explicit governed policy.

Do not implement hidden arbitrary delays.

---

## Deduplication window

Should be rule-versioned if used.

---

## Notification generation

For each AlertOccurrence:

```text
SystemNotificationOrchestrator
```

resolves exact recipients and creates canonical Notifications.

---

## Notification content

Should be generated from:

* Rule;
* source-safe projection;
* occurrence evidence.

Do not copy raw provider/source payloads.

---

## Dynamic recipient resolution

Example:

> notify Project Owner

At occurrence time:

1. resolve current canonical Project owner;
2. verify active Membership;
3. verify recipient policy eligibility;
4. create Notification.

---

## Recipient resolution history

Historical Notification retains exact recipient.

Later Project owner changes do not rewrite it.

---

## Recipient preferences

Apply personal/channel preferences according to notification-policy class.

---

## Mandatory delivery class

If governance says a class cannot be opted out:

that must be defined centrally.

Not ad hoc per Rule.

---

## Notification channel selection

Use canonical channel adapter registry.

Potential:

* in-app;
* email;

only where platform currently supports them.

Do not invent SMS/push/etc. unless frozen design requires them.

---

## In-app Notification creation

Should be transactionally/idempotently tied to occurrence-recipient intent.

---

## Delivery idempotency

Stable key conceptually:

```text
alertOccurrenceId
+
recipientId
+
channel
```

prevents duplicates.

---

## Provider delivery unknown outcome

For email/external channels:

provider timeout may produce:

```text
DELIVERY_OUTCOME_UNKNOWN
```

before retry.

Same safety principle as Designs 134 and 142.

---

## Delivery retry ≠ new AlertOccurrence

Permanent.

Transport retry sends the same Notification intent.

---

## Acknowledgement

Conceptually:

```text
acknowledgeAlertOccurrence(
    occurrenceId,
    expectedRevision
)
```

should:

1. authorize;
2. verify occurrence;
3. append/update acknowledgement metadata;
4. leave source condition untouched;
5. optionally affect escalation/notification policy only if defined;
6. emit Audit/Activity where governance requires.

---

## Alert acknowledgement ≠ Notification read

Permanent.

---

## Source resolution

Alert service should consume current canonical source evidence.

If source becomes healthy/resolved:

mark occurrence condition as resolved/closed according to policy.

Do not require operator to manually falsify source resolution.

---

## Manual close

If frozen UI contains manual close/dismiss:

model it separately from source-resolved state.

Do not overwrite:

```text
sourceCondition = resolved
```

unless evidence says so.

---

## Suppression

If present:

suppression should be scoped.

Potential scopes:

* this occurrence;
* this source;
* this Rule;
* duration.

But only implement frozen functionality.

---

## Suppression safety

A suppressed Critical system condition may still appear in:

* Design 136 Operations;
* Incident detection;
* source-domain status.

Suppression only controls alerting behavior.

---

## Alert loops

Critical.

The alert system itself can produce Notifications/AuditEvents.

Rules must not accidentally trigger on their own generated outputs recursively.

Example:

```text
Alert created
→ Notification created
→ "Notification created" event
→ same Alert Rule
→ another Notification
→ infinite loop
```

Use:

* source-type restrictions;
* causation tracking;
* loop detection.

---

## Rule causation

Preserve:

```text
sourceEventId
alertOccurrenceId
notificationId
```

where needed for traceability.

---

## Automation interaction

Alert Rule may observe:

> AutomationRun FAILED.

It should not automatically retry the Run.

That would turn Alert into Automation.

If frozen product allows action CTA:

the CTA navigates/delegates to Design 142.

---

## Integration interaction

Alert Rule may observe:

> authorization expired.

Notification can route to Design 140.

It cannot rotate credentials itself merely because alert fired.

---

## Operations interaction

Design 136 may independently display the same source condition.

Do not create the OperationalAttentionItem from Notification state.

Both should derive from canonical source condition.

---

## Incident interaction

A high-severity Alert can be evidence or a trigger candidate for an Incident workflow if separately governed.

It cannot directly mutate Incident lifecycle unless an explicit Incident rule/service exists.

---

## Audit integration

Material alert administration should produce AuditEvents:

* Rule created;
* published;
* paused;
* archived;
* suppression policy changed;
* manual acknowledgement where governance requires.

Routine evaluation/no-match events should not flood global Audit.

---

## Notification preference audit

Ordinary personal preference changes likely belong Activity/settings history, with Audit only where governance requires.

Do not over-audit.

---

## Alert evaluation observability

Track operational metrics such as:

* evaluation latency;
* rules evaluated;
* failures;
* occurrence creation rate;
* delivery latency.

These remain observability.

---

## Rule engine reliability

Evaluation should be replay-safe.

If worker crashes after occurrence creation but before Notification creation:

recovery must continue idempotently without duplicate occurrence/notifications.

---

## Outbox/event orchestration

Strongly suitable:

```text
AlertOccurrence created
        ↓
outbox
        ↓
Notification intents
        ↓
delivery workers
```

---

## Atomicity

Do not require one distributed transaction across:

* source domain;
* alert occurrence;
* external email provider.

Use durable state and idempotent orchestration.

---

## Alert occurrence consistency

For stateful alerts, concurrency must prevent two workers creating duplicate active occurrences for the same condition key.

Use:

* uniqueness;
* locking;
* transactional upsert.

---

## Rule update during evaluation

Evaluation pins the exact `AlertRuleVersion`.

Publishing v5 while v4 evaluation runs does not change that evaluation midway.

---

## Recipient changes during delivery

Notification already created retains exact recipient intent.

Future occurrences use current recipient policy.

---

## Deactivated recipient

Before external delivery:

revalidate recipient eligibility when required.

Do not send blindly to deactivated accounts.

---

## Monitor/list query

Conceptually:

```text
getAlertRulesAndOccurrences(
    filters,
    currentMembership
)
```

should:

1. authenticate;
2. resolve tenant;
3. permission-filter Rules/Occurrences;
4. load RuleVersion summaries;
5. load recent occurrence state;
6. load recipient/delivery summary;
7. return counts/facets safely.

---

## Rule evaluation scalability

Avoid evaluating every Rule against every source record continuously.

Use:

* event routing;
* indexed source keys;
* scheduled bounded evaluators;
* metric aggregate subscriptions;
* condition-source registry.

---

## Metric window performance

Use existing analytical aggregates rather than rescanning raw source tables for every alert interval.

---

## Alert storm protection

Important.

One provider outage may affect thousands of records.

Do not necessarily emit thousands of individual Notifications if Rule semantics are intended to aggregate.

Where the frozen product supports aggregate alerts, use explicit aggregation/dedup policy.

Do not invent aggregation silently.

---

## Delivery rate limits

Notification provider limits remain separate from Alert Rule state.

---

## Notification provider outage

Correct:

```text
AlertOccurrence = OPEN
Notification = CREATED
Delivery = FAILED/UNAVAILABLE
```

Not:

```text
Alert condition failed
```

---

## Idempotency

Required for:

* Rule publication;
* source-event evaluation;
* AlertOccurrence creation;
* recipient Notification creation;
* delivery;
* acknowledgement;
* suppression actions.

---

## Concurrency

Critical races:

### Two evaluators match same condition

Deduplicate transactionally.

### Condition clears while Notification delivery begins

Historical Notification may still deliver depending on policy, but Alert state updates independently.

### User acknowledges while condition clears

Both facts remain.

### Rule is paused while evaluation in-flight

Evaluation uses pinned RuleVersion/effective-state policy.

### Recipient deactivates after Notification creation

Delivery rechecks eligibility where required.

---

## Caching

Design-143 cache should vary by:

```text
organizationMembershipId
authorizationRevision
alertRuleRevision
alertRuleVersionRevision
occurrenceRevision
sourceConditionRevision
recipientPolicyRevision
notificationRevision
deliveryRevision
```

---

## Time-derived rules

Duration-based alert conditions cannot be cached indefinitely.

---

## Performance

Use:

* indexed active RuleVersion references;
* event-based evaluation;
* materialized occurrence summaries;
* batched Notification recipient resolution;
* cursor pagination;
* lazy occurrence history;
* asynchronous external delivery.

Avoid querying every source domain synchronously during page load.

---

## Partial failure contract

Example:

```text
Rule engine            ✓
AlertOccurrence        ✓
Notification creation  ✓
Email provider         ✕
```

Correct:

> Alert condition is active. In-app Notification exists. Email delivery failed.

Incorrect:

> Alert failed.

Another:

```text
Rule active         ✓
Source adapter      unavailable
```

Correct:

> Current condition cannot be evaluated.

Not:

> Condition cleared.

Another:

```text
Notification read    ✓
Source condition     active
```

Correct:

> Notification read; alert condition remains active.

Not:

> Issue resolved.

---

## Backend Requirement Matrix

| Requirement                                                 | Status                                |
| ----------------------------------------------------------- | ------------------------------------- |
| Reuse Design 080 canonical Notification infrastructure      | **Critical**                          |
| Reuse Designs 061/064 notification/preferences architecture | **Critical architecture**             |
| AlertRule/Notification separation                           | **Critical**                          |
| AlertRule/AutomationDefinition separation                   | **Critical**                          |
| AlertCondition/AutomationTrigger separation                 | **Critical**                          |
| AlertOccurrence/OperationalAttentionItem separation         | **Critical**                          |
| AlertOccurrence/Incident separation                         | **Critical**                          |
| AlertOccurrence/source-condition separation                 | **Critical**                          |
| Alert severity/source severity separation                   | **Critical**                          |
| Notification read/Acknowledgement separation                | **Critical**                          |
| Acknowledgement/source resolution separation                | **Critical**                          |
| Suppression/source resolution separation                    | **Critical if suppression exists**    |
| Rule disablement/historical occurrence separation           | **Critical**                          |
| Stable AlertRule identity                                   | **Critical**                          |
| Immutable published AlertRuleVersion                        | **Critical**                          |
| Occurrence pins exact RuleVersion                           | **Critical**                          |
| Typed condition DSL                                         | **Critical**                          |
| No arbitrary SQL/JS/eval                                    | **Critical**                          |
| Condition field/operator registry                           | **Critical**                          |
| Server-authoritative rule validation                        | **Critical**                          |
| AlertEvaluation/Occurrence separation                       | **Critical**                          |
| Evaluation unavailable/not-matched separation               | **Critical**                          |
| Transactional occurrence deduplication                      | **Critical**                          |
| Active-condition/repeated-observation separation            | **Critical**                          |
| Condition cleared/reopened semantics                        | **Critical**                          |
| Deduplication/suppression separation                        | **Critical**                          |
| Recipient policy/resolved recipient separation              | **Critical**                          |
| Recipient policy/RBAC separation                            | **Critical**                          |
| Notification/DeliveryAttempt separation                     | **Critical**                          |
| Delivery accepted/delivered separation                      | **Critical**                          |
| Partial delivery support                                    | **Critical**                          |
| Delivery unknown-outcome support                            | **Critical**                          |
| Personal preference/system policy separation                | **Critical**                          |
| Mandatory notification policy explicit                      | **Critical if supported**             |
| Source deep-link reauthorization                            | **Critical**                          |
| Cross-tenant rule/source/recipient isolation                | **Critical**                          |
| Permission before counts/facets                             | **Critical**                          |
| Durable state/time-window evaluation                        | **Critical**                          |
| Metric Rule reuses Design-038 Metric Registry               | **Critical where metric rules exist** |
| No metric formula duplication                               | **Critical**                          |
| Alert-loop prevention / causation tracking                  | **Critical**                          |
| Alert Rule does not perform remediation automatically       | **Critical**                          |
| Design 136 current-attention reuse                          | **Critical architecture**             |
| Designs 141–142 Automation-state reuse                      | **Critical**                          |
| Designs 139–140 Integration-state reuse                     | **Critical**                          |
| Design 147 Incident separation                              | **Critical architecture**             |
| Design 138 Audit reuse                                      | **Critical**                          |
| Idempotent evaluation/notification delivery                 | **Critical**                          |
| Optimistic concurrency/version pinning                      | **Critical**                          |
| Alert-storm/delivery-rate safety                            | **Critical**                          |
| Partial dependency failure handling                         | **Critical**                          |

---

# 8. Consolidation

Design 143 creates substantial overlap risk because alerts, Notifications, Operations, Automations, Incidents, and source-domain statuses can easily collapse into one generic `"system event"` model.

**AlertRule / AutomationDefinition conflation**
A notification condition becomes an action workflow.

**AlertCondition / Automation Trigger conflation**
Alert evaluation starts executing business processes.

**AlertRule / Notification conflation**
Policy and recipient message become one record.

**AlertOccurrence / Notification conflation**
One source condition duplicated per recipient.

**AlertOccurrence / OperationalAttentionItem conflation**
Communication state becomes operational source truth.

**AlertOccurrence / Incident conflation**
Every alert becomes an Incident.

**AlertOccurrence / source-domain record conflation**
Acknowledging an alert resolves Publishing/Automation/Integration state.

**Alert severity / source severity conflation**
Notification policy rewrites business severity.

**Alert severity / Operations priority conflation**
High alert automatically becomes highest operational action priority.

**Rule active / condition active conflation**
Enabled policy looks like current problem.

**Rule paused / alert resolved conflation**
Stopping evaluation rewrites historical condition.

**Rule archived / history deletion conflation**
Historical occurrences disappear.

**Rule definition / RuleVersion conflation**
Historical occurrences change meaning after editing.

**Current RuleVersion / occurrence RuleVersion conflation**
Old alert displays today's condition logic.

**AlertEvaluation / AlertOccurrence conflation**
Every evaluation creates an alert.

**Not Matched / Evaluation Failed conflation**
Source outage appears healthy.

**Condition false / source unavailable conflation**
Missing evidence clears Alerts.

**Condition active / Notification delivered conflation**
Successful message transport looks like source recovery.

**Notification created / delivered conflation**
Transport state disappears.

**Provider accepted / delivered conflation**
Delivery success overstated.

**Notification read / acknowledgement conflation**
Opening Inbox becomes formal triage.

**Notification read / source resolved conflation**
Reading message fixes system.

**Acknowledged / resolved conflation**
Operator awareness becomes business repair.

**Suppressed / resolved conflation**
Noise control hides active source condition.

**Suppressed / deleted conflation**
Governance history disappears.

**Deduplication / suppression conflation**
Persistent problem disappears entirely.

**Repeated evaluation / repeated occurrence conflation**
Alert storm generated.

**Cooldown / source resolution conflation**
Quiet period looks fixed.

**First observed / last observed conflation**
Persistent duration cannot be measured.

**Alert occurrence / episode conflation**
Recovered and later-failed source reuses one permanent alert incorrectly.

**Recipient policy / resolved recipient conflation**
Historical recipient evidence changes when Teams/Roles change.

**Role name / recipient identity conflation**
Job-title changes alter alert delivery.

**Recipient eligibility / Notification existence conflation**
Deactivated accounts still receive external delivery.

**Rule recipient / source permission conflation**
Notification grants source access.

**Notification preference / AlertRule policy conflation**
One user's preference disables organization-wide alerting.

**User opt-out / mandatory system alert conflation**
Critical governance notifications silently disappear.

**Alert channel / provider credential conflation**
Rule stores email credentials.

**Rule condition / raw DB column conflation**
Internal schema leaks into policy.

**Rule condition / arbitrary SQL conflation**
Alert engine becomes unrestricted query engine.

**Rule expression / arbitrary JavaScript conflation**
Security/reproducibility collapse.

**Metric alert / local metric formula conflation**
Design 038 semantics fork.

**Event-driven / polling rule conflation**
Every Rule scans every table unnecessarily.

**Schedule timer / durable duration evaluation conflation**
Alerts disappear after restart.

**ProviderEvent / AlertOccurrence conflation**
External callback bypasses source normalization.

**Automation failure / alert failure conflation**
Notification delivery status rewrites Run state.

**Integration degradation / AlertOccurrence state conflation**
Design 140 health and Design 143 disagree.

**Operations acknowledgement / Alert acknowledgement conflation**
Different triage concepts mutate each other.

**Incident acknowledgement / Alert acknowledgement conflation**
Incident lifecycle forks.

**Notification read state / Alert state conflation**
One recipient reading affects others.

**One recipient delivery failure / whole Alert failure conflation**
Partial delivery disappears.

**Delivery retry / new AlertOccurrence conflation**
Same source condition duplicates.

**Alert evaluation / AuditEvent conflation**
Global Audit floods with polling/no-match events.

**Notification / AuditEvent conflation**
Inbox message becomes compliance evidence.

**Alert Rule administration / Application log conflation**
Technical errors become policy state.

**Rule firing / business action conflation**
Alert starts remediation automatically without Automation/domain policy.

**Alert-generated Notification / alert source event loop conflation**
Infinite alert recursion.

**Generic `alert_rules` with SQL text**
Security/semantic governance failure.

**Generic `alerts` row per recipient**
Source condition duplicated across users.

**Generic `status=read`**
Alert, Notification and source state collapse.

**Generic `resolved=true`**
Cannot distinguish acknowledged/suppressed/source-cleared.

**Generic `send_email=true`**
No recipient/channel/delivery semantics.

**Generic `severity` only**
No source, policy, occurrence or operational distinction.

**Generic `last_triggered_at`**
No occurrence history, duration or dedup evidence.

**Generic `notification_sent=true`**
No recipient or delivery-attempt evidence.

**143/080 duplicate Notification infrastructure**
Two inbox/message systems diverge.

**143/136 duplicate operational-condition state**
Alerts become Command Center truth.

**143/138 duplicate Audit system**
Alert history becomes governance evidence.

**143/139–140 duplicate Integration state**
Rule engine becomes health authority.

**143/141–142 duplicate Automation state**
Alert engine becomes Run authority.

**143/147 duplicate Incident lifecycle**
Alerts become second incident system.

No additional screen is required.

These are **typed alert-policy/versioning, source-condition observation, deduplicated AlertOccurrences, acknowledgement/suppression/source-resolution separation, canonical Notification reuse, delivery evidence, recipient-policy governance, safe condition DSL, and strict Operations/Automation/Integration/Incident boundaries**.

---

# 9. Implementation Verdict

## **PASS — CANONICAL ALERT RULE, CONDITION EVALUATION, ALERT OCCURRENCE & NOTIFICATION-ORCHESTRATION ANCHOR**

**Domain directive:**
**AlertRule ≠ AlertRuleVersion ≠ AlertConditionDefinition ≠ AlertEvaluation ≠ AlertOccurrence ≠ AlertAcknowledgement ≠ Notification ≠ NotificationDeliveryAttempt ≠ OperationalAttentionItem ≠ AutomationRun ≠ Incident ≠ SourceDomainRecord.**

**Notification-foundation directive:**
Design 080 remains canonical Team Notification Center and Designs 061/064 preserve existing notification-preference/inbox architecture. Design 143 manages alert policy/orchestration and never creates a competing Notification entity or inbox.

**Rule directive:**
`AlertRule` is stable policy identity while immutable published `AlertRuleVersion` contains exact condition, source scope, severity, recipient, deduplication and notification policies used for future evaluations.

**Version directive:**
every AlertOccurrence pins the exact AlertRuleVersion that generated it; later Rule edits never rewrite historical occurrence meaning.

**Draft/publish directive:**
if frozen Rule management supports Draft configuration, editing Draft conditions has no runtime effect until server-valid publication/activation.

**Condition directive:**
AlertConditionDefinitions use typed allowlisted semantic source fields/operators and never arbitrary SQL, JavaScript, eval, raw database columns, or unrestricted cross-domain joins.

**Condition-registry directive:**
one canonical AlertSource/ConditionField registry defines supported source types, fields, operators, sensitivity and evaluation adapters.

**Metric directive:**
where Alert Rules use KPI/metric thresholds, Design 038 remains MetricDefinition/calculation authority; Design 143 references metric identities and never reimplements formulas.

**Automation-boundary directive:**
Alert Rules observe conditions and notify. They do not become AutomationDefinitions or execute arbitrary remediation workflows.

**Trigger-boundary directive:**
Alert conditions and Automation TriggerDefinitions may share safe expression primitives but retain independent semantic/runtime models.

**Evaluation directive:**
AlertEvaluation represents rule evaluation evidence and remains separate from AlertOccurrence. A rule can evaluate repeatedly without creating a new Alert every time.

**Evaluation-failure directive:**
source/adapter failure produces `Evaluation Unavailable/Unknown`, never false `Not Matched`.

**Occurrence directive:**
`AlertOccurrence` is one canonical alert episode tied to exact RuleVersion and typed canonical source references.

**Deduplication directive:**
repeated observation of the same active condition is transactionally deduplicated against a stable condition key rather than generating uncontrolled duplicate Alerts/Notifications.

**Deduplication/suppression directive:**
deduplication identifies repeated same-condition evidence; suppression/cooldown controls alerting/noise policy. Neither implies source resolution.

**Episode directive:**
condition active → cleared → active again can produce a new occurrence/episode according to explicit policy while preserving previous historical occurrence.

**First/last-observed directive:**
persistent conditions retain both `openedAt` and `lastObservedAt`, allowing duration to be understood without generating duplicate occurrences.

**Source directive:**
Tasks, Projects, Publications, Distribution executions, IntegrationConnections, AutomationRuns, Reports and all other monitored resources remain canonical in their source domains.

**Source-resolution directive:**
AlertOccurrence resolves from canonical source evidence/condition clearing; acknowledgement, Notification read state, suppression or Rule disablement never falsely resolves source state.

**Acknowledgement directive:**
if acknowledgement exists in frozen Design 143, `AlertAcknowledgement` records human triage awareness only. `Acknowledged ≠ Resolved`.

**Suppression directive:**
if suppression exists, it controls alerting/display policy only, retains actor/reason/duration evidence where appropriate, and never mutates underlying source state.

**Rule-state directive:**
Active, Paused and Archived Rule lifecycle remains separate from existing AlertOccurrence state and source condition state.

**Severity directive:**
Alert severity controls alerting/communication importance and remains distinct from source-domain severity and Design-136 operational priority.

**Operations directive:**
Design 136 derives `OperationalAttentionItem` directly from canonical operational source conditions. Notification or Alert acknowledgement never becomes Command Center resolution truth.

**Automation directive:**
Designs 141–142 remain AutomationRun/Attempt/Step/outcome authority. Alert Rules may observe failed/reconciliation-required Runs but cannot retry or mark them successful.

**Integration directive:**
Designs 139–140 remain IntegrationConnection/auth/capability/health authority. Alerts may route operators to Integration Detail but cannot rotate credentials or alter health state.

**Incident directive:**
Design 147 remains canonical Incident authority. AlertOccurrences can provide evidence/trigger candidates but never substitute for Incident lifecycle/severity/remediation.

**Recipient-policy directive:**
AlertRecipientPolicy defines how recipients are selected; each occurrence/Notification resolves exact current canonical recipients and preserves historical delivery identity.

**RBAC-recipient directive:**
role/team recipient policies resolve through canonical OrganizationMembership/RoleAssignment relationships rather than job-title text.

**Recipient-access directive:**
receiving an alert does not grant source-domain access. Notification/action links reauthorize the source resource.

**Preference directive:**
personal Notification preferences and organization/system Alert policies remain separate. Recipient preferences may affect allowed delivery channels according to central policy.

**Mandatory-notification directive:**
if the product supports mandatory notification classes, opt-out behavior is centrally governed and explicit rather than decided ad hoc by individual Alert Rules.

**Notification directive:**
one AlertOccurrence may create multiple canonical Notifications—typically one per resolved recipient/context—without duplicating the underlying alert condition.

**Notification-read directive:**
Notification `readAt` affects only that recipient's inbox state and never Alert acknowledgement, source state, or other recipients.

**Delivery directive:**
Notification and NotificationDeliveryAttempt remain separate. In-app creation, provider acceptance, delivery, bounce, failure and outcome unknown remain distinct transport facts.

**Partial-delivery directive:**
multi-recipient/channel delivery can be partial without changing AlertOccurrence/source-condition truth.

**Delivery-idempotency directive:**
external delivery uses stable occurrence + recipient + channel intent keys and provider idempotency where available.

**Unknown-delivery directive:**
uncertain external delivery outcomes are reconciled before blind retry when duplicate messages matter.

**Alert-loop directive:**
source-type restrictions, causation identifiers and loop detection prevent Alert-generated Notifications/AuditEvents from recursively re-triggering the same alert pipeline.

**Evaluation-mode directive:**
event-driven, durable state-duration and metric/window evaluation use the appropriate registered mechanism rather than every Rule continuously scanning raw source tables.

**Duration directive:**
time-based rules use durable scheduler/evaluation state and survive process restarts; browser/in-memory timers are prohibited.

**Storm-protection directive:**
deduplication, explicit aggregation/cooldown policy where supported, rate limits and delivery backpressure prevent one provider/system outage from causing uncontrolled alert/Notification storms.

**Validation directive:**
rule source fields, operators, recipients, channels, severity, thresholds and deduplication policies are server-authoritatively validated before publication.

**Permission directive:**
Rule read/create/edit/publish/pause/archive, occurrence read/acknowledge/suppress, recipient-policy management and delivery inspection remain independently server-authorized.

**Permission-before-count directive:**
Rule/Occurrence counts, facets, search and recipient/source metadata are tenant/resource permission filtered before aggregation.

**Tenant directive:**
Rules, RuleVersions, evaluations, occurrences, source references, recipients, Notifications and delivery attempts remain strictly tenant/context scoped.

**Audit directive:**
Design 138 receives material Rule administration and governance actions such as publish/pause/archive or sensitive suppression/acknowledgement where policy requires. Routine no-match evaluations and delivery telemetry do not flood global Audit.

**Observability directive:**
rule-engine latency, evaluation errors, queue lag, Notification throughput and provider delivery metrics remain operational telemetry, not AlertOccurrence/source-domain state.

**Idempotency directive:**
Rule publication, evaluation consumption, occurrence creation/update, Notification generation, external delivery, acknowledgement and suppression actions are replay-safe.

**Concurrency directive:**
duplicate evaluators, source condition clearing, Rule publication, recipient changes, acknowledgements and delivery callbacks use exact Version/revision/uniqueness safeguards so one condition cannot generate contradictory state.

**Caching directive:**
Design-143 caches vary by authorization, Rule/RuleVersion, occurrence, source-condition, recipient-policy, Notification and delivery revisions, while time-sensitive duration conditions are never indefinitely cached.

**Performance directive:**
use event routing, source adapters, indexed active occurrences, existing metric aggregates, durable time-window evaluators, batched recipient resolution, cursor pagination and asynchronous delivery rather than synchronously scanning every monitored domain on page load.

**Partial-failure directive:**
Rule engine, source adapters, recipient resolver, Notification service and external delivery providers may fail independently. `Unavailable` can never become `Condition false`, `Source resolved`, `Notification delivered`, `Alert acknowledged`, or `No alerts` without evidence.

**Future-reuse directive:**
Design **144 — Role & Permission Administration** must reuse the canonical authorization foundation established by Design 037. Alert Rules may target role-based recipient policies, but role membership and permissions must remain canonical RBAC entities; Design 143 can reference them but cannot create or modify authorization semantics as part of alerting.

**Overlap directive:**
Designs **061, 064, 080, 136, 138–147** must preserve one continuous **canonical source condition/metric → typed AlertRuleVersion evaluation → deduplicated AlertOccurrence → exact recipient resolution → canonical Notification → channel-specific DeliveryAttempt → optional acknowledgement/suppression**, while source state, operational attention, Automation, Integration health, Audit and Incident lifecycles remain independently canonical.

**Consolidation directive:**
**STANDARDIZE ONE ALERT RULE & SYSTEM NOTIFICATION FOUNDATION — VERSIONED ALERTRULE + TYPED ALLOWLISTED CONDITION DSL + REGISTERED SOURCE/METRIC ADAPTERS + EVALUATION/ALERTOCCURRENCE SEPARATION + TRANSACTIONAL DEDUPLICATION/EPISODE SEMANTICS + EXPLICIT SEVERITY + SOURCE-RESOLUTION/ACKNOWLEDGEMENT/SUPPRESSION SEPARATION + CANONICAL DESIGN-080 NOTIFICATION REUSE + RECIPIENT-POLICY/PREFERENCE SEPARATION + IDEMPOTENT CHANNEL DELIVERY + ALERT-LOOP/STORM PROTECTION + STRICT DESIGN-136/141/142/140/147 SOURCE BOUNDARIES — AND NEVER ALLOW GENERIC `ALERT.STATUS=READ`, `RESOLVED=true`, SQL/JS CONDITIONS, JOB TITLES, NOTIFICATION READ STATE, FRONTEND ACKNOWLEDGEMENT, DELIVERY SUCCESS, RULE DISABLEMENT OR COMMAND-CENTER TRIAGE TO SUBSTITUTE FOR OR REWRITE CANONICAL SOURCE, ALERT, NOTIFICATION, AUTOMATION, INTEGRATION OR INCIDENT TRUTH.**

---

# Phase 3A.1 — Running Audit

| Result                                     |                          Count |
| ------------------------------------------ | -----------------------------: |
| **Audited**                                |                  **143 / 153** |
| **PASS**                                   |                        **143** |
| **STANDARDIZE decisions**                  |                        **141** |
| **Potential implementation-overlap flags** |                        **134** |
| **MERGE screen candidates**                | **0 pending later comparison** |
| **FIX BEFORE CODE**                        |                          **0** |
| **New designs**                            |                          **0** |

**143 / 153 = 93.5% audited.**

### Canonical Alert architecture after Design 143

```text
CANONICAL SOURCE CONDITION
          │
          ↓
    AlertRule v4
          │
          ↓
      Evaluation
          │
       MATCHED
          │
          ↓
   Deduplication check
          │
          ↓
   AlertOccurrence AO-20
          │
     ┌────┼────────┐
     ↓    ↓        ↓
 Severity Recipients Source refs
          │
          ↓
   Canonical Notifications
          │
          ↓
   Delivery Attempts
```

The strongest state boundary is now explicit:

```text
Source:
AutomationRun AR-20
still requires reconciliation.

Alert:
AO-20 acknowledged.

Notification:
read by recipient.

Email:
delivered successfully.


These facts mean:

The operator knows about it.

They do NOT mean:

AutomationRun is fixed.
```

Deduplication also prevents alert storms:

```text
Integration IC-20
remains degraded for 60 minutes.

Rule evaluated every minute.

BAD:

60 AlertOccurrences
× 10 recipients
= 600 notifications


CORRECT:

One active alert episode
with repeated observations

plus delivery behavior
controlled by explicit
notification/dedup/cooldown policy.
```

Rule changes remain historically safe:

```text
Alert Rule A-10

v4:
notify after 15 minutes

AO-20 was created by v4.

Later:

v5 changes threshold
to 30 minutes.

AO-20 remains
a v4 occurrence.

Historical alert meaning
does not change.
```

And Alert Rules cannot become Automations:

```text
Alert Rule:

“Automation Run
requires reconciliation”

        ↓

Create Alert
Send Notification


It does NOT:

retry the Run
rotate credentials
change Project state
resolve Integration health

Those actions remain
with their canonical domains.
```

## Next Sequential Audit Target

### **Design 144 — Role & Permission Administration**

That is the next frozen design in sequence. It should be audited only when explicitly requested, under the same unchanged audit contract.
