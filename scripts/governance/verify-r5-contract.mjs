import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

function read(path) {
  return readFileSync(path, "utf8");
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const metadataText = read("docs/phase-4/PHASE-4-R5-PERMISSION-POLICY-METADATA.md");
const roleText = read("docs/phase-4/PHASE-4-R5-LAUNCH-ROLE-PERMISSION-MATRIX.md");
const threatText = read("docs/phase-4/PHASE-4-R5-AUTHORIZATION-THREAT-MODEL.md");
const contractText = read("docs/phase-4/PHASE-4-R5-IMPLEMENTATION-CONTRACT.md");
const waiverText = read("docs/phase-4/PHASE-4-R5-GATE-B-ENHANCED-QUALIFICATION-WAIVER.md");
const enhancedAuditText = read("docs/phase-4/PHASE-4-R5-GATE-B-ENHANCED-AUDIT.md");
const governanceText = read("docs/GOVERNANCE-REVIEW-POLICY.md");

const metadata = new Map();
for (const line of metadataText.split("\n")) {
  const match = line.match(/^\| `([^`]+)` \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/);
  if (!match) continue;
  const [, key, surface, risk, assignability, scopes, field, workflow, obligations, activation] = match;
  assert(!metadata.has(key), `Duplicate permission metadata: ${key}`);
  assert(!key.includes("*"), `Wildcard permission is prohibited: ${key}`);
  metadata.set(key, {
    surface: surface.trim(),
    risk: risk.trim(),
    assignability: assignability.trim(),
    scopes: scopes.split(",").map((value) => value.trim()),
    field: field.trim(),
    workflow: workflow.trim(),
    obligations: obligations.trim(),
    activation: activation.trim(),
  });
}

assert(metadata.size === 170, `Expected 170 permission metadata rows, found ${metadata.size}`);

const allowedSurfaces = new Set(["TEAM", "CLIENT", "SELF_TEAM", "SELF_CLIENT", "SYSTEM"]);
const allowedRisks = new Set(["LOW", "MEDIUM", "HIGH", "CRITICAL"]);
const allowedAssignability = new Set(["TEAM_ROLE", "CLIENT_ROLE", "SELF_ONLY", "SYSTEM_ONLY"]);
const allowedScopes = new Set(["ORG", "DEPT", "ASN", "OWN", "CLIENT", "READ", "NONE"]);

for (const [key, value] of metadata) {
  assert(allowedSurfaces.has(value.surface), `Invalid surface for ${key}: ${value.surface}`);
  assert(allowedRisks.has(value.risk), `Invalid risk for ${key}: ${value.risk}`);
  assert(allowedAssignability.has(value.assignability), `Invalid assignability for ${key}: ${value.assignability}`);
  assert(value.scopes.length > 0, `Missing scopes for ${key}`);
  for (const scope of value.scopes) assert(allowedScopes.has(scope), `Invalid scope for ${key}: ${scope}`);
  if (value.assignability === "CLIENT_ROLE") {
    assert(value.surface === "CLIENT", `CLIENT_ROLE permission must use CLIENT surface: ${key}`);
    assert(value.scopes.includes("CLIENT"), `CLIENT_ROLE permission must allow CLIENT scope: ${key}`);
  }
  if (value.assignability === "SELF_ONLY") {
    assert(value.surface.startsWith("SELF_"), `SELF_ONLY permission must use SELF surface: ${key}`);
  }
}

const bundles = new Map();
let currentBundle = null;
for (const line of roleText.split("\n")) {
  const heading = line.match(/^### (B\d{2}) — /);
  if (heading) {
    currentBundle = heading[1];
    assert(!bundles.has(currentBundle), `Duplicate bundle ${currentBundle}`);
    bundles.set(currentBundle, []);
    continue;
  }
  if (currentBundle && (/^### /.test(line) || /^## /.test(line))) currentBundle = null;
  if (currentBundle) {
    const permission = line.match(/^- `([^`]+)`$/);
    if (permission) bundles.get(currentBundle).push(permission[1]);
  }
}

const expectedBundles = Array.from({ length: 17 }, (_, index) => `B${String(index + 1).padStart(2, "0")}`);
assert(bundles.size === 17, `Expected 17 bundles, found ${bundles.size}`);
for (const bundle of expectedBundles) assert(bundles.has(bundle), `Missing bundle ${bundle}`);

for (const [bundle, permissions] of bundles) {
  assert(permissions.length > 0, `Bundle ${bundle} is empty`);
  for (const permission of permissions) {
    assert(metadata.has(permission), `Unknown permission ${permission} in ${bundle}`);
    assert(metadata.get(permission).assignability !== "SELF_ONLY", `SELF_ONLY permission ${permission} appears in ${bundle}`);
  }
}

const launchRoles = [];
for (const line of roleText.split("\n")) {
  const match = line.match(/^\| (R\d{2}) ([^|]+) \| ([^|]+) \| (.+) \|$/);
  if (!match) continue;
  launchRoles.push({
    code: match[1],
    name: match[2].trim(),
    scopes: match[3].split(",").map((value) => value.trim()),
    specification: match[4],
  });
}

const expectedRoles = Array.from({ length: 17 }, (_, index) => `R${String(index + 1).padStart(2, "0")}`);
assert(launchRoles.length === 17, `Expected 17 launch roles, found ${launchRoles.length}`);
for (const role of expectedRoles) assert(launchRoles.some((candidate) => candidate.code === role), `Missing launch role ${role}`);

