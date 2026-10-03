# R13 audit and incident contract

STATUS: **G0 — OPERATIONALIZE BY NOT DUPLICATING**
DATE: 3 October 2026

`audit.audit_events` remains the security audit log. R13 mutations append one event through the same table. They do not add an audit editor, exporter, or a second log.

Ordinary runtime has no UPDATE or DELETE on `audit.audit_events`. R13 does not grant any. Incident tables from R2 stay without an API. R13 does not open, mitigate, or resolve incidents, and it does not invent incident authority.

R13 audit metadata is the redacted command result: ids, states, and the attempt result. It does not contain secrets, because the commands have no secret input.

`audit.view` stays the R5 reader. R13 does not add an audit browser.
