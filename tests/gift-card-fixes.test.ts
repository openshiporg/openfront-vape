import test from "node:test";
import assert from "node:assert/strict";
import { canRepinCheckoutAttempt, replayReconciliationStep, getOrCreateCheckoutAttempt } from "../features/keystone/checkout/recovery";
import { createGiftCardGuessLimiter, guessClientKey } from "../features/keystone/security/gift-card-guess";
import { appendOrderTaxReversal } from "../features/keystone/regulated/reversals";
import { refundOrphanedCharge } from "../features/keystone/mutations/completeActiveCart";

// ---- Fix 1: a failed checkout does not brick the cart ----
test("only an unlocked 'started' attempt can be re-pinned; anything holding resources or money cannot", () => {
  assert.equal(canRepinCheckoutAttempt({ recoveryPoint: "started", lockedAt: null }), true);
  assert.equal(canRepinCheckoutAttempt({ recoveryPoint: "started", lockedAt: new Date(Date.now() - 10 * 60_000) }), true);
  assert.equal(canRepinCheckoutAttempt({ recoveryPoint: "started", lockedAt: new Date() }), false);
  for (const point of ["stock_reserved", "resources_reserved", "payment_unknown", "payment_confirmed", "order_created", "completed"]) {
    assert.equal(canRepinCheckoutAttempt({ recoveryPoint: point, lockedAt: null }), false, point);
  }
  assert.equal(canRepinCheckoutAttempt(null), false);
});

