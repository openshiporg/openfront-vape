"use server";

import { createPayment } from "../utils/paymentProviderAdapter";
import { cartIsPickup } from "../regulated/pickup";
import { assertCartAccess } from "../security/cart-access";
import { isPaymentProviderConfigured } from "../utils/paymentProviderConfig";
import { applyGiftCardsToCart } from "../checkout/cart-amount-due";
import { regulatedTaxAmountForCart, requireAllowedCartCompliance } from "../regulated/enforcement";
import { shopperError } from "../lib/shopperError";
import { cartNotFound } from "../security/cart-access";
import { autoRefundKey, paymentCreateKey, providerPaymentId } from "../checkout/payment-keys";

async function initiatePaymentSession(
  root: any,
  { cartId, paymentProviderId }: { cartId: string; paymentProviderId: string },
  context: any
) {
  await assertCartAccess(context, cartId);
  const sudoContext = context.sudo();

  // Get cart with all needed data for total calculation and payment status
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      rawTotal
      metadata
      giftCards { id code balance isDisabled endsAt region { id } }
      shippingAddress { id country { iso2 } }
      shippingMethods { shippingOption { data } }
      billingAddress { id }
      lineItems { productVariant { product { productTags { id } } } }
      region {
        id
        taxRate
        paymentProviders { id }
        currency {
          code
          noDivisionCurrency
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          isSelected
          isInitiated
          amount
          paymentProvider {
            id
            code
          }
          data
        }
      }
    `,
  });

  if (!cart) {
    throw cartNotFound();
  }

  if (!cart.shippingAddress?.id || !cart.billingAddress?.id || cart.rawTotal < 0) {
    throw shopperError("A positive cart with billing and shipping addresses is required", "CART_INCOMPLETE");
  }

  // Get payment provider with all required fields
  const provider = await sudoContext.query.PaymentProvider.findOne({
    where: { code: paymentProviderId },
    query: `
      id 
      code 
      isInstalled
      createPaymentFunction
      capturePaymentFunction
      refundPaymentFunction
      getPaymentStatusFunction
      generatePaymentLinkFunction
      credentials
    `,
  });

  if (
    !provider ||
    !provider.isInstalled ||
    !isPaymentProviderConfigured(provider.code) ||
    !cart.region.paymentProviders?.some((item: any) => item.id === provider.id)
  ) {
    throw shopperError("Payment provider not found, installed, and configured for this region", "PAYMENT_PROVIDER_UNAVAILABLE");
  }
  // Manual tender is the pay-at-pickup path; a delivery cart must pay by card.
  if (provider.code === "pp_system_default" && !cartIsPickup(cart)) {
    throw shopperError("Pay in store is only available for pickup orders. Choose a card to have this order delivered.", "PAY_IN_STORE_PICKUP_ONLY");
  }
  const compliance = await requireAllowedCartCompliance({
    context,
    cartId,
    purpose: "payment",
    paymentProviderId: provider.id,
  });
  if (compliance.regulated) {
    cart.rawTotal += await regulatedTaxAmountForCart(context, cartId, ["committed"]);
  }
  // Gift cards pay first: the session is for the remainder only.
  applyGiftCardsToCart(cart);
  if (cart.rawTotal <= 0) {
    throw shopperError("Gift cards cover this order. Place the order without a card payment.", "GIFT_CARD_COVERS_TOTAL");
  }
  // First check if we have an existing payment collection
  if (!cart.paymentCollection) {
    // Create new payment collection if none exists
    cart.paymentCollection = await sudoContext.query.PaymentCollection.createOne({
      data: {
        cart: { connect: { id: cart.id } },
        amount: cart.rawTotal,
        description: "default",
      },
      query: "id",
    });
  }

  // Check for existing session with same provider
  const existingSession = cart.paymentCollection?.paymentSessions?.find(
    (session: any) => session.paymentProvider.code === paymentProviderId
  );

  // A session whose charge was already refunded is spent: it gets a new provider payment, never the old one.
  const existingPaymentId = providerPaymentId(existingSession?.data);
  const spent = existingPaymentId
    ? Boolean(await sudoContext.prisma.idempotencyKey.findUnique({ where: { idempotencyKey: autoRefundKey(existingPaymentId) }, select: { id: true } }))
    : false;
  // Unique per payment collection: a cart that got a new collection after a refund gets a new intent.
  const createKey = (provider: { code: string }) => paymentCreateKey({
    paymentCollectionId: cart.paymentCollection.id, providerCode: provider.code, amount: cart.rawTotal,
    currency: cart.region.currency.code, spentPaymentId: spent ? existingPaymentId : null,
  });

  if (
    !spent &&
    existingSession?.isInitiated &&
    existingSession.amount === cart.rawTotal &&
    existingSession.data &&
    Object.keys(existingSession.data).length
  ) {
    await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: { isSelected: true },
      });
    });
    return { ...existingSession, isSelected: true };
  }

  // Initialize and select a pre-created provider session.
  if (existingSession) {
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: createKey(provider),
    });
    await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentSession.update({
        where: { id: existingSession.id },
        data: {
          isSelected: true,
          isInitiated: true,
          amount: cart.rawTotal,
          data: sessionData,
        },
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal },
      });
    });
    return { ...existingSession, amount: cart.rawTotal, data: sessionData, isInitiated: true };
  }

  // If we get here, we need to create a new session
  try {
    // Initialize provider-specific session using the adapter
    const sessionData = await createPayment({
      provider,
      cart,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: createKey(provider),
    });

    const newSession = await sudoContext.prisma.$transaction(async (tx: any) => {
      await tx.paymentSession.updateMany({
        where: { paymentCollectionId: cart.paymentCollection.id },
        data: { isSelected: false },
      });
      await tx.paymentCollection.update({
        where: { id: cart.paymentCollection.id },
        data: { amount: cart.rawTotal },
      });
      return tx.paymentSession.create({
        data: {
          paymentCollectionId: cart.paymentCollection.id,
          paymentProviderId: provider.id,
          amount: cart.rawTotal,
          isSelected: true,
          isInitiated: true,
          data: sessionData,
        },
      });
    });

    return newSession;
  } catch (error) {
    console.error("Payment session creation failed:", error);
    throw error;
  }
}

export default initiatePaymentSession;
