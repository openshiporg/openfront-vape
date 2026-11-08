import {
  assertCartAccess,
  assertPaymentSessionBelongsToCart,
} from "../security/cart-access";
import {
  capturePayment,
  getPaymentStatus,
  refundPayment,
} from "../utils/paymentProviderAdapter";
import {
  checkoutKey,
  getOrCreateCheckoutAttempt,
  releaseCheckoutResources,
  replayReconciliationStep,
  reserveCartInventory,
  reserveDiscountUsage,
  updateCheckoutAttempt,
} from "../checkout/recovery";
import { applyGiftCardsToCart } from "../checkout/cart-amount-due";
import { commitGiftCardHold, findGiftCardHold, holdGiftCards, releaseGiftCardHold, type GiftCardAllocation } from "../checkout/gift-card-tender";
import { createOrderFromCartAtomically, resolveOrderCustomer } from "../checkout/order-commit";
import { withCartFence } from "../security/commerce-fence";
import { cartEvidenceFingerprint } from "../regulated/cart-fingerprint";
import { cartIsPickup } from '../regulated/pickup';
import { assertCommerceReleaseEnabled } from "../../regulated-commerce/core/release-gate";
import { evidenceDigest } from "../../regulated-commerce/core/decision-engine";
import {
  enqueueWebhookOutbox,
  subscribedWebhookEndpointIds,
} from "../../webhooks/outbox";
import { regulatedTaxAmountForCart, requireAllowedCartCompliance } from "../regulated/enforcement";
import { shopperError } from "../lib/shopperError";
import { cartNotFound } from "../security/cart-access";

/**
 * Stripe confirms the card in the browser before this runs, so by the time any check below can fail the
 * money may already be taken. Any failure that leaves no order and no recoverable captured attempt
 * refunds the charge here, so a charge never stands without an order.
 */
async function completeActiveCart(root: any, args: { cartId: string; paymentSessionId?: string }, context: any) {
  try {
    return await completeActiveCartOnce(root, args, context);
  } catch (error) {
    if (args.paymentSessionId && (error as any)?.extensions?.code !== 'CHECKOUT_IN_PROGRESS') {
      await refundChargeAfterFailure(args.cartId, args.paymentSessionId, context).catch((refundError) =>
        console.error('Refund after failed checkout could not be checked', args.cartId, refundError));
    }
    throw error;
  }
}

async function refundChargeAfterFailure(cartId: string, paymentSessionId: string, context: any) {
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({
    where: { id: cartId },
    query: `id order { id } region { currency { code } }
      paymentCollection { paymentSessions { id data paymentProvider { id code refundPaymentFunction getPaymentStatusFunction credentials } } }`,
  });
  if (!cart || cart.order?.id) return;
  const attempt = await sudo.prisma.idempotencyKey.findUnique({ where: { idempotencyKey: checkoutKey(cartId) } });
  // After capture the attempt is recoverable: a retry completes the order without charging again.
  if (attempt && ['payment_unknown', 'order_created', 'payment_confirmed', 'completed'].includes(attempt.recoveryPoint)) return;
  await refundOrphanedCharge(cart, paymentSessionId, sudo, attempt);
}

