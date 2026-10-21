import { assertCartAccess, withCartMutationLock } from "../security/cart-access";
import {
  calculateCartSubtotalMinorUnits,
  matchesCurrentCartCarrierDecision,
  shippingDestinationWithinRegion,
  shippingOptionCharge,
  shippingSubtotalRequirementsMet,
} from "../security/shipping-eligibility";
import { evaluateCartCompliance, invalidateCartCompliance } from "../regulated/enforcement";

async function addActiveCartShippingMethod(
  root: any,
  { cartId, shippingMethodId }: { cartId: string; shippingMethodId: string },
  context: any
) {
  return withCartMutationLock(context, cartId, async context => {
  await assertCartAccess(context, cartId);
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `id region { id currency { code } countries { iso2 } }
      shippingAddress { country { iso2 } }
      lineItems { quantity productVariant { id } }`,
  });
  const option = await sudo.query.ShippingOption.findOne({
    where: { id: shippingMethodId },
    query: `id amount name priceType adminOnly isReturn region { id }
      shippingOptionRequirements { type amount }`,
  });
  if (
    !cart?.region?.id ||
    !option ||
    !option.region?.id ||
    option.region.id !== cart.region.id ||
    option.adminOnly ||
    option.isReturn ||
    !shippingDestinationWithinRegion(
      cart.region.countries?.map((country: any) => country.iso2),
      cart.shippingAddress?.country?.iso2,
    )
  ) {
    throw new Error("Shipping option not found");
  }
  const price = shippingOptionCharge(option.priceType, option.amount);
  const subtotal = await calculateCartSubtotalMinorUnits(sudo, cart);
  if (
    price === null ||
    !shippingSubtotalRequirementsMet(option.shippingOptionRequirements, subtotal)
  ) {
    throw new Error("Shipping option is not eligible for this cart");
  }

  const compliance = await evaluateCartCompliance({ context, cartId, purpose: "cart" });
  if (compliance.regulated) {
    if (compliance.decision?.result !== "allow") {
      throw new Error(`Regulated shipping denied: ${compliance.decision?.reasonCodes.join(", ")}`);
    }
    const scope = compliance.carrierScope;
    if (
      !scope?.cartFingerprint ||
      !scope.destinationJurisdictionCode ||
      !scope.originJurisdictionCode
    ) {
      throw new Error("A current approved carrier decision is required");
    }
    const { cartFingerprint, destinationJurisdictionCode, originJurisdictionCode } = scope;
    const now = new Date();
    const decisions = await sudo.query.CarrierEligibilityDecision.findMany({
      where: {
        cart: { id: { equals: cartId } },
        shippingOption: { id: { equals: option.id } },
        result: { equals: "allow" },
        adultSignature: { equals: true },
        cartFingerprint: { equals: scope.cartFingerprint },
        destinationJurisdictionCode: { equals: scope.destinationJurisdictionCode },
        originJurisdictionCode: { equals: scope.originJurisdictionCode },
        expiresAt: { gt: now.toISOString() },
        providerApproval: {
          status: { equals: "active" },
          effectiveAt: { lte: now.toISOString() },
          expiresAt: { gt: now.toISOString() },
        },
      },
      take: 2,
      query: `cartFingerprint shippingOption { id } destinationJurisdictionCode originJurisdictionCode
        result adultSignature rateId packageDigest carrierCode serviceCode issuedAt expiresAt
        providerApproval { status effectiveAt expiresAt shippingProvider { id } }`,
    });
    const currentDecisions = decisions.filter((decision: any) =>
      matchesCurrentCartCarrierDecision(decision, {
        cartFingerprint,
        shippingOptionId: option.id,
        destinationJurisdictionCode,
        originJurisdictionCode,
        now,
      }),
    );
    if (currentDecisions.length !== 1) throw new Error("A current approved carrier decision is required");
  }

  { const tx = context;
    await assertCartAccess(tx, cartId);
    const transactionPrisma = tx.sudo().prisma;
    await transactionPrisma.shippingMethod.deleteMany({ where: { cartId } });
    await transactionPrisma.shippingMethod.create({
      data: {
        cartId,
        shippingOptionId: option.id,
        price,
        data: { name: option.name },
      },
    });
    await transactionPrisma.cart.update({
      where: { id: cartId },
      data: { paymentCollectionId: null },
    });
    await invalidateCartCompliance(tx, cartId, "SHIPPING_METHOD_CHANGED", true);
  }

  return sudo.query.Cart.findOne({
    where: { id: cartId },
    query: "id shippingMethods { id price data shippingOption { id name } }",
  });
  });
}

export default addActiveCartShippingMethod;
