// Fable audit fixes (2026-11-17). No DB or network: the adapter runs against a stubbed fetch, the rest is read from source.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { refundPaymentFunction } from "../features/integrations/payment/authorizenet";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
  delete process.env.AUTHORIZENET_API_LOGIN_ID;
  delete process.env.AUTHORIZENET_TRANSACTION_KEY;
});
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("a partial refund before settlement is refused, never a whole void (#2)", async () => {
  process.env.AUTHORIZENET_API_LOGIN_ID = "login";
  process.env.AUTHORIZENET_TRANSACTION_KEY = "secret";
  const seen: string[] = [];
  globalThis.fetch = (async (_u: any, init: any) => {
    const body = JSON.parse(init.body);
    if (body.getTransactionDetailsRequest) return new Response(JSON.stringify({ messages: { resultCode: "Ok" }, transaction: { transactionStatus: "capturedPendingSettlement", authAmount: "80.00" } }));
    seen.push(body.createTransactionRequest.transactionRequest.transactionType);
    return new Response(JSON.stringify({ messages: { resultCode: "Ok" }, transactionResponse: { responseCode: "1", transId: "1" } }));
  }) as typeof fetch;
  const partial = await refundPaymentFunction({ paymentId: "1", amount: 1000, currency: "USD" });
  assert.equal(partial.status, "refused");
  assert.deepEqual(seen, []);
  const full = await refundPaymentFunction({ paymentId: "1", amount: 8000, currency: "USD" });
  assert.equal(full.status, "refunded");
  assert.deepEqual(seen, ["voidTransaction"]);
  // The refund paths give the reserved amount back on a refusal.
  for (const file of ["features/keystone/mutations/refundOrderPayment.ts", "features/keystone/mutations/processReturnRefund.ts"]) {
    assert.match(read(file), /status === "refused"[\s\S]*?amountRefunded: \{ decrement:/, file);
  }
});

test("a business-account order refuses gift cards before anything is held (#1)", () => {
  const source = read("features/keystone/mutations/completeActiveCart.ts");
  const guard = source.indexOf("if (giftCardsApplied && !coveredByGiftCards && !paymentSessionId)");
  assert.ok(guard > 0);
  assert.ok(guard < source.indexOf("await holdGiftCards("));
  assert.match(read("features/storefront/modules/checkout/templates/checkout-form/index.tsx"), /!\(\(cart as any\)\.giftCards\?\.length\)/);
});

test("a pay-at-pickup payment is refunded at the counter without a processor (#3)", () => {
  const source = read("features/keystone/mutations/refundOrderPayment.ts");
  assert.match(source, /const counterTender = payment\.metadata\?\.payAtPickup === true/);
  assert.match(source, /providerResult = counterTender\s*\? \{ status: "refunded", amount/);
});

test("an earlier Authorize.net hold is voided when a new one replaces it (#4)", () => {
  const source = read("features/keystone/mutations/authorizeCardPaymentSession.ts");
  assert.match(source, /const previous = cart\.metadata\?\.authorizeNetHold/);
  assert.match(source, /releaseHold\(sudo, session\.paymentProvider, previous\)/);
  assert.match(read("features/keystone/mutations/completeActiveCart.ts"), /reported === 'authorized' && String\(claimed\.provider\.code/);
});

test("Authorize.net webhooks find the payment by transaction id (#5)", () => {
  assert.match(read("features/keystone/mutations/handlePaymentProviderWebhook.ts"), /path: \["paymentIntentId"\], equals: String\(resource\.id\)/);
});

test("Mark paid only captures a payment that is still pending (#6)", () => {
  assert.match(read("features/keystone/mutations/markPickupPaid.ts"), /updateMany\(\{ where: \{ id: payment\.id, status: "pending" \}/);
});
