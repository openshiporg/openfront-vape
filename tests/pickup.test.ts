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

test("concurrent requests in the same window build the identical decision", () => {
  const base = {
    cartFingerprint: "f".repeat(64), shippingOptionId: "opt1", originJurisdictionCode: "US-FL", destinationJurisdictionCode: "US-FL",
    launchJurisdictionCodes: ["US-FL"], lines: [{ variantId: "v", category: "e_liquid", quantity: 1, packageUnits: 1 }],
    packageMarkings: [], signatureMinimumAge: 21,
  };
  const a = buildManualAdultSignatureDecision({ ...base, now: new Date("2026-11-02T18:51:01.024Z") })!;
  const b = buildManualAdultSignatureDecision({ ...base, now: new Date("2026-11-02T18:51:03.900Z") })!;
  assert.equal(a.evidenceDigest, b.evidenceDigest);
  assert.ok(new Date(a.expiresAt).getTime() - new Date("2026-11-02T18:51:03.900Z").getTime() > 50 * 60_000);
});

import { readFileSync } from "node:fs";
test("the cart fingerprint does not depend on variant updatedAt (stock reservation touches it)", () => {
  const source = readFileSync(new URL("../features/keystone/regulated/cart-fingerprint.ts", import.meta.url), "utf8");
  const variant = source.slice(source.indexOf("lineItems(orderBy"), source.indexOf("discounts("));
  assert.ok(!/productVariant \{ id[^}]*updatedAt/.test(variant.replace(/\s+/g, " ")));
  assert.ok(/regulatedClassification \{ id updatedAt \}/.test(variant));
});
