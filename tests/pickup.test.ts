import assert from "node:assert/strict";
import test from "node:test";

import { cartIsPickup, isPickupOption, pickupInstructions } from "../features/keystone/regulated/pickup";
import { buildManualAdultSignatureDecision } from "../features/regulated-commerce/providers/builtin/carrier-manual-adult-signature";

const option = { data: { pickup: true, instructions: "Counter, 9 to 5" } };

test("only an option flagged pickup is a pickup option", () => {
  assert.equal(isPickupOption(option), true);
  assert.equal(isPickupOption({ data: {} }), false);
  assert.equal(isPickupOption({ data: { pickup: "true" } }), false);
  assert.equal(isPickupOption({ data: null }), false);
  assert.equal(isPickupOption(undefined), false);
  assert.equal(pickupInstructions(option), "Counter, 9 to 5");
});

test("a cart is pickup only when every selected method is pickup", () => {
  assert.equal(cartIsPickup({ shippingMethods: [{ shippingOption: option }] }), true);
  assert.equal(cartIsPickup({ shippingMethods: [{ shippingOption: option }, { shippingOption: { data: {} } }] }), false);
  assert.equal(cartIsPickup({ shippingMethods: [] }), false);
  assert.equal(cartIsPickup(null), false);
});

test("a pickup decision is the counter collecting the adult signature, bound to the option", () => {
  const base = {
    cartFingerprint: "f".repeat(64), shippingOptionId: "opt1", originJurisdictionCode: "US-FL", destinationJurisdictionCode: "US-FL",
    launchJurisdictionCodes: ["US-FL"], lines: [{ variantId: "v", category: "e_liquid", quantity: 1, packageUnits: 1 }],
    packageMarkings: [], signatureMinimumAge: 21,
  };
  const pickup = buildManualAdultSignatureDecision({ ...base, pickup: true })!;
  const delivery = buildManualAdultSignatureDecision(base)!;
  assert.equal(pickup.carrierCode, "store_pickup");
  assert.equal(pickup.rateId, "pickup:opt1");
  assert.equal(pickup.adultSignature, true);
  assert.equal(delivery.carrierCode, "store_arranged");
  assert.notEqual(pickup.evidenceDigest, delivery.evidenceDigest);
  assert.equal(buildManualAdultSignatureDecision({ ...base, pickup: true, launchJurisdictionCodes: ["US-GA"] }), null);
});
