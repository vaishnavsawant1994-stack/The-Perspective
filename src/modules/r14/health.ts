export function liveStatus() {
  return { status: "live" as const };
}

export type ReadinessFailureCategory =
  | "missing-database-url"
  | "dns"
  | "network"
  | "authentication"
  | "database-not-found"
  | "tls"
  | "other";

// Only allowlisted categories are logged. Never log the error message or connection string.
export function readinessFailureCategory(error: unknown): ReadinessFailureCategory {
  if (typeof error !== "object" || error === null || !("code" in error)) return "other";
  const code = error.code;
  if (typeof code !== "string") return "other";
  if (code === "DATABASE_URL_UNSET") return "missing-database-url";
  if (code === "ENOTFOUND" || code === "EAI_AGAIN") return "dns";
  if (
    code === "ECONNREFUSED" ||
    code === "ECONNRESET" ||
    code === "ETIMEDOUT" ||
    code === "EHOSTUNREACH" ||
    code === "ENETUNREACH"
  ) return "network";
  if (code === "28P01" || code === "28000") return "authentication";
  if (code === "3D000") return "database-not-found";
  if (
    code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "CERT_HAS_EXPIRED"
  ) return "tls";
  return "other";
}

export async function readyStatus(
  probe: () => Promise<unknown>,
  onFailure?: (error: unknown) => void,
) {
  try {
    await probe();
    return { httpStatus: 200, body: { status: "ready" as const } };
  } catch (error) {
    try {
      onFailure?.(error);
    } catch {
      // Diagnostics must never change the readiness response.
    }
    return { httpStatus: 503, body: { status: "not-ready" as const } };
  }
}
