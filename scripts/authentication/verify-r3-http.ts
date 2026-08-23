import { strict as assert } from "node:assert";
import { randomUUID } from "node:crypto";

const baseUrl = process.env.PERSPECTIVE_AUTH_TEST_BASE_URL;
const email = process.env.PERSPECTIVE_AUTH_FIXTURE_EMAIL;
const password = process.env.PERSPECTIVE_AUTH_FIXTURE_PASSWORD;

if (!baseUrl || !email || !password) {
  throw new Error("R3 HTTP test base URL, email, and password are required.");
}

function url(path: string) {
  return new URL(path, baseUrl).toString();
}

async function jsonMutation(path: string, body: unknown, cookie?: string) {
  return fetch(url(path), {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/json",
      Origin: new URL(baseUrl!).origin,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

const publicLogin = await fetch(url("/login"), { redirect: "manual" });
assert.equal(publicLogin.status, 200);
const publicLoginHtml = await publicLogin.text();
assert.match(publicLoginHtml, /Team Workspace Sign In/u);
assert.doesNotMatch(publicLoginHtml, /Perspective#2024/u);

const clientLogin = await fetch(url("/client/login"), { redirect: "manual" });
assert.equal(clientLogin.status, 200);
assert.match(await clientLogin.text(), /Sign in to access your client portal/u);
const clientRecovery = await fetch(url("/client/recover-access"), {
  redirect: "manual",
});
assert.equal(clientRecovery.status, 200);
assert.match(await clientRecovery.text(), /Request a password reset link/u);
const clientActivation = await fetch(url("/client/activate/invalid-validation-token"), {
  redirect: "manual",
});
assert.equal(clientActivation.status, 200);
assert.doesNotMatch(await clientActivation.text(), /Perspective#2024/u);

const protectedAnonymous = await fetch(url("/app"), { redirect: "manual" });
assert.equal(protectedAnonymous.status, 307);
assert.match(protectedAnonymous.headers.get("location") ?? "", /\/login\?next=%2Fapp$/u);

const missingOrigin = await fetch(url("/api/v1/auth/login"), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password, surface: "TEAM" }),
});
assert.equal(missingOrigin.status, 403);

const wrongContentType = await fetch(url("/api/v1/auth/login"), {
  method: "POST",
  headers: { "Content-Type": "text/plain", Origin: new URL(baseUrl).origin },
  body: "not-json",
});
assert.equal(wrongContentType.status, 400);

const wrongPassword = await jsonMutation("/api/v1/auth/login", {
  email,
  password: "definitely-not-the-password",
  surface: "TEAM",
});
const missingIdentity = await jsonMutation("/api/v1/auth/login", {
  email: `missing-${randomUUID()}@example.test`,
  password: "definitely-not-the-password",
  surface: "TEAM",
});
assert.equal(wrongPassword.status, 401);
assert.equal(missingIdentity.status, 401);
assert.deepEqual(await wrongPassword.json(), await missingIdentity.json());

const login = await jsonMutation("/api/v1/auth/login", {
  email,
  password,
  surface: "TEAM",
  remember: false,
});
assert.equal(login.status, 200);
const setCookie = login.headers.get("set-cookie") ?? "";
assert.match(setCookie, /perspective-session=/u);
assert.match(setCookie, /HttpOnly/iu);
assert.match(setCookie, /SameSite=Lax/iu);
const cookie = setCookie.split(";", 1)[0];

const session = await fetch(url("/api/v1/auth/session"), {
  headers: { Cookie: cookie },
  redirect: "manual",
});
assert.equal(session.status, 200);
const sessionBody = (await session.json()) as Record<string, unknown>;
assert.equal(sessionBody.authenticated, true);
assert.equal(sessionBody.surface, "TEAM");
assert.equal(sessionBody.mfaVerified, false);
assert.equal(typeof sessionBody.expiresAt, "string");

const protectedAuthenticated = await fetch(
  url("/app/settings"),
  { headers: { Cookie: cookie }, redirect: "manual" },
);
assert.equal(protectedAuthenticated.status, 200);

const arbitraryAuthenticated = await fetch(
  url("/app/sales/leads/an-arbitrary-id"),
  { headers: { Cookie: cookie }, redirect: "manual" },
);
assert.equal(arbitraryAuthenticated.status, 404);
assert.equal(arbitraryAuthenticated.headers.get("location"), null);

const wrongSurface = await fetch(url("/client"), {
  headers: { Cookie: cookie },
  redirect: "manual",
});
assert.equal(wrongSurface.status, 307);

const recoveryKnown = await jsonMutation("/api/v1/auth/recovery/request", {
  email,
  surface: "TEAM",
});
const recoveryUnknown = await jsonMutation("/api/v1/auth/recovery/request", {
  email: `missing-${randomUUID()}@example.test`,
  surface: "TEAM",
});
assert.equal(recoveryKnown.status, 202);
assert.equal(recoveryUnknown.status, 202);
assert.deepEqual(await recoveryKnown.json(), await recoveryUnknown.json());

const logout = await jsonMutation("/api/v1/auth/logout", {}, cookie);
assert.equal(logout.status, 200);
assert.match(logout.headers.get("set-cookie") ?? "", /Max-Age=0/iu);

const revokedSession = await fetch(url("/api/v1/auth/session"), {
  headers: { Cookie: cookie },
});
assert.equal(revokedSession.status, 401);
const protectedRevoked = await fetch(url("/app"), {
  headers: { Cookie: cookie },
  redirect: "manual",
});
assert.equal(protectedRevoked.status, 307);

process.stdout.write(
  `${JSON.stringify({
    verified: true,
    checks: 20,
    publicLogin: "pass",
    frozenAuthSurfaces: "pass",
    anonymousProtection: "pass",
    requestBoundary: "pass",
    enumerationResistance: "pass",
    sessionCookie: "pass",
    authenticatedProxy: "pass",
    surfaceIsolation: "pass",
    genericRecovery: "pass",
    logoutRevocation: "pass",
  })}\n`,
);
