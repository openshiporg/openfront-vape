type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

/** Do not treat a nullable or mismatched region mutation payload as success. */
export function requireUpdatedCartRegion(
  response: unknown,
  expected: { cartId: string; regionId: string },
): void {
  const payload = record(response);
  const cart = record(payload?.updateActiveCart);
  const region = record(cart?.region);
  if (
    Object.prototype.hasOwnProperty.call(payload || {}, "errors") ||
    cart?.id !== expected.cartId ||
    region?.id !== expected.regionId
  ) {
    throw new Error("Unable to confirm the cart region update");
  }
}
