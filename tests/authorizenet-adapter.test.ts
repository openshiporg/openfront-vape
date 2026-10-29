import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { afterEach, test } from "node:test";
import { createPaymentFunction, getPaymentStatusFunction, handleWebhookFunction } from "../features/integrations/payment/authorizenet";

afterEach(() => { delete process.env.AUTHORIZENET_API_LOGIN_ID; delete process.env.AUTHORIZENET_TRANSACTION_KEY; delete process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY; delete process.env.AUTHORIZENET_SIGNATURE_KEY; });
test("Accept.js handshake does not create a remote transaction", async () => {
  process.env.AUTHORIZENET_API_LOGIN_ID = "login"; process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY = "public";
  const oldFetch = globalThis.fetch; let calls = 0; globalThis.fetch = (async () => { calls++; throw new Error("unexpected"); }) as typeof fetch;
  try { assert.deepEqual(await createPaymentFunction({ amount: 1250, currency: "USD" }), { status: "requires_payment_method", amount: 1250, currency: "USD", acceptJs: { apiLoginId: "login", clientKey: "public", env: "sandbox" } }); assert.equal(calls, 0); } finally { globalThis.fetch = oldFetch; }
});
test("BOM parsing, status mapping and webhook HMAC validation", async () => {
  process.env.AUTHORIZENET_API_LOGIN_ID = "login"; process.env.AUTHORIZENET_TRANSACTION_KEY = "secret";
  const oldFetch = globalThis.fetch; globalThis.fetch = (async (_url: any, init: any) => { const body = JSON.parse(init.body); assert.ok(body.getTransactionDetailsRequest); return new Response('\uFEFF{"messages":{"resultCode":"Ok"},"transaction":{"transactionStatus":"capturedPendingSettlement","settleAmount":"12.50","currencyCode":"USD"}}'); }) as typeof fetch;
  try { assert.deepEqual(await getPaymentStatusFunction({ paymentId: "123" }), { status: "succeeded", amount: 1250, currency: "USD", data: { transactionStatus: "capturedPendingSettlement", settleAmount: "12.50", currencyCode: "USD" } }); } finally { globalThis.fetch = oldFetch; }
  const secret = "ab".repeat(32); const rawBody = '{"eventType":"net.authorize.payment.authcapture.created","payload":{"authAmount":12.5}}'; process.env.AUTHORIZENET_SIGNATURE_KEY = secret;
  const signature = `sha512=${createHmac("sha512", Buffer.from(secret, "hex")).update(rawBody).digest("hex")}`;
  assert.equal((await handleWebhookFunction({ rawBody, headers: { "x-anet-signature": signature } })).isValid, true);
  await assert.rejects(handleWebhookFunction({ rawBody, headers: { "x-anet-signature": "sha512=bad" } }), /signature/);
});
test("authorization request contains opaque data and idempotent reference", async () => {
  process.env.AUTHORIZENET_API_LOGIN_ID = "login"; process.env.AUTHORIZENET_TRANSACTION_KEY = "secret";
  const oldFetch = globalThis.fetch; globalThis.fetch = (async (_url: any, init: any) => { const body = JSON.parse(init.body); assert.equal(body.createTransactionRequest.transactionRequest.payment.opaqueData.dataValue, "opaque"); assert.equal(body.createTransactionRequest.transactionRequest.transactionType, "authOnlyTransaction"); return new Response('{"messages":{"resultCode":"Ok"},"transactionResponse":{"responseCode":"1","transId":"123456"}}'); }) as typeof fetch;
  try { assert.deepEqual(await createPaymentFunction({ amount: 1250, currency: "USD", opaqueData: { dataDescriptor: "COMMON.ACCEPT.INAPP.PAYMENT", dataValue: "opaque" }, idempotencyKey: "idem" }), { status: "authorized", paymentIntentId: "123456", amount: 1250, currency: "USD", data: { responseCode: "1", transId: "123456" } }); } finally { globalThis.fetch = oldFetch; }
});
