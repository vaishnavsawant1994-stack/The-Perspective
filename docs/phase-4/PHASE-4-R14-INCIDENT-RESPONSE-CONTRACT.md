# R14 incident-response contract

STATUS: **CONTRACT**

The operations handbook must contain short procedures for:

- application process not serving
- database not accepting connections
- deploy of the wrong SHA
- migration failure
- credential suspected leaked
- provider outage (`PROVIDER_UNAVAILABLE` remains the product behavior)
- authentication incident (revoke sessions using the existing R3 revocation path; do not invent a new admin API)
- suspected cross-tenant read
- restore from the qualification dump procedure

Each procedure has detection, containment, recovery, and a check that the recovered SHA and migration count match the intended pair.

No procedure may tell an operator to run as a superuser for application traffic, to disable RLS, or to paste a production secret into git.

There is no on-call roster. Naming one is an owner action. The documents must not invent employees, Severities assigned to fake people, or a status page.
