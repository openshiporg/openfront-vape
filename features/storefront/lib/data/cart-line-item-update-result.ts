type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

/** Quantity actions are successful only when the exact cart and requested line value are confirmed. */
export function requireConfirmedCartLineItemUpdate(
  response: unknown,
  expected: { cartId: string; lineId: string; quantity: number },
): void {
  const payload = record(response);
  const cart = record(payload?.updateActiveCartLineItem);
  const lineItems = Array.isArray(cart?.lineItems) ? cart.lineItems : null;
  const matchingLines = lineItems?.filter((value) => record(value)?.id === expected.lineId) ?? [];
  const line = matchingLines.length === 1 ? record(matchingLines[0]) : null;

  if (
    !Number.isSafeInteger(expected.quantity) ||
    expected.quantity < 1 ||
    Object.prototype.hasOwnProperty.call(payload || {}, "errors") ||
    cart?.id !== expected.cartId ||
    !lineItems ||
    matchingLines.length !== 1 ||
    line?.quantity !== expected.quantity
  ) {
    throw new Error("Unable to confirm the cart quantity update");
  }
}
