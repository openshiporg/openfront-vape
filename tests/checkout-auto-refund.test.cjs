// Review r2 (2026-11-08): the automatic refund after a failed checkout. Drives the real completeActiveCart and
// initiatePaymentSession against an in-memory store and a fake Stripe with Stripe's semantics: a refunded intent
// still reports "succeeded", and create is idempotent by key. Offline.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const nodeCrypto = require('node:crypto');
const ts = require('typescript');
const { GraphQLError } = require('graphql');
const root = path.resolve(__dirname, '..');

function load(file, mocks) {
  const filename = path.join(root, file);
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  vm.runInNewContext(out, {
    module: m, exports: m.exports, process: { env: {} }, Date, Number, String, Set, Map, Object, Array, Boolean, JSON, Promise, Error, Math, RegExp, Buffer, setTimeout,
    console: { error() {}, warn() {}, log() {} },
    require: (s) => { if (s in mocks) return mocks[s]; throw new Error(`Unmocked ${s} in ${file}`); },
  }, { filename });
  return m.exports;
}

const shopperError = (message, code) => new GraphQLError(message, { extensions: { code } });
const codeOf = (e) => e?.extensions?.code;
const cryptoMock = { __esModule: true, default: nodeCrypto, randomUUID: nodeCrypto.randomUUID };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** One store: carts, payment collections and sessions, attempts, orders, payments; plus a fake Stripe. */
function world({ commitDelayMs = 0 } = {}) {
  let n = 0; const id = (p) => `${p}${++n}`;
  const S = { carts: new Map(), collections: new Map(), sessions: new Map(), keys: [], orders: [], payments: [], intents: new Map(), createKeys: new Map(), refundKeys: new Map(), ageOk: true };
  const provider = { id: 'prov_stripe', code: 'pp_stripe_stripe', isInstalled: true };

  // ---- fake Stripe ----
  const stripe = {
    create({ amount, idempotencyKey }) {
      if (idempotencyKey && S.createKeys.has(idempotencyKey)) return S.intents.get(S.createKeys.get(idempotencyKey));
      const intent = { id: `pi_${nodeCrypto.randomBytes(6).toString('hex')}`, status: 'requires_payment_method', amount, amountRefunded: 0, refunds: [] };
      S.intents.set(intent.id, intent);
      if (idempotencyKey) S.createKeys.set(idempotencyKey, intent.id);
      return intent;
    },
    confirm(intentId) { S.intents.get(intentId).status = 'succeeded'; },
  };
  const adapter = {
    createPayment: async ({ amount, idempotencyKey }) => { const i = stripe.create({ amount, idempotencyKey }); return { clientSecret: `${i.id}_secret_x`, paymentIntentId: i.id }; },
    getPaymentStatus: async ({ paymentId }) => { const i = S.intents.get(paymentId); return { status: i.status, amount: i.amount, amountRefunded: i.amountRefunded, refunds: i.refunds, currency: 'usd' }; },
    capturePayment: async () => { throw new Error('not used'); },
    refundPayment: async ({ paymentId, amount, idempotencyKey }) => {
      if (S.refundKeys.has(idempotencyKey)) return S.refundKeys.get(idempotencyKey);
      const i = S.intents.get(paymentId);
      if (i.amountRefunded + amount > i.amount) throw new Error('Payment adapter refundPaymentFunction failed');
      i.amountRefunded += amount; const r = { status: 'succeeded', amount, data: { id: `re_${i.refunds.length + 1}` } }; i.refunds.push(r);
      S.refundKeys.set(idempotencyKey, r); return r;
    },
  };

  // ---- in-memory prisma ----
  const matchLock = (row, where) => {
    if (where.id && row.id !== where.id) return false;
    if (where.recoveryPoint?.not && row.recoveryPoint === where.recoveryPoint.not) return false;
    if (where.OR) return where.OR.some((c) => (c.lockedAt === null ? !row.lockedAt : row.lockedAt && row.lockedAt < c.lockedAt.lt));
    return true;
  };
  const prisma = {
    $queryRaw: async () => [],
    $transaction: async (fn) => fn(prisma),
    idempotencyKey: {
      findUnique: async ({ where }) => S.keys.find((r) => (where.idempotencyKey ? r.idempotencyKey === where.idempotencyKey : r.id === where.id)) ?? null,
      create: async ({ data }) => {
        if (S.keys.some((r) => r.idempotencyKey === data.idempotencyKey)) throw Object.assign(new Error('unique'), { code: 'P2002' });
        const row = { id: id('k'), responseBody: null, responseCode: null, lockedAt: null, ...data }; S.keys.push(row); return row;
      },
      update: async ({ where, data }) => Object.assign(S.keys.find((r) => r.id === where.id), data),
      updateMany: async ({ where, data }) => { const row = S.keys.find((r) => matchLock(r, where)); if (!row) return { count: 0 }; Object.assign(row, data); return { count: 1 }; },
    },
    cart: {
      findUnique: async ({ where }) => S.carts.get(where.id) ?? null,
      update: async ({ where, data }) => Object.assign(S.carts.get(where.id), data),
    },
    paymentSession: {
      findFirst: async ({ where }) => {
        const s = S.sessions.get(where.id);
        return s && s.paymentCollectionId === where.paymentCollectionId ? { ...s, paymentProvider: provider } : null;
      },
      updateMany: async ({ where, data }) => { for (const s of S.sessions.values()) if (s.paymentCollectionId === where.paymentCollectionId) Object.assign(s, data); },
      update: async ({ where, data }) => Object.assign(S.sessions.get(where.id), data),
      create: async ({ data }) => { const s = { id: id('ps'), isSelected: false, isInitiated: false, ...data }; S.sessions.set(s.id, s); return s; },
    },
    paymentCollection: { update: async ({ where, data }) => Object.assign(S.collections.get(where.id), data) },
    payment: {
      findFirst: async ({ where }) => S.payments.find((p) => where.data
        ? p.data.paymentIntentId === where.data.equals && p.status === where.status
        : p.orderId === where.orderId && p.paymentCollectionId === where.paymentCollectionId) ?? null,
      create: async ({ data }) => {
        // DB invariants from 20261108200000: one Payment per intent; never captured on an auto-refunded intent.
        if (S.payments.some((p) => p.data.paymentIntentId === data.data.paymentIntentId)) throw new Error('Payment_paymentIntentId_key');
        if (S.keys.some((k) => k.idempotencyKey === `auto-refund:${data.data.paymentIntentId}`)) throw new Error('refunded automatically');
        const p = { id: id('pay'), ...data }; S.payments.push(p); return p;
      },
    },
    capture: { create: async () => ({}) },
    orderEvent: { create: async () => ({}) },
  };

  const sessionView = (s) => ({ ...s, paymentProvider: { ...provider, capturePaymentFunction: 'stripe', refundPaymentFunction: 'stripe', getPaymentStatusFunction: 'stripe' } });
  const orderView = (o) => o && { ...o, payments: S.payments.filter((p) => p.orderId === o.id).map((p) => ({ id: p.id, data: p.data })), account: null, shippingAddress: { country: { iso2: 'us' } } };
  const cartView = (c) => {
    const coll = c.paymentCollectionId && S.collections.get(c.paymentCollectionId);
    return {
      id: c.id, email: 'nadia.castellano@gmail.com', createdAt: new Date().toISOString(), rawTotal: c.rawTotal, metadata: {},
      order: orderView(S.orders.find((o) => o.id === c.orderId)), user: null,
      shippingAddress: { id: 'addr1', country: { iso2: 'us' } }, billingAddress: { id: 'addr1' },
      region: { id: 'reg', taxRate: 0, paymentProviders: [{ id: provider.id }], currency: { code: 'usd', id: 'cur', noDivisionCurrency: false } },
      discounts: [], giftCards: [], shippingMethods: [], lineItems: [],
      paymentCollection: coll ? { id: coll.id, amount: coll.amount, paymentSessions: [...S.sessions.values()].filter((s) => s.paymentCollectionId === coll.id).map(sessionView) } : null,
    };
  };
  const sudo = {
    prisma,
    sudo: () => sudo,
    query: {
      Cart: { findOne: async ({ where }) => (S.carts.has(where.id) ? cartView(S.carts.get(where.id)) : null) },
      Order: { findOne: async ({ where }) => orderView(S.orders.find((o) => o.id === where.id)) },
      PaymentProvider: { findOne: async () => ({ ...provider, createPaymentFunction: 'stripe' }) },
      PaymentCollection: { createOne: async ({ data }) => { const c = { id: id('pc'), amount: data.amount }; S.collections.set(c.id, c); S.carts.get(data.cart.connect.id).paymentCollectionId = c.id; return { id: c.id }; } },
    },
  };

  // ---- access and the cart fence ----
  const cartNotFound = () => new GraphQLError('Cart not found', { extensions: { code: 'CART_NOT_FOUND' } });
  const assertCartAccess = async (context) => { if (!context.session?.ownsCart) throw cartNotFound(); };
  const locks = new Map();
  async function withCartFence(context, cartId, _mode, run) {
    await assertCartAccess(context, cartId);
    const prev = locks.get(cartId) || Promise.resolve(); let release; const mine = new Promise((r) => (release = r));
    locks.set(cartId, prev.then(() => mine));
    await prev;
    try { await assertCartAccess(context, cartId); return await run({ sudo: () => sudo }); } finally { release(); }
  }
  const cartAccess = {
    cartNotFound, assertCartAccess,
    assertPaymentSessionBelongsToCart: async (context, cartId, sessionId) => {
      await assertCartAccess(context, cartId);
      const s = S.sessions.get(sessionId);
      if (!s || s.paymentCollectionId !== S.carts.get(cartId).paymentCollectionId) throw shopperError('Payment session not found', 'PAYMENT_SESSION_NOT_FOUND');
    },
  };

  const shared = {
    '../lib/shopperError': { shopperError },
    '../utils/paymentProviderAdapter': adapter,
    '../checkout/cart-amount-due': { applyGiftCardsToCart: (cart) => { cart.grossTotal = cart.rawTotal; cart.giftCardAllocation = { gross: cart.rawTotal, applied: [], due: cart.rawTotal }; } },
    '../regulated/enforcement': {
      requireAllowedCartCompliance: async () => { if (!S.ageOk) throw shopperError('Regulated commerce denied: CURRENT_IDENTITY_AND_ADDRESS_EVIDENCE_REQUIRED', 'REGULATED_COMMERCE_DENIED'); return { regulated: false }; },
      regulatedTaxAmountForCart: async () => 0,
    },
    '../regulated/pickup': { cartIsPickup: () => false },
    '../security/cart-access': cartAccess,
  };
  const paymentKeys = load('features/keystone/checkout/payment-keys.ts', {});
  const idempotency = load('features/keystone/utils/idempotency.ts', { 'node:crypto': cryptoMock });
  const recovery = load('features/keystone/checkout/recovery.ts', { '../utils/idempotency': idempotency, ...shared });
  const complete = load('features/keystone/mutations/completeActiveCart.ts', {
    ...shared,
    'node:crypto': cryptoMock,
    '../checkout/payment-keys': paymentKeys,
    '../checkout/recovery': recovery,
    '../checkout/gift-card-tender': { findGiftCardHold: async () => null, holdGiftCards: async () => {}, commitGiftCardHold: async () => {}, releaseGiftCardHold: async () => {} },
    '../checkout/order-commit': {
      resolveOrderCustomer: () => ({ userId: null }),
      createOrderFromCartAtomically: async (cart) => {
        await sleep(commitDelayMs);
        const row = S.carts.get(cart.id);
        if (row.orderId) return S.orders.find((o) => o.id === row.orderId);
        const order = { id: id('ord'), status: 'pending', displayId: 1793953800 + S.orders.length, secretKey: 's' };
        S.orders.push(order); row.orderId = order.id; return order;
      },
    },
    '../security/commerce-fence': { withCartFence },
    '../regulated/cart-fingerprint': { cartEvidenceFingerprint: async () => 'fp' },
    '../../regulated-commerce/core/release-gate': { assertCommerceReleaseEnabled: async () => {} },
    '../../regulated-commerce/core/decision-engine': { evidenceDigest: () => 'd' },
    '../../webhooks/outbox': { enqueueWebhookOutbox: async () => [], subscribedWebhookEndpointIds: async () => [] },
  });
  const initiate = load('features/keystone/mutations/initiatePaymentSession.ts', {
    ...shared,
    '../checkout/payment-keys': paymentKeys,
    '../utils/paymentProviderConfig': { isPaymentProviderConfigured: () => true },
  });

  const owner = { session: { ownsCart: true }, sudo: () => sudo };
  const stranger = { session: null, sudo: () => sudo };
  const newCart = (rawTotal = 2695) => { const c = { id: id('cart'), rawTotal, orderId: null, paymentCollectionId: null }; S.carts.set(c.id, c); return c.id; };
  const startPay = async (cartId) => { const s = await initiate.default(null, { cartId, paymentProviderId: 'pp_stripe_stripe' }, owner); return { sessionId: s.id, intentId: s.data.paymentIntentId }; };
  const run = (ctx, cartId, paymentSessionId) => complete.default(null, { cartId, paymentSessionId }, ctx).then((order) => ({ order }), (error) => ({ error }));
  return { S, stripe, owner, stranger, newCart, startPay, run, complete };
}

