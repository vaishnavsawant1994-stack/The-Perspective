import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const blueprint = readFileSync("render.yaml", "utf8");
const siteConfig = readFileSync("src/config/site.ts", "utf8");
const productionBoundary = readFileSync("src/modules/foundation/config/production-boundary.ts", "utf8");

const requiredBlueprintFragments = [
  "name: the-perspective-candidate",
  "region: frankfurt",
  "branch: main",
  "preDeployCommand: npm run db:migrate:deploy",
  "healthCheckPath: /api/health/ready",
  "key: DATABASE_URL",
  "fromDatabase:",
  "property: connectionString",
  "key: PERSPECTIVE_REQUIRE_PRODUCTION_CONFIG",
  "key: PERSPECTIVE_AUTH_BOUNDARY_MODE",
  "key: PERSPECTIVE_PUBLIC_APP_ORIGIN",
  "key: NEXT_PUBLIC_PERSPECTIVE_SITE_URL",
  "key: NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL",
  "key: PERSPECTIVE_AUTH_DATA_KEY",
  "generateValue: true",
  "key: PERSPECTIVE_R9_WORKER_TOKEN",
];
for (const fragment of requiredBlueprintFragments) {
  assert.ok(blueprint.includes(fragment), `render.yaml is missing ${fragment}`);
}

assert.match(
  blueprint,
  /key: PERSPECTIVE_PUBLIC_APP_ORIGIN\s+sync: false/u,
  "public app origin must be supplied explicitly at Blueprint sync time",
);
assert.match(
  blueprint,
  /key: NEXT_PUBLIC_PERSPECTIVE_SITE_URL\s+sync: false/u,
  "canonical site URL must be supplied explicitly at Blueprint sync time",
);
assert.match(
  blueprint,
  /key: NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL\s+sync: false/u,
  "editorial email must be supplied explicitly at Blueprint sync time",
);
assert.doesNotMatch(blueprint, /PERSPECTIVE_AUTH_DATA_KEY\s+value:/u, "auth data key must never be hardcoded");
assert.doesNotMatch(blueprint, /PERSPECTIVE_R9_WORKER_TOKEN\s+value:/u, "worker token must never be hardcoded");

assert.match(siteConfig, /process\.env\.NEXT_PUBLIC_PERSPECTIVE_SITE_URL/u);
assert.match(siteConfig, /process\.env\.NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL/u);
assert.match(productionBoundary, /NEXT_PUBLIC_PERSPECTIVE_SITE_URL/u);
assert.match(productionBoundary, /NEXT_PUBLIC_PERSPECTIVE_EDITORIAL_EMAIL/u);
assert.match(productionBoundary, /reservedProductionSuffixes/u);

process.stdout.write(`${JSON.stringify({
  v1_production_readiness_contract: "pass",
  blueprint: "render.yaml",
  database_link: "fromDatabase.connectionString",
  migrations: "pre-deploy",
  health_check: "/api/health/ready",
  public_identity: "sync-time-required",
  secrets: "generated-or-uncommitted",
  production_deployed: false,
  v1_certified: false,
})}\n`);
