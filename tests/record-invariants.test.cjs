// Round-2 record invariants: list hooks that give readable refusals before the DB CHECKs fire.
require('tsx/cjs');
const test = require('node:test');
const assert = require('node:assert/strict');

const hook = (list) => list.hooks.validateInput;
function run(validate, resolvedData, item) {
  const errors = [];
  validate({ operation: item ? 'update' : 'create', resolvedData, item, addValidationError: (m) => errors.push(m) });
  return errors;
}

test('percentage discount rules cannot exceed 100 percent; fixed amounts may', () => {
  const { DiscountRule } = require('../features/keystone/models/DiscountRule.ts');
  assert.deepEqual(run(hook(DiscountRule), { type: 'percentage', value: 150 }), ['A percentage discount cannot be more than 100 percent.']);
  assert.deepEqual(run(hook(DiscountRule), { value: 150 }, { type: 'percentage', value: 10 }).length, 1);
  assert.deepEqual(run(hook(DiscountRule), { type: 'fixed', value: 150 }), []);
});

test('discount windows run forwards and the limit cannot drop below uses already taken', () => {
  const { Discount } = require('../features/keystone/models/Discount.ts');
  const v = hook(Discount);
  assert.equal(run(v, { startsAt: new Date('2027-01-02'), endsAt: new Date('2027-01-01') }).length, 1);
  assert.equal(run(v, { endsAt: null }, { startsAt: new Date('2027-01-02'), endsAt: new Date('2027-01-01') }).length, 0);
  assert.match(run(v, { usageLimit: 2 }, { usageCount: 5, startsAt: new Date('2026-01-01') })[0], /already been used 5 times/);
  assert.equal(run(v, { usageLimit: 5 }, { usageCount: 5, startsAt: new Date('2026-01-01') }).length, 0);
});

test('gift card balance stays within value; price tiers keep max >= min', () => {
  const { GiftCard } = require('../features/keystone/models/GiftCard.ts');
  const { MoneyAmount } = require('../features/keystone/models/MoneyAmount.ts');
  assert.equal(run(hook(GiftCard), { value: 1000, balance: 1500 }).length, 1);
  assert.equal(run(hook(GiftCard), { balance: 400 }, { value: 1000, balance: 1000 }).length, 0);
  assert.equal(run(hook(MoneyAmount), { maxQuantity: 2 }, { minQuantity: 5 }).length, 1);
  assert.equal(run(hook(MoneyAmount), { minQuantity: 2, maxQuantity: 2 }).length, 0);
});

test('popular region templates store tax as a fraction, the unit carts multiply by', () => {
  const { POPULAR_REGIONS } = require('../features/platform/regions/constants/popular-regions.ts');
  for (const region of POPULAR_REGIONS) {
    assert.ok(region.taxRate >= 0 && region.taxRate <= 1, `${region.name} taxRate ${region.taxRate} is a fraction`);
  }
});

test('order numbers come from the sequence', async () => {
  const { nextOrderDisplayId } = require('../features/keystone/checkout/order-commit.ts');
  assert.equal(await nextOrderDisplayId({ $queryRaw: async () => [{ displayId: 1793953716 }] }), 1793953716);
  await assert.rejects(nextOrderDisplayId({ $queryRaw: async () => [] }), /could not be assigned/);
});
