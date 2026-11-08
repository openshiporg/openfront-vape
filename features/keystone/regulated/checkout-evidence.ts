import { GraphQLError } from "graphql";
import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";
import { validateRules } from "../../regulated-commerce/core/policy-validation";
import {
  buildManualAdultSignatureDecision,
  MANUAL_ADULT_SIGNATURE_PROVIDER_CODE,
} from "../../regulated-commerce/providers/builtin/carrier-manual-adult-signature";
import {
  DOB_ATTEST_CONSENT_VERSION,
  DOB_ATTEST_PROVIDER_CODE,
  evaluateDobAttestation,
  normalizedName,
} from "../../regulated-commerce/providers/builtin/identity-dob-attest";
import {
  createStoreRateTaxAdapter,
  STORE_RATE_PROVIDER_CODE,
  TAX_KINDS,
  type StoreRateTaxStore,
  type StoreTaxRate,
  type TaxKind,
} from "../../regulated-commerce/providers/builtin/tax-store-rate";
import { digestCredential } from "../security/token-crypto";
import { cartEvidenceFingerprint } from "./cart-fingerprint";
import { isPickupOption } from "./pickup";
import { evaluateCartCompliance } from "./enforcement";
import { recordVerifiedIdentityResult } from "./evidence-ingestion";
import { reverseRegulatedTaxCommit } from "./reversals";
import { commitRegulatedTaxQuote, recordCarrierEligibility, recordRegulatedTaxQuote } from "./transaction-evidence";
import { shopperError } from "../lib/shopperError";
import { cartNotFound } from "../security/cart-access";

const EXEMPT = (product: any) =>
  product?.regulatedCommerceRequired === false &&
  Boolean(product.regulatedExemptionReference) &&
  /^[a-f0-9]{64}$/i.test(product.regulatedExemptionDigest || "") &&
  Boolean(product.regulatedExemptionReviewedAt) &&
  new Date(product.regulatedExemptionExpiresAt || 0).getTime() > Date.now();

/** Everything the built-in providers need about a regulated cart, read once. */
async function regulatedCartScope(context: any, cartId: string) {
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `id grossTotal region { id currency { code } }
      shippingAddress { firstName lastName province country { iso2 } }
      shippingMethods { id price shippingOption { id data } }
      lineItems { quantity productVariant { id
        product { regulatedCommerceRequired regulatedExemptionReference regulatedExemptionDigest regulatedExemptionReviewedAt regulatedExemptionExpiresAt }
        regulatedClassification { category packageUnits }
      } }`,
  });
  if (!cart) throw cartNotFound();
  const regulatedLines = cart.lineItems.filter((line: any) => !EXEMPT(line.productVariant?.product));
  if (!regulatedLines.length) return null;
  const country = String(cart.shippingAddress?.country?.iso2 || "").toUpperCase();
  const province = String(cart.shippingAddress?.province || "").toUpperCase();
  const destination = country && province ? `${country}-${province}` : null;
  const profiles = await sudo.query.RegulatedMerchantProfile.findMany({
    where: { status: { equals: "active" } }, take: 2,
    query: "id originJurisdiction { code } launchJurisdictions { code }",
  });
  const merchant = profiles.length === 1 ? profiles[0] : null;
  const jurisdictions = destination ? await sudo.query.Jurisdiction.findMany({
    where: { code: { equals: destination }, status: { equals: "active" } }, take: 2, query: "id code",
  }) : [];
  const jurisdiction = jurisdictions.length === 1 ? jurisdictions[0] : null;
  const ruleSets = jurisdiction ? await sudo.query.RegulatedRuleSet.findMany({
    where: { jurisdiction: { id: { equals: jurisdiction.id } }, status: { equals: "active" } }, take: 2, query: "id rules",
  }) : [];
  const validated = ruleSets.length === 1 ? validateRules(ruleSets[0].rules) : { valid: false, rules: [] as any[] };
  const rules: any[] = validated.valid ? validated.rules : [];
  const lines = regulatedLines.map((line: any) => ({
    variantId: line.productVariant.id,
    category: line.productVariant.regulatedClassification?.category,
    quantity: line.quantity,
    packageUnits: line.productVariant.regulatedClassification?.packageUnits ?? 0,
  }));
  return {
    cart, destination, merchant, jurisdiction, rules, lines,
    thresholdAge: rules.filter(rule => rule.type === "minimum_age").reduce((max, rule) => Math.max(max, rule.value), 21),
    signatureMinimumAge: rules.filter(rule => rule.type === "adult_signature_required").reduce((max, rule) => Math.max(max, rule.minimumAge), 0) || null,
    packageMarkings: rules.filter(rule => rule.type === "package_marking").flatMap(rule => rule.markings as string[]),
  };
}

