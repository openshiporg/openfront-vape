import { evidenceDigest } from "../../core/decision-engine";

/**
 * Built-in carrier method `manual_adult_signature`.
 *
 * The store ships with an adult-signature service (ID checked and a 21+ signature
 * collected by the carrier at delivery). A decision is issued for a shipping
 * option only when the destination is inside the merchant's launch scope and the
 * rule set's signature age does not exceed what the service collects.
 */
export const MANUAL_ADULT_SIGNATURE_PROVIDER_CODE = "manual_adult_signature";
export const MANUAL_ADULT_SIGNATURE_CARRIER = "store_arranged";
export const MANUAL_ADULT_SIGNATURE_SERVICE = "adult_signature_21_plus";
export const MANUAL_ADULT_SIGNATURE_AGE = 21;
export const MANUAL_ADULT_SIGNATURE_TTL_MS = 60 * 60 * 1000;

/** Age the service collects, from a code such as `adult_signature_21_plus`. */
export function signatureAgeFromService(serviceCode: unknown): number {
  const match = /^adult_signature_(\d{2})_plus$/.exec(typeof serviceCode === "string" ? serviceCode : "");
  return match ? Number(match[1]) : 0;
}

export type ManualCarrierInput = {
  cartFingerprint: string;
  shippingOptionId: string;
  originJurisdictionCode: string | null;
  destinationJurisdictionCode: string | null;
  launchJurisdictionCodes: string[];
  lines: Array<{ variantId: string; category: string; quantity: number; packageUnits: number }>;
  packageMarkings: string[];
  /** Highest `adult_signature_required.minimumAge` in the destination rule set, if any. */
  signatureMinimumAge?: number | null;
  now?: Date;
};

export function buildManualAdultSignatureDecision(input: ManualCarrierInput) {
  const { originJurisdictionCode: origin, destinationJurisdictionCode: destination } = input;
  if (!origin || !destination || !input.lines.length) return null;
  if (!input.launchJurisdictionCodes.includes(destination)) return null;
  if ((input.signatureMinimumAge ?? MANUAL_ADULT_SIGNATURE_AGE) > MANUAL_ADULT_SIGNATURE_AGE) return null;
  const now = input.now ?? new Date();
  const lines = [...input.lines].sort((a, b) => a.variantId.localeCompare(b.variantId));
  const packageMarkings = [...new Set(input.packageMarkings)].sort();
  const packageDigest = evidenceDigest({ lines, packageMarkings });
  const decision = {
    cartFingerprint: input.cartFingerprint,
    rateId: `manual:${input.shippingOptionId}`,
    packageDigest,
    carrierCode: MANUAL_ADULT_SIGNATURE_CARRIER,
    serviceCode: MANUAL_ADULT_SIGNATURE_SERVICE,
    originJurisdictionCode: origin,
    destinationJurisdictionCode: destination,
    regulatedCategories: [...new Set(lines.map(line => line.category))].sort(),
    quantities: lines.map(line => ({ variantId: line.variantId, quantity: line.quantity, packageUnits: line.packageUnits })),
    adultSignature: true,
    packageMarkings,
    result: "allow" as const,
    issuedAt: new Date(now.getTime() - 60_000).toISOString(),
    expiresAt: new Date(now.getTime() + MANUAL_ADULT_SIGNATURE_TTL_MS).toISOString(),
  };
  return { ...decision, evidenceDigest: evidenceDigest({ method: MANUAL_ADULT_SIGNATURE_PROVIDER_CODE, shippingOptionId: input.shippingOptionId, ...decision }) };
}
