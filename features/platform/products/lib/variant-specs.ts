// Structured variant specs edited in the admin variant form (ProductVariant fields).
export const VARIANT_SPEC_FIELDS = [
  { key: "batteryCapacityMah", label: "Battery (mAh)", placeholder: "1000", numeric: true },
  { key: "liquidCapacityMl", label: "Capacity (ml)", placeholder: "2", numeric: true },
  { key: "nicotineStrengthMgMl", label: "Nicotine strength (mg/ml)", placeholder: "6", numeric: true },
  { key: "coilResistanceOhm", label: "Resistance (Ω)", placeholder: "0.8", numeric: true },
  { key: "coilType", label: "Coil type", placeholder: "Mesh", numeric: false },
] as const;

const blank = (value: unknown) => value === null || value === undefined || String(value).trim() === "";

// Form values -> update input. Blank clears; battery is a whole number.
export function variantSpecInput(variant: Record<string, any>) {
  const battery = variant.batteryCapacityMah;
  return {
    batteryCapacityMah: blank(battery) ? null : Math.round(Number(battery)),
    liquidCapacityMl: blank(variant.liquidCapacityMl) ? null : String(variant.liquidCapacityMl).trim(),
    nicotineStrengthMgMl: blank(variant.nicotineStrengthMgMl) ? null : String(variant.nicotineStrengthMgMl).trim(),
    coilResistanceOhm: blank(variant.coilResistanceOhm) ? null : String(variant.coilResistanceOhm).trim(),
    coilType: blank(variant.coilType) ? "" : String(variant.coilType).trim(),
  };
}
