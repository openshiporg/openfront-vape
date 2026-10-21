import { permissions } from "../access";
import { verifyCartProof } from "./token-crypto";
import { currentCommerceActor, withCartFence } from "./commerce-fence";

type CartAccessOptions = {
  allowCompleted?: boolean;
};

/** Row lock shared by cart edits and checkout acquisition; no network calls inside. */
export async function withCartMutationLock<T>(context: any, cartId: string, run: (tx: any) => Promise<T>, newAddresses: readonly string[] = []): Promise<T> {
  return withCartFence(context, cartId, "mutation", run, newAddresses);
}

function headerValue(value: unknown): string | undefined {
  if (Array.isArray(value)) return value[0];
  return typeof value === "string" ? value : undefined;
}

function cookieValue(cookieHeader: string | undefined, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) {
      try { return decodeURIComponent(value.join("=")); } catch { return undefined; }
    }
  }
  return undefined;
}

export function getCartProofFromContext(context: any): string | undefined {
  const headers = context?.req?.headers || {};
  return (
    headerValue(headers["x-openfront-cart-proof"]) ||
    cookieValue(headerValue(headers.cookie), "_openfront_cart_id")
  );
}

export async function assertCartAccess(
  context: any,
  cartId: string,
  options: CartAccessOptions = {}
): Promise<{ id: string; user?: { id: string } | null; order?: { id: string } | null }> {
  if (!cartId) throw new Error("Cart ID is required");

  context = await currentCommerceActor(context);
  const canManage = permissions.canManageOrders({ session: context.session });
  const sessionUserId = context.session?.itemId;
  const proof = getCartProofFromContext(context);

  // Anonymous callers must prove possession before any privileged lookup.
  if (!canManage && !sessionUserId && !verifyCartProof(proof, cartId)) {
    throw new Error("Cart not found");
  }

  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id user { id } order { id }",
  });

  if (!cart) throw new Error("Cart not found");

  if (!canManage) {
    const ownsCart = Boolean(sessionUserId && cart.user?.id === sessionUserId);
    const ownsGuestProof = Boolean(!cart.user && verifyCartProof(proof, cartId));
    if (!ownsCart && !ownsGuestProof) throw new Error("Cart not found");
  }

  if (!options.allowCompleted && cart.order?.id) {
    throw new Error("Cart has already been completed");
  }

  return cart;
}

export async function assertLineItemBelongsToCart(
  context: any,
  cartId: string,
  lineItemId: string
): Promise<void> {
  await assertCartAccess(context, cartId);
  const lineItem = await context.sudo().query.LineItem.findOne({
    where: { id: lineItemId },
    query: "id cart { id }",
  });
  if (lineItem?.cart?.id !== cartId) throw new Error("Line item not found");
}

export async function assertAddressAccess(
  context: any,
  addressId: string
): Promise<{ id: string; country?: { iso2?: string | null } | null }> {
  context = await currentCommerceActor(context);
  const canManage = permissions.canManageOrders({ session: context.session });
  const address = await context.sudo().query.Address.findOne({
    where: { id: addressId },
    query: "id user { id } country { iso2 }",
  });
  if (
    !address ||
    (!canManage && (!context.session?.itemId || address.user?.id !== context.session.itemId))
  ) {
    throw new Error("Address not found");
  }
  return address;
}

export async function assertPaymentSessionBelongsToCart(
  context: any,
  cartId: string,
  paymentSessionId: string
): Promise<void> {
  await assertCartAccess(context, cartId, { allowCompleted: true });
  const cart = await context.sudo().query.Cart.findOne({
    where: { id: cartId },
    query: "id paymentCollection { paymentSessions { id } }",
  });
  if (
    !cart?.paymentCollection?.paymentSessions?.some(
      (session: any) => session.id === paymentSessionId
    )
  ) {
    throw new Error("Payment session not found");
  }
}
