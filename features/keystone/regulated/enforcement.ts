import { evidenceDigest, evaluateRegulatedCommerce, isCurrentEvidence } from "../../regulated-commerce/core/decision-engine";
import type { CompliancePurpose, RegulatedCategory } from "../../regulated-commerce/core/decision-types";
import { validateRules } from "../../regulated-commerce/core/policy-validation";
import { assertCommerceReleaseEnabled, releaseBlockers } from "../../regulated-commerce/core/release-gate";
import { cartEvidenceFingerprint } from "./cart-fingerprint";
import { boundedComplianceSnapshotExpiry } from "./snapshot-expiry";

const FEDERAL_AUTHORIZATION_TYPES = new Set(["federal_marketing_order", "preexisting_status"]);
const SHA256 = /^[a-f0-9]{64}$/i;

function hasCurrentRegulatedExemption(product: any, now = new Date()) {
  return product?.regulatedCommerceRequired === false &&
    Boolean(product.regulatedExemptionReference) &&
    SHA256.test(product.regulatedExemptionDigest || "") &&
    Boolean(product.regulatedExemptionReviewedAt) &&
    new Date(product.regulatedExemptionExpiresAt || 0).getTime() > now.getTime();
}

export async function assertVariantPublicationEvidence(context: any, variantId: string, now = new Date()) {
  const variant = await context.sudo().query.ProductVariant.findOne({
    where: { id: variantId },
    query: `id product { regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt } regulatedClassification {
      id status effectiveAt expiresAt marketingReviewStatus marketingEvidenceDigest marketingReviewedAt
      authorizations { authorizationType status effectiveAt expiresAt delistedAt }
    }`,
  });
  if (hasCurrentRegulatedExemption(variant?.product, now)) return null;
  const classification = variant?.regulatedClassification;
  if (!classification || classification.status !== "approved" || classification.marketingReviewStatus !== "approved" ||
    !classification.marketingEvidenceDigest || !classification.marketingReviewedAt ||
    !isCurrentEvidence(classification, ["approved"], now)) {
    throw new Error("Regulated product classification must be approved and current before publication or cart use");
  }
  const federal = classification.authorizations?.find((authorization: any) =>
    FEDERAL_AUTHORIZATION_TYPES.has(authorization.authorizationType) &&
    !authorization.delistedAt && isCurrentEvidence(authorization, ["authorized"], now));
  if (!federal) throw new Error("Current federal product authorization evidence is required");
  return classification;
}

export async function assertProductPublicationEvidence(context: any, productId: string, now = new Date()) {
  const product = await context.sudo().query.Product.findOne({
    where: { id: productId },
    query: "id regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt productVariants { id }",
  });
  if (hasCurrentRegulatedExemption(product, now)) return;
  if (!product.productVariants?.length) throw new Error("A regulated product needs at least one variant before publication");
  for (const variant of product.productVariants) await assertVariantPublicationEvidence(context, variant.id, now);
}

export async function cartIdsUsingAddress(context: any, addressId: string) {
  const carts = await context.sudo().prisma.cart.findMany({
    where: { OR: [{ shippingAddressId: addressId }, { billingAddressId: addressId }] },
    select: { id: true },
  });
  return carts.map((cart: any) => cart.id);
}

