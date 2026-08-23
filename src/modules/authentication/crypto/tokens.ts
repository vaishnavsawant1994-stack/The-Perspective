import { createHash, createHmac, randomBytes } from "node:crypto";

export function createOpaqueToken() {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string) {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export function hashSensitiveSignal(value: string, key: Buffer) {
  return createHmac("sha256", key).update(value, "utf8").digest("hex");
}

export function normalizeLoginIdentifier(value: string) {
  return value.trim().toLocaleLowerCase("en-US");
}