async function completeActiveCartOnce(
  root: any,
  { cartId, paymentSessionId }: { cartId: string; paymentSessionId?: string },
  context: any
) {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  if (paymentSessionId) {
    await assertPaymentSessionBelongsToCart(context, cartId, paymentSessionId);
  }
  const sudoContext = context.sudo();
  const user = context.session?.itemId;

  const { cart, attempt } = await withCartFence(context, cartId, "checkout", async locked => {
    const context = locked;
    const sudoContext = locked.sudo();
  // Get cart with all necessary data
  const cart = await sudoContext.query.Cart.findOne({
    where: { id: cartId },
    query: `
      id
      email
      createdAt
      rawTotal
      metadata
      order {
        id
        status
        displayId
        secretKey
        payments { id data }
        account { id }
        shippingAddress { country { iso2 } }
      }
      user {
        id
        hasAccount
        createdAt
      }
      shippingAddress {
        id
        country { iso2 }
        user {
          id
          hasAccount
          createdAt
        }
      }
      region {
        id
        taxRate
        currency {
          code
          id
        }
      }
      billingAddress {
        id
      }
      shippingAddress {
        id
      }
      discounts {
        id
        code
      }
      giftCards { id code balance isDisabled endsAt region { id } }
      shippingMethods {
        id
        shippingOption { id data }
      }
      lineItems {
        id
        quantity
        metadata
        unitPrice
        total
        productVariant {
          id
          sku
          title
          inventoryQuantity
          manageInventory
          allowBackorder
          primaryImage {
            image {
              url
            }
            imagePath
          }
          product {
            id
            title
            thumbnail
            productTags { id }
            description {
              document
            }
            metadata
          }
          prices {
            id
            amount
            compareAmount
            currency {
              code
            }
            calculatedPrice {
              calculatedAmount
              originalAmount
              currencyCode
            }
          }
          measurements {
            id
            value
            unit
            type
          }
        }
      }
      paymentCollection {
        id
        amount
        paymentSessions {
          id
          amount
          data
          paymentProvider {
            id
            code
            capturePaymentFunction
            refundPaymentFunction
            getPaymentStatusFunction
            generatePaymentLinkFunction
          }
        }
      }
    `,
  });

  if (!cart) {
    throw cartNotFound();
  }

    if (cart.order?.id) return { cart, attempt: null };
    await assertCommerceReleaseEnabled(context);
  cart.acceptedCheckoutFingerprint = await cartEvidenceFingerprint(context, cartId);
  const selectedProviderId = paymentSessionId
    ? cart.paymentCollection?.paymentSessions?.find((session: any) => session.id === paymentSessionId)?.paymentProvider?.id
    : null;
  const compliance = await requireAllowedCartCompliance({
    context,
    cartId,
    purpose: "checkout",
    paymentProviderId: selectedProviderId,
  });
  if (compliance.regulated) {
    cart.rawTotal += await regulatedTaxAmountForCart(context, cartId, ["committed"]);
  }
  // Gift cards pay first. Once balances are held, price from the hold so a recovered checkout
  // never re-allocates against balances that already moved. rawTotal is then what the processor collects.
  const existingHold = await findGiftCardHold(sudoContext.prisma, cartId);
  if (existingHold) {
    cart.grossTotal = existingHold.body.gross;
    cart.giftCardAllocation = existingHold.body;
    cart.rawTotal = existingHold.body.due;
  } else {
    applyGiftCardsToCart(cart);
  }
  const attempt = await getOrCreateCheckoutAttempt(
    sudoContext.prisma,
    cartId,
    paymentSessionId,
    { cartFingerprint: cart.acceptedCheckoutFingerprint, amount: cart.rawTotal, gross: cart.grossTotal, giftCards: (cart.giftCardAllocation as GiftCardAllocation).applied.map((card) => `${card.id}:${card.amount}`), currency: cart.region.currency.code,
      acceptanceDigest: evidenceDigest(compliance.regulated ? compliance.acceptanceReferences : { regulated: false }) }
  );
    return { cart, attempt };
  });
  // The cart/order relationship is the local recovery anchor. Complete any
  // post-provider local records before returning a previously created order.
  if (cart.order?.id) {
    const existingAttempt = await sudoContext.prisma.idempotencyKey.findUnique({
      where: { idempotencyKey: checkoutKey(cartId) },
    });
    // The order exists, so its gift-card hold is already committed: price the replay from it. The cart
    // read above returns before allocation, so without this a covered order looked like an account order.
    const replayHold = await findGiftCardHold(sudoContext.prisma, cartId);
    const replayApplied = replayHold?.body.applied?.length ?? 0;
    const step = replayReconciliationStep({
      paymentSessionId,
      hasCardPayment: Boolean(cart.order.payments?.some((payment: any) => payment.data?.tender !== 'gift_card')),
      coveredByGiftCards: replayApplied > 0 && replayHold?.body.due === 0,
      hasAccount: Boolean(cart.order.account?.id),
      giftCardsApplied: replayApplied > 0,
    });
    if (step === 'payment') {
      const selectedSession = cart.paymentCollection?.paymentSessions?.find(
        (session: any) => session.id === paymentSessionId
      );
      const paymentResult = existingAttempt?.responseBody?.paymentResult;
      if (selectedSession?.paymentProvider?.code === 'pp_system_default' && cartIsPickup(cart)) {
        await recordPayAtPickup(cart.order, selectedSession, cart, sudoContext);
      } else if (!selectedSession || !paymentResult || existingAttempt.recoveryPoint !== 'payment_confirmed') {
        throw new Error('Checkout requires payment reconciliation');
      } else {
        await createPaymentRecord(paymentResult, selectedSession, cart.order, cart, sudoContext);
      }
    } else if (step === 'account') {
      if (!user) throw new Error('Checkout requires account reconciliation');
      const accounts = await sudoContext.query.Account.findMany({
        where: {
          user: { id: { equals: user } },
          accountType: { equals: 'business' },
          status: { equals: 'active' },
        },
        take: 1,
        query: 'id',
      });
      if (!accounts[0]) throw new Error('Checkout requires account reconciliation');
      await addOrderToAccount(accounts[0].id, cart.order, sudoContext);
    }
    await commitGiftCardHold(sudoContext.prisma, cartId, cart.order, cart.region.currency.code, resolveOrderCustomer(cart).userId);
    if (existingAttempt) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        existingAttempt.id,
        'completed',
        { orderId: cart.order.id },
        200
      );
    }
    return sudoContext.query.Order.findOne({
      where: { id: cart.order.id },
      query: 'id status displayId secretKey shippingAddress { country { iso2 } }',
    });
  }
  if (!attempt) throw new Error("Checkout attempt is missing");
  if (attempt.recoveryPoint === 'completed' && attempt.responseBody?.orderId) {
    return sudoContext.query.Order.findOne({
      where: { id: attempt.responseBody.orderId },
      query: 'id status displayId secretKey shippingAddress { country { iso2 } }',
    });
  }

  const allocation = cart.giftCardAllocation as GiftCardAllocation;
  const giftCardsApplied = allocation.applied.length > 0;
  const coveredByGiftCards = giftCardsApplied && allocation.due === 0;

  let inventoryReserved = attempt.recoveryPoint !== 'started';
  let discountsReserved = [
    'resources_reserved',
    'payment_unknown',
    'order_created',
    'payment_confirmed',
  ].includes(attempt.recoveryPoint);
  try {
    if (!inventoryReserved) {
      await reserveCartInventory(
        sudoContext.prisma,
        cart.lineItems,
        checkoutKey(cartId),
        attempt.id
      );
      inventoryReserved = true;
      attempt.recoveryPoint = 'stock_reserved';
    }
    if (!discountsReserved) {
      await reserveDiscountUsage(
        sudoContext.prisma,
        cart.discounts || [],
        attempt.id
      );
      discountsReserved = true;
      attempt.recoveryPoint = 'resources_reserved';
    }

    // Debit the cards under a durable hold; a replayed checkout finds the hold instead of debiting twice.
    if (giftCardsApplied) await holdGiftCards(sudoContext.prisma, cartId, allocation);

    const order = coveredByGiftCards
      ? await handleGiftCardOrder(cart, sudoContext, attempt)
      : !paymentSessionId
        ? await handleAccountOrder(cart, user, sudoContext, attempt)
        : await handlePaidOrder(cart, paymentSessionId, sudoContext, attempt);
    if (giftCardsApplied) {
      await commitGiftCardHold(sudoContext.prisma, cartId, order, cart.region.currency.code, resolveOrderCustomer(cart).userId);
    }

    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      'completed',
      { orderId: order.id },
      200
    );
    return order;
  } catch (error) {
    // Before an external payment succeeds, stock can be safely released. Once
    // payment is confirmed the durable attempt remains recoverable and a retry
    // completes the local order without charging again.
    if (
      inventoryReserved &&
      !['payment_unknown', 'order_created', 'payment_confirmed'].includes(attempt.recoveryPoint)
    ) {
      await releaseCheckoutResources(
        sudoContext.prisma,
        cart.lineItems,
        discountsReserved ? (cart.discounts || []) : [],
        checkoutKey(cartId),
        attempt.id,
        error instanceof Error ? error.message : 'Checkout failed'
      );
      await releaseGiftCardHold(sudoContext.prisma, cartId, error instanceof Error ? error.message : 'Checkout failed');
    } else if (!inventoryReserved && attempt.recoveryPoint === 'started') {
      // Nothing was taken: unlock so the shopper can change the cart and try again at once.
      await updateCheckoutAttempt(sudoContext.prisma, attempt.id, 'started', { error: error instanceof Error ? error.message : 'Checkout failed' }, 409);
    }
    throw error;
  }
}

