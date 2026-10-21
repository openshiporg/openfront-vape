type ShippingMutationResult = {
  addActiveCartShippingMethod?: {
    id?: unknown;
    shippingMethods?: Array<{
      id?: unknown;
      price?: unknown;
      shippingOption?: { id?: unknown } | null;
    }> | null;
  } | null;
} | null;

/** Do not advance checkout on a null, partial, or mismatched mutation payload. */
export function requireConfirmedShippingSelection(
  result: unknown,
  expected: { cartId: string; shippingOptionId: string },
) {
  const cart = (result as ShippingMutationResult)?.addActiveCartShippingMethod;
  const methods = cart?.shippingMethods;
  if (
    !cart ||
    cart.id !== expected.cartId ||
    !Array.isArray(methods) ||
    methods.length !== 1 ||
    methods[0]?.shippingOption?.id !== expected.shippingOptionId ||
    !Number.isSafeInteger(methods[0]?.price) ||
    Number(methods[0]?.price) < 0
  ) {
    throw new Error("Unable to confirm the selected shipping method. Please review and try again.");
  }
  return cart;
}
