# R11 domain and workflow

Contract: `PHASE-4-R11-G0-FREEZE.md`

## States

```text
report: REPORT_DRAFT -> REPORT_APPROVED
signal: SIGNAL_CANDIDATE -> SIGNAL_REVIEWED -> SIGNAL_ACTED
rule: RULE_ACTIVE <-> RULE_DISABLED
execution: EXECUTION_RECORDED
observation: OBSERVED
```

A caller cannot set a state by name. `SIGNAL_ACTED` means the team recorded a follow-up. It does not accept a proposal, sign a contract, issue an invoice, or take a payment.

## Report rule

`from` and `to` are timestamps. `to` is not before `from`. The span is at most 366 days. The snapshot stores counts and a trust label. It does not store a browser total.

Approval requires a different membership from `created_by` and the expected row version. The same actor is `INELIGIBLE`.

## Signal rule

`open-renewal` requires a contract in the caller's organization. The stored reason is `contract:` plus the contract status, built by the server. `open-upsell` requires a client account in the caller's organization. The stored reason is `account:` plus the account health. Neither command updates the source row.

`review-signal` moves `SIGNAL_CANDIDATE` to `SIGNAL_REVIEWED`. `act-signal` moves `SIGNAL_REVIEWED` to `SIGNAL_ACTED`.

## Observation rule

The public body is `{ slug, dedupe, campaignId? }`. `dedupe` is 8 to 80 characters from `[A-Za-z0-9._:-]`. The same slug and dedupe returns the original observation. A draft slug is not found and writes nothing.

## Attribution rule

If `campaignId` is a uuid of a `CAMPAIGN_LAUNCHED` or `CAMPAIGN_CLOSED` campaign in the same organization as the published issue, write one `LAST_TOUCH` row. Otherwise write none. There is no first-touch or multi-touch model in this release.

## Automation rule

A rule stores a name, one trigger, one field, one operator, and one integer threshold from 0 through 1000000. The action is always `CREATE_GROWTH_SIGNAL`. The worker evaluates the condition against current tenant counts. A false condition still records one execution, with result `CONDITION_FALSE`, and creates no signal. A true condition creates one growth signal and records `EXECUTED`. The same rule and trigger key returns the original execution.

## Search rule

`reindex` replaces `growth.search_documents` with issue and article rows from the published snapshot projection. A draft issue is absent. Public search reads only that table and returns slug, title, kind, and canonical path.