const heldOrders = (S) => S.orders.filter((o) => S.payments.some((p) => p.orderId === o.id && p.status === 'captured' && S.intents.get(p.data.paymentIntentId).amountRefunded === 0));

test('R2: a stranger completes in parallel with the shopper: no refund, exactly one order backed by held money', async () => {
  const w = world({ commitDelayMs: 25 });
  const cartId = w.newCart();
  const { sessionId, intentId } = await w.startPay(cartId);
  w.stripe.confirm(intentId);
  const [shopper, stranger] = await Promise.all([w.run(w.owner, cartId, sessionId), sleep(5).then(() => w.run(w.stranger, cartId, sessionId))]);
  assert.equal(codeOf(stranger.error), 'CART_NOT_FOUND');
  assert.ok(shopper.order, shopper.error?.message);
  assert.equal(w.S.intents.get(intentId).amountRefunded, 0, 'the stranger must never refund the shopper');
  assert.equal(w.S.orders.length, 1);
  assert.equal(heldOrders(w.S).length, 1);
  assert.equal(w.S.payments[0].data.paymentIntentId, intentId);
});

test("R2b: the shopper's own double submit refunds nothing while the first call is turning the charge into an order", async () => {
  const w = world({ commitDelayMs: 25 });
  const cartId = w.newCart();
  const { sessionId, intentId } = await w.startPay(cartId);
  w.stripe.confirm(intentId);
  const results = await Promise.all([w.run(w.owner, cartId, sessionId), sleep(5).then(() => w.run(w.owner, cartId, sessionId))]);
  assert.equal(results.filter((r) => r.order).length, 1);
  assert.equal(codeOf(results.find((r) => r.error).error), 'CHECKOUT_IN_PROGRESS');
  assert.equal(w.S.intents.get(intentId).amountRefunded, 0);
  assert.equal(heldOrders(w.S).length, 1);
});

