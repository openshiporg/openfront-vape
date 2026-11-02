// Customer-facing lines for regulated-commerce reason codes.
// Codes come from features/regulated-commerce/core/decision-engine.ts and
// release-gate.ts. Pure module: server actions and client components share it.

export type CheckoutComplianceState = "allowed" | "review" | "denied" | "not_applicable" | "unavailable"

export type CheckoutCompliance = {
  state: CheckoutComplianceState
  purpose: string
  reasonCodes: string[]
  lines: string[]
  evaluatedAt?: string | null
}

const PRODUCT_NOT_CLEARED = "One or more items in your bag aren't cleared for sale yet."
const TAX_NOT_CONFIRMED = "Tax for this order must be confirmed."
const SALES_PAUSED = "Sales paused by the store."

export const COMPLIANCE_REASON_LINES: Record<string, string> = {
  // Store release gate
  ACTIVE_MERCHANT_PROFILE_REQUIRED: "Sales paused: store setup isn't complete.",
  KILL_SWITCH_ENABLED: SALES_PAUSED,
  LAUNCH_JURISDICTION_REQUIRED: "Sales paused: no sales region is open yet.",
  STORE_POLICIES_REQUIRED: "Sales paused: store policies aren't published yet.",
  // Merchant authority
  MERCHANT_NOT_ACTIVE: "This store isn't cleared to sell right now.",
  MERCHANT_KILL_SWITCH_ACTIVE: SALES_PAUSED,
  PACT_REGISTRATION_NOT_RECORDED: "This store isn't registered to ship vape products yet.",
  MERCHANT_LICENSE_REQUIRED: "This store's license for your state isn't on file.",
  ACTIVE_POLICY_REQUIRED: "Sales rules for your state aren't set up yet.",
  POLICY_REQUIREMENT_NOT_IMPLEMENTED: "Your state has a rule this store can't check yet.",
  GENERIC_TAX_RATE_MUST_BE_ZERO_FOR_REGULATED_CART: "Tax for this order can't be calculated yet.",
  // Destination
  DESTINATION_JURISDICTION_UNRESOLVED: "Your shipping address doesn't match a US state.",
  DESTINATION_NOT_IN_MERCHANT_LAUNCH_SCOPE: "We don't ship to your state yet.",
  DESTINATION_AUTHORIZATION_REQUIRED: "We can't ship this to your state.",
  // Products
  CATEGORY_NOT_ENABLED_FOR_MERCHANT: "This store can't sell one or more product types in your bag.",
  CATEGORY_PROHIBITED: "Your state doesn't allow one or more product types in your bag.",
  FLAVOR_PROHIBITED: "Your state doesn't allow one or more flavors in your bag.",
  QUANTITY_LIMIT_EXCEEDED: "Your bag is over your state's quantity limit.",
  INVALID_REGULATED_QUANTITY: "One or more quantities in your bag are invalid.",
  MARKETING_REVIEW_REQUIRED: PRODUCT_NOT_CLEARED,
  PRODUCT_CLASSIFICATION_REQUIRED: PRODUCT_NOT_CLEARED,
  FEDERAL_AUTHORIZATION_REQUIRED: "One or more items in your bag lack FDA authorization.",
  // Checkout evidence
  CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED: "ID and address must be verified.",
  CURRENT_TAX_EVIDENCE_REQUIRED: TAX_NOT_CONFIRMED,
  COMMITTED_TAX_EVIDENCE_REQUIRED: TAX_NOT_CONFIRMED,
  PAYMENT_PROVIDER_APPROVAL_REQUIRED: "This payment method can't be used for this order.",
  APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED: "No approved adult-signature delivery is available for this address.",
  REQUIRED_PACKAGE_MARKING_MISSING: "Packaging required by your state isn't confirmed.",
}

export const UNKNOWN_COMPLIANCE_LINE = "This order can't be completed."

export function complianceReasonLines(codes: readonly string[] | null | undefined): string[] {
  const lines = (codes ?? []).map((code) => COMPLIANCE_REASON_LINES[code] || UNKNOWN_COMPLIANCE_LINE)
  return [...new Set(lines)]
}

const DENIAL_PREFIX = /Regulated commerce denied:\s*([A-Z0-9_,\s]*)/

// Known server messages that otherwise reach the customer verbatim.
const MESSAGE_LINES: Array<[RegExp, string]> = [
  [/Checkout isn't available for this store yet/i, "Checkout isn't available right now."],
  [/Manual tender cannot complete storefront checkout/i, "This payment method can't complete checkout."],
  [/Payment session amount no longer matches cart total|Provider payment amount does not match cart total/i, "Your bag changed. Review payment again."],
  [/Payment session not found/i, "Payment session not found. Please refresh and try again."],
  [/Payment provider not found, installed, and configured/i, "This payment method isn't available."],
  [/Unsupported storefront compliance purpose/i, UNKNOWN_COMPLIANCE_LINE],
]

// Turns a raw server message into customer lines; null when it isn't a known state.
export function complianceLinesFromMessage(message: string | null | undefined): string[] | null {
  if (!message) return null
  const denial = DENIAL_PREFIX.exec(message)
  if (denial) {
    const codes = denial[1].split(",").map((code) => code.trim()).filter(Boolean)
    return codes.length ? complianceReasonLines(codes) : [UNKNOWN_COMPLIANCE_LINE]
  }
  if (message.includes("Regulated commerce denied")) return [UNKNOWN_COMPLIANCE_LINE]
  for (const [pattern, line] of MESSAGE_LINES) {
    if (pattern.test(message)) return [line]
  }
  return null
}

// Client-side fallback for errors thrown by server actions.
export function checkoutErrorText(error: unknown, fallback = "Something went wrong. Please try again."): string {
  const message = error instanceof Error ? error.message : typeof error === "string" ? error : ""
  const lines = complianceLinesFromMessage(message)
  if (lines) return lines.join("\n")
  return message || fallback
}