// Gift cards cover the whole order: no card processor is involved.
async function handleGiftCardOrder(cart: any, sudoContext: any, attempt: any) {
  const hold = await findGiftCardHold(sudoContext.prisma, cart.id);
  if (!hold || hold.body.due !== 0) throw new Error('Gift card hold is missing');
  await updateCheckoutAttempt(sudoContext.prisma, attempt.id, 'payment_confirmed', { paymentResult: { status: 'gift_card' } });
  attempt.recoveryPoint = 'payment_confirmed';
  return createOrderFromCartAtomically(cart, sudoContext);
}

// Handle orders that go to accounts (Openship customer token flow)
async function handleAccountOrder(cart: any, user: string, sudoContext: any, attempt: any) {
  if (!user) {
    throw new Error('Authentication required for account orders');
  }
  
  // Get cart currency for account matching
  if (cart.user?.id !== user) throw new Error("Checkout could not be completed");
  const cartCurrency = cart.region?.currency?.code;
  if (!cartCurrency) {
    throw new Error('Cart region or currency not found');
  }
  
  // Find the user's business account (single account approach)
  const accounts = await sudoContext.query.Account.findMany({
    where: { 
      user: { id: { equals: user } },
      accountType: { equals: 'business' },
      status: { equals: 'active' }
    },
    query: `
      id
      totalAmount
      paidAmount
      creditLimit
      currency {
        id
        code
        noDivisionCurrency
      }
      user {
        id
        email
      }
    `
  });
  
  const activeAccount = accounts[0];
  
  if (!activeAccount) {
    throw new Error(`No active business account found. Contact administrator to set up business account access.`);
  }
  
  // Cross-currency credit requires an owner-approved rate source and accounting
  // policy. The bounded launch fails closed instead of using an approximation.
  if (cartCurrency !== activeAccount.currency.code) {
    throw new Error('Cross-currency account orders are outside the supported launch boundary');
  }
  const orderInAccountCurrency = cart.rawTotal;
  
  // Create order without payment processing
  const order = await createOrderFromCartAtomically(cart, sudoContext);
  await updateCheckoutAttempt(
    sudoContext.prisma,
    attempt.id,
    'order_created',
    { orderId: order.id }
  );
  attempt.recoveryPoint = 'order_created';
  
  // Add order to account with transaction safety
  await addOrderToAccount(activeAccount.id, order, sudoContext);
  
  return order;
}

