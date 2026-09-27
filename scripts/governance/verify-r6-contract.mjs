import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const BASELINE = "2372418d80fa07f633a0e4adc99a21b1f7d8300a";

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

const requiredDocs = [
  "docs/phase-4/PHASE-4-R6-PLANNING-AUTHORIZATION.md",
  "docs/phase-4/PHASE-4-R6-PREDESIGN-AUDIT.md",
  "docs/phase-4/PHASE-4-R6-GATE-A-DECISIONS.md",
  "docs/phase-4/PHASE-4-R6-GATE-A-READINESS.md",
  "docs/phase-4/PHASE-4-R6-THREAT-MODEL.md",
  "docs/phase-4/PHASE-4-R6-AUTHORITY-ACTION-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-RESOURCE-FIELD-POLICY.md",
  "docs/phase-4/PHASE-4-R6-DATABASE-TENANCY-MATRIX.md",
  "docs/phase-4/PHASE-4-R6-IMPLEMENTATION-CONTRACT.md",
];

const docs = new Map(requiredDocs.map((path) => [path, read(path)]));
const authText = docs.get(requiredDocs[0]);
const auditText = docs.get(requiredDocs[1]);
const gateText = docs.get(requiredDocs[2]);
const readinessText = docs.get(requiredDocs[3]);
const threatText = docs.get(requiredDocs[4]);
const actionText = docs.get(requiredDocs[5]);
const resourceText = docs.get(requiredDocs[6]);
const tenancyText = docs.get(requiredDocs[7]);
const contractText = docs.get(requiredDocs[8]);

assert(authText.includes(BASELINE), "R6 planning authorization does not pin the exact authorized baseline");
assert(authText.includes("R6 production implementation:** NOT AUTHORIZED"), "R6 production implementation is not locked");
for (const marker of [
  "R7+:** NOT AUTHORIZED",
  "Design 154:** NOT AUTHORIZED",
  "V1.0 production certification:** NOT AUTHORIZED",
]) {
  assert(authText.includes(marker), `Planning authorization missing lock marker: ${marker}`);
}

assert(gateText.includes("## D01 — Proposal release ownership"), "Gate-A D01 is missing");
assert(gateText.includes("## D15 — Email template mutation activation ownership"), "Gate-A D15 is missing");
assert(gateText.includes("## D16 — R6 action-family enforcement"), "Gate-A D16 is missing");
assert(
  [...gateText.matchAll(/\*\*Status:\*\* OPEN — BLOCKS P4-R6-G0 FREEZE/g)].length >= 2,
  "Gate-A must keep both D01 and D15 explicitly blocking",
);
assert(readinessText.includes("Status:** NOT READY FOR P4-R6-G0 FREEZE"), "Gate-A readiness must remain NOT READY");
assert(readinessText.includes("Gate A                        NOT OWNER-APPROVED"), "Gate-A owner approval was inferred");
assert(readinessText.includes("P4-R6-G0                      NOT FROZEN"), "P4-R6-G0 was inferred frozen");

const threatIds = [...new Set(
  [...threatText.matchAll(/^\| (A\d{2,3}) \|/gm)].map((match) => match[1]),
)];
const expectedThreatIds = Array.from(
  { length: 120 },
  (_, index) => `A${String(index + 1).padStart(2, "0")}`,
);
assert(threatIds.length === 120, `Expected 120 R6 threat cases, found ${threatIds.length}`);
for (const id of expectedThreatIds) {
  assert(threatIds.includes(id), `Missing R6 threat case ${id}`);
}

const registryText = read("src/modules/authorization/registry.ts");
const r6Permissions = [];
for (const block of registryText.split(/\n  \{\n/)) {
  const key = block.match(/key:\s*"([^"]+)"/)?.[1];
  const stage = block.match(/activationStage:\s*"([^"]+)"/)?.[1];
  if (key && stage === "R6") r6Permissions.push(key);
}
r6Permissions.sort();
assert(r6Permissions.length === 41, `Expected exactly 41 accepted R6 permission keys, found ${r6Permissions.length}`);
for (const key of r6Permissions) {
  assert(actionText.includes("| `" + key + "` |"), `R6 action matrix is missing permission ${key}`);
}

