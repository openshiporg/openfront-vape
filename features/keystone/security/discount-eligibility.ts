type DiscountRegion = { id?: unknown };

/** Empty means unrestricted; a restricted discount needs an exact cart region. */
export function discountRegionEligible(regions: unknown, cartRegionId: unknown): boolean {
  if (!Array.isArray(regions)) return false;
  if (regions.length === 0) return true;
  return (
    typeof cartRegionId === "string" &&
    cartRegionId.length > 0 &&
    regions.some((region: DiscountRegion) => region?.id === cartRegionId)
  );
}

/** Only explicit null means unlimited; zero is a valid exhausted limit. */
export function discountHasUsageCapacity(usageLimit: unknown, usageCount: unknown): boolean {
  if (!Number.isSafeInteger(usageCount) || Number(usageCount) < 0) return false;
  if (usageLimit === null) return true;
  return (
    Number.isSafeInteger(usageLimit) &&
    Number(usageLimit) >= 0 &&
    Number(usageCount) < Number(usageLimit)
  );
}
