// Shopper-facing cart/checkout validation becomes a GraphQLError (real message + stable code);
// internal errors stay plain Errors (masked by Yoga); "Cart not found" / CART_NOT_FOUND is unchanged. Offline.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { GraphQLError } = require('graphql');
const root = path.resolve(__dirname, '..');

function load(file, mocks = {}, extra = {}) {
  const filename = path.join(root, file);
  const out = ts.transpileModule(fs.readFileSync(filename, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const m = { exports: {} };
  vm.runInNewContext(out, { module: m, exports: m.exports, process: { env: {} }, Date, Number, String, Set, Object, Array, Boolean, JSON, Promise, Error, Math, RegExp, ...extra,
    require: (s) => { if (s in mocks) return mocks[s]; throw new Error(`Unmocked ${s}`); } }, { filename });
  return m.exports;
}
const { shopperError } = load('features/keystone/lib/shopperError.ts', { graphql: { GraphQLError } });
const codeOf = (e) => e?.extensions?.code;
const isShopper = (e) => e instanceof GraphQLError || (e && e.constructor && e.constructor.name === 'GraphQLError') || typeof codeOf(e) === 'string';

test('shopperError is a GraphQLError with the real message and a stable code', () => {
  const e = shopperError('Line item not found', 'LINE_ITEM_NOT_FOUND');
  assert.equal(e.message, 'Line item not found');
  assert.equal(codeOf(e), 'LINE_ITEM_NOT_FOUND');
  assert.ok(isShopper(e));
});

const { parseCartUpdate, cartQuantity } = load('features/keystone/security/cart-input.ts', { '../lib/shopperError': { shopperError } });
const rejects = (fn) => { try { fn(); } catch (e) { return e; } assert.fail('expected a throw'); };

test('invalid quantity -> INVALID_QUANTITY with the real message', () => {
  for (const bad of [0, -1, 1.5, '2', null, 2_000_000]) {
    const e = rejects(() => cartQuantity(bad));
    assert.equal(e.message, 'Quantity must be a positive supported integer');
    assert.equal(codeOf(e), 'INVALID_QUANTITY');
  }
});

test('cart update validation: bad email, empty update, duplicate line, server-owned field', () => {
  assert.equal(codeOf(rejects(() => parseCartUpdate({ email: 'nope' }))), 'INVALID_EMAIL');
  assert.equal(codeOf(rejects(() => parseCartUpdate({}))), 'EMPTY_CART_UPDATE');
  assert.equal(codeOf(rejects(() => parseCartUpdate({ lineItems: { disconnect: [{ id: 'a' }, { id: 'a' }] } }))), 'DUPLICATE_LINE_CHANGE');
  const e = rejects(() => parseCartUpdate({ total: 1 }));
  assert.equal(codeOf(e), 'INVALID_INPUT');
  assert.match(e.message, /server-owned or unsupported/);
});

// updateActiveCart: region locked / line item not found, driven through the real resolver.
function updateActiveCart({ cart, regionExists = true } = {}) {
  const calls = { };
  const mod = load('features/keystone/mutations/updateActiveCart.ts', {
    '../security/cart-access': { cartNotFound: () => new GraphQLError('Cart not found', { extensions: { code: 'CART_NOT_FOUND' } }), assertAddressAccess: async () => ({ id: 'a', country: { iso2: 'us' } }), withCartMutationLock: async (_c, _id, run) => run({ sudo: () => ({ query: { Cart: { findOne: async () => cart }, Region: { findOne: async () => (regionExists ? { id: 'r2', countries: [] } : null) }, ProductVariant: { findOne: async () => null } } }) }) },
    '../security/cart-input': { cartQuantity, parseCartUpdate },
    '../regulated/enforcement': { assertVariantPublicationEvidence: async () => {}, invalidateCartCompliance: async () => {} },
    '../security/shipping-eligibility': { shippingDestinationWithinRegion: () => true },
    '../lib/shopperError': { shopperError },
  });
  return mod.default;
}
const baseCart = { id: 'c1', region: { id: 'r1', countries: [] }, shippingAddress: null, lineItems: [] };

test('updateActiveCart: region change after items -> CART_REGION_LOCKED; unknown line -> LINE_ITEM_NOT_FOUND; unknown cart -> CART_NOT_FOUND', async () => {
  const withItems = updateActiveCart({ cart: { ...baseCart, lineItems: [{ id: 'l1', quantity: 1, productVariant: { id: 'v' } }] } });
  let e = await withItems(null, { cartId: 'c1', data: { region: { connect: { id: 'r2' } } } }, {}).catch((x) => x);
  assert.equal(e.message, 'Region cannot change after items are added; start a new cart');
  assert.equal(codeOf(e), 'CART_REGION_LOCKED');
  e = await withItems(null, { cartId: 'c1', data: { lineItems: { disconnect: [{ id: 'ghost' }] } } }, {}).catch((x) => x);
  assert.equal(e.message, 'Line item not found');
  assert.equal(codeOf(e), 'LINE_ITEM_NOT_FOUND');
  const noCart = updateActiveCart({ cart: null });
  e = await noCart(null, { cartId: 'zzz', data: { email: 'a@b.co' } }, {}).catch((x) => x);
  assert.equal(e.message, 'Cart not found');
  assert.equal(codeOf(e), 'CART_NOT_FOUND');
});

test("a foreign cart is still CART_NOT_FOUND (386f486's cartNotFound is untouched)", () => {
  const src = fs.readFileSync(path.join(root, 'features/keystone/security/cart-access.ts'), 'utf8');
  assert.match(src, /export function cartNotFound\(\) \{\s*return new GraphQLError\("Cart not found", \{ extensions: \{ code: "CART_NOT_FOUND" \} \}\);\s*\}/);
  assert.ok((src.match(/throw cartNotFound\(\)/g) || []).length >= 3, 'access refusals still use cartNotFound()');
});

test('INTERNAL errors are NOT converted: they stay plain Errors so Yoga masks them', () => {
  const read = (f) => fs.readFileSync(path.join(root, f), 'utf8');
  const stays = [
    ['features/keystone/mutations/completeActiveCart.ts', /throw new Error\('Checkout requires payment reconciliation'\)/],
    ['features/keystone/mutations/completeActiveCart.ts', /throw new Error\(`Payment failed: \$\{paymentResult\.error \|\| paymentResult\.status\}`\)/],
    ['features/keystone/mutations/completeActiveCart.ts', /throw new Error\('Provider payment amount does not match cart total'\)/],
    ['features/keystone/mutations/completeActiveCart.ts', /throw new Error\(`Payment session not found\. Looking for session ID: \$\{paymentSessionId\}`\)/],
    ['features/keystone/mutations/authorizeCardPaymentSession.ts', /throw new Error\("Authorize\.net authorization did not match the checkout amount and currency"\)/],
    ['features/keystone/checkout/order-commit.ts', /throw new Error\(`No valid price for variant \$\{line\.productVariant\.id\}`\)/],
    ['features/keystone/mutations/validateShippingAddress.ts', /throw new Error\(\s*"Access denied/],
    ['features/keystone/security/cart-command.ts', /throw new Error\("Cart could not be created"\)/],
  ];
  for (const [f, re] of stays) assert.match(read(f), re, `${f} keeps its plain Error`);
});

test('no converted message carries an id, email, secret or provider text', () => {
  const dir = path.join(root, 'features');
  const hits = [];
  const walk = (d) => {
    for (const n of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, n.name);
      if (n.isDirectory()) { if (!['node_modules', '.next'].includes(n.name)) walk(p); continue; }
      if (!/\.(ts|tsx)$/.test(n.name)) continue;
      for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
        if (!line.includes('shopperError(')) continue;
        const m = line.match(/shopperError\((`[^`]*`|"[^"]*"|'[^']*')/);
        if (m && /\$\{[^}]*(\bid\b|Id\b|\.id|email|secret|token|error|status|message)[^}]*\}/i.test(m[1])) hits.push(`${path.relative(root, p)}: ${m[1]}`);
      }
    }
  };
  walk(dir);
  assert.deepEqual(hits, []);
});
