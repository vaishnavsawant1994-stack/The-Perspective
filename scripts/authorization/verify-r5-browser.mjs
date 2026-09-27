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

function decodeBase32(value) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let bits = "";
  for (const character of value.replace(/=+$/u, "").toUpperCase()) {
    const index = alphabet.indexOf(character);
    if (index < 0) throw new Error("Invalid base32 value.");
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

function generateTotpCode(seed, timestamp = Date.now()) {
  const counter = Math.floor(timestamp / 1000 / 30);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(seed)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 1_000_000).padStart(6, "0");
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

async function contextFor(browser, credentials) {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  await page.goto(absolute("/login"));
  await page.waitForLoadState("networkidle");

  const login = await api(page, "/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify({
      email: credentials.email,
      password: credentials.password,
      surface: "TEAM",
      remember: false,
    }),
  });
  assert.equal(login.status, 202);
  assert.equal(login.body?.status, "mfa_required");
  assert.equal(typeof login.body?.challengeToken, "string");

  const verified = await api(page, "/api/v1/auth/mfa/verify", {
    method: "POST",
    body: JSON.stringify({
      challengeToken: login.body.challengeToken,
      code: generateTotpCode(credentials.totpSeed),
    }),
  });
  assert.equal(verified.status, 200);
  assert.equal(verified.body?.status, "authenticated");

  const cookies = await context.cookies(baseUrl);
  assert.ok(
    cookies.some((cookie) => cookie.name === "__Host-perspective-session"),
    "production session cookie was not issued after MFA",
  );

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
