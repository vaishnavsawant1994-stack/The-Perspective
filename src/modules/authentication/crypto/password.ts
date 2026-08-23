import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

const SCRYPT_N = 32_768;
const SCRYPT_R = 8;
const SCRYPT_P = 3;
const SCRYPT_MAX_MEMORY = 64 * 1024 * 1024;
const KEY_LENGTH = 32;

const COMMON_PASSWORDS = new Set([
  "password123",
  "password123!",
  "qwerty123456",
  "letmein123456",
  "perspective123",
]);

function derive(password: string, salt: Buffer) {
  return new Promise<Buffer>((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: SCRYPT_MAX_MEMORY,
      },
      (error, key) => {
        if (error) reject(error);
        else resolve(key);
      },
    );
  });
}

export function validatePassword(password: string) {
  const issues: string[] = [];

  if (password.length < 12) issues.push("Password must contain at least 12 characters.");
  if (Buffer.byteLength(password, "utf8") > 1024) issues.push("Password is too long.");
  if (COMMON_PASSWORDS.has(password.toLocaleLowerCase("en-US"))) {
    issues.push("Choose a password that is not commonly used.");
  }

  return { valid: issues.length === 0, issues } as const;
}

export async function hashPassword(password: string, salt = randomBytes(16)) {
  const validation = validatePassword(password);
  if (!validation.valid) throw new Error(validation.issues.join(" "));

  const key = await derive(password, salt);
  return `scrypt$v=1$N=${SCRYPT_N},r=${SCRYPT_R},p=${SCRYPT_P}$${salt.toString("base64url")}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, encoded: string) {
  const parts = encoded.split("$");
  if (
    parts.length !== 5 ||
    parts[0] !== "scrypt" ||
    parts[1] !== "v=1" ||
    parts[2] !== `N=${SCRYPT_N},r=${SCRYPT_R},p=${SCRYPT_P}`
  ) {
    return false;
  }

  try {
    const salt = Buffer.from(parts[3], "base64url");
    const expected = Buffer.from(parts[4], "base64url");
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

let dummyHashPromise: Promise<string> | undefined;

export function getDummyPasswordHash() {
  dummyHashPromise ??= hashPassword(
    "invalid-authentication-credential",
    Buffer.from("ea11f6c5873d49c7bc10a4eb43bc36b2", "hex"),
  );
  return dummyHashPromise;
}

export const passwordHashProfile = Object.freeze({
  algorithm: "scrypt",
  version: 1,
  N: SCRYPT_N,
  r: SCRYPT_R,
  p: SCRYPT_P,
  saltBytes: 16,
  keyBytes: KEY_LENGTH,
});

