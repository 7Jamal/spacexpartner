import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

/** Unambiguous alphabet (no 0/O/1/I) for codes people read out loud or copy. */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const GROUPS = 4;
const GROUP_LEN = 5;

export function generateRecoveryCode(): string {
  const bytes = randomBytes(GROUPS * GROUP_LEN);
  let out = "";
  for (let i = 0; i < GROUPS * GROUP_LEN; i += 1) {
    if (i > 0 && i % GROUP_LEN === 0) out += "-";
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function normaliseCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function hashRecoveryCode(code: string): string {
  return createHash("sha256").update(normaliseCode(code), "utf8").digest("hex");
}

export function codeMatches(input: string, storedHash: string): boolean {
  const a = Buffer.from(hashRecoveryCode(input), "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