test("R3: a stranger alone can't refund the shopper's charge; the shopper then places the order", async () => {
  const w = world();
  const cartId = w.newCart();
  const { sessionId, intentId } = await w.startPay(cartId);
  w.stripe.confirm(intentId);
  const stranger = await w.run(w.stranger, cartId, sessionId);
  assert.equal(codeOf(stranger.error), 'CART_NOT_FOUND');
  assert.equal(w.S.intents.get(intentId).amountRefunded, 0);
  const shopper = await w.run(w.owner, cartId, sessionId);
  assert.ok(shopper.order, shopper.error?.message);
  assert.equal(heldOrders(w.S).length, 1);
});

test('R1: compliance fails after the charge, the shopper fixes it and retries: the charge is refunded, a fresh intent is created, the order is captured', async () => {
  const w = world();
  const cartId = w.newCart();
  const first = await w.startPay(cartId);
  w.stripe.confirm(first.intentId);
  w.S.ageOk = false;
  const failed = await w.run(w.owner, cartId, first.sessionId);
  assert.equal(codeOf(failed.error), 'REGULATED_COMMERCE_DENIED');
  assert.equal(w.S.intents.get(first.intentId).amountRefunded, 2695, 'no order, so the charge goes back');
  assert.equal(w.S.orders.length, 0);
  assert.ok(w.S.keys.some((k) => k.idempotencyKey === `auto-refund:${first.intentId}`), 'the refunded intent is on the ledger');
  assert.equal(w.S.carts.get(cartId).paymentCollectionId, null, 'the spent collection is detached');

  // The old session can no longer complete anything.
  assert.equal(codeOf((await w.run(w.owner, cartId, first.sessionId)).error), 'PAYMENT_SESSION_NOT_FOUND');

  w.S.ageOk = true;
  const second = await w.startPay(cartId);
  assert.notEqual(second.intentId, first.intentId, 'a retry after a refund gets a new intent');
  // Placing the order without paying the new intent is refused and refunds nothing.
  const unpaid = await w.run(w.owner, cartId, second.sessionId);
  assert.equal(codeOf(unpaid.error), 'PAYMENT_DECLINED');
  assert.equal(w.S.orders.length, 0);

  w.stripe.confirm(second.intentId);
  const placed = await w.run(w.owner, cartId, second.sessionId);
  assert.ok(placed.order, placed.error?.message);
  assert.equal(w.S.orders.length, 1);
  assert.equal(w.S.payments.length, 1);
  assert.equal(w.S.payments[0].data.paymentIntentId, second.intentId);
  assert.equal(w.S.intents.get(second.intentId).amountRefunded, 0);
  assert.equal(heldOrders(w.S).length, 1);
});

