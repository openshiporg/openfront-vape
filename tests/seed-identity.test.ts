import assert from "node:assert/strict";
import test from "node:test";
import seed from "../features/platform/onboarding/lib/seed.json";
import { readStoreBusiness } from "../features/platform/store-settings/lib/store-info";

// New stores open with a coherent business identity and a pay-in-store pickup option,
// never placeholder numbers or example domains.
test("seeded store identity is complete and has no placeholders", () => {
  const business = readStoreBusiness((seed as any).store.metadata);
  assert.ok(business.legalName);
  assert.match(business.email, /@vape\.openship\.org$/);
  assert.match(business.address, /Tampa, FL \d{5}$/);
  assert.deepEqual(business.licenses, ["FL DBPR tobacco retail permit: on file"]);
  const text = JSON.stringify(seed);
  assert.doesNotMatch(text, /00-00-0{6}|0{7}|placeholder record|@example\./i);
});

test("seed includes a store pickup option that names the store address", () => {
  const pickup = (seed as any).shipping_options.find((option: any) => option.data?.pickup === true);
  assert.ok(pickup, "pickup option");
  assert.equal(pickup.amount, 0);
  assert.match(pickup.data.instructions, /1420 N Franklin St, Tampa/);
  assert.match(pickup.data.instructions, /21 or older/);
});