type Scope = NonNullable<Awaited<ReturnType<typeof regulatedCartScope>>>;

function carrierDecisionFor(scope: Scope, shippingOptionId: string, cartFingerprint: string, pickup = false) {
  return buildManualAdultSignatureDecision({
    cartFingerprint,
    shippingOptionId,
    originJurisdictionCode: scope.merchant?.originJurisdiction?.code ?? null,
    destinationJurisdictionCode: scope.destination,
    launchJurisdictionCodes: scope.merchant?.launchJurisdictions?.map((entry: any) => entry.code) ?? [],
    lines: scope.lines,
    packageMarkings: scope.packageMarkings,
    signatureMinimumAge: scope.signatureMinimumAge,
    pickup,
  });
}

async function hasCurrentCarrierDecision(context: any, cartId: string, shippingOptionId: string, cartFingerprint: string) {
  const count = await context.sudo().prisma.carrierEligibilityDecision.count({
    where: { cartId, shippingOptionId, cartFingerprint, result: "allow", expiresAt: { gt: new Date(Date.now() + 5 * 60_000) } },
  });
  return count > 0;
}

/**
 * Issue an allow decision for each shipping option of a regulated cart whose
 * destination is in launch scope. Existing current decisions are kept so an
 * option never ends up with two valid decisions.
 */
export async function prepareCarrierDecisions(context: any, cartId: string) {
  return issueCarrierDecisions(context, cartId);
}

async function issueCarrierDecisions(context: any, cartId: string) {
  const scope = await regulatedCartScope(context, cartId);
  if (!scope) return { regulated: false, issued: 0 };
  const compliance = await evaluateCartCompliance({ context, cartId, purpose: "cart" });
  if (compliance.decision?.result !== "allow") return { regulated: true, issued: 0 };
  const options = await context.sudo().query.ShippingOption.findMany({
    where: { region: { id: { equals: scope.cart.region.id } }, adminOnly: { equals: false }, isReturn: { equals: false } },
    take: 50, orderBy: [{ id: "asc" }], query: "id data",
  });
  const cartFingerprint = await cartEvidenceFingerprint(context, cartId);
  let issued = 0;
  for (const option of options) {
    if (await hasCurrentCarrierDecision(context, cartId, option.id, cartFingerprint)) continue;
    const decision = carrierDecisionFor(scope, option.id, cartFingerprint, isPickupOption(option));
    if (!decision) continue;
    await recordCarrierEligibility({
      context, cartId, shippingOptionId: option.id, providerCode: MANUAL_ADULT_SIGNATURE_PROVIDER_CODE, decision,
    });
    issued += 1;
  }
  return { regulated: true, issued };
}

function storeRateStore(context: any, scope: Scope): StoreRateTaxStore {
  const prisma = context.sudo().prisma;
  return {
    async ratesFor(jurisdictionCode) {
      const rows = await prisma.taxRate.findMany({ where: { regionId: scope.cart.region.id }, orderBy: { id: "asc" } });
      return rows.flatMap((row: any): StoreTaxRate[] => {
        const meta = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
        if (String(meta.jurisdictionCode || "").toUpperCase() !== jurisdictionCode || !TAX_KINDS.includes(meta.kind)) return [];
        return [{ id: row.id, kind: meta.kind as TaxKind, rate: Number(row.rate), updatedAt: new Date(row.updatedAt).toISOString() }];
      });
    },
    async taxable() {
      const shipping = scope.cart.shippingMethods.reduce((sum: number, method: any) => sum + (method.price || 0), 0);
      return { amount: Math.max(0, scope.cart.grossTotal - shipping), currencyCode: String(scope.cart.region.currency.code).toUpperCase() };
    },
    async findQuote(reference) {
      return prisma.regulatedTaxQuote.findFirst({ where: { providerReference: reference } });
    },
  };
}

export function storeRateAdapterFor(context: any, scope: Scope) {
  return createStoreRateTaxAdapter(storeRateStore(context, scope));
}

