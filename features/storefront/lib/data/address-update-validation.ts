import { shippingDestinationWithinRegion } from "../../../keystone/security/shipping-eligibility";

type RecordValue = Record<string, unknown>;

function record(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as RecordValue)
    : null;
}

function normalized(value: unknown, country = false): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  return country ? trimmed.toUpperCase() : trimmed;
}

/** Reuse a saved address only when the submitted address fields still match it. */
export function submittedShippingAddressMatchesSaved(
  savedValue: unknown,
  submitted: Record<string, unknown>,
): boolean {
  const saved = record(savedValue);
  const country = record(saved?.country);
  if (!saved || !country) return false;

  const fields: Array<[string, unknown, boolean?]> = [
    ["firstName", saved.firstName],
    ["lastName", saved.lastName],
    ["company", saved.company],
    ["address1", saved.address1],
    ["city", saved.city],
    ["province", saved.province],
    ["postalCode", saved.postalCode],
    ["phone", saved.phone],
    ["countryCode", country.iso2, true],
  ];
  return fields.every(([inputName, savedValue, isCountry]) =>
    normalized(submitted[inputName], isCountry) === normalized(savedValue, isCountry),
  );
}

export function shippingCountryAllowedInCartRegion(
  regionCountryCodes: unknown,
  destinationCountryCode: unknown,
): boolean {
  return shippingDestinationWithinRegion(regionCountryCodes, destinationCountryCode);
}

/** Fail closed instead of choosing an arbitrary region when configuration overlaps. */
export function requireUniqueCartRegionId(regionsValue: unknown): string {
  if (!Array.isArray(regionsValue) || regionsValue.length !== 1) {
    throw new Error("A unique cart region could not be confirmed");
  }
  const region = record(regionsValue[0]);
  if (typeof region?.id !== "string" || !region.id.trim()) {
    throw new Error("A unique cart region could not be confirmed");
  }
  return region.id;
}
