import assert from "node:assert/strict";
import test from "node:test";

import {
  livePolicies, missingPolicies, missingStoreInfo, policiesHaveUnpublishedChanges,
  publishPolicies, validateStoreInfo, readStorePolicies,
} from "../features/platform/store-settings/lib/store-info";

const text = "x".repeat(60);
const drafted = {
  business: { legalName: "A Shop LLC", email: "", phone: "", address: "", licenses: ["L-1"] },
  policies: { shipping: text, returns: text, ageVerification: text, privacy: text, terms: text },
};

test("a fresh store with no data is blocked on everything", () => {
  const missing = missingStoreInfo(null);
  assert.ok(missing.includes("Legal name") && missing.includes("Licence numbers"));
  assert.equal(missing.length, 7);
});

test("drafted policies do not count until published", () => {
  assert.equal(missingStoreInfo(drafted).length, 5);
  assert.equal(livePolicies(drafted).shipping, "");
  assert.equal(policiesHaveUnpublishedChanges(drafted), true);
});

test("publishing copies the draft live and clears the policy blockers", () => {
  const live = publishPolicies(drafted, new Date("2026-11-02T00:00:00Z"));
  assert.deepEqual(missingStoreInfo(live), []);
  assert.equal(policiesHaveUnpublishedChanges(live), false);
  const edited = { ...live, policies: { ...readStorePolicies(live), returns: "y".repeat(50) } };
  assert.equal(policiesHaveUnpublishedChanges(edited), true);
  assert.equal(livePolicies(edited).returns, text);
});

test("blank or short policies cannot be published; validation names the field", () => {
  assert.equal(missingPolicies({ policies: { shipping: "short" } }).length, 5);
  const errors = validateStoreInfo(drafted.business, { ...drafted.policies, terms: "too short" });
  assert.ok(errors.some(e => e.startsWith("Terms of use")));
  assert.ok(validateStoreInfo({ ...drafted.business, email: "nope" }, drafted.policies).length === 1);
});
