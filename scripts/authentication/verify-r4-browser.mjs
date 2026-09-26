import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL;
const email = process.env.PERSPECTIVE_R4_BROWSER_EMAIL;
const password = process.env.PERSPECTIVE_R4_BROWSER_PASSWORD;

if (!baseUrl || !email || !password) {
  throw new Error("R4 browser base URL and credentials are required.");
}

const evidenceDir = "artifacts/r4-browser";
await mkdir(evidenceDir, { recursive: true });

function absolute(path) {
  return new URL(path, baseUrl).toString();
}

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const page = await context.newPage();
  const substantiveConsoleErrors = [];
  const unexpectedResponses = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      substantiveConsoleErrors.push(message.text());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) {
      const url = new URL(response.url());
      if (url.pathname !== "/favicon.ico") {
        unexpectedResponses.push(`${response.status()} ${url.pathname}`);
      }
    }
  });

  await page.goto(absolute("/client/login?next=%2Fclient"));
  await page.getByPlaceholder("name@company.com").fill(email);
  await page.getByPlaceholder("Enter your password").fill(password);
  await page.getByRole("button", { name: "Sign In", exact: true }).click();

  await page.getByRole("heading", { name: "Choose Organization" }).waitFor();
  const chooserText = await page.locator("body").innerText();
  assert.match(chooserText, /R4 Alpha Client Organization/u);
  assert.match(chooserText, /R4 Beta Client Organization/u);
  assert.equal(new URL(page.url()).pathname, "/client/login");

  const unselectedSession = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/session", { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
  assert.equal(unselectedSession.status, 200);
  assert.equal(unselectedSession.body.authenticated, true);
  assert.equal(unselectedSession.body.contextSelected, false);

  const protectedBeforeSelection = await context.request.get(absolute("/client"), {
    maxRedirects: 0,
  });
  assert.equal(protectedBeforeSelection.status(), 307);
  assert.match(protectedBeforeSelection.headers().location ?? "", /\/client\/login\?next=%2Fclient/u);

  const invalidSelection = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        membershipId: "00000000-0000-4000-8000-000000000001",
      }),
    });
    return response.status;
  });
  assert.equal(invalidSelection, 403);

  await page.screenshot({
    path: `${evidenceDir}/01-context-selection-required.png`,
    fullPage: true,
  });

  await page.getByRole("combobox").selectOption({
    label: "R4 Beta Client Organization",
  });
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/client");
  await page.getByRole("heading", { name: "Good morning, Michael! 👋" }).waitFor();

  const selectedSession = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/session", { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
  assert.equal(selectedSession.status, 200);
  assert.equal(selectedSession.body.contextSelected, true);
  assert.equal(selectedSession.body.surface, "CLIENT");

  const contexts = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/contexts", { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
  assert.equal(contexts.status, 200);
  assert.equal(contexts.body.contexts.length, 2);
  const beta = contexts.body.contexts.find(
    (entry) => entry.organizationName === "R4 Beta Client Organization",
  );
  const alpha = contexts.body.contexts.find(
    (entry) => entry.organizationName === "R4 Alpha Client Organization",
  );
  assert.ok(beta);
  assert.ok(alpha);
  assert.equal(contexts.body.currentMembershipId, beta.membershipId);

  await page.screenshot({
    path: `${evidenceDir}/02-beta-context-selected.png`,
    fullPage: true,
  });

  const switched = await page.evaluate(async (membershipId) => {
    const response = await fetch("/api/v1/auth/context", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ membershipId }),
    });
    return { status: response.status, body: await response.json() };
  }, alpha.membershipId);
  assert.equal(switched.status, 200);
  assert.equal(switched.body.context.organizationName, "R4 Alpha Client Organization");

  const afterSwitch = await page.evaluate(async () => {
    const response = await fetch("/api/v1/auth/contexts", { cache: "no-store" });
    return { status: response.status, body: await response.json() };
  });
  assert.equal(afterSwitch.status, 200);
  assert.equal(afterSwitch.body.currentMembershipId, alpha.membershipId);

  const protectedAfterSelection = await context.request.get(absolute("/client"), {
    maxRedirects: 0,
  });
  assert.equal(protectedAfterSelection.status(), 200);

  await page.screenshot({
    path: `${evidenceDir}/03-alpha-context-switched.png`,
    fullPage: true,
  });

  // Chromium's generic "Failed to load resource" console line omits the URL.
  // Network response assertions below retain the exact URL/status and are the
  // authoritative resource-failure gate.
  const filteredConsoleErrors = substantiveConsoleErrors.filter(
    (message) => !/Failed to load resource:/u.test(message),
  );
  const filteredResponses = unexpectedResponses.filter(
    (entry) =>
      entry !== "404 /app/projects" &&
      entry !== "403 /api/v1/auth/context",
  );

  assert.deepEqual(filteredConsoleErrors, []);
  assert.deepEqual(filteredResponses, []);

  process.stdout.write(
    `${JSON.stringify({
      verified: true,
      browser: "chromium",
      screenshots: 3,
      identitySessionWithoutTenant: "pass",
      protectedBeforeSelection: "pass",
      fabricatedContextDenied: "pass",
      contextSelection: "pass",
      selectedPortalAccess: "pass",
      contextSwitch: "pass",
      substantiveConsoleErrors: filteredConsoleErrors.length,
      unexpectedNetworkFailures: filteredResponses.length,
    })}\n`,
  );

  await context.close();
} finally {
  await browser.close();
}
