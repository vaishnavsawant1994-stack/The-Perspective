import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const token = process.env.R10_DESK_TOKEN ?? "";
assert.ok(token.length > 20, "R10 desk session token is missing");
const evidenceDir = "artifacts/r10-desk";
await mkdir(evidenceDir, { recursive: true });

const desks = [
  { path: "/app/distribution/desk", heading: "Distribution desk", field: "name-field", value: "Harbor Dispatch" },
  { path: "/app/podcasts/desk", heading: "Podcast desk", field: "title-field", value: "Harbor Notes" },
  { path: "/app/videos/desk", heading: "Video desk", field: "title-field", value: "Harbor Cut" },
  { path: "/app/events/desk", heading: "Event desk", field: "title-field", value: "Harbor Summit", start: true },
];

const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  await context.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${token}` });
  const page = await context.newPage({ viewport: { width: 390, height: 844 } });

  const anonymous = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const denied = await anonymous.goto(new URL("/app/distribution/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(new URL(denied?.url() ?? baseUrl).pathname, "/login");
  await anonymous.close();

  const missing = await page.request.get(new URL("/api/v1/r10/public/deliveries/not-a-real-delivery", baseUrl).toString());
  assert.equal(missing.status(), 404);
  assert.equal((await missing.text()).includes("UNPUBLISHED-R10-SECRET"), false);

  for (const [index, desk] of desks.entries()) {
    const response = await page.goto(new URL(desk.path, baseUrl).toString(), { waitUntil: "domcontentloaded" });
    assert.equal(response?.status(), 200, desk.path);
    await page.getByRole("heading", { name: desk.heading }).waitFor();
    await page.getByRole("status").filter({ hasText: "Opening this desk does not grant authority." }).waitFor();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert.ok(overflow <= 1, `${desk.path} overflowed by ${overflow}px on mobile`);
    const field = page.locator(`#${desk.field}`);
    await field.focus();
    await field.fill(desk.value);
    if (desk.start) await page.locator("#start-field").fill("2026-12-01T15:00");
    await page.locator("form").getByRole("button", { name: "Create" }).click();
    await page.getByRole("status").filter({ hasText: "Created. It is not public and it is not delivered." }).waitFor();
    await page.keyboard.press("Tab");
    if (index === 0) await page.screenshot({ path: `${evidenceDir}/desk-mobile.png`, fullPage: false });
  }

  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(new URL("/app/distribution/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(desktopOverflow <= 1, `desktop desk overflowed by ${desktopOverflow}px`);
  await page.getByRole("link", { name: "Podcasts" }).focus();
  await page.screenshot({ path: `${evidenceDir}/desk-desktop.png`, fullPage: false });
} finally {
  await browser.close();
}

process.stdout.write("R10 desk qualification passed\n");
