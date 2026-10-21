import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";

type EvidenceReferences = {
  ageAttemptId: string | null;
  taxQuoteId: string | null;
  paymentApprovalId: string | null;
  carrierDecisionId: string | null;
  evidenceDigests: {
    age: string | null;
    tax: string | null;
    carrier: string | null;
  };
};

export type CurrentCheckoutAcceptance = EvidenceReferences & {
  cartFingerprint: string;
  merchantProfileId: string | null;
  jurisdictionId: string | null;
  jurisdictionCode: string | null;
  ruleSetId: string | null;
  policyPack: string;
  policyVersion: string;
  policyHash: string;
};

type RecordValue = Record<string, unknown>;
const SHA256 = /^[a-f0-9]{64}$/;

function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function validId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function validDigest(value: unknown): value is string {
  return typeof value === "string" && SHA256.test(value);
}

/**
 * A persisted allow is reusable only while its complete source snapshot still
 * matches this checkout's fresh evaluation and the decision itself is current.
 */
export function matchesCurrentAcceptedCheckoutSnapshot(
  decisionValue: unknown,
  expected: {
    cartId: string;
    cartFingerprint: string;
    current: CurrentCheckoutAcceptance;
    now: Date;
  },
): boolean {
  const decision = record(decisionValue);
  const snapshot = record(decision?.snapshot);
  const evidenceDigests = record(snapshot?.evidenceDigests);
  const policy = record(snapshot?.policy);
  if (!decision || !snapshot || !evidenceDigests || !policy) return false;

  const expiresAt = new Date(String(decision.expiresAt ?? "")).getTime();
  if (!Number.isFinite(expiresAt) || expiresAt <= expected.now.getTime()) return false;

  try {
    return decision.cartId === expected.cartId &&
      decision.cartFingerprint === expected.cartFingerprint &&
      decision.purpose === "checkout" && decision.result === "allow" &&
      decision.revokedAt === null && decision.orderId === null &&
      typeof decision.snapshotDigest === "string" &&
      evidenceDigest(snapshot) === decision.snapshotDigest &&
      snapshot.cartId === expected.cartId &&
      snapshot.cartFingerprint === expected.cartFingerprint &&
      snapshot.purpose === "checkout" && snapshot.result === "allow" &&
      snapshot.merchantProfileId === expected.current.merchantProfileId &&
      snapshot.jurisdictionCode === expected.current.jurisdictionCode &&
      snapshot.ruleSetId === expected.current.ruleSetId &&
      policy.id === expected.current.ruleSetId &&
      policy.packName === expected.current.policyPack &&
      policy.version === expected.current.policyVersion &&
      policy.policyHash === expected.current.policyHash &&
      decision.merchantProfileId === expected.current.merchantProfileId &&
      decision.jurisdictionId === expected.current.jurisdictionId &&
      decision.policyPack === expected.current.policyPack &&
      decision.policyVersion === expected.current.policyVersion &&
      decision.policyHash === expected.current.policyHash &&
      snapshot.ageAttemptId === expected.current.ageAttemptId &&
      snapshot.taxQuoteId === expected.current.taxQuoteId &&
      snapshot.paymentApprovalId === expected.current.paymentApprovalId &&
      snapshot.carrierDecisionId === expected.current.carrierDecisionId &&
      evidenceDigests.age === expected.current.evidenceDigests.age &&
      evidenceDigests.tax === expected.current.evidenceDigests.tax &&
      evidenceDigests.carrier === expected.current.evidenceDigests.carrier &&
      validId(snapshot.ageAttemptId) && validId(snapshot.taxQuoteId) &&
      validId(snapshot.paymentApprovalId) && validId(snapshot.carrierDecisionId) &&
      validDigest(evidenceDigests.age) && validDigest(evidenceDigests.tax) &&
      validDigest(evidenceDigests.carrier);
  } catch {
    return false;
  }
}

/** Conditional selectors for binding only the exact evidence accepted by a snapshot. */
export function acceptedCheckoutEvidenceWhere(
  snapshotValue: unknown,
  cartId: string,
  cartFingerprint: string,
  now: Date,
) {
  const snapshot = record(snapshotValue);
  const evidenceDigests = record(snapshot?.evidenceDigests);
  if (!snapshot || !evidenceDigests || snapshot.cartId !== cartId ||
      snapshot.cartFingerprint !== cartFingerprint || snapshot.purpose !== "checkout" ||
      snapshot.result !== "allow" || !validId(snapshot.ageAttemptId) ||
      !validId(snapshot.taxQuoteId) || !validId(snapshot.carrierDecisionId) ||
      !validDigest(evidenceDigests.age) || !validDigest(evidenceDigests.tax) ||
      !validDigest(evidenceDigests.carrier) || !Number.isFinite(now.getTime())) return null;

  return {
    age: {
      id: snapshot.ageAttemptId,
      cartId,
      cartFingerprint,
      purpose: "checkout",
      result: "passed",
      addressMatch: "matched",
      evidenceDigest: evidenceDigests.age,
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null,
    },
    tax: {
      id: snapshot.taxQuoteId,
      cartId,
      cartFingerprint,
      status: "committed",
      evidenceDigest: evidenceDigests.tax,
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null,
    },
    carrier: {
      id: snapshot.carrierDecisionId,
      cartId,
      cartFingerprint,
      result: "allow",
      adultSignature: true,
      evidenceDigest: evidenceDigests.carrier,
      providerApproval: {
        is: {
          purpose: "carrier",
          status: "active",
          effectiveAt: { lte: now },
          expiresAt: { gt: now },
        },
      },
      issuedAt: { lte: now },
      expiresAt: { gt: now },
      orderId: null,
    },
  };
}
