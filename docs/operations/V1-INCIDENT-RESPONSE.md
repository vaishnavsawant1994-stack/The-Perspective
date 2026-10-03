# V1 incident response

STATUS: **RUNBOOK INDEX — NO ON-CALL ROSTER**

No operator roster is invented here. The owner has to name who is called.

1. Detection. Health, a failed deploy, an audit anomaly, or a person reporting a wrong tenant's data.
2. Triage. Decide which procedure in `docs/operations/V1-DISASTER-RECOVERY.md` applies. Do not disable RLS and do not invent a provider success.
3. Containment. Stop the bad process, rotate the leaked credential, or revoke the session.
4. Recovery. Restore a dump or start a known SHA. Schema rollback is a restore, not a git revert.
5. Verification. Readiness, migration count, and the SHA match the intended pair. Anonymous `/app` still redirects to `/login`.
6. Record. Write what happened, the SHAs, and what remains. Do not call it a certified incident system.

Practical procedures:

- application outage
- database outage
- failed deployment
- migration failure
- compromised secret
- provider outage
- authentication incident
- suspected cross-tenant access
- backup restoration

They are the sections of `docs/operations/V1-DISASTER-RECOVERY.md`.
