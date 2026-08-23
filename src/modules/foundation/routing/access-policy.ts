export type RouteAccessDecision =
  | { readonly kind: "public" }
  | { readonly kind: "protected-team"; readonly signInPath: "/login" }
  | { readonly kind: "protected-client"; readonly signInPath: "/client/login" };

const CLIENT_ACTIVATION_PATH = /^\/client\/activate\/[^/]+\/?$/;

function normalizePathname(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
}

export function isPublicClientAuthPath(pathname: string) {
  const normalized = normalizePathname(pathname);

  return (
    normalized === "/client/login" ||
    normalized === "/client/recover-access" ||
    CLIENT_ACTIVATION_PATH.test(pathname)
  );
}

export function classifyRouteAccess(pathname: string): RouteAccessDecision {
  const normalized = normalizePathname(pathname);

  if (normalized === "/app" || normalized.startsWith("/app/")) {
    return { kind: "protected-team", signInPath: "/login" };
  }

  if (normalized === "/client" || normalized.startsWith("/client/")) {
    if (isPublicClientAuthPath(pathname)) {
      return { kind: "public" };
    }

    return { kind: "protected-client", signInPath: "/client/login" };
  }

  return { kind: "public" };
}

/** Prevents an eventual post-auth redirect from becoming an open redirect. */
export function sanitizeRelativeReturnPath(value: string) {
  if (!value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }

  try {
    const parsed = new URL(value, "https://route-policy.invalid");

    if (parsed.origin !== "https://route-policy.invalid") {
      return undefined;
    }

    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return undefined;
  }
}

export function buildSignInLocation(
  decision: Exclude<RouteAccessDecision, { readonly kind: "public" }>,
  returnPath: string,
) {
  const safeReturnPath = sanitizeRelativeReturnPath(returnPath);

  if (!safeReturnPath) {
    return decision.signInPath;
  }

  const params = new URLSearchParams({ next: safeReturnPath });
  return `${decision.signInPath}?${params.toString()}`;
}