test('an order is never settled against an intent with amount_refunded > 0', async () => {
  const w = world();
  const cartId = w.newCart();
  const { sessionId, intentId } = await w.startPay(cartId);
  w.stripe.confirm(intentId);
  // Refunded outside the checkout (processor dashboard): the intent still reports "succeeded".
  const intent = w.S.intents.get(intentId); intent.amountRefunded = 500;
  const result = await w.run(w.owner, cartId, sessionId);
  assert.equal(codeOf(result.error), 'PAYMENT_REFUNDED');
  assert.equal(w.S.orders.length, 0);
  assert.equal(w.S.payments.length, 0);
  assert.equal(intent.amountRefunded, 2695, 'the rest of the charge goes back too, since no order stands on it');
});

test('a recovered capture whose money was refunded meanwhile is not turned into an order', async () => {
  const w = world();
  const cartId = w.newCart();
  const { sessionId, intentId } = await w.startPay(cartId);
  w.stripe.confirm(intentId);
  // A late webhook recorded the capture as recoverable, and the money was later refunded at the processor.
  w.S.keys.push({ id: 'kw', idempotencyKey: `checkout:${cartId}`, requestMethod: 'POST', requestPath: 'completeActiveCart', requestParams: null, recoveryPoint: 'payment_confirmed', responseBody: { paymentResult: { status: 'succeeded', paymentIntentId: intentId, amount: 2695, currency: 'USD' } }, lockedAt: null });
  w.S.intents.get(intentId).amountRefunded = 2695;
  const result = await w.run(w.owner, cartId, sessionId);
  assert.ok(result.error);
  assert.equal(w.S.orders.length, 0);
});

