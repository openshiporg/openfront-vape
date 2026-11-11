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
import { randomUUID } from "node:crypto";
import { autoRefundKey, providerPaymentId } from "../checkout/payment-keys";

/**
 * Stripe confirms the card in the browser before this runs, so by the time a check below fails the money
 * may already be taken. Such a charge is refunded, but only:
 *  - after this caller passed cart access (a stranger is refused before anything can touch the money);
 *  - under the cart fence, by the one call that claims the checkout attempt (an in-flight checkout holds
 *    the attempt lock, so a parallel call can never refund the charge that call is turning into an order);
 *  - when the attempt records that claim before the refund is sent.
 * A recoverable captured attempt (payment_unknown, payment_confirmed, order_created) is never refunded.
 */
async function completeActiveCart(root: any, args: { cartId: string; paymentSessionId?: string }, context: any) {
  await assertCartAccess(context, args.cartId, { allowCompleted: true });
  if (args.paymentSessionId) {
    await assertPaymentSessionBelongsToCart(context, args.cartId, args.paymentSessionId);
  }
  try {
    return await completeActiveCartOnce(root, args, context);
  } catch (error) {
    if (args.paymentSessionId) {
      await refundChargeAfterFailure(args.cartId, args.paymentSessionId, context).catch((refundError) =>
        console.error('Refund after failed checkout could not be checked', args.cartId, refundError));
    }
    throw error;
  }
}

const IN_FLIGHT_MS = 5 * 60 * 1000;
const CHARGE_TAKEN = ['succeeded', 'completed', 'captured'];

/** An attempt that holds no order, no recoverable capture and no live lock: nobody else is turning this charge into an order. */
export function refundClaimable(attempt: { recoveryPoint?: string; lockedAt?: Date | string | null } | null | undefined, now = Date.now()): boolean {
  if (!attempt) return true;
  const unlocked = !attempt.lockedAt || new Date(attempt.lockedAt).getTime() < now - IN_FLIGHT_MS;
  if (['started', 'failed'].includes(String(attempt.recoveryPoint))) return unlocked;
  // A refund claim whose call died: the next call finishes it (the provider status says whether the refund went out).
  if (attempt.recoveryPoint === 'refund_claimed') return unlocked;
  return false;
}

export { autoRefundKey, providerPaymentId };

/** Charged and not refunded at all: the only state an order may be settled against. */
export function chargeIsHeld(status: any): boolean {
  return CHARGE_TAKEN.includes(String(status?.status || '').toLowerCase()) && !(Number(status?.amountRefunded || 0) > 0);
}

/**
 * Refund the card charge of a checkout that failed before any order exists. The caller has already passed
 * cart access. The claim, the refund and the bookkeeping are three steps; the provider call never runs inside
 * the database transaction.
 */
