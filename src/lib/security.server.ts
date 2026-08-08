import { createHash, timingSafeEqual } from "node:crypto";

/**
 * Answers are compared forgivingly (case, accents, spacing and punctuation are
 * ignored) but stored only as a salted one-way hash, so nobody — not even an
 * administrator — can read a partner's answers.
 */
export function normaliseAnswer(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function hashAnswer(userId: string, answer: string): string {
  return createHash("sha256").update(`${userId}:${normaliseAnswer(answer)}`, "utf8").digest("hex");
}

export function answerMatches(userId: string, input: string, storedHash: string): boolean {
  const a = Buffer.from(hashAnswer(userId, input), "hex");
  const b = Buffer.from(storedHash, "hex");
  if (a.length !== b.length || a.length === 0) return false;
  return timingSafeEqual(a, b);
}

/**
 * Deterministic decoy questions for an unknown email, so the recovery screen
 * looks identical whether or not the address exists (no account enumeration).
 */
export function decoyQuestions(email: string, catalogue: string[]): string[] {
  const digest = createHash("sha256").update(email.trim().toLowerCase(), "utf8").digest();
  const picked: string[] = [];
  let cursor = 0;
  while (picked.length < 3 && cursor < digest.length) {
    const candidate = catalogue[digest[cursor]! % catalogue.length]!;
    if (!picked.includes(candidate)) picked.push(candidate);
    cursor += 1;
  }
  return picked;
}

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MINUTES = 15;
export const MIN_ANSWER_LENGTH = 2;
