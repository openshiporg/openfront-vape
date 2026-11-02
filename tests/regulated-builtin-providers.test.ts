import test from "node:test";
import assert from "node:assert/strict";

import { evaluateRegulatedCommerce } from "../features/regulated-commerce/core/decision-engine";
import { evaluateDobAttestation, parseDateOfBirth, InvalidDateOfBirthError } from "../features/regulated-commerce/providers/builtin/identity-dob-attest";
import { computeStoreRateTax, createStoreRateTaxAdapter } from "../features/regulated-commerce/providers/builtin/tax-store-rate";
import { buildManualAdultSignatureDecision, signatureAgeFromService } from "../features/regulated-commerce/providers/builtin/carrier-manual-adult-signature";

const now = new Date("2026-11-02T12:00:00Z");
const base = { cartFingerprint: "a".repeat(64), subjectDigest: "b".repeat(64), thresholdAge: 21, now };

test("DOB attestation passes at 21 on the birthday and fails the day before", () => {
  const ok = evaluateDobAttestation({ ...base, dateOfBirth: "2005-11-02", idNameMatchesShipping: true });
  assert.equal(ok.result, "passed"); assert.equal(ok.verifiedAge, 21); assert.equal(ok.addressMatch, "matched");
  assert.match(ok.evidenceDigest, /^[a-f0-9]{64}$/);
  const young = evaluateDobAttestation({ ...base, dateOfBirth: "2005-11-03", idNameMatchesShipping: true });
  assert.equal(young.result, "failed"); assert.equal(young.reasonCode, "UNDER_MINIMUM_AGE");
});

test("DOB attestation fails without the name confirmation and never goes below 21", () => {
  const r = evaluateDobAttestation({ ...base, dateOfBirth: "1990-01-01", idNameMatchesShipping: false });
  assert.equal(r.result, "failed"); assert.equal(r.addressMatch, "mismatched");
  const low = evaluateDobAttestation({ ...base, thresholdAge: 18, dateOfBirth: "2006-01-01", idNameMatchesShipping: true });
  assert.equal(low.result, "failed");
});

test("DOB attestation evidence carries no date of birth", () => {
  const r = evaluateDobAttestation({ ...base, dateOfBirth: "1990-05-06", idNameMatchesShipping: true });
  assert.ok(!JSON.stringify(r).includes("1990-05-06"));
});

test("invalid dates are rejected", () => {
  for (const bad of ["", "1990-02-30", "2999-01-01", "1800-01-01", "01/02/1990", null]) {
    assert.throws(() => parseDateOfBirth(bad, now), InvalidDateOfBirthError);
  }
});

const rates = [
  { id: "r1", kind: "sales" as const, rate: 0.06, updatedAt: "2026-01-01T00:00:00Z" },
  { id: "r2", kind: "excise" as const, rate: 0.1, updatedAt: "2026-01-01T00:00:00Z" },
];

test("store rates split by kind and round to minor units", () => {
  const t = computeStoreRateTax(rates, 3333);
  assert.equal(t.salesTaxAmount, 200); assert.equal(t.exciseTaxAmount, 333); assert.equal(t.localFeeAmount, 0);
  assert.throws(() => computeStoreRateTax([{ ...rates[0], rate: 1.5 }], 100));
  assert.throws(() => computeStoreRateTax(rates, -1));
});

test("tax adapter fails closed with no rates, then quotes, commits and reverses exact totals", async () => {
  const quotes = new Map<string, any>();
  let list: typeof rates = [];
  const adapter = createStoreRateTaxAdapter({
    ratesFor: async () => list,
    taxable: async () => ({ amount: 10000, currencyCode: "USD" }),
    findQuote: async ref => quotes.get(ref) ?? null,
  }, () => now);
  await assert.rejects(adapter.quote({ cartId: "c", jurisdictionCode: "US-FL", lines: [] }), /No store tax rates/);
  list = rates;
  const q = await adapter.quote({ cartId: "c", jurisdictionCode: "US-FL", lines: [] });
  assert.equal(q.salesTaxAmount + q.exciseTaxAmount, 1600);
  assert.ok(new Date(q.expiresAt) > new Date(q.issuedAt));
  quotes.set(q.providerReference, { status: "quoted", salesTaxAmount: q.salesTaxAmount, exciseTaxAmount: q.exciseTaxAmount, localFeeAmount: 0 });
  const c = await adapter.commit({ quoteReference: q.providerReference, idempotencyKey: "k" });
  assert.equal(c.totalAmount, 1600);
  quotes.set(c.reference, { status: "committed", salesTaxAmount: q.salesTaxAmount, exciseTaxAmount: q.exciseTaxAmount, localFeeAmount: 0 });
  const r = await adapter.reverse({ commitReference: c.reference, idempotencyKey: "k2" });
  assert.equal(r.totalAmount, 1600);
  await assert.rejects(adapter.commit({ quoteReference: "missing", idempotencyKey: "k" }));
});

const carrierInput = {
  cartFingerprint: "a".repeat(64), shippingOptionId: "so1", originJurisdictionCode: "US-FL", destinationJurisdictionCode: "US-FL",
  launchJurisdictionCodes: ["US-FL"], lines: [{ variantId: "v1", category: "e_liquid", quantity: 2, packageUnits: 1 }],
  packageMarkings: ["PACT_REQUIRED_MARKING"], signatureMinimumAge: 21, now,
};

test("carrier decision requires launch scope and a signature age the service covers", () => {
  const d = buildManualAdultSignatureDecision(carrierInput)!;
  assert.equal(d.result, "allow"); assert.equal(d.adultSignature, true);
  assert.deepEqual(d.packageMarkings, ["PACT_REQUIRED_MARKING"]);
  assert.equal(signatureAgeFromService(d.serviceCode), 21);
  assert.match(d.packageDigest, /^[a-f0-9]{64}$/); assert.match(d.evidenceDigest, /^[a-f0-9]{64}$/);
  assert.equal(buildManualAdultSignatureDecision({ ...carrierInput, destinationJurisdictionCode: "US-NY" }), null);
  assert.equal(buildManualAdultSignatureDecision({ ...carrierInput, signatureMinimumAge: 25 }), null);
  assert.equal(buildManualAdultSignatureDecision({ ...carrierInput, originJurisdictionCode: null }), null);
});

test("engine checks adult_signature_required against the carrier decision", () => {
  const ok = { status: "allow", result: "allow", adultSignature: true, signatureMinimumAge: 21, effectiveAt: "2026-11-02T11:00:00Z", expiresAt: "2026-11-02T13:00:00Z" };
  const input: any = {
    purpose: "shipping", now, merchant: null, jurisdiction: null, genericTaxRate: 0, licenses: [], products: [],
    ruleSet: { version: "1", policyHash: "h", status: "active", approvedAt: "2026-01-01", effectiveAt: "2026-01-01", expiresAt: "2027-01-01",
      rules: [{ id: "sig", type: "adult_signature_required", minimumAge: 21 }] },
    carrierEvidence: ok,
  };
  const reasons = (i: any) => evaluateRegulatedCommerce(i).reasonCodes;
  assert.ok(!reasons(input).includes("POLICY_REQUIREMENT_NOT_IMPLEMENTED"));
  assert.ok(!reasons(input).includes("APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED"));
  assert.ok(reasons({ ...input, carrierEvidence: { ...ok, signatureMinimumAge: 18 } }).includes("APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED"));
  assert.ok(reasons({ ...input, carrierEvidence: null }).includes("APPROVED_ADULT_SIGNATURE_CARRIER_REQUIRED"));
});
