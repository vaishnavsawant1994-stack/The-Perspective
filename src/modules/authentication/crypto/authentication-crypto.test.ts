import { describe, expect, it } from "vitest";
import { openSecret, sealSecret } from "./sealed-secret";
import {
  decodeBase32,
  encodeBase32,
  generateTotpCode,
  verifyTotpCode,
} from "./totp";
import { createOpaqueToken, hashOpaqueToken } from "./tokens";

describe("R3 token and secret cryptography", () => {
  it("generates meaningless 256-bit tokens and stable non-reversible hashes", () => {
    const first = createOpaqueToken();
    const second = createOpaqueToken();
    expect(first).not.toBe(second);
    expect(Buffer.from(first, "base64url")).toHaveLength(32);
    expect(hashOpaqueToken(first)).toHaveLength(64);
    expect(hashOpaqueToken(first)).toBe(hashOpaqueToken(first));
  });

  it("authenticates sealed data and binds it to associated context", () => {
    const key = Buffer.alloc(32, 9);
    const sealed = sealSecret("sensitive-value", key, 3, "context-a");
    expect(JSON.stringify(sealed)).not.toContain("sensitive-value");
    expect(openSecret(sealed, key, 3, "context-a")).toBe("sensitive-value");
    expect(() => openSecret(sealed, key, 3, "context-b")).toThrow();
    expect(() => openSecret(sealed, key, 2, "context-a")).toThrow();
  });

  it("matches RFC 6238 SHA-1 vectors and enforces six-digit verification", () => {
    const seed = encodeBase32(Buffer.from("12345678901234567890", "ascii"));
    expect(decodeBase32(seed).toString("ascii")).toBe("12345678901234567890");
    expect(generateTotpCode(seed, 59_000, 8)).toBe("94287082");
    const current = generateTotpCode(seed, 1_111_111_109_000);
    expect(verifyTotpCode(seed, current, 1_111_111_109_000)).toBe(true);
    expect(verifyTotpCode(seed, "12345", 1_111_111_109_000)).toBe(false);
  });
});

