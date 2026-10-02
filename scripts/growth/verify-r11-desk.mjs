import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const token = process.env.R11_DESK_TOKEN ?? "";
assert.ok(token.length > 20, "R11 desk session token is missing");
const evidenceDir = "artifacts/r11-desk";
await mkdir(evidenceDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
try {
  const anonymous = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const denied = await anonymous.goto(new URL("/app/growth/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(new URL(denied?.url() ?? baseUrl).pathname, "/login");
  await anonymous.close();

  const context = await browser.newContext();
  await context.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${token}` });
  const page = await context.newPage({ viewport: { width: 390, height: 844 } });
  const response = await page.goto(new URL("/app/growth/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(response?.status(), 200);
  await page.getByRole("heading", { name: "Growth desk" }).waitFor();
  await page.getByRole("status").filter({ hasText: "Opening this desk does not grant authority." }).waitFor();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `growth desk overflowed by ${overflow}px on mobile`);
  await page.locator("form").getByRole("button", { name: "Request report" }).focus();
  await page.keyboard.press("Tab");
  await page.locator("form").getByRole("button", { name: "Request report" }).click();
  await page.getByRole("status").filter({ hasText: "Report requested. The numbers were derived by the server." }).waitFor();
  await page.screenshot({ path: `${evidenceDir}/desk-mobile.png`, fullPage: false });

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(new URL("/app/growth/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(desktopOverflow <= 1, `desktop growth desk overflowed by ${desktopOverflow}px`);
  await page.screenshot({ path: `${evidenceDir}/desk-desktop.png`, fullPage: false });

  const meta = await page.request.get(new URL("/api/v1/r11/public/meta/not-a-published-issue", baseUrl).toString());
  assert.equal(meta.status(), 404);
  const forged = await page.request.post(new URL("/api/v1/r11/public/observations", baseUrl).toString(), {
    data: { slug: "not-real", dedupe: "dedupekey", views: 100000 },
    headers: { origin: baseUrl },
  });
  assert.equal(forged.status(), 400);
  const robots = await page.request.get(new URL("/robots.txt", baseUrl).toString());
  assert.match(await robots.text(), /Disallow:\s*\/app\//);
} finally {
  await browser.close();
}

process.stdout.write("R11 desk qualification passed\n");
