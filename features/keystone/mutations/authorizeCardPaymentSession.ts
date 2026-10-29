"use server";
import { assertCartAccess } from "../security/cart-access";
import { createPayment } from "../utils/paymentProviderAdapter";
import { requireAllowedCartCompliance } from "../regulated/enforcement";

export default async function authorizeCardPaymentSession(_root: any, { cartId, sessionId, opaqueData }: { cartId: string; sessionId: string; opaqueData: { dataDescriptor: string; dataValue: string } }, context: any) {
  await assertCartAccess(context, cartId);
  if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) throw new Error("Card token is required");
  const sudo = context.sudo();
  const cart = await sudo.query.Cart.findOne({ where: { id: cartId }, query: `id rawTotal region { currency { code } } paymentCollection { id paymentSessions { id isSelected amount paymentProvider { id code createPaymentFunction } data } }` });
  const session = cart?.paymentCollection?.paymentSessions?.find((item: any) => item.id === sessionId && item.isSelected);
  if (!session || !session.paymentProvider?.code?.startsWith("pp_authorizenet")) throw new Error("Selected Authorize.net checkout session not found");
  await requireAllowedCartCompliance({ context, cartId, purpose: "payment", paymentProviderId: session.paymentProvider.id });
  if (!Number.isSafeInteger(cart.rawTotal) || cart.rawTotal !== session.amount) throw new Error("Cart payment amount changed; refresh checkout");
  const result = await createPayment({ provider: session.paymentProvider, cart, amount: cart.rawTotal, currency: cart.region.currency.code, idempotencyKey: `cart:${cartId}:${sessionId}`, opaqueData });
  if (result.status !== "authorized" || !result.paymentIntentId || result.amount !== cart.rawTotal || String(result.currency).toUpperCase() !== String(cart.region.currency.code).toUpperCase()) throw new Error("Authorize.net authorization did not match the checkout amount and currency");
  await sudo.prisma.paymentSession.update({ where: { id: sessionId }, data: { data: { paymentIntentId: result.paymentIntentId, status: "authorized" } } });
  return { success: true, paymentIntentId: result.paymentIntentId };
}
