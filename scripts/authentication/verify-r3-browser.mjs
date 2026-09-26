import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL;
const teamEmail = process.env.PERSPECTIVE_BROWSER_TEAM_EMAIL;
const teamPassword = process.env.PERSPECTIVE_BROWSER_TEAM_PASSWORD;
const clientEmail = process.env.PERSPECTIVE_BROWSER_CLIENT_EMAIL;
const clientPassword = process.env.PERSPECTIVE_BROWSER_CLIENT_PASSWORD;
const invitationToken = process.env.PERSPECTIVE_BROWSER_INVITATION_TOKEN;

for (const [name, value] of Object.entries({
  baseUrl,
  teamEmail,
  teamPassword,
  clientEmail,
  clientPassword,
  invitationToken,
})) {
  if (!value) throw new Error(`${name} is required.`);
}

const evidenceDir = "artifacts/r3-browser";
await mkdir(evidenceDir, { recursive: true });

function absolute(path) {
  return new URL(path, baseUrl).toString();
}

async function visualCheck(page, name, expectedText) {
  await page.waitForLoadState("networkidle");
  const body = (await page.locator("body").innerText()).trim();
  assert.ok(body.length > 50, `${name}: page rendered too little content`);
  assert.match(body, expectedText, `${name}: expected semantic content missing`);

  const overlay = await page.locator(
    "[data-nextjs-dialog], .vite-error-overlay, #webpack-dev-server-client-overlay",
  ).count();
  assert.equal(overlay, 0, `${name}: framework error overlay visible`);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  assert.ok(overflow <= 2, `${name}: horizontal overflow detected (${overflow}px)`);

  await page.screenshot({
    path: `${evidenceDir}/${name}.png`,
    fullPage: true,
  });
}

const browser = await chromium.launch({ headless: true });
const consoleErrors = [];
const expectedAncillaryFailures = [];
const speculativePrefetchFailures = [];
const unexpectedNetworkFailures = [];

function observePage(page, label) {
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(`${label}: ${message.text()}`);
    }
  });
  page.on("response", (response) => {
    if (response.status() < 400) return;
    const request = response.request();
    const responseUrl = new URL(response.url());
    const headers = request.headers();
    const detail = `${label}: ${response.status()} ${responseUrl.pathname}`;

    if (response.status() === 404 && responseUrl.pathname === "/favicon.ico") {
      expectedAncillaryFailures.push(detail);
      return;
    }

    const isSpeculativePrefetch =
      !request.isNavigationRequest() &&
      (headers["next-router-prefetch"] === "1" ||
        headers.purpose === "prefetch" ||
        headers["sec-purpose"] === "prefetch");

    if (isSpeculativePrefetch) {
      speculativePrefetchFailures.push(detail);
      return;
    }

    unexpectedNetworkFailures.push(detail);
  });
}

