import crypto from "node:crypto";

import { evidenceDigest } from "../../core/decision-engine";
import type { VerificationResult } from "../contracts";

/**
 * Built-in identity method `checkout_dob_attest`.
 *
 * The shopper enters their date of birth at checkout and attests that the name
 * on their government ID matches the shipping name. The carrier checks ID and
 * collects the adult signature at delivery. Only a hashed subject and a result
 * digest are persisted; the date of birth itself is never stored.
 */
export const DOB_ATTEST_PROVIDER_CODE = "checkout_dob_attest";
export const DOB_ATTEST_CONSENT_VERSION = "checkout-dob-attest-v1";
export const DOB_ATTEST_TTL_MS = 60 * 60 * 1000;
export const MINIMUM_ATTESTED_AGE = 21;

export class InvalidDateOfBirthError extends Error {
  constructor() {
    super("Enter a valid date of birth.");
  }
}

export function parseDateOfBirth(input: unknown, now = new Date()) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof input === "string" ? input.trim() : "");
  if (!match) throw new InvalidDateOfBirthError();
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    throw new InvalidDateOfBirthError();
  }
  const age = ageOn({ year, month, day }, now);
  if (age < 0 || age > 120) throw new InvalidDateOfBirthError();
  return { year, month, day, age };
}

export function ageOn(dob: { year: number; month: number; day: number }, now: Date) {
  let age = now.getUTCFullYear() - dob.year;
  const beforeBirthday =
    now.getUTCMonth() + 1 < dob.month || (now.getUTCMonth() + 1 === dob.month && now.getUTCDate() < dob.day);
  if (beforeBirthday) age -= 1;
  return age;
}

export function normalizedName(firstName?: string | null, lastName?: string | null) {
  return `${firstName ?? ""} ${lastName ?? ""}`.trim().replace(/\s+/g, " ").toLowerCase();
}

export type DobAttestationInput = {
  dateOfBirth: string;
  idNameMatchesShipping: boolean;
  /** Required age from the destination rule set (never below 21). */
  thresholdAge: number;
  cartFingerprint: string;
  /** HMAC of the date of birth, name and cart. Computed by the caller with a server secret. */
  subjectDigest: string;
  now?: Date;
  transactionId?: string;
};

export function evaluateDobAttestation(input: DobAttestationInput): VerificationResult & { reasonCode: string | null } {
  const now = input.now ?? new Date();
  const dob = parseDateOfBirth(input.dateOfBirth, now);
  const thresholdAge = Math.max(MINIMUM_ATTESTED_AGE, input.thresholdAge);
  const underAge = dob.age < thresholdAge;
  const nameAttested = input.idNameMatchesShipping === true;
  const result: VerificationResult["result"] = underAge || !nameAttested ? "failed" : "passed";
  const addressMatch: VerificationResult["addressMatch"] = nameAttested ? "matched" : "mismatched";
  const transactionId = input.transactionId ?? `dobattest_${crypto.randomUUID()}`;
  // One minute of back-dating keeps evidence current across small clock differences.
  const issuedAt = new Date(now.getTime() - 60_000);
  const expiresAt = new Date(now.getTime() + DOB_ATTEST_TTL_MS);
  return {
    transactionId,
    result,
    verifiedAge: Math.min(dob.age, 120),
    addressMatch,
    reasonCode: underAge ? "UNDER_MINIMUM_AGE" : !nameAttested ? "ID_NAME_NOT_CONFIRMED" : null,
    evidenceDigest: evidenceDigest({
      method: DOB_ATTEST_PROVIDER_CODE,
      version: DOB_ATTEST_CONSENT_VERSION,
      transactionId,
      cartFingerprint: input.cartFingerprint,
      subjectDigest: input.subjectDigest,
      thresholdAge,
      verifiedAge: Math.min(dob.age, 120),
      result,
      addressMatch,
    }),
    issuedAt: issuedAt.toISOString(),
    expiresAt: expiresAt.toISOString(),
  };
}
