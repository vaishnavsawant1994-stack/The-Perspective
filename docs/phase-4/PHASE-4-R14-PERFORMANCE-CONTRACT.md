# R14 performance contract

STATUS: **CONTRACT — QUALIFICATION CEILINGS, NOT A SERVICE LEVEL**

The bible states no latency SLO, no RPS target, and no RPO/RTO. This contract does not invent them.

`scripts/certification/performance-smoke.mjs`, against `npm start`, must:

- request `/`, `/login`, `/latest`, `/magazine`, `/api/health/live`, and `/api/health/ready`
- require HTTP 200 for each
- require each response in under 5000 ms on the qualification runner
- issue 10 concurrent `GET /` requests and require zero failures and a slowest response under 8000 ms
- print the measured milliseconds

These ceilings only detect a hung or crashed qualification process. They are not a production capacity claim. Load against a production host is not authorized, because no production host exists. A passing smoke is not a load test of customer traffic.

Resource evidence is the script's timings plus the job's success. CPU and memory profiles are not collected and must not be fabricated.