const templateBlock = registryText
  .split(/\n  \{\n/)
  .find((block) => block.includes('key: "template.manage"'));
assert(templateBlock, "template.manage is missing from the accepted permission registry");
assert(templateBlock.includes('activationStage: "R6+"'), "template.manage stage changed before owner decision");
assert(actionText.includes("R6-G02 — Email Templates"), "R6-G02 template mismatch is not recorded");

const policyText = read("src/modules/authorization/policy.ts");
assert(
  /DEFAULT_ACTIVE_STAGES\s*=\s*new Set\(\["R5"\]\)/.test(policyText),
  "R6 planning changed the accepted default active stage",
);
assert(policyText.includes('definition.activationStage === "R5"'), "Expected R5-only action binding guard is missing");
assert(actionText.includes("Before any R6 permission becomes active"), "R6 action-family precondition is missing");

for (const resourceType of [
  "lead", "company", "contact", "lead-list", "outreach-campaign",
  "conversation", "message", "meeting", "deal", "client-account",
]) {
  assert(resourceText.includes("`" + resourceType + "`"), `Resource/field policy missing ${resourceType}`);
}

for (const table of [
  "crm.lead_sources",
  "crm.leads",
  "crm.companies",
  "crm.contacts",
  "crm.suppression_entries",
  "comms.outreach_campaigns",
  "comms.conversations",
  "comms.messages",
  "comms.meetings",
  "commercial.deal_pipelines",
  "commercial.deals",
  "commercial.client_accounts",
]) {
  assert(tenancyText.includes("`" + table + "`"), `Database tenancy matrix missing ${table}`);
}
for (const marker of ["DIRECT RLS", "PARENT RLS + FK", "ENABLE + FORCE", "R7 table"]) {
  assert(tenancyText.includes(marker), `Database tenancy matrix missing marker: ${marker}`);
}

for (const marker of ["R6-G01", "R6-G02", "R6-G03", "R6-A01", "R6-A02", "R6-A03"]) {
  assert(auditText.includes(marker), `R6 pre-design audit missing finding ${marker}`);
}

for (const marker of [
  "DRAFT G0 CANDIDATE — PRODUCTION IMPLEMENTATION NOT AUTHORIZED",
  "Mandatory action-family binding",
  "## 16. R7 boundary",
  "R6 production implementation: NOT AUTHORIZED",
]) {
  assert(contractText.includes(marker), `R6 implementation contract missing marker: ${marker}`);
}

const schemaText = read("prisma/schema.prisma");
assert(/schemas\s*=\s*\["iam",\s*"platform",\s*"audit"\]/.test(schemaText), "R6 planning changed Prisma datasource schemas");
for (const forbiddenSchema of ["crm", "comms", "commercial"]) {
  assert(
    !schemaText.includes('@@schema("' + forbiddenSchema + '")'),
    `R6 planning unexpectedly contains production ${forbiddenSchema} models`,
  );
}

const masterText = read("docs/THE-PERSPECTIVE-V1-MASTER-COMPLETION-BIBLE.md");
assert(masterText.includes("## R6 — CRM & Commercial Domain Engine"), "Master Bible R6 definition missing");
assert(
  masterText.includes("## R7 — Contracts, Invoices, Payments, Subscriptions & Entitlements"),
  "Master Bible R7 definition missing",
);

execFileSync("git", ["merge-base", "--is-ancestor", BASELINE, "HEAD"]);

const changedFiles = git(["diff", "--name-only", `${BASELINE}...HEAD`])
  .split("\n")
  .filter(Boolean);
const allowed = [
  /^docs\/phase-4\/PHASE-4-R6-.*\.md$/,
  /^scripts\/governance\/verify-r6-contract\.mjs$/,
  /^\.github\/workflows\/r6-contract-enhanced-qualification\.yml$/,
];
const unexpected = changedFiles.filter((path) => !allowed.some((pattern) => pattern.test(path)));
assert(
  unexpected.length === 0,
  `R6 G0 planning branch contains production/out-of-scope files: ${unexpected.join(", ")}`,
);

const productionChanges = changedFiles.filter(
  (path) => path.startsWith("prisma/") || path.startsWith("src/") || path.startsWith("public/"),
);
assert(
  productionChanges.length === 0,
  `R6 planning branch contains production changes: ${productionChanges.join(", ")}`,
);

process.stdout.write(JSON.stringify({
  verified: true,
  planningBaseline: BASELINE,
  requiredPlanningDocuments: requiredDocs.length,
  r6PermissionCount: r6Permissions.length,
  threatCaseCount: threatIds.length,
  gateAReady: false,
  openBlockingDecisions: ["D01", "D15"],
  defaultActiveStagePreserved: "R5",
  productionChanges: productionChanges.length,
  changedFiles: changedFiles.length,
  unexpectedFiles: unexpected.length,
}, null, 2) + "\n");
