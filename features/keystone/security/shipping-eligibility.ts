import { isCurrentEvidence } from "../../regulated-commerce/core/decision-engine";

type ShippingRequirement = { type?: unknown; amount?: unknown };

export function shippingDestinationWithinRegion(
  regionCountryCodes: unknown,
  destinationCountryCode: unknown,
): boolean {
  if (!Array.isArray(regionCountryCodes) || typeof destinationCountryCode !== "string") return false;
  const destination = destinationCountryCode.trim().toUpperCase();
  if (!destination) return false;
  return regionCountryCodes.some((country: unknown) =>
    typeof country === "string" && country.trim().toUpperCase() === destination,
  );
}

/** No accepted cart-rate quote exists in this flow, so calculated rates fail closed. */
export function shippingOptionCharge(priceType: unknown, amount: unknown): number | null {
  if (priceType === "free") return 0;
  if (priceType !== "flat_rate" || !Number.isSafeInteger(amount) || Number(amount) < 0) return null;
  return Number(amount);
}

export function shippingSubtotalRequirementsMet(requirements: unknown, subtotal: unknown): boolean {
  if (!Array.isArray(requirements) || !Number.isSafeInteger(subtotal) || Number(subtotal) < 0) return false;
  for (const requirement of requirements as ShippingRequirement[]) {
    if (!requirement || !Number.isSafeInteger(requirement.amount) || Number(requirement.amount) < 0) return false;
    if (requirement.type === "min_subtotal") {
      if (Number(subtotal) < Number(requirement.amount)) return false;
    } else if (requirement.type === "max_subtotal") {
      if (Number(subtotal) > Number(requirement.amount)) return false;
    } else {
      return false;
    }
  }
  return true;
}

/** Mirrors the cart's server-side subtotal source: calculated regional MoneyAmount values. */
export async function calculateCartSubtotalMinorUnits(sudoContext: any, cart: any): Promise<number> {
  const regionId = cart?.region?.id;
  const currencyCode = cart?.region?.currency?.code;
  if (!regionId || typeof currencyCode !== "string" || !currencyCode) {
    throw new Error("Cart region and currency are required");
  }

  let subtotal = 0;
  for (const line of cart.lineItems || []) {
    const quantity = line?.quantity;
    const variantId = line?.productVariant?.id;
    if (!Number.isSafeInteger(quantity) || quantity <= 0 || typeof variantId !== "string" || !variantId) {
      throw new Error("Cart subtotal is unavailable");
    }
    const prices = await sudoContext.query.MoneyAmount.findMany({
      where: {
        productVariant: { id: { equals: variantId } },
        region: { id: { equals: regionId } },
        currency: { code: { equals: currencyCode } },
      },
      query: "calculatedPrice { calculatedAmount }",
    });
    const amount = prices[0]?.calculatedPrice?.calculatedAmount;
    if (!Number.isSafeInteger(amount) || amount < 0) throw new Error("Cart subtotal is unavailable");
    subtotal += amount * quantity;
    if (!Number.isSafeInteger(subtotal)) throw new Error("Cart subtotal is unavailable");
  }
  return subtotal;
}

type CurrentCarrierDecision = {
  cartFingerprint?: unknown;
  shippingOption?: { id?: unknown } | null;
  destinationJurisdictionCode?: unknown;
  originJurisdictionCode?: unknown;
  result?: unknown;
  adultSignature?: unknown;
  issuedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  rateId?: unknown;
  packageDigest?: unknown;
  carrierCode?: unknown;
  serviceCode?: unknown;
  providerApproval?: {
    status?: unknown;
    effectiveAt?: string | Date | null;
    expiresAt?: string | Date | null;
    shippingProvider?: { id?: unknown } | null;
  } | null;
};

export function matchesCurrentCartCarrierDecision(
  decision: CurrentCarrierDecision | null | undefined,
  expected: {
    cartFingerprint: string;
    shippingOptionId: string;
    destinationJurisdictionCode: string;
    originJurisdictionCode: string;
    now?: Date;
  },
): boolean {
  const now = expected.now ?? new Date();
  const approval = decision?.providerApproval;
  return Boolean(
    decision &&
      /^[a-f0-9]{64}$/i.test(expected.cartFingerprint) &&
      expected.shippingOptionId && expected.destinationJurisdictionCode && expected.originJurisdictionCode &&
      decision.cartFingerprint === expected.cartFingerprint &&
      decision.shippingOption?.id === expected.shippingOptionId &&
      decision.destinationJurisdictionCode === expected.destinationJurisdictionCode &&
      decision.originJurisdictionCode === expected.originJurisdictionCode &&
      decision.result === "allow" &&
      decision.adultSignature === true &&
      typeof decision.rateId === "string" && decision.rateId.trim().length > 0 &&
      typeof decision.packageDigest === "string" && /^[a-f0-9]{64}$/i.test(decision.packageDigest) &&
      typeof decision.carrierCode === "string" && decision.carrierCode.trim().length > 0 &&
      typeof decision.serviceCode === "string" && decision.serviceCode.trim().length > 0 &&
      isCurrentEvidence({ status: String(decision.result), effectiveAt: decision.issuedAt, expiresAt: decision.expiresAt }, ["allow"], now) &&
      approval &&
      isCurrentEvidence({ status: String(approval.status), effectiveAt: approval.effectiveAt, expiresAt: approval.expiresAt }, ["active"], now) &&
      typeof approval.shippingProvider?.id === "string" && approval.shippingProvider.id.length > 0,
  );
}
