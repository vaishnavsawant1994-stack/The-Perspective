import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL;
const fixtureFile =
  process.env.PERSPECTIVE_R5_BROWSER_FIXTURE_FILE ??
  "/tmp/r5-browser-fixture.json";

if (!baseUrl) {
  throw new Error("R5 browser base URL is required.");
}

const fixture = JSON.parse(await readFile(fixtureFile, "utf8"));
const evidenceDir = "artifacts/r5-browser";
await mkdir(evidenceDir, { recursive: true });

function absolute(path) {
  return new URL(path, baseUrl).toString();
}

async function api(page, path, init = {}) {
  return page.evaluate(
    async ({ url, init }) => {
      const response = await fetch(url, {
        cache: "no-store",
        credentials: "include",
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...(init.headers ?? {}),
        },
      });
      const text = await response.text();
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }
      return { status: response.status, body };
    },
    { url: absolute(path), init },
  );
}

async function contextFor(browser, token) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  await context.addCookies([
    {
      name: "__Host-perspective-session",
      value: token,
      url: baseUrl,
      httpOnly: true,
      secure: true,
      sameSite: "Lax",
    },
  ]);
  const page = await context.newPage();
  await page.goto(absolute("/app/settings"));
  await page.waitForLoadState("networkidle");
  return { context, page };
}

const browser = await chromium.launch({ headless: true });
const evidence = {
  verified: false,
  anonymousDenied: false,
  forgedOrganizationRejected: false,
  legitimateRoleCreated: false,
  foreignRoleConcealed: false,
  selfAssignmentDenied: false,
  r02ToR01Denied: false,
  customAccessAdminDenied: false,
  staleWriteDenied: false,
};

try {
  const anonymous = await browser.newContext();
  const anonymousPage = await anonymous.newPage();
  await anonymousPage.goto(absolute("/"));
  const anonymousRoles = await api(
    anonymousPage,
    "/api/v1/workspace/roles",
  );
  assert.equal(anonymousRoles.status, 401);
  evidence.anonymousDenied = true;
  await anonymous.close();

  const r01 = await contextFor(browser, r01Token);
  const initialRoles = await api(r01.page, "/api/v1/workspace/roles");
  assert.equal(initialRoles.status, 200);
  assert.ok(initialRoles.body.roles.some((role) => role.key === "R01"));

  const forgedKey = "custom-browser-forged-org";
  const forged = await api(r01.page, "/api/v1/workspace/roles", {
    method: "POST",
    body: JSON.stringify({
      key: forgedKey,
      name: "Forged Org Role",
      defaultScope: "ORG",
      reason: "attempt forged organization",
      organizationId: fixture.platformOrganizationId,
    }),
  });
  assert.equal(forged.status, 400);
  const afterForged = await api(r01.page, "/api/v1/workspace/roles");
  assert.equal(
    afterForged.body.roles.some((role) => role.key === forgedKey),
    false,
  );
  evidence.forgedOrganizationRejected = true;

  const legitimateKey = "custom-browser-audited";
  const created = await api(r01.page, "/api/v1/workspace/roles", {
    method: "POST",
    body: JSON.stringify({
      key: legitimateKey,
      name: "R5 Browser Audited Role",
      defaultScope: "ORG",
      reason: "legitimate R5 browser administration",
    }),
  });
  assert.equal(created.status, 201);
  assert.equal(created.body.role.key, legitimateKey);
  evidence.legitimateRoleCreated = true;

  const foreign = await api(
    r01.page,
    `/api/v1/workspace/roles/${fixture.foreignRoleId}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: "Cross tenant overwrite",
        expectedUpdatedAt: fixture.foreignRoleUpdatedAt,
        reason: "cross tenant attack",
      }),
    },
  );
  assert.equal(foreign.status, 404);
  evidence.foreignRoleConcealed = true;

  const selfAssign = await api(
    r01.page,
    "/api/v1/workspace/membership-roles",
    {
      method: "POST",
      body: JSON.stringify({
        membershipId: fixture.r01MembershipId,
        roleId: fixture.r03RoleId,
        scope: "ORG",
        expectedMembershipUpdatedAt: fixture.r01MembershipUpdatedAt,
        reason: "attempt self escalation",
      }),
    },
  );
  assert.equal(selfAssign.status, 403);
  evidence.selfAssignmentDenied = true;

  const rolePermissions = await api(
    r01.page,
    `/api/v1/workspace/roles/${created.body.role.id}/permissions`,
  );
  assert.equal(rolePermissions.status, 200);

  const customEscalation = await api(
    r01.page,
    `/api/v1/workspace/roles/${created.body.role.id}/permissions`,
    {
      method: "PUT",
      body: JSON.stringify({
        expectedPermissionsHash: rolePermissions.body.permissionsHash,
        permissions: [
          {
            permissionKey: "role.manage",
            effect: "ALLOW",
            constraints: {},
          },
        ],
        reason: "attempt custom access admin",
      }),
    },
  );
  assert.equal(customEscalation.status, 403);
  const permissionsAfter = await api(
    r01.page,
    `/api/v1/workspace/roles/${created.body.role.id}/permissions`,
  );
  assert.equal(permissionsAfter.status, 200);
  assert.equal(
    permissionsAfter.body.permissionsHash,
    rolePermissions.body.permissionsHash,
  );
  evidence.customAccessAdminDenied = true;

  const stale = await api(
    r01.page,
    `/api/v1/workspace/roles/${created.body.role.id}`,
    {
      method: "PATCH",
      body: JSON.stringify({
        name: "Stale update should fail",
        expectedUpdatedAt: "2000-01-01T00:00:00.000Z",
        reason: "stale concurrency attack",
      }),
    },
  );
  assert.equal(stale.status, 403);
  const rolesAfterStale = await api(r01.page, "/api/v1/workspace/roles");
  const preserved = rolesAfterStale.body.roles.find(
    (role) => role.id === created.body.role.id,
  );
  assert.equal(preserved.name, "R5 Browser Audited Role");
  evidence.staleWriteDenied = true;

  await r01.page.screenshot({
    path: `${evidenceDir}/01-r01-protected-settings.png`,
    fullPage: true,
  });
  await r01.context.close();

  const r02 = await contextFor(browser, r02Token);
  const r02ToR01 = await api(
    r02.page,
    "/api/v1/workspace/membership-roles",
    {
      method: "POST",
      body: JSON.stringify({
        membershipId: fixture.targetMembershipId,
        roleId: fixture.r01RoleId,
        scope: "ORG",
        expectedMembershipUpdatedAt: fixture.targetMembershipUpdatedAt,
        reason: "attempt R02 to R01 escalation",
      }),
    },
  );
  assert.equal(r02ToR01.status, 403);
  evidence.r02ToR01Denied = true;
  await r02.context.close();

  evidence.verified = Object.entries(evidence)
    .filter(([key]) => key !== "verified")
    .every(([, value]) => value === true);
  assert.equal(evidence.verified, true);

  await writeFile(
    `${evidenceDir}/evidence.json`,
    JSON.stringify(evidence, null, 2),
    "utf8",
  );
  process.stdout.write(`${JSON.stringify(evidence)}\n`);
} finally {
  await browser.close();
}
