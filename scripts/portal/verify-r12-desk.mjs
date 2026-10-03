import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL ?? "http://127.0.0.1:3100";
const [clientToken, memberToken] = (process.env.R12_DESK_TOKENS ?? "").split("\n");
assert.ok((clientToken ?? "").length > 20, "R12 client session token is missing");
assert.ok((memberToken ?? "").length > 20, "R12 member session token is missing");
const evidenceDir = "artifacts/r12-desk";
await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });

try {
  const anonymous = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const denied = await anonymous.goto(new URL("/client/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(new URL(denied?.url() ?? baseUrl).pathname, "/client/login");
  const library = await anonymous.goto(new URL("/my-perspective/library", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(library?.status(), 200);
  await anonymous.getByRole("status").filter({ hasText: "Sign in to see issues you are entitled to." }).waitFor();
  await anonymous.getByText("No entitled issue is visible.").waitFor();
  const mobileLibraryOverflow = await anonymous.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(mobileLibraryOverflow <= 1, `member library overflowed by ${mobileLibraryOverflow}px`);
  await anonymous.close();

  const clientContext = await browser.newContext();
  await clientContext.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${clientToken}` });
  const client = await clientContext.newPage({ viewport: { width: 390, height: 844 } });
  const clientResponse = await client.goto(new URL("/client/desk", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(clientResponse?.status(), 200);
  await client.getByRole("heading", { name: "Client desk" }).waitFor();
  await client.getByRole("status").filter({ hasText: "Opening this desk does not grant authority." }).waitFor();
  await client.getByText("Visible project").waitFor();
  const overflow = await client.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `client desk overflowed by ${overflow}px on mobile`);
  await client.getByRole("button", { name: "Approve this version" }).focus();
  await client.keyboard.press("Tab");
  await client.screenshot({ path: `${evidenceDir}/client-mobile.png`, fullPage: false });
  await client.setViewportSize({ width: 1280, height: 900 });
  const desktopOverflow = await client.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(desktopOverflow <= 1, `desktop client desk overflowed by ${desktopOverflow}px`);
  await client.screenshot({ path: `${evidenceDir}/client-desktop.png`, fullPage: false });

  const memberContext = await browser.newContext();
  await memberContext.setExtraHTTPHeaders({ cookie: `__Host-perspective-session=${memberToken}` });
  const member = await memberContext.newPage({ viewport: { width: 1280, height: 900 } });
  const memberResponse = await member.goto(new URL("/my-perspective/library", baseUrl).toString(), { waitUntil: "domcontentloaded" });
  assert.equal(memberResponse?.status(), 200);
  await member.getByRole("heading", { name: "Member library" }).waitFor();
  await member.getByText("No entitled issue is visible.").waitFor();
  await member.locator("#offer-id").fill("00000000-0000-4000-8000-000000000000");
  await member.getByRole("button", { name: "Request checkout" }).click();
  await member.getByRole("status").filter({ hasText: "Checkout was not started." }).waitFor();
  const memberOverflow = await member.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(memberOverflow <= 1, `desktop member library overflowed by ${memberOverflow}px`);
  await member.screenshot({ path: `${evidenceDir}/member-desktop.png`, fullPage: false });
} finally {
  await browser.close();
}

process.stdout.write("R12 desk qualification passed\n");