export async function invalidateCartCompliance(context: any, cartId: string, reason = "CART_CHANGED", withinTransaction = false) {
  const now = new Date();
  const invalidate = async (tx: any) => {
    await tx.cart.update({ where: { id: cartId }, data: { complianceRevision: { increment: 1 } } });
    await tx.ageVerificationAttempt.updateMany({ where: { cartId, orderId: null, result: "passed" }, data: { result: "revoked" } });
    await tx.regulatedTaxQuote.updateMany({ where: { cartId, orderId: null, status: "quoted" }, data: { status: "expired" } });
    await tx.complianceDecision.updateMany({
      where: { cartId, revokedAt: null },
      data: { revokedAt: now },
    });
    await tx.carrierEligibilityDecision.updateMany({
      where: { cartId, result: "allow", expiresAt: { gt: now } },
      data: { result: "revoked" },
    });
    await tx.complianceEvent.create({
      data: {
        eventType: "cart.compliance_invalidated",
        resourceType: "Cart",
        resourceId: cartId,
        reasonCode: reason,
        evidenceDigest: evidenceDigest({ cartId, reason, at: now.toISOString() }),
        data: { reason },
        occurredAt: now,
      },
    });
  };
  if (withinTransaction) await invalidate(context.sudo().prisma);
  else await context.sudo().prisma.$transaction(invalidate);
}

function destinationCode(address: any): string | null {
  const country = String(address?.country?.iso2 || "").trim().toUpperCase();
  const province = String(address?.province || "").trim().toUpperCase();
  return country && province ? `${country}-${province}` : null;
}

