"use server";
import { assertCartAccess } from "../security/cart-access";
import { createPayment } from "../utils/paymentProviderAdapter";
import { regulatedTaxAmountForCart, requireAllowedCartCompliance } from "../regulated/enforcement";
import { applyGiftCardsToCart } from "../checkout/cart-amount-due";
import { shopperError } from "../lib/shopperError";

export default async function authorizeCardPaymentSession(_root: any, { cartId, sessionId, opaqueData }: { cartId: string; sessionId: string; opaqueData: { dataDescriptor: string; dataValue: string } }, context: any) {
  await assertCartAccess(context, cartId);
  if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) throw shopperError("Card token is required", "CARD_TOKEN_REQUIRED");
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({ where: { id: cartId }, query: `id rawTotal giftCards { id code balance isDisabled endsAt region { id } } region { id currency { code } } paymentCollection { id paymentSessions { id isSelected amount paymentProvider { id code createPaymentFunction } data } }` });
  const session = cart?.paymentCollection?.paymentSessions?.find((item: any) => item.id === sessionId && item.isSelected);
  if (!session || !session.paymentProvider?.code?.startsWith("pp_authorizenet")) throw shopperError("Selected Authorize.net checkout session not found", "PAYMENT_SESSION_NOT_FOUND");
  const compliance = await requireAllowedCartCompliance({ context, cartId, purpose: "payment", paymentProviderId: session.paymentProvider.id });
  if (compliance.regulated) cart.rawTotal += await regulatedTaxAmountForCart(context, cartId, ["committed"]);
  applyGiftCardsToCart(cart);
  if (!Number.isSafeInteger(cart.rawTotal) || cart.rawTotal !== session.amount) throw shopperError("Cart payment amount changed; refresh checkout", "CART_TOTAL_CHANGED");
  const result = await createPayment({ provider: session.paymentProvider, cart, amount: cart.rawTotal, currency: cart.region.currency.code, idempotencyKey: `cart:${cartId}:${sessionId}`, opaqueData });
  if (result.status !== "authorized" || !result.paymentIntentId || result.amount !== cart.rawTotal || String(result.currency).toUpperCase() !== String(cart.region.currency.code).toUpperCase()) throw new Error("Authorize.net authorization did not match the checkout amount and currency");
  await sudo.prisma.paymentSession.update({ where: { id: sessionId }, data: { data: { paymentIntentId: result.paymentIntentId, status: "authorized" } } });
  return { success: true, paymentIntentId: result.paymentIntentId };
}
