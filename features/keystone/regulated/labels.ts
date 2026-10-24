// Merchant-facing names for regulated enum values, shared by the Keystone field
// options and the platform compliance forms.

export const CLASSIFICATION_CATEGORY_LABELS: Record<string, string> = {
  ends_device: "Device (ENDS)",
  e_liquid: "E-liquid",
  component: "Component (pod, coil, tank)",
  accessory: "Accessory",
  tobacco_derived_nicotine: "Raw nicotine, tobacco-derived",
  synthetic_nicotine: "Raw nicotine, synthetic",
};

export const NICOTINE_SOURCE_LABELS: Record<string, string> = {
  none: "No nicotine",
  tobacco: "Tobacco-derived",
  synthetic: "Synthetic",
  other: "Other",
  unknown: "Unknown",
};

export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  revoked: "Revoked",
};

export const CLASSIFICATION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  approved: "Approved",
  rejected: "Rejected",
  revoked: "Revoked",
};

export const AUTHORIZATION_TYPE_LABELS: Record<string, string> = {
  federal_marketing_order: "FDA marketing order",
  preexisting_status: "Pre-existing product status",
  state_directory: "State directory listing",
  local_directory: "Local directory listing",
};

export const AUTHORIZATION_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  authorized: "Authorized",
  suspended: "Suspended",
  delisted: "Delisted",
  denied: "Denied",
  expired: "Expired",
};

export const PROVIDER_PURPOSE_LABELS: Record<string, string> = {
  identity: "Identity verification",
  payment: "Payment",
  tax: "Tax",
  registry: "Registry",
  carrier: "Adult-signature carrier",
};

export const PROVIDER_APPROVAL_STATUS_LABELS: Record<string, string> = {
  unconfigured: "Not configured",
  review: "In review",
  active: "Active",
  suspended: "Suspended",
  expired: "Expired",
  revoked: "Revoked",
};

export function regulatedLabel(labels: Record<string, string>, value: string | null | undefined) {
  if (!value) return "";
  return labels[value] || value.replaceAll("_", " ").replace(/^\w/, character => character.toUpperCase());
}