// Handle orders with payment processing (regular storefront)
async function handlePaidOrder(cart: any, paymentSessionId: string, sudoContext: any, attempt: any) {
  // Find the specific payment session by ID
  const selectedSession = cart.paymentCollection?.paymentSessions?.find(
    (session: any) => session.id === paymentSessionId
  );

  if (!selectedSession) {
    throw new Error(`Payment session not found. Looking for session ID: ${paymentSessionId}`);
  }
  
  if (!selectedSession.paymentProvider) {
    throw new Error("Payment provider not found in session");
  }
  
  if (!selectedSession.paymentProvider.code) {
    throw new Error("Payment provider code is missing");
  }
  if (selectedSession.amount !== cart.rawTotal) {
    throw shopperError("Payment session amount no longer matches cart total", "CART_TOTAL_CHANGED");
  }

  // Reserve online, pay at the counter: a pickup cart paying with the manual
  // provider becomes an unpaid order. Delivery carts never take this path.
  if (selectedSession.paymentProvider.code === 'pp_system_default' && cartIsPickup(cart)) {
    const order = await createOrderFromCartAtomically(cart, sudoContext);
    await recordPayAtPickup(order, selectedSession, cart, sudoContext);
    return order;
  }

  let paymentResult = attempt.responseBody?.paymentResult;
  if (attempt.recoveryPoint !== 'payment_confirmed' || !paymentResult) {
    try {
      paymentResult = await settlePaymentSession(selectedSession, cart);
    } catch (error) {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        'payment_unknown',
        { error: error instanceof Error ? error.message : String(error) }
      );
      attempt.recoveryPoint = 'payment_unknown';
      throw error;
    }
    if (paymentResult.status !== 'succeeded') {
      await updateCheckoutAttempt(
        sudoContext.prisma,
        attempt.id,
        'resources_reserved',
        { paymentResult }
      );
      attempt.recoveryPoint = 'resources_reserved';
      throw new Error(`Payment failed: ${paymentResult.error || paymentResult.status}`);
    }
    await updateCheckoutAttempt(
      sudoContext.prisma,
      attempt.id,
      'payment_confirmed',
      { paymentResult }
    );
    attempt.recoveryPoint = 'payment_confirmed';
    attempt.responseBody = { paymentResult };
  }

  // The card is already charged. If the order cannot be created, give the money back in this same path
  // rather than leave a capture with no order. Rewinding the attempt lets the catch return stock and holds.
  let order;
  try {
    order = await createOrderFromCartAtomically(cart, sudoContext);
  } catch (error) {
    const refunded = await refundOrphanedCharge(cart, paymentSessionId, sudoContext, attempt, paymentResult.paymentIntentId);
    if (refunded) {
      await updateCheckoutAttempt(sudoContext.prisma, attempt.id, 'resources_reserved', { autoRefund: { paymentIntentId: paymentResult.paymentIntentId } });
      attempt.recoveryPoint = 'resources_reserved';
    }
    throw error;
  }
  await createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext);

  return order;
}

