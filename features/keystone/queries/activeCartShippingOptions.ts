import type { KeystoneContext } from '@keystone-6/core/types';
import { assertCartAccess } from "../security/cart-access";
import {
  calculateCartSubtotalMinorUnits,
  matchesCurrentCartCarrierDecision,
  shippingDestinationWithinRegion,
  shippingOptionCharge,
  shippingSubtotalRequirementsMet,
} from "../security/shipping-eligibility";
import { evaluateCartCompliance } from "../regulated/enforcement";

// Every list read below stays within the global Keystone maxTake (100). Reads are
// count-verified; overflow or count drift fails closed (no options) instead of
// silently evaluating a truncated set.
const READ_LIMIT = 100;

async function activeCartShippingOptions(_root: unknown, { cartId }: { cartId: string }, context: KeystoneContext<any>) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // Get cart with region and shipping address
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      region {
        id
        countries { iso2 }
        currency {
          code
          noDivisionCurrency
        }
      }
      shippingAddress {
        id
        country { iso2 }
      }
      lineItemsCount
      lineItems(take: ${READ_LIMIT}) { quantity productVariant { id } }
    `
  });

  if (!cart?.region?.id) return [];
  if (
    !Number.isSafeInteger(cart.lineItemsCount) ||
    cart.lineItemsCount > READ_LIMIT ||
    (cart.lineItems || []).length !== cart.lineItemsCount
  ) return [];
  if (
    cart.shippingAddress?.country?.iso2 &&
    !shippingDestinationWithinRegion(
      cart.region.countries?.map((country: any) => country.iso2),
      cart.shippingAddress.country.iso2,
    )
  ) return [];
  const subtotal = await calculateCartSubtotalMinorUnits(sudoContext, cart);

  // Get shipping options based on region
  const shippingOptionWhere = {
    AND: [
      { region: { id: { equals: cart.region.id } } },
      { isReturn: { equals: false } },
      { adminOnly: { equals: false } }
    ]
  };
  const shippingOptionCount = await sudoContext.query.ShippingOption.count({ where: shippingOptionWhere });
  if (shippingOptionCount > READ_LIMIT) return [];
  const shippingOptions = await sudoContext.query.ShippingOption.findMany({
    where: shippingOptionWhere,
    take: READ_LIMIT,
    orderBy: [{ id: "asc" }],
    query: `
      id
      name
      amount
      priceType
      data
      shippingOptionRequirementsCount
      shippingOptionRequirements(take: ${READ_LIMIT}) {
        id
        type
        amount
      }
      taxRates {
        id
        rate
      }
    `
  });
  if (shippingOptions.length !== shippingOptionCount) return [];

  const compliance = await evaluateCartCompliance({
    context,
    cartId,
    purpose: "cart",
  });
  let permittedOptions = shippingOptions.filter((option: any) =>
    // A truncated requirement set could hide a minimum-subtotal rule: exclude the option.
    (option.shippingOptionRequirements || []).length === option.shippingOptionRequirementsCount &&
    shippingOptionCharge(option.priceType, option.amount) !== null &&
    shippingSubtotalRequirementsMet(option.shippingOptionRequirements, subtotal),
  );
  if (compliance.regulated) {
    if (compliance.decision?.result !== "allow") return [];
    const scope = compliance.carrierScope;
    if (
      !scope?.cartFingerprint ||
      !scope.destinationJurisdictionCode ||
      !scope.originJurisdictionCode
    ) return [];
    const now = new Date();
    const carrierDecisionWhere = {
      cart: { id: { equals: cartId } },
      result: { equals: "allow" },
      expiresAt: { gt: now.toISOString() },
      adultSignature: { equals: true },
      cartFingerprint: { equals: scope.cartFingerprint },
      destinationJurisdictionCode: { equals: scope.destinationJurisdictionCode },
      originJurisdictionCode: { equals: scope.originJurisdictionCode },
      providerApproval: {
        status: { equals: "active" },
        effectiveAt: { lte: now.toISOString() },
        expiresAt: { gt: now.toISOString() },
      },
    };
    const carrierDecisionCount = await sudoContext.query.CarrierEligibilityDecision.count({
      where: carrierDecisionWhere,
    });
    if (carrierDecisionCount > READ_LIMIT) return [];
    const carrierDecisions = await sudoContext.query.CarrierEligibilityDecision.findMany({
      where: carrierDecisionWhere,
      take: READ_LIMIT,
      orderBy: [{ id: "asc" }],
      query: `cartFingerprint shippingOption { id } destinationJurisdictionCode originJurisdictionCode
        result adultSignature rateId packageDigest carrierCode serviceCode issuedAt expiresAt
        providerApproval { status effectiveAt expiresAt shippingProvider { id } }`,
    });
    if (carrierDecisions.length !== carrierDecisionCount) return [];
    const validDecisionCounts = new Map<string, number>();
    for (const decision of carrierDecisions) {
      const optionId = decision.shippingOption?.id;
      if (
        typeof optionId === "string" &&
        matchesCurrentCartCarrierDecision(decision, {
          cartFingerprint: scope.cartFingerprint,
          shippingOptionId: optionId,
          destinationJurisdictionCode: scope.destinationJurisdictionCode,
          originJurisdictionCode: scope.originJurisdictionCode,
          now,
        })
      ) validDecisionCounts.set(optionId, (validDecisionCounts.get(optionId) || 0) + 1);
    }
    permittedOptions = permittedOptions.filter((option: any) => validDecisionCounts.get(option.id) === 1);
  }

  // Format prices and return
  const currencyCode = cart.region?.currency?.code || "USD";
  const divisor = cart.region?.currency?.noDivisionCurrency ? 1 : 100;

  return permittedOptions.map(option => {
    const taxRate = option.taxRates?.[0]?.rate || 0;
    const baseAmount = shippingOptionCharge(option.priceType, option.amount) as number;
    const calculatedAmount = baseAmount * (1 + taxRate);

    return {
      ...option,
      amount: baseAmount,
      calculatedAmount: formatAmount(calculatedAmount / divisor, currencyCode),
      isTaxInclusive: true
    };
  });
}

function formatAmount(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode
  }).format(amount);
}

export default activeCartShippingOptions; 