import { createHash } from "node:crypto";

import { DOB_ATTEST_PROVIDER_CODE } from "../../regulated-commerce/providers/builtin/identity-dob-attest";
import { STORE_RATE_PROVIDER_CODE } from "../../regulated-commerce/providers/builtin/tax-store-rate";
import { MANUAL_ADULT_SIGNATURE_PROVIDER_CODE } from "../../regulated-commerce/providers/builtin/carrier-manual-adult-signature";

/**
 * Provider approvals for the methods that ship with the store. A merchant
 * approves them in one action instead of typing capabilities and digests.
 *
 * The evidence digest is the SHA-256 of the method descriptor below (code,
 * version, what it does). It identifies the exact built-in method being
 * approved. It is not a licence or registration and claims none.
 */
export const REGISTRY_PROVIDER_CODE = "merchant_authorizations";

export const BUILTIN_METHODS = {
  identity: {
    providerCode: DOB_ATTEST_PROVIDER_CODE,
    summary: "Shopper attests date of birth and that the ID name matches the shipping name; age 21+ enforced; only a hashed digest is stored.",
    capabilities: ["age_check", "dob_attestation", "hashed_subject"],
  },
  tax: {
    providerCode: STORE_RATE_PROVIDER_CODE,
    summary: "Sales, excise and local fee from the store's own tax rate rows per destination jurisdiction; refuses when none are set.",
    capabilities: ["sales_tax", "excise_tax", "local_fee", "store_rate_rows"],
  },
  carrier: {
    providerCode: MANUAL_ADULT_SIGNATURE_PROVIDER_CODE,
    summary: "Store-arranged carrier service collecting an adult signature (21+) and checking ID at delivery.",
    capabilities: ["adult_signature_21_plus", "package_marking"],
  },
  registry: {
    providerCode: REGISTRY_PROVIDER_CODE,
    summary: "Product registry evidence is the federal and state authorizations the merchant records per product.",
    capabilities: ["merchant_recorded_authorizations"],
  },
} as const;

export const BUILTIN_SHIPPING_PROVIDER_NAME = "Store-arranged adult signature";
export const APPROVAL_TERM_DAYS = 365;

export type PlanInput = {
  profile: { id: string; enabledCategories: string[]; launchJurisdictionCodes: string[] };
  /** Payment providers the merchant has installed, excluding manual tender. */
  paymentProviders: Array<{ id: string; code: string; name: string }>;
  shippingProviderId: string | null;
  /** Current active approvals: purpose + providerCode (+ linked provider id for payment). */
  existing: Array<{ purpose: string; providerCode: string; paymentProviderId?: string | null }>;
  now?: Date;
};

export type PlannedApproval = {
  purpose: "identity" | "tax" | "carrier" | "registry" | "payment";
  providerCode: string;
  approvalReference: string;
  evidenceDigest: string;
  coveredCategories: string[];
  coveredJurisdictionCodes: string[];
  capabilities: string[];
  paymentProviderId?: string;
  shippingProviderId?: string;
  effectiveAt: string;
  expiresAt: string;
  validatedAt: string;
};

export function methodDigest(purpose: string, providerCode: string, summary: string, capabilities: readonly string[]) {
  return createHash("sha256")
    .update(JSON.stringify({ purpose, providerCode, version: 1, summary, capabilities }))
    .digest("hex");
}

/** Reasons the merchant must fix before approvals can be recorded. */
export function setupBlockers(profile: PlanInput["profile"]): string[] {
  const blockers: string[] = [];
  if (!profile.enabledCategories.length) blockers.push("Choose the product types on the merchant profile first");
  if (!profile.launchJurisdictionCodes.length) blockers.push("Add at least one launch jurisdiction on the merchant profile first");
  return blockers;
}

export function planBuiltInApprovals(input: PlanInput): PlannedApproval[] {
  if (setupBlockers(input.profile).length) return [];
  const now = input.now ?? new Date();
  const expires = new Date(now.getTime() + APPROVAL_TERM_DAYS * 86_400_000);
  const base = {
    coveredCategories: [...input.profile.enabledCategories].sort(),
    coveredJurisdictionCodes: [...input.profile.launchJurisdictionCodes].sort(),
    effectiveAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    validatedAt: now.toISOString(),
  };
  const has = (purpose: string, code: string, paymentProviderId?: string) =>
    input.existing.some(entry => entry.purpose === purpose && entry.providerCode === code &&
      (paymentProviderId ? entry.paymentProviderId === paymentProviderId : true));

  const planned: PlannedApproval[] = [];
  (["identity", "tax", "carrier", "registry"] as const).forEach(purpose => {
    const method = BUILTIN_METHODS[purpose];
    if (has(purpose, method.providerCode)) return;
    if (purpose === "carrier" && !input.shippingProviderId) return;
    planned.push({
      ...base,
      purpose,
      providerCode: method.providerCode,
      approvalReference: `builtin:${method.providerCode}@1`,
      evidenceDigest: methodDigest(purpose, method.providerCode, method.summary, method.capabilities),
      capabilities: [...method.capabilities],
      ...(purpose === "carrier" ? { shippingProviderId: input.shippingProviderId! } : {}),
    });
  });
  for (const provider of input.paymentProviders) {
    if (has("payment", provider.code, provider.id)) continue;
    // The manual provider is pay-at-pickup only; completion refuses it for delivery carts.
    const manual = provider.code === "pp_system_default";
    const capabilities = manual ? ["pay_at_pickup"] : ["card_authorization", "capture", "refund"];
    planned.push({
      ...base,
      purpose: "payment",
      providerCode: provider.code,
      approvalReference: `payment-provider:${provider.code}`,
      evidenceDigest: methodDigest("payment", provider.code, manual ? "Pay in store at pickup; the merchant marks the order paid at the counter" : `Payment provider ${provider.name} installed by the merchant`, capabilities),
      capabilities,
      paymentProviderId: provider.id,
    });
  }
  return planned;
}
