import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const BASE32_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

export function encodeBase32(value: Buffer) {
  let bits = "";
  for (const byte of value) bits += byte.toString(2).padStart(8, "0");

  let output = "";
  for (let index = 0; index < bits.length; index += 5) {
    const chunk = bits.slice(index, index + 5).padEnd(5, "0");
    output += BASE32_ALPHABET[Number.parseInt(chunk, 2)];
  }
  return output;
}

export function decodeBase32(value: string) {
  let bits = "";
  for (const character of value.replace(/=+$/u, "").toUpperCase()) {
    const index = BASE32_ALPHABET.indexOf(character);
    if (index < 0) throw new Error("Invalid base32 value.");
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let index = 0; index + 8 <= bits.length; index += 8) {
    bytes.push(Number.parseInt(bits.slice(index, index + 8), 2));
  }
  return Buffer.from(bytes);
}

export function createTotpSeed() {
  return encodeBase32(randomBytes(20));
}

export function generateTotpCode(
  seed: string,
  timestamp = Date.now(),
  digits = 6,
  periodSeconds = 30,
) {
  const counter = Math.floor(timestamp / 1000 / periodSeconds);
  const message = Buffer.alloc(8);
  message.writeBigUInt64BE(BigInt(counter));
  const digest = createHmac("sha1", decodeBase32(seed)).update(message).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** digits).padStart(digits, "0");
}

export function verifyTotpCode(seed: string, code: string, timestamp = Date.now()) {
  if (!/^\d{6}$/u.test(code)) return false;
  const submitted = Buffer.from(code, "utf8");

  for (const offset of [-1, 0, 1]) {
    const expected = Buffer.from(
      generateTotpCode(seed, timestamp + offset * 30_000),
      "utf8",
    );
    if (timingSafeEqual(submitted, expected)) return true;
  }
  return false;
}

export function buildTotpUri(seed: string, accountName: string) {
  const issuer = "The Perspective";
  const label = encodeURIComponent(`${issuer}:${accountName}`);
  const params = new URLSearchParams({
    secret: seed,
    issuer,
    algorithm: "SHA1",
    digits: "6",
    period: "30",
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

