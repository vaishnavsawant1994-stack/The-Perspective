import { createHmac } from "node:crypto";

const IP_ADDRESS = /^[0-9a-fA-F:.]{3,45}$/u;

/** Creates a stable, pseudonymous per-IP key for the PN-04 daily request cap. */
export function profileRequestRateKeyFromHeaders(
  headers: Pick<Headers, "get">,
  secret: Uint8Array,
): string | null {
  const real = headers.get("x-real-ip");
  const forwarded = headers.get("x-forwarded-for")?.split(",").at(-1)?.trim();
  const ipAddress = real || forwarded || null;
  if (!ipAddress || !IP_ADDRESS.test(ipAddress) || secret.byteLength < 32) return null;

  return createHmac("sha256", secret)
    .update("profile-requests:v1|")
    .update(ipAddress)
    .digest("hex");
}
