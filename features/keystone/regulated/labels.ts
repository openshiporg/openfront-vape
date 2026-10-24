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

export const MERCHANT_PROFILE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  review: "In review",
  active: "Active",
  suspended: "Suspended",
  revoked: "Revoked",
};

export const MERCHANT_LICENSE_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  conditioned: "Active with conditions",
  suspended: "Suspended",
  expired: "Expired",
  revoked: "Revoked",
};

export const JURISDICTION_LEVEL_LABELS: Record<string, string> = {
  country: "Country",
  state: "State",
  county: "County",
  municipality: "Municipality",
  postal: "Postal area",
};

export const JURISDICTION_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  active: "Active",
  retired: "Retired",
};

export const RULE_SET_STATUS_LABELS: Record<string, string> = {
  draft: "Draft",
  approved: "Approved",
  active: "Active",
  retired: "Retired",
  emergency_disabled: "Emergency disabled",
};

export const RULE_TYPE_LABELS: Record<string, string> = {
  minimum_age: "Minimum age",
  category_prohibition: "Product type prohibition",
  flavor_prohibition: "Flavor prohibition",
  directory_required: "Directory listing required",
  license_required: "License required",
  quantity_limit: "Quantity limit",
  adult_signature_required: "Adult signature required",
  package_marking: "Package marking",
  marketing_restriction: "Marketing restriction",
};

export function regulatedLabel(labels: Record<string, string>, value: string | null | undefined) {
  if (!value) return "";
  return labels[value] || value.replaceAll("_", " ").replace(/^\w/, character => character.toUpperCase());
}

// Compliance ledger and reports.

export const DECISION_PURPOSE_LABELS: Record<string, string> = {
  catalog_publication: "Catalog publication",
  cart: "Cart",
  shipping: "Shipping",
  payment: "Payment",
  checkout: "Checkout",
  fulfillment: "Fulfillment",
};

export const DECISION_RESULT_LABELS: Record<string, string> = {
  allow: "Allowed",
  deny: "Denied",
  manual_review: "Manual review",
  expired: "Expired",
  revoked: "Revoked",
};

export const AGE_RESULT_LABELS: Record<string, string> = {
  pending: "Pending",
  passed: "Passed",
  failed: "Failed",
  manual_review: "Manual review",
  expired: "Expired",
  revoked: "Revoked",
};

export const ADDRESS_MATCH_LABELS: Record<string, string> = {
  not_checked: "Not checked",
  matched: "Matched",
  mismatched: "Mismatched",
  indeterminate: "Indeterminate",
};

export const TAX_QUOTE_STATUS_LABELS: Record<string, string> = {
  quoted: "Quoted",
  committed: "Committed",
  voided: "Voided",
  reversed: "Reversed",
  failed: "Failed",
  expired: "Expired",
};

export const REPORT_TYPE_LABELS: Record<string, string> = {
  evidence_inventory: "Evidence inventory",
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  generated: "Generated",
  reviewed: "Reviewed",
  submitted: "Submitted",
  accepted: "Accepted",
  rejected: "Rejected",
  corrected: "Corrected",
};

export const COMPLIANCE_EVENT_LABELS: Record<string, string> = {
  AGE_ATTESTED_21: "Customer attested 21 or older",
  "cart.compliance_invalidated": "Cart evidence invalidated",
  "checkout.compliance_committed": "Checkout compliance committed",
  "identity.result_recorded": "Identity result recorded",
  "tax.commit_acknowledged": "Tax commit acknowledged",
  "tax.reversal_acknowledged": "Tax reversal acknowledged",
  "regulated.return_refunded": "Regulated return refunded",
  "merchant.emergency_stop": "Emergency stop",
  "evidence.inventory_exported": "Evidence inventory exported",
  "report.generated": "Report generated",
  "report.submission_recorded": "Report submission recorded",
};

/** Reason codes written by the decision engine, the store release gate and the readiness check. */
export const REASON_CODE_LABELS: Record<string, string> = {
  MERCHANT_NOT_ACTIVE: "Merchant profile not active",
  MERCHANT_KILL_SWITCH_ACTIVE: "Kill switch on",
  PACT_REGISTRATION_NOT_RECORDED: "PACT registration not recorded",
  DESTINATION_JURISDICTION_UNRESOLVED: "Destination jurisdiction unknown",
  DESTINATION_NOT_IN_MERCHANT_LAUNCH_SCOPE: "Destination not a launch jurisdiction",
  GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART: "Region tax rate must be zero for regulated carts",
  ACTIVE_POLICY_REQUIRED: "No active policy",
  CATEGORY_NOT_ENABLED_FOR_MERCHANT: "Product type not enabled for merchant",
  MARKETING_REVIEW_REQUIRED: "Marketing review not approved",
  PRODUCT_CLASSIFICATION_REQUIRED: "No current approved classification",
  FEDERAL_AUTHORIZATION_REQUIRED: "No current federal authorization",
  INVALID_REGULATED_QUANTITY: "Invalid quantity",
  POLICY_REQUIREMENT_NOT_IMPLEMENTED: "Policy rule not supported",
  CATEGORY_PROHIBITED: "Product type prohibited",
  FLAVOR_PROHIBITED: "Flavor prohibited",
  QUANTITY_LIMIT_EXCEEDED: "Quantity limit exceeded",
  DESTINATION_AUTHORIZATION_REQUIRED: "No destination directory listing",
  REQUIRED_PACKAGE_MARKING_MISSING: "Package marking missing",
  MERCHANT_LICENSE_REQUIRED: "Required license missing",
  CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED: "No current age and address verification",
  CURRENT_TAX_EVIDENCE_REQUIRED: "No current tax quote",
  COMMITTED_TAX_EVIDENCE_REQUIRED: "Tax not committed",
  PAYMENT_PROVIDER_APPROVAL_REQUIRED: "No active payment provider approval",
  APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED: "No approved adult-signature carrier",
  STORE_POLICIES_REQUIRED: "Store details and policies missing",
  ACTIVE_MERCHANT_PROFILE_REQUIRED: "No active merchant profile",
  KILL_SWITCH_ENABLED: "Kill switch on",
  LAUNCH_JURISDICTION_REQUIRED: "No launch jurisdiction",
  EXACTLY_ONE_ACTIVE_MERCHANT_PROFILE_REQUIRED: "Merchant profile incomplete",
  ACTIVE_REVIEWED_POLICY_REQUIRED: "No active policy",
  CURRENT_PRODUCT_AND_FEDERAL_AUTHORITY_REQUIRED: "No sellable product evidence",
  IDENTITY_PROVIDER_AUTHORITY_REQUIRED: "No identity provider approval",
  PAYMENT_PROVIDER_AUTHORITY_REQUIRED: "No payment provider approval",
  TAX_PROVIDER_AUTHORITY_REQUIRED: "No tax provider approval",
  CARRIER_PROVIDER_AUTHORITY_REQUIRED: "No adult-signature carrier approval",
  REGISTRY_PROVIDER_AUTHORITY_REQUIRED: "No registry provider approval",
  CART_CHANGED: "Cart changed",
  SHIPPING_METHOD_CHANGED: "Shipping method changed",
  PROVIDER_ACKNOWLEDGED: "Provider acknowledged",
  OPERATOR_GENERATED: "Generated by operator",
  OPERATOR_EXPORT: "Exported by operator",
  TAX_AND_REPORTING_REVERSAL_REVIEW_REQUIRED: "Tax and reporting reversal review required",
  SUBMITTED: "Submitted",
  ACCEPTED: "Accepted",
  REJECTED: "Rejected",
};