type RefundDeps = { getPaymentStatus: typeof getPaymentStatus; refundPayment: typeof refundPayment; fence: typeof withCartFence; bookkeeping: typeof lockCartForBookkeeping };
export async function refundChargeAfterFailure(cartId: string, paymentSessionId: string, context: any, overrides: Partial<RefundDeps> = {}) {
  const deps: RefundDeps = { getPaymentStatus, refundPayment, fence: withCartFence, bookkeeping: lockCartForBookkeeping, ...overrides };
  const claim = randomUUID();
  // 1. Claim, under the cart fence (re-checks access, row-locks the cart and the checkout attempt).
  const claimed = await deps.fence(context, cartId, 'recovery', async (locked) => {
    const tx = locked.sudo().prisma;
    const cart = await tx.cart.findUnique({ where: { id: cartId }, select: { id: true, orderId: true, paymentCollectionId: true } });
    if (!cart || cart.orderId || !cart.paymentCollectionId) return null;
    const session = await tx.paymentSession.findFirst({
      where: { id: paymentSessionId, paymentCollectionId: cart.paymentCollectionId },
      include: { paymentProvider: true },
    });
    const provider = session?.paymentProvider;
    const paymentId = providerPaymentId(session?.data);
    if (!provider || !paymentId || provider.code === 'pp_system_default') return null;
    // Money behind an order is never refunded from here.
    const backing = await tx.payment.findFirst({ where: { data: { path: ['paymentIntentId'], equals: paymentId }, status: 'captured' }, select: { id: true } });
    if (backing) return null;
    const attempt = await tx.idempotencyKey.findUnique({ where: { idempotencyKey: checkoutKey(cartId) } });
    if (!refundClaimable(attempt)) return null;
    const previous = attempt && attempt.recoveryPoint !== 'refund_claimed'
      ? { recoveryPoint: attempt.recoveryPoint, responseBody: attempt.responseBody ?? null, responseCode: attempt.responseCode ?? null }
      : { recoveryPoint: 'started', responseBody: null, responseCode: null };
    const body = { claim, paymentId, paymentSessionId, previous };
    if (attempt) {
      await tx.idempotencyKey.update({ where: { id: attempt.id }, data: { recoveryPoint: 'refund_claimed', responseBody: body, lockedAt: new Date() } });
    } else {
      await tx.idempotencyKey.create({
        data: { idempotencyKey: checkoutKey(cartId), requestMethod: 'POST', requestPath: 'completeActiveCart', requestParams: { cartId }, recoveryPoint: 'refund_claimed', responseBody: body, lockedAt: new Date() },
      });
    }
    return { provider, paymentId, previous, currency: null as string | null };
  });
  if (!claimed) return { refunded: false, reason: 'not_claimed' as const };

  // 2. Outside the transaction: what the provider holds, and the refund.
  let refunded = false;
  let refundId: string | undefined;
  let failure: string | undefined;
  try {
    const status = await deps.getPaymentStatus({ provider: claimed.provider, paymentId: claimed.paymentId });
    const taken = CHARGE_TAKEN.includes(String(status?.status || '').toLowerCase());
    const amount = Number(status?.amount);
    const already = Number(status?.amountRefunded || 0);
    if (taken && Number.isInteger(amount) && amount > 0) {
      if (already >= amount) {
        refunded = true; // an earlier claim's refund went out
      } else {
        const refund = await deps.refundPayment({
          provider: claimed.provider,
          paymentId: claimed.paymentId,
          amount: amount - already,
          currency: String(status.currency || 'usd'),
          idempotencyKey: `${checkoutKey(cartId)}:auto-refund:${claimed.paymentId}`,
        });
        if (!['succeeded', 'completed', 'refunded', 'pending'].includes(String(refund?.status || '').toLowerCase())) {
          throw new Error(`Refund status: ${refund?.status}`);
        }
        refunded = true;
        refundId = refund?.data?.id;
      }
    }
  } catch (error) {
    failure = error instanceof Error ? error.message : String(error);
    console.error('Automatic refund of a charge with no order did not complete', cartId, failure);
  }

  // 3. Record it. A refunded intent goes on the auto-refund ledger (the database then refuses any captured
  // payment or new session on it) and its spent payment collection is detached, so the next payment session is
  // a new collection and a new intent. Otherwise the attempt goes back to where it was.
  await deps.bookkeeping(context, cartId, async (tx) => {
    if (refunded) {
      const ledgerKey = autoRefundKey(claimed.paymentId);
      if (!(await tx.idempotencyKey.findUnique({ where: { idempotencyKey: ledgerKey } }))) {
        await tx.idempotencyKey.create({
          data: { idempotencyKey: ledgerKey, requestMethod: 'POST', requestPath: 'autoRefund', requestParams: { cartId, paymentId: claimed.paymentId }, recoveryPoint: 'completed', responseCode: 200, responseBody: { cartId, paymentId: claimed.paymentId, refundId: refundId ?? null } },
        });
      }
    }
    const attempt = await tx.idempotencyKey.findUnique({ where: { idempotencyKey: checkoutKey(cartId) } });
    const ours = attempt?.recoveryPoint === 'refund_claimed' && attempt.responseBody?.claim === claim;
    // A late provider webhook can mark the claimed attempt payment_confirmed for this same, now refunded, intent.
    const webhookPromoted = refunded && attempt?.recoveryPoint === 'payment_confirmed' && attempt.responseBody?.paymentResult?.paymentIntentId === claimed.paymentId;
    if (!attempt || !(ours || webhookPromoted)) return;
    if (refunded) {
      await tx.cart.update({ where: { id: cartId }, data: { paymentCollectionId: null } });
      await tx.idempotencyKey.update({ where: { id: attempt.id }, data: { recoveryPoint: 'started', responseCode: 409, responseBody: { autoRefund: { paymentIntentId: claimed.paymentId, refundId: refundId ?? null } }, lockedAt: null } });
    } else {
      await tx.idempotencyKey.update({
        where: { id: attempt.id },
        data: { recoveryPoint: claimed.previous.recoveryPoint, responseBody: failure ? { ...(claimed.previous.responseBody || {}), autoRefundError: failure.slice(0, 300) } : claimed.previous.responseBody, responseCode: claimed.previous.responseCode, lockedAt: null },
      });
    }
  });
  return { refunded, reason: refunded ? 'refunded' as const : failure ? 'refund_failed' as const : 'nothing_held' as const };
}

/** The bookkeeping step runs even when the caller's access changed mid-refund: the money already moved. */
async function lockCartForBookkeeping(context: any, cartId: string, run: (tx: any) => Promise<void>) {
  const sudo = context.sudo();
  await sudo.prisma.$transaction(async (tx: any) => {
    await tx.$queryRaw`SELECT id FROM "Cart" WHERE id = ${cartId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "IdempotencyKey" WHERE "idempotencyKey" = ${checkoutKey(cartId)} FOR UPDATE`;
    await run(tx);
  });
}