export async function evaluateCartCompliance({
  context,
  cartId,
  purpose,
  paymentProviderId,
  persist = false,
}: {
  context: any;
  cartId: string;
  purpose: CompliancePurpose;
  paymentProviderId?: string | null;
  persist?: boolean;
}) {
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id user { id } region { taxRate } shippingAddress { province country { iso2 } }
      lineItems { id quantity productVariant {
        id product { regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt } regulatedClassification {
          id category flavor packageUnits status effectiveAt expiresAt marketingReviewStatus
          authorizations {
            id authority authorizationType status effectiveAt expiresAt delistedAt
            jurisdiction { id code }
          }
        }
      } }
      paymentCollection { paymentSessions { isSelected paymentProvider { id code } } }
      shippingMethods { shippingOption { id name } }
    `,
  });
  if (!cart) throw new Error("Cart not found");
  const regulatedLines = cart.lineItems.filter((line: any) =>
    !hasCurrentRegulatedExemption(line.productVariant?.product),
  );
  if (!regulatedLines.length) return { regulated: false, decision: null };

  const now = new Date();
  const cartFingerprint = await cartEvidenceFingerprint(context, cartId);
  const code = destinationCode(cart.shippingAddress);
  const jurisdictions = code ? await sudo.query.Jurisdiction.findMany({
    where: { code: { equals: code }, status: { equals: "active" } }, take: 2,
    query: "id code",
  }) : [];
  const jurisdiction = jurisdictions.length === 1 ? jurisdictions[0] : null;
  const profiles = await sudo.query.RegulatedMerchantProfile.findMany({
    where: { status: { equals: "active" } }, take: 2,
    query: `id status pactRegistered killSwitch enabledCategories effectiveAt expiresAt originJurisdiction { code }
      launchJurisdictions { code }
      licenses { licenseType status effectiveAt expiresAt jurisdiction { code } }
      providerApprovals { id purpose providerCode status effectiveAt expiresAt coveredCategories coveredJurisdictionCodes capabilities paymentProvider { id } shippingProvider { id } }
    `,
  });
  const merchant = profiles.length === 1 ? profiles[0] : null;
  const ruleSets = jurisdiction ? await sudo.query.RegulatedRuleSet.findMany({
    where: { jurisdiction: { id: { equals: jurisdiction.id } }, status: { equals: "active" } },
    take: 2, query: "id packName version policyHash rules status effectiveAt expiresAt approvedAt",
  }) : [];
  const candidateRuleSet = ruleSets.length === 1 ? ruleSets[0] : null;
  const validatedRules = validateRules(candidateRuleSet?.rules);
  const ruleSet = candidateRuleSet && validatedRules.valid
    ? { ...candidateRuleSet, rules: validatedRules.rules }
    : null;

  const ageAttempts = await sudo.query.AgeVerificationAttempt.findMany({
    where: { cart: { id: { equals: cartId } }, purpose: { equals: "checkout" } },
    orderBy: [{ issuedAt: "desc" }], take: 1,
    query: "id cartFingerprint result addressMatch verifiedAge issuedAt expiresAt evidenceDigest",
  });
  const taxQuotes = await sudo.query.RegulatedTaxQuote.findMany({
    where: { cart: { id: { equals: cartId } } }, orderBy: [{ issuedAt: "desc" }], take: 1,
    query: "id cartFingerprint status issuedAt expiresAt evidenceDigest jurisdiction { code }",
  });
  const carrierDecisions = await sudo.query.CarrierEligibilityDecision.findMany({
    where: { cart: { id: { equals: cartId } } }, orderBy: [{ issuedAt: "desc" }], take: 1,
    query: "id cartFingerprint result adultSignature packageMarkings issuedAt expiresAt evidenceDigest originJurisdictionCode destinationJurisdictionCode shippingOption { id } providerApproval { status effectiveAt expiresAt }",
  });

  const categories = regulatedLines.map((line: any) =>
    line.productVariant?.regulatedClassification?.category ?? "ends_device",
  );
  const effectivePaymentProviderId = paymentProviderId ||
    cart.paymentCollection?.paymentSessions?.find((session: any) => session.isSelected)?.paymentProvider?.id;
  const paymentApproval = merchant?.providerApprovals?.find((approval: any) =>
    approval.purpose === "payment" && approval.paymentProvider?.id === effectivePaymentProviderId &&
    approval.coveredJurisdictionCodes?.includes(code) &&
    categories.every((category: string) => approval.coveredCategories?.includes(category)));
  const carrierEvidence = carrierDecisions[0];
  const selectedShippingOption = cart.shippingMethods?.[0]?.shippingOption?.id;
  const carrierMatchesSelection = Boolean(
    carrierEvidence?.shippingOption?.id && carrierEvidence.cartFingerprint === cartFingerprint &&
    isCurrentEvidence(carrierEvidence.providerApproval, ["active"], now) &&
    carrierEvidence.shippingOption.id === selectedShippingOption &&
    carrierEvidence.destinationJurisdictionCode === code &&
    carrierEvidence.originJurisdictionCode === merchant?.originJurisdiction?.code,
  );
  const taxEvidence = taxQuotes[0]?.jurisdiction?.code === code && taxQuotes[0]?.cartFingerprint === cartFingerprint
    ? { ...taxQuotes[0], effectiveAt: taxQuotes[0].issuedAt } : null;
  const ageEvidence = ageAttempts[0]?.cartFingerprint === cartFingerprint ? ageAttempts[0] : null;

  const products = regulatedLines.map((line: any) => {
    const classification = line.productVariant?.regulatedClassification;
    const federal = classification?.authorizations?.find((authorization: any) =>
      FEDERAL_AUTHORIZATION_TYPES.has(authorization.authorizationType) && !authorization.delistedAt) ?? null;
    const destination = classification?.authorizations?.find((authorization: any) =>
      authorization.jurisdiction?.code === code && !authorization.delistedAt) ?? null;
    return {
      variantId: line.productVariant?.id ?? "missing",
      category: (classification?.category ?? "ends_device") as RegulatedCategory,
      flavor: classification?.flavor ?? null,
      quantity: line.quantity,
      packageUnits: classification?.packageUnits ?? 0,
      classificationStatus: classification?.status ?? "missing",
      classificationEffectiveAt: classification?.effectiveAt ?? null,
      classificationExpiresAt: classification?.expiresAt ?? null,
      marketingReviewStatus: classification?.marketingReviewStatus ?? "missing",
      federalAuthorization: federal,
      destinationAuthorization: destination,
    };
  });

  const scopedLicenses = (merchant?.licenses || []).filter((license: any) => !code || license.jurisdiction?.code === code);
  const decision = evaluateRegulatedCommerce({
    purpose,
    now,
    merchant: merchant ? {
      ...merchant,
      launchJurisdictionCodes: merchant.launchJurisdictions?.map((entry: any) => entry.code) ?? [],
    } : null,
    jurisdiction,
    genericTaxRate: cart.region?.taxRate ?? null,
    ruleSet,
    licenses: scopedLicenses,
    products,
    ageEvidence: ageEvidence ? {
      ...ageEvidence, status: ageEvidence.result, age: ageEvidence.verifiedAge, effectiveAt: ageEvidence.issuedAt,
    } : null,
    taxEvidence,
    paymentApproval,
    carrierEvidence: carrierMatchesSelection ? { ...carrierEvidence, status: carrierEvidence.result, effectiveAt: carrierEvidence.issuedAt } : null,
  });

  // Fulfilling an existing order is not a new sale, so the store-level gate
  // applies to cart, payment and checkout decisions only.
  const releaseReasons = purpose === "fulfillment" ? [] : await releaseBlockers(context);
  if (releaseReasons.length) { decision.result = "deny"; decision.reasonCodes = [...new Set([...decision.reasonCodes, ...releaseReasons])].sort(); }
  const acceptanceReferences = {
    cartFingerprint,
    merchantProfileId: merchant?.id ?? null,
    jurisdictionId: jurisdiction?.id ?? null,
    jurisdictionCode: code,
    ruleSetId: ruleSet?.id ?? null,
    policyPack: ruleSet?.packName ?? "unconfigured",
    policyVersion: decision.policyVersion ?? "unconfigured",
    policyHash: decision.policyHash ?? "unconfigured",
    ageAttemptId: ageEvidence?.id ?? null,
    taxQuoteId: taxEvidence?.id ?? null,
    paymentApprovalId: paymentApproval?.id ?? null,
    carrierDecisionId: carrierEvidence?.id ?? null,
    evidenceDigests: {
      age: ageEvidence?.evidenceDigest ?? null,
      tax: taxEvidence?.evidenceDigest ?? null,
      carrier: carrierEvidence?.evidenceDigest ?? null,
    },
  };
  const requiredLicenseTypes = new Set((ruleSet?.rules ?? []).flatMap((rule: any) =>
    rule.type === "license_required" ? rule.licenseTypes : [],
  ));
  const requiredLicenseEvidence = scopedLicenses.filter((license: any) =>
    requiredLicenseTypes.has(license.licenseType) && isCurrentEvidence(license, ["active", "conditioned"], now),
  );
  const requiresDirectoryEvidence = (ruleSet?.rules ?? []).some((rule: any) => rule.type === "directory_required");
  const snapshotEvidence = [
    merchant, ruleSet, ageEvidence, taxEvidence, paymentApproval, carrierEvidence,
    carrierEvidence?.providerApproval,
    ...products.map((product: any) => ({ expiresAt: product.classificationExpiresAt })),
    ...products.map((product: any) => product.federalAuthorization),
    ...(requiresDirectoryEvidence ? products.map((product: any) => product.destinationAuthorization) : []),
    ...requiredLicenseEvidence,
  ];
  let decisionId: string | null = null;
  if (persist) {
    const snapshot = {
      cartId, cartFingerprint, purpose, merchantProfileId: acceptanceReferences.merchantProfileId, jurisdictionCode: code,
      products, ruleSetId: acceptanceReferences.ruleSetId, ruleIds: decision.ruleIds, policy: ruleSet, merchant,
      evidenceDigests: { age: ageEvidence?.evidenceDigest, tax: taxEvidence?.evidenceDigest, carrier: carrierEvidence?.evidenceDigest },
      ageAttemptId: acceptanceReferences.ageAttemptId, taxQuoteId: acceptanceReferences.taxQuoteId,
      paymentApprovalId: acceptanceReferences.paymentApprovalId, carrierDecisionId: acceptanceReferences.carrierDecisionId,
      result: decision.result, reasonCodes: decision.reasonCodes, evaluatedAt: decision.evaluatedAt,
    };
    const idempotencyKey = `compliance:${purpose}:${cartId}:${evidenceDigest(snapshot)}`;
    const stored = await sudo.prisma.complianceDecision.upsert({
      where: { idempotencyKey },
      create: {
        cartId, merchantProfileId: merchant?.id ?? null, jurisdictionId: jurisdiction?.id ?? null,
        purpose, result: decision.result, policyPack: ruleSet?.packName ?? "unconfigured",
        policyVersion: decision.policyVersion ?? "unconfigured", policyHash: decision.policyHash ?? "unconfigured",
        ruleIds: decision.ruleIds, reasonCodes: decision.reasonCodes, evidenceReferences: snapshot,
        snapshot, cartFingerprint, snapshotDigest: evidenceDigest(snapshot), issuedAt: now,
        expiresAt: boundedComplianceSnapshotExpiry(now, snapshotEvidence), idempotencyKey,
      },
      update: {},
    });
    decisionId = stored.id;
  }
  return {
    regulated: true,
    decision: { ...decision, id: decisionId },
    carrierScope: {
      cartFingerprint,
      destinationJurisdictionCode: code,
      originJurisdictionCode: merchant?.originJurisdiction?.code ?? null,
    },
    acceptanceReferences,
  };
}

export async function currentRegulatedTaxQuote(context: any, cartId: string, acceptedStatuses: string[]) {
  const quotes = await context.sudo().query.RegulatedTaxQuote.findMany({
    where: { cart: { id: { equals: cartId } } },
    orderBy: [{ issuedAt: "desc" }],
    take: 1,
    query: "id cartFingerprint status salesTaxAmount exciseTaxAmount localFeeAmount expiresAt",
  });
  const quote = quotes[0];
  if (!quote || !acceptedStatuses.includes(quote.status) || new Date(quote.expiresAt).getTime() <= Date.now() || quote.cartFingerprint !== await cartEvidenceFingerprint(context, cartId)) return null;
  return quote;
}

export async function regulatedTaxAmountForCart(context: any, cartId: string, acceptedStatuses: string[]) {
  const quote = await currentRegulatedTaxQuote(context, cartId, acceptedStatuses);
  if (!quote) throw new Error("Current regulated tax amount is unavailable");
  const amounts = [quote.salesTaxAmount, quote.exciseTaxAmount, quote.localFeeAmount];
  if (!amounts.every((amount: unknown) => Number.isSafeInteger(amount) && Number(amount) >= 0)) {
    throw new Error("Regulated tax amount is invalid");
  }
  return amounts.reduce((sum: number, amount: unknown) => sum + Number(amount), 0);
}

type CarrierLabelEvidenceDTO = {
  order?: { id?: string | null } | null;
  cartFingerprint?: string | null;
  rateId?: string | null;
  packageDigest?: string | null;
  carrierCode?: string | null;
  serviceCode?: string | null;
  result?: string | null;
  adultSignature?: boolean | null;
  issuedAt?: string | Date | null;
  expiresAt?: string | Date | null;
  providerApproval?: {
    status: string;
    effectiveAt?: string | Date | null;
    expiresAt?: string | Date | null;
    shippingProvider?: { id?: string | null } | null;
  } | null;
};

type CarrierLabelEvidenceContract = {
  orderId: string;
  shippingProviderId: string;
  cartFingerprint: string;
  rateId?: string;
  packageDigest?: string;
  now?: Date;
};

export function matchesOrderBoundCarrierLabelEvidence(
  evidence: CarrierLabelEvidenceDTO | null | undefined,
  expected: CarrierLabelEvidenceContract,
): boolean {
  const now = expected.now ?? new Date();
  const rateId = evidence?.rateId?.trim();
  const packageDigest = evidence?.packageDigest ?? "";
  const providerApproval = evidence?.providerApproval;
  return Boolean(
    evidence && expected.orderId && expected.shippingProviderId && expected.cartFingerprint &&
    evidence.order?.id === expected.orderId &&
    evidence.cartFingerprint === expected.cartFingerprint &&
    rateId && SHA256.test(packageDigest) &&
    (expected.rateId === undefined || (expected.rateId.trim() && rateId === expected.rateId)) &&
    (expected.packageDigest === undefined || (SHA256.test(expected.packageDigest) && packageDigest === expected.packageDigest)) &&
    evidence.carrierCode?.trim() && evidence.serviceCode?.trim() &&
    evidence.adultSignature === true &&
    isCurrentEvidence({ status: evidence.result ?? "", effectiveAt: evidence.issuedAt, expiresAt: evidence.expiresAt }, ["allow"], now) &&
    providerApproval && isCurrentEvidence(providerApproval, ["active"], now) &&
    providerApproval.shippingProvider?.id === expected.shippingProviderId
  );
}

type ProviderRateDTO = { id: string; [key: string]: unknown };

export function selectExactApprovedCarrierRate(rates: unknown, approvedRateId: string | null | undefined): ProviderRateDTO[] {
  if (!approvedRateId?.trim() || !Array.isArray(rates)) return [];
  const matches = rates.filter((rate: unknown): rate is ProviderRateDTO =>
    Boolean(rate && typeof rate === "object" && !Array.isArray(rate) &&
      typeof (rate as { id?: unknown }).id === "string" &&
      (rate as { id: string }).id === approvedRateId),
  );
  return matches.length === 1 ? matches : [];
}

export async function requireApprovedCarrierProvider(
  context: any,
  cartId: string,
  orderId: string,
  shippingProviderId: string,
  contract?: { rateId: string; packageDigest: string },
) {
  const compliance = await requireAllowedCartCompliance({ context, cartId, purpose: "fulfillment" });
  if (!compliance.regulated) return { ...compliance, carrierEvidence: null };
  const now = new Date();
  const currentFingerprint = await cartEvidenceFingerprint(context, cartId);
  const decisions = await context.sudo().query.CarrierEligibilityDecision.findMany({
    where: {
      order: { id: { equals: orderId } },
      cart: { id: { equals: cartId } }, result: { equals: "allow" }, adultSignature: { equals: true },
      expiresAt: { gt: now.toISOString() },
      cartFingerprint: { equals: currentFingerprint },
      ...(contract ? { rateId: { equals: contract.rateId }, packageDigest: { equals: contract.packageDigest } } : {}),
      providerApproval: { status: { equals: "active" }, effectiveAt: { lte: now.toISOString() }, expiresAt: { gt: now.toISOString() }, shippingProvider: { id: { equals: shippingProviderId } } },
    },
    take: 2,
    query: "order { id } cartFingerprint rateId packageDigest carrierCode serviceCode result adultSignature issuedAt expiresAt providerApproval { status effectiveAt expiresAt shippingProvider { id } }",
  });
  if (decisions.length !== 1 || !matchesOrderBoundCarrierLabelEvidence(decisions[0], {
    orderId, shippingProviderId, cartFingerprint: currentFingerprint, now, ...contract,
  })) throw new Error("Selected label provider lacks exact order-bound carrier service/rate/package approval evidence");
  return { ...compliance, carrierEvidence: decisions[0] as CarrierLabelEvidenceDTO };
}

export async function requireAllowedCartCompliance(args: Parameters<typeof evaluateCartCompliance>[0]) {
  if (args.purpose !== "fulfillment") await assertCommerceReleaseEnabled(args.context);
  const result = await evaluateCartCompliance({ ...args, persist: true });
  if (result.regulated && result.decision?.result !== "allow") {
    throw new Error(`Regulated commerce denied: ${result.decision?.reasonCodes.join(", ") || "UNKNOWN"}`);
  }
  return result;
}
