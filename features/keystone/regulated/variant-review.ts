export const REGULATED_VARIANT_REVIEW_FIELDS = [
  "title",
  "sku",
  "barcode",
  "ean",
  "upc",
  "hsCode",
  "originCountry",
  "midCode",
  "material",
  "metadata",
  "product",
  "regulatedClassification",
  "primaryImage",
  "productOptionValues",
] as const;

export function hasRegulatedVariantReviewChange(inputData: unknown): boolean {
  if (!inputData || typeof inputData !== "object" || Array.isArray(inputData)) return false;
  const fields = inputData as Record<string, unknown>;
  return REGULATED_VARIANT_REVIEW_FIELDS.some(field => Object.prototype.hasOwnProperty.call(fields, field));
}

export function shouldBlockVariantEvidenceMutation(
  operation: string,
  inputData: unknown,
  productStatus: string | null | undefined,
  hasCurrentExemption: boolean,
): boolean {
  const changesReviewedEvidence = operation !== "update" || hasRegulatedVariantReviewChange(inputData);
  return changesReviewedEvidence && (productStatus === "published" || hasCurrentExemption);
}
