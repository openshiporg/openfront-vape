/**
 * Store pickup: a shipping option flagged `data.pickup === true`. The shopper
 * reserves online and pays at the counter, where age and ID are checked. It runs
 * through the same age, tax and carrier evidence as delivery (the counter is the
 * "carrier" collecting the adult signature), and the shopper's address must be in
 * the merchant's launch scope like any other order.
 */
export const PICKUP_CARRIER_CODE = "store_pickup";
export const PICKUP_OPTION_KEY = "store-pickup";

export function isPickupOption(option: { data?: unknown } | null | undefined): boolean {
  const data = option?.data;
  return Boolean(data && typeof data === "object" && !Array.isArray(data) && (data as Record<string, unknown>).pickup === true);
}

/** True when the cart's selected delivery method is store pickup. */
export function cartIsPickup(cart: { shippingMethods?: Array<{ shippingOption?: { data?: unknown } | null }> | null } | null | undefined): boolean {
  const methods = cart?.shippingMethods ?? [];
  return methods.length > 0 && methods.every(method => isPickupOption(method.shippingOption));
}

export function pickupInstructions(option: { data?: unknown } | null | undefined): string {
  const data = option?.data as Record<string, unknown> | undefined;
  return typeof data?.instructions === "string" ? data.instructions : "";
}