test('refundClaimable: only an idle attempt with nothing captured may be refunded', () => {
  const w = world();
  const { refundClaimable, chargeIsHeld } = w.complete;
  assert.equal(refundClaimable(null), true);
  assert.equal(refundClaimable({ recoveryPoint: 'started', lockedAt: null }), true);
  assert.equal(refundClaimable({ recoveryPoint: 'started', lockedAt: new Date() }), false, 'in flight');
  for (const point of ['stock_reserved', 'resources_reserved', 'payment_unknown', 'payment_confirmed', 'order_created', 'completed']) {
    assert.equal(refundClaimable({ recoveryPoint: point, lockedAt: null }), false, point);
  }
  assert.equal(chargeIsHeld({ status: 'succeeded', amountRefunded: 0 }), true);
  assert.equal(chargeIsHeld({ status: 'succeeded', amountRefunded: 1 }), false);
  assert.equal(chargeIsHeld({ status: 'requires_payment_method' }), false);
});

test('the provider create key is unique per payment collection, and per spent intent', () => {
  const { paymentCreateKey } = load('features/keystone/checkout/payment-keys.ts', {});
  const base = { providerCode: 'pp_stripe_stripe', amount: 2695, currency: 'USD' };
  assert.notEqual(paymentCreateKey({ ...base, paymentCollectionId: 'pc1' }), paymentCreateKey({ ...base, paymentCollectionId: 'pc2' }));
  assert.notEqual(paymentCreateKey({ ...base, paymentCollectionId: 'pc1' }), paymentCreateKey({ ...base, paymentCollectionId: 'pc1', spentPaymentId: 'pi_1' }));
  assert.equal(paymentCreateKey({ ...base, paymentCollectionId: 'pc1' }), 'payment:pc1:pp_stripe_stripe:2695:usd');
});

