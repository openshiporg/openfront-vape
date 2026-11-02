import assert from "node:assert/strict";
import test from "node:test";

import { planBuiltInApprovals, setupBlockers, BUILTIN_METHODS } from "../features/keystone/regulated/builtin-provider-setup";

const profile = { id: "p1", enabledCategories: ["e_liquid", "ends_device"], launchJurisdictionCodes: ["US-FL"] };
const stripe = { id: "pp1", code: "pp_authorizenet_authorizenet", name: "Authorize.net" };
const now = new Date("2026-11-02T12:00:00Z");

test("setup refuses until the profile has product types and a launch jurisdiction", () => {
  assert.equal(setupBlockers({ ...profile, enabledCategories: [] }).length, 1);
  assert.equal(setupBlockers({ ...profile, launchJurisdictionCodes: [] }).length, 1);
  assert.deepEqual(planBuiltInApprovals({ profile: { ...profile, enabledCategories: [] }, paymentProviders: [stripe], shippingProviderId: "s1", existing: [] }), []);
});

test("plans identity, tax, carrier, registry and payment scoped to the profile", () => {
  const plan = planBuiltInApprovals({ profile, paymentProviders: [stripe], shippingProviderId: "s1", existing: [], now });
  assert.deepEqual(plan.map(a => a.purpose).sort(), ["carrier", "identity", "payment", "registry", "tax"]);
  for (const approval of plan) {
    assert.deepEqual(approval.coveredCategories, ["e_liquid", "ends_device"]);
    assert.deepEqual(approval.coveredJurisdictionCodes, ["US-FL"]);
    assert.match(approval.evidenceDigest, /^[a-f0-9]{64}$/);
    assert.ok(approval.capabilities.length && new Date(approval.expiresAt) > new Date(approval.effectiveAt));
  }
  assert.equal(plan.find(a => a.purpose === "carrier")!.shippingProviderId, "s1");
  assert.equal(plan.find(a => a.purpose === "payment")!.paymentProviderId, "pp1");
  assert.equal(plan.find(a => a.purpose === "identity")!.providerCode, BUILTIN_METHODS.identity.providerCode);
});

test("running it again adds nothing; a new payment provider adds only that", () => {
  const first = planBuiltInApprovals({ profile, paymentProviders: [stripe], shippingProviderId: "s1", existing: [], now });
  const existing = first.map(a => ({ purpose: a.purpose, providerCode: a.providerCode, paymentProviderId: a.paymentProviderId }));
  assert.equal(planBuiltInApprovals({ profile, paymentProviders: [stripe], shippingProviderId: "s1", existing, now }).length, 0);
  const more = planBuiltInApprovals({ profile, paymentProviders: [stripe, { id: "pp2", code: "pp_stripe_stripe", name: "Stripe" }], shippingProviderId: "s1", existing, now });
  assert.deepEqual(more.map(a => a.providerCode), ["pp_stripe_stripe"]);
});

test("the manual provider is approved for pay at pickup only", () => {
  const manual = { id: "pp0", code: "pp_system_default", name: "Reserve online, pay in store" };
  const plan = planBuiltInApprovals({ profile, paymentProviders: [manual], shippingProviderId: "s1", existing: [], now });
  const payment = plan.find(a => a.purpose === "payment")!;
  assert.deepEqual(payment.capabilities, ["pay_at_pickup"]);
  assert.equal(payment.paymentProviderId, "pp0");
});

import { relationLinkedAfter } from "../features/keystone/regulated/authority-revision";

test("a relation stays linked when an update omits it (Keystone keeps the link on <field>Id)", () => {
  assert.equal(relationLinkedAfter({}, { originJurisdictionId: "j1" }, "originJurisdiction"), true);
  assert.equal(relationLinkedAfter({}, {}, "originJurisdiction"), false);
  assert.equal(relationLinkedAfter({ originJurisdiction: { disconnect: true } }, { originJurisdictionId: "j1" }, "originJurisdiction"), false);
  assert.equal(relationLinkedAfter({ originJurisdiction: { connect: { id: "j2" } } }, {}, "originJurisdiction"), true);
});
