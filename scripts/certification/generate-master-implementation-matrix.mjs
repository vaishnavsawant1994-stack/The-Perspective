import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";

const root = process.cwd();
const snapshot = process.argv[2] ?? execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
if (!/^[a-f0-9]{40}$/u.test(snapshot)) throw new Error("Pass a full source snapshot SHA as the first argument.");
const routeAuditPath = "docs/57-PAGE-IMPLEMENTATION-AUDIT.md";
const designAuditPath = "docs/phase-3/PHASE-3A-DOCUMENT-01-MASTER-153-DESIGN-AUDIT-AND-COMPONENT-MAPPING.md";

function sectionRows(contents, startHeading, endHeading, rowPattern) {
  const start = contents.indexOf(startHeading);
  const end = contents.indexOf(endHeading, start + startHeading.length);
  if (start < 0 || end < 0) throw new Error(`Could not find table section: ${startHeading}`);
  return contents.slice(start, end).split(/\r?\n/u).filter((line) => rowPattern.test(line));
}

function cells(line) {
  return line.trim().replace(/^\|/u, "").replace(/\|$/u, "").split(/\s+\|\s+/u).map((cell) => cell.trim());
}

function csv(value) {
  const text = String(value ?? "").replaceAll("\r", " ").replaceAll("\n", " ");
  return `"${text.replaceAll('"', '""')}"`;
}

function listPageFiles(directory = "src/app") {
  const result = [];
  if (existsSync(join(root, directory, "page.tsx"))) result.push(join(directory, "page.tsx"));
  for (const item of readdirSync(join(root, directory), { withFileTypes: true })) {
    if (!item.isDirectory()) continue;
    const path = join(directory, item.name);
    if (existsSync(join(root, path, "page.tsx"))) result.push(join(path, "page.tsx"));
    result.push(...listPageFiles(path));
  }
  return result;
}

function routeFromPageFile(file) {
  const relativePath = relative(join(root, "src/app"), join(root, file)).split(sep).join("/");
  if (relativePath === "page.tsx") return [];
  return relativePath.replace(/\/page\.tsx$/u, "").split("/").filter(Boolean);
}

const pageFiles = listPageFiles();
const pageRoutes = pageFiles.map((file) => ({ file, segments: routeFromPageFile(file) }));

function routeSource(route, title) {
  if (/^framework\s/i.test(route) || /Not Found/u.test(title)) {
    const boundary = /Not Found/u.test(title) ? "src/app/not-found.tsx" : "src/app/error.tsx; src/app/global-error.tsx or /500 preview";
    return { status: "Framework boundary", path: boundary };
  }
  if (/categorySlug/u.test(route)) {
    const matches = ["src/app/business/page.tsx", "src/app/leadership/page.tsx", "src/app/technology/page.tsx"].filter((path) => existsSync(join(root, path)));
    return { status: matches.length ? "Concrete routes present; shared template needs review" : "No route source found", path: matches.join("; ") };
  }
  const canonical = route.match(/`([^`]+)`/u)?.[1] ?? route;
  const pathname = canonical.split("?")[0].replaceAll("`", "").replace(/\{([^}]+)\}/gu, "[$1]");
  const expected = pathname.split("/").filter(Boolean);
  const found = pageRoutes.find(({ segments }) => expected.length === segments.length && expected.every((segment, index) => {
    const current = segments[index];
    return /^\[[^\]]+\]$/u.test(segment) ? /^\[[^\]]+\]$/u.test(current) : segment === current;
  }));
  if (found) return { status: "Page module present", path: found.file };
  const dynamic = pageRoutes.find(({ segments }) => expected.length === segments.length && expected.every((segment, index) => {
    const current = segments[index];
    return /^\[[^\]]+\]$/u.test(current) || segment === current;
  }));
  return dynamic
    ? { status: "Dynamic route handler present; content/404 must be checked separately", path: dynamic.file }
    : { status: "No exact or matching dynamic page module found", path: "" };
}

const rows = [];
const routeAudit = readFileSync(join(root, routeAuditPath), "utf8");
const publicRows = sectionRows(routeAudit, "## 57-page ledger", "## Existing routes outside the frozen 57", /^\|\s*\d+\s*\|/u);
for (const line of publicRows) {
  const [number, title, canonicalRoute, oldImplementation, oldDesign, oldData, nextAction] = cells(line);
  const source = routeSource(canonicalRoute, title);
  const normalizedSourcePath = source.path.split(sep).join("/");
  const isDiscovery = canonicalRoute.includes("/personal-magazines/discover");
  if (isDiscovery && normalizedSourcePath === "src/app/personal-magazines/discover/page.tsx") {
    source.status = `UI route present; production HTTP 200, canonical, sitemap, robots, and unknown-edition 404 verified; latest deployment main@${snapshot}; API/database/provider status not implied`;
  }
  rows.push({
    id: `PUB-${number.padStart(2, "0")}`,
    scope: "Public page contract",
    item: title,
    canonicalRouteOrSurface: canonicalRoute,
    codeEvidenceAtSnapshot: normalizedSourcePath,
    currentSourceState: source.status,
    historicalAuditStatus_2026_08_13: `${oldImplementation}; design: ${oldDesign}; data: ${oldData}`,
    securityOrTrustBoundary: "See route policy and current R14 production qualification; per-route runtime authorization still requires exact-head evidence.",
    remainingEvidenceOrAction: isDiscovery && normalizedSourcePath === "src/app/personal-magazines/discover/page.tsx"
      ? `Route and production canonical/indexing acceptance passed before this snapshot; latest production source is main@${snapshot}. Broader accessibility and authenticated journeys remain separate R14 gates.`
      : nextAction,
    sourceOfTruth: routeAuditPath,
  });
}