/**
 * Refund a card charge that has no order. Looks the intent up first, so a payment that never succeeded
 * is left alone. On success the spent session is detached from the cart (a refunded intent still reports
 * "succeeded", so a retry must never settle against it). If the refund itself fails the charge stays
 * recoverable: the caller's attempt is not rewound and a retry completes the order without charging again.
 */
export async function refundOrphanedCharge(cart: any, paymentSessionId: string, sudoContext: any, attempt: any, knownIntentId?: string): Promise<boolean> {
  try {
    const session = cart.paymentCollection?.paymentSessions?.find((entry: any) => entry.id === paymentSessionId);
    const provider = session?.paymentProvider;
    const paymentId = knownIntentId || session?.data?.paymentIntentId || session?.data?.clientSecret?.split('_secret_')[0];
    if (!provider || !paymentId || provider.code === 'pp_system_default') return false;
    const status = await getPaymentStatus({ provider, paymentId });
    if (!['succeeded', 'completed', 'captured'].includes(String(status?.status || '').toLowerCase())) return false;
    const amount = Number(status.amount);
    if (!Number.isInteger(amount) || amount <= 0) return false;
    const refund = await refundPayment({
      provider,
      paymentId,
      amount,
      currency: String(status.currency || cart.region.currency.code),
      idempotencyKey: `${checkoutKey(cart.id)}:auto-refund:${paymentId}`,
    });
    if (!['succeeded', 'completed', 'refunded', 'pending'].includes(String(refund?.status || '').toLowerCase())) {
      throw new Error(`Refund status: ${refund?.status}`);
    }
    await sudoContext.prisma.cart.update({ where: { id: cart.id }, data: { paymentCollectionId: null } });
    return true;
  } catch (error) {
    console.error('Automatic refund of a charge with no order did not complete', cart.id, error);
    return false;
  }
}

