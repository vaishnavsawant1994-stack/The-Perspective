# R6 A01–A120 checkpoint

MATRIX HEAD: 6ba76113f3dbea5d180c251ff95d88dc9cb4b43a
QUALIFICATION: #283 SUCCESS
IMPLEMENTATION ANCHOR: 54bc2622… / #279
CONCURRENCY/DOCS BASELINE: c3bdb335… / #281

## Audit result
120 matrix rows exist. Not every row is a dedicated hostile test.

DIRECT (cited test attacks the stated condition):
A02, A11–A12, A17, A26–A28, A31–A33, A36, A39–A44, A49–A54, A59–A60,
A63–A67, A69–A78, A80–A85, A91–A110, A111–A113, A116.

STRUCTURAL (route/schema/client code enforces the invariant; no separate named attack):
A01, A03–A05, A08–A10, A14–A16, A19–A25, A29–A30, A34–A35, A38,
A45–A48, A55–A58, A61–A62, A68, A79, A86–A90, A114–A115, A117–A120.

INHERITED (satisfied only because R3/R4/R5 suites run inside R6 qualification, not a new R6-named attack):
A06, A07, A18.

EVIDENCE GAPS (do not stretch):
- A01 has no standalone unauthenticated GET /api/v1/r6/deals test file.
- No dedicated illegal cross-pipeline stage-jump HTTP test beyond malformed ID / WON class / missing resource.
- A06/A07 are not re-stated as R6-owned session tests.

These gaps are recorded. They do not authorize inventing UUID UI or R7 APIs.
They must be accepted as known limitations or closed with smallest tests before owner acceptance if the owner requires DIRECT evidence on every row.

NO defects were demonstrated by #283. No production repair in this checkpoint.
