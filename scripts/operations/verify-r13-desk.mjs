import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const token = process.env.R13_DESK_TOKEN ?? "";
assert.ok(token.length > 20, "R13 operator session token is missing");
const evidenceDir = "artifacts/r13-desk";
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const anonymous = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const denied = await anonymous.goto(new URL("/app/operations/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(new URL(denied?.url() ?? baseUrl).pathname, "/login");
  await anonymous.close();

  const context = await browser.newContext();
  await context.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${token}` });
  const page = await context.newPage({ viewport: { width: 390, height: 844 } });
  const response = await page.goto(new URL("/app/operations/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.getByRole("heading", { name: "Operations desk" }).waitFor();
  await page.getByRole("status").filter({ hasText: "Opening this desk does not grant authority." }).waitFor();
  await page.getByText("EMAIL — DECLARED").waitFor();
  await page.locator("#integration-type").fill("EMAIL");
  await page.getByRole("button", { name: "Check provider" }).focus();
  await page.keyboard.press("Tab");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `operations desk overflowed by ${overflow}px on mobile`);
  await page.screenshot({ path: `${evidenceDir}/operations-mobile.png`, fullPage: false });
  await page.setViewportSize({ width: 1280, height: 900 });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(desktopOverflow <= 1, `desktop operations desk overflowed by ${desktopOverflow}px`);
  await page.getByRole("button", { name: "Check provider" }).click();
  await page.getByRole("status").filter({ hasText: "No provider is configured. Nothing was verified." }).waitFor();
  await page.screenshot({ path: `${evidenceDir}/operations-desktop.png`, fullPage: false });
} finally {
  await browser.close();
}

process.stdout.write("R13 desk qualification passed\n");
