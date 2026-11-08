import test from "node:test";
import assert from "node:assert/strict";
import { selectPaymentApproval } from "../features/keystone/regulated/enforcement";

const approvals = [{ id: "a1", purpose: "payment", paymentProvider: { id: "stripe" }, coveredJurisdictionCodes: ["US-FL"], coveredCategories: ["ends_device"] }];
const base = { code: "US-FL", categories: ["ends_device"] };

test("a card checkout needs the approval for its own provider", () => {
  assert.equal(selectPaymentApproval(approvals, { ...base, paymentProviderId: "stripe", giftCardTender: false })?.id, "a1");
  assert.equal(selectPaymentApproval(approvals, { ...base, paymentProviderId: "other", giftCardTender: false }), undefined);
});

test("a gift-card-only checkout is still evaluated against the merchant's approval, never skipped", () => {
  assert.equal(selectPaymentApproval(approvals, { ...base, paymentProviderId: null, giftCardTender: true })?.id, "a1");
  assert.equal(selectPaymentApproval(approvals, { ...base, code: "US-CA", paymentProviderId: null, giftCardTender: true }), undefined);
  assert.equal(selectPaymentApproval(approvals, { ...base, categories: ["ends_liquid"], paymentProviderId: null, giftCardTender: true }), undefined);
  assert.equal(selectPaymentApproval([], { ...base, paymentProviderId: null, giftCardTender: true }), undefined);
});

test("without a provider and without a gift card there is no approval", () => {
  assert.equal(selectPaymentApproval(approvals, { ...base, paymentProviderId: null, giftCardTender: false }), undefined);
});
