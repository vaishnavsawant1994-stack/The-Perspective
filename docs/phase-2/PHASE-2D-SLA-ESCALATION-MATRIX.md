# Phase 2D — SLA & Escalation Matrix

**Status:** Frozen policy architecture; durations are launch defaults and remain configurable data  
**Clock:** Business-calendar time in the owning organization unless explicitly marked elapsed time.

## 1. SLA data model

SLA policy is versioned and resolved by:

```text
owner organization + workflow/product type + priority + stage/event
+ client/package override + effective dates
```

Each timer records policy version, source event, start, pause intervals, due time, status, escalation level, acknowledgement, resolution, and breach evidence. Policies generate `Task`, `Notification`, `ActivityEvent`, `AutomationRun`, and audit entries when sensitive. Timers are not hard-coded in UI components.

## 2. Clock and pause rules

- Default business calendar: Monday–Friday, 09:30–18:30 in owner-organization timezone, excluding configured holidays.
- Client-facing due dates display both owning and client timezone where relevant.
- `WAITING_ON_CLIENT`, approved `ON_HOLD`, and provider outage states may pause eligible timers; pause reason and actor are mandatory.
- Legal, privacy, security, payment-webhook ingestion, and live-event incident timers use elapsed time and do not pause for business hours.
- Reopen creates a new SLA cycle linked to the prior cycle; it does not erase a previous breach.
- Due-date changes require scoped authority, reason, previous/new date, and notification to impacted assignees.

## 3. Sales and communication SLAs

| Trigger/state | Initial due | Reminder | Escalation | Recipients/action |
|---|---:|---:|---:|---|
| Positive reply | 4 business hours | 2h | 4h then every business day | Sales owner; Sales Manager at breach; create follow-up task |
| New qualified lead unassigned | 2 business hours | 1h | 2h | Sales Manager assignment queue |
| Lead in qualification | 2 business days | 1 day | 2 days | Owner then Sales Manager |
| Outreach campaign waiting approval | 1 business day | 4h | 1 day | Sales Manager/Admin approver |
| Inbox conversation waiting internal | 1 business day | 4h | 1 day | assignee then manager |
| Client/prospect email waiting reply from team | 1 business day | 4h | 1 day | conversation owner; preserve channel context |
| Discovery meeting outcome missing | 4 business hours after meeting | 2h | next business morning | meeting owner/manager |
| Proposal internal review | 1 business day | 4h | 1 day | commercial approver |
| Sent proposal no follow-up | 3 business days | day 2 | day 3 | deal owner; create follow-up task |

## 4. Commercial and finance SLAs

| Trigger/state | Initial due | Reminder/escalation | Required action |
|---|---:|---|---|
| Contract internal review | 2 business days | 1 day / 2 days to commercial authority | approve, request changes, or reject exact version |
| Signature pending | configurable, default 3 business days | day 2; Account Manager at day 3; weekly thereafter | client reminder under communication policy |
| Invoice request approved | 1 business day | 4h / Finance Manager at 1 day | issue invoice |
| Payment webhook unprocessed | 5 elapsed minutes | 2m / Operations+Finance at 5m | replay or investigate provider event |
| Payment failed | immediate notification | Account Manager after 30m; daily until addressed | payment-method/retry task |
| Invoice overdue | at due-date boundary | immediate Finance+Account; client cadence by policy | collection task and client-safe reminder |
| Refund request | 2 business days | 1 day / Admin+Finance at 2 days | approve/decline with evidence |
| Ledger reconciliation exception | 4 elapsed hours | 1h / Finance+Operations at 4h | block affected close/report projection |

## 5. Client onboarding and delivery SLAs

| Trigger/state | Due | Reminder/escalation | Notes |
|---|---:|---|---|
| Client portal invite not accepted | 2 business days | day 1; Account Manager at day 2 | reissue only with new token |
| Questionnaire assigned | package-specific, default 5 business days | 48h and 24h before due; Account Manager when overdue | client-visible |
| Questionnaire submitted | immediate editor notification | review due 1 business day | exact submission snapshot |
| Client assets pending | default 5 business days | day 3/day 5 | pause dependent production stages explicitly |
| Kickoff not scheduled after commercial complete | 2 business days | 1 day / Operations at 2 days | Account Manager owner |
| Client review request | default 3 business days | day 2; day 3 Account Manager; every 2 days | configurable by package/contract |
| Client changes requested | editor/designer task due 2 business days | 1 day / domain lead at 2 days | successor version required |
| Delivery ready but unsent | 4 business hours | 2h / Account Manager at 4h | exact delivery manifest |
| Delivery sent but unacknowledged | 3 business days | day 2/day 3 | acknowledgement is evidence, not completion assumption |

