import { createHash } from "node:crypto";

export function normalizeDispatchDestination(
  channel: string,
  destination: string,
) {
  const normalizedChannel = channel.trim().toUpperCase();
  const value = destination.trim();

  if (normalizedChannel === "EMAIL") {
    return value.toLowerCase();
  }

  if (normalizedChannel === "SMS" || normalizedChannel === "PHONE") {
    const leadingPlus = value.startsWith("+") ? "+" : "";
    return leadingPlus + value.replace(/\D/g, "");
  }

  return value;
}

export function hashNormalizedDestination(
  channel: string,
  destination: string,
) {
  const normalizedChannel = channel.trim().toUpperCase();
  const normalizedDestination = normalizeDispatchDestination(
    normalizedChannel,
    destination,
  );

  return createHash("sha256")
    .update(normalizedChannel)
    .update(":")
    .update(normalizedDestination)
    .digest("hex");
}