/** Reverse tax committed for an earlier version of this cart so only one commit stays live. */
async function releaseStaleTaxCommits(context: any, cartId: string, scope: Scope) {
  const stale = await context.sudo().prisma.regulatedTaxQuote.findMany({
    where: { cartId, orderId: null, status: "committed", providerCode: STORE_RATE_PROVIDER_CODE },
  });
  const adapter = storeRateAdapterFor(context, scope);
  for (const quote of stale) {
    await reverseRegulatedTaxCommit({ context, quoteId: quote.id, adapter, idempotencyKey: `stale:${quote.id}` });
  }
}

/** A GraphQLError, so the shopper (and the owner placing an order) reads the reason instead of "Unexpected error.". */
export class AgeCheckFailedError extends GraphQLError {
  constructor(public reasonCode: string) {
    super(reasonCode === "UNDER_MINIMUM_AGE" ? "AGE_CHECK_FAILED: You must be 21 or older to order." : "AGE_CHECK_FAILED: Confirm the name on your ID matches the shipping name.", { extensions: { code: "AGE_CHECK_FAILED", reasonCode } });
  }
}

/**
 * The age step. Records the age result, the carrier decision for the selected
 * delivery option, and a committed tax quote against the cart as it is now.
 * Any later cart change revokes all three, so the shopper repeats this step.
 */
export async function submitAgeCheck(
  context: any,
  { cartId, dateOfBirth, idNameMatchesShipping }: { cartId: string; dateOfBirth: string; idNameMatchesShipping: boolean },
) {
  const scope = await regulatedCartScope(context, cartId);
  if (!scope) return { regulated: false };
  if (!scope.destination || !scope.jurisdiction || !scope.merchant) throw shopperError("Regulated commerce denied: DESTINATION_JURISDICTION_UNRESOLVED", "REGULATED_COMMERCE_DENIED");
  const selected = scope.cart.shippingMethods[0]?.shippingOption?.id;
  if (!selected) throw shopperError("Choose a delivery method first.", "DELIVERY_METHOD_REQUIRED");

  await releaseStaleTaxCommits(context, cartId, scope);
  const cartFingerprint = await cartEvidenceFingerprint(context, cartId);

  const subjectDigest = digestCredential(
    `${dateOfBirth}|${normalizedName(scope.cart.shippingAddress?.firstName, scope.cart.shippingAddress?.lastName)}|${cartId}`,
    "age-attestation",
  );
  const result = evaluateDobAttestation({
    dateOfBirth, idNameMatchesShipping, thresholdAge: scope.thresholdAge, cartFingerprint, subjectDigest,
  });
  const { reasonCode, ...verification } = result;
  await recordVerifiedIdentityResult({
    context, cartId, providerCode: DOB_ATTEST_PROVIDER_CODE, thresholdAge: Math.max(21, scope.thresholdAge),
    consentPolicyVersion: DOB_ATTEST_CONSENT_VERSION, subjectDigest, cartFingerprint, result: verification,
  });
  if (verification.result !== "passed") throw new AgeCheckFailedError(reasonCode ?? "ID_NAME_NOT_CONFIRMED");

  if (!(await hasCurrentCarrierDecision(context, cartId, selected, cartFingerprint))) {
    const decision = carrierDecisionFor(scope, selected, cartFingerprint, isPickupOption(scope.cart.shippingMethods[0]?.shippingOption));
    if (!decision) throw shopperError("Regulated commerce denied: APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED", "REGULATED_COMMERCE_DENIED");
    await recordCarrierEligibility({ context, cartId, shippingOptionId: selected, providerCode: MANUAL_ADULT_SIGNATURE_PROVIDER_CODE, decision });
  }

  const adapter = storeRateAdapterFor(context, scope);
  const quoted = await adapter.quote({ cartId, jurisdictionCode: scope.destination, lines: scope.lines });
  const stored = await recordRegulatedTaxQuote({
    context, cartId, jurisdictionId: scope.jurisdiction.id, providerCode: STORE_RATE_PROVIDER_CODE,
    quote: { ...quoted, cartFingerprint },
  });
  await commitRegulatedTaxQuote({
    context, quoteId: stored.id, adapter,
    idempotencyKey: `commit:${evidenceDigest({ quoteId: stored.id })}`,
  });
  return { regulated: true };
}