## 6. Editorial, magazine, podcast, and video SLAs

| Work item | Default due | Escalation |
|---|---:|---|
| Editorial brief after assignment | 1 business day | Editor |
| Draft after brief | package/template specific | reminder at 75%; Editor at breach |
| Internal editorial review | 2 business days | Editor-in-Chief at breach |
| Fact-check review | 1 business day | Editor-in-Chief |
| Cover internal review | 1 business day | Editor-in-Chief |
| Layout/proof internal review | 2 business days | Editor-in-Chief/Operations |
| Digital Reader build after final proof | 1 business day | Designer/Operations |
| Guest confirmation after invitation | 3 business days | Podcast Producer follow-up |
| Podcast/video rough cut after recording/shoot | template specific, default 3 business days | production lead |
| Internal media review | 2 business days | Editor-in-Chief/producer lead |
| Captions/transcript after final media master | 1 business day | producer/Operations |

## 7. Approval, publishing, and distribution SLAs

| Trigger/state | Due | Escalation path |
|---|---:|---|
| Internal approval requested | 1 business day | reviewer → domain lead → Admin |
| Client approval waiting | 3 business days | reminder at day 2; Account Manager at day 3 |
| Approval expires | policy due date | requester and approvers; transition to `EXPIRED` |
| Publication validation blocked | 2 business hours | owner → Editor-in-Chief/Operations |
| Publication job failed | immediate | high-priority Operations + Publishing; retry task due 30 elapsed minutes |
| Scheduled publication missed | 5 elapsed minutes | high-priority Operations, Marketing, owner |
| Published URL unverified | 10 elapsed minutes | Publishing/Operations |
| Distribution item failed | 30 elapsed minutes | Marketing & Distribution; campaign owner at 1h |
| Rights expire within 30 days | 30/14/7/1 days | asset owner, project owner, Publishing |
| Rights revoked for live use | immediate | high-priority Publishing/Legal/Admin impact assessment |

## 8. Events, reporting, renewal, and support SLAs

| Trigger/state | Due | Escalation |
|---|---:|---|
| Speaker invite response | 5 business days | Events Manager follow-up |
| Speaker assets pending | 5 business days before content deadline | daily reminder; Events Manager |
| Live-event operational incident | immediate | Events Manager + Operations; 15-minute acknowledgement |
| Post-event content start | 1 business day after event | production owner |
| Metric source stale | source freshness policy | report owner; Operations on critical source |
| Report data incomplete | 1 business day investigation | report owner → Operations/Account |
| Report internal review | 2 business days | Account/Operations lead |
| Renewal review required | default 90 days before renewal | Account Manager; Sales Manager at 75 days |
| Renewal outreach not started | 60 days before renewal | Account + Sales Manager |
| General support request | acknowledge within 24 elapsed hours | Support/Operations |
| Billing/payment support | 1 business day | Finance Manager |
| Complex support issue | 2 business days | Operations Manager |
| Security/privacy/access incident | immediate, policy-specific | Admin/Security/Privacy contacts; separate incident process |

## 9. Escalation levels

| Level | Meaning | Standard action |
|---|---|---|
| `L0` | Timer active | assigned owner sees due time |
| `L1` | Reminder threshold | in-app notification and task emphasis |
| `L2` | Due/breached | owner + manager/domain lead; email where appropriate |
| `L3` | Material risk | Operations/Admin and Account owner; priority notification |
| `L4` | Critical live/finance/security/publishing incident | immediate designated incident channel and acknowledgement tracking |

Client users never receive internal escalation commentary, staff names not already shared, operational failure details, or internal priority scoring. They may receive a separate safe status message.

## 10. SLA events and metrics

Canonical events:

```text
sla.started
sla.paused
sla.resumed
sla.reminder_due
sla.breached
sla.escalated
sla.acknowledged
sla.resolved
sla.waived
```

Operational reporting measures acknowledgement time, resolution time, breach rate, paused duration, escalation level, stage, team, and policy version. Employee-level performance is management-restricted and never client-visible.

## 11. Administration controls

- SLA policy changes are versioned and effective-dated.
- Existing timers keep their resolved policy version unless an authorized migration is recorded.
- Waivers require permission, reason, expiry, and audit.
- Notifications obey channel preferences unless the policy is classified as mandatory operational/security communication.
- Calendar and holiday configuration changes trigger deterministic recalculation with before/after due times recorded.