const designAudit = readFileSync(join(root, designAuditPath), "utf8");
const designRows = sectionRows(designAudit, "## 3. Canonical audited inventory", "## 4. Detailed canonical audit records", /^\|\s*\d{3}\s*\|/u);
for (const line of designRows) {
  const columns = cells(line);
  const [number, name, , surface, screenClass, classification, purpose, data, , auth, priority] = columns;
  rows.push({
    id: `DES-${number}`,
    scope: "Approved internal or shared design",
    item: name,
    canonicalRouteOrSurface: surface,
    codeEvidenceAtSnapshot: "Not mapped per design in Phase 3A; exact routes were explicitly deferred to the route/connection map.",
    currentSourceState: "Specification audit PASS; implementation and live-data coverage are separate, unverified dimensions.",
    historicalAuditStatus_2026_08_13: `${classification}; ${screenClass}; ${priority}; data anchor: ${data}`,
    securityOrTrustBoundary: auth,
    remainingEvidenceOrAction: `Map to live route/component and record fixture/API/database/provider status. Purpose: ${purpose}`,
    sourceOfTruth: designAuditPath,
  });
}

const releases = [
  ["R1", "Routing and application security foundation", "Accepted and merged within frozen scope", "docs/phase-4/PHASE-4-R1-CHECKPOINT.md"],
  ["R2", "PostgreSQL and Prisma persistence foundation", "Accepted and merged within frozen scope", "docs/phase-4/PHASE-4-R2-CHECKPOINT.md"],
  ["R3", "Identity, credentials, sessions, MFA, invitation and recovery", "Accepted and merged; positive production journey remains unqualified", "docs/phase-4/PHASE-4-R3-CHECKPOINT.md"],
  ["R4", "Organizations, membership context and tenant isolation", "Accepted and merged; real production tenant switching remains unqualified", "docs/phase-4/PHASE-4-R4-CHECKPOINT.md"],
  ["R5", "Permission registry, RBAC, scope and resource authorization", "Accepted and merged; independent V1 review remains open", "docs/phase-4/PHASE-4-R5-CHECKPOINT.md"],
  ["R6", "CRM, communications and commercial commands", "Accepted active command scope; live delivery providers are absent", "docs/phase-4/PHASE-4-R6-ACCEPTED-MERGED.md"],
  ["R7", "Proposals, contracts, signatures, invoices and payment evidence", "Accepted controlled scope; signature and payment providers fail closed", "docs/phase-4/PHASE-4-R7-COMPLETION-RECORD.md"],
  ["R8", "Projects and editorial production", "Accepted controlled scope", "docs/phase-4/PHASE-4-R8-COMPLETION-RECORD.md"],
  ["R9", "Magazine, publishing, immutable publication and reader", "Accepted controlled scope; published-reader behavior is database-backed", "docs/phase-4/PHASE-4-R9-COMPLETION-RECORD.md"],
  ["R10", "Podcasts, video, events and distribution", "Accepted selected operations; external distribution providers are absent", "docs/phase-4/PHASE-4-R10-COMPLETION-RECORD.md"],
  ["R11", "Growth, search, SEO, analytics, reports and automation", "Accepted selected internal capabilities", "docs/phase-4/PHASE-4-R11-COMPLETION-RECORD.md"],
  ["R12", "Client portal and member platform", "Accepted limited active surface; checkout returns PROVIDER_UNAVAILABLE", "docs/phase-4/PHASE-4-R12-COMPLETION-RECORD.md"],
  ["R13", "Enterprise operations and integration declarations", "Accepted limited active surface; provider verification returns PROVIDER_UNAVAILABLE", "docs/phase-4/PHASE-4-R13-COMPLETION-RECORD.md"],
  ["R14", "Technical qualification and production hardening", "Technical qualification merged; production runs at current main SHA; V1.0 remains NOT CERTIFIED", "docs/phase-4/PHASE-4-R14-TECHNICAL-RECORD.md"],
];
for (const [id, item, state, source] of releases) rows.push({ id, scope: "Accepted release capability", item, canonicalRouteOrSurface: "R1-R14 domain scope", codeEvidenceAtSnapshot: source, currentSourceState: state, historicalAuditStatus_2026_08_13: "Not applicable", securityOrTrustBoundary: "Use the accepted release contract; dormant permissions and fail-closed provider boundaries remain enforced.", remainingEvidenceOrAction: id === "R14" ? "Independent review; legitimate production identity and tenant-positive/negative checks; human alert acknowledgement; rollback rehearsal; owner-level branch-protection read-back; and cross-account/provider recovery strategy remain open. Daily encrypted backup and isolated restore evidence are recorded, but backup storage shares the Neon account/provider." : "Feature-level page/data/provider mappings are tracked separately from release acceptance.", sourceOfTruth: source });

