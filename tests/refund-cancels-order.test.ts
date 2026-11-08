import test from "node:test";
import assert from "node:assert/strict";
import { shouldCancelAfterRefund } from "../features/keystone/mutations/refundOrderPayment";

const pay = (amount: number, amountRefunded: number, status = "captured") => ({ status, amount, amountRefunded });

test("a fully refunded, unshipped order is canceled (split tender included)", () => {
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [pay(2179, 2179), pay(2000, 2000)], fulfillments: [] }), true);
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [pay(1799, 1799)], fulfillments: [] }), true);
});

test("a partial refund or one unrefunded tender keeps the order open", () => {
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [pay(2179, 2179), pay(2000, 500)], fulfillments: [] }), false);
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [pay(1799, 0)], fulfillments: [] }), false);
});

test("an order with active fulfilment, or already closed, is left alone", () => {
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [pay(1799, 1799)], fulfillments: [{}] }), false);
  assert.equal(shouldCancelAfterRefund({ status: "canceled", payments: [pay(1799, 1799)], fulfillments: [] }), false);
  assert.equal(shouldCancelAfterRefund({ status: "pending", payments: [], fulfillments: [] }), false);
});