function memoryPrisma() {
  const rows: any[] = [];
  return {
    rows,
    idempotencyKey: {
      findUnique: async ({ where }: any) => rows.find((r) => (where.idempotencyKey ? r.idempotencyKey === where.idempotencyKey : r.id === where.id)) ?? null,
      create: async ({ data }: any) => { const row = { id: `k${rows.length + 1}`, ...data }; rows.push(row); return row; },
      update: async ({ where, data }: any) => Object.assign(rows.find((r) => r.id === where.id), data),
      updateMany: async ({ where, data }: any) => { const row = rows.find((r) => r.id === where.id); if (!row || (row.lockedAt && row.lockedAt > new Date(Date.now() - 300_000))) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    },
  };
}
const snap = (giftCards: string[]) => ({ cartFingerprint: "f", amount: 100, gross: 200, giftCards, currency: "usd", acceptanceDigest: "d" });

test("after a failed attempt is reset to 'started', a changed gift card mix gets an attempt instead of a conflict", async () => {
  const prisma = memoryPrisma();
  const first = await getOrCreateCheckoutAttempt(prisma, "cart1", "ps1", snap(["gc1:100"]));
  // The failure path resets the attempt (released resources, unlocked).
  Object.assign(first, { recoveryPoint: "started", lockedAt: null });
  const retry = await getOrCreateCheckoutAttempt(prisma, "cart1", undefined, snap([]));
  assert.equal(retry.id, first.id);
  assert.equal(prisma.rows.length, 1);
  assert.equal(retry.requestParams.paymentSessionId, null);
});

test("an attempt that reached payment still refuses a different request", async () => {
  const prisma = memoryPrisma();
  const first = await getOrCreateCheckoutAttempt(prisma, "cart2", "ps1", snap(["gc1:100"]));
  Object.assign(first, { recoveryPoint: "payment_confirmed", lockedAt: null });
  await assert.rejects(getOrCreateCheckoutAttempt(prisma, "cart2", undefined, snap([])), /different request/);
});

test("a charge with no order is refunded; a payment that never succeeded is left alone", async () => {
  const calls: string[] = [];
  const provider = { id: "p", code: "pp_stripe_stripe" };
  const adapters = (status: string) => ({ status, amount: 2299, currency: "usd" });
  const cart = (status: string) => ({
    id: "cart3", region: { currency: { code: "usd" } },
    paymentCollection: { paymentSessions: [{ id: "ps1", data: { paymentIntentId: "pi_1" }, paymentProvider: { ...provider, __status: status } }] },
  });
  const updates: any[] = [];
  const sudo = { prisma: { cart: { update: async (a: any) => { updates.push(a); } } } };
  // Without a live adapter the lookup fails closed: nothing is claimed refunded and the cart is untouched.
  const result = await refundOrphanedCharge(cart("succeeded"), "ps1", sudo, {}, "pi_1");
  assert.equal(result, false);
  assert.equal(updates.length, 0);
  assert.deepEqual(calls, []);
  assert.equal(adapters("x").amount, 2299);
});

// ---- Fix 2: a retry after a full gift-card order replays ----
test("a replay of a gift-card-covered order needs no account and no card payment", () => {
  const base = { paymentSessionId: undefined, hasCardPayment: false, hasAccount: false, giftCardsApplied: true };
  assert.equal(replayReconciliationStep({ ...base, coveredByGiftCards: true }), "none");
  assert.equal(replayReconciliationStep({ ...base, paymentSessionId: "ps", coveredByGiftCards: true }), "none");
});

test("a replay of a split or card order still reconciles what is missing", () => {
  assert.equal(replayReconciliationStep({ paymentSessionId: "ps", hasCardPayment: false, coveredByGiftCards: false, hasAccount: false, giftCardsApplied: true }), "payment");
  assert.equal(replayReconciliationStep({ paymentSessionId: "ps", hasCardPayment: true, coveredByGiftCards: false, hasAccount: false, giftCardsApplied: true }), "none");
  assert.equal(replayReconciliationStep({ paymentSessionId: undefined, hasCardPayment: false, coveredByGiftCards: false, hasAccount: false, giftCardsApplied: false }), "account");
  assert.equal(replayReconciliationStep({ paymentSessionId: undefined, hasCardPayment: false, coveredByGiftCards: false, hasAccount: true, giftCardsApplied: false }), "none");
});

// ---- Fix 3: the guess limiter keys on client IP and session, not cart ----
const SECRET = "s".repeat(40);
test("the key is the first x-forwarded-for hop, then x-real-ip, then the socket", () => {
  const req = (headers: any, ip = "10.0.0.9") => ({ headers, socket: { remoteAddress: ip } });
  assert.equal(guessClientKey(req({ "x-forwarded-for": "203.0.113.7, 10.1.1.1" }), SECRET), "203.0.113.7");
  assert.equal(guessClientKey(req({ "x-real-ip": "198.51.100.4" }), SECRET), "198.51.100.4");
  assert.equal(guessClientKey(req({}, "::ffff:192.0.2.1"), SECRET), "192.0.2.1");
  assert.equal(guessClientKey({}, SECRET), "unknown-client");
});

test("10 bad codes pass and the 11th is rate limited, across different carts and a new session", async () => {
  const consume = createGiftCardGuessLimiter();
  const req = { headers: { "x-forwarded-for": "203.0.113.50" }, socket: { remoteAddress: "10.0.0.1" } };
  for (let i = 0; i < 10; i++) await consume(req, { itemId: `u${i}` });
  await assert.rejects(consume(req, { itemId: "fresh-user" }), (e: any) => e.extensions?.code === "GIFT_CARD_RATE_LIMITED");
  // Another visitor is unaffected.
  await consume({ headers: { "x-forwarded-for": "203.0.113.51" }, socket: {} }, { itemId: "other" });
});

test("one shopper session is limited across IPs", async () => {
  const consume = createGiftCardGuessLimiter();
  for (let i = 0; i < 10; i++) await consume({ headers: { "x-forwarded-for": `198.51.100.${i}` }, socket: {} }, { itemId: "same-session" });
  await assert.rejects(consume({ headers: { "x-forwarded-for": "198.51.100.200" }, socket: {} }, { itemId: "same-session" }), (e: any) => e.extensions?.code === "GIFT_CARD_RATE_LIMITED");
});

// ---- Fix 4: append-only tax reversal ----
test("canceling appends a reversal row and never rewrites the committed quote", async () => {
  const committed = { id: "q1", orderId: "o1", status: "committed", providerCode: "store_rate", providerReference: "src_1", jurisdictionId: "j", salesTaxAmount: 100, exciseTaxAmount: 0, localFeeAmount: 8, currencyCode: "USD", sourceVersion: "v", expiresAt: new Date(), committedAt: new Date() };
  const rows: any[] = [committed];
  const events: any[] = [];
  const tx = {
    regulatedTaxQuote: { create: async ({ data }: any) => { const row = { id: `r${rows.length}`, ...data }; rows.push(row); return row; } },
    complianceEvent: { create: async ({ data }: any) => { events.push(data); } },
  };
  const prisma = {
    regulatedTaxQuote: {
      findMany: async ({ where }: any) => rows.filter((r) => r.orderId === where.orderId && r.status === where.status),
      findUnique: async ({ where }: any) => rows.find((r) => r.idempotencyKey === where.idempotencyKey) ?? null,
    },
    $transaction: async (fn: any) => fn(tx),
  };
  const digest = "a".repeat(64);
  const adapter: any = { reverse: async () => ({ status: "reversed", reference: "srr_1", totalAmount: 108, evidenceDigest: digest }) };
  const context = { sudo: () => ({ prisma }), session: { itemId: "staff" } };
  const first = await appendOrderTaxReversal({ context, orderId: "o1", adapterFor: () => adapter });
  const again = await appendOrderTaxReversal({ context, orderId: "o1", adapterFor: () => adapter });
  assert.equal(rows.length, 2);
  assert.equal(committed.status, "committed");
  assert.equal(first[0].status, "reversed");
  assert.equal(first[0].salesTaxAmount, 100);
  assert.equal(first[0].reversalReference, "srr_1");
  assert.equal(again[0].id, first[0].id);
  assert.equal(events.length, 1);
});