const integrations = [
  ["INT-01", "Production hosting", "Vercel; production deployment READY; Node.js 24; fra1", `main@${snapshot}; production deployment dpl_GAMoYFogdsYr7ZDeHvXSzGZMJd95 verified READY on 2026-11-01`, "docs/release/CURRENT-STATE-RECONCILIATION-2026-11-01.md"],
  ["INT-02", "Production database", "Neon PostgreSQL 16, Frankfurt", "Production readiness returned HTTP 200; PITR history is six hours; automatic Neon snapshots are unavailable on the selected Free plan; production branch recovery remains limited", "docs/release/CURRENT-STATE-RECONCILIATION-2026-11-01.md"],
  ["INT-03", "Authentication and tenant onboarding", "Database-backed auth and tenancy exist; first-owner provisioning is proposed in draft PR #49", "PR #49 is not merged; no first-owner production account was created. Positive production login, MFA, tenant-selection, same-tenant and cross-tenant checks remain unqualified.", "https://github.com/vaishnavsawant1994-stack/The-Perspective/pull/49"],
  ["INT-04", "Email and notifications", "No production delivery provider", "Delivery must not be claimed; configure and qualify a provider in a separately approved release", "docs/phase-4/PHASE-4-V1-PRODUCT-SURFACE.md"],
  ["INT-05", "Payments and signatures", "No trusted production provider", "Payment and signature commands fail closed when provider evidence is absent", "docs/phase-4/PHASE-4-V1-PRODUCT-SURFACE.md"],
  ["INT-06", "Object storage", "No V1 object-storage upload product", "Do not advertise uploads or file delivery as operational", "docs/phase-4/PHASE-4-V1-PRODUCT-SURFACE.md"],
  ["INT-07", "Publishing distribution", "Internal SITE publication is supported", "External social, email and media delivery are not connected/qualified", "docs/phase-4/PHASE-4-R10-COMPLETION-RECORD.md"],
  ["INT-08", "Monitoring and paging", "Vercel runtime logs plus hourly liveness/readiness monitoring", "No configured alerting route has delivered and received human acknowledgement for a synthetic failure; R14 alert gate remains open", "docs/release/CURRENT-STATE-RECONCILIATION-2026-11-01.md"],
  ["INT-09", "Backup and recovery", "Daily encrypted database backup to a private Neon Free object-storage project with 30-day object retention", "Workflow run 41313449319 completed upload/read-back/decrypt and isolated restore of 146 application tables. Backup destination is in the same Neon account/provider; cross-account/provider recovery is not proven. Production PITR remains six hours.", "docs/runbooks/NEON-ENCRYPTED-DATABASE-BACKUPS.md"],
  ["INT-10", "AI assistance", "No live V1 assistant", "No model/provider integration is part of the accepted V1 surface", "docs/phase-4/PHASE-4-V1-PRODUCT-SURFACE.md"],
];
for (const [id, item, state, evidence, source] of integrations) rows.push({ id, scope: "Provider and operations integration", item, canonicalRouteOrSurface: "Production platform", codeEvidenceAtSnapshot: evidence, currentSourceState: state, historicalAuditStatus_2026_08_13: "Historical status reconciled against production deployment and latest project evidence where available.", securityOrTrustBoundary: "Production credentials stay in provider secret stores; app must fail closed without trusted provider evidence.", remainingEvidenceOrAction: evidence, sourceOfTruth: source });

const header = ["id", "scope", "item", "canonicalRouteOrSurface", "sourceSnapshotSha", "codeEvidenceAtSnapshot", "currentSourceState", "historicalAuditStatus_2026_08_13", "securityOrTrustBoundary", "remainingEvidenceOrAction", "sourceOfTruth"];
const lines = [header, ...rows.map((row) => header.map((key) => key === "sourceSnapshotSha" ? snapshot : row[key] ?? ""))].map((line) => line.map(csv).join(","));
if (publicRows.length !== 57) throw new Error(`Expected 57 public rows; found ${publicRows.length}`);
if (designRows.length !== 153) throw new Error(`Expected 153 design rows; found ${designRows.length}`);
const output = "docs/release/MASTER-IMPLEMENTATION-MATRIX-2026-11-01.csv";
writeFileSync(join(root, output), `${lines.join("\n")}\n`, "utf8");
process.stdout.write(`Wrote ${output}: ${publicRows.length} public pages, ${designRows.length} designs, ${releases.length} releases, ${integrations.length} integrations. Snapshot ${snapshot}.\n`);