try {
  const teamContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const teamPage = await teamContext.newPage();
  observePage(teamPage, "team");
  await teamPage.goto(absolute("/login?next=%2Fapp%2Fsettings"));
  await visualCheck(teamPage, "01-team-login-desktop", /Team Workspace Sign In/u);
  await teamPage.getByPlaceholder("Enter your work email address").fill(teamEmail);
  await teamPage.getByPlaceholder("Enter your password").fill(teamPassword);
  await teamPage.getByRole("button", { name: "Sign in", exact: true }).click();
  await teamPage.waitForURL((url) => url.pathname === "/app/settings");
  await visualCheck(teamPage, "02-team-authenticated-settings", /Settings/i);

  await teamPage.goto(absolute("/client"));
  await teamPage.waitForURL((url) => {
    return (
      url.pathname === "/client/login" &&
      url.searchParams.get("next") === "/client"
    );
  });
  await visualCheck(teamPage, "03-team-session-client-denial", /Sign in to access your client portal/u);
  await teamContext.close();

  const clientContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const clientPage = await clientContext.newPage();
  observePage(clientPage, "client");
  await clientPage.goto(absolute("/client/login?next=%2Fclient%2Fprojects"));
  await visualCheck(clientPage, "04-client-login-desktop", /Sign in to access your client portal/u);
  await clientPage.getByPlaceholder("name@company.com").fill(clientEmail);
  await clientPage.getByPlaceholder("Enter your password").fill(clientPassword);
  await clientPage.getByRole("button", { name: "Sign In", exact: true }).click();
  await clientPage.waitForURL((url) => url.pathname === "/client/projects");
  await visualCheck(clientPage, "05-client-authenticated-projects", /Projects/i);
  await clientContext.close();

  const inviteContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const invitePage = await inviteContext.newPage();
  observePage(invitePage, "invite");
  await invitePage.goto(
    absolute(`/client/activate/${encodeURIComponent(invitationToken)}`),
  );
  await invitePage.getByText("R3 Browser Invitation Organization", { exact: true }).first().waitFor();
  await visualCheck(
    invitePage,
    "06-client-invitation-valid",
    /R3 Browser Invitation Organization/u,
  );
  assert.match(await invitePage.locator("body").innerText(), /Browser Review Client/u);
  assert.doesNotMatch(
    await invitePage.locator("body").innerText(),
    /michael\.chen@visionaryleadership\.com|INV-2024-05016/u,
  );
  await invitePage.getByLabel("Full Name").fill("R3 Browser Invited User");
  await invitePage.getByLabel("Create Password").fill("R3 Browser Invitation Passphrase 2026!");
  await invitePage.getByLabel("Confirm Password").fill("R3 Browser Invitation Passphrase 2026!");
  const termsLabel = invitePage.locator("label").filter({ hasText: "I agree to the" });
  await termsLabel.click();
  assert.equal(await termsLabel.locator("input").isChecked(), true);
  await invitePage.getByRole("button", { name: /Activate My Account/u }).click();
  await invitePage.waitForURL((url) => url.pathname === "/client");
  await visualCheck(invitePage, "07-client-invitation-accepted", /Client/i);
  await inviteContext.close();

  const recoveryContext = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  const recoveryPage = await recoveryContext.newPage();
  observePage(recoveryPage, "recovery");
  await recoveryPage.goto(absolute("/client/recover-access"));
  await visualCheck(
    recoveryPage,
    "08-client-recovery-desktop",
    /Request a password reset link/u,
  );
  await recoveryPage.getByPlaceholder("name@company.com").fill("unknown-browser-user@example.test");
  await recoveryPage.getByRole("button", { name: /Send Recovery Link/u }).click();
  await recoveryPage.getByText(
    "If the account is eligible, recovery instructions will arrive shortly.",
    { exact: true },
  ).waitFor();
  await visualCheck(
    recoveryPage,
    "09-client-recovery-generic-result",
    /If the account is eligible/u,
  );
  await recoveryContext.close();

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();
  observePage(mobilePage, "mobile");
  await mobilePage.goto(absolute("/login"));
  await visualCheck(mobilePage, "10-team-login-mobile", /Team Workspace Sign In/u);
  await mobilePage.goto(absolute("/client/login"));
  await visualCheck(mobilePage, "11-client-login-mobile", /Sign in to access your client portal/u);
  await mobilePage.goto(absolute("/client/recover-access"));
  await visualCheck(
    mobilePage,
    "12-client-recovery-mobile",
    /Request a password reset link/u,
  );
  await mobileContext.close();

  const anonymousContext = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  });
  const anonymousPage = await anonymousContext.newPage();
  await anonymousPage.goto(absolute("/app/settings"));
  const redirected = new URL(anonymousPage.url());
  assert.equal(redirected.pathname, "/login");
  assert.equal(redirected.searchParams.get("next"), "/app/settings");
  await visualCheck(
    anonymousPage,
    "13-anonymous-protected-redirect",
    /Team Workspace Sign In/u,
  );
  await anonymousContext.close();

  assert.deepEqual(
    unexpectedNetworkFailures,
    [],
    `unexpected browser network failures detected:\n${unexpectedNetworkFailures.join("\n")}`,
  );
  const substantiveConsoleErrors = consoleErrors.filter(
    (message) => !/Failed to load resource: the server responded with a status of 404 \(Not Found\)/u.test(message),
  );
  const resource404ConsoleErrors = consoleErrors.filter(
    (message) => /Failed to load resource: the server responded with a status of 404 \(Not Found\)/u.test(message),
  );
  assert.deepEqual(
    substantiveConsoleErrors,
    [],
    `browser console errors detected:\n${substantiveConsoleErrors.join("\n")}`,
  );
  if (resource404ConsoleErrors.length > 0) {
    assert.ok(
      expectedAncillaryFailures.length > 0 || speculativePrefetchFailures.length > 0,
      `unattributed browser 404 console errors detected:\n${resource404ConsoleErrors.join("\n")}`,
    );
  }

  process.stdout.write(
    `${JSON.stringify({
      verified: true,
      browser: "chromium",
      screenshots: 13,
      teamLoginReturn: "pass",
      clientLoginReturn: "pass",
      crossSurfaceDenial: "pass",
      invitationMetadata: "pass",
      invitationAcceptance: "pass",
      recoveryGenericResponse: "pass",
      mobileVisuals: "pass",
      anonymousProtection: "pass",
      consoleErrors: substantiveConsoleErrors.length,
      ancillary404s: expectedAncillaryFailures,
      speculativePrefetchFailures,
      unexpectedNetworkFailures: unexpectedNetworkFailures.length,
    })}\n`,
  );
} finally {
  await browser.close();
}