async function settlePaymentSession(session: any, cart: any) {
  const provider = session.paymentProvider;
  if (provider.code === 'pp_system_default') {
    // Pickup carts never reach here (they reserve instead); delivery stays card-only.
    throw shopperError('Manual tender cannot complete storefront checkout', 'PAYMENT_METHOD_NOT_ALLOWED');
  }

  const paymentId =
    session.data?.paymentIntentId ||
    session.data?.clientSecret?.split('_secret_')[0] ||
    session.data?.orderId;
  if (!paymentId) throw new Error('Payment provider reference is missing');

  let result = await getPaymentStatus({ provider, paymentId });
  const normalizedStatus = String(result.status || '').toLowerCase();
  if (['requires_capture', 'approved', 'authorized'].includes(normalizedStatus)) {
    result = await capturePayment({
      provider,
      paymentId,
      amount: cart.rawTotal,
      currency: cart.region.currency.code,
      idempotencyKey: checkoutKey(cart.id),
    });
  }

  const finalStatus = String(result.status || '').toLowerCase();
  const succeeded = ['succeeded', 'completed', 'captured'].includes(finalStatus);
  const resultAmount = Number(result.amount);
  const expectedCurrency = String(cart.region.currency.code).toUpperCase();
  const resultCurrency = String(result.currency || expectedCurrency).toUpperCase();

  if (!succeeded) {
    return { status: 'failed', paymentIntentId: paymentId, error: `Payment status: ${result.status}` };
  }
  if (!Number.isInteger(resultAmount) || resultAmount !== cart.rawTotal) {
    throw new Error('Provider payment amount does not match cart total');
  }
  if (resultCurrency !== expectedCurrency) {
    throw new Error('Provider payment currency does not match cart currency');
  }

  return {
    status: 'succeeded',
    paymentIntentId: paymentId,
    amount: resultAmount,
    currency: resultCurrency,
    data: result.data,
  };
}

