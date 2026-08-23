import { describe, expect, it } from "vitest";
import {
  hashPassword,
  passwordHashProfile,
  validatePassword,
  verifyPassword,
} from "./password";

describe("R3 password storage", () => {
  it("uses the locked scrypt profile and unique salts", async () => {
    const first = await hashPassword("Correct horse battery staple 1");
    const second = await hashPassword("Correct horse battery staple 1");
    expect(first).not.toBe(second);
    expect(first).toContain("scrypt$v=1$N=32768,r=8,p=3$");
    expect(passwordHashProfile).toMatchObject({ N: 32_768, r: 8, p: 3, saltBytes: 16 });
    await expect(verifyPassword("Correct horse battery staple 1", first)).resolves.toBe(true);
    await expect(verifyPassword("wrong password value", first)).resolves.toBe(false);
  });

  it("rejects weak, common, oversized, and malformed values", async () => {
    expect(validatePassword("short").valid).toBe(false);
    expect(validatePassword("password123!").valid).toBe(false);
    expect(validatePassword("x".repeat(1025)).valid).toBe(false);
    await expect(verifyPassword("anything", "sha256$not-accepted")).resolves.toBe(false);
  });
});