for (const role of launchRoles) {
  for (const scope of role.scopes) assert(allowedScopes.has(scope), `Invalid role scope ${scope} for ${role.code}`);

  let permissions = [];
  if (role.specification.includes("ALL TEAM_ROLE permissions")) {
    permissions = [...metadata.entries()].filter(([, value]) => value.assignability === "TEAM_ROLE").map(([key]) => key);
  } else {
    for (const match of role.specification.matchAll(/\bB\d{2}\b/g)) {
      assert(bundles.has(match[0]), `Unknown bundle ${match[0]} in ${role.code}`);
      permissions.push(...bundles.get(match[0]));
    }
    for (const match of role.specification.matchAll(/`([^`]+)`/g)) permissions.push(match[1]);
  }

  permissions = [...new Set(permissions)];
  assert(permissions.length > 0, `Role ${role.code} resolves to no permissions`);

  for (const permission of permissions) {
    const definition = metadata.get(permission);
    assert(definition, `Unknown permission ${permission} in ${role.code}`);
    assert(definition.assignability !== "SELF_ONLY", `SELF_ONLY permission ${permission} in ${role.code}`);
    if (role.code === "R17") {
      assert(definition.assignability === "CLIENT_ROLE", `R17 contains non-client permission ${permission}`);
    } else {
      assert(definition.assignability !== "CLIENT_ROLE", `${role.code} contains client-only permission ${permission}`);
    }
    assert(role.scopes.some((scope) => definition.scopes.includes(scope)), `No scope compatibility for ${role.code} -> ${permission}`);
  }
}

const clientSection = roleText.split("## 6. Client capability-role templates")[1]?.split("## 7.")[0] ?? "";
const clientPermissions = [...new Set([...clientSection.matchAll(/`([a-z][a-z0-9]*(?:\.[a-z0-9_-]+)+)`/g)].map((match) => match[1]))];
assert(clientPermissions.length > 0, "No client capability permissions found");
for (const permission of clientPermissions) {
  assert(metadata.has(permission), `Unknown client capability permission ${permission}`);
  assert(metadata.get(permission).assignability === "CLIENT_ROLE", `Client capability uses non-CLIENT_ROLE permission ${permission}`);
}

const selfSection = roleText.split("## 7. Self-service permissions outside RBAC")[1]?.split("## 8.")[0] ?? "";
const selfPermissions = [...new Set([...selfSection.matchAll(/`([a-z][a-z0-9]*(?:\.[a-z0-9_-]+)+)`/g)].map((match) => match[1]))];
assert(selfPermissions.length > 0, "No self-service permissions found");
for (const permission of selfPermissions) {
  assert(metadata.has(permission), `Unknown self-service permission ${permission}`);
  assert(metadata.get(permission).assignability === "SELF_ONLY", `Self-service permission is not SELF_ONLY: ${permission}`);
}

const threatIds = [...new Set([...threatText.matchAll(/^\| (A\d{2}) \|/gm)].map((match) => match[1]))];
const expectedThreats = Array.from({ length: 60 }, (_, index) => `A${String(index + 1).padStart(2, "0")}`);
assert(threatIds.length === 60, `Expected 60 threat cases, found ${threatIds.length}`);
for (const id of expectedThreats) assert(threatIds.includes(id), `Missing threat case ${id}`);

for (const marker of [
  "authentication != tenant selection != authorization",
  "R6–R14 remain locked",
  "Design 154",
  "OWNER-WAIVED",
  "independent external review was **NOT PERFORMED**",
  "same-grant",
]) assert(contractText.includes(marker), `Implementation contract missing marker: ${marker}`);

for (const marker of [
  "Independent external review: NOT PERFORMED",
  "Independent-review requirement: OWNER-WAIVED under GOV-REVIEW-01",
  "Replacement control: ENHANCED QUALIFICATION",
  "R5 implementation: NOT AUTHORIZED",
]) assert(waiverText.includes(marker), `Waiver record missing marker: ${marker}`);

assert(enhancedAuditText.includes("Blocking/high design findings:** none remain open"), "Enhanced audit has unresolved blocking/high design finding marker");
assert(enhancedAuditText.includes("Implementation authorization:** NOT READY"), "Enhanced audit must keep implementation locked");
assert(governanceText.includes("R14/V1.0 requires genuine external independent review"), "Governance policy must keep R14 independent review mandatory");

const diff = execFileSync("git", ["diff", "--name-only", "origin/main...HEAD"], { encoding: "utf8" }).trim().split("\n").filter(Boolean);
const allowed = [
  /^docs\/phase-4\/PHASE-4-R5-.*\.md$/,
  /^scripts\/governance\/verify-r5-contract\.mjs$/,
  /^\.github\/workflows\/r5-contract-enhanced-qualification\.yml$/,
];
const unexpected = diff.filter((path) => !allowed.some((pattern) => pattern.test(path)));
assert(unexpected.length === 0, `R5 contract branch contains out-of-scope files: ${unexpected.join(", ")}`);

process.stdout.write(JSON.stringify({
  verified: true,
  permissionCount: metadata.size,
  bundleCount: bundles.size,
  launchRoleCount: launchRoles.length,
  clientCapabilityPermissionCount: clientPermissions.length,
  selfServicePermissionCount: selfPermissions.length,
  threatCaseCount: threatIds.length,
  changedFiles: diff.length,
  unexpectedFiles: unexpected.length,
}, null, 2) + "\n");
