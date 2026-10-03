# V1 operations handbook

STATUS: **HANDOFF OF WHAT EXISTS — V1.0 IS NOT CERTIFIED**

- Environment: `docs/operations/V1-ENVIRONMENT-CONTRACT.md`
- Deployment: not selected. `docs/phase-4/PHASE-4-R14-PRODUCTION-READINESS-CONTRACT.md`
- Migrations: `npm run db:migrate:deploy` then `npm run db:migrate:status`
- Backup and restore: `docs/operations/V1-BACKUP-AND-RESTORE.md`
- Rollback: `docs/operations/V1-RELEASE-ROLLBACK.md`
- Health: `docs/operations/V1-OBSERVABILITY.md`
- Incidents: `docs/operations/V1-INCIDENT-RESPONSE.md` and `docs/operations/V1-DISASTER-RECOVERY.md`
- Credentials: host secret store, which does not exist yet. Do not commit them.
- Troubleshooting: readiness 503 means the database probe failed. The body will not say why. Liveness without readiness means the process is up and the database is not usable.

Production monitoring, paging, DNS, TLS, and backups are not configured. GitHub Actions is not this handbook's production.