async function autoRefunded(prisma: any, paymentId: string | undefined): Promise<boolean> {
  if (!paymentId) return false;
  return Boolean(await prisma.idempotencyKey.findUnique({ where: { idempotencyKey: autoRefundKey(paymentId) }, select: { id: true } }));
}

function paymentRefusal(status: string) {
  const normalized = String(status || '').toLowerCase();
  if (normalized === 'refunded') {
    return shopperError('This card payment was refunded, so it cannot pay for the order. Go back to payment and pay again.', 'PAYMENT_REFUNDED');
  }
  if (['requires_action', 'requires_confirmation'].includes(normalized)) {
    return shopperError('Your bank asked you to confirm this payment. Finish the card step, then place the order again.', 'PAYMENT_ACTION_REQUIRED');
  }
  if (normalized === 'requires_payment_method') {
    return shopperError('Your card was declined. Try again or use another card.', 'PAYMENT_DECLINED');
  }
  return shopperError('The card payment did not go through. Try again or use another card.', 'PAYMENT_NOT_COMPLETED');
}

async function completeActiveCartOnce(
  root: any,
  { cartId, paymentSessionId }: { cartId: string; paymentSessionId?: string },
  context: any
) {
  // Access was checked by completeActiveCart; the fence below checks it again under the row locks.
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
  const pending = await sudoContext.prisma.idempotencyKey.findUnique({ where: { idempotencyKey: checkoutKey(cartId) }, select: { recoveryPoint: true } });
  if (pending?.recoveryPoint === 'refund_claimed') {
    // Another call is giving this charge back. completeActiveCart finishes a stale claim after this refusal.
    throw shopperError('Your earlier card payment is being refunded. Wait a moment, then pay again.', 'PAYMENT_REFUND_IN_PROGRESS');
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
  // A cart started before sign-in has no owner yet; its shipping address belongs to the signed-in shopper.
  const cartOwnerId = cart.user?.id ?? cart.shippingAddress?.user?.id;
  if (cartOwnerId !== user) throw new Error("Checkout could not be completed");
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
  if (attempt.recoveryPoint === 'payment_confirmed' && paymentResult) {
    // A recovered capture: make sure the money is still held before an order is written against it.
    const recoveredId = paymentResult.paymentIntentId;
    const status = await autoRefunded(sudoContext.prisma, recoveredId)
      ? { status: 'succeeded', amountRefunded: 1 }
      : await getPaymentStatus({ provider: selectedSession.paymentProvider, paymentId: recoveredId });
    if (!chargeIsHeld(status)) {
      await updateCheckoutAttempt(sudoContext.prisma, attempt.id, 'resources_reserved', { refundedPaymentResult: { ...paymentResult, status: 'refunded' } });
      attempt.recoveryPoint = 'resources_reserved';
      // The shopper already paid again on a new session: settle that one. Otherwise refuse.
      if (providerPaymentId(selectedSession.data) === recoveredId) throw paymentRefusal('refunded');
      paymentResult = null;
    }
  }
  if (attempt.recoveryPoint !== 'payment_confirmed' || !paymentResult) {
    try {
      paymentResult = await settlePaymentSession(selectedSession, cart, sudoContext.prisma);
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
      throw paymentRefusal(paymentResult.providerStatus || paymentResult.status);
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

  // This call captured the card. If the order cannot be created, rewind the attempt (the catch returns stock
  // and holds and unlocks it); completeActiveCart then claims the attempt and refunds the charge.
  let order;
  try {
    order = await createOrderFromCartAtomically(cart, sudoContext);
  } catch (error) {
    await updateCheckoutAttempt(sudoContext.prisma, attempt.id, 'resources_reserved', { paymentResult, orderError: error instanceof Error ? error.message.slice(0, 300) : 'Order could not be created' });
    attempt.recoveryPoint = 'resources_reserved';
    throw error;
  }
  await createPaymentRecord(paymentResult, selectedSession, order, cart, sudoContext);

  return order;
}

async function settlePaymentSession(session: any, cart: any, prisma: any) {
  const provider = session.paymentProvider;
  if (provider.code === 'pp_system_default') {
    // Pickup carts never reach here (they reserve instead); delivery stays card-only.
    throw shopperError('Manual tender cannot complete storefront checkout', 'PAYMENT_METHOD_NOT_ALLOWED');
  }

  const paymentId = providerPaymentId(session.data);
  if (!paymentId) throw new Error('Payment provider reference is missing');
  // A refunded intent still reports "succeeded": never settle an order against it.
  if (await autoRefunded(prisma, paymentId)) return { status: 'refunded', providerStatus: 'refunded', paymentIntentId: paymentId };

  let result = await getPaymentStatus({ provider, paymentId });
  if (Number(result?.amountRefunded || 0) > 0) return { status: 'refunded', providerStatus: 'refunded', paymentIntentId: paymentId };
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
    return { status: 'failed', providerStatus: finalStatus, paymentIntentId: paymentId, error: `Payment status: ${result.status}` };
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