test('reconcile plan: stuck refund attempts are matched first, the rest becomes one recorded refund', () => {
  const { planProviderRefundReconcile } = load('features/keystone/checkout/provider-refund-reconcile.ts', {
    '../utils/paymentProviderAdapter': {}, './gift-card-tender': { GIFT_CARD_TENDER: 'gift_card' },
  });
  // Orders 1737/1738: a stuck 2695 attempt (amount reserved, Stripe refused because it was already refunded).
  assert.deepEqual(JSON.parse(JSON.stringify(planProviderRefundReconcile({ amount: 2695, amountRefunded: 2695, recorded: 0, providerRefunded: 2695, stuck: [{ id: 'k1', idempotencyKey: 'refund:a', amount: 2695 }] }))),
    { attempts: [{ id: 'k1', idempotencyKey: 'refund:a', amount: 2695 }], extra: 0, reserveExtra: 0 });
  // Refunded at the processor with nothing recorded: one refund row, and amountRefunded catches up.
  assert.deepEqual(JSON.parse(JSON.stringify(planProviderRefundReconcile({ amount: 2695, amountRefunded: 0, recorded: 0, providerRefunded: 2695, stuck: [] }))), { attempts: [], extra: 2695, reserveExtra: 2695 });
  // Already recorded: nothing to do.
  assert.deepEqual(JSON.parse(JSON.stringify(planProviderRefundReconcile({ amount: 2695, amountRefunded: 1000, recorded: 1000, providerRefunded: 1000, stuck: [] }))), { attempts: [], extra: 0, reserveExtra: 0 });
  // A stuck attempt bigger than what the processor refunded is left alone.
  assert.deepEqual(JSON.parse(JSON.stringify(planProviderRefundReconcile({ amount: 2695, amountRefunded: 2695, recorded: 0, providerRefunded: 1000, stuck: [{ id: 'k1', idempotencyKey: 'refund:a', amount: 2695 }] }))), { attempts: [], extra: 1000, reserveExtra: 0 });
});
