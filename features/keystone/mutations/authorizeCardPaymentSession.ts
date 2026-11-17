"use server";
import { assertCartAccess } from "../security/cart-access";
import { createPayment, getPaymentStatus, refundPayment } from "../utils/paymentProviderAdapter";
import { regulatedTaxAmountForCart, requireAllowedCartCompliance } from "../regulated/enforcement";
import { applyGiftCardsToCart } from "../checkout/cart-amount-due";
import { shopperError } from "../lib/shopperError";

export default async function authorizeCardPaymentSession(_root: any, { cartId, sessionId, opaqueData }: { cartId: string; sessionId: string; opaqueData: { dataDescriptor: string; dataValue: string } }, context: any) {
  await assertCartAccess(context, cartId);
  if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) throw shopperError("Card token is required", "CARD_TOKEN_REQUIRED");
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({ where: { id: cartId }, query: `id rawTotal metadata giftCards { id code balance isDisabled endsAt region { id } } region { id currency { code } } paymentCollection { id paymentSessions { id isSelected amount paymentProvider { id code createPaymentFunction getPaymentStatusFunction refundPaymentFunction credentials } data } }` });
  const session = cart?.paymentCollection?.paymentSessions?.find((item: any) => item.id === sessionId && item.isSelected);
  if (!session || !session.paymentProvider?.code?.startsWith("pp_authorizenet")) throw shopperError("Selected Authorize.net checkout session not found", "PAYMENT_SESSION_NOT_FOUND");
  const compliance = await requireAllowedCartCompliance({ context, cartId, purpose: "payment", paymentProviderId: session.paymentProvider.id });
  if (compliance.regulated) cart.rawTotal += await regulatedTaxAmountForCart(context, cartId, ["committed"]);
  applyGiftCardsToCart(cart);
  if (!Number.isSafeInteger(cart.rawTotal) || cart.rawTotal !== session.amount) throw shopperError("Cart payment amount changed; refresh checkout", "CART_TOTAL_CHANGED");
  const result = await createPayment({ provider: session.paymentProvider, cart, amount: cart.rawTotal, currency: cart.region.currency.code, idempotencyKey: `cart:${cartId}:${sessionId}`, opaqueData });
  if (result.status !== "authorized" || !result.paymentIntentId || result.amount !== cart.rawTotal || String(result.currency).toUpperCase() !== String(cart.region.currency.code).toUpperCase()) throw new Error("Authorize.net authorization did not match the checkout amount and currency");
  await sudo.prisma.paymentSession.update({ where: { id: sessionId }, data: { data: { paymentIntentId: result.paymentIntentId, status: "authorized" } } });
  // A cart change starts a new session and a new hold; release the one this cart held before.
  const previous = cart.metadata?.authorizeNetHold;
  await sudo.prisma.cart.update({ where: { id: cartId }, data: { metadata: { ...(cart.metadata || {}), authorizeNetHold: result.paymentIntentId } } });
  if (typeof previous === "string" && previous && previous !== result.paymentIntentId) {
    await releaseHold(sudo, session.paymentProvider, previous).catch((error: unknown) =>
      console.error("Earlier Authorize.net hold could not be released", cartId, error instanceof Error ? error.message : error));
  }
  return { success: true, paymentIntentId: result.paymentIntentId };
}

/** Void an authorization that is still only held and backs no order. */
async function releaseHold(sudo: any, provider: any, paymentId: string) {
  const backing = await sudo.prisma.payment.findFirst({ where: { data: { path: ["paymentIntentId"], equals: paymentId } }, select: { id: true } });
  if (backing) return;
  const status = await getPaymentStatus({ provider, paymentId });
  if (String(status?.status || "").toLowerCase() !== "authorized" || !Number.isSafeInteger(status?.amount)) return;
  await refundPayment({ provider, paymentId, amount: status.amount, currency: String(status.currency || "USD"), idempotencyKey: `release:${paymentId}` });
}
