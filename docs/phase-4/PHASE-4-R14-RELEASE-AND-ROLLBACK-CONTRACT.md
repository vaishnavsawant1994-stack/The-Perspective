# R14 release and rollback contract

STATUS: **CONTRACT — NO RELEASE IS AUTHORIZED**

## Order

pre-check (`db:migrate:status`, backup) → migrate → start the SHA that matches the migrated schema → smoke (`/`, `/login`, `/api/health/ready`) → decide.

## Rollback

- If the new process fails before migrations: start the previous SHA. No database change occurred.
- If migrations ran: do not point an older SHA at the new schema unless that pair was tested. Restore the dump taken immediately before migrate into a replacement database, then start the previous SHA against that database.
- Irreversible destructive SQL is not "rolled back" by a git revert.

## Tag

No `v1.0.0` tag may be created by the authoring agent before a genuine independent review and a certification record that names the same SHA. No tag exists on the repository today.

## Merge rule

A pull request may carry the technical qualification. Merging it does not certify V1.0. A later certification merge is allowed only after the independent review of that same product SHA, with any later commits limited to documentation that cites the review. This agent must stop before that certification merge if the review has not happened.

## Open work

Draft PRs #8 and #10 stay open and unmerged. No open GitHub issue is a V1 blocker because none is open. The blockers are the missing reviewer and the missing production host, not an issue ticket.
