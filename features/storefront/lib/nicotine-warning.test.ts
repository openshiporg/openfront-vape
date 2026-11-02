import { test } from "node:test";
import assert from "node:assert/strict";
import { NICOTINE_WARNING, nicotineWarningText } from "./nicotine-warning";

test("the warning is the exact 21 CFR 1143.3(a)(1) statement", () => {
  assert.equal(NICOTINE_WARNING, "WARNING: This product contains nicotine. Nicotine is an addictive chemical.");
});

test("on by default: a store with the setting on shows it", () => {
  assert.equal(nicotineWarningText({ nicotineWarningRequired: true }), NICOTINE_WARNING);
});

test("fails closed when the store or the setting is missing", () => {
  assert.equal(nicotineWarningText(null), NICOTINE_WARNING);
  assert.equal(nicotineWarningText(undefined), NICOTINE_WARNING);
  assert.equal(nicotineWarningText({}), NICOTINE_WARNING);
  assert.equal(nicotineWarningText({ nicotineWarningRequired: null }), NICOTINE_WARNING);
});

test("only an explicit compliance switch-off hides it", () => {
  assert.equal(nicotineWarningText({ nicotineWarningRequired: false }), null);
});