// Helper function to add order to account
async function addOrderToAccount(accountId: string, order: any, sudoContext: any) {
  const orderDetails = await sudoContext.query.Order.findOne({
    where: { id: order.id },
    query: `
      id
      displayId
      rawTotal
      region {
        id
        name
        currency {
          code
        }
      }
      currency {
        code
      }
      lineItems {
        id
      }
    `
  });

  // Single account approach - no currency validation needed
  // Orders from any region can be added to the business account

  // Use atomic transaction to ensure data consistency
  try {
    await sudoContext.prisma.$transaction(async (tx: any) => {
      const existing = await tx.accountLineItem.findUnique({
        where: { orderKey: order.id },
        select: { id: true, accountId: true },
      });
      if (existing && existing.accountId !== accountId) {
        throw new Error('Order is already posted to a different account');
      }

      if (!existing) {
        const amount = orderDetails.rawTotal || 0;
        // Lock the account before evaluating and consuming credit so concurrent
        // checkouts cannot both spend the same available balance.
        const accountRows = await tx.$queryRaw<Array<{
          id: string;
          status: string;
          totalAmount: number;
          paidAmount: number;
          creditLimit: number;
        }>>`SELECT id, status, "totalAmount", "paidAmount", "creditLimit" FROM "Account" WHERE id = ${accountId} FOR UPDATE`;
        const account = accountRows[0];
        if (!account || account.status !== 'active') {
          throw new Error('Business account is not active');
        }
        const availableCredit = account.creditLimit - ((account.totalAmount || 0) - (account.paidAmount || 0));
        if (amount > availableCredit) throw new Error('Insufficient account credit');
        await tx.account.update({
          where: { id: accountId },
          data: { totalAmount: { increment: amount } },
        });
        await tx.accountLineItem.create({
          data: {
            accountId,
            orderId: order.id,
            orderKey: order.id,
            regionId: orderDetails.region.id,
            description: `Order #${orderDetails.displayId} - ${orderDetails.lineItems?.length || 0} items`,
            amount,
            orderDisplayId: String(orderDetails.displayId),
            itemCount: orderDetails.lineItems?.length || 0,
            paymentStatus: 'unpaid',
          }
        });
      }

      await tx.order.update({
        where: { id: order.id },
        data: { accountId }
      });
    }, { isolationLevel: 'Serializable' });

    console.log(`Order #${orderDetails.displayId} added to account ${accountId} for ${orderDetails.rawTotal} ${orderDetails.currency.code}`);
    
  } catch (error) {
    console.error('Error adding order to account:', error);
    throw new Error(
      `Failed to add order to account: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

// Helper function to create payment record
/**
 * The pay-at-pickup payment record: pending, nothing captured. The merchant
 * marks it paid at the counter or cancels the order in admin.
 */
async function recordPayAtPickup(order: any, selectedSession: any, cart: any, sudoContext: any) {
  await sudoContext.prisma.$transaction(async (tx: any) => {
    const existing = await tx.payment.findFirst({
      where: { orderId: order.id, paymentCollectionId: cart.paymentCollection.id },
    });
    if (existing) return;
    const payment = await tx.payment.create({
      data: {
        status: 'pending',
        amount: cart.rawTotal,
        currencyCode: cart.region.currency.code,
        data: { ...selectedSession.data, method: 'pay_at_pickup', paymentProviderId: selectedSession.paymentProvider.id },
        metadata: { checkoutIdempotencyKey: checkoutKey(cart.id), payAtPickup: true },
        idempotencyKey: checkoutKey(cart.id),
        paymentCollectionId: cart.paymentCollection.id,
        orderId: order.id,
        userId: resolveOrderCustomer(cart).userId || null,
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PAYMENT_STATUS_CHANGE',
        data: { paymentId: payment.id, status: 'pending', method: 'pay_at_pickup', amount: cart.rawTotal },
      },
    });
  });
}

async function createPaymentRecord(
  paymentResult: any,
  selectedSession: any,
  order: any,
  cart: any,
  sudoContext: any
) {
  const paymentWebhookEndpointIds = await subscribedWebhookEndpointIds(
    sudoContext,
    'payment.captured'
  );
  await sudoContext.prisma.$transaction(async (tx: any) => {
    const existing = await tx.payment.findFirst({
      where: { orderId: order.id, paymentCollectionId: cart.paymentCollection.id },
    });
    if (existing) return;
    const payment = await tx.payment.create({
      data: {
        status: 'captured',
        amount: cart.rawTotal,
        currencyCode: cart.region.currency.code,
        data: {
          ...selectedSession.data,
          ...paymentResult.data,
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId,
        },
        metadata: { checkoutIdempotencyKey: checkoutKey(cart.id) },
        idempotencyKey: checkoutKey(cart.id),
        capturedAt: new Date(),
        paymentCollectionId: cart.paymentCollection.id,
        orderId: order.id,
        userId: resolveOrderCustomer(cart).userId || null,
      },
    });
    await tx.capture.create({
      data: {
        amount: cart.rawTotal,
        paymentId: payment.id,
        metadata: {
          paymentProviderId: selectedSession.paymentProvider.id,
          paymentIntentId: paymentResult.paymentIntentId,
        },
        createdBy: 'checkout',
      },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'PAYMENT_CAPTURED',
        data: {
          paymentId: payment.id,
          amount: cart.rawTotal,
          currencyCode: cart.region.currency.code,
          source: 'checkout',
        },
      },
    });
    await enqueueWebhookOutbox(
      tx,
      paymentWebhookEndpointIds,
      'payment.captured',
      'Payment',
      payment.id,
      { id: payment.id, orderId: order.id, amount: cart.rawTotal, currencyCode: cart.region.currency.code }
    );
  });
}

export default completeActiveCart; 