import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

export interface SealedSecret {
  readonly ciphertext: string;
  readonly nonce: string;
  readonly authTag: string;
  readonly keyVersion: number;
}

export function sealSecret(
  plaintext: string,
  key: Buffer,
  keyVersion: number,
  associatedData: string,
): SealedSecret {
  const nonce = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, nonce);
  cipher.setAAD(Buffer.from(associatedData, "utf8"));
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertext.toString("base64url"),
    nonce: nonce.toString("base64url"),
    authTag: cipher.getAuthTag().toString("base64url"),
    keyVersion,
  };
}

export function openSecret(
  sealed: SealedSecret,
  key: Buffer,
  expectedKeyVersion: number,
  associatedData: string,
) {
  if (sealed.keyVersion !== expectedKeyVersion) {
    throw new Error("Authentication secret key version is unavailable.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    key,
    Buffer.from(sealed.nonce, "base64url"),
  );
  decipher.setAAD(Buffer.from(associatedData, "utf8"));
  decipher.setAuthTag(Buffer.from(sealed.authTag, "base64url"));
  return Buffer.concat([
    decipher.update(Buffer.from(sealed.ciphertext, "base64url")),
    decipher.final(),
  ]).toString("utf8");
}

