"use server";

import { gql } from "graphql-request";
import { updateTag as revalidateTag } from "next/cache";
import { openfrontClient } from "../config";
import { getAuthHeaders, getCartId } from "./cookies";
import { accountActionError } from "../util/openfront-error";
import {
  complianceLinesFromMessage,
  complianceReasonLines,
  UNKNOWN_COMPLIANCE_LINE,
  type CheckoutCompliance,
} from "@/features/storefront/modules/checkout/lib/compliance-reasons";

export type CheckoutCompliancePurpose = "cart" | "shipping" | "payment" | "checkout";

const EVALUATE_COMPLIANCE = gql`
  query EvaluateActiveCartCompliance($cartId: ID!, $purpose: String, $paymentProviderId: ID) {
    evaluateActiveCartCompliance(cartId: $cartId, purpose: $purpose, paymentProviderId: $paymentProviderId)
  }
`;

const STATES: Record<string, CheckoutCompliance["state"]> = {
  allow: "allowed",
  manual_review: "review",
  deny: "denied",
  not_applicable: "not_applicable",
};

// Read-only evaluation of the active cart (no decision is persisted).
export async function getCheckoutCompliance(
  purpose: CheckoutCompliancePurpose,
  paymentProviderId?: string | null
): Promise<CheckoutCompliance> {
  const cartId = await getCartId();
  if (!cartId) {
    return { state: "unavailable", purpose, reasonCodes: [], lines: ["Your bag is empty."] };
  }
  try {
    const { evaluateActiveCartCompliance: result } = await openfrontClient.request<{ evaluateActiveCartCompliance: any }>(
      EVALUATE_COMPLIANCE,
      { cartId, purpose, paymentProviderId: paymentProviderId || null },
      await getAuthHeaders()
    );
    const reasonCodes: string[] = Array.isArray(result?.reasonCodes)
      ? result.reasonCodes.filter((code: unknown): code is string => typeof code === "string")
      : [];
    const state = STATES[result?.result] ?? "denied";
    return {
      state,
      purpose,
      reasonCodes,
      lines: state === "allowed" || state === "not_applicable"
        ? []
        : reasonCodes.length ? complianceReasonLines(reasonCodes) : [UNKNOWN_COMPLIANCE_LINE],
      evaluatedAt: typeof result?.evaluatedAt === "string" ? result.evaluatedAt : null,
    };
  } catch (error) {
    const message = accountActionError(error, "");
    return {
      state: "unavailable",
      purpose,
      reasonCodes: [],
      lines: complianceLinesFromMessage(message) ?? ["We couldn't check this order. Please try again."],
    };
  }
}

// Server-side mapping of checkout errors: never returns the GraphQL request envelope.
export async function checkoutErrorMessage(error: unknown): Promise<string> {
  const message = accountActionError(error);
  return (complianceLinesFromMessage(message) ?? [message]).join("\n");
}

const INITIATE_PAYMENT_SESSION = gql`
  mutation InitiatePaymentSession($cartId: ID!, $paymentProviderId: String!) {
    initiatePaymentSession(cartId: $cartId, paymentProviderId: $paymentProviderId) {
      id
    }
  }
`;

// Payment step: starts the provider session and returns mapped errors instead of throwing,
// so production builds show the reason rather than a masked server-action error.
export async function startCheckoutPayment(
  providerCode: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cartId = await getCartId();
  if (!cartId) return { ok: false, error: "Your bag is empty." };
  if (!providerCode) return { ok: false, error: "Select a payment method." };
  try {
    await openfrontClient.request(
      INITIATE_PAYMENT_SESSION,
      { cartId, paymentProviderId: providerCode },
      await getAuthHeaders()
    );
    revalidateTag("cart");
    return { ok: true };
  } catch (error) {
    return { ok: false, error: await checkoutErrorMessage(error) };
  }
}

// Age step: required when the bag is regulated; done once age, tax and delivery evidence are current.
export type AgeCheckStatus = { required: boolean; done: boolean };

export async function getAgeCheckStatus(): Promise<AgeCheckStatus> {
  const shipping = await getCheckoutCompliance("shipping");
  if (shipping.state === "not_applicable") return { required: false, done: true };
  const checkout = await getCheckoutCompliance("checkout");
  const missing = new Set(["CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED", "COMMITTED_TAX_EVIDENCE_REQUIRED", "APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED"]);
  return { required: true, done: checkout.state !== "unavailable" && !checkout.reasonCodes.some((code) => missing.has(code)) };
}

const SUBMIT_AGE_CHECK = gql`
  mutation SubmitActiveCartAgeCheck($cartId: ID!, $dateOfBirth: String!, $idNameMatchesShipping: Boolean!) {
    submitActiveCartAgeCheck(cartId: $cartId, dateOfBirth: $dateOfBirth, idNameMatchesShipping: $idNameMatchesShipping)
  }
`;

export async function submitAgeCheck(
  dateOfBirth: string,
  idNameMatchesShipping: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const cartId = await getCartId();
  if (!cartId) return { ok: false, error: "Your bag is empty." };
  try {
    await openfrontClient.request(SUBMIT_AGE_CHECK, { cartId, dateOfBirth, idNameMatchesShipping }, await getAuthHeaders());
    revalidateTag("cart");
    return { ok: true };
  } catch (error) {
    const message = (await checkoutErrorMessage(error)).replace(/^AGE_CHECK_FAILED:\s*/, "");
    return { ok: false, error: message };
  }
}
