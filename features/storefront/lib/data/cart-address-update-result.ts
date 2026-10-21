type AddressUpdateExpectation = {
  cartId: string;
  shippingAddressId: unknown;
  billingAddressId?: unknown;
  shippingCountryCode: string;
};

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

/** Never report the address action as successful on a nullable or mismatched mutation result. */
export function requireUpdatedCartAddresses(
  response: unknown,
  expected: AddressUpdateExpectation
): string {
  const payload = record(response);
  const cart = record(payload?.updateActiveCart);
  const shippingAddress = record(cart?.shippingAddress);
  const billingAddress = record(cart?.billingAddress);
  const shippingCountry = record(shippingAddress?.country);
  const region = record(cart?.region);
  const regionCountries = Array.isArray(region?.countries)
    ? region.countries.map(country => record(country)?.iso2)
    : null;
  const confirmedCountryCode = shippingCountry?.iso2;

  if (
    Object.prototype.hasOwnProperty.call(payload || {}, "errors") ||
    cart?.id !== expected.cartId ||
    shippingAddress?.id !== expected.shippingAddressId ||
    typeof confirmedCountryCode !== "string" ||
    confirmedCountryCode.trim().toUpperCase() !== expected.shippingCountryCode.trim().toUpperCase() ||
    !Array.isArray(regionCountries) ||
    !regionCountries.some(country => typeof country === "string" && country.trim().toUpperCase() === confirmedCountryCode.trim().toUpperCase()) ||
    (expected.billingAddressId !== undefined && billingAddress?.id !== expected.billingAddressId)
  ) {
    throw new Error("Unable to confirm the cart address update");
  }

  return confirmedCountryCode.trim().toUpperCase();
}